"use client";

import { useMemo, useState } from "react";

import {
  formatAttendees,
  formatEventWhen,
  LinkifiedText,
} from "@/lib/display";
import { formatWeekLabel, getWeekBounds } from "@/lib/week";
import { api } from "@/trpc/react";

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CalendarPanel() {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);

  const week = useMemo(() => getWeekBounds(weekOffset), [weekOffset]);
  const weekLabel = formatWeekLabel(week.start, week.end);

  const defaultStart = new Date();
  defaultStart.setMinutes(0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(defaultEnd.getHours() + 1);

  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState(toDatetimeLocalValue(defaultStart));
  const [end, setEnd] = useState(toDatetimeLocalValue(defaultEnd));
  const [attendees, setAttendees] = useState("");

  const utils = api.useUtils();

  const events = api.calendar.searchEvents.useQuery({
    query: activeSearch,
    weekStart: week.start.toISOString(),
    weekEnd: week.end.toISOString(),
    limit: 50,
    offset: 0,
  });

  const refreshEvents = api.calendar.refreshEvents.useMutation({
    onSuccess: async () => {
      await utils.calendar.searchEvents.invalidate();
    },
  });

  const createDraft = api.calendar.createDraft.useMutation({
    onSuccess: async () => {
      await utils.calendar.searchEvents.invalidate();
      resetForm();
    },
  });

  const sendInvite = api.calendar.sendInvite.useMutation({
    onSuccess: async () => {
      await utils.calendar.searchEvents.invalidate();
      resetForm();
    },
  });

  function resetForm() {
    setSummary("");
    setDescription("");
    setLocation("");
    setAttendees("");
  }

  function parseAttendees() {
    return attendees
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  }

  function toIso(datetimeLocal: string) {
    return new Date(datetimeLocal).toISOString();
  }

  const eventInput = {
    summary,
    description: description || undefined,
    location: location || undefined,
    start: toIso(start),
    end: toIso(end),
    attendees: parseAttendees(),
  };

  return (
    <div>
      <p>
        <button
          type="button"
          className="link"
          onClick={() =>
            refreshEvents.mutate({
              weekStart: week.start.toISOString(),
              weekEnd: week.end.toISOString(),
            })
          }
          disabled={refreshEvents.isPending}
        >
          {refreshEvents.isPending ? "refreshing…" : "refresh from calendar"}
        </button>
        {refreshEvents.data && (
          <span className="muted"> ({refreshEvents.data.synced} synced)</span>
        )}
      </p>

      <div className="week-nav">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          aria-label="Previous week"
        >
          ←
        </button>{" "}
        <strong>{weekLabel}</strong>
        {weekOffset !== 0 && (
          <>
            {" "}
            <button type="button" className="link" onClick={() => setWeekOffset(0)}>
              this week
            </button>
          </>
        )}
        {" "}
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          aria-label="Next week"
        >
          →
        </button>
      </div>

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
          placeholder="search events"
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

      {events.isLoading && <p className="muted">Loading…</p>}
      {events.error && <p className="error">{events.error.message}</p>}

      {events.data && (
        <>
          <h2>Events</h2>
          {events.data.length === 0 ? (
            <p className="muted">No events this week.</p>
          ) : (
            <ul>
              {events.data.map((event) => (
                <li key={event.id}>
                  {event.htmlLink ? (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {event.summary || "untitled"}
                    </a>
                  ) : (
                    <strong>{event.summary || "untitled"}</strong>
                  )}
                  {event.start && (
                    <p className="muted">
                      {formatEventWhen(event.start, event.end)}
                    </p>
                  )}
                  {event.location && (
                    <p className="muted">{event.location}</p>
                  )}
                  {event.description && (
                    <p>
                      <LinkifiedText text={event.description} />
                    </p>
                  )}
                  {event.attendees.length > 0 && (
                    <p className="muted">{formatAttendees(event.attendees)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <hr />

      <h2>Create event</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          title
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </label>
        <label>
          description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <label>
          start
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          end
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <label>
          attendees (comma-separated)
          <input
            type="text"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
        </label>
        <p>
          <button
            type="button"
            onClick={() => createDraft.mutate(eventInput)}
            disabled={createDraft.isPending || !summary || !start || !end}
          >
            {createDraft.isPending ? "saving…" : "save draft"}
          </button>{" "}
          <button
            type="button"
            onClick={() => sendInvite.mutate(eventInput)}
            disabled={
              sendInvite.isPending ||
              !summary ||
              !start ||
              !end ||
              parseAttendees().length === 0
            }
          >
            {sendInvite.isPending ? "sending…" : "send invite"}
          </button>
        </p>
        {(createDraft.error ?? sendInvite.error) && (
          <p className="error">
            {(createDraft.error ?? sendInvite.error)?.message}
          </p>
        )}
      </form>
    </div>
  );
}
