# BlushTodo — AI-powered todo app

Soft pink **Next.js** frontend and **NestJS** backend with MongoDB, JWT auth, OpenAI helpers, and saved chat threads.

## Prerequisites

- Node.js 20+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- OpenAI API key (for AI generation, chat, suggestions)

## Quick start (local)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
npm install
npm run start:dev
```

API listens on **http://localhost:4000**. Swagger docs: **http://localhost:4000/docs**.

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Default API URL is http://localhost:4000
npm install
npm run dev
```

Open **http://localhost:3000**. Register, then use **Dashboard** (todos + AI sidebar) and **AI** (chat).

## Scripts

| Location   | Command        | Purpose              |
|-----------|----------------|----------------------|
| `backend` | `npm run build` | Production compile   |
| `backend` | `npm run start:dev` | Dev API + watch |
| `backend` | `npm test`      | Unit tests (auth)    |
| `backend` | `npm run test:e2e` | E2E (todos, in-memory Mongo) |
| `frontend`| `npm run build` | Production Next build |
| `frontend`| `npm run dev`   | Dev server (Turbopack) |

## Environment

**Backend (`.env`)**

- `PORT` — default `4000`
- `DATABASE_URL` — Mongo connection string
- `JWT_SECRET` — strong secret for signing JWTs
- `OPENAI_API_KEY` / `OPENAI_MODEL` — AI features
- `CORS_ORIGINS` — optional comma-separated front-end URLs

**Frontend (`.env.local`)**

- `NEXT_PUBLIC_API_URL` — backend base URL (no trailing slash)

## Docker

Build images from each service directory (set `NEXT_PUBLIC_API_URL` to your public API URL for the frontend image).

```bash
docker build -t blush-todo-api ./backend
docker build -t blush-todo-web --build-arg NEXT_PUBLIC_API_URL=https://api.example.com ./frontend
```

## Deployment notes

- **Frontend:** Vercel — set `NEXT_PUBLIC_API_URL` to the deployed API.
- **Backend:** Render / Railway — set env vars; ensure `CORS_ORIGINS` includes the front-end origin.
- **Database:** MongoDB Atlas — paste URI into `DATABASE_URL`.

## MongoDB Atlas: `querySrv ECONNREFUSED`

That error happens when Node **cannot resolve the DNS SRV record** used by `mongodb+srv://...` (before it even talks to MongoDB). It is usually **network or DNS**, not your password.

Try, in order:

1. **Atlas → Network Access** — allow your IP, or **`0.0.0.0/0`** for development only.
2. **Windows DNS** — set adapter DNS to **8.8.8.8** / **1.1.1.1**, flush DNS: `ipconfig /flushdns`.
3. **VPN / proxy / school–corp Wi‑Fi** — often block SRV or odd DNS; try another network or disable VPN.
4. **` mongodb+srv` vs standard URI** — in Atlas → Connect → Drivers, if you can copy a **non-SRV** `mongodb://host1:27017,...` string with replica set + TLS, use that as `DATABASE_URL` (bypasses SRV lookup).
5. The backend prefetches **`dns.setDefaultResultOrder('ipv4first')`** (see `src/dns-preflight.ts`) — rebuild/restart after pulling; it fixes some setups only.

For fully local dev without Atlas: run MongoDB locally and set  
`DATABASE_URL=mongodb://127.0.0.1:27017/ai-todo`.

## Project layout

- `backend/src` — Nest modules: `auth`, `users`, `todos`, `ai`, `chats`
- `frontend/src/app` — App Router: `/`, `/login`, `/register`, `/dashboard`, `/ai`
- `frontend/src/components` — UI: navbar, sidebar, todos, auth form, chat
