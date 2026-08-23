import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_MESSAGES = [
  "Connecting to society records...",
  "Syncing complaint resolution status...",
  "Checking maintenance crew schedules...",
  "Loading live society data...",
];

export function SocietyMaintenanceLoader({
  text,
  fullScreen = false,
  className,
}: {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (text) return;
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [text]);

  const displayMessage = text || STATUS_MESSAGES[msgIndex];

  const content = (
    <div className={cn("flex flex-col items-center justify-center p-6 text-center", className)}>
      {/* ── CUSTOM ANIMATED SOCIETY MAINTENANCE SVG ── */}
      <div className="relative mb-5 flex size-28 items-center justify-center">
        {/* Radar wave pulse rings */}
        <div className="absolute size-24 rounded-full border border-emerald-500/30 animate-radar" />
        <div
          className="absolute size-20 rounded-full border border-[#1F3622]/20 animate-radar"
          style={{ animationDelay: "0.8s" }}
        />

        <svg
          viewBox="0 0 120 120"
          className="size-24 drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground Base */}
          <rect x="15" y="102" width="90" height="4" rx="2" fill="#DFD9CA" />

          {/* Society Building Tower */}
          <rect
            x="30"
            y="26"
            width="60"
            height="76"
            rx="5"
            fill="#1F3622"
            stroke="#2E4E30"
            strokeWidth="2"
          />

          {/* Roof Antenna / Rooftop Equipment */}
          <line
            x1="60"
            y1="26"
            x2="60"
            y2="14"
            stroke="#788F54"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="14" r="3" fill="#10B981" className="animate-pulse" />

          {/* Building Windows (Grid of 6) */}
          <g>
            {/* Top row */}
            <rect x="38" y="34" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.85" />
            <rect x="52" y="34" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.4" />
            <rect x="66" y="34" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.9" />

            {/* Middle row */}
            <rect x="38" y="48" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.5" />
            <rect
              x="52"
              y="48"
              width="8"
              height="8"
              rx="1.5"
              fill="#10B981"
              opacity="0.9"
              className="animate-pulse"
            />
            <rect x="66" y="48" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.6" />

            {/* Lower row */}
            <rect x="38" y="62" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.75" />
            <rect x="52" y="62" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.8" />
            <rect x="66" y="62" width="8" height="8" rx="1.5" fill="#E8E4D8" opacity="0.3" />
          </g>

          {/* Entrance Door */}
          <rect x="53" y="86" width="14" height="16" rx="2" fill="#FAF8F2" opacity="0.95" />

          {/* Elevator Track on Side */}
          <line
            x1="82"
            y1="32"
            x2="82"
            y2="96"
            stroke="#2E4E30"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Animated Elevator Cab */}
          <g className="animate-elevator">
            <rect
              x="77"
              y="70"
              width="10"
              height="14"
              rx="2"
              fill="#EAE6DA"
              stroke="#1F3622"
              strokeWidth="1"
            />
            <rect x="79" y="72" width="6" height="5" rx="1" fill="#788F54" opacity="0.8" />
          </g>

          {/* Animated Rotating Maintenance Gear */}
          <g transform="translate(24, 76)">
            <circle cx="0" cy="0" r="10" fill="#EAE6DA" stroke="#1F3622" strokeWidth="1.5" />
            <path
              d="M-2 -12 H2 V-8 H-2 Z M-2 8 H2 V12 H-2 Z M-12 -2 H-8 V2 H-12 Z M8 -2 H12 V2 H8 Z"
              fill="#1F3622"
              className="animate-gear-fast"
            />
            <circle cx="0" cy="0" r="4" fill="#788F54" />
          </g>

          {/* Animated Working Wrench (Swinging/Tightening) */}
          <g transform="translate(94, 78)">
            <g className="animate-wrench">
              {/* Wrench Handle */}
              <rect
                x="-3"
                y="-18"
                width="6"
                height="18"
                rx="2"
                fill="#3E4D28"
                stroke="#1F3622"
                strokeWidth="1"
              />
              {/* Wrench Head */}
              <path
                d="M-7 -18 C-7 -24, 7 -24, 7 -18 C7 -15, 3 -13, 0 -13 C-3 -13, -7 -15, -7 -18 Z"
                fill="#829758"
              />
              <circle cx="0" cy="-18" r="3" fill="#1F3622" />
            </g>
          </g>
        </svg>
      </div>

      {/* Dynamic Status Text */}
      <div className="space-y-1">
        <p className="text-sm font-bold tracking-tight text-[#111215] transition-all duration-300">
          {displayMessage}
        </p>
        <p className="text-xs text-[#788F54] font-medium flex items-center justify-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          SocietyDesk Service Engine
        </p>
      </div>

      {/* Progress Line */}
      <div className="mt-3.5 h-1 w-36 overflow-hidden rounded-full bg-[#EAE6DA]">
        <div className="h-full w-full bg-[#1F3622] rounded-full animate-pulse" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-[#F6F4ED]/60">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * High-fidelity Skeleton loader for Complaints list & Triage
 */
export function ComplaintsTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Maintenance Sync Banner */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#DFD9CA] p-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#EDF4EE] text-[#1F3622]">
            <span className="text-xs">🔧</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#111215]">Fetching Active Complaints...</p>
            <p className="text-[10px] text-muted-foreground">
              Checking resolution SLA timelines and assignments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3E4D28] bg-[#3E4D28]/10 px-2 py-0.5 rounded-full border border-[#3E4D28]/20">
          <span className="size-2 rounded-full bg-[#788F54] animate-pulse" />
          Syncing DB
        </div>
      </div>

      {/* Ticket Cards Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs space-y-3 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48 rounded-md bg-slate-200" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-slate-200" />
                <Skeleton className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
            </div>
            <Skeleton className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Skeleton className="h-4 w-32 rounded bg-slate-100" />
              <Skeleton className="h-8 w-28 rounded-lg bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Admin Dashboard with KPI cards and charts
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Top Banner */}
      <div className="flex items-center justify-between rounded-2xl bg-white border border-[#DFD9CA] p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#EDF4EE] text-[#1F3622]">
            <span className="text-base">🏢</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#111215]">Loading Society Dashboard...</p>
            <p className="text-xs text-muted-foreground">
              Aggregating live repair metrics & overdue alerts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3E4D28] bg-[#3E4D28]/10 px-2.5 py-1 rounded-full border border-[#3E4D28]/20">
          <span className="size-2 rounded-full bg-[#788F54] animate-pulse" />
          Live Metrics
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#DFD9CA] bg-white p-3 shadow-xs space-y-2"
          >
            <Skeleton className="h-3 w-16 bg-slate-200" />
            <Skeleton className="h-7 w-12 bg-slate-300" />
          </div>
        ))}
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs lg:col-span-7 h-48">
          <Skeleton className="h-4 w-32 bg-slate-200 mb-3" />
          <Skeleton className="h-32 w-full bg-slate-100 rounded-xl" />
        </div>
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs lg:col-span-5 h-48">
          <Skeleton className="h-4 w-32 bg-slate-200 mb-3" />
          <Skeleton className="h-32 w-full bg-slate-100 rounded-full mx-auto max-w-[130px]" />
        </div>
      </div>

      {/* Bottom Timeline */}
      <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs h-44">
        <Skeleton className="h-4 w-40 bg-slate-200 mb-3" />
        <Skeleton className="h-28 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for User & Staff Directory
 */
export function UsersDirectorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#DFD9CA] p-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#EDF4EE] text-[#1F3622]">
            <span className="text-xs">👥</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#111215]">Loading User & Staff Directory...</p>
            <p className="text-[10px] text-muted-foreground">
              Fetching assigned technicians and flat details
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full bg-slate-200" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-slate-200" />
                <Skeleton className="h-3 w-44 bg-slate-100" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full bg-slate-200" />
            <Skeleton className="h-6 w-28 bg-slate-100" />
            <Skeleton className="h-8 w-16 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
