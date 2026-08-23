# SocietyDesk

SocietyDesk is a maintenance management system for residential apartment complexes and housing societies. It helps residents report repair problems, helps staff technicians fix them, and helps society management committees track everything in one place instead of messy group chats and paper registers.

**Built with:** React 19, TanStack Start, Tailwind CSS, Neon PostgreSQL, JWT Auth, Resend Email, and Recharts.

---

## How It Works

The platform has three dedicated portals based on user role:

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

## Tech Stack & Architecture

- **Frontend & Routing**: React 19 with TanStack Router (file-based, type-safe routing)
- **Backend & Server**: TanStack Start with Nitro server functions
- **Database**: PostgreSQL hosted on Neon (using connection pooling for speed)
- **Authentication**: JWT token authentication with bcrypt password hashing
- **Emails**: Resend API for sending ticket updates and urgent society notices
- **Styling**: Tailwind CSS with an olive and parchment theme

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

## Local Setup

### 1. Requirements

- Node.js version 20 or higher
- A Neon PostgreSQL database

### 2. Installation

```bash
git clone https://github.com/namaninnovates/societydesk.git
cd resident-reply-system
npm install
```

### 3. Setup Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Add your database connection string and a secret key:

```env
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="52cc3d95afdf35ae7cf2fb5a1f2d44d2a27f69e705469191919ca0a564d43af2"
RESEND_API_KEY="" # Optional: add Resend key to send actual emails
```

### 4. Database Migration

Run the initial SQL migration in your database:

```bash
psql $DATABASE_URL < supabase/migrations/20260822180605_da397ad0-fd18-41c4-ad2b-7dca9df49fab.sql
```

### 5. Start Development Server

```bash
npm run dev
```

Open `http://localhost:8080` in your browser.

---

## Deployment (Vercel)

SocietyDesk is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel.
2. Select framework preset: `TanStack Start` (or `Other`).
3. Add the `DATABASE_URL` and `JWT_SECRET` variables under **Project Settings → Environment Variables**.
4. Click Deploy.

---

## License

MIT License. Open for modification and use.
