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
  Check,
  Wrench,
  Clock,
  Broadcast,
  CheckCircle,
  Lightning,
  Sparkle,
  PaperPlaneTilt,
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

const FLOW_STEPS = [
  {
    step: "01",
    tag: "Resident Dispatch",
    title: "Snap photos, pick category, submit in seconds",
    desc: "Residents select the issue category (Lift, Plumbing, Electrical, Cleaning), add brief notes, attach up to 3 photos directly from mobile, and dispatch. The system auto-tags their tower and flat number with instant receipt confirmation.",
    highlights: ["Mobile & Web Uploads", "Auto Flat & Tower Tag", "Instant Dispatch Receipt"],
    badgeColor: "amber",
  },
  {
    step: "02",
    tag: "Triage & Work Order",
    title: "Auto-generated work order & dedicated technician routing",
    desc: "Society admins review issues in Kanban or List view. Work order numbers are automatically generated, emergency priorities assigned, and staff technicians or external agencies (e.g. Otis) get notified immediately.",
    highlights: ["Auto WO Generation", "Technician Routing", "Priority Escalation"],
    badgeColor: "emerald",
  },
  {
    step: "03",
    tag: "Broadcast & Live SLA",
    title: "Real-time deadline radar & automated society notice board",
    desc: "Keep the whole society informed. If an elevator or water pump goes down, public notices are published to affected towers automatically. Live countdown timers monitor repair SLA, triggering manager alerts if deadlines are at risk.",
    highlights: ["Live Countdown Dial", "Tower Notice Broadcast", "Overdue Alarm Shield"],
    badgeColor: "olive",
  },
  {
    step: "04",
    tag: "Resolution & Rating",
    title: "Before & after repair proof photos with 5-star sign-off",
    desc: "Technicians upload completion photos when the fix is done. Residents verify the repair in their portal, submit a 1 to 5 star rating with feedback, and create an immutable audit trail for society records.",
    highlights: ["Photo Proof of Work", "5-Star Resident Rating", "Permanent Audit Log"],
    badgeColor: "emerald",
  },
];

