"use client";

import { useState } from "react";

import {
  formatMessageDate,
  formatSender,
  LinkifiedText,
} from "@/lib/display";
import { api } from "@/trpc/react";

export function GmailPanel() {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [view, setView] = useState<"inbox" | "drafts">("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const utils = api.useUtils();

  const emails = api.gmail.searchEmails.useQuery(
    { query: activeSearch, limit: 50, offset: 0 },
    { enabled: view === "inbox" },
  );

  const selectedEmail = api.gmail.getMessage.useQuery(
    { id: selectedId! },
    { enabled: !!selectedId },
  );

  const drafts = api.gmail.listDrafts.useQuery(
    { limit: 50, offset: 0 },
    { enabled: view === "drafts" },
  );

  const refreshInbox = api.gmail.refreshInbox.useMutation({
    onSuccess: async () => {
      await utils.gmail.searchEmails.invalidate();
      await utils.gmail.listDrafts.invalidate();
    },
  });

  const createDraft = api.gmail.createDraft.useMutation({
    onSuccess: async () => {
      await utils.gmail.listDrafts.invalidate();
      setTo("");
      setSubject("");
      setBody("");
    },
  });

  const sendEmail = api.gmail.sendEmail.useMutation({
    onSuccess: async () => {
      await utils.gmail.searchEmails.invalidate();
      setTo("");
      setSubject("");
      setBody("");
    },
  });

  const sendDraft = api.gmail.sendDraft.useMutation({
    onSuccess: async () => {
      await utils.gmail.searchEmails.invalidate();
      await utils.gmail.listDrafts.invalidate();
    },
  });

  if (selectedId) {
    return (
      <div>
        <p>
          <button type="button" className="link" onClick={() => setSelectedId(null)}>
            ← back to inbox
          </button>
        </p>

        {selectedEmail.isLoading && <p className="muted">Loading…</p>}
        {selectedEmail.error && (
          <p className="error">{selectedEmail.error.message}</p>
        )}

        {selectedEmail.data && (
          <>
            <h2>{selectedEmail.data.subject || "(no subject)"}</h2>
            <p className="muted">
              {formatSender(selectedEmail.data.from)}
              {selectedEmail.data.date && (
                <> · {formatMessageDate(selectedEmail.data.date)}</>
              )}
            </p>
            {selectedEmail.data.to && (
              <p className="muted">To: {formatSender(selectedEmail.data.to)}</p>
            )}
            <hr />
            <div className="email-body">
              <LinkifiedText
                text={
                  selectedEmail.data.body ||
                  selectedEmail.data.snippet ||
                  "(empty)"
                }
              />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <p>
        {view === "inbox" ? (
          <strong>Inbox</strong>
        ) : (
          <button type="button" className="link" onClick={() => setView("inbox")}>
            Inbox
          </button>
        )}
        {" · "}
        {view === "drafts" ? (
          <strong>Drafts</strong>
        ) : (
          <button type="button" className="link" onClick={() => setView("drafts")}>
            Drafts
          </button>
        )}
        {" · "}
        <button
          type="button"
          className="link"
          onClick={() => refreshInbox.mutate()}
          disabled={refreshInbox.isPending}
        >
          {refreshInbox.isPending ? "refreshing…" : "refresh from gmail"}
        </button>
        {refreshInbox.data && (
          <span className="muted"> ({refreshInbox.data.synced} synced)</span>
        )}
      </p>

      {view === "inbox" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setActiveSearch(search);
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search"
          />
          <p>
            <button type="submit">search</button>{" "}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveSearch("");
              }}
            >
              clear
            </button>
          </p>
        </form>
      )}

      {view === "inbox" && emails.isLoading && <p className="muted">Loading…</p>}
      {view === "inbox" && emails.error && (
        <p className="error">{emails.error.message}</p>
      )}

      {view === "inbox" && emails.data && (
        <>
          <h2>Inbox</h2>
          {emails.data.length === 0 ? (
            <p className="muted">No emails. Try refreshing from Gmail.</p>
          ) : (
            <ul>
              {emails.data.map((email) => (
                <li key={email.id}>
                  <button
                    type="button"
                    className="link email-item"
                    onClick={() => setSelectedId(email.id)}
                  >
                    {email.subject || email.snippet || email.id}
                  </button>
                  {email.from && (
                    <span className="muted"> — {formatSender(email.from)}</span>
                  )}
                  {email.date && (
                    <span className="muted">
                      {" "}
                      · {formatMessageDate(email.date)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {view === "drafts" && drafts.isLoading && <p className="muted">Loading…</p>}
      {view === "drafts" && drafts.error && (
        <p className="error">{drafts.error.message}</p>
      )}

      {view === "drafts" && drafts.data && (
        <>
          <h2>Drafts</h2>
          {drafts.data.length === 0 ? (
            <p className="muted">No drafts.</p>
          ) : (
            <ul>
              {drafts.data.map((draft) => (
                <li key={draft.id}>
                  draft {draft.id}
                  {" · "}
                  <button
                    type="button"
                    className="link"
                    onClick={() => sendDraft.mutate({ draftId: draft.id })}
                    disabled={sendDraft.isPending}
                  >
                    send
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <hr />

      <h2>Compose</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          to
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label>
          subject
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>
        <label>
          message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
          />
        </label>
        <p>
          <button
            type="button"
            onClick={() => createDraft.mutate({ to, subject, body })}
            disabled={createDraft.isPending || !to || !subject || !body}
          >
            {createDraft.isPending ? "saving…" : "save draft"}
          </button>{" "}
          <button
            type="button"
            onClick={() => sendEmail.mutate({ to, subject, body })}
            disabled={sendEmail.isPending || !to || !subject || !body}
          >
            {sendEmail.isPending ? "sending…" : "send"}
          </button>
        </p>
        {(createDraft.error ?? sendEmail.error) && (
          <p className="error">
            {(createDraft.error ?? sendEmail.error)?.message}
          </p>
        )}
      </form>
    </div>
  );
}
