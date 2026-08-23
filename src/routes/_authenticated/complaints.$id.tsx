import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ChatCircleDots, Star } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";

import { PriorityTag, StatusPill } from "@/components/status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { fetchComments, fetchComplaint, fetchHistory, photoUrl } from "@/lib/queries";
import {
  addComplaintCommentServerFn,
  addResolutionFeedbackServerFn,
} from "@/lib/complaints.functions";
import { STATUS_LABELS, daysOpen } from "@/lib/societydesk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({
    meta: [
      { title: "Complaint details — SocietyDesk" },
      { name: "description", content: "Full history, photos and updates for this complaint." },
      { property: "og:title", content: "Complaint details — SocietyDesk" },
      { property: "og:description", content: "Follow every update on your complaint." },
    ],
  }),
  component: ComplaintDetail,
});

function ComplaintDetail() {
  const { id } = useParams({ from: "/_authenticated/complaints/$id" });
  const { session, profile, isAdmin } = useAuth();
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

  if (complaintQ.isLoading) return <Skeleton className="h-72 w-full rounded-xl" />;
  const c = complaintQ.data;
  if (!c) return <p className="text-muted-foreground">Complaint not found.</p>;

  const isOwner = c.resident_id === session?.user.id;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to={isAdmin ? "/admin/complaints" : "/complaints"}>
          <ArrowLeft className="size-4" /> Back
        </Link>
      </Button>

      <div className="surface space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{c.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {c.category}
              {c.location ? ` · ${c.location}` : ""} · raised{" "}
              {new Date(c.created_at).toLocaleDateString()} ·{" "}
              {daysOpen(c.created_at, c.resolved_at)}d
            </p>
          </div>
          <div className="flex gap-2">
            <StatusPill status={c.status} overdue={c.is_overdue} />
            <PriorityTag priority={c.priority} />
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.description}</p>

        {c.complaint_photos && c.complaint_photos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {c.complaint_photos.map((p) => (
              <button key={p.id} onClick={() => setLightbox(photoUrl(p.storage_path))}>
                <img
                  src={photoUrl(p.storage_path)}
                  alt="Complaint photo"
                  className="size-24 rounded-lg object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        {isAdmin && c.profiles ? (
          <div className="rounded-lg bg-muted/60 p-3 text-sm">
            <span className="font-medium">{c.profiles.full_name}</span> · {c.profiles.block}{" "}
            {c.profiles.unit_number} · {c.profiles.phone}
          </div>
        ) : null}
      </div>

      <div className="surface p-6">
        <h2 className="text-base font-semibold">History</h2>
        <ol className="mt-4 space-y-4">
          {(historyQ.data ?? []).map((h) => (
            <li key={h.id} className="relative border-l border-border pl-5">
              <span className="absolute -left-1 top-1.5 size-2 rounded-full bg-primary" />
              <p className="text-sm font-medium">
                {h.old_status ? `${STATUS_LABELS[h.old_status]} → ` : ""}
                {h.new_status ? STATUS_LABELS[h.new_status] : "Update"}
              </p>
              {h.note ? <p className="text-sm text-muted-foreground">{h.note}</p> : null}
              <p className="mt-0.5 text-xs text-muted-foreground">
                {h.profiles?.full_name ?? "System"} ({h.profiles?.role ?? "system"}) ·{" "}
                {new Date(h.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {(historyQ.data ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No updates yet.</li>
          ) : null}
        </ol>
      </div>

      {c.status === "resolved" && isOwner ? (
        <div className="surface space-y-3 p-6">
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
                        "size-6",
                        n <= rating ? "text-warning" : "text-muted-foreground",
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
              />
              <Button size="sm" onClick={() => submitFeedback.mutate()}>
                Submit feedback
              </Button>
            </>
          )}
        </div>
      ) : null}

      <div className="surface space-y-4 p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ChatCircleDots className="size-4 text-primary" /> Comments
        </h2>
        <ul className="space-y-3">
          {(commentsQ.data ?? []).map((cm) => (
            <li key={cm.id} className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm">{cm.comment}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {cm.profiles?.full_name ?? "User"} · {new Date(cm.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {(commentsQ.data ?? []).length === 0 ? (
            <li className="text-sm text-muted-foreground">No comments yet.</li>
          ) : null}
        </ul>
        {c.status !== "resolved" ? (
          <div className="space-y-2">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a clarification…"
              maxLength={1000}
            />
            <Button size="sm" onClick={() => addComment.mutate()} disabled={addComment.isPending}>
              Post comment
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl">
          {lightbox ? (
            <img src={lightbox} alt="Complaint photo" className="w-full rounded-lg" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
