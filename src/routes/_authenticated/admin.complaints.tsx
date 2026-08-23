import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Tray,
  Wrench,
  User,
  Plus,
  SquaresFour,
  ListDashes,
  DownloadSimple,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PriorityTag, StatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { fetchComplaints, assignComplaintServerFn, type ComplaintRow } from "@/lib/queries";
import { fetchStaffMembersServerFn } from "@/lib/auth.functions";
import { updateComplaintStatusServerFn } from "@/lib/complaints.functions";
import { CATEGORIES, STATUS_LABELS, daysOpen, type Priority, type Status } from "@/lib/societydesk";
import { cn } from "@/lib/utils";
import { notifyStatusChange } from "@/integrations/email/notify.functions";

export const Route = createFileRoute("/_authenticated/admin/complaints")({
  head: () => ({
    meta: [
      { title: "Manage complaints — SocietyDesk" },
      { name: "description", content: "Triage, assign staff, prioritise and resolve complaints." },
      { property: "og:title", content: "Manage complaints — SocietyDesk" },
      {
        property: "og:description",
        content: "Admin view to triage and assign society complaints.",
      },
    ],
  }),
  component: AdminComplaints,
});

function AdminComplaints() {
  const { session, profile, isAdmin, profileLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "all"],
    queryFn: () => fetchComplaints(),
    enabled: Boolean(isAdmin && profile?.role === "admin"),
  });

  const { data: staffList } = useQuery({
    queryKey: ["staff-members"],
    queryFn: () => fetchStaffMembersServerFn(),
    enabled: Boolean(isAdmin && profile?.role === "admin"),
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [view, setView] = useState<"list" | "board">("list");
  const [active, setActive] = useState<ComplaintRow | null>(null);
  const [nextStatus, setNextStatus] = useState<Status>("in_progress");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("none");
  const [note, setNote] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (category !== "all" && r.category !== category) return false;
      if (priority !== "all" && r.priority !== priority) return false;
      if (overdueOnly && !r.is_overdue) return false;
      if (staffFilter === "unassigned" && r.assigned_to) return false;
      if (staffFilter !== "all" && staffFilter !== "unassigned" && r.assigned_to !== staffFilter) {
        return false;
      }
      if (q) {
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = (r.description ?? "").toLowerCase().includes(q);
        const matchLoc = (r.location ?? "").toLowerCase().includes(q);
        const matchResident = (r.profiles?.full_name ?? "").toLowerCase().includes(q);
        const matchStaff = (r.assigned_profile?.full_name ?? "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchResident && !matchStaff) {
          return false;
        }
      }
      return true;
    });
  }, [data, search, status, category, priority, staffFilter, overdueOnly]);

  const setPriorityMut = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: Priority }) => {
      await updateComplaintStatusServerFn({
        data: {
          id,
          priority: value,
          actorId: profile?.id,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Priority updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignStaffMut = useMutation({
    mutationFn: async ({
      complaintId,
      staffId,
    }: {
      complaintId: string;
      staffId: string | null;
    }) => {
      await assignComplaintServerFn({
        data: {
          complaintId,
          staffId,
          actorId: profile?.id ?? null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Staff assignment updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeStatus = useMutation({
    mutationFn: async () => {
      if (!active) return;
      if (note.trim().length < 3) throw new Error("A note is required for every status change");

      // If staff changed in modal
      const newStaffId = selectedStaffId === "none" ? null : selectedStaffId;
      if (newStaffId !== active.assigned_to) {
        await assignComplaintServerFn({
          data: {
            complaintId: active.id,
            staffId: newStaffId,
            actorId: profile?.id ?? null,
          },
        });
      }

      await updateComplaintStatusServerFn({
        data: {
          id: active.id,
          status: nextStatus,
          oldStatus: active.status,
          note: note.trim().slice(0, 500),
          actorId: profile?.id,
        },
      });
    },
    onSuccess: () => {
      if (active) {
        notifyStatusChange({
          data: {
            complaintId: active.id,
            oldStatus: active.status,
            newStatus: nextStatus,
            note: note.trim().slice(0, 500),
          },
        }).catch((err) => console.error("Email notification failed:", err));
      }
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Complaint status changed to ${STATUS_LABELS[nextStatus]}`);
      setActive(null);
      setNote("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportCsv = () => {
    const header = "id,title,category,status,priority,assigned_staff,overdue,created_at\n";
    const body = rows
      .map((r) =>
        [
          r.id,
          `"${r.title.replace(/"/g, '""')}"`,
          r.category,
          r.status,
          r.priority,
          `"${r.assigned_profile?.full_name || "Unassigned"}"`,
          r.is_overdue,
          r.created_at,
        ].join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDialog = (r: ComplaintRow) => {
    setActive(r);
    setNextStatus(
      r.status === "resolved" ? "open" : r.status === "open" ? "in_progress" : "resolved",
    );
    setSelectedStaffId(r.assigned_to ?? "none");
    setNote("");
  };

  if (profileLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (!profile || !isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111215]">Complaints & Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} tickets matching filters · Triage, prioritize and assign technicians.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#DFD9CA] bg-white p-0.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setView("list")}
              className={cn(
                "h-7 px-2.5 text-xs cursor-pointer",
                view === "list" && "bg-[#EDF4EE] text-[#1F3622] font-semibold",
              )}
            >
              <ListDashes className="mr-1 size-3.5" /> List
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setView("board")}
              className={cn(
                "h-7 px-2.5 text-xs cursor-pointer",
                view === "board" && "bg-[#EDF4EE] text-[#1F3622] font-semibold",
              )}
            >
              <SquaresFour className="mr-1 size-3.5" /> Board
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={exportCsv}
            className="h-8 text-xs cursor-pointer bg-white"
          >
            <DownloadSimple className="mr-1.5 size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Input
          placeholder="Search complaints, resident, technician…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-xs bg-white"
        />

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue placeholder="Staff Assignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="unassigned">Unassigned Only</SelectItem>
            {(staffList ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={overdueOnly ? "default" : "outline"}
          onClick={() => setOverdueOnly(!overdueOnly)}
          className="h-9 text-xs cursor-pointer bg-white"
        >
          {overdueOnly ? "Overdue (Active)" : "Overdue Only"}
        </Button>
      </div>

      {/* ── COMPLAINT CONTENT ─────────────────────────────────── */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Tray} title="No complaints match" body="Try clearing a filter or two." />
      ) : view === "board" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {(["open", "in_progress", "resolved"] as const).map((s) => (
            <div key={s} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {STATUS_LABELS[s]} ({rows.filter((r) => r.status === s).length})
              </h2>
              {rows
                .filter((r) => r.status === s)
                .map((r) => (
                  <ComplaintCard
                    key={r.id}
                    row={r}
                    staffList={staffList ?? []}
                    onManage={() => openDialog(r)}
                    onAssign={(staffId) => assignStaffMut.mutate({ complaintId: r.id, staffId })}
                  />
                ))}
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <ComplaintCard
              key={r.id}
              row={r}
              staffList={staffList ?? []}
              onManage={() => openDialog(r)}
              wide
              onPriority={(value) => setPriorityMut.mutate({ id: r.id, value })}
              onAssign={(staffId) => assignStaffMut.mutate({ complaintId: r.id, staffId })}
            />
          ))}
        </ul>
      )}

      {/* ── MANAGE & ASSIGN DIALOG ────────────────────────────── */}
      <Dialog open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Complaint</DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-sm font-bold text-[#111215]">{active.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {active.category} · {active.profiles?.block} Unit {active.profiles?.unit_number} (
                  {active.profiles?.full_name})
                </p>
              </div>

              {/* Staff Assignment Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Assign Technician / Staff</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger className="text-xs bg-white">
                    <SelectValue placeholder="Select Staff Member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {(staffList ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name} {s.phone ? `(${s.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Priority</Label>
                <Select
                  value={active.priority}
                  onValueChange={(v) =>
                    setPriorityMut.mutate({ id: active.id, value: v as Priority })
                  }
                >
                  <SelectTrigger className="text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {active.status === "resolved" ? "Reopen as" : "Change Status to"}
                </Label>
                <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as Status)}>
                  <SelectTrigger className="text-xs bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["open", "in_progress", "resolved"] as const)
                      .filter((s) => s !== active.status)
                      .map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Note */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {active.status === "resolved"
                    ? "Reason for Reopening *"
                    : "Action / Progress Note *"}
                </Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain the update, assigned task, or resolution details..."
                  className="text-xs min-h-[80px]"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button asChild variant="outline" size="sm" className="text-xs cursor-pointer">
                  <Link to="/complaints/$id" params={{ id: active.id }}>
                    Open Details
                  </Link>
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActive(null)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => changeStatus.mutate()}
                    disabled={changeStatus.isPending || note.trim().length < 3}
                    className="text-xs bg-[#1F3622] text-white hover:bg-[#2E4E30] cursor-pointer"
                  >
                    {changeStatus.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ComplaintCard({
  row,
  staffList,
  onManage,
  onPriority,
  onAssign,
  wide,
}: {
  row: ComplaintRow;
  staffList: { id: string; full_name: string }[];
  onManage: () => void;
  onPriority?: (value: Priority) => void;
  onAssign?: (staffId: string | null) => void;
  wide?: boolean;
}) {
  return (
    <li
      className={cn(
        "rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs list-none hover:border-[#1F3622]/40 transition-colors",
        row.is_overdue && "border-amber-300 bg-amber-50/40",
      )}
    >
      <div
        className={cn(
          "gap-3",
          wide ? "flex flex-wrap items-center justify-between" : "space-y-2.5",
        )}
      >
        <div className="min-w-0">
          <Link
            to="/complaints/$id"
            params={{ id: row.id }}
            className="font-semibold text-slate-900 hover:text-[#1F3622] hover:underline block truncate"
          >
            {row.title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-medium text-slate-700">{row.category}</span>
            {row.location ? ` · ${row.location}` : ""} · {row.profiles?.block ?? ""} Unit{" "}
            {row.profiles?.unit_number ?? "—"} ({row.profiles?.full_name ?? "Resident"}) ·{" "}
            {daysOpen(row.created_at, row.resolved_at)}d
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Assigned Technician Badge */}
          {row.assigned_profile ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-full px-2 py-0.5">
              <Wrench className="size-3 text-emerald-700" />
              {row.assigned_profile.full_name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
              Unassigned
            </span>
          )}

          <StatusPill status={row.status} overdue={row.is_overdue} />
          <PriorityTag priority={row.priority} />

          {onPriority ? (
            <Select value={row.priority} onValueChange={(v) => onPriority(v as Priority)}>
              <SelectTrigger className="h-8 w-24 text-xs bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            onClick={onManage}
            className="h-8 text-xs cursor-pointer bg-white"
          >
            Manage
          </Button>
        </div>
      </div>
    </li>
  );
}
