import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChartBar,
  Drop,
  Stack,
  PushPin,
  Sparkle,
  Star,
  Timer,
  Wrench,
  Lightning,
  ShieldCheck,
  Airplane,
  Broadcast,
  CheckCircle,
  GearSix,
  Gauge,
  Cpu,
  Warning,
  Eye,
  Sliders,
  Buildings,
} from "@phosphor-icons/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { BrandLogo } from "@/components/brand";
import { TelemetryGlobe } from "@/components/telemetry-globe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SocietyDesk — Intelligent Society Maintenance & Operations Radar" },
      {
        name: "description",
        content:
          "High-tech maintenance telemetry, live complaint tracking, overdue SLA warnings, and notice broadcasts for modern housing societies.",
      },
      { property: "og:title", content: "SocietyDesk — Next-Gen Society Operations" },
      {
        property: "og:description",
        content:
          "Real-time maintenance telemetry, automated work orders, and instant resident alerts.",
      },
    ],
  }),
  component: SocietyDeskLanding,
});

const SCENARIOS = [
  {
    id: "elevator",
    label: "Tower B Lift Telemetry",
    unitBadge: "Flat 402, Tower B",
    prompt:
      "Water dripping in Tower B lift shaft. High priority technician dispatched to inspect and seal before evening rush.",
    workflow: [
      { done: true, text: "CHECK PAST LIFT LOGS" },
      { done: true, text: "CREATE WORK ORDER #104" },
      { done: true, text: "SET PRIORITY: URGENT" },
      { done: false, text: "ASSIGN OTIS LIFT TEAM" },
      { done: false, text: "NOTIFY TOWER B RESIDENTS" },
      { done: false, text: "SEND REALTIME EMAIL" },
    ],
    rules: [
      { title: "TOWER B RESIDENTS", desc: "Notice posted on society board" },
      { title: "TARGET FIX TIME", desc: "4 hours (Urgent lift repairs)" },
      { title: "OVERDUE ALERT", desc: "Alerts manager if delayed past deadline" },
    ],
    resolution: {
      tag: "RESOLVED IN 1H 45M",
      title: "Tower B Lift Sealed & Re-certified",
      desc: "Water seal replaced and lift tested for 15 round trips. Telemetry verified 100% nominal.",
    },
  },
  {
    id: "water",
    label: "Basement Main Pump",
    unitBadge: "Pump House #2, Basement",
    prompt:
      "Main water pump valve pressure anomaly near parking slot 14. Plumber assigned to tighten joint.",
    workflow: [
      { done: true, text: "LOG SENSOR TELEMETRY" },
      { done: true, text: "ASSIGN SOCIETY PLUMBER" },
      { done: true, text: "SET PRIORITY: MEDIUM" },
      { done: false, text: "CLOSE BACKUP VALVE 4B" },
      { done: false, text: "POST WATER NOTICE" },
      { done: false, text: "UPDATE REPAIR STATUS" },
    ],
    rules: [
      { title: "TOWERS A & B AFFECTED", desc: "Switched to secondary reservoir" },
      { title: "TARGET FIX TIME", desc: "24 hours standard plumbing" },
      { title: "RESIDENT NOTIFICATION", desc: "Email sent with repair update" },
    ],
    resolution: {
      tag: "RESOLVED IN 50M",
      title: "Pump Valve Sealed & Checked",
      desc: "Worn gasket replaced and water pressure verified across all floors.",
    },
  },
];

const SOCIETY_FEATURES = [
  {
    id: "photos",
    tag: "Visual Evidence",
    title: "Photos with Every Complaint",
    desc: "Add up to 3 photos of the leak, crack, or breakdown. Photos compress automatically on your phone so uploads are lightning fast.",
    icon: Drop,
    pill: "Auto Compression",
  },
  {
    id: "kanban",
    tag: "Admin Workspace",
    title: "List & Board Views for Admins",
    desc: "Admins can view complaints in a clean list or drag-and-drop Kanban columns (Open, In Progress, Resolved) for rapid triage.",
    icon: Stack,
    pill: "Drag & Drop",
  },
  {
    id: "notices",
    tag: "Broadcast",
    title: "Notice Board & Email Alerts",
    desc: "Post important society notices with pinned priority cards. Residents receive email alerts instantly when an urgent notice is published.",
    icon: PushPin,
    pill: "Pinned Alerts",
  },
  {
    id: "sla",
    tag: "SLA Tracker",
    title: "Automated Overdue Warnings",
    desc: "Set deadline days per category. Delayed complaints turn amber with a blinking alert and auto-surface to the top of the triage list.",
    icon: Timer,
    pill: "Live Alert",
  },
  {
    id: "analytics",
    tag: "Intelligence",
    title: "Monthly Repair Reports",
    desc: "See total complaints per category, average days to resolve, and watchlists for repeat issues (e.g. lift breaking down 3+ times).",
    icon: ChartBar,
    pill: "30-Day Trends",
  },
  {
    id: "feedback",
    tag: "Resident Voice",
    title: "1 to 5 Star Resident Feedback",
    desc: "Residents rate the repair quality once completed so the management committee knows which technicians deliver great work.",
    icon: Star,
    pill: "5-Star Rating",
  },
];

