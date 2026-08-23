# SocietyDesk — Modern Society Maintenance & Operations Platform

SocietyDesk is a production-grade full-stack operations and complaint lifecycle platform built for residential housing societies and apartment communities. It replaces chaotic WhatsApp groups and paper registers with an end-to-end triaging system covering residents, maintenance technicians, and society management committees.

**Tech Stack:** React 19 · TanStack Start (SSR) · Tailwind CSS v4 · Neon Serverless PostgreSQL · Jose JWT + bcrypt · Resend · Recharts · Nitro

---

## 🏛️ System Architecture & Persona Capabilities

SocietyDesk implements a strict **three-tier role architecture** with end-to-end type safety, server-side authorization, and Indian Standard Time (IST) audit logging:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SocietyDesk                                │
├───────────────────┬───────────────────────┬─────────────────────────────┤
│   🏡 RESIDENTS     │     🛠️ STAFF / TECH   │      🛡️ SOCIETY ADMIN       │
├───────────────────┼───────────────────────┼─────────────────────────────┤
│ • Raise Tickets   │ • Assigned Queue      │ • Executive BI Dashboard    │
│ • Photo Proof     │ • 1-Click Status Step │ • Kanban & Table Triage     │
│ • Live IST Clock  │ • Resolution Notes    │ • SLA & Overdue Thresholds  │
│ • Remove Tickets  │ • Mobile-First View   │ • Notice Broadcasts (Email) │
│ • 5-Star Ratings  │ • Verified Sign-off   │ • Resident & Staff Directory│
│ • Society Notices │ • Clean Display Name  │ • CSV Export & Audit Logs   │
└───────────────────┴───────────────────────┴─────────────────────────────┘
```

---

## ⚡ Core Features

### 1. Resident Portal (`/complaints`)

- **Self-Service Ticketing**: Raise maintenance issues by category (Electrical, Plumbing, Lift, Security, etc.) with location details and client-compressed photo attachments.
- **Real-Time Lifecycle Tracking**: Live visual timeline tracking from `Open` → `In Progress` → `Resolved` with official staff notes.
- **Interactive Comments**: Direct communication thread with society managers and technicians on active complaints.
- **Resolution Verification & Rating**: Rate completed repairs from 1 to 5 stars with qualitative feedback.
- **Complaint Management**: Option to cancel or remove unwanted complaints directly from the portal.
- **Personalized Header**: Time-aware greeting (`Good morning / afternoon / evening`), flat unit badge, live ticking IST date/time clock, and quick Sign Out.

### 2. Staff / Technician Portal (`/staff`)

- **Assigned Work Queue**: Filterable workspace showing tickets specifically assigned to the technician.
- **Rapid Status Transitions**: Fast-action workflow to transition tickets from assigned to `In Progress` or `Resolved`.
- **Resolution Logging**: Mandatory resolution notes capturing what was fixed before closing the ticket.
- **Mobile-Optimized Interface**: Streamlined layouts tailored for on-site field technicians.

### 3. Management Committee / Admin Portal (`/admin`)

- **Analytical Intelligence Dashboard**: Real-time KPI summary cards, 30-day raised vs. resolved volume trends, category distribution charts, status breakdown pies, and recurring issue watchlists powered by Recharts.
- **Dual-Mode Triage (Kanban & List)**: Drag-and-drop or table-based triaging with instant category, priority, and staff assignment controls.
- **Automated SLA & Overdue Engine**: Configurable overdue day thresholds per category (Settings); automatic `recalculate_overdue()` trigger highlighting breached SLAs.
- **Floating Action Alert Popup**: Dedicated triage reminder badge surfacing unassigned issues and overdue SLA tickets for immediate action.
- **Notice Board Broadcasts**: Publish society announcements with an "Important" flag that automatically emails all registered flat owners.
- **Resident & Staff Directory**: Manage unit allocations, contact details, and account permissions with 1-click password resets.
- **CSV Data Export**: Export filtered ticket databases for audit and accounting records.

---

## 🎨 Design & Engineering Standards

- **Strict Olive & Earth Theme**: Tailored color palette using natural forest and olive tones (`#1F3622`, `#2E4E30`, `#DFD9CA`, `#FAF8F2`).
- **Zero Emoji Clutter**: Professional iconography powered by `@phosphor-icons/react` for a clean, human-crafted enterprise aesthetic.
- **Seamless Flow Animations**: Hardware-accelerated SVG dashflow and smooth micro-interactions.
- **Stateless JWT Security**: Industry-standard `jose` JWTs (`HS256`) with `bcrypt` password hashing, robust session verification, and zero third-party lock-in.
- **Database Connection Pooling**: Neon Serverless PostgreSQL with pooled endpoints for instant cold starts and sub-50ms query latency.

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components (app-shell, brand, dialogs, status badges)
│   └── ui/              # Base shadcn/ui primitives styled with Tailwind v4
├── hooks/               # Custom React hooks (useAuth, useIstTime, use-toast)
├── integrations/
│   ├── email/           # Resend email notification service and SSR server functions
│   └── neon/            # Neon PostgreSQL database client and schema migration SQL
├── lib/
│   ├── auth.server.ts   # JWT token signing, verification, and bcrypt hashing
│   ├── auth.functions.ts# Auth RPC server functions (signIn, signUp, signOut)
│   ├── complaints.functions.ts # Ticket mutations, status changes, assignments, deletion
│   └── queries.ts       # Type-safe client-side query fetchers
├── routes/
│   ├── index.tsx        # Interactive hero landing page with live workflow simulation
│   ├── auth.tsx         # Universal portal sign-in, registration, and 1-click demo accounts
│   └── _authenticated/  # Role-guarded application routes
│       ├── complaints.* # Resident complaint creation, listing, and detail views
│       ├── staff.*      # Staff technician assignment dashboard
│       ├── notices.tsx  # Society notice board
│       ├── profile.tsx  # User profile and password management
│       └── admin.*      # Admin analytics, complaint triage, notices, settings, residents
├── router.tsx           # TanStack Router configuration
├── server.ts            # Server entrypoint with SSR error boundaries
└── styles.css           # Global Tailwind CSS v4 design tokens and keyframe utilities
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites

- **Node.js** ≥ 20.x
- **Neon PostgreSQL** database instance

### 2. Installation

```bash
git clone https://github.com/namaninnovates/societydesk.git
cd resident-reply-system
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Neon Serverless PostgreSQL connection string (pooled)
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require"

# 256-bit secret key for signing session JWTs
JWT_SECRET="52cc3d95afdf35ae7cf2fb5a1f2d44d2a27f69e705469191919ca0a564d43af2"

# Optional: Resend API key for email delivery (runs in safe dry-run mode if omitted)
RESEND_API_KEY="re_..."
```

### 4. Database Setup

Execute the database schema in your Neon SQL editor:

```bash
psql $DATABASE_URL < supabase/migrations/20260822180605_da397ad0-fd18-41c4-ad2b-7dca9df49fab.sql
```

### 5. Run Locally

```bash
npm run dev
```

Open `http://localhost:8080` in your browser.

---

## 🚢 Production Deployment (Vercel Ready)

SocietyDesk is pre-configured for zero-config Vercel SSR deployment:

1. Push your repository to GitHub.
2. Import the project into **Vercel** (`Application Preset: TanStack Start` or `Other`).
3. Add `DATABASE_URL` and `JWT_SECRET` in **Project Settings → Environment Variables**.
4. Deploy! Nitro and TanStack Start will build and deploy the full-stack bundle automatically.

---

## 🛡️ License

MIT License — feel free to use and adapt for your society community.
