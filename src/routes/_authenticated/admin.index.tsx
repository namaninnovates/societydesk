import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Warning,
  CheckCircle,
  Clock,
  Tray,
  TrendUp,
  X,
  MagnifyingGlass,
  Lightning,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchComplaints } from "@/lib/queries";
import { CATEGORIES, daysOpen } from "@/lib/societydesk";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSkeleton } from "@/components/society-loader";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SocietyDesk" },
      { name: "description", content: "Complaint volume, overdue counts and resolution trends." },
      { property: "og:title", content: "Dashboard — SocietyDesk" },
      { property: "og:description", content: "Track society complaint health at a glance." },
    ],
  }),
  component: AdminDashboard,
});

const CHART_COLORS = ["#1F3622", "#2E4E30", "#5F8E63", "#C8DAC2"];
const BLOCKS = ["Tower A", "Tower B", "Tower C", "Tower D", "Clubhouse"];

function AdminDashboard() {
  const { profile, isAdmin, profileLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30");

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "all"],
    queryFn: () => fetchComplaints(),
    enabled: Boolean(isAdmin && profile?.role === "admin"),
  });

  const rawRows = useMemo(() => data ?? [], [data]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const daysLimit = timeRange === "all" ? Infinity : parseInt(timeRange, 10);
    const cutoffTime = now - daysLimit * 86_400_000;

    return rawRows.filter((r) => {
      if (timeRange !== "all") {
        const created = new Date(r.created_at).getTime();
        if (created < cutoffTime) return false;
      }
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (blockFilter !== "all") {
        const blockMatch =
          r.profiles?.block?.toLowerCase() === blockFilter.toLowerCase() ||
          r.location?.toLowerCase().includes(blockFilter.toLowerCase());
        if (!blockMatch) return false;
      }
      if (priorityFilter !== "all" && r.priority !== priorityFilter) return false;
      if (q) {
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = (r.description ?? "").toLowerCase().includes(q);
        const matchLoc = (r.location ?? "").toLowerCase().includes(q);
        const matchName = (r.profiles?.full_name ?? "").toLowerCase().includes(q);
        const matchUnit = (r.profiles?.unit_number ?? "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLoc && !matchName && !matchUnit) {
          return false;
        }
      }
      return true;
    });
  }, [rawRows, search, statusFilter, categoryFilter, blockFilter, priorityFilter, timeRange]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    blockFilter !== "all" ||
    priorityFilter !== "all" ||
    timeRange !== "30";

  const displayDaysCount = timeRange === "7" ? 7 : timeRange === "90" ? 21 : 14;
  const activityData = useMemo(() => {
    return Array.from({ length: displayDaysCount }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (displayDaysCount - 1 - i));
      const isoDate = d.toISOString().slice(0, 10);
      const isToday = i === displayDaysCount - 1;

      const dayLabel = isToday
        ? "Today"
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const raisedCount = rows.filter((r) => {
        const cDate = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "";
        return cDate === isoDate;
      }).length;

      const resolvedCount = rows.filter((r) => {
        if (!r.resolved_at) return false;
        const resDate = new Date(r.resolved_at).toISOString().slice(0, 10);
        return resDate === isoDate;
      }).length;

      return {
        key: isoDate,
        date: dayLabel,
        fullDate: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        raised: raisedCount,
        resolved: resolvedCount,
      };
    });
  }, [rows, displayDaysCount]);

  const totalPeriodRaised = activityData.reduce((acc, d) => acc + d.raised, 0);
  const totalPeriodResolved = activityData.reduce((acc, d) => acc + d.resolved, 0);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setBlockFilter("all");
    setPriorityFilter("all");
    setTimeRange("30");
  };

  if (profileLoading) return <DashboardSkeleton />;
  if (!profile || !isAdmin) return null;
  if (isLoading) return <DashboardSkeleton />;

  const stats = [
    {
      label: "Total Complaints",
      value: rows.length,
      icon: Tray,
      tone: "border-[#DFD9CA] bg-white text-[#111215]",
      iconBg: "bg-[#F3EFE6] text-[#1F3622]",
    },
    {
      label: "Open Tickets",
      value: rows.filter((r) => r.status === "open").length,
      icon: Clock,
      tone: "border-[#DFD9CA] bg-white text-[#111215]",
      iconBg: "bg-[#EDF4EE] text-[#1F3622]",
    },
    {
      label: "In Progress",
      value: rows.filter((r) => r.status === "in_progress").length,
      icon: TrendUp,
      tone: "border-[#DFD9CA] bg-white text-[#111215]",
      iconBg: "bg-[#EDF4EE] text-[#1F3622]",
    },
    {
      label: "Resolved",
      value: rows.filter((r) => r.status === "resolved").length,
      icon: CheckCircle,
      tone: "border-[#DFD9CA] bg-white text-[#111215]",
      iconBg: "bg-[#EDF4EE] text-[#1F3622]",
    },
    {
      label: "Overdue Alerts",
      value: rows.filter((r) => r.is_overdue).length,
      icon: Warning,
      tone: "border-amber-300 bg-amber-50/70 text-amber-900",
      iconBg: "bg-amber-100 text-amber-700",
    },
  ];

  const byCategory = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.category] = (acc[r.category] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const statusData = (["open", "in_progress", "resolved"] as const).map((s, i) => ({
    name: s === "in_progress" ? "In Progress" : s === "open" ? "Open" : "Resolved",
    value: rows.filter((r) => r.status === s).length,
    fill: CHART_COLORS[i]!,
  }));

  const resolved = rows.filter((r) => r.status === "resolved" && r.resolved_at);
  const avgResolution = resolved.length
    ? (
        resolved.reduce((sum, r) => sum + daysOpen(r.created_at, r.resolved_at), 0) /
        resolved.length
      ).toFixed(1)
    : "—";

  const since = Date.now() - 30 * 86_400_000;
  const watchlist = Object.entries(
    rows
      .filter((r) => new Date(r.created_at).getTime() > since)
      .reduce<Record<string, number>>((acc, r) => {
        const key = `${r.category}${r.location ? ` — ${r.location}` : ""}`;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
  )
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-3">
      {/* ── HEADER + INLINE FILTERS STRIP ─────────────────────── */}
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-[#111215]">Society Dashboard</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EDF4EE] px-2.5 py-0.5 text-xs font-semibold text-[#1F3622]">
            <Lightning className="size-3 text-[#1F3622]" weight="fill" />
            {avgResolution}d avg resolution
          </span>
          {hasActiveFilters && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              ({rows.length} / {rawRows.length} filtered)
            </span>
          )}
        </div>

        {/* Compact Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 w-36 sm:w-44 pl-8 text-xs bg-white"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-28 text-xs bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-32 text-xs bg-white">
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

          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className="h-8 w-28 text-xs bg-white">
              <SelectValue placeholder="Tower" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Towers</SelectItem>
              {BLOCKS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-8 w-28 text-xs bg-white">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7d</SelectItem>
              <SelectItem value="30">Last 30d</SelectItem>
              <SelectItem value="90">Last 90d</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
              title="Reset Filters"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── 5 COMPACT KPI METRIC CARDS ────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-2.5 shadow-xs flex items-center justify-between ${s.tone}`}
          >
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-tight">
                {s.label}
              </span>
              <p className="text-xl font-bold tracking-tight leading-none mt-1">{s.value}</p>
            </div>
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${s.iconBg}`}
            >
              <s.icon className="size-4" weight="bold" />
            </div>
          </div>
        ))}
      </div>

      {/* ── MIDDLE ROW: BAR CHART & STATUS DONUT ──────────────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Complaints by Category (7 cols) */}
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-3.5 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
              Complaints by Category
            </h2>
            <span className="text-[10px] text-muted-foreground">Volume breakdown</span>
          </div>

          {byCategory.length > 0 ? (
            <div className="h-[145px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" fontSize={10} interval={0} tickLine={false} />
                  <YAxis fontSize={10} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      fontSize: "11px",
                      borderRadius: "8px",
                      padding: "4px 8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#1F3622" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[145px] items-center justify-center text-xs text-slate-400">
              No complaint data
            </div>
          )}
        </div>

        {/* Status Distribution Donut (5 cols) */}
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-3.5 shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
              Status Distribution
            </h2>
            <div className="flex items-center gap-2 text-[10px]">
              {statusData.map((d) => (
                <span key={d.name} className="flex items-center gap-1">
                  <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </div>

          {rows.length > 0 ? (
            <div className="h-[145px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                  >
                    {statusData.map((d) => (
                      <Cell key={d.name} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: "11px",
                      borderRadius: "8px",
                      padding: "4px 8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[145px] items-center justify-center text-xs text-slate-400">
              No complaint data
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW: 30-DAY TIMELINE & REPEAT WATCHLIST ────── */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Raised vs Resolved Activity (8 cols) */}
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-3.5 shadow-xs lg:col-span-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                Activity: Raised vs Resolved
              </h2>
              <span className="text-[10px] text-muted-foreground">
                (Last {displayDaysCount} Days)
              </span>
            </div>

            {/* Live summary pills in shades of olive */}
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3E4D28]/10 border border-[#3E4D28]/20 px-2.5 py-0.5 text-[#3E4D28]">
                <span className="size-2 rounded-full bg-[#3E4D28]" />
                {totalPeriodRaised} Raised
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#829758]/15 border border-[#829758]/30 px-2.5 py-0.5 text-[#546633]">
                <span className="size-2 rounded-full bg-[#829758]" />
                {totalPeriodResolved} Resolved
              </span>
            </div>
          </div>

          <div className="h-[135px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="oliveRaisedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3E4D28" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#3E4D28" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="oliveResolvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#829758" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#829758" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.12} />
                <XAxis dataKey="date" fontSize={10} tickLine={false} />
                <YAxis fontSize={10} allowDecimals={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: "#829758", strokeWidth: 1, strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    const item = payload?.[0]?.payload as
                      { fullDate: string; raised: number; resolved: number } | undefined;
                    if (active && item) {
                      return (
                        <div className="rounded-xl border border-[#DFD9CA] bg-white p-2.5 text-xs shadow-md space-y-1.5 min-w-[130px]">
                          <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1">
                            {item.fullDate}
                          </p>
                          <div className="flex items-center justify-between gap-3 text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-[#3E4D28]" /> Raised:
                            </span>
                            <span className="font-bold text-[#3E4D28]">{item.raised}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full bg-[#829758]" /> Resolved:
                            </span>
                            <span className="font-bold text-[#546633]">{item.resolved}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="raised"
                  name="Raised"
                  stroke="#3E4D28"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#oliveRaisedGrad)"
                  dot={{ r: 3, fill: "#3E4D28", strokeWidth: 1.5, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5, fill: "#3E4D28", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#829758"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#oliveResolvedGrad)"
                  dot={{ r: 3, fill: "#829758", strokeWidth: 1.5, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5, fill: "#829758", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Repeat Issues Watchlist (4 cols) */}
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-3.5 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                Repeat Watchlist
              </h2>
              <span className="text-[10px] text-[#7C8074]">Recurring spots</span>
            </div>

            {watchlist.length === 0 ? (
              <div className="flex h-[95px] items-center justify-center text-xs text-slate-400">
                No repeat issues detected
              </div>
            ) : (
              <div className="space-y-1.5 pt-1 overflow-y-auto max-h-[100px] scrollbar-none">
                {watchlist.slice(0, 3).map(([key, count]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg bg-[#FAF8F2] border border-[#E9E4D7] px-2.5 py-1 text-xs"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">{key}</span>
                    <span className="font-bold text-[#1F3622]">{count} reports</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#F0EBE0] text-[10px] text-muted-foreground flex justify-between">
            <span>Threshold: ≥ 2 reports</span>
            <span className="font-semibold text-emerald-700">Auto-audited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
