import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Buildings,
  SquaresFour,
  ClipboardText,
  Megaphone,
  Users,
  Gear,
  PlusCircle,
  User,
  SignOut,
  List,
} from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: SquaresFour },
  { to: "/admin/complaints", label: "Complaints", icon: ClipboardText },
  { to: "/admin/notices", label: "Notice Board", icon: Megaphone },
  { to: "/admin/residents", label: "Residents", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Gear },
] as const;

const residentNav = [
  { to: "/complaints", label: "My Complaints", icon: ClipboardText },
  { to: "/complaints/new", label: "Raise Complaint", icon: PlusCircle },
  { to: "/notices", label: "Notice Board", icon: Megaphone },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function useSignOut() {
  const { signOut } = useAuth();
  return async () => {
    await signOut();
    if (typeof window !== "undefined") {
      window.location.replace("/auth");
    }
  };
}

export function Brand({
  className,
  variant = "default",
  linkTo,
}: {
  className?: string;
  variant?: "default" | "sidebar" | "footer" | "mono";
  linkTo?: string | null;
}) {
  return <BrandLogo className={className} variant={variant} linkTo={linkTo} />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin, profile, profileLoading } = useAuth();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("societydesk_token");
    if (!token) {
      return null;
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
    return null;
  }

  return isAdmin ? <AdminShell>{children}</AdminShell> : <ResidentShell>{children}</ResidentShell>;
}

function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signOut = useSignOut();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {adminNav.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-sidebar p-5 lg:flex">
        <div className="space-y-8">
          <Brand variant="sidebar" linkTo="/admin" />
          {nav}
        </div>
        <div className="space-y-3 border-t border-sidebar-border pt-4">
          <p className="px-3 text-xs text-sidebar-foreground/70">
            {profile?.full_name || "Administrator"}
          </p>
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <SignOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
          <Brand linkTo="/admin" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)}>
              <List className="size-5" />
            </Button>
          </div>
        </header>
        {open ? <div className="bg-sidebar p-4 lg:hidden">{nav}</div> : null}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function ResidentShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signOut = useSignOut();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Brand linkTo="/complaints" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <SignOut className="size-4" />
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl overflow-x-auto px-2 pb-2">
          <nav className="flex gap-1">
            {residentNav.map((item) => {
              const active =
                item.to === "/complaints"
                  ? pathname === "/complaints"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "bg-secondary text-secondary-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
