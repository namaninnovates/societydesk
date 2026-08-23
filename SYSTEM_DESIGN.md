# SocietyDesk — System Design Document

## 1. Executive Summary & Problem Context

Residential societies handle dozens of maintenance complaints weekly across plumbing, electrical, elevators, housekeeping, and common infrastructure. Without a centralized tracking platform, issues are lost in chat threads, SLAs are breached without visibility, admins lack historical analytics, and residents face uncertainty regarding fix timelines.

**SocietyDesk** provides a multi-tenant-ready, role-based maintenance management platform. It pairs a mobile-first resident portal for rapid photo-assisted issue filing with an admin triage console featuring live Kanban tracking, automated overdue SLA calculation, broadcast notice boards, and transactional email updates.

---

## 2. Architectural Overview

SocietyDesk is built on a modern full-stack TypeScript architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 19 + TanStack Router (SSR/Hydration) + Vite + Tailwind│
│  shadcn/ui + Radix UI + Recharts + Sonner                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               │                               │
               ▼                               ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│     Data & Storage Layer     │  │     Application Server     │
│   (Supabase / PostgreSQL)    │  │   (TanStack Start Server)  │
│  - Supabase Auth (JWT/OAuth) │  │  - Nitro runtime           │
│  - Row-Level Security (RLS)  │  │  - Server Functions        │
│  - Storage (complaint-photos)│  │  - Resend Email Service    │
│  - Neon Serverless Postgres  │  │  - Background triggers     │
└──────────────────────────────┘  └───────────────────────────┘
```

### Key Architectural Layers:

1. **Frontend / UI**: Single-page application with SSR support via TanStack Start. Client state is cached using `@tanstack/react-query` with optimistic cache invalidation.
2. **Data & Auth Access**: Client queries interact with PostgreSQL via `@supabase/supabase-js` governed strictly by database-level **Row-Level Security (RLS)** policies.
3. **Serverless Database & Storage**: Neon PostgreSQL database and Supabase Auth/Storage. Photos undergo client-side canvas compression (JPEG, max 1400px, 0.75 quality) before upload to reduce bandwidth and storage overhead.
4. **Server Functions & Email Engine**: Server-side logic (`notify.functions.ts`) executes securely within TanStack Start's server environment, invoking Resend API to deliver transactional notifications.

---

## 3. Database Schema & Data Modeling

The relational schema is normalized into 8 core tables:

1. **`profiles`**: Linked 1:1 to `auth.users(id)`. Stores resident metadata: `full_name`, `role` (`resident` | `admin`), `unit_number`, `block`, and `phone`.
2. **`complaints`**: Core ticket entity with `category`, `title`, `description`, `location`, `status` (`open` | `in_progress` | `resolved`), `priority` (`low` | `medium` | `high`), `is_overdue` (boolean), `created_at`, and `resolved_at`.
3. **`complaint_photos`**: 1:N association to `complaints`. Stores Supabase Storage paths for up to 3 attached images.
4. **`complaint_history`**: Append-only audit trail logging `old_status`, `new_status`, `note`, `actor_id`, and `created_at` on every transition.
5. **`complaint_comments`**: Threaded communication on active complaints between residents and admins.
6. **`overdue_thresholds`**: Configurable SLA limits in days per category (or global fallback where `category IS NULL`).
7. **`notices`**: Society-wide broadcast announcements with `is_important` (pinned) flag.
8. **`resolution_feedback`**: Post-resolution resident ratings (1–5 stars) with qualitative feedback.

---

## 4. Overdue SLA Detection Engine

Complaint turnaround is enforced via SLA thresholds:

$$\text{is\_overdue} = (\text{status} \neq \text{'resolved'}) \land (\text{now}() - \text{created\_at} > \text{COALESCE}(\text{threshold}_{\text{cat}}, \text{threshold}_{\text{global}}, 3 \text{ days}))$$

### Implementation Mechanics:

- An administrative settings interface enables dynamic adjustment of SLA day counts per category (e.g., Security = 1 day, Housekeeping = 5 days).
- A stored PL/pgSQL function (`recalculate_overdue()`) scans open tickets against thresholds and updates `is_overdue`.
- Overdue tickets automatically sort to the top of triage views and trigger amber warning visual indicators across list and Kanban boards.

---

## 5. Notification & Communications Pipeline

The platform ensures transparent stakeholder communication through transactional emails:

1. **Complaint Status Transitions**:
   - When an admin shifts a ticket status (e.g., `open` $\to$ `in_progress` or `resolved`), `notifyStatusChange` server function triggers.
   - The server resolves the resident's email via the Supabase Admin API, formats a responsive HTML template containing prior/new status, the admin's mandatory transition note, and a direct deep-link to the ticket.
2. **Important Broadcast Notices**:
   - Publishing an announcement flagged as `is_important: true` executes `notifyImportantNotice`.
   - The server queries all registered resident profiles and dispatches notification emails via Resend.

---

## 6. Security Model & Role-Based Access Control (RBAC)

1. **Row-Level Security (RLS)**:
   - Residents are constrained via `auth.uid() = resident_id` for reading and modifying their own complaints and comments.
   - Admins (identified via `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`) receive full read/write access across all tables.
2. **Route Guarding**:
   - TanStack Router `beforeLoad` hooks verify active sessions before mounting `/_authenticated/*` routes.
   - Admin sub-trees (`/_authenticated/admin/*`) redirect non-admin residents to the resident dashboard.
3. **Secret Isolation**:
   - `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `RESEND_API_KEY` reside strictly within server-side environment variables and are never bundled into client bundles.

---

## 7. Scalability & Operational Considerations

- **Horizontal Scalability**: Stateless frontend/SSR nodes paired with connection-pooled Neon PostgreSQL.
- **Client Performance**: Lazy loading of routes, client-side photo downscaling before upload, and TanStack Query caching minimize round trips.
- **Extensibility**: The schema and server functions readily support future SMS/WhatsApp gateways, IoT utility meters, and resident dues billing modules.
