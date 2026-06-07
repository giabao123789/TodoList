# AI Todo Platform

A full-stack task management application with AI-assisted planning. Capture tasks, reorder by priority, and let GPT-4o-mini help generate task breakdowns, classify urgency, suggest deadlines, and assist via chat — all within a clean dashboard.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 15.5.14 |
| | React | 19.1.0 |
| | TypeScript | ^5 |
| | Tailwind CSS | ^4 |
| | Zustand (state) | 5.0.12 |
| | react-hook-form | 7.72.0 |
| | zod (validation) | 4.3.6 |
| | axios (HTTP) | 1.14.0 |
| | framer-motion (animations) | 12.38.0 |
| | @dnd-kit (drag-and-drop) | core 6.3.1 / sortable 10.0.0 |
| | lucide-react (icons) | 1.7.0 |
| **Backend** | NestJS | 10.x |
| | Node.js runtime | 20 (Alpine Docker) |
| | TypeScript | 5.9.3 |
| | Mongoose (ODM) | ^10.1.0 |
| | Passport.js + JWT | passport-jwt 4.x |
| | bcrypt (password hashing) | 6.x |
| | OpenAPI (Swagger) | @nestjs/swagger 7.4.2 |
| | class-validator / class-transformer | 0.14.x / 0.5.x |
| **Database** | MongoDB | (Mongoose ODM) |
| **Auth** | JWT (signed with HS256, 7-day expiry) | |
| **AI** | OpenAI SDK | 6.33.0 |
| **Deployment** | Docker (multi-stage), Render | |

---

## Features

- ✅ User registration & login (JWT)
- ✅ Create, read, update, delete todos
- ✅ Drag-and-drop reorder (via @dnd-kit)
- ✅ Priority labels (low / medium / high)
- ✅ Deadline assignment
- ✅ AI: break a goal into actionable tasks (`POST /ai/generate-todos`)
- ✅ AI: suggest next action (`POST /ai/suggest`)
- ✅ AI: classify priority (`POST /ai/priority`)
- ✅ AI: suggest deadline (`POST /ai/deadline`)
- ✅ AI chat assistant with conversation history (`POST /chats`)
- ✅ Swagger API docs at `/docs`
- ✅ Rate limiting (120 requests / 60s)
- ✅ Docker multi-stage builds (frontend + backend)
- ❌ Unit tests exist for auth service only (1 spec file found)
- ❌ E2E test template exists but no CI pipeline configured
- ❌ Social login / OAuth
- ❌ File attachments on todos
- ❌ Real-time sync / WebSocket

---

## Architecture

### Monorepo structure

This is a **monorepo** with two independent applications sharing a root `.gitignore`:

```
ai-todo-platform/
├── backend/                    # NestJS API server
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts             # Entry point (port from $PORT || 4000)
│       ├── app.module.ts       # Root module
│       ├── dns-preflight.ts    # DNS IPv4 fix for MongoDB Atlas
│       ├── auth/               # Auth module (register, login, JWT)
│       ├── users/              # User management
│       ├── todos/              # CRUD + reorder
│       ├── ai/                 # OpenAI integration
│       ├── chats/              # Chat assistant
│       └── common/             # Shared decorators
├── frontend/                   # Next.js app
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/                # Pages (/, /login, /register, /dashboard, /ai)
│       ├── components/         # AuthForm, TodoItem, TodoList, Sidebar, Navbar, ChatBox
│       ├── store/              # Zustand auth store
│       ├── lib/api.ts          # Axios client + API functions
│       └── hooks/              # use-hydration
├── render.yaml                 # Render deployment config
├── .gitignore
└── README.md
```

### Data flow

```
Browser  ←→  Next.js (Frontend)  ←→  Axios API calls  ←→  NestJS (Backend)  ←→  MongoDB
                 ↑                           ↑                        ↑
           Zustand store              Bearer token in           JWT strategy
           (localStorage)             Authorization header      validates token
```

---

## Auth Flow

1. User submits email + password to `POST /auth/register` or `POST /auth/login`
2. Backend hashes password with bcrypt (12 rounds), stores in MongoDB
3. Backend returns `{ access_token: string, user: { id, email } }`
4. Frontend stores token + user in **Zustand persist store** → **localStorage** (key: `ai-todo-auth`)
5. All subsequent API calls include `Authorization: Bearer <token>` via axios interceptor
6. JWT token is signed with `JWT_SECRET`, expires in **7 days**
7. Protected routes use `@UseGuards(JwtAuthGuard)`, which validates the token via Passport JWT strategy

Token is **NOT** stored in HTTP-only cookies — it lives in `localStorage`. This means the app is vulnerable to XSS if not properly sanitized (current code does not set security headers).

---

## Database Schema

### `users` collection

| Field    | Type   | Notes                |
|----------|--------|----------------------|
| _id      | ObjectId | Auto-generated     |
| email    | String | Unique, required     |
| password | String | bcrypt hash, required |
| createdAt| Date   | Mongoose timestamps  |

### `todos` collection

| Field     | Type      | Notes                              |
|-----------|-----------|------------------------------------|
| _id       | ObjectId  | Auto-generated                     |
| title     | String    | Required, trimmed                  |
| completed | Boolean   | Default: false                     |
| priority  | enum      | `'low' | 'medium' | 'high'`, default: 'medium' |
| deadline  | Date|null | Default: null                      |
| userId    | ObjectId  | Ref → User, required, indexed      |
| order     | Number    | Sort order for drag-and-drop (lower = first) |
| createdAt | Date      | Mongoose timestamps                |
| updatedAt | Date      | Mongoose timestamps                |

### `chats` collection

