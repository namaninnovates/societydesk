# SocietyDesk — Society Maintenance Tracker

A full-stack maintenance complaint tracking platform for apartment/housing societies. Residents raise and track complaints with photos; admins triage, prioritize, resolve, and communicate via a notice board and email notifications.

**Tech stack:** React 19 · TanStack Start · Tailwind CSS v4 · shadcn/ui · Neon PostgreSQL · Jose JWT + bcrypt · Resend (email) · Recharts · Nitro (server)

---

## Features

### Resident

- **Register & sign in** (secure email/password with JWT and bcrypt)
- **Raise complaints** with category, title, description, location, and up to 3 photos (client-side compressed)
- **Track complaints** — filter by status/category, view full status history timeline, photos in lightbox
- **Comment** on open complaints for clarifications
- **Rate resolutions** (1–5 stars with optional feedback) when a complaint is resolved
- **Notice board** — read society announcements; important notices pinned to the top
- **Email notifications** when complaint status changes

### Admin

- **Dashboard** — stat tiles (total/open/in-progress/resolved/overdue), bar chart by category, pie chart by status, 30-day raised-vs-resolved trend, average resolution time, recurring issue watchlist
- **Complaint management** — list + Kanban views, filters by category/status/priority/overdue, search, set priority (Low/Medium/High), change status with required note, view resident contact info
- **Overdue detection** — per-category configurable thresholds (Admin → Settings), `recalculate_overdue()` function, overdue complaints auto-surface at the top with amber highlight
- **Notice board** — create/delete notices, mark as important (pinned)
- **Resident directory** — view all residents with unit/block/phone
- **CSV export** of complaints
- **Email notifications** — status change emails to affected resident, important notice emails to all residents

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 20
- A **Neon** PostgreSQL database (free tier works)
- A **Resend** account for email (free tier, optional — emails are logged in dry-run mode without it)

### 1. Clone & Install

```bash
git clone <repository-url>
cd resident-reply-system
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in the values in `.env`. See [`.env.example`](.env.example) for descriptions of each variable.

### 3. Set Up the Database

The database schema is in [`src/integrations/neon/schema.sql`](src/integrations/neon/schema.sql). Apply it to your Neon database:

```bash
# Using psql:
psql $DATABASE_URL < src/integrations/neon/schema.sql
```

### 4. Run Locally

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
npx vite preview   # preview the production build
```

---

## Database Schema

```
┌──────────────────────┐     ┌──────────────────────────┐
│      profiles        │     │       complaints          │
├──────────────────────┤     ├──────────────────────────┤
│ id (PK, FK→auth)     │◄────│ resident_id (FK)          │
│ full_name            │     │ id (PK)                   │
│ role (resident/admin)│     │ category                  │
│ unit_number          │     │ title                     │
│ block                │     │ description               │
│ phone                │     │ location                  │
│ created_at           │     │ status (open/in_progress/  │
└──────────────────────┘     │         resolved)         │
                             │ priority (low/med/high)   │
                             │ is_overdue                │
                             │ created_at                │
                             │ resolved_at               │
                             └──────────────────────────┘
                                       │
               ┌───────────────────────┼───────────────────┐
               ▼                       ▼                   ▼
┌────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│  complaint_photos  │  │  complaint_history   │  │complaint_comments│
├────────────────────┤  ├─────────────────────┤  ├──────────────────┤
│ id (PK)            │  │ id (PK)             │  │ id (PK)          │
│ complaint_id (FK)  │  │ complaint_id (FK)   │  │ complaint_id (FK)│
│ storage_path       │  │ old_status          │  │ author_id (FK)   │
│ uploaded_at        │  │ new_status          │  │ comment          │
└────────────────────┘  │ note                │  │ created_at       │
                        │ actor_id (FK)       │  └──────────────────┘
                        │ created_at          │
                        └─────────────────────┘

┌──────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐
│       notices        │  │ overdue_thresholds  │  │ resolution_feedback  │
├──────────────────────┤  ├─────────────────────┤  ├──────────────────────┤
│ id (PK)              │  │ id (PK)             │  │ id (PK)              │
│ author_id (FK)       │  │ category (unique)   │  │ complaint_id (FK, UQ)│
│ title                │  │ days                │  │ rating (1–5)         │
│ body                 │  └─────────────────────┘  │ comment              │
│ is_important         │                           │ created_at           │
│ created_at           │                           └──────────────────────┘
└──────────────────────┘
```

### Custom Types (ENUMs)

- `app_role`: `resident`, `admin`
- `complaint_status`: `open`, `in_progress`, `resolved`
- `complaint_priority`: `low`, `medium`, `high`

### Row-Level Security

- Residents can only read/write their own complaints and comments
- Admins have full read/write access
- Both roles can read notices; only admins can write notices and thresholds

---

## API / Data Layer

The app uses **TanStack Start Server Functions** with **Neon Serverless PostgreSQL** via `@neondatabase/serverless` connection pooling. All authentication is handled using standard **Jose JWTs** and **bcrypt** passwords.

### Key Server Functions

| Function                | Trigger                          | Description                                       |
| ----------------------- | -------------------------------- | ------------------------------------------------- |
| `notifyStatusChange`    | Admin changes complaint status   | Sends branded HTML email to the affected resident |
| `notifyImportantNotice` | Admin publishes important notice | Sends email to all registered residents           |

### Storage & Photos

- Compressed complaint photos stored with complaints data
- Client-side image compression before upload (max 1400px, JPEG quality 0.75)

---

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── app-shell.tsx    # Navigation layout (sidebar/topbar)
│   ├── status.tsx       # StatusPill, PriorityTag components
│   └── ...
├── hooks/
│   └── use-auth.tsx     # Auth context provider (session + profile)
├── integrations/
│   ├── email/           # Resend email service + server functions
│   └── neon/            # Neon DB client + schema SQL
├── lib/
│   ├── queries.ts       # Data fetching helpers
│   ├── societydesk.ts   # Constants, types, utilities
│   └── utils.ts         # cn() helper
├── routes/
│   ├── index.tsx             # Landing page
│   ├── auth.tsx              # Sign in / Register
│   └── _authenticated/       # Protected routes
│       ├── complaints.*.tsx  # Resident complaint views
│       ├── notices.tsx       # Resident notice board
│       ├── profile.tsx       # Profile settings
│       └── admin.*.tsx       # Admin views (dashboard, complaints, notices, settings, residents)
├── router.tsx           # TanStack Router config
├── server.ts            # SSR error wrapper
├── start.ts             # TanStack Start middleware config
└── styles.css           # Tailwind + design tokens
```

---

## License

Private project — all rights reserved.
