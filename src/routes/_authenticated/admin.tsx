import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, profileLoading } = useAuth();
  if (profileLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (!isAdmin) return <Navigate to="/complaints" replace />;
  return <Outlet />;
}
