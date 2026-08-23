import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  ChartBar,
  Buildings,
  Check,
  CaretDown,
  Drop,
  Stack,
  PushPin,
  ShieldCheck,
  Sparkle,
  Star,
  Timer,
  Users,
  Wrench,
  Lightning,
  Clock,
  ChatCircleDots,
} from "@phosphor-icons/react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SocietyDesk — Maintenance Complaints for Housing Societies" },
      {
        name: "description",
        content:
          "SocietyDesk helps apartment residents raise maintenance complaints with photos and lets society managers track, prioritize, and resolve issues on time.",
      },
      { property: "og:title", content: "SocietyDesk — Society Maintenance Made Simple" },
      {
        property: "og:description",
        content:
          "Raise complaints with photos, track repairs, get overdue reminders, and read society notices.",
      },
    ],
  }),
  component: SocietyDeskLanding,
});

const SCENARIOS = [
  {
    id: "elevator",
    label: "Tower B Lift Issue",
    prompt:
      "Water dripping in Tower B lift shaft. Need emergency technician to inspect and fix before evening rush.",
    workflow: [
      { done: true, text: "CHECK PAST LIFT COMPLAINTS" },
      { done: true, text: "CREATE WORK ORDER #104" },
      { done: true, text: "SET PRIORITY: HIGH" },
      { done: false, text: "ASSIGN OTIS LIFT TEAM" },
      { done: false, text: "NOTIFY TOWER B RESIDENTS" },
      { done: false, text: "SEND EMAIL UPDATE" },
    ],
    rules: [
      { title: "TOWER B RESIDENTS", desc: "Notice posted on society board" },
      { title: "TARGET FIX TIME", desc: "4 hours (Urgent lift repairs)" },
      { title: "OVERDUE ALERT", desc: "Alerts manager if delayed past deadline" },
    ],
    resolution: {
      tag: "FIXED IN 1 HOUR 45 MINS",
      title: "Tower B Lift Repaired & Tested",
      desc: "Water seal replaced and lift tested for 15 round trips. Working normally.",
      action: "View repair details",
    },
  },
  {
    id: "water",
    label: "Basement Water Pump",
    prompt:
      "Main water pump valve leaking near parking slot 14. Plumber needed to tighten connection.",
    workflow: [
      { done: true, text: "LOG PLUMBING COMPLAINT" },
      { done: true, text: "ASSIGN SOCIETY PLUMBER" },
      { done: true, text: "SET PRIORITY: MEDIUM" },
      { done: false, text: "CLOSE MAIN VALVE 4B" },
      { done: false, text: "POST WATER NOTICE" },
      { done: false, text: "UPDATE REPAIR TIMELINE" },
    ],
    rules: [
      { title: "TOWERS A & B AFFECTED", desc: "Switched to backup water tank" },
      { title: "TARGET FIX TIME", desc: "24 hours standard plumbing" },
      { title: "RESIDENT NOTIFICATION", desc: "Email sent with repair update" },
    ],
    resolution: {
      tag: "FIXED IN 50 MINS",
      title: "Pump Valve Sealed & Checked",
      desc: "Worn gasket replaced and water pressure verified across all floors.",
      action: "View repair details",
    },
  },
];

