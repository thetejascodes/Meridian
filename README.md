# 🌟 Meridian

> Keyboard-first, AI-native Gmail & Google Calendar client built on Corsair. Your email and calendar, the way you actually work.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

---

## ✨ What is Meridian?

Most people spend more time *managing* their inbox than actually getting things done. Too many clicks. Too many tabs. Too much friction.

Meridian is a **Superhuman-style email and calendar client** powered by [Corsair](https://corsair.dev) integrations. It connects to Gmail and Google Calendar and gives you a faster, cleaner, keyboard-driven interface built around *your* workflow — not Google's.

Built for the **Corsair Hackathon**.

---

## 🚀 Features

### ✉️ Email
- Search, draft, send, and receive emails via Gmail API
- Cleaner UI with less clicks and less noise
- Smart priority filtering using LLM — high priority emails rise to the top automatically

### 📅 Calendar
- Send calendar invites and manage your schedule in seconds
- Real-time updates via Corsair webhooks — no polling

### 🤖 AI Agent Chat
- Powered by Corsair MCP
- Just type: *"Send a calendar invite to dev@corsair.dev at 9 AM Thursday and email him saying I look forward to our meeting"*
- It handles everything — no forms, no tabs, one message

### ⌨️ Keyboard First
- Common actions mapped to keystrokes
- Designed so you rarely need to touch the mouse

### ⚡ Real-time Inbox
- Corsair webhooks push new emails and calendar events instantly
- Zero polling, zero delay

### 🔍 Lightning Fast Search
- Vector database built into Postgres
- Search your entire email + calendar history in under 1 second locally — no Gmail API call needed

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Database | PostgreSQL + Drizzle ORM |
| Vector Search | pgvector (Postgres extension) |
| Integrations | Corsair (Gmail + Google Calendar) |
| AI Agent | Corsair MCP |
| Webhooks | Corsair Webhooks + Ngrok (local dev) |
| LLM Filtering | Claude / OpenAI (lightweight model) |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or via Docker
- Corsair account — [corsair.dev](https://corsair.dev)
- Ngrok (optional, for local webhook testing)

### Installation

```bash
git clone https://github.com/thetejascodes/Meridian.git
cd Meridian
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/meridian
CORSAIR_API_KEY=your_corsair_api_key
NGROK_URL=your_ngrok_url   # optional, for webhooks
```

### Database Setup

```bash
npm run db:generate
npm run db:migrate
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔗 Corsair Setup

Watch the setup videos in this order:

1. `corsair-setup`
2. `corsair-webhooks`
3. `corsair-calendar-webhooks`

📁 [Corsair Setup Videos — Google Drive](https://drive.google.com/drive/folders/1grUZ_nYtY-AwXk5iQlOoXAfYMtKDpW39?usp=sharing)

Original base repo: [corsairdev/google-demo](https://github.com/corsairdev/google-demo)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `C` | Compose new email |
| `R` | Reply |
| `E` | Archive |
| `/` | Search |
| `G I` | Go to Inbox |
| `G C` | Go to Calendar |

---

## 📁 Project Structure

```
meridian/
├── app/                  # Next.js App Router
│   ├── (email)/          # Email routes
│   ├── (calendar)/       # Calendar routes
│   └── api/              # API routes + webhooks
├── components/           # UI components
├── lib/
│   ├── corsair.ts        # Corsair client
│   ├── db/               # Drizzle schema + queries
│   └── ai/               # LLM filtering + MCP agent
└── drizzle/              # Migrations
```

---

## 🏆 Built For

**Corsair Hackathon** — Building the email and calendar client that works the way you do.

---

## 📄 License

MIT