import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { X, CaretDown, CaretUp, ArrowRight } from "@phosphor-icons/react";
import { fetchComplaints } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function ActionAlertPopup() {
  const { profile, isAdmin, isStaff } = useAuth();
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [tab, setTab] = useState<"unassigned" | "overdue">("unassigned");

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints", "action-alerts"],
    queryFn: () => fetchComplaints(),
    refetchInterval: 30000,
    enabled: Boolean(profile && (isAdmin || isStaff)),
  });

  if (!profile || (!isAdmin && !isStaff) || closed) {
    return null;
  }

  // 1. Overdue SLA tickets
  const overdueTickets = complaints.filter((c) => c.status !== "resolved" && c.is_overdue);

  // 2. Unassigned tickets
  const unassignedTickets = complaints.filter((c) => c.status === "open" && !c.assigned_to);

  const totalActions = overdueTickets.length + unassignedTickets.length;

  if (totalActions === 0) {
    return null;
  }

  // If minimized, render a clean, understated floating pill
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-[#1F3622] px-3.5 py-2 text-xs font-semibold text-white shadow-lg border border-[#2E4E30] hover:bg-[#2E4E30] transition-colors cursor-pointer"
        >
          <span className="size-2 rounded-full bg-emerald-400" />
          <span>Action Required ({totalActions})</span>
          <CaretUp className="size-3.5 text-white/80" />
        </button>
      </div>
    );
  }

  const activeList = tab === "unassigned" ? unassignedTickets : overdueTickets;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[350px] max-w-[calc(100vw-2rem)]">
      <div className="rounded-2xl border border-[#DFD9CA] bg-white shadow-xl overflow-hidden flex flex-col font-sans">
        <div className="bg-[#1F3622] px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold tracking-tight text-white">Action Required</h3>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
              {totalActions}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="flex size-6 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Minimize"
            >
              <CaretDown className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setClosed(true)}
              className="flex size-6 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 bg-[#F1EDE1] p-1 border-b border-[#DFD9CA] text-xs">
          <button
            type="button"
            onClick={() => setTab("unassigned")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              tab === "unassigned"
                ? "bg-white text-[#111215] shadow-xs"
                : "text-[#5A5E68] hover:text-[#111215]",
            )}
          >
            <span>Unassigned</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                tab === "unassigned"
                  ? "bg-[#EDF4EE] text-[#1F3622] font-bold"
                  : "bg-black/5 text-slate-600",
              )}
            >
              {unassignedTickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab("overdue")}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              tab === "overdue"
                ? "bg-white text-[#111215] shadow-xs"
                : "text-[#5A5E68] hover:text-[#111215]",
            )}
          >
            <span>Overdue Deadlines</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                tab === "overdue"
                  ? "bg-red-100 text-red-800 font-bold"
                  : "bg-black/5 text-slate-600",
              )}
            >
              {overdueTickets.length}
            </span>
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-[#F0EBE0] px-2 py-1">
          {activeList.length === 0 ? (
            <div className="py-7 text-center text-xs text-muted-foreground">
              {tab === "unassigned"
                ? "All active complaints are assigned."
                : "No overdue complaints. All deadlines on track."}
            </div>
          ) : (
            activeList.slice(0, 5).map((c) => {
              const locationStr = [
                c.category,
                c.profiles?.block,
                c.profiles?.unit_number
                  ? `Unit ${c.profiles.unit_number.replace(/^Flat\s*/i, "")}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <Link
                  key={c.id}
                  to="/complaints/$id"
                  params={{ id: c.id }}
                  className="group flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#FAF8F2] transition-colors"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-semibold text-xs text-[#111215] truncate group-hover:text-[#1F3622]">
                      {c.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{locationStr}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {c.is_overdue ? (
                      <span className="rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                        Overdue
                      </span>
                    ) : (
                      <span className="rounded-md bg-[#FAF8F2] border border-[#DFD9CA] px-2 py-0.5 text-[10px] font-medium text-slate-700">
                        Unassigned
                      </span>
                    )}
                    <span className="text-xs font-semibold text-[#1F3622] group-hover:underline inline-flex items-center">
                      View <ArrowRight className="size-3 ml-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="bg-[#FAF8F2] border-t border-[#DFD9CA] px-4 py-2.5 text-center">
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-[#1F3622] hover:underline inline-flex items-center gap-1"
          >
            Manage All in Complaints Triage <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
