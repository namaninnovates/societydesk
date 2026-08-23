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
import { SocietyMaintenanceLoader } from "@/components/society-loader";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: SquaresFour },
  { to: "/admin/complaints", label: "Complaints", icon: ClipboardText },
  { to: "/admin/notices", label: "Notice Board", icon: Megaphone },
  { to: "/admin/residents", label: "Users & Staff", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Gear },
] as const;

const staffNav = [
  { to: "/staff", label: "Assigned Tasks", icon: ClipboardText },
  { to: "/notices", label: "Notice Board", icon: Megaphone },
  { to: "/profile", label: "Profile", icon: User },
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
  const { isAdmin, isStaff, profile, profileLoading } = useAuth();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("societydesk_token");
    if (!token) {
      return null;
    }
  }

  if (profileLoading && !profile) {
    return <SocietyMaintenanceLoader fullScreen text="Authenticating society portal..." />;
  }

  if (!profile) {
    return null;
  }

  if (isAdmin) return <AdminShell>{children}</AdminShell>;
  if (isStaff) return <StaffShell>{children}</StaffShell>;
  return <ResidentShell>{children}</ResidentShell>;
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
      <aside className="hidden w-64 shrink-0 sticky top-0 h-screen flex-col justify-between bg-sidebar p-5 lg:flex overflow-hidden z-20">
        <div className="space-y-8">
          <Brand variant="sidebar" linkTo="/admin" />
          {nav}
        </div>
        <div className="space-y-3 border-t border-sidebar-border pt-4">
          <div className="px-3">
            <p className="text-xs font-semibold text-sidebar-foreground">
              {profile?.full_name || "Administrator"}
            </p>
            <span className="inline-block mt-1 rounded-full bg-white/15 border border-white/25 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Admin
            </span>
          </div>
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
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
        {open ? (
          <div className="bg-sidebar p-4 lg:hidden border-b border-sidebar-border space-y-4">
            {nav}
            <div className="pt-3 border-t border-sidebar-border flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">
                  {profile?.full_name || "Administrator"}
                </p>
                <span className="inline-block mt-1 rounded-full bg-white/15 border border-white/25 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-white/80 hover:text-white hover:bg-white/10 text-xs"
              >
                <SignOut className="size-4 mr-1.5" /> Sign out
              </Button>
            </div>
          </div>
        ) : null}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

function StaffShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signOut = useSignOut();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Brand linkTo="/staff" />
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Staff Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-700 hidden sm:inline">
              {profile?.full_name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              aria-label="Sign out"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <SignOut className="size-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-5xl overflow-x-auto px-2 pb-2">
          <nav className="flex gap-1">
            {staffNav.map((item) => {
              const active =
                item.to === "/staff" ? pathname === "/staff" : pathname.startsWith(item.to);
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
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
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
