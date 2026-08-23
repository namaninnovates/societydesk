import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Tray } from "@phosphor-icons/react";
import { useMemo, useState, useRef } from "react";
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
import { fetchComplaints, type ComplaintRow } from "@/lib/queries";
import { updateComplaintStatusServerFn } from "@/lib/complaints.functions";
import { CATEGORIES, STATUS_LABELS, daysOpen, type Priority, type Status } from "@/lib/societydesk";
import { cn } from "@/lib/utils";
import { notifyStatusChange } from "@/integrations/email/notify.functions";

export const Route = createFileRoute("/_authenticated/admin/complaints")({
  head: () => ({
    meta: [
      { title: "Manage complaints — SocietyDesk" },
      { name: "description", content: "Triage, prioritise and resolve society complaints." },
      { property: "og:title", content: "Manage complaints — SocietyDesk" },
      { property: "og:description", content: "Admin view of every complaint in the society." },
    ],
  }),
  component: AdminComplaints,
});

function AdminComplaints() {
  const { session, profile } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "all"],
    queryFn: () => fetchComplaints(),
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [view, setView] = useState<"list" | "board">("list");
  const [active, setActive] = useState<ComplaintRow | null>(null);
  const [nextStatus, setNextStatus] = useState<Status>("in_progress");
  const [note, setNote] = useState("");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? []).filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (category === "all" || r.category === category) &&
        (priority === "all" || r.priority === priority) &&
        (!overdueOnly || r.is_overdue) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.location ?? "").toLowerCase().includes(q)),
    );
  }, [data, search, status, category, priority, overdueOnly]);

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

  const changeStatus = useMutation({
    mutationFn: async () => {
      if (!active) return;
      if (note.trim().length < 3) throw new Error("A note is required for every status change");
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
    const header = "id,title,category,status,priority,overdue,created_at\n";
    const body = rows
      .map((r) =>
        [
          r.id,
          `"${r.title.replace(/"/g, '""')}"`,
          r.category,
          r.status,
          r.priority,
          r.is_overdue,
          r.created_at,
        ].join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([header + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDialog = (c: ComplaintRow) => {
    setActive(c);
    setNextStatus(
      c.status === "open" ? "in_progress" : c.status === "in_progress" ? "resolved" : "open",
    );
    setNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-sm text-muted-foreground">{rows.length} shown</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === "list" ? "board" : "list")}
          >
            {view === "list" ? "Kanban view" : "List view"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="surface grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(["open", "in_progress", "resolved"] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={overdueOnly ? "default" : "outline"}
          onClick={() => setOverdueOnly(!overdueOnly)}
        >
          Overdue only
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Tray} title="No complaints match" body="Try clearing a filter or two." />
      ) : view === "board" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {(["open", "in_progress", "resolved"] as const).map((s) => (
            <div key={s} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {STATUS_LABELS[s]} ({rows.filter((r) => r.status === s).length})
              </h2>
              {rows
                .filter((r) => r.status === s)
                .map((r) => (
                  <ComplaintCard key={r.id} row={r} onManage={() => openDialog(r)} />
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
              onManage={() => openDialog(r)}
              wide
              onPriority={(value) => setPriorityMut.mutate({ id: r.id, value })}
            />
          ))}
        </ul>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{active?.title}</DialogTitle>
          </DialogHeader>
          {active ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={active.priority}
                  onValueChange={(v) =>
                    setPriorityMut.mutate({ id: active.id, value: v as Priority })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{active.status === "resolved" ? "Reopen as" : "Change status to"}</Label>
                <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as Status)}>
                  <SelectTrigger>
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
              <div className="space-y-1.5">
                <Label>
                  {active.status === "resolved" ? "Reason for reopening" : "Note (required)"}
                </Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => changeStatus.mutate()} disabled={changeStatus.isPending}>
                  Save update
                </Button>
                <Button asChild variant="outline">
                  <Link to="/complaints/$id" params={{ id: active.id }}>
                    Open detail
                  </Link>
                </Button>
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
  onManage,
  onPriority,
  wide,
}: {
  row: ComplaintRow;
  onManage: () => void;
  onPriority?: (value: Priority) => void;
  wide?: boolean;
}) {
  return (
    <li
      className={cn(
        "surface list-none p-4",
        row.is_overdue && "border border-warning/40 bg-warning-soft/40",
      )}
    >
      <div
        className={cn("gap-3", wide ? "flex flex-wrap items-center justify-between" : "space-y-2")}
      >
        <div className="min-w-0">
          <Link
            to="/complaints/$id"
            params={{ id: row.id }}
            className="font-semibold hover:underline"
          >
            {row.title}
          </Link>
          <p className="text-xs text-muted-foreground">
            {row.category}
            {row.location ? ` · ${row.location}` : ""} · {row.profiles?.block ?? ""}{" "}
            {row.profiles?.unit_number ?? ""} · {daysOpen(row.created_at, row.resolved_at)}d
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={row.status} overdue={row.is_overdue} />
          <PriorityTag priority={row.priority} />
          {onPriority ? (
            <Select value={row.priority} onValueChange={(v) => onPriority(v as Priority)}>
              <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
          <Button size="sm" variant="outline" onClick={onManage}>
            Manage
          </Button>
        </div>
      </div>
    </li>
  );
}
