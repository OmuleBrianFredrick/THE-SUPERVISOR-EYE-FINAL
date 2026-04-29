# 👁️ Supervisor Eye

### Hierarchical Reporting, Accountability & Operational Intelligence Platform

---

## 📌 Project Description

**Supervisor Eye** is a modern, full-stack enterprise platform built to enforce accountability, track work progress, and provide verifiable evidence of task completion within organizational structures.

At its core, Supervisor Eye answers one critical question:

> **"Was the work actually done — and can it be verified?"**

Unlike traditional reporting tools, Supervisor Eye introduces **evidence-based reporting**, structured supervision, and role-driven operational visibility — connecting workers, supervisors, managers, and executives through a structured digital hierarchy.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Tailwind CSS v3](https://tailwindcss.com/) | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | Accessible headless components |
| [shadcn/ui](https://ui.shadcn.com/) | Component library built on Radix |
| [Framer Motion](https://www.framer.com/motion/) | Animations & transitions |
| [Wouter](https://github.com/molefrog/wouter) | Lightweight client-side routing |
| [TanStack Query v5](https://tanstack.com/query) | Server state management & data fetching |
| [React Hook Form](https://react-hook-form.com/) | Form management |
| [Zod](https://zod.dev/) | Schema validation |
| [Recharts](https://recharts.org/) | Data visualisation & dashboards |
| [Lucide React](https://lucide.dev/) | Icon library |
| [jsPDF](https://artskydj.github.io/jsPDF/) | PDF export |
| [date-fns](https://date-fns.org/) | Date formatting & manipulation |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime environment |
| [Express](https://expressjs.com/) | HTTP server framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe server code |
| [Passport.js](https://www.passportjs.org/) | Authentication middleware |
| [passport-local](https://www.passportjs.org/packages/passport-local/) | Username/password auth strategy |
| [openid-client](https://github.com/panva/node-openid-client) | Google OAuth / OpenID Connect |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [express-session](https://github.com/expressjs/session) | Session management |
| [connect-pg-simple](https://github.com/voxpelli/node-connect-pg-simple) | PostgreSQL session store |
| [Nodemailer](https://nodemailer.com/) | Email notifications |
| [ws](https://github.com/websockets/ws) | WebSocket support (real-time notifications) |
| [Nanoid](https://github.com/ai/nanoid) | Unique ID generation |
| [Memoizee](https://github.com/medikoo/memoizee) | Function memoization |

### Database & ORM
| Technology | Purpose |
|---|---|
| [PostgreSQL](https://www.postgresql.org/) | Primary relational database |
| [Neon Serverless](https://neon.tech/) | Serverless PostgreSQL hosting |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe ORM & query builder |
| [drizzle-zod](https://orm.drizzle.team/docs/zod) | Auto-generated Zod schemas from Drizzle |

### Build & Tooling
| Technology | Purpose |
|---|---|
| [Vite](https://vitejs.dev/) | Frontend bundling |
| [esbuild](https://esbuild.github.io/) | Backend bundling for production |
| [tsx](https://github.com/privatenumber/tsx) | TypeScript execution in development |
| [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) | Database migrations |
| [PostCSS](https://postcss.org/) | CSS processing |
| [Autoprefixer](https://github.com/postcss/autoprefixer) | CSS vendor prefixing |

---

## 📁 Project Structure

```
THE-SUPERVISOR-EYE-FINAL/
├── client/               # React frontend (Vite root)
│   └── src/
│       ├── components/   # UI components (shadcn/ui + custom)
│       ├── pages/        # Route-level page components
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities, query clients
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── auth.ts           # Passport authentication logic
│   └── storage.ts        # File/storage handlers
├── shared/               # Shared between client & server
│   └── schema.ts         # Drizzle ORM schema + Zod types
├── .github/workflows/    # CI/CD pipeline definitions
├── drizzle.config.ts     # Drizzle ORM configuration
├── vite.config.ts        # Vite build configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Dependencies & scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Session (required)
SESSION_SECRET=your_strong_random_secret_here

# Google OAuth (optional — for social login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email / Nodemailer (optional — for notifications)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_email_password

# App
NODE_ENV=development
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js **v18.0.0 or higher**
- A PostgreSQL database (local or [Neon](https://neon.tech/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/OmuleBrianFredrick/THE-SUPERVISOR-EYE-FINAL.git
cd THE-SUPERVISOR-EYE-FINAL

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# 4. Push the database schema
npm run db:push

# 5. Start the development server
npm run dev
```

The app runs on `http://localhost:5000` by default, serving both the API and the React frontend.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run build` | Build frontend (Vite) and backend (esbuild) for production |
| `npm start` | Run the production build |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push Drizzle schema changes to the database |

---

## 🔐 Authentication

Supervisor Eye supports two authentication methods:

- **Local auth** — username and password with bcrypt password hashing and PostgreSQL session storage
- **Google OAuth** — via OpenID Connect (`openid-client` + `google-auth-library`)

Sessions are stored in PostgreSQL using `connect-pg-simple`, making them persistent across server restarts.

---

## 👥 Role-Based Access Control (RBAC)

| Role | Capabilities |
|---|---|
| **Worker** | Submit reports, view assigned tasks, upload evidence |
| **Supervisor** | Review & approve/reject reports, assign tasks to workers |
| **Manager** | Oversee supervisors, view department analytics |
| **HR** | Workforce visibility, compliance monitoring |
| **IT Staff** | System operations and technical support |
| **Executive** | High-level KPI dashboards and strategic analytics |
| **Superior Admin** | Full platform and network control |

---

## 📊 Core Features

- **Evidence-based reporting** — attach images, videos, PDFs, and documents to reports
- **Report verification workflow** — Draft → Submitted → Pending Review → Approved/Rejected
- **Task assignment system** — create, assign, and track tasks with deadlines and priorities
- **Real-time notifications** — WebSocket-powered alerts for task assignments, approvals, and rejections
- **Role-specific dashboards** — each role sees analytics relevant to their level
- **PDF export** — generate and download reports as PDF via jsPDF
- **Multi-tenant architecture** — network/organisation-level isolation
- **GPS/location metadata** — optional field location tagging on reports

---

## 🌍 Deployment

The project is configured to run on [Replit](https://replit.com/) and is compatible with any Node.js hosting platform (Railway, Render, Fly.io, VPS, etc.).

For production:
```bash
npm run build
npm start
```

The build produces:
- `dist/public/` — compiled React frontend (served as static files)
- `dist/index.js` — compiled Express server

---

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Offline sync support
- [ ] AI-powered report summarisation
- [ ] Predictive analytics
- [ ] Payroll integration
- [ ] Live geofencing
- [ ] Video verification

---

## 🤝 Contributing

Contributions are welcome. Feel free to open issues or submit pull requests for:
- Feature suggestions
- Bug reports
- Security improvements
- UI/UX enhancements
- API integrations

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👑 Built By

**Omule Brian Fredrick**
> *"Don't just claim the work was done. Track it. Report it. Verify it."*
