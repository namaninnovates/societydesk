import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("societydesk_token");
      const stored = localStorage.getItem("societydesk_profile");
      if (!token || !stored) {
        throw redirect({ to: "/auth" });
      }
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.role !== "admin") {
          throw redirect({ to: "/complaints" });
        }
      } catch {
        throw redirect({ to: "/auth" });
      }
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, profile, profileLoading } = useAuth();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("societydesk_token");
    if (!token) return <Navigate to="/auth" replace />;
  }

  if (profileLoading) return <Skeleton className="h-64 w-full rounded-xl" />;
  if (!profile) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/complaints" replace />;
  return <Outlet />;
}
