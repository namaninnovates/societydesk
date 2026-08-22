import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { getCurrentUserServerFn } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let token: string | null = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("societydesk_token");
      const stored = localStorage.getItem("societydesk_profile");
      if (token && stored) {
        try {
          return { user: JSON.parse(stored) };
        } catch {
          // fallback to server check
        }
      }
    }
    const user = await getCurrentUserServerFn({ data: token });
    if (!user) throw redirect({ to: "/auth" });
    return { user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
