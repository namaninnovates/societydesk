import { Buildings, Wrench, Gear, Lightning, Sparkle } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SocietyMaintenanceLoader({
  text = "Loading society records...",
  fullScreen = false,
  className,
}: {
  text?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {/* Animated Society Maintenance Badge */}
      <div className="relative mb-4 flex items-center justify-center">
        {/* Glowing aura */}
        <div className="absolute size-20 rounded-full bg-emerald-500/15 animate-ping" />
        <div className="absolute size-16 rounded-full bg-[#1F3622]/10 animate-pulse" />

        {/* Main Building Frame */}
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-[#1F3622] text-white shadow-md border border-[#2E4E30]">
          <Buildings className="size-7 text-[#EAE6DA]" weight="duotone" />

          {/* Animated Wrench Overlay */}
          <div className="absolute -bottom-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white animate-bounce">
            <Wrench className="size-3.5" weight="bold" />
          </div>

          {/* Rotating mini gear */}
          <div className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-[#FAF8F2] text-[#1F3622] border border-[#DFD9CA] shadow-2xs">
            <Gear className="size-3 animate-spin text-[#1F3622]" weight="bold" />
          </div>
        </div>
      </div>

      {/* Text & Progress indicator */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#111215] tracking-tight">{text}</p>
        <p className="text-xs text-[#7C8074] flex items-center justify-center gap-1">
          <Lightning className="size-3 text-emerald-600 animate-pulse" weight="fill" />
          SocietyDesk Live Sync
        </p>
      </div>

      {/* Animated progress bar */}
      <div className="mt-3.5 h-1 w-32 overflow-hidden rounded-full bg-[#E8E4D8]">
        <div className="h-full w-full bg-[#1F3622] animate-pulse rounded-full" />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#F6F4ED]/50">
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
      {/* Maintenance Animation Header */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-[#DFD9CA] p-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[#EDF4EE] text-[#1F3622]">
            <Wrench className="size-3.5 animate-spin text-[#1F3622]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#111215]">Fetching Active Complaints...</p>
            <p className="text-[10px] text-muted-foreground">
              Checking resolution timelines and SLA status
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Syncing DB
        </div>
      </div>

      {/* Cards Skeletons */}
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
            <Buildings className="size-5 text-[#1F3622]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#111215]">Loading Society Dashboard...</p>
            <p className="text-xs text-muted-foreground">
              Aggregating live repair metrics & overdue alerts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Sparkle className="size-3.5 text-emerald-600 animate-spin" />
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
            <Wrench className="size-3.5 text-[#1F3622]" />
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
