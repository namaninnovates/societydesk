import { createFileRoute, Outlet, redirect, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppShell } from "@/components/app-shell";
import { getCurrentUserServerFn } from "@/lib/auth.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("societydesk_token");
      const stored = localStorage.getItem("societydesk_profile");
      if (!token || !stored) {
        throw redirect({ to: "/auth" });
      }
      try {
        const parsed = JSON.parse(stored);
        if (!parsed?.id) throw redirect({ to: "/auth" });
        return { user: parsed };
      } catch {
        // fallback to server check
      }
    }
    const user = await getCurrentUserServerFn({ data: token });
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { profile, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("societydesk_token");
      if (!token || (!profileLoading && !profile)) {
        navigate({ to: "/auth", replace: true });
      }
    }
  }, [profile, profileLoading, navigate]);

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("societydesk_token");
    if (!token) {
      return <Navigate to="/auth" replace />;
    }
  }

  if (profileLoading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F4ED]">
        <div className="size-8 animate-spin rounded-full border-4 border-[#1F3622] border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
