import type { ReactNode } from "react";

const URL_RE =
  /(https?:\/\/[^\s<]+[^\s<.,;:!?'")\]}>])/g;

export function parseEmailAddress(raw: string) {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1]!.replace(/^"|"$/g, "").trim(),
      email: match[2]!.trim(),
    };
  }
  if (trimmed.includes("@")) {
    return { name: "", email: trimmed };
  }
  return { name: trimmed, email: "" };
}

export function formatSender(raw: string): ReactNode {
  if (!raw) return "unknown";

  const parts = raw.split(",").map((part) => parseEmailAddress(part));
  return parts.map((part, i) => (
    <span key={`${part.email}-${i}`}>
      {i > 0 && ", "}
      {part.name && part.email ? (
        <>
          {part.name} (
          <a href={`mailto:${part.email}`}>{part.email}</a>)
        </>
      ) : part.email ? (
        <a href={`mailto:${part.email}`}>{part.email}</a>
      ) : (
        part.name
      )}
    </span>
  ));
}

function parseDate(value: string | null | Date) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const ms = Number(value);
  return Number.isFinite(ms) && ms > 0 ? new Date(ms) : new Date(value);
}

export function formatMessageDate(value: string | null | Date) {
  const date = parseDate(value);
  if (!date || Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  return `${date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })}, ${time}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatEventWhen(start: string, end: string) {
  if (!start) return "";

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  if (Number.isNaN(startDate.getTime())) return start;

  const datePart = startDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return `${datePart}, ${formatTime(startDate)}`;
  }

  const sameDay = startDate.toDateString() === endDate.toDateString();
  if (sameDay) {
    return `${datePart}, ${formatTime(startDate)} – ${formatTime(endDate)}`;
  }

  return `${startDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })} – ${endDate.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_RE);

  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function formatAttendees(attendees: string[]): ReactNode {
  if (attendees.length === 0) return null;
  return attendees.map((attendee, i) => {
    const { name, email } = parseEmailAddress(attendee);
    const label = email || name;
    return (
      <span key={`${label}-${i}`}>
        {i > 0 && ", "}
        {email ? <a href={`mailto:${email}`}>{name || email}</a> : name}
      </span>
    );
  });
}