export function SocietyDeskLanding() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const scenario = SCENARIOS[activeScenarioIdx]!;
  const [simulatedAlert, setSimulatedAlert] = useState<string | null>(null);
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerLiveSim = () => {
    setSimulatedAlert("INCIDENT DISPATCHED: Tower B Elevator Sensor Alert (Code #8845)");
    setTimeout(() => setSimulatedAlert(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#060D08] font-sans text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
      {/* ── TOP HUD COMMAND BAR ───────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#08120B]/90 px-4 py-3 backdrop-blur-lg sm:px-8">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between">
          {/* Brand Logo & DataV Monogram */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                DATAV
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-emerald-300">
                SOCIETYDESK // OPS-GRID
              </span>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-800/40 bg-emerald-950/40 px-3 py-1 text-[11px] font-mono text-emerald-400 md:flex">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYS 100% ONLINE</span>
              <span className="text-emerald-700">|</span>
              <span className="text-emerald-300/80">{timeString}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 font-mono text-xs font-medium text-emerald-200/70 sm:gap-8">
            <a href="#radar" className="transition-colors hover:text-emerald-300">
              [ 01 RADAR ]
            </a>
            <a href="#features" className="transition-colors hover:text-emerald-300">
              [ 02 FEATURES ]
            </a>
            <a href="#simulation" className="transition-colors hover:text-emerald-300">
              [ 03 SIMULATION ]
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="hidden rounded-md border border-emerald-700/50 bg-emerald-950/40 px-4 py-1.5 font-mono text-xs text-emerald-300 transition-all hover:border-emerald-500 hover:bg-emerald-900/60 sm:inline-flex"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" } as never}
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-1.5 font-mono text-xs font-bold text-black shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-all hover:brightness-110"
            >
              Register Resident <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 3D HOLOGRAPHIC TELEMETRY RADAR HERO (DATAV HUD) ─── */}
      <section
        id="radar"
        className="relative overflow-hidden border-b border-emerald-900/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0A1A10] via-[#060D08] to-[#040805] px-4 py-6 sm:px-8 sm:py-10"
      >
        {/* Background Grid Lines & Circuit Watermark */}
        <div className="pointer-events-none absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Live Simulation Alert Bar */}
        {simulatedAlert && (
          <div className="mx-auto mb-6 max-w-4xl rounded-lg border border-amber-500/50 bg-amber-950/80 p-3 font-mono text-xs text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Warning className="size-4 text-amber-400" />
              {simulatedAlert}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-amber-400">
              DISPATCH ACTIVE
            </span>
          </div>
        )}

        <div className="relative mx-auto max-w-[1700px]">
          {/* Main Grid: Left HUD + Center 3D Globe + Right HUD */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch min-h-[640px]">
            {/* ── LEFT HUD FLANK (4 Cols) ───────────────────── */}
            <div className="flex flex-col justify-between gap-5 lg:col-span-3">
              {/* Card 1: Dispatch Radar & Counts */}
              <div className="rounded-xl border border-emerald-800/30 bg-[#09150E]/80 p-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Airplane className="size-3.5" /> Live Dispatch Radar
                  </span>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400 border border-emerald-800/40">
                    REALTIME
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 font-mono">
                  <div className="rounded-lg bg-[#050C07] border border-emerald-900/30 p-2.5">
                    <div className="text-[10px] text-emerald-400/60 uppercase">Resolved Total</div>
                    <div className="text-xl font-bold text-emerald-300">28,869</div>
                  </div>
                  <div className="rounded-lg bg-[#050C07] border border-emerald-900/30 p-2.5">
                    <div className="text-[10px] text-emerald-400/60 uppercase">In Progress</div>
                    <div className="text-xl font-bold text-cyan-300">9,865</div>
                  </div>
                  <div className="rounded-lg bg-[#050C07] border border-emerald-900/30 p-2.5">
                    <div className="text-[10px] text-emerald-400/60 uppercase">Urgent SLA</div>
                    <div className="text-xl font-bold text-amber-400">386</div>
                  </div>
                  <div className="rounded-lg bg-[#050C07] border border-emerald-900/30 p-2.5">
                    <div className="text-[10px] text-emerald-400/60 uppercase">On-Duty Techs</div>
                    <div className="text-xl font-bold text-emerald-200">98</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Waveform Flow Chart */}
              <div className="rounded-xl border border-emerald-800/30 bg-[#09150E]/80 p-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Hourly Resident Influx
                  </span>
                  <span className="font-mono text-[10px] text-emerald-500">24H CYCLE</span>
                </div>

                <div className="mt-3">
                  {/* SVG Waveform Curve matching Alibaba DataV reference */}
                  <svg className="h-20 w-full overflow-visible" viewBox="0 0 300 80" fill="none">
                    <defs>
                      <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 55 Q 40 20 80 45 T 160 30 T 240 50 T 300 25 L 300 80 L 0 80 Z"
                      fill="url(#waveGrad)"
                    />
                    <path
                      d="M 0 55 Q 40 20 80 45 T 160 30 T 240 50 T 300 25"
                      stroke="#34d399"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="160" cy="30" r="3.5" fill="#6ee7b7" className="animate-ping" />
                    <circle cx="160" cy="30" r="2.5" fill="#ffffff" />
                  </svg>
                </div>
              </div>

              {/* Card 3: Live Dispatch Ticker Matrix */}
              <div className="rounded-xl border border-emerald-800/30 bg-[#09150E]/80 p-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Category Triage Matrix
                  </span>
                  <span className="font-mono text-[10px] text-emerald-500">EFFICIENCY</span>
                </div>

                <div className="mt-3 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      Elevators
                    </span>
                    <span className="text-emerald-400">98.4%</span>
                    <span className="text-slate-400">1.2h avg</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      Plumbing
                    </span>
                    <span className="text-cyan-400">96.8%</span>
                    <span className="text-slate-400">2.4h avg</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      Electrical
                    </span>
                    <span className="text-amber-400">99.1%</span>
                    <span className="text-slate-400">0.8h avg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CENTER 3D GLOBE HERO CANVAS (6 Cols) ───────── */}
            <div className="relative flex flex-col items-center justify-between rounded-2xl border border-emerald-800/40 bg-[#07130B]/60 p-6 backdrop-blur-sm lg:col-span-6 shadow-[inset_0_0_40px_rgba(16,185,129,0.05)]">
              {/* Corner Sci-Fi Tech Brackets */}
              <div className="pointer-events-none absolute top-3 left-3 size-4 border-t-2 border-l-2 border-emerald-500" />
              <div className="pointer-events-none absolute top-3 right-3 size-4 border-t-2 border-r-2 border-emerald-500" />
              <div className="pointer-events-none absolute bottom-3 left-3 size-4 border-b-2 border-l-2 border-emerald-500" />
              <div className="pointer-events-none absolute bottom-3 right-3 size-4 border-b-2 border-r-2 border-emerald-500" />

              {/* Top Hero Title Over Globe */}
              <div className="relative z-20 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-mono font-semibold text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <Broadcast className="size-3.5 text-emerald-400 animate-pulse" />
                  SOCIETY OPERATIONAL GRID v3.0
                </div>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl font-sans">
                  The Intelligent Society
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(16,185,129,0.4)]">
                    Operations Platform
                  </span>
                </h1>

                <p className="mt-2.5 max-w-xl text-xs sm:text-sm text-emerald-200/70 font-mono">
                  Real-time maintenance telemetry, automated work orders, instant resident alerts,
                  and predictive society analytics.
                </p>
              </div>

              {/* 3D Holographic Globe Canvas Container */}
              <div className="relative h-[340px] sm:h-[380px] w-full my-2">
                <TelemetryGlobe />
              </div>

              {/* Bottom Interactive Controls */}
              <div className="relative z-20 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/auth"
                  search={{ mode: "signup" } as never}
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-7 py-3 font-mono text-xs font-bold text-black shadow-[0_0_24px_rgba(16,185,129,0.5)] transition-all hover:scale-105 hover:brightness-110"
                >
                  Register as Resident <ArrowRight className="ml-1.5 inline size-4" />
                </Link>

                <button
                  onClick={triggerLiveSim}
                  className="rounded-full border border-emerald-500/40 bg-emerald-950/60 px-5 py-3 font-mono text-xs font-semibold text-emerald-300 backdrop-blur-sm transition-all hover:bg-emerald-900/60 hover:border-emerald-400 cursor-pointer shadow-[0_0_14px_rgba(16,185,129,0.15)]"
                >
                  ⚡ Simulate Incident Ping
                </button>

                <Link
                  to="/auth"
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 font-mono text-xs font-semibold text-slate-300 transition-all hover:bg-slate-800"
                >
                  Admin Console
                </Link>
              </div>
            </div>

            {/* ── RIGHT HUD FLANK (3 Cols) ──────────────────── */}
            <div className="flex flex-col justify-between gap-5 lg:col-span-3">
              {/* Card 1: Early Warning & Security Radar */}
              <div className="rounded-xl border border-emerald-800/30 bg-[#09150E]/80 p-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5" /> SLA Early Warning
                  </span>
                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400 border border-emerald-800/40">
                    GUARD // 007
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-around py-2">
                  <div className="text-center font-mono">
                    <div className="relative flex size-14 items-center justify-center rounded-full border-2 border-emerald-500/60 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      <span className="text-xs font-bold text-emerald-300">99.4%</span>
                    </div>
                    <span className="mt-1.5 block text-[10px] text-emerald-400/70">
                      On-Time SLA
                    </span>
                  </div>

                  <div className="text-center font-mono">
                    <div className="relative flex size-14 items-center justify-center rounded-full border-2 border-amber-500/60 bg-amber-950/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                      <span className="text-xs font-bold text-amber-300">0</span>
                    </div>
                    <span className="mt-1.5 block text-[10px] text-amber-400/70">Breaches</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Peak Activity Distribution */}
              <div className="rounded-xl border border-emerald-800/30 bg-[#09150E]/80 p-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Maintenance Peak Curve
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400">TELEMETRY</span>
                </div>

                <div className="mt-3">
                  {/* Mountain Wave Distribution */}
                  <svg className="h-16 w-full overflow-visible" viewBox="0 0 300 60" fill="none">
                    <path
                      d="M 0 50 Q 50 10 100 40 T 200 15 T 300 45 L 300 60 L 0 60 Z"
                      fill="#0e3820"
                      opacity="0.6"
                    />
                    <path
                      d="M 0 50 Q 50 10 100 40 T 200 15 T 300 45"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="mt-2 flex justify-between font-mono text-[9px] text-slate-400">
                    <span>00:00</span>
                    <span>08:00</span>
                    <span>16:00</span>
                    <span>24:00</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Weekly Latency Heatmap Matrix */}
              <div className="rounded-xl border border-emerald-800/30 bg-[#09150E]/80 p-4 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between border-b border-emerald-900/40 pb-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Weekly Latency Matrix
                  </span>
                  <span className="font-mono text-[10px] text-emerald-500">7-DAY</span>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-1.5 text-center font-mono">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] text-emerald-400/60">{d}</span>
                      <div
                        className={`size-4 rounded-full transition-all ${
                          i === 2 || i === 5
                            ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                            : i === 4
                              ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                              : "bg-emerald-800/60"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Ticker Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-emerald-900/40 pt-4 font-mono text-[11px] text-emerald-400/60">
            <div className="flex items-center gap-4">
              <span>■ 48112</span>
              <span>■ 78454</span>
              <span>■ 22991</span>
              <span>■ 43965</span>
              <span>■ 84521</span>
            </div>
            <div className="hidden sm:block text-emerald-500">
              // data.societydesk.com/visual/datav/v3
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-300">LAT: 28.6139° N</span>
              <span className="text-emerald-300">LON: 77.2090° E</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: INTERACTIVE COMPLAINT SIMULATION ──────── */}
      <section
        id="simulation"
        className="border-b border-emerald-900/30 bg-[#09150E] py-16 px-4 sm:px-8"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                [ 03 WORKFLOW SIMULATION ]
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl font-sans">
                Experience the 4-Step Society Triage Cycle
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-emerald-400/70">SWITCH SAMPLE:</span>
              {SCENARIOS.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenarioIdx(i)}
                  className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold transition-all cursor-pointer ${
                    activeScenarioIdx === i
                      ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Step 1: Resident Incident Input */}
            <div className="rounded-2xl border border-emerald-800/30 bg-[#060D08] p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  STEP 01 // RESIDENT INPUT
                </span>
                <div className="mt-2 inline-block rounded bg-emerald-950 px-2 py-0.5 font-mono text-xs text-emerald-300 border border-emerald-800/40">
                  {scenario.unitBadge}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-emerald-100/80 font-mono">
                  "{scenario.prompt}"
                </p>
              </div>

              <div className="mt-6 border-t border-emerald-900/40 pt-4 flex items-center justify-between font-mono text-[11px] text-emerald-400/70">
                <span className="flex items-center gap-1">
                  <CheckCircle className="size-3.5 text-emerald-400" /> Photo Attached
                </span>
                <span>Auto-Compressed</span>
              </div>
            </div>

            {/* Step 2: Automated Dispatch Rules */}
            <div className="rounded-2xl border border-emerald-800/30 bg-[#060D08] p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  STEP 02 // RULES & DEADLINES
                </span>
                <div className="mt-3 space-y-2.5 font-mono text-xs">
                  {scenario.rules.map((r, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-emerald-950/30 p-2 border border-emerald-900/30"
                    >
                      <div className="text-[10px] text-cyan-300 font-bold">{r.title}</div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-emerald-900/40 pt-4 font-mono text-[11px] text-cyan-400">
                SLA Trigger: 100% Guaranteed
              </div>
            </div>

            {/* Step 3: Admin Triage & Worker Actions */}
            <div className="rounded-2xl border border-emerald-800/30 bg-[#060D08] p-6 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  STEP 03 // DISPATCH PIPELINE
                </span>
                <div className="mt-3 space-y-1.5 font-mono text-xs">
                  {scenario.workflow.map((w, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 rounded px-2.5 py-1.5 ${
                        w.done
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                          : "bg-slate-900/40 text-slate-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${w.done ? "bg-emerald-400" : "bg-slate-600"}`}
                      />
                      <span className="text-[11px]">{w.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-emerald-900/40 pt-4 font-mono text-[11px] text-amber-400">
                Worker Assigned Instantly
              </div>
            </div>

            {/* Step 4: Resolution & Verification */}
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[#0B1E12] to-[#060D08] p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div>
                <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  STEP 04 // RESOLUTION
                </span>
                <div className="mt-2 inline-block rounded bg-emerald-500 px-2 py-0.5 font-mono text-xs font-bold text-black">
                  {scenario.resolution.tag}
                </div>
                <h3 className="mt-3 text-sm font-bold text-white font-sans">
                  {scenario.resolution.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-emerald-100/70 font-mono">
                  {scenario.resolution.desc}
                </p>
              </div>

              <div className="mt-6 border-t border-emerald-900/40 pt-4 flex items-center justify-between font-mono text-xs text-amber-400">
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" /> 5.0 Star Rating
                </span>
                <span className="text-emerald-400">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: FEATURES GRID ─────────────────────────── */}
      <section
        id="features"
        className="border-b border-emerald-900/30 bg-[#060D08] py-20 px-4 sm:px-8"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 max-w-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              [ 02 BUILT FOR SOCIETIES ]
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-sans">
              Everything your society needs to manage repairs.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SOCIETY_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-emerald-900/40 bg-[#09150E] p-7 shadow-lg transition-all duration-200 hover:border-emerald-500/60 hover:shadow-[0_0_24px_rgba(16,185,129,0.15)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        {item.tag}
                      </span>
                      <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                        <Icon className="size-6" weight="fill" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white font-sans leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-emerald-100/70 font-mono">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-emerald-900/40 pt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-800/50 bg-emerald-950/60 px-3 py-1 font-mono text-xs text-emerald-300">
                      <Sparkle className="size-3 text-emerald-400" weight="fill" />
                      {item.pill}
                    </span>
                    <span className="font-mono text-xs text-emerald-600">Core Engine</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-emerald-950 bg-[#040905] py-12 px-6 sm:px-8 font-mono text-xs text-emerald-400/60">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
              SD
            </div>
            <span className="font-bold text-white tracking-wider">SOCIETYDESK</span>
          </div>

          <div className="flex flex-wrap items-center gap-8 font-medium text-emerald-300/80">
            <a href="#radar" className="transition-colors hover:text-white">
              Telemetry Radar
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#simulation" className="transition-colors hover:text-white">
              Simulation
            </a>
            <Link to="/auth" className="transition-colors hover:text-white">
              Sign In
            </Link>
          </div>

          <p className="text-xs text-emerald-500/50">
            © {new Date().getFullYear()} SocietyDesk Ops-Grid. Built for apartment societies.
          </p>
        </div>
      </footer>
    </div>
  );
}
