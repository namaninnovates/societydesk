import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardText, PlusCircle, MagnifyingGlass, Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PriorityTag, StatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { fetchComplaints, photoUrl, type ComplaintRow } from "@/lib/queries";
import { CATEGORIES, CATEGORY_ICONS, daysOpen } from "@/lib/societydesk";
import { ComplaintsTableSkeleton } from "@/components/society-loader";
import { deleteComplaintServerFn } from "@/lib/complaints.functions";

export const Route = createFileRoute("/_authenticated/complaints/")({
  head: () => ({
    meta: [
      { title: "My Complaints — SocietyDesk" },
      { name: "description", content: "Track the maintenance complaints you have raised." },
      { property: "og:title", content: "My Complaints — SocietyDesk" },
      { property: "og:description", content: "Track your society maintenance complaints." },
    ],
  }),
  component: MyComplaints,
});

function MyComplaints() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ComplaintRow | null>(null);

  const deleteComplaint = useMutation({
    mutationFn: async (complaintId: string) => {
      if (!profile?.id) throw new Error("Please sign in");
      await deleteComplaintServerFn({
        data: {
          complaintId,
          requesterId: profile.id,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint removed successfully");
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "mine", profile?.id],
    enabled: !!profile?.id,
    queryFn: () => fetchComplaints({ residentId: profile!.id }),
  });

  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (c) =>
          (status === "all" || c.status === status) &&
          (category === "all" || c.category === category) &&
          (q.trim() === "" || c.title.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [data, status, category, q],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My complaints</h1>
          <p className="text-sm text-muted-foreground">Track resolution status and updates.</p>
        </div>
        <Button asChild>
          <Link to="/complaints/new">
            <PlusCircle className="size-4" /> Raise complaint
          </Link>
        </Button>
      </div>

      <div className="surface flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search complaints…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
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
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#111215]">Remove Complaint?</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to remove &ldquo;{deleteTarget?.title}&rdquo;? This will
                withdraw the complaint from the active maintenance queue. This action cannot be
                undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteComplaint.isPending}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => deleteTarget && deleteComplaint.mutate(deleteTarget.id)}
                disabled={deleteComplaint.isPending}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer text-xs gap-1.5"
              >
                <Trash className="size-3.5" />
                <span>{deleteComplaint.isPending ? "Removing..." : "Confirm Remove"}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <ComplaintsTableSkeleton count={3} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardText}
          title="No complaints yet"
          body="When you report a maintenance issue it will show up here with its live status."
          action={
            <Button asChild size="sm">
              <Link to="/complaints/new">Raise your first complaint</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => {
            const Icon = CATEGORY_ICONS[c.category] ?? ClipboardText;
            const thumb = c.complaint_photos?.[0];
            return (
              <li key={c.id} className="relative group">
                <Link
                  to="/complaints/$id"
                  params={{ id: c.id }}
                  className="surface flex items-center gap-4 p-4 transition-shadow hover:shadow-lift pr-12 sm:pr-24"
                >
                  {thumb ? (
                    <img
                      src={photoUrl(thumb.storage_path)}
                      alt=""
                      className="size-14 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="size-5 text-primary" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.category}
                      {c.location ? ` · ${c.location}` : ""} ·{" "}
                      {c.status === "resolved"
                        ? `resolved in ${daysOpen(c.created_at, c.resolved_at)}d`
                        : `${daysOpen(c.created_at)}d open`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusPill status={c.status} overdue={c.is_overdue} />
                      <PriorityTag priority={c.priority} />
                    </div>
                  </div>
                </Link>

                {/* Quick Remove Button */}
                <button
                  type="button"
                  title="Remove complaint"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(c);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <Trash className="size-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