| Field    | Type          | Notes                          |
|----------|---------------|--------------------------------|
| _id      | ObjectId      | Auto-generated                 |
| title    | String        | Optional                       |
| messages | Array         | `{ role: string, content: string, createdAt?: Date }` |
| userId   | ObjectId      | Ref → User                     |
| updatedAt| Date          | Mongoose timestamps            |

---

## API Endpoints

All endpoints are prefixed with the backend base URL (e.g. `http://localhost:4000`).

### Auth

| Method | Path            | Auth required | Description          |
|--------|-----------------|---------------|----------------------|
| POST   | `/auth/register`| No            | Create account       |
| POST   | `/auth/login`   | No            | Sign in              |
| GET    | `/auth/me`      | Yes (Bearer)  | Get current user     |

### Todos

| Method | Path             | Auth required | Description                |
|--------|------------------|---------------|----------------------------|
| GET    | `/todos`         | Yes           | List todos (paginated, filterable) |
| POST   | `/todos`         | Yes           | Create todo               |
| PATCH  | `/todos/:id`     | Yes           | Update todo               |
| DELETE | `/todos/:id`     | Yes           | Delete todo               |
| PATCH  | `/todos/reorder` | Yes           | Reorder by ordered IDs    |

### AI

| Method | Path                | Auth required | Description                    |
|--------|---------------------|---------------|--------------------------------|
| POST   | `/ai/generate-todos`| Yes           | Break goal into tasks          |
| POST   | `/ai/suggest`       | Yes           | Suggest next action            |
| POST   | `/ai/priority`      | Yes           | Classify task priority         |
| POST   | `/ai/deadline`      | Yes           | Suggest a deadline             |

### Chats

| Method | Path      | Auth required | Description                       |
|--------|-----------|---------------|-----------------------------------|
| GET    | `/chats`  | Yes           | List chat sessions                |
| POST   | `/chats`  | Yes           | Send message, get AI reply        |

### Docs

| Method | Path   | Auth required | Description         |
|--------|--------|---------------|---------------------|
| GET    | `/docs`| No            | Swagger UI explorer |

---

## Testing

- **Unit tests**: Only `auth.service.spec.ts` exists (1 test file)
- **E2E tests**: `backend/test/todos.e2e-spec.ts` exists but is a template
- **Frontend tests**: None found
- **Coverage**: Not measured
- **Run tests**:

```bash
# Backend unit tests
cd backend && npm run test

# Backend E2E tests
cd backend && npm run test:e2e
```

---

## Deployment

### Platform: Render (configured)

- **Backend**: Docker web service (multi-stage build, `./backend/Dockerfile`)
- **Frontend**: Docker web service (multi-stage build, `./frontend/Dockerfile`)
- **Config**: `render.yaml` at repo root
- **CI/CD**: Not configured (manual deploy via Render dashboard)

### Required env vars on Render

See full table in the [Env vars section](../#environment-variables) below.

### Docker

Both apps ship with production-ready multi-stage Dockerfiles:

- **Backend** (`backend/Dockerfile`):
  - Stage 1 (deps): `npm ci`
  - Stage 2 (build): `npm run build` + `npm prune --omit=dev`
  - Stage 3 (runner): copies only `dist/`, `node_modules/`, `package*.json`
  - Exposes `4000`, CMD: `node dist/main.js`

- **Frontend** (`frontend/Dockerfile`):
  - Stage 1 (build): `npm ci` + `npm run build` (accepts `NEXT_PUBLIC_API_URL` as build arg)
  - Stage 2 (runner): copies `.next/`, `public/`, config files, production deps only
  - Exposes `3000`, CMD respects `$PORT` env var

### Environment variables

| Key | Required | Default | Used in | Description |
|-----|----------|---------|---------|-------------|
| `DATABASE_URL` | Yes | `mongodb://127.0.0.1:27017/ai-todo` | `backend/src/app.module.ts:18` | MongoDB connection string |
| `JWT_SECRET` | Yes | `change-me-in-production` | `backend/src/auth/auth.module.ts:17` | Secret key for JWT signing |
| `OPENAI_API_KEY` | Yes | (none — AI endpoints return 503) | `backend/src/ai/ai.service.ts:21` | OpenAI API key for AI features |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000` | `frontend/src/lib/api.ts:4-6` | Backend URL (must be set at build time) |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | `backend/src/ai/ai.service.ts:22` | OpenAI model name |
| `PORT` | No | `4000` (backend), `3000` (frontend) | `backend/src/main.ts:35`, `frontend/Dockerfile` | Render injects this automatically |

---

## Known Issues / Limitations

1. **Token in localStorage** — JWT is stored in localStorage, making the app vulnerable to XSS. Consider moving to HTTP-only cookies.
2. **No refresh token** — JWT expires in 7 days. No refresh mechanism exists; user must re-login.
3. **No rate limit headers** — `@nestjs/throttler` is configured but does not return `Retry-After` headers to clients.
4. **Frontend auth store persists the token** — but there is no middleware/guard to redirect unauthenticated users on page load. Dashboard pages may render briefly before the API call fails.
5. **No loading/error boundaries on all pages** — some API errors may not be gracefully handled by the UI.
6. **No HTTPS enforcement** — no helmet or CSP headers configured on the backend.
7. **AI endpoints return 503** if `OPENAI_API_KEY` is not set — the app works without AI, those features will be unavailable.
8. **Frontend build arg `NEXT_PUBLIC_API_URL`** must be set correctly at build time (Docker build) — runtime overrides are not supported by Next.js for public env vars.
9. **Test coverage is minimal** — only one spec file exists.
10. **No CI/CD pipeline** — deployment is manual via Render dashboard.