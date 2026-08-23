import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ClipboardText,
  Clock,
  CheckCircle,
  Warning,
  User,
  Phone,
  MapPin,
  Buildings,
  ArrowRight,
  HandWaving,
  ChatCircleText,
  Plus,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PriorityTag, StatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { fetchComplaints, assignComplaintServerFn, type ComplaintRow } from "@/lib/queries";
import { updateComplaintStatusServerFn } from "@/lib/complaints.functions";
import { STATUS_LABELS, daysOpen, type Status } from "@/lib/societydesk";
import { notifyStatusChange } from "@/integrations/email/notify.functions";

export const Route = createFileRoute("/_authenticated/staff/")({
  head: () => ({
    meta: [
      { title: "Staff Portal — SocietyDesk" },
      { name: "description", content: "Assigned maintenance tasks and resolution tracker." },
      { property: "og:title", content: "Staff Portal — SocietyDesk" },
      { property: "og:description", content: "Staff task queue and status resolution workspace." },
    ],
  }),
  component: StaffDashboard,
});

function StaffDashboard() {
  const { profile, isStaff, isAdmin, profileLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"assigned" | "pool">("assigned");
  const [search, setSearch] = useState("");
  const [activeComplaint, setActiveComplaint] = useState<ComplaintRow | null>(null);
  const [nextStatus, setNextStatus] = useState<Status>("in_progress");
  const [statusNote, setStatusNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "all"],
    queryFn: () => fetchComplaints(),
    enabled: Boolean(profile && (isStaff || isAdmin)),
  });

  const allRows = useMemo(() => data ?? [], [data]);

  // Tasks assigned specifically to current staff member
  const myTasks = useMemo(() => {
    return allRows.filter((r) => r.assigned_to === profile?.id);
  }, [allRows, profile?.id]);

  // Unassigned open/in_progress tasks available to claim
  const unassignedPool = useMemo(() => {
    return allRows.filter((r) => !r.assigned_to && r.status !== "resolved");
  }, [allRows]);

  const activeRows = useMemo(() => {
    const list = tab === "assigned" ? myTasks : unassignedPool;
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.location ?? "").toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.profiles?.unit_number ?? "").toLowerCase().includes(q),
    );
  }, [tab, myTasks, unassignedPool, search]);

  const claimTaskMut = useMutation({
    mutationFn: async (complaintId: string) => {
      if (!profile) return;
      await assignComplaintServerFn({
        data: {
          complaintId,
          staffId: profile.id,
          actorId: profile.id,
          note: `Claimed by technician ${profile.full_name}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Task assigned to your queue!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatusMut = useMutation({
    mutationFn: async () => {
      if (!activeComplaint || !profile) return;
      if (statusNote.trim().length < 3) {
        throw new Error("Please write a brief note explaining the progress or resolution.");
      }
      await updateComplaintStatusServerFn({
        data: {
          id: activeComplaint.id,
          status: nextStatus,
          oldStatus: activeComplaint.status,
          note: statusNote.trim().slice(0, 500),
          actorId: profile.id,
        },
      });
    },
    onSuccess: () => {
      if (activeComplaint) {
        notifyStatusChange({
          data: {
            complaintId: activeComplaint.id,
            oldStatus: activeComplaint.status,
            newStatus: nextStatus,
            note: statusNote.trim().slice(0, 500),
          },
        }).catch((err) => console.error("Email notification failed:", err));
      }
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Status updated to ${STATUS_LABELS[nextStatus]}`);
      setActiveComplaint(null);
      setStatusNote("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (profileLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (!profile || (!isStaff && !isAdmin)) return null;

  const openAssignedCount = myTasks.filter((t) => t.status !== "resolved").length;
  const resolvedAssignedCount = myTasks.filter((t) => t.status === "resolved").length;
  const overdueAssignedCount = myTasks.filter(
    (t) => t.is_overdue && t.status !== "resolved",
  ).length;

  return (
    <div className="space-y-6">
      {/* ── HEADER & WELCOME ─────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111215]">
            Welcome, {profile.full_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Staff Technician Workspace · Manage your service tickets and respond to residents.
          </p>
        </div>
      </div>

      {/* ── METRICS STRIP ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#DFD9CA] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">
              Active Assigned Tasks
            </span>
            <p className="text-2xl font-bold tracking-tight text-[#1F3622] mt-0.5">
              {openAssignedCount}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#EDF4EE] text-[#1F3622]">
            <Clock className="size-5" weight="bold" />
          </div>
        </div>

        <div className="rounded-xl border border-[#DFD9CA] bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">
              Completed / Resolved
            </span>
            <p className="text-2xl font-bold tracking-tight text-[#1F3622] mt-0.5">
              {resolvedAssignedCount}
            </p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-[#EDF4EE] text-[#1F3622]">
            <CheckCircle className="size-5" weight="bold" />
          </div>
        </div>

        <div
          className={`rounded-xl border p-4 shadow-xs flex items-center justify-between ${
            overdueAssignedCount > 0
              ? "border-amber-300 bg-amber-50/80 text-amber-900"
              : "border-[#DFD9CA] bg-white text-[#111215]"
          }`}
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-tight opacity-75">
              Overdue Tickets
            </span>
            <p className="text-2xl font-bold tracking-tight mt-0.5">{overdueAssignedCount}</p>
          </div>
          <div
            className={`flex size-10 items-center justify-center rounded-lg ${
              overdueAssignedCount > 0
                ? "bg-amber-200/80 text-amber-800"
                : "bg-[#EDF4EE] text-[#1F3622]"
            }`}
          >
            <Warning className="size-5" weight="bold" />
          </div>
        </div>
      </div>

      {/* ── TAB SELECTOR & SEARCH ────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#DFD9CA] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("assigned")}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs sm:px-4 sm:text-sm font-semibold transition-colors ${
              tab === "assigned"
                ? "bg-[#1F3622] text-white shadow-xs"
                : "bg-white border border-[#DFD9CA] text-[#4F5148] hover:bg-[#F3EFE6]"
            }`}
          >
            My Assigned Queue ({myTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("pool")}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs sm:px-4 sm:text-sm font-semibold transition-colors ${
              tab === "pool"
                ? "bg-[#1F3622] text-white shadow-xs"
                : "bg-white border border-[#DFD9CA] text-[#4F5148] hover:bg-[#F3EFE6]"
            }`}
          >
            Available Pool ({unassignedPool.length})
          </button>
        </div>

        <Input
          placeholder="Search tickets by keyword, location, unit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full sm:w-64 text-xs bg-white"
        />
      </div>

      {/* ── TASK CARDS GRID ──────────────────────────────────── */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : activeRows.length === 0 ? (
        <EmptyState
          icon={ClipboardText}
          title={tab === "assigned" ? "No assigned tasks right now" : "No unassigned tasks in pool"}
          body={
            tab === "assigned"
              ? "You're all caught up! Check the Available Pool tab to pick up unassigned maintenance complaints."
              : "All open society issues currently have technicians assigned."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activeRows.map((task) => {
            const isAssignedToMe = task.assigned_to === profile.id;
            const days = daysOpen(task.created_at, task.resolved_at);

            return (
              <div
                key={task.id}
                className="rounded-2xl border border-[#DFD9CA] bg-white p-5 shadow-xs flex flex-col justify-between hover:border-[#1F3622]/40 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-block rounded-md bg-[#EDF4EE] px-2.5 py-0.5 text-xs font-semibold text-[#1F3622]">
                      {task.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityTag priority={task.priority} />
                      <StatusPill status={task.status} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#111215] tracking-tight line-clamp-1">
                    {task.title}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {task.description || "No extra details provided."}
                  </p>

                  {/* Location & Resident info */}
                  <div className="mt-3.5 pt-3 border-t border-[#F0EBE0] space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <Buildings className="size-3.5 text-slate-400 shrink-0" />
                      <span>
                        {task.profiles?.block ? `${task.profiles.block}, ` : ""}
                        Unit {task.profiles?.unit_number ?? "—"}
                        {task.location ? ` (${task.location})` : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">
                          {task.profiles?.full_name ?? "Resident"}
                        </span>
                      </div>
                      {task.profiles?.phone && (
                        <a
                          href={`tel:${task.profiles.phone}`}
                          className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:underline"
                        >
                          <Phone className="size-3" />
                          {task.profiles.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-[#F0EBE0] flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Opened {days === 0 ? "today" : `${days}d ago`}
                  </span>

                  <div className="flex items-center gap-2">
                    {isAssignedToMe ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveComplaint(task);
                          setNextStatus(task.status === "open" ? "in_progress" : "resolved");
                        }}
                        className="h-8 text-xs bg-[#1F3622] text-white hover:bg-[#2E4E30] cursor-pointer"
                      >
                        Update Progress
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => claimTaskMut.mutate(task.id)}
                        disabled={claimTaskMut.isPending}
                        className="h-8 text-xs bg-[#1F3622] text-white hover:bg-[#2E4E30] cursor-pointer"
                      >
                        Claim Task
                      </Button>
                    )}
                    <Link
                      to="/complaints/$id"
                      params={{ id: task.id }}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium p-1"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── UPDATE PROGRESS MODAL ────────────────────────────── */}
      <Dialog
        open={Boolean(activeComplaint)}
        onOpenChange={(v) => {
          if (!v) {
            setActiveComplaint(null);
            setStatusNote("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Service Ticket</DialogTitle>
          </DialogHeader>

          {activeComplaint && (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Ticket Title</p>
                <p className="text-sm font-bold text-[#111215]">{activeComplaint.title}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Location: {activeComplaint.profiles?.block} Unit{" "}
                  {activeComplaint.profiles?.unit_number}{" "}
                  {activeComplaint.location ? `· ${activeComplaint.location}` : ""}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Update Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNextStatus("in_progress")}
                    className={`cursor-pointer rounded-xl border p-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      nextStatus === "in_progress"
                        ? "border-[#1F3622] bg-[#EDF4EE] text-[#1F3622]"
                        : "border-border bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Clock className="size-4" weight="bold" />
                    In Progress
                  </button>

                  <button
                    type="button"
                    onClick={() => setNextStatus("resolved")}
                    className={`cursor-pointer rounded-xl border p-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      nextStatus === "resolved"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-border bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle className="size-4" weight="bold" />
                    Mark Resolved
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Technician Work Note <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Inspected motor on pump #2, replaced fuse and confirmed pressure is normalized."
                  className="text-xs min-h-[90px]"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  This note is recorded in the ticket history and emailed to the resident.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveComplaint(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateStatusMut.mutate()}
                  disabled={updateStatusMut.isPending || statusNote.trim().length < 3}
                  className="text-xs bg-[#1F3622] text-white hover:bg-[#2E4E30] cursor-pointer"
                >
                  {updateStatusMut.isPending ? "Saving..." : "Submit Update"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
