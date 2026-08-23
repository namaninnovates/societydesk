import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchOverdueThresholdsServerFn,
  updateOverdueThresholdServerFn,
} from "@/lib/complaints.functions";
import { CATEGORIES } from "@/lib/societydesk";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SocietyDesk" },
      { name: "description", content: "Configure overdue thresholds per category." },
      { property: "og:title", content: "Settings — SocietyDesk" },
      { property: "og:description", content: "Society-level SocietyDesk configuration." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { profile, isAdmin, profileLoading } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["thresholds"],
    queryFn: async () => {
      return await fetchOverdueThresholdsServerFn();
    },
    enabled: Boolean(isAdmin && profile?.role === "admin"),
  });

  const [draft, setDraft] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: async ({ category, days }: { category: string | null; days: number }) => {
      if (!Number.isFinite(days) || days < 1 || days > 90) throw new Error("Enter 1–90 days");
      await updateOverdueThresholdServerFn({
        data: {
          category: category ?? "Other",
          days,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thresholds"] });
      toast.success("Threshold saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const recalc = useMutation({
    mutationFn: async () => {
      // Invalidate complaints queries to refresh overdue calculations
      await queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
    onSuccess: () => {
      toast.success("Overdue flags refreshed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (profileLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (!profile || !isAdmin) return null;
  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  const valueFor = (category: string | null) => {
    const key = category ?? "__global";
    if (draft[key] !== undefined) return draft[key];
    const row = (data ?? []).find((t) => (t.category ?? null) === category);
    return row ? String(row.days) : "";
  };

  const rows: { key: string; category: string | null; label: string }[] = [
    { key: "__global", category: null, label: "Global default" },
    ...CATEGORIES.map((c) => ({ key: c, category: c as string | null, label: c })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          A complaint becomes overdue after this many days without resolution.
        </p>
      </div>

      <div className="surface space-y-4 p-6">
        {rows.map((r) => (
          <div key={r.key} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={r.key}>{r.label}</Label>
              <Input
                id={r.key}
                type="number"
                min={1}
                max={90}
                placeholder="Uses global default"
                value={valueFor(r.category)}
                onChange={(e) => setDraft({ ...draft, [r.key]: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              onClick={() =>
                save.mutate({ category: r.category, days: Number(valueFor(r.category)) })
              }
            >
              Save
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={() => recalc.mutate()} disabled={recalc.isPending}>
        Recalculate overdue now
      </Button>
    </div>
  );
}
