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
    image: "/demo/lift-repair.jpg",
    photoLabel: "Photo: lift_shaft_leak.jpg",
    unitBadge: "Flat 402, Tower B",
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
    image: "/demo/pump-repair.jpg",
    photoLabel: "Photo: basement_valve_leak.jpg",
    unitBadge: "Parking B-14, Tower A",
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
    <div className="flex min-h-screen flex-col justify-between bg-[#F6F4ED] font-sans text-[#111215] antialiased selection:bg-[#1F3622] selection:text-white">
      {/* ── TOP NAVIGATION BAR ──────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-[#E9E6DC]/80 bg-[#F6F4ED]/90 px-6 py-4 backdrop-blur-md sm:px-8">
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
      <main className="relative mx-auto w-full max-w-[1400px] flex-1 px-6 pt-4 pb-16 sm:px-8">
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
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B707B]">
              Interactive Simulation
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#8E929B] uppercase">Try sample issue:</span>
              {SCENARIOS.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => switchScenario(i)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    activeScenarioIdx === i
                      ? "bg-[#111215] text-white shadow-sm scale-105"
                      : "bg-[#EAE6DA] text-[#4A4D54] hover:bg-[#DFDACB]"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[380px] w-full pt-2">
            {/* Connecting Flow Line */}
            <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
              <svg
                className="h-full w-full"
                viewBox="0 0 1340 380"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 18 L 315 18 C 330 18 340 28 340 42 L 340 50 C 340 64 350 74 365 74 L 1340 74"
                  stroke="#1F3622"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6 3"
                />
              </svg>
            </div>

            {/* 4 Step Labels */}
            <div className="relative z-10 mb-7 hidden grid-cols-12 gap-6 text-xs font-semibold uppercase tracking-wider text-[#4A4D54] lg:grid">
              <div className="col-span-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
                  <span className="font-bold text-[#1F3622]">1.</span> REPORT ISSUE
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
                  <span className="font-bold text-[#1F3622]">2.</span> ASSIGN WORKER
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
                  <span className="font-bold text-[#1F3622]">3.</span> TRACK DEADLINE
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
                  <span className="font-bold text-[#1F3622]">4.</span> VERIFY & RATE
                </span>
              </div>
            </div>

            {/* 4 Columns */}
            <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Col 1: Resident Report Card */}
              <div className="lg:col-span-3">
                <div className="relative flex min-h-[220px] flex-col justify-between rounded-2xl border border-[#E2DDD0] bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)]">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E929B]">
                        Resident Ticket
                      </span>
                      <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        {scenario.unitBadge}
                      </span>
                    </div>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      rows={3}
                      className="w-full resize-none border-none bg-transparent p-0 text-sm leading-relaxed text-[#111215] outline-none"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="size-7 shrink-0 overflow-hidden rounded-md border border-slate-200 shadow-xs">
                        <img
                          src={scenario.image}
                          alt="Thumbnail"
                          className="size-full object-cover"
                        />
                      </div>
                      <span className="max-w-[130px] truncate text-xs font-medium text-[#6B707B]">
                        {scenario.photoLabel}
                      </span>
                    </div>
                    <Link
                      to="/auth"
                      className="flex size-7 items-center justify-center rounded-lg bg-[#1F3622] text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                      title="Submit issue"
                    >
                      <ArrowUp className="size-4" weight="bold" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Col 2: Task Checklist */}
              <div className="space-y-2 lg:col-span-3 lg:pl-4">
                {scenario.workflow.map((item) => (
                  <div
                    key={item.text}
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                      item.done
                        ? "border-[#DFD9CA] bg-[#F1EDE1] text-[#3F434D] shadow-xs"
                        : "border-[#E8E2D6] bg-[#F8F6F0] text-[#7C8089]"
                    }`}
                  >
                    <span
                      className={`flex size-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        item.done ? "bg-[#1F3622] text-white" : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {item.done ? "✓" : "•"}
                    </span>
                    <span className="tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Col 3: Rules & Targets */}
              <div className="space-y-3.5 text-xs leading-relaxed text-[#6D717A] lg:col-span-3 lg:pl-4">
                {scenario.rules.map((r) => (
                  <div
                    key={r.title}
                    className="flex items-start gap-3 rounded-xl border border-[#E5DFCFC0] bg-white/70 p-3 shadow-xs"
                  >
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#EDF3EA] text-[#1F3622]">
                      <PushPin className="size-3.5" weight="fill" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#111215]">{r.title}</div>
                      <div className="mt-0.5 text-slate-600">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Col 4: Completed Card with Photo Header */}
              <div className="lg:col-span-3 lg:pl-4">
                <div className="group relative overflow-hidden rounded-2xl border border-[#233827] bg-[#0E1510] text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition-all hover:border-[#3A5C40]">
                  {/* Photo Header */}
                  <div className="relative h-36 w-full overflow-hidden">
                    <img
                      src={scenario.image}
                      alt={scenario.resolution.title}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Gradient Overlay Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1510] via-[#0E1510]/40 to-black/30" />

                    {/* Status Badge Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/85 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-emerald-300 shadow-sm backdrop-blur-md">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {scenario.resolution.tag}
                      </span>
                    </div>

                    {/* Star Rating Overlay */}
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs text-amber-400">
                      <div className="flex">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className="size-3.5" weight="fill" />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-slate-200">
                        5.0 Star Rating
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 pt-3">
                    <h4 className="text-sm font-semibold tracking-tight text-white">
                      {scenario.resolution.title}
                    </h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-300/85">
                      {scenario.resolution.desc}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <Link
                        to="/auth"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                      >
                        {scenario.resolution.action} <ArrowRight className="size-3.5" />
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400">
                        WO #{activeScenarioIdx === 0 ? "104" : "109"}
                      </span>
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
