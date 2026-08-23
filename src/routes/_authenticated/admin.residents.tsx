import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "@phosphor-icons/react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchResidentsServerFn } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated/admin/residents")({
  head: () => ({
    meta: [
      { title: "Resident directory — SocietyDesk" },
      { name: "description", content: "Look up residents by unit, block or name." },
      { property: "og:title", content: "Resident directory — SocietyDesk" },
      { property: "og:description", content: "Admin-only directory of society residents." },
    ],
  }),
  component: Residents,
});

function Residents() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["residents"],
    queryFn: async () => {
      return await fetchResidentsServerFn();
    },
  });

  const term = q.trim().toLowerCase();
  const rows = (data ?? []).filter(
    (r) =>
      !term ||
      r.full_name.toLowerCase().includes(term) ||
      (r.unit_number ?? "").toLowerCase().includes(term) ||
      (r.block ?? "").toLowerCase().includes(term),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Residents</h1>
        <p className="text-sm text-muted-foreground">{rows.length} people</p>
      </div>
      <Input
        placeholder="Search by name, block or unit…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : rows.length === 0 ? (
        <EmptyState icon={Users} title="No residents found" body="Try a different search term." />
      ) : (
        <div className="surface overflow-x-auto p-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Block</th>
                <th className="p-3 font-medium">Unit</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{r.full_name || "—"}</td>
                  <td className="p-3">{r.block ?? "—"}</td>
                  <td className="p-3">{r.unit_number ?? "—"}</td>
                  <td className="p-3">{r.phone ?? "—"}</td>
                  <td className="p-3 capitalize">{r.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