function SocietyDeskLanding() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const scenario = SCENARIOS[activeScenarioIdx]!;
  const [customPrompt, setCustomPrompt] = useState(scenario.prompt);

  const switchScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setCustomPrompt(SCENARIOS[idx]!.prompt);
  };

  return (
    <div className="min-h-screen bg-[#F6F4ED] text-[#111215] font-sans antialiased selection:bg-[#1F3622] selection:text-white flex flex-col justify-between">
      {/* ── TOP NAVIGATION BAR ──────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E9E6DC]/80 bg-[#F6F4ED]/90 backdrop-blur-md px-6 sm:px-8 py-4">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          {/* Brand Logo */}
          <BrandLogo linkTo="/" />

          {/* Navigation Links */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#4A4D54] md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-[#111215]">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-[#111215]">
              Features
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-[#1F3622] px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#2E4E30]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO & WORKFLOW SECTION ─────────────────────────── */}
      <main className="relative mx-auto w-full max-w-[1400px] flex-1 px-6 sm:px-8 pt-4 pb-16">
        {/* ── 1. HERO BANNER WITH BACKGROUND VIDEO ─────────────── */}
        <div className="relative mb-16 overflow-hidden rounded-3xl border border-[#E9E5DA]/80 bg-[#F6F4ED] p-8 sm:p-12 lg:p-14">
          {/* Background Video */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full origin-center scale-[1.25] object-cover opacity-75 transition-opacity duration-1000"
            >
              <source src="/hero-bg.mp4" type="video/mp4" />
            </video>

            {/* Gradient overlay for clear text reading */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F6F4ED] via-[#F6F4ED]/70 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1F3622]/20 via-transparent to-transparent" />
          </div>

          {/* Foreground Hero Content */}
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-6xl font-medium leading-[0.95] tracking-tight text-[#111215] sm:text-7xl md:text-[82px]">
              The society manager,
              <br />
              multiplied
            </h1>

            <p className="mt-8 max-w-lg text-base leading-relaxed text-[#4A4D54] sm:text-lg">
              SocietyDesk helps residents report maintenance issues with photos and lets society
              managers assign workers, track deadlines, and keep everyone informed through notices
              and email updates.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/auth"
                search={{ mode: "signup" } as never}
                className="rounded-full bg-[#1F3622] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2E4E30]"
              >
                Register as Resident <ArrowRight className="ml-2 inline size-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. INTERACTIVE COMPLAINT WORKFLOW DEMO ──────────── */}
        <div>
          {/* Scenario Toggle */}
          <div className="mb-4 flex items-center justify-end gap-2 text-xs">
            <span className="font-semibold text-[#8E929B] uppercase">Try sample issue:</span>
            {SCENARIOS.map((sc, i) => (
              <button
                key={sc.id}
                onClick={() => switchScenario(i)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  activeScenarioIdx === i
                    ? "bg-[#111215] text-white"
                    : "bg-[#EAE6DA] text-[#4A4D54] hover:bg-[#DDD8CA]"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          <div className="relative min-h-[380px] w-full pt-4">
            {/* Blue Connection Line */}
            <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
              <svg
                className="h-full w-full"
                viewBox="0 0 1340 380"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 16 L 315 16 C 330 16 340 26 340 40 L 340 48 C 340 62 350 72 365 72 L 1340 72"
                  stroke="#1F3622"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* 4 Step Labels */}
            <div className="relative z-10 mb-8 hidden lg:grid grid-cols-12 gap-6 text-xs font-semibold uppercase tracking-wider text-[#4A4D54]">
              <div className="col-span-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3 py-1">
                  <span className="text-[#1F3622]">1.</span> REPORT ISSUE
                </span>
              </div>
              <div className="col-span-3 pl-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3 py-1">
                  <span className="text-[#1F3622]">2.</span> ASSIGN WORKER
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3 py-1">
                  <span className="text-[#1F3622]">3.</span> TRACK DEADLINE
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3 py-1">
                  <span className="text-[#1F3622]">4.</span> VERIFY & RATE
                </span>
              </div>
            </div>

            {/* 4 Columns */}
            <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Col 1: Resident Report Card */}
              <div className="lg:col-span-3">
                <div className="relative flex flex-col justify-between rounded-2xl border border-[#E2DDD0] bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)] min-h-[175px]">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={4}
                    className="w-full resize-none border-none bg-transparent p-0 text-sm leading-relaxed text-[#111215] outline-none"
                  />
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-[#8E929B]">Photo: lift_leak.jpg</span>
                    <Link
                      to="/auth"
                      className="flex size-7 items-center justify-center rounded-lg bg-[#1F3622] text-white shadow-sm hover:scale-105 active:scale-95"
                    >
                      <ArrowUp className="size-4" weight="bold" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Col 2: Task Checklist */}
              <div className="space-y-2 lg:col-span-3 lg:pl-6">
                {scenario.workflow.map((item) => (
                  <div
                    key={item.text}
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                      item.done
                        ? "border-[#DFD9CA] bg-[#F1EDE1] text-[#4A4E58]"
                        : "border-[#E5DFD1] bg-[#F6F4ED] text-[#7C8089]"
                    }`}
                  >
                    <span className="text-[#1F3622] font-bold">{item.done ? "✓" : "•"}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Col 3: Rules & Targets */}
              <div className="space-y-4 lg:col-span-3 lg:pl-4 text-xs leading-relaxed text-[#6D717A]">
                {scenario.rules.map((r) => (
                  <div key={r.title} className="flex items-start gap-2.5">
                    <PushPin className="size-3.5 text-[#1F3622] shrink-0 mt-0.5" weight="fill" />
                    <div>
                      <div className="font-semibold text-[#111215]">{r.title}</div>
                      <div>{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Col 4: Completed Card */}
              <div className="lg:col-span-3 lg:pl-4">
                <div className="relative overflow-hidden rounded-2xl bg-[#111612] shadow-2xl text-white border border-[#1F3622]/40">
                  <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-[#1F3622] via-[#152718] to-[#0D1A0F] p-4 flex flex-col justify-between">
                    <span className="inline-block self-start rounded-full bg-[#2E4E30]/60 border border-[#436C46]/50 px-2.5 py-0.5 text-xs font-bold text-[#B8E2BD] backdrop-blur-md">
                      {scenario.resolution.tag}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <Star className="size-3.5" weight="fill" />
                      <Star className="size-3.5" weight="fill" />
                      <Star className="size-3.5" weight="fill" />
                      <Star className="size-3.5" weight="fill" />
                      <Star className="size-3.5" weight="fill" />
                      <span className="ml-1 text-xs text-[#D1DFD3]">5.0 Star Rating</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-white">
                      {scenario.resolution.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-[#A0A4AE]">
                      {scenario.resolution.desc}
                    </p>
                    <div className="mt-3">
                      <Link
                        to="/auth"
                        className="inline-block rounded-md bg-[#2B2C30] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3B3C40]"
                      >
                        {scenario.resolution.action} →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── 3-STEP EXPLANATION ──────────────────────────────── */}
      <section
        id="how-it-works"
        className="border-t border-[#E8E4D8] bg-[#F1ECE0]/50 py-16 px-6 sm:px-8"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1F3622]">
                STEP 01
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#111215]">Report in 30 Seconds</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5A5E68]">
                Take photos, choose category (Plumbing, Lift, Electric), enter your flat number, and
                submit directly from your phone.
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1F3622]">
                STEP 02
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#111215]">
                Admin Assigns & Sets Priority
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5A5E68]">
                The manager sets priority (Low, Medium, High), writes notes, and tracks due dates so
                repairs are not forgotten.
              </p>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#1F3622]">
                STEP 03
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#111215]">Email Updates & Feedback</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5A5E68]">
                Residents receive emails on every status change. Once repaired, residents rate the
                work 1 to 5 stars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ────────────────────────────────── */}
      <section id="features" className="border-t border-[#E8E4D8] bg-[#F6F4ED] py-20 px-6 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F3622]">
              Built for Societies
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111215] sm:text-4xl">
              Everything your society needs to manage repairs.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-sm">
              <Drop className="size-6 text-[#1F3622] mb-4" weight="fill" />
              <h3 className="font-bold text-[#111215]">Photos with Every Complaint</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#5A5E68]">
                Add up to 3 photos of the leak, crack, or breakdown. Photos compress automatically
                on your phone so uploads are fast.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-sm">
              <Stack className="size-6 text-[#1F3622] mb-4" weight="fill" />
              <h3 className="font-bold text-[#111215]">List and Board Views for Admins</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#5A5E68]">
                Admins can view complaints in a clean list or drag-and-drop Kanban columns (Open, In
                Progress, Resolved).
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-sm">
              <PushPin className="size-6 text-[#1F3622] mb-4" weight="fill" />
              <h3 className="font-bold text-[#111215]">Notice Board & Email Alerts</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#5A5E68]">
                Post important society notices with pinned cards. Residents receive email alerts
                instantly when an urgent notice is published.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-sm">
              <Timer className="size-6 text-[#1F3622] mb-4" weight="fill" />
              <h3 className="font-bold text-[#111215]">Overdue Warnings</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#5A5E68]">
                Set deadline days per category. Delayed complaints turn amber with a blinking alert
                and move to the top of the list.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-sm">
              <ChartBar className="size-6 text-[#1F3622] mb-4" weight="fill" />
              <h3 className="font-bold text-[#111215]">Monthly Repair Reports</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#5A5E68]">
                See total complaints per category, average days to resolve, and watchlists for
                repeat issues (e.g. lift breaking down 3+ times).
              </p>
            </div>

            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-sm">
              <Star className="size-6 text-[#1F3622] mb-4" weight="fill" />
              <h3 className="font-bold text-[#111215]">1 to 5 Star Resident Feedback</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#5A5E68]">
                Residents rate the repair quality once completed so the management committee knows
                which technicians do great work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── REPAIR DEADLINES SECTION ────────────────────────── */}
      <section
        id="deadlines"
        className="border-t border-[#E8E4D8] bg-[#F1ECE0]/50 py-20 px-6 sm:px-8"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F3622]">
                Target Deadlines
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111215] sm:text-4xl">
                Set clear repair timelines. Avoid forgotten complaints.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#5A5E68]">
                You choose how many days each type of repair should take (for example: Lifts = 1
                day, Plumbing = 2 days, Cleaning = 4 days). Any complaint taking longer gets
                highlighted in amber automatically.
              </p>
              <div className="mt-6">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1F3622] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#2E4E30]"
                >
                  Configure Society Settings <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 text-xs space-y-3 shadow-md">
              <div className="flex justify-between border-b pb-2 text-slate-700 font-bold">
                <span>Category</span>
                <span>Target Resolution Time</span>
              </div>
              <div className="flex justify-between">
                <span>Lift & Elevator</span>
                <span className="font-semibold text-red-600">1 Day (Urgent)</span>
              </div>
              <div className="flex justify-between">
                <span>Plumbing & Water Supply</span>
                <span className="font-semibold text-blue-600">2 Days</span>
              </div>
              <div className="flex justify-between">
                <span>Electrical & Power</span>
                <span className="font-semibold text-blue-600">2 Days</span>
              </div>
              <div className="flex justify-between">
                <span>Housekeeping & Common Area</span>
                <span className="font-semibold text-slate-600">4 Days</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-2 border-t text-[11px]">
                <span>Default for other complaints</span>
                <span>3 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E4D8] bg-[#FAF7EE] py-10 px-6 sm:px-8 text-xs text-[#5F6368]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandLogo linkTo="/" variant="footer" />
          <div className="flex gap-6 font-medium">
            <Link to="/auth" className="hover:text-slate-900">
              Resident Login
            </Link>
            <Link to="/auth" search={{ mode: "admin" } as never} className="hover:text-slate-900">
              Admin Login
            </Link>
            <a href="#how-it-works" className="hover:text-slate-900">
              How It Works
            </a>
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#deadlines" className="hover:text-slate-900">
              Deadlines
            </a>
          </div>
          <p>© {new Date().getFullYear()} SocietyDesk. Built for apartment societies.</p>
        </div>
      </footer>
    </div>
  );
}