function SocietyDeskLanding() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const scenario = SCENARIOS[activeScenarioIdx]!;
  const [customPrompt, setCustomPrompt] = useState(scenario.prompt);
  const [activeStep, setActiveStep] = useState(0);

  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const switchScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setCustomPrompt(SCENARIOS[idx]!.prompt);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.45;
      const refs = [step0Ref, step1Ref, step2Ref, step3Ref];
      for (let i = 0; i < refs.length; i++) {
        const el = refs[i]?.current;
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveStep(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
              className="rounded-full bg-[#1F3622] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#2E4E30] sm:px-5 sm:py-2 sm:text-sm"
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
            <h1 className="text-4xl font-light leading-[1.05] tracking-tight text-[#111215] sm:text-6xl md:text-7xl lg:text-[76px] sm:leading-[0.98]">
              <span className="font-light text-[#111215]/90">Maintenance complaints,</span>
              <br />
              <span className="font-bold text-[#1F3622]">resolved on time.</span>
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

        {/* PARALLAX STICKY SCROLL SECTION */}
        <div
          id="how-it-works"
          className="relative rounded-3xl border border-[#DFD9CA] bg-[#FAF8F2] p-6 sm:p-10 lg:p-12 shadow-xs"
        >
          {/* Header & Scenario Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#EAE6DA]">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex size-2 rounded-full bg-[#1F3622] animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F3622]">
                  Interactive Workflow Journey
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#111215] mt-1.5">
                From resident complaint to verified fix
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                Simulate Scenario:
              </span>
              {SCENARIOS.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => switchScenario(i)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    activeScenarioIdx === i
                      ? "bg-[#1F3622] text-white shadow-xs scale-105"
                      : "bg-white border border-[#DFD9CA] text-[#4A4D54] hover:bg-[#FAF8F2]"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parallax 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pt-10">
            {/* LEFT COLUMN: The Narrative Explanations (Scrolls naturally) */}
            <div className="lg:col-span-6 space-y-12 lg:space-y-20">
              {FLOW_STEPS.map((stepItem, idx) => (
                <div
                  key={stepItem.step}
                  ref={
                    idx === 0 ? step0Ref : idx === 1 ? step1Ref : idx === 2 ? step2Ref : step3Ref
                  }
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-2xl p-6 sm:p-7 transition-all duration-500 border ${
                    activeStep === idx
                      ? "border-[#1F3622]/40 bg-white shadow-sm ring-1 ring-[#1F3622]/10"
                      : "border-transparent bg-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        activeStep === idx
                          ? "bg-[#1F3622] text-white ring-4 ring-[#EDF4EE]"
                          : "bg-[#DFD9CA] text-slate-700"
                      }`}
                    >
                      {stepItem.step}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1F3622]">
                      {stepItem.tag}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg sm:text-xl font-bold text-[#111215] leading-snug">
                    {stepItem.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#5A5E68]">
                    {stepItem.desc}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {stepItem.highlights.map((hl) => (
                      <span
                        key={hl}
                        className="inline-flex items-center gap-1 rounded-md bg-[#FAF8F2] border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-700"
                      >
                        <Check className="size-3 text-[#1F3622]" weight="bold" />
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: Sticky Parallax Canvas with Curvy Flowy Stream */}
            <div className="lg:col-span-6 relative">
              <div className="sticky top-24 lg:top-28 space-y-4">
                {/* Stage Stepper Navigation */}
                <div className="flex items-center justify-between gap-1.5 rounded-2xl bg-white border border-[#DFD9CA] p-1.5 shadow-2xs">
                  {FLOW_STEPS.map((s, idx) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setActiveStep(idx)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeStep === idx
                          ? "bg-[#1F3622] text-white shadow-xs"
                          : "text-slate-600 hover:text-[#111215] hover:bg-[#FAF8F2]"
                      }`}
                    >
                      <span>{s.step}</span>
                      <span className="hidden sm:inline">{s.tag.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Showcase Container with Curvy Outflow Visualizer */}
                <div className="relative overflow-hidden rounded-3xl border border-[#DFD9CA] bg-white p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)] min-h-[420px] flex flex-col justify-between">
                  {/* Organic Background Curvy Flow Line */}
                  <div className="pointer-events-none absolute right-3 top-0 bottom-0 w-16 z-0 hidden sm:block">
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 60 420"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M 30 10 C 55 80 5 140 30 210 C 55 280 10 350 30 410"
                        stroke="#1F3622"
                        strokeOpacity="0.15"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                      />
                      {/* Dynamic Active Segment */}
                      <path
                        d={
                          activeStep === 0
                            ? "M 30 10 C 55 80 5 140 30 110"
                            : activeStep === 1
                              ? "M 30 10 C 55 80 5 140 30 210"
                              : activeStep === 2
                                ? "M 30 10 C 55 80 5 140 30 210 C 55 280 10 350 30 310"
                                : "M 30 10 C 55 80 5 140 30 210 C 55 280 10 350 30 410"
                        }
                        stroke="#1F3622"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                      {/* Flowing Milestone Dots */}
                      <circle
                        cx="30"
                        cy="15"
                        r="5"
                        fill={activeStep >= 0 ? "#1F3622" : "#DFD9CA"}
                      />
                      <circle
                        cx="30"
                        cy="140"
                        r="5"
                        fill={activeStep >= 1 ? "#1F3622" : "#DFD9CA"}
                      />
                      <circle
                        cx="30"
                        cy="270"
                        r="5"
                        fill={activeStep >= 2 ? "#1F3622" : "#DFD9CA"}
                      />
                      <circle
                        cx="30"
                        cy="405"
                        r="5"
                        fill={activeStep >= 3 ? "#1F3622" : "#DFD9CA"}
                      />
                    </svg>
                  </div>

                  {/* Morphing Step Card Content */}
                  <div className="relative z-10">
                    {/* STEP 01: RESIDENT DISPATCH */}
                    {activeStep === 0 && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-400">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-[#1F3622] text-white text-xs font-bold">
                              1
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                              Resident Report Screen
                            </span>
                          </div>
                          <span className="rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            {scenario.unitBadge}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-xl border border-[#DFD9CA] bg-[#FAF8F2] p-3 shadow-2xs">
                            <textarea
                              value={customPrompt}
                              onChange={(e) => setCustomPrompt(e.target.value)}
                              rows={3}
                              className="w-full resize-none border-none bg-transparent p-0 text-xs leading-relaxed text-[#111215] outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-2.5 rounded-xl border border-[#DFD9CA] bg-[#FAF8F2] p-2">
                            <div className="size-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-2xs">
                              <img
                                src={scenario.image}
                                alt="Thumbnail"
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#111215] truncate">
                                Attached Photo Proof
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {scenario.photoLabel}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Auto-tags flat & block
                          </span>
                          <Link
                            to="/auth"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1F3622] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2E4E30] transition-colors"
                          >
                            <span>File Issue</span>
                            <PaperPlaneTilt className="size-3" weight="bold" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* STEP 02: TRIAGE & WORK ORDER */}
                    {activeStep === 1 && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-400">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-[#1F3622] text-white text-xs font-bold">
                              2
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                              Admin Triage & Work Order
                            </span>
                          </div>
                          <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                            WO #{activeScenarioIdx === 0 ? "104" : "109"}
                          </span>
                        </div>

                        <div className="relative pl-4 space-y-2.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DFD9CA]">
                          {scenario.workflow.slice(0, 4).map((item) => (
                            <div
                              key={item.text}
                              className="relative flex items-center gap-2.5 text-xs"
                            >
                              <span
                                className={`absolute -left-4 flex size-3.5 items-center justify-center rounded-full ring-4 ring-white ${
                                  item.done
                                    ? "bg-[#1F3622] text-white"
                                    : "bg-slate-300 text-slate-600"
                                }`}
                              >
                                {item.done ? <Check className="size-2" weight="bold" /> : null}
                              </span>
                              <div
                                className={`w-full rounded-lg px-2.5 py-2 text-xs font-medium border transition-all ${
                                  item.done
                                    ? "border-[#DFD9CA] bg-[#FAF8F2] text-[#111215]"
                                    : "border-dashed border-slate-200 bg-slate-50/50 text-slate-400"
                                }`}
                              >
                                <span className="truncate">{item.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Technician assigned
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1F3622]">
                            <Lightning className="size-3.5" weight="fill" /> High Priority SLA
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STEP 03: BROADCAST & LIVE SLA */}
                    {activeStep === 2 && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-400">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-[#1F3622] text-white text-xs font-bold">
                              3
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                              Broadcast & Live SLA Radar
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF4EE] border border-[#1F3622]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#1F3622]">
                            <Broadcast className="size-2.5 animate-pulse" /> Live Society Radar
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {scenario.rules.map((r) => (
                            <div
                              key={r.title}
                              className="rounded-xl border border-[#DFD9CA] bg-[#FAF8F2] p-3 shadow-2xs space-y-1"
                            >
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111215]">
                                <Clock className="size-3.5 text-[#1F3622]" weight="bold" />
                                <span>{r.title}</span>
                              </div>
                              <p className="text-xs text-slate-600 pl-5">{r.desc}</p>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[11px] text-slate-500 font-medium">
                            Automatic overdue protection
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            ✓ SLA On Schedule
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STEP 04: RESOLUTION & 5-STAR SIGN-OFF */}
                    {activeStep === 3 && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-400">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-[#1F3622] text-white text-xs font-bold">
                              4
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                              Verified Resolution Proof
                            </span>
                          </div>
                          <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            {scenario.resolution.tag}
                          </span>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[#233827] bg-[#142317] text-white shadow-md">
                          <div className="relative h-32 w-full overflow-hidden">
                            <img
                              src={scenario.image}
                              alt={scenario.resolution.title}
                              className="size-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#142317] via-[#142317]/50 to-black/30" />
                            <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-xs text-amber-400">
                              <div className="flex">
                                {[...Array(5)].map((_, idx) => (
                                  <Star key={idx} className="size-3.5" weight="fill" />
                                ))}
                              </div>
                              <span className="text-[11px] font-semibold text-slate-200">
                                5.0 Star Resident Feedback
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5">
                            <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-white leading-snug">
                              {scenario.resolution.title}
                            </h4>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-300/85">
                              {scenario.resolution.desc}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <Link
                            to="/auth"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F3622] hover:underline"
                          >
                            {scenario.resolution.action} <ArrowRight className="size-3.5" />
                          </Link>
                          <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                            CLOSED & VERIFIED
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer status summary */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Active Workflow Stage:{" "}
                      <strong className="text-[#1F3622]">{FLOW_STEPS[activeStep]?.tag}</strong>
                    </span>
                    <span className="font-semibold text-slate-700">{activeStep + 1} of 4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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

      <footer className="border-t border-[#233827] bg-[#162719] py-12 px-6 sm:px-8 text-xs text-[#A3B8A7]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 sm:flex-row">
          <BrandLogo linkTo="/" variant="footer" />
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
          <p className="text-xs text-[#8BA490]">
            © {new Date().getFullYear()} SocietyDesk. Built for apartment societies.
          </p>
        </div>
      </footer>
    </div>
  );
}
