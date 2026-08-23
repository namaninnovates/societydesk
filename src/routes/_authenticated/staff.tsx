import { createFileRoute, Navigate, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/staff")({
  beforeLoad: async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("societydesk_token");
      const stored = localStorage.getItem("societydesk_profile");
      if (!token || !stored) {
        throw redirect({ to: "/auth" });
      }
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.role !== "staff" && parsed?.role !== "admin") {
          throw redirect({ to: "/auth" });
        }
      } catch {
        throw redirect({ to: "/auth" });
      }
    }
  },
  component: StaffLayout,
});

function StaffLayout() {
  const { isStaff, isAdmin, profile, profileLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("societydesk_token");
      if (!token) {
        window.location.replace("/auth");
      }
    }
  }, [profile, isStaff, isAdmin]);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("societydesk_token");
    const stored = localStorage.getItem("societydesk_profile");
    if (!token || !stored) return <Navigate to="/auth" replace />;
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.role !== "staff" && parsed?.role !== "admin") {
        return <Navigate to="/auth" replace />;
      }
    } catch {
      return <Navigate to="/auth" replace />;
    }
  }

  if (profileLoading && !profile) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-[#1F3622] border-t-transparent" />
      </div>
    );
  }

  if (!profile || (!isStaff && !isAdmin)) return <Navigate to="/auth" replace />;

  return <Outlet />;
}
