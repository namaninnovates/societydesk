import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Warning,
  Clock,
  Wrench,
  Bell,
  X,
  CaretDown,
  CaretUp,
  ArrowRight,
  Sparkle,
  ShieldCheck,
  Lightning,
} from "@phosphor-icons/react";
import { fetchComplaints } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import { daysOpen } from "@/lib/societydesk";
import { cn } from "@/lib/utils";

export function ActionAlertPopup() {
  const { profile, isAdmin, isStaff } = useAuth();
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [tab, setTab] = useState<"deadlines" | "unassigned">("deadlines");

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints", "action-alerts"],
    queryFn: () => fetchComplaints(),
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: Boolean(profile && (isAdmin || isStaff)),
  });

  if (!profile || (!isAdmin && !isStaff) || closed) {
    return null;
  }

  // 1. Overdue or urgent SLA tickets (Active and overdue)
  const overdueTickets = complaints.filter((c) => c.status !== "resolved" && c.is_overdue);

  // 2. Newly raised tickets needing technician assignment
  const unassignedTickets = complaints.filter((c) => c.status === "open" && !c.assigned_to);

  const totalActions = overdueTickets.length + unassignedTickets.length;

  if (totalActions === 0) {
    return null;
  }

  // If collapsed/minimized, show quick status pill
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="group flex items-center gap-2.5 rounded-full bg-[#1F3622] px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-[#2E4E30] hover:bg-[#2E4E30] hover:scale-102 transition-all cursor-pointer"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-amber-500" />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-amber-300">{totalActions} Action Required</span>
            <span className="text-white/60">·</span>
            <span className="text-white/80">
              {overdueTickets.length > 0 && `${overdueTickets.length} Overdue`}
              {overdueTickets.length > 0 && unassignedTickets.length > 0 && " · "}
              {unassignedTickets.length > 0 && `${unassignedTickets.length} Unassigned`}
            </span>
          </span>
          <CaretUp className="size-3.5 text-white/70 group-hover:text-white" weight="bold" />
        </button>
      </div>
    );
  }

  const activeList = tab === "deadlines" ? overdueTickets : unassignedTickets;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[360px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-3 duration-200">
      <div className="rounded-2xl border border-[#DFD9CA] bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* ── HEADER ───────────────────────────────────────────── */}
        <div className="bg-[#1F3622] px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Lightning className="size-4" weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white tracking-tight">Action Alerts</p>
                <span className="rounded-full bg-amber-400 text-slate-950 px-1.5 py-0.2 text-[10px] font-extrabold">
                  {totalActions}
                </span>
              </div>
              <p className="text-[10px] text-white/70">Requires attention & triage</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="flex size-6 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Minimize to pill"
            >
              <CaretDown className="size-3.5" weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setClosed(true)}
              className="flex size-6 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Dismiss popup"
            >
              <X className="size-3.5" weight="bold" />
            </button>
          </div>
        </div>

        {/* ── TABS ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 bg-[#F6F4ED] border-b border-[#DFD9CA] p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("deadlines")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold transition-colors cursor-pointer",
              tab === "deadlines"
                ? "bg-white text-[#111215] shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Warning className="size-3.5 text-amber-600" weight="fill" />
            <span>Overdue SLA ({overdueTickets.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("unassigned")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold transition-colors cursor-pointer",
              tab === "unassigned"
                ? "bg-white text-[#111215] shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Wrench className="size-3.5 text-blue-600" weight="fill" />
            <span>Unassigned ({unassignedTickets.length})</span>
          </button>
        </div>

        {/* ── LIST ITEMS ───────────────────────────────────────── */}
        <div className="max-h-60 overflow-y-auto divide-y divide-[#F1EDE1] p-1">
          {activeList.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              {tab === "deadlines"
                ? "No overdue tickets right now. All SLAs on track!"
                : "All open complaints are assigned to technicians!"}
            </div>
          ) : (
            activeList.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                to="/complaints/$id"
                params={{ id: c.id }}
                className="group flex flex-col gap-1 p-2.5 hover:bg-[#FAF8F2] rounded-xl transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-900 line-clamp-1 group-hover:text-[#1F3622]">
                    {c.title}
                  </span>
                  {c.is_overdue ? (
                    <span className="shrink-0 rounded bg-amber-100 border border-amber-300 text-amber-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight flex items-center gap-0.5">
                      <Warning className="size-2.5 text-amber-700" weight="fill" />
                      Overdue
                    </span>
                  ) : (
                    <span className="shrink-0 rounded bg-blue-50 border border-blue-200 text-blue-800 px-1.5 py-0.5 text-[9px] font-medium">
                      Unassigned
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>
                    {c.category} · {c.profiles?.block} Flat {c.profiles?.unit_number}
                  </span>
                  <span className="font-medium text-slate-700 group-hover:underline flex items-center gap-0.5">
                    View <ArrowRight className="size-2.5" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* ── FOOTER ───────────────────────────────────────────── */}
        <div className="bg-[#FAF8F2] border-t border-[#DFD9CA] px-3 py-2 text-center">
          <Link
            to="/admin/complaints"
            className="text-[11px] font-bold text-[#1F3622] hover:underline inline-flex items-center gap-1"
          >
            Manage All in Complaints Triage <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
