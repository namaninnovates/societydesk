# SocietyDesk — System Architecture & Design

## 1. Overview & Core Problem

Housing societies handle dozens of maintenance complaints every week across plumbing, electrical fittings, lifts, housekeeping, and shared common areas. When handled over WhatsApp groups or manual paper logs:

- Maintenance requests get buried or forgotten.
- Society managers lack visibility into overdue tickets.
- Technicians lack clear priority orders.
- Residents get no real-time status updates or repair tracking.

**SocietyDesk** solves this with an organized, role-based web application tailored for housing societies in India. It pairs a fast, mobile-friendly resident portal for filing photo complaints with a triage console for committee admins and staff technicians.

---

## 2. Technical Stack

- **Frontend**: React 19, TanStack Router (SSR + client hydration), Tailwind CSS v4, shadcn/ui, Recharts
- **Backend**: TanStack Start Server Functions on Nitro runtime
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Authentication**: JWT sessions (`jose`) with `bcryptjs` password hashing and HTTP-only cookies
- **Email Notifications**: Resend API integration for ticket status changes and notice broadcasts

---

## 3. Database Schema

The database schema is organized into 8 relational tables:

1. **`profiles`**: Stores user accounts (`full_name`, `email`, `role` (`resident` | `admin` | `staff`), `unit_number`, `block`, `phone`, `avatar_url`).
2. **`complaints`**: Core ticket record with `resident_id`, `assigned_to`, `category`, `title`, `description`, `location`, `status` (`open` | `in_progress` | `resolved`), `priority` (`low` | `medium` | `high`), `is_overdue`, and timestamps.
3. **`complaint_photos`**: Associated photos (up to 3 compressed images per ticket).
4. **`complaint_history`**: Audit trail tracking status transitions, actor IDs, and transition notes.
5. **`complaint_comments`**: Discussion thread between resident and assigned staff/admin.
6. **`overdue_thresholds`**: Configurable resolution deadline in days per category (e.g. Lift = 1 day, Plumbing = 2 days).
7. **`notices`**: Society notice board announcements with `is_important` pinned flags.
8. **`resolution_feedback`**: Resident star rating (1–5) and feedback submitted upon ticket resolution.

---

## 4. Resolution Deadlines & Overdue Detection

Ticket turnaround is governed by category-specific resolution deadlines:

- Admins configure target days per maintenance category (Admin → Settings).
- The system checks open complaints against the threshold:
  $$\text{Overdue} = (\text{status} \neq \text{'resolved'}) \land (\text{current\_time} - \text{created\_at} > \text{Threshold})$$
- Overdue complaints automatically float to the top of triage views with amber indicators.

---

## 5. Role-Based Access & Security

- **Residents**: Can file complaints with photos, track status timeline, comment, submit ratings, and remove/withdraw their own tickets.
- **Staff Technicians**: Assigned specific tickets; can update status to _In Progress_ or _Resolved_ with mandatory notes.
- **Society Admins**: Full triage control, technician assignment, notice publishing, resident directory management, and system settings.
- **Route Guarding**: TanStack Router `beforeLoad` checks session state on all `/_authenticated/*` routes and redirects unauthorized roles.
- **Secret Isolation**: `DATABASE_URL`, `AUTH_SECRET`, and `RESEND_API_KEY` execute exclusively within server functions.

---

## 6. Email Notifications

- **Status Updates**: When a technician or admin updates ticket status, a transactional email is sent to the resident with the resolution note.
- **Important Notices**: Publishing a pinned society notice broadcasts an email notification to all registered residents.
