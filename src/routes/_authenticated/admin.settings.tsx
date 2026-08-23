import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Check,
  FloppyDisk,
  ArrowsClockwise,
  ShieldCheck,
  Sparkle,
  Plus,
  Minus,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchOverdueThresholdsServerFn,
  updateAllOverdueThresholdsServerFn,
} from "@/lib/complaints.functions";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/societydesk";
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

  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize drafts when server data arrives
  useEffect(() => {
    if (data) {
      const initial: Record<string, number> = {};
      const globalRow = data.find((t) => !t.category || t.category === "__global");
      initial["__global"] = globalRow ? Number(globalRow.days) : 3;

      for (const cat of CATEGORIES) {
        const row = data.find((t) => t.category?.toLowerCase() === cat.toLowerCase());
        if (row) {
          initial[cat] = Number(row.days);
        }
      }
      setDrafts(initial);
      setHasChanges(false);
    }
  }, [data]);

  const globalDefault = drafts["__global"] ?? 3;

  const setDays = (key: string, days: number) => {
    const clamped = Math.max(1, Math.min(90, days));
    setDrafts((prev) => ({ ...prev, [key]: clamped }));
    setHasChanges(true);
  };

  const resetToDefault = (key: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setHasChanges(true);
  };

  const saveAll = useMutation({
    mutationFn: async () => {
      const items: { category: string | null; days: number }[] = [
        { category: "__global", days: drafts["__global"] ?? 3 },
      ];

      for (const cat of CATEGORIES) {
        if (drafts[cat] !== undefined) {
          items.push({ category: cat, days: drafts[cat] });
        }
      }

      await updateAllOverdueThresholdsServerFn({ data: { items } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thresholds"] });
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setHasChanges(false);
      toast.success("All SLA threshold settings saved successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const recalc = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
    onSuccess: () => {
      toast.success("Overdue complaint status refreshed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (profileLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;
  if (!profile || !isAdmin) return null;
  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  const customCount = CATEGORIES.filter((c) => drafts[c] !== undefined).length;

  return (
    <div className="space-y-4">
      {/* ── TOP HEADER & ACTIONS ──────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#111215] sm:text-2xl">
            SLA & Resolution Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            Set target deadlines for maintenance issues before automated overdue alerts trigger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => recalc.mutate()}
            disabled={recalc.isPending}
            className="h-8 text-xs cursor-pointer gap-1.5"
          >
            <ArrowsClockwise className={`size-3.5 ${recalc.isPending ? "animate-spin" : ""}`} />
            <span>Refresh Flags</span>
          </Button>

          <Button
            size="sm"
            onClick={() => saveAll.mutate()}
            disabled={!hasChanges || saveAll.isPending}
            className={`h-8 text-xs cursor-pointer gap-1.5 transition-all ${
              hasChanges
                ? "bg-[#1F3622] hover:bg-[#2E4E30] text-white shadow-sm"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {hasChanges ? (
              <FloppyDisk className="size-3.5" weight="bold" />
            ) : (
              <Check className="size-3.5 text-emerald-600" weight="bold" />
            )}
            <span>{saveAll.isPending ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}</span>
          </Button>
        </div>
      </div>

      {/* ── NO-SCROLL COMPACT 2-COLUMN DASHBOARD ──────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN: Global Default SLA + Status (4 cols) */}
        <div className="space-y-3 lg:col-span-4">
          {/* Global Default Card */}
          <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F3622]">
                Global Policy
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF4EE] px-2 py-0.5 text-[10px] font-semibold text-[#1F3622]">
                <ShieldCheck className="size-3 text-[#1F3622]" weight="fill" />
                Default Fallback
              </span>
            </div>

            <h3 className="mt-1 text-sm font-bold text-[#111215]">Default Resolution Time</h3>
            <p className="mt-1 text-xs text-[#5A5E68] leading-relaxed">
              Applied automatically to any repair category without an override.
            </p>

            {/* Stepper Display */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F6F4ED] p-2 border border-[#E9E4D7]">
              <span className="text-xs font-semibold text-[#4A4D54]">Target SLA:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDays("__global", globalDefault - 1)}
                  className="flex size-7 items-center justify-center rounded-lg bg-white border border-[#DFD9CA] text-[#111215] hover:bg-[#1F3622] hover:text-white transition-colors cursor-pointer"
                  aria-label="Decrease global days"
                >
                  <Minus className="size-3" weight="bold" />
                </button>
                <span className="w-14 text-center font-bold text-sm text-[#1F3622]">
                  {globalDefault} {globalDefault === 1 ? "day" : "days"}
                </span>
                <button
                  onClick={() => setDays("__global", globalDefault + 1)}
                  className="flex size-7 items-center justify-center rounded-lg bg-white border border-[#DFD9CA] text-[#111215] hover:bg-[#1F3622] hover:text-white transition-colors cursor-pointer"
                  aria-label="Increase global days"
                >
                  <Plus className="size-3" weight="bold" />
                </button>
              </div>
            </div>

            {/* Quick Preset Pills */}
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-[11px] text-[#7C8074] font-medium">Quick:</span>
              {[1, 2, 3, 5, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays("__global", d)}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${
                    globalDefault === d
                      ? "bg-[#1F3622] text-white"
                      : "bg-[#F0EBE0] text-[#4A4D54] hover:bg-[#E4DEC0]"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Quick Summary Pill */}
          <div className="rounded-2xl border border-[#DFD9CA] bg-white p-3 shadow-xs text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Society Profile</span>
              <span className="font-semibold text-[#111215]">{profile.full_name}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Category Overrides</span>
              <span className="font-semibold text-[#1F3622]">
                {customCount} custom / {CATEGORIES.length - customCount} default
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-[#F0EBE0]">
              <span>Overdue Engine</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Automated 24/7
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3x3 High-Density Category Grid (8 cols) */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111215]">Category Overrides</h3>
                <p className="text-xs text-muted-foreground">
                  Specific deadline days for urgent or routine categories.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#7C8074]">
                {CATEGORIES.length} Categories
              </span>
            </div>

            {/* 3-Column Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => {
                const IconComponent = CATEGORY_ICONS[cat] || Sparkle;
                const isCustom = drafts[cat] !== undefined;
                const currentDays = drafts[cat] ?? globalDefault;

                return (
                  <div
                    key={cat}
                    className={`rounded-xl border p-2.5 transition-all flex flex-col justify-between ${
                      isCustom
                        ? "border-[#1F3622]/40 bg-[#FAF9F5] shadow-xs ring-1 ring-[#1F3622]/10"
                        : "border-[#E8E3D5] bg-white hover:border-[#D0C9BA]"
                    }`}
                  >
                    {/* Card Title & Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
                            isCustom ? "bg-[#EDF4EE] text-[#1F3622]" : "bg-[#F3EFE6] text-[#5A5E68]"
                          }`}
                        >
                          <IconComponent className="size-3.5" weight="fill" />
                        </div>
                        <span className="truncate text-xs font-bold text-[#111215]">{cat}</span>
                      </div>

                      {isCustom ? (
                        <button
                          onClick={() => resetToDefault(cat)}
                          title="Reset to global default"
                          className="text-[10px] text-[#7C8074] hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <ArrowCounterClockwise className="size-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#9A9E92] font-medium">auto</span>
                      )}
                    </div>

                    {/* Stepper Control */}
                    <div className="flex items-center justify-between rounded-lg bg-[#F6F4ED] px-2 py-1 border border-[#E9E4D7]">
                      <button
                        onClick={() => setDays(cat, currentDays - 1)}
                        className="flex size-5 items-center justify-center rounded bg-white text-[#111215] border border-[#DFD9CA] hover:bg-[#1F3622] hover:text-white transition-colors cursor-pointer"
                        aria-label={`Decrease ${cat} days`}
                      >
                        <Minus className="size-2.5" weight="bold" />
                      </button>
                      <span className="text-xs font-bold text-[#1F3622] tabular-nums">
                        {currentDays} {currentDays === 1 ? "day" : "days"}
                      </span>
                      <button
                        onClick={() => setDays(cat, currentDays + 1)}
                        className="flex size-5 items-center justify-center rounded bg-white text-[#111215] border border-[#DFD9CA] hover:bg-[#1F3622] hover:text-white transition-colors cursor-pointer"
                        aria-label={`Increase ${cat} days`}
                      >
                        <Plus className="size-2.5" weight="bold" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
