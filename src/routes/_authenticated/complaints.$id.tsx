import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChatCircleDots,
  Star,
  Wrench,
  Phone,
  User,
  Buildings,
  CheckCircle,
} from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

import { PriorityTag, StatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchComments,
  fetchComplaint,
  fetchHistory,
  photoUrl,
  assignComplaintServerFn,
} from "@/lib/queries";
import { fetchStaffMembersServerFn } from "@/lib/auth.functions";
import {
  addComplaintCommentServerFn,
  addResolutionFeedbackServerFn,
} from "@/lib/complaints.functions";
import { STATUS_LABELS, daysOpen } from "@/lib/societydesk";
import { cn } from "@/lib/utils";
import { SocietyMaintenanceLoader } from "@/components/society-loader";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({
    meta: [
      { title: "Complaint Details — SocietyDesk" },
      { name: "description", content: "Full history, technician assignments, photos and updates." },
      { property: "og:title", content: "Complaint Details — SocietyDesk" },
      { property: "og:description", content: "Follow technician progress and every update." },
    ],
  }),
  component: ComplaintDetail,
});

function ComplaintDetail() {
  const { id } = useParams({ from: "/_authenticated/complaints/$id" });
  const { session, profile, isAdmin, isStaff } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState("");

  const complaintQ = useQuery({ queryKey: ["complaint", id], queryFn: () => fetchComplaint(id) });
  const historyQ = useQuery({ queryKey: ["history", id], queryFn: () => fetchHistory(id) });
  const commentsQ = useQuery({ queryKey: ["comments", id], queryFn: () => fetchComments(id) });
  const feedbackQ = useQuery<{ rating: number; comment?: string | null } | null>({
    queryKey: ["feedback", id],
    queryFn: async () => {
      return null;
    },
  });

  const { data: staffList } = useQuery({
    queryKey: ["staff-members"],
    queryFn: () => fetchStaffMembersServerFn(),
    enabled: Boolean(isAdmin),
  });

  const assignStaffMut = useMutation({
    mutationFn: async (staffId: string | null) => {
      await assignComplaintServerFn({
        data: {
          complaintId: id,
          staffId,
          actorId: profile?.id ?? null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaint", id] });
      queryClient.invalidateQueries({ queryKey: ["history", id] });
      toast.success("Technician assigned");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const text = comment.trim();
      if (text.length < 2) throw new Error("Write a longer comment");
      if (!profile?.id) throw new Error("Please sign in");
      await addComplaintCommentServerFn({
        data: {
          complaintId: id,
          authorId: profile.id,
          comment: text.slice(0, 1000),
        },
      });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      toast.success("Comment added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitFeedback = useMutation({
    mutationFn: async () => {
      if (rating < 1) throw new Error("Pick a rating first");
      await addResolutionFeedbackServerFn({
        data: {
          complaintId: id,
          rating,
          comment: feedbackNote.trim().slice(0, 500) || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback", id] });
      toast.success("Thanks for the feedback");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (complaintQ.isLoading)
    return (
      <SocietyMaintenanceLoader
        fullScreen
        text="Loading complaint timeline and resolution records..."
      />
    );
  const c = complaintQ.data;
  if (!c) return <p className="text-muted-foreground">Complaint not found.</p>;

  const isOwner = c.resident_id === session?.user.id;
  const backDestination = isAdmin ? "/admin/complaints" : isStaff ? "/staff" : "/complaints";

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to={backDestination}>
          <ArrowLeft className="size-4 mr-1" /> Back
        </Link>
      </Button>

      {/* Main Complaint Overview */}
      <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111215]">{c.title}</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {c.category}
              {c.location ? ` · ${c.location}` : ""} · raised{" "}
              {new Date(c.created_at).toLocaleDateString()} ·{" "}
              {daysOpen(c.created_at, c.resolved_at)}d
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={c.status} overdue={c.is_overdue} />
            <PriorityTag priority={c.priority} />
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {c.description}
        </p>

        {c.complaint_photos && c.complaint_photos.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {c.complaint_photos.map((p) => (
              <button
                key={p.id}
                onClick={() => setLightbox(photoUrl(p.storage_path))}
                className="cursor-pointer overflow-hidden rounded-xl border border-[#DFD9CA] hover:opacity-90"
              >
                <img
                  src={photoUrl(p.storage_path)}
                  alt="Complaint photo"
                  className="size-20 sm:size-24 object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        {/* Resident Location & Info */}
        {c.profiles ? (
          <div className="rounded-xl bg-[#FAF8F2] border border-[#E9E4D7] p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Buildings className="size-4 text-slate-400" />
              <span>
                <strong>Resident:</strong> {c.profiles.full_name} · {c.profiles.block} Unit{" "}
                {c.profiles.unit_number}
              </span>
            </div>
            {c.profiles.phone && (
              <a
                href={`tel:${c.profiles.phone}`}
                className="inline-flex items-center gap-1 font-semibold text-[#1F3622] hover:underline"
              >
                <Phone className="size-3.5" /> {c.profiles.phone}
              </a>
            )}
          </div>
        ) : null}
      </div>

      {/* ── ASSIGNED TECHNICIAN CARD ──────────────────────────── */}
      <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Wrench className="size-5" weight="bold" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Technician
              </span>
              <p className="text-sm font-bold text-slate-900">
                {c.assigned_profile?.full_name ?? "No technician assigned yet"}
              </p>
              {c.assigned_profile?.phone && (
                <p className="text-xs text-emerald-800 font-medium">
                  Contact:{" "}
                  <a href={`tel:${c.assigned_profile.phone}`} className="hover:underline">
                    {c.assigned_profile.phone}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Admin / Staff Reassignment actions - only when not resolved */}
          {isAdmin && c.status !== "resolved" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Reassign:</span>
              <Select
                value={c.assigned_to ?? "none"}
                onValueChange={(val) => {
                  assignStaffMut.mutate(val === "none" ? null : val);
                }}
              >
                <SelectTrigger className="h-8 w-40 sm:w-44 text-xs bg-white">
                  <SelectValue placeholder="Assign Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {(staffList ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isStaff && c.status !== "resolved" && !c.assigned_to && (
            <Button
              size="sm"
              onClick={() => assignStaffMut.mutate(profile?.id ?? null)}
              className="bg-[#1F3622] text-white hover:bg-[#2E4E30] text-xs cursor-pointer"
            >
              Claim This Ticket
            </Button>
          )}
        </div>
      </div>

      {/* ── TIMELINE HISTORY ──────────────────────────────────── */}
      <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#111215]">
          Activity History
        </h2>
        <ol className="mt-4 space-y-4">
          {(historyQ.data ?? []).map((h) => (
            <li key={h.id} className="relative border-l border-[#DFD9CA] pl-5">
              <span className="absolute -left-1 top-1.5 size-2 rounded-full bg-[#1F3622]" />
              <p className="text-sm font-semibold text-slate-900">
                {h.old_status ? `${STATUS_LABELS[h.old_status]} → ` : ""}
                {h.new_status ? STATUS_LABELS[h.new_status] : "Update"}
              </p>
              {h.note ? <p className="text-xs text-slate-700 mt-0.5">{h.note}</p> : null}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {h.profiles?.full_name ?? "System"} ({h.profiles?.role ?? "system"}) ·{" "}
                {new Date(h.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {(historyQ.data ?? []).length === 0 ? (
            <li className="text-xs text-muted-foreground">No updates yet.</li>
          ) : null}
        </ol>
      </div>

      {/* ── RATING & FEEDBACK ──────────────────────────────────── */}
      {c.status === "resolved" && isOwner ? (
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-xs space-y-3">
          <h2 className="text-base font-semibold">Rate the resolution</h2>
          {feedbackQ.data ? (
            <p className="text-sm text-muted-foreground">
              You rated this {feedbackQ.data.rating}/5.
              {feedbackQ.data.comment ? ` “${feedbackQ.data.comment}”` : ""}
            </p>
          ) : (
            <>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                    <Star
                      weight={n <= rating ? "fill" : "regular"}
                      className={cn(
                        "size-6 cursor-pointer",
                        n <= rating ? "text-amber-500" : "text-slate-300",
                      )}
                    />
                  </button>
                ))}
              </div>
              <Textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Anything else to add? (optional)"
                maxLength={500}
                className="text-xs"
              />
              <Button
                size="sm"
                onClick={() => submitFeedback.mutate()}
                className="bg-[#1F3622] text-white"
              >
                Submit feedback
              </Button>
            </>
          )}
        </div>
      ) : null}

      {/* ── COMMENTS ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#DFD9CA] bg-white p-6 shadow-xs space-y-4">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#111215]">
          <ChatCircleDots className="size-4 text-[#1F3622]" /> Comments & Notes
        </h2>
        <ul className="space-y-3">
          {(commentsQ.data ?? []).map((cm) => (
            <li key={cm.id} className="rounded-xl bg-[#FAF8F2] border border-[#E9E4D7] p-3 text-xs">
              <p className="text-slate-800">{cm.comment}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {cm.profiles?.full_name ?? "User"} · {new Date(cm.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {(commentsQ.data ?? []).length === 0 ? (
            <li className="text-xs text-muted-foreground">No comments yet.</li>
          ) : null}
        </ul>
        {c.status !== "resolved" ? (
          <div className="space-y-2 pt-2 border-t border-[#F0EBE0]">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a clarification or update…"
              maxLength={1000}
              className="text-xs"
            />
            <Button
              size="sm"
              onClick={() => addComment.mutate()}
              disabled={addComment.isPending}
              className="bg-[#1F3622] text-white hover:bg-[#2E4E30] text-xs cursor-pointer"
            >
              Post comment
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog open={Boolean(lightbox)} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl">
          {lightbox ? (
            <img src={lightbox} alt="Complaint photo" className="w-full rounded-lg" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
