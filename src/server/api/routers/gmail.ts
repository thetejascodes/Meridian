import { z } from "zod";

import {
  encodeRawEmail,
  extractBodyFromPayload,
  getHeader,
} from "@/server/lib/email";
import { getTenant } from "@/server/lib/tenant";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

function messageTimestamp(
  internalDate?: string | null,
  createdAt?: Date | null,
): number {
  if (internalDate) return Number(internalDate);
  if (createdAt) return createdAt.getTime();
  return 0;
}

function mapMessage(message: {
  entity_id: string;
  data: {
    threadId?: string;
    snippet?: string;
    subject?: string;
    from?: string;
    to?: string;
    body?: string;
    internalDate?: string;
    createdAt?: Date | null;
  };
}) {
  return {
    id: message.entity_id,
    threadId: message.data.threadId ?? "",
    snippet: message.data.snippet ?? "",
    subject: message.data.subject ?? "",
    from: message.data.from ?? "",
    to: message.data.to ?? "",
    date: message.data.internalDate ?? null,
    timestamp: messageTimestamp(
      message.data.internalDate,
      message.data.createdAt,
    ),
  };
}

function sortMessagesNewestFirst<
  T extends { timestamp: number },
>(messages: T[]): T[] {
  return [...messages].sort((a, b) => b.timestamp - a.timestamp);
}

function dedupeByEntityId<
  T extends { entity_id: string; updated_at: Date },
>(items: T[]): T[] {
  const byEntityId = new Map<string, T>();
  for (const item of items) {
    const existing = byEntityId.get(item.entity_id);
    if (!existing || item.updated_at > existing.updated_at) {
      byEntityId.set(item.entity_id, item);
    }
  }
  return Array.from(byEntityId.values());
}

export const gmailRouter = createTRPCRouter({
  searchEmails: publicProcedure
    .input(
      paginationSchema.extend({
        query: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const tenant = getTenant();

      const messages = input.query.trim()
        ? await tenant.gmail.db.messages.search({
            data: {
              snippet: { contains: input.query },
            },
            limit: input.limit,
            offset: input.offset,
          })
        : await tenant.gmail.db.messages.list({
            limit: input.limit,
            offset: input.offset,
          });

      return sortMessagesNewestFirst(
        dedupeByEntityId(messages).map(mapMessage),
      );
    }),

  getMessage: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const tenant = getTenant();
      const cached = await tenant.gmail.db.messages.findByEntityId(input.id);

      if (cached?.data.body || cached?.data.subject) {
        return {
          id: cached.entity_id,
          threadId: cached.data.threadId ?? "",
          subject: cached.data.subject ?? "",
          from: cached.data.from ?? "",
          to: cached.data.to ?? "",
          body: cached.data.body ?? cached.data.snippet ?? "",
          snippet: cached.data.snippet ?? "",
          date: cached.data.internalDate ?? null,
        };
      }

      const message = await tenant.gmail.api.messages.get({
        id: input.id,
        format: "full",
      });

      const headers = message.payload?.headers;
      const body =
        extractBodyFromPayload(message.payload) ||
        message.snippet ||
        "";

      return {
        id: message.id ?? input.id,
        threadId: message.threadId ?? "",
        subject: getHeader(headers, "Subject"),
        from: getHeader(headers, "From"),
        to: getHeader(headers, "To"),
        body,
        snippet: message.snippet ?? "",
        date:
          message.internalDate != null ? String(message.internalDate) : null,
      };
    }),

  listDrafts: publicProcedure
    .input(paginationSchema)
    .query(async ({ input }) => {
      const tenant = getTenant();
      const drafts = await tenant.gmail.db.drafts.list({
        limit: input.limit,
        offset: input.offset,
      });

      return dedupeByEntityId(drafts).map((draft) => ({
        id: draft.entity_id,
        messageId: draft.data.messageId ?? "",
        createdAt: draft.data.createdAt ?? null,
      }));
    }),

  refreshInbox: publicProcedure.mutation(async () => {
    const tenant = getTenant();
    const result = await tenant.gmail.api.threads.list({ maxResults: 50 });
    return {
      synced: result.threads?.length ?? 0,
    };
  }),

  createDraft: publicProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const tenant = getTenant();
      const raw = encodeRawEmail(input);
      const draft = await tenant.gmail.api.drafts.create({
        draft: { message: { raw } },
      });
      return {
        id: draft.id ?? "",
        messageId: draft.message?.id ?? "",
      };
    }),

  sendDraft: publicProcedure
    .input(z.object({ draftId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const tenant = getTenant();
      const message = await tenant.gmail.api.drafts.send({ id: input.draftId });
      return {
        id: message.id ?? "",
        threadId: message.threadId ?? "",
      };
    }),

  sendEmail: publicProcedure
    .input(
      z.object({
        to: z.string().email(),
        subject: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const tenant = getTenant();
      const raw = encodeRawEmail(input);
      const message = await tenant.gmail.api.messages.send({ raw });
      return {
        id: message.id ?? "",
        threadId: message.threadId ?? "",
      };
    }),
});
