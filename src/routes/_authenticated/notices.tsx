import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, PushPin } from "@phosphor-icons/react";

import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNotices } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notices")({
  head: () => ({
    meta: [
      { title: "Notice Board — SocietyDesk" },
      { name: "description", content: "Society announcements, with important notices pinned." },
      { property: "og:title", content: "Notice Board — SocietyDesk" },
      { property: "og:description", content: "Latest announcements from your society office." },
    ],
  }),
  component: NoticeBoard,
});

function NoticeBoard() {
  const { data, isLoading } = useQuery({ queryKey: ["notices"], queryFn: fetchNotices });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notice board</h1>
        <p className="text-sm text-muted-foreground">Announcements from the society office.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices yet"
          body="When the office publishes an announcement it will appear here."
        />
      ) : (
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
                {n.is_important ? (
                  <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2 py-1 text-xs font-semibold text-warning-foreground">
                    <PushPin className="size-3" weight="fill" /> Important
                  </span>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{n.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {n.profiles?.full_name ?? "Society office"} ·{" "}
                {new Date(n.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
