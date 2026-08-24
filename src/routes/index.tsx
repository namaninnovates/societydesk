import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUp,
  ChartBar,
  Drop,
  Stack,
  PushPin,
  Star,
  Timer,
} from "@phosphor-icons/react";
import { useState, useEffect, useRef, useCallback } from "react";
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
      { done: true, text: "Check past lift reports" },
      { done: true, text: "Create ticket #104" },
      { done: true, text: "Set priority: High" },
      { done: false, text: "Assign lift technician" },
      { done: false, text: "Notify Tower B residents" },
      { done: false, text: "Send email update" },
    ],
    rules: [
      { title: "Tower B Residents", desc: "Notice posted on society board" },
      { title: "Target Deadline", desc: "4 hours (Emergency lift repair)" },
      { title: "Overdue Warning", desc: "Alerts manager if delayed past deadline" },
    ],
    resolution: {
      tag: "RESOLVED IN 1H 45M",
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
      { done: true, text: "Log plumbing complaint" },
      { done: true, text: "Assign society plumber" },
      { done: true, text: "Set priority: Medium" },
      { done: false, text: "Close main valve 4B" },
      { done: false, text: "Post water notice" },
      { done: false, text: "Update repair timeline" },
    ],
    rules: [
      { title: "Towers A & B", desc: "Switched to backup water supply" },
      { title: "Target Deadline", desc: "24 hours standard plumbing" },
      { title: "Resident Notice", desc: "Email sent with repair schedule" },
    ],
    resolution: {
      tag: "RESOLVED IN 50M",
      title: "Pump Valve Sealed & Checked",
      desc: "Worn gasket replaced and water pressure verified across all floors.",
      action: "View repair details",
    },
  },
];

const SOCIETY_FEATURES = [
  {
    id: "photos",
    tag: "Photos",
    title: "Photos with Every Complaint",
    desc: "Add up to 3 photos of the leak, electrical issue, or breakdown directly from your phone.",
    icon: Drop,
    pill: "Photo Uploads",
  },
  {
    id: "kanban",
    tag: "Triage",
    title: "List & Kanban Views for Admins",
    desc: "Admins can view complaints in a clean list or drag cards across Open, In Progress, and Resolved columns.",
    icon: Stack,
    pill: "Kanban Board",
  },
  {
    id: "notices",
    tag: "Notices",
    title: "Notice Board & Email Alerts",
    desc: "Post society notices with pinned priority cards. Residents receive email alerts for important notices.",
    icon: PushPin,
    pill: "Email Alerts",
  },
  {
    id: "deadlines",
    tag: "Deadlines",
    title: "Resolution Deadlines",
    desc: "Set target days per category. Delayed complaints turn amber and auto-surface to the top of the triage list.",
    icon: Timer,
    pill: "Auto Escalation",
  },
  {
    id: "analytics",
    tag: "Reports",
    title: "Monthly Repair Reports",
    desc: "Track complaints by category, average days to resolve, and watchlists for repeat maintenance issues.",
    icon: ChartBar,
    pill: "Monthly Metrics",
  },
  {
    id: "feedback",
    tag: "Feedback",
    title: "Resident Ratings & Feedback",
    desc: "Residents rate completed repairs from 1 to 5 stars so the committee knows technician performance.",
    icon: Star,
    pill: "Star Ratings",
  },
];

function PinnedFeaturesCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const calculateScroll = useCallback(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const totalScrollDistance = rect.height - windowHeight;

    if (totalScrollDistance <= 0) return;

    const currentScroll = -rect.top;
    const progress = Math.min(Math.max(currentScroll / totalScrollDistance, 0), 1);
    setScrollProgress(progress);

    const trackWidth = trackRef.current.scrollWidth;
    const containerWidth = trackRef.current.parentElement?.clientWidth || window.innerWidth;
    const maxShift = Math.max(trackWidth - containerWidth, 0);
    setMaxTranslate(maxShift);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(calculateScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    calculateScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [calculateScroll]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative h-[180vh] border-t border-[#E8E4D8] bg-[#F6F4ED]"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden px-6 sm:px-8">
        <div className="mx-auto w-full max-w-[1400px]">
          {/* Header */}
          <div className="mb-8 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F3622]">
              Built for Societies
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#111215] sm:text-4xl">
              Everything your society needs to manage repairs.
            </h2>
          </div>

          {/* Horizontal Track translated by vertical scroll */}
          <div
            ref={trackRef}
            className="flex gap-6 will-change-transform"
            style={{
              transform: `translateX(-${scrollProgress * maxTranslate}px)`,
              transition: "transform 0.08s cubic-bezier(0.2, 0.8, 0.4, 1)",
            }}
          >
            {SOCIETY_FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="w-[280px] max-w-[85vw] sm:w-[360px] lg:w-[390px] shrink-0 rounded-3xl border border-[#DFD9CA] bg-white p-5 sm:p-7 shadow-sm transition-all duration-200 flex flex-col justify-between hover:border-[#1F3622] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#687063]">
                        {item.tag}
                      </div>
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#EDF4EE] text-[#1F3622]">
                        <Icon className="size-6" weight="fill" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-[#111215] leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#5A5E68]">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#F0EBE0] pt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold bg-[#FAF7EE] border-[#E2DDD0] text-[#1F3622]">
                      {item.pill}
                    </span>
                    <span className="text-xs font-medium text-[#7C8074]">SocietyDesk</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const SCRAMBLE_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%&*_-=+";

function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    const len = text.length;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const resolvedCount = Math.floor(progress * len);

        let result = "";
        for (let i = 0; i < len; i++) {
          if (i < resolvedCount) {
            result += text[i];
          } else if (text[i] === " ") {
            result += " ";
          } else {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }

        setDisplayed(result);

        if (frame >= totalFrames) {
          clearInterval(interval);
          setDisplayed(text);
        }
      }, 35);

      return () => clearInterval(interval);
    }, 200);

    return () => clearTimeout(timeout);
  }, [text]);

  return <span className={className}>{displayed}</span>;
}

