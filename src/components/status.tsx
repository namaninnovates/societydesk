import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, STATUS_LABELS, type Priority, type Status } from "@/lib/societydesk";

export function StatusPill({
  status,
  overdue,
  className,
}: {
  status: Status;
  overdue?: boolean;
  className?: string;
}) {
  if (overdue && status !== "resolved") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-foreground",
          className,
        )}
      >
        <span className="pulse-dot size-1.5 rounded-full bg-warning" />
        Overdue
      </span>
    );
  }

  const styles: Record<Status, string> = {
    open: "bg-neutral-soft text-foreground/70",
    in_progress: "bg-info-soft text-info-foreground",
    resolved: "bg-success-soft text-success-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityTag({ priority, className }: { priority: Priority; className?: string }) {
  const styles: Record<Priority, string> = {
    low: "bg-neutral-soft text-muted-foreground",
    medium: "bg-info-soft text-info-foreground",
    high: "bg-destructive/12 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        styles[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
