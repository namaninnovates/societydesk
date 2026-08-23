import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PushPin } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchNotices } from "@/lib/queries";
import { createNoticeServerFn, deleteNoticeServerFn } from "@/lib/complaints.functions";
import { cn } from "@/lib/utils";
import { notifyImportantNotice } from "@/integrations/email/notify.functions";

export const Route = createFileRoute("/_authenticated/admin/notices")({
  head: () => ({
    meta: [
      { title: "Publish notices — SocietyDesk" },
      { name: "description", content: "Create and pin society-wide announcements." },
      { property: "og:title", content: "Publish notices — SocietyDesk" },
      { property: "og:description", content: "Admin notice board management." },
    ],
  }),
  component: AdminNotices,
});

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  body: z.string().trim().min(3, "Write a notice body").max(4000),
});

function AdminNotices() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["notices"], queryFn: fetchNotices });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [important, setImportant] = useState(false);

  const publish = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ title, body });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
      if (!profile?.id) throw new Error("Authentication required");
      return await createNoticeServerFn({
        data: {
          title: parsed.data.title,
          body: parsed.data.body,
          isImportant: important,
          authorId: profile.id,
        },
      });
    },
    onSuccess: async (noticeData) => {
      toast.success("Notice published");
      setTitle("");
      setBody("");
      setImportant(false);
      queryClient.invalidateQueries({ queryKey: ["notices"] });

      // If marked important, dispatch background email notification to residents
      if (important && noticeData) {
        try {
          const res = await notifyImportantNotice({
            data: {
              noticeTitle: String(noticeData["title"] ?? ""),
              noticeBody: String(noticeData["body"] ?? ""),
            },
          });
          if (res?.sent) {
            toast.info(`Email sent to ${res.count} resident(s)`);
          }
        } catch (emailErr) {
          console.warn("Background email notification failed:", emailErr);
        }
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await deleteNoticeServerFn({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Notice deleted");
      queryClient.invalidateQueries({ queryKey: ["notices"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notice Board</h1>
        <p className="text-sm text-muted-foreground">
          Post announcements visible to every resident.
        </p>
      </div>

      <div className="surface space-y-4 p-5">
        <h2 className="text-base font-semibold">New notice</h2>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={4000}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch id="important" checked={important} onCheckedChange={setImportant} />
          <Label htmlFor="important">Mark as important (pinned)</Label>
        </div>
        <Button onClick={() => publish.mutate()} disabled={publish.isPending}>
          Publish notice
        </Button>
      </div>

      <ul className="space-y-3">
        {(data ?? []).map((n) => (
          <li
            key={n.id}
            className={cn(
              "surface p-5",
              n.is_important && "border border-warning/40 bg-warning-soft/50",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold">{n.title}</h2>
              <div className="flex items-center gap-2">
                {n.is_important ? <PushPin className="size-4 text-warning" weight="fill" /> : null}
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(n.id)}>
                  Delete
                </Button>
              </div>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{n.body}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