function SocietyDeskLanding() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const scenario = SCENARIOS[activeScenarioIdx]!;
  const [customPrompt, setCustomPrompt] = useState(scenario.prompt);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const switchScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setCustomPrompt(SCENARIOS[idx]!.prompt);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F4ED] font-sans text-[#111215] antialiased selection:bg-[#1F3622] selection:text-white">
      <header className="sticky top-0 z-50 w-full border-b border-[#E9E6DC]/80 bg-[#F6F4ED]/90 px-4 py-3.5 backdrop-blur-md sm:px-8 sm:py-4">
        <div className="mx-auto flex items-center justify-between sm:grid sm:max-w-[1400px] sm:grid-cols-3">
          {/* Left: Navigation Links */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#4A4D54] sm:flex sm:gap-8">
            <a href="#features" className="transition-colors hover:text-[#111215]">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-[#111215]">
              How it works
            </a>
          </nav>

          {/* Center: Brand Logo */}
          <div className="flex sm:justify-center">
            <BrandLogo linkTo="/" />
          </div>

          {/* Right: CTA Button */}
          <div className="flex items-center justify-end gap-3">
            <Link
              to="/auth"
              className="rounded-full bg-[#1F3622] px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#2E4E30] sm:px-6 sm:py-2.5 sm:text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-[1400px] flex-1 px-4 pt-3 pb-16 sm:px-8 sm:pt-4">
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-[#E9E5DA]/80 bg-[#F6F4ED] p-6 sm:mb-16 sm:p-12 lg:p-14">
          {/* Background Video */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster="/hero-bg-poster.jpg"
              preload="auto"
              className="h-full w-full origin-center scale-[1.25] object-cover opacity-80"
            >
              <source src="/hero-bg.mp4" type="video/mp4" />
            </video>

            {/* Gradient overlay for clear text reading */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F6F4ED] via-[#F6F4ED]/70 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#1F3622]/20 via-transparent to-transparent" />
          </div>

          {/* Foreground Hero Content */}
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-[#111215] sm:text-6xl md:text-7xl lg:text-[76px] sm:leading-[0.98]">
              <span className="font-light text-[#111215]/90">Maintenance complaints,</span>
              <br />
              <ScrambleText text="resolved on time." className="font-bold text-[#1F3622]" />
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#4A4D54] sm:mt-8 sm:text-base md:text-lg">
              SocietyDesk replaces lost WhatsApp messages and paper registers with an organized,
              photo-enabled complaint desk for residents, technicians, and society management.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
              <Link
                to="/auth"
                search={{ mode: "signup" } as never}
                className="rounded-full bg-[#1F3622] px-6 py-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#2E4E30] sm:px-8 sm:py-3.5 sm:text-sm"
              >
                Register as Resident <ArrowRight className="ml-2 inline size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div>
          {/* Scenario Toggle */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B707B]">
              Interactive Preview
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
            {/* Connecting Animated Flow Line */}
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
                  className="animate-flow-dash"
                />
              </svg>
            </div>

            {/* 4 Step Labels */}
            <div className="relative z-10 mb-7 hidden grid-cols-12 gap-6 text-xs font-semibold uppercase tracking-wider text-[#4A4D54] lg:grid">
              <div className="col-span-3">
                <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
                  <span className="font-bold text-[#1F3622]">1.</span> REPORT ISSUE
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
                  <span className="font-bold text-[#1F3622]">2.</span> ASSIGN WORKER
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
                  <span className="font-bold text-[#1F3622]">3.</span> TRACK DEADLINE
                </span>
              </div>
              <div className="col-span-3 pl-4">
                <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-[#D5D2C7] bg-[#ECE9DE] px-3.5 py-1 shadow-xs">
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
                    className="flex items-start gap-3 rounded-xl border border-[#DFD9CA] bg-white p-3 shadow-xs"
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

      <PinnedFeaturesCarousel />

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

            <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 text-xs space-y-3 shadow-xs">
              <div className="flex justify-between border-b border-[#DFD9CA] pb-2 text-[#111215] font-bold">
                <span>Category</span>
                <span>Target Resolution Time</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Lift & Elevator</span>
                <span className="font-semibold text-[#1F3622]">1 Day (High Priority)</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Plumbing & Water Supply</span>
                <span className="font-semibold text-[#3E4D28]">2 Days</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Electrical & Power</span>
                <span className="font-semibold text-[#3E4D28]">2 Days</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Housekeeping & Common Area</span>
                <span className="font-semibold text-[#5A5E68]">4 Days</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-[#DFD9CA] text-[11px]">
                <span>Default for other complaints</span>
                <span className="font-medium text-[#788F54]">3 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#233827] bg-[#162719] pt-14 pb-0 px-6 sm:px-8 text-xs text-[#A3B8A7] overflow-hidden">
        <div className="mx-auto max-w-[1400px]">
          {/* Top Row: Links and Info */}
          <div className="flex flex-col items-center justify-between gap-6 pb-10 sm:flex-row border-b border-[#233827]/80">
            <BrandLogo linkTo="/" variant="footer" className="scale-110 origin-left" />
            <div className="flex flex-wrap items-center gap-8 font-medium text-sm text-[#D1DFD3]">
              <a href="#features" className="transition-colors hover:text-white">
                Features
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-white">
                How it works
              </a>
              <Link to="/auth" className="transition-colors hover:text-white">
                Sign In
              </Link>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-1 text-xs text-[#8BA490]">
              <p>© {new Date().getFullYear()} SocietyDesk. Built for apartment societies.</p>
              <p>
                Developed by{" "}
                <a
                  href="https://github.com/namaninnovates"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#D1DFD3] hover:text-white underline decoration-[#3B543F] underline-offset-4 transition-colors"
                >
                  namaninnovates
                </a>
              </p>
            </div>
          </div>

          {/* Large Hero Branding with Logo & Text: Opaque at top, faded at bottom */}
          <div className="pt-8 sm:pt-10 pb-0 flex items-center justify-center gap-3 sm:gap-6 md:gap-8 select-none pointer-events-none overflow-hidden">
            <svg
              className="h-[10vw] w-[10vw] max-h-36 max-w-36 shrink-0 transform translate-y-1 sm:translate-y-2"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="footerLogoFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                  <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M4 24L16 4L22 14L10 24H4Z" fill="url(#footerLogoFade)" />
              <path d="M14 28L20 18L28 28H14Z" fill="url(#footerLogoFade)" />
            </svg>

            <span className="text-[13vw] sm:text-[14vw] font-extrabold tracking-tighter leading-[0.82] bg-gradient-to-b from-white/45 via-white/18 to-transparent bg-clip-text text-transparent transform translate-y-1 sm:translate-y-2">
              societydesk
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
