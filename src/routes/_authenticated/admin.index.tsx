import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Warning,
  CheckCircle,
  Clock,
  Tray,
  TrendUp,
  Funnel,
  X,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
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

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — SocietyDesk" },
      { name: "description", content: "Complaint volume, overdue counts and resolution trends." },
      { property: "og:title", content: "Admin dashboard — SocietyDesk" },
      { property: "og:description", content: "Track society complaint health at a glance." },
    ],
  }),
  component: AdminDashboard,
});

const CHART_COLORS = ["#1F3622", "#2E4E30", "#5F8E63", "#C8DAC2"];

const BLOCKS = ["Tower A", "Tower B", "Tower C", "Tower D", "Clubhouse"];

function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30");

  const { data, isLoading } = useQuery({
    queryKey: ["complaints", "all"],
    queryFn: () => fetchComplaints(),
  });

  const rawRows = data ?? [];

  // Filtered rows based on current filter states
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const daysLimit = timeRange === "all" ? Infinity : parseInt(timeRange, 10);
    const cutoffTime = now - daysLimit * 86_400_000;

    return rawRows.filter((r) => {
      // Date filter
      if (timeRange !== "all") {
        const created = new Date(r.created_at).getTime();
        if (created < cutoffTime) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "overdue" && !r.is_overdue) return false;
        if (statusFilter !== "overdue" && r.status !== statusFilter) return false;
      }

      // Category filter
      if (categoryFilter !== "all" && r.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && r.priority !== priorityFilter) {
        return false;
      }

      // Block / Tower filter
      if (blockFilter !== "all") {
        const blockMatch =
          r.profiles?.block?.toLowerCase() === blockFilter.toLowerCase() ||
          r.location?.toLowerCase().includes(blockFilter.toLowerCase());
        if (!blockMatch) return false;
      }

      // Search query
      if (q) {
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
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

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setBlockFilter("all");
    setPriorityFilter("all");
    setTimeRange("30");
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;

  const stats = [
    {
      label: "Total Complaints",
      value: rows.length,
      icon: Tray,
      tone: "border-[#DFD9CA] bg-white",
    },
    {
      label: "Open Tickets",
      value: rows.filter((r) => r.status === "open").length,
      icon: Clock,
      tone: "border-[#DFD9CA] bg-white",
    },
    {
      label: "In Progress",
      value: rows.filter((r) => r.status === "in_progress").length,
      icon: TrendUp,
      tone: "border-[#DFD9CA] bg-white",
    },
    {
      label: "Resolved",
      value: rows.filter((r) => r.status === "resolved").length,
      icon: CheckCircle,
      tone: "border-[#DFD9CA] bg-white",
    },
    {
      label: "Overdue Alerts",
      value: rows.filter((r) => r.is_overdue).length,
      icon: Warning,
      tone: "border-amber-300 bg-amber-50/60 text-amber-900",
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

  const daysCount = timeRange === "7" ? 7 : timeRange === "90" ? 90 : 30;
  const days = Array.from({ length: Math.min(daysCount, 30) }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (Math.min(daysCount, 30) - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: key.slice(5),
      raised: rows.filter((r) => {
        const cDate = r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : "";
        return cDate === key;
      }).length,
      resolved: rows.filter((r) => {
        if (!r.resolved_at) return false;
        const resDate = new Date(r.resolved_at).toISOString().slice(0, 10);
        return resDate === key;
      }).length,
    };
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111215]">Society Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Average resolution time:{" "}
            <span className="font-semibold text-slate-900">{avgResolution} days</span>
            {hasActiveFilters
              ? ` · Showing ${rows.length} of ${rawRows.length} filtered complaints`
              : ""}
          </p>
        </div>
      </div>

      {/* ── FILTER TOOLBAR ────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#DFD9CA] bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F3622]">
            <Funnel className="size-4" weight="bold" />
            Filters & Search
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="mr-1 size-3.5" /> Reset Filters
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* 1. Keyword Search */}
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* 2. Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="overdue">Overdue Only</SelectItem>
            </SelectContent>
          </Select>

          {/* 3. Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Categories" />
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

          {/* 4. Tower / Block Filter */}
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Towers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Towers / Blocks</SelectItem>
              {BLOCKS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 5. Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* 6. Time Window Filter */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── STAT METRICS ──────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 shadow-sm ${s.tone}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{s.label}</span>
              <s.icon className="size-4 text-[#1F3622]" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── CHARTS ────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#111215]">Complaints by Category</h2>
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1F3622" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-56 items-center justify-center text-xs text-slate-400">
              No complaint data matching current filters
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#111215]">Status Distribution</h2>
          {rows.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    (percent ?? 0) > 0 ? `${name} (${((percent ?? 0) * 100).toFixed(0)}%)` : ""
                  }
                  labelLine={false}
                >
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-56 items-center justify-center text-xs text-slate-400">
              No complaint data matching current filters
            </div>
          )}
        </div>
      </div>

      {/* ── 30-DAY RESOLUTION TIMELINE & WATCHLIST ───────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-[#111215]">
            Raised vs Resolved Trend ({timeRange === "all" ? "All Time" : `Last ${timeRange} Days`})
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="raised"
                stroke="#1F3622"
                strokeWidth={2}
                name="Raised"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#5F8E63"
                strokeWidth={2}
                name="Resolved"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-[#DFD9CA] bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-[#111215]">Repeat Issues Watchlist</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Categories or spots with frequent maintenance reports.
          </p>
          {watchlist.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs text-slate-400">
              No recurring issues detected.
            </div>
          ) : (
            <div className="space-y-2.5">
              {watchlist.map(([key, count]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg bg-[#FAF8F2] border border-[#E9E4D7] p-2.5 text-xs"
                >
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">{key}</span>
                  <span className="font-bold text-[#1F3622]">{count} reports</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
