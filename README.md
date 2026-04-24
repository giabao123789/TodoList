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

## Features

✨ **Core Features:**
- **User Authentication** — Register, login, JWT-based sessions
- **Todo Management** — Create, read, update, delete todos with timestamps
- **AI-Powered Helpers** — Generate todo suggestions, descriptions, and categorizations
- **Chat History** — Save and retrieve AI chat threads
- **Responsive Design** — Soft pink theme, mobile-friendly UI
- **Real-time Updates** — Instant UI updates on todo changes
- **Sidebar AI Assistant** — Quick AI suggestions while managing todos

## Tech Stack

### Backend
- **Framework:** NestJS (TypeScript)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **AI Integration:** OpenAI API (GPT models)
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest (unit tests + E2E)

### Frontend
- **Framework:** Next.js 15+ with App Router
- **Styling:** CSS Modules + PostCSS
- **State Management:** Zustand (lightweight store)
- **Form Handling:** React Hook Form with Zod validation
- **Build Tool:** Turbopack (fast bundling)
- **UI Components:** Custom React components

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Package Manager:** npm
- **Database Hosting:** MongoDB Atlas (cloud) or local MongoDB
- **Backend Hosting:** Render, Railway, or Docker
- **Frontend Hosting:** Vercel, Netlify, or Docker

## Detailed Project Structure

```
ai-todo-platform/
├── backend/                          # NestJS backend API
│   ├── src/
│   │   ├── auth/                     # Authentication module
│   │   │   ├── auth.controller.ts    # Login/register routes
│   │   │   ├── auth.service.ts       # JWT & password logic
│   │   │   ├── guards/               # JWT guard middleware
│   │   │   └── strategies/           # Passport strategies
│   │   ├── users/                    # User management
│   │   │   ├── users.service.ts
│   │   │   └── schemas/              # User Mongoose schema
│   │   ├── todos/                    # Todo CRUD operations
│   │   │   ├── todos.controller.ts
│   │   │   ├── todos.service.ts
│   │   │   ├── dto/                  # Request/response DTOs
│   │   │   └── schemas/              # Todo Mongoose schema
│   │   ├── ai/                       # AI generation features
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts         # OpenAI integration
│   │   │   └── dto/                  # AI request/response models
│   │   ├── chats/                    # Chat history management
│   │   │   ├── chats.controller.ts
│   │   │   ├── chats.service.ts
│   │   │   └── schemas/              # Chat message schema
│   │   ├── common/                   # Shared utilities
│   │   │   └── decorators/           # Custom decorators
│   │   ├── app.module.ts             # Root module
│   │   ├── main.ts                   # App entry point
│   │   └── dns-preflight.ts          # DNS optimization
│   ├── test/                         # E2E tests
│   ├── Dockerfile                    # Backend Docker image
│   ├── tsconfig.json                 # TypeScript config
│   ├── nest-cli.json                 # NestJS CLI config
│   └── package.json
│
├── frontend/                         # Next.js frontend app
│   ├── src/
│   │   ├── app/                      # App Router pages
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── login/                # Login page
│   │   │   ├── register/             # Registration page
│   │   │   ├── dashboard/            # Main todo dashboard
│   │   │   ├── ai/                   # AI chat page
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── globals.css           # Global styles
│   │   ├── components/               # Reusable UI components
│   │   │   ├── AuthForm.tsx          # Login/register form
│   │   │   ├── TodoList.tsx          # Todo list display
│   │   │   ├── TodoItem.tsx          # Single todo item
│   │   │   ├── ChatBox.tsx           # Chat interface
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   └── Navbar.tsx            # Top navigation
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── use-hydration.ts      # Hydration safety
│   │   ├── lib/                      # Utilities & API client
│   │   │   └── api.ts                # Fetch wrapper for API calls
│   │   ├── store/                    # Zustand state stores
│   │   │   └── auth-store.ts         # Auth & user state
│   │   └── public/                   # Static assets
│   ├── Dockerfile                    # Frontend Docker image
│   ├── next.config.ts                # Next.js configuration
│   ├── tsconfig.json                 # TypeScript config
│   ├── postcss.config.mjs            # PostCSS config
│   └── package.json
│
├── docker-compose.yml                # Multi-container orchestration
├── README.md                         # This file
└── DESIGN.md                         # UI/UX design notes
```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` — Create a new user account
- `POST /auth/login` — Login and receive JWT token

### Users (`/users`)
- `GET /users/me` — Get current user profile (JWT required)
- `GET /users/:id` — Get user by ID
- `PATCH /users/:id` — Update user profile

### Todos (`/todos`)
- `GET /todos` — List all todos for current user (paginated)
- `POST /todos` — Create a new todo
- `GET /todos/:id` — Get a specific todo
- `PATCH /todos/:id` — Update a todo (title, description, status)
- `DELETE /todos/:id` — Delete a todo
- `PATCH /todos/:id/status` — Toggle completion status

### AI Features (`/ai`)
- `POST /ai/generate-title` — Generate a title suggestion for a todo
- `POST /ai/generate-description` — Generate a description
- `POST /ai/categorize` — Auto-categorize todos
- `POST /ai/suggest-todos` — Get todo suggestions based on user input

### Chats (`/chats`)
- `POST /chats` — Create a new chat session
- `GET /chats` — List all user's chat sessions
- `GET /chats/:id` — Get chat details with message history
- `POST /chats/:id/messages` — Add a message to a chat
- `DELETE /chats/:id` — Delete a chat session

## Authentication Flow

1. **Registration** — User submits email/password → Backend hashes password → Stores in MongoDB → Returns success message
2. **Login** — User submits credentials → Backend verifies → Generates JWT token → Client stores in localStorage
3. **Protected Routes** — Frontend includes JWT in `Authorization: Bearer <token>` header → Backend validates with JWT guard → Returns user data
4. **Token Refresh** — (Optional) Implement refresh token rotation for enhanced security
5. **Logout** — Client deletes JWT from localStorage → User redirected to login

## Environment Variables Setup

### Backend `.env` Example
```env
PORT=4000
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/ai-todo?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this-in-production
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
NODE_ENV=development
```

### Frontend `.env.local` Example
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=BlushTodo
```

