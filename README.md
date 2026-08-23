# SocietyDesk

SocietyDesk is a maintenance management system for residential apartment complexes and housing societies. It helps residents report repair problems, helps staff technicians fix them, and helps society management committees track everything in one place instead of messy group chats and paper registers.

**Live Deployment:** [https://societydesk-omega.vercel.app](https://societydesk-omega.vercel.app)

**Built with:** React 19, TanStack Start, Tailwind CSS, Neon PostgreSQL, JWT Auth, Resend Email, and Recharts.

---

## Live Demo & Accounts

The app is deployed on Vercel. You can explore all three roles using the built-in 1-click demo accounts on the login page:

- **Society Admin**: `naman@societydesk.com` / `SocietyDesk@2026!` (Full committee triage, analytics, user directory, and notice broadcasts)
- **Staff Technician**: `ramesh.staff@societydesk.com` / `Staff@2026!` (Assigned jobs queue, status updates, and resolution logging)
- **Resident**: `resident@societydesk.com` / `Resident@2026!` (Ticket submission, photo uploads, live tracking, and rating)

---

## System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|  [ Resident Portal ]            [ Staff Portal ]           [ Admin Dashboard ]    |
|  - Raise complaints             - Assigned repairs         - Analytics & KPIs     |
|  - Upload photo evidence        - Status updates           - Kanban / List triage |
|  - Live IST timeline            - Work resolution notes    - SLA & Overdue alerts |
|  - Rate completed repairs       - Mobile field view        - Notice broadcasts    |
+------------------------------------------+----------------------------------------+
                                           |
                                           | HTTPS / Type-safe RPC
                                           v
+-----------------------------------------------------------------------------------+
|                        APPLICATION & SERVER LAYER (Vercel)                        |
|                                                                                   |
|   TanStack Start (SSR) + Nitro Engine                                             |
|   ├── Route Handlers & Middleware (Role validation for resident, staff, admin)    |
|   ├── Authentication Engine (Jose JWT stateless tokens + bcrypt password hashing)  |
|   ├── Server RPC Functions (create, update, triage, assign, and delete tickets)   |
|   └── Email Service (Resend integration for status updates & notice broadcasts)   |
+------------------------------------------+----------------------------------------+
                                           |
                                           | SSL Pooled Connection
                                           v
+-----------------------------------------------------------------------------------+
|                                 DATABASE LAYER                                    |
|                                                                                   |
|   Neon Serverless PostgreSQL                                                      |
|   ├── profiles (id, full_name, role, unit_number, block, phone, password_hash)    |
|   ├── complaints (id, resident_id, assigned_to, category, priority, status, ...)  |
|   ├── complaint_history (id, complaint_id, actor_id, old_status, new_status, ...) |
|   ├── complaint_comments (id, complaint_id, author_id, comment, created_at)      |
|   ├── notices (id, author_id, title, body, is_important, created_at)              |
|   └── overdue_thresholds (category, target_hours, escalate_after_hours)           |
+-----------------------------------------------------------------------------------+
```

---

## How It Works

The platform provides dedicated workspaces based on user role:

### 1. Resident Portal

- **Report Maintenance Issues**: Submit complaints for plumbing, electrical, lift, security, or cleanliness with location details and photos.
- **Track Progress Live**: See current status (Open, In Progress, Resolved) along with who is assigned and technician update notes.
- **Comment on Tickets**: Ask questions or provide extra details directly on the complaint thread.
- **Rate Completed Work**: Give a 1 to 5 star rating and feedback once an issue is fixed.
- **Remove Complaints**: Delete complaints if they are no longer needed.
- **Society Notice Board**: Read announcements from the management committee.
- **Personalized Header**: Shows a local time-based greeting, resident flat number, and live date and time in Indian Standard Time (IST).

### 2. Staff / Technician Portal

- **Assigned Tasks List**: Technicians see the exact repairs assigned to them with flat details and resident contact info.
- **Quick Status Updates**: Update tickets to "In Progress" when starting work, and "Resolved" when finished.
- **Resolution Notes**: Add a short note explaining what was repaired before closing a task.
- **Mobile Friendly**: Designed to work smoothly on mobile browsers while technicians are working on-site.

### 3. Admin / Committee Portal

- **Overview Dashboard**: View real-time statistics including total complaints, pending tasks, resolved issues, overdue tickets, and category breakdowns.
- **Complaint Triage (Kanban & List)**: View tickets in columns or tables, set priority levels (Low, Medium, High), and assign tasks to electricians, plumbers, or lift technicians.
- **SLA & Overdue Deadlines**: Set target resolution times per category (e.g. lift issues within 4 hours, plumbing within 24 hours). Overdue tickets automatically get highlighted.
- **Action Required Alerts**: A popup alerts admins whenever there are unassigned complaints or overdue jobs.
- **Notice Board**: Post announcements to all residents. Marking a notice as important automatically sends an email broadcast.
- **Resident & Staff Directory**: Manage flats, resident accounts, and technician profiles.
- **CSV Data Export**: Download complete complaint history for society audits and committee meetings.

---

## Tech Stack

- **Frontend & Routing**: React 19 with TanStack Router (file-based, type-safe routing)
- **Backend & Server**: TanStack Start with Nitro server functions
- **Database**: PostgreSQL hosted on Neon (using connection pooling for fast cold starts)
- **Authentication**: JWT token authentication with bcrypt password hashing
- **Emails**: Resend API for sending ticket updates and urgent society notices
- **Styling**: Tailwind CSS with an olive and parchment theme
- **Hosting**: Vercel

---

## Project Structure

```
src/
├── components/          # Reusable UI elements (navigation, modals, status tags)
│   └── ui/              # Button, input, dialog, and form primitives
├── hooks/               # Custom hooks for auth state and live IST time
├── integrations/
│   ├── email/           # Email templates and delivery functions
│   └── neon/            # Database connection and SQL schema
├── lib/
│   ├── auth.server.ts   # JWT token generation and password verification
│   ├── auth.functions.ts# Server functions for login and signup
│   ├── complaints.functions.ts # Ticket creation, status updates, and assignment logic
│   └── queries.ts       # Frontend data fetching functions
├── routes/
│   ├── index.tsx        # Homepage with interactive workflow preview
│   ├── auth.tsx         # Login and registration page with 1-click demo logins
│   └── _authenticated/  # Protected pages
│       ├── complaints.* # Resident ticket pages
│       ├── staff.*      # Staff task queue
│       ├── notices.tsx  # Society notice board
│       ├── profile.tsx  # User account settings
│       └── admin.*      # Admin dashboard, complaints, notices, settings, residents
├── router.tsx           # Router configuration
├── server.ts            # Server entry file
└── styles.css           # Global CSS and custom theme utilities
```

---

## License

MIT License. Open for modification and use.
