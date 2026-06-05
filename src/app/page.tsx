"use client";

import { useState } from "react";

import { CalendarPanel } from "@/app/_components/calendar-panel";
import { GmailPanel } from "@/app/_components/gmail-panel";

export default function Home() {
  const [tab, setTab] = useState<"gmail" | "calendar">("gmail");

  return (
    <main>
      <h1>Google Demo</h1>
      <p className="muted">Gmail and Calendar powered by Corsair</p>

      <p>
        {tab === "gmail" ? (
          <>
            <strong>Email</strong> ·{" "}
            <button type="button" className="link" onClick={() => setTab("calendar")}>
              Calendar
            </button>
          </>
        ) : (
          <>
            <button type="button" className="link" onClick={() => setTab("gmail")}>
              Email
            </button>
            {" · "}
            <strong>Calendar</strong>
          </>
        )}
      </p>

      <hr />

      {tab === "gmail" ? <GmailPanel /> : <CalendarPanel />}
    </main>
  );
}