## Deployment Guide

### Deploy Backend to Render/Railway

1. **Create account** on [Render.com](https://render.com) or [Railway.app](https://railway.app)
2. **Connect GitHub repo**
3. **Set environment variables:**
   - `DATABASE_URL` — MongoDB Atlas connection string
   - `JWT_SECRET` — Strong random secret
   - `OPENAI_API_KEY` — Your API key
   - `CORS_ORIGINS` — Include your frontend URL
4. **Configure start command:** `npm run start:prod` or `npm run build && npm start`
5. **Backend URL** — Copy the deployed URL (e.g., `https://api.render.com`)

### Deploy Frontend to Vercel

1. **Connect GitHub** to [Vercel](https://vercel.com)
2. **Set build command:** `npm run build`
3. **Set environment variable:**
   - `NEXT_PUBLIC_API_URL=https://your-backend-api.com`
4. **Deploy** — Vercel auto-deploys on push to main/master
5. **Custom domain** — Add in Vercel project settings

### Deploy with Docker Compose (Production)

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f
```

Ensure `NEXT_PUBLIC_API_URL` is set correctly in frontend `.env` file or Dockerfile.

## Troubleshooting

### 1. **CORS Error: "Access to XMLHttpRequest blocked"**
   - **Cause:** Frontend and backend on different origins
   - **Fix:** Add frontend URL to backend `CORS_ORIGINS` env var: `CORS_ORIGINS=http://localhost:3000,https://yourdomain.com`

### 2. **MongoDB Connection Error: `querySrv ECONNREFUSED`**
   - **Cause:** DNS SRV lookup failing (network/DNS issue, not password)
   - **Solutions:**
     - Allow your IP in MongoDB Atlas → Network Access
     - Flush local DNS: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
     - Try non-SRV URI format from Atlas drivers page
     - Disable VPN/proxy temporarily

### 3. **JWT Token Expired**
   - **Cause:** Token has invalid signature or expired
   - **Fix:** Clear localStorage and login again

### 4. **OpenAI API Rate Limit**
   - **Cause:** Too many requests to OpenAI
   - **Fix:** Add request throttling in `ai.service.ts` or upgrade OpenAI plan

### 5. **Frontend Not Finding API**
   - **Cause:** `NEXT_PUBLIC_API_URL` not set or incorrect
   - **Fix:** Check `.env.local` file and rebuild: `npm run dev`

### 6. **Database Query Slow**
   - **Fix:** Add MongoDB indexes on frequently queried fields (user_id, created_at, etc.)

### 7. **Port Already in Use**
   - **Backend (4000):** `lsof -i :4000` (Mac/Linux) or `netstat -ano | findstr :4000` (Windows)
   - **Frontend (3000):** Kill process or use different port: `npm run dev -- -p 3001`

## Contributing

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/my-feature`
3. **Commit changes:** `git commit -m "Add my feature"`
4. **Push to branch:** `git push origin feature/my-feature`
5. **Open a Pull Request** with detailed description
6. **Code Review** — Wait for maintainer feedback
7. **Merge** — Once approved, PR is merged to main

### Code Style
- Use **TypeScript** for type safety
- Follow **NestJS** patterns for backend code
- Use **React hooks** for frontend components
- Run linter: `npm run lint` (if configured)
- Format code: `npm run format` (if configured)

## Performance Optimization Tips

- **Frontend:** Use Next.js image optimization, lazy loading, code splitting
- **Backend:** Implement caching (Redis), database indexing, pagination
- **Database:** Add compound indexes for common queries, use projection to limit fields
- **API Calls:** Debounce search queries, cache responses on client side
- **Images:** Use WebP format, compress before upload

## Known Limitations

- Single-user per session (no real-time multi-device sync yet)
- Chat history limited by MongoDB collection size
- OpenAI rate limits apply (depends on plan)
- No offline-first functionality (requires connectivity)

## Future Enhancements

- [ ] Real-time collaboration with WebSockets
- [ ] Dark mode theme toggle
- [ ] Todo templates and workflows
- [ ] Integration with calendar/Google Tasks
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Todo sharing and team features
- [ ] Custom AI models integration

## FAQ

**Q: Can I use SQLite instead of MongoDB?**  
A: You'd need to replace Mongoose with another ORM (TypeORM, Prisma). Doable but requires refactoring.

**Q: Is my data encrypted in transit?**  
A: Yes, MongoDB Atlas uses TLS/SSL. Backend-to-frontend should also use HTTPS in production.

**Q: Can I disable the AI features?**  
A: Yes, skip the `/ai` endpoints and remove OpenAI API calls from the frontend.

**Q: How do I backup my MongoDB data?**  
A: Use MongoDB Atlas built-in backup, or `mongodump` command-line tool.

## Support & Community

- **Issues:** Report bugs on [GitHub Issues](https://github.com/yourusername/ai-todo-platform/issues)
- **Discussions:** Ask questions in [GitHub Discussions](https://github.com/yourusername/ai-todo-platform/discussions)
- **Email:** Contact maintainers at `support@example.com`

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the BlushTodo team**  
Last updated: April 2026
