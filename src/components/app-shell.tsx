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
  Clock,
} from "@phosphor-icons/react";
import { useState, useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand";
import { SocietyMaintenanceLoader } from "@/components/society-loader";
import { ActionAlertPopup } from "@/components/action-alert-popup";

function useIstTime() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");

  useEffect(() => {
    const update = () => {
      const now = new Date();

      const istHourStr = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        hour12: false,
      }).format(now);

      const hour = parseInt(istHourStr, 10);
      let g = "Hello";
      if (hour >= 4 && hour < 12) g = "Good morning";
      else if (hour >= 12 && hour < 17) g = "Good afternoon";
      else g = "Good evening";
      setGreeting(g);

      const datePart = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now);

      const timePart = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(now);

      setTimeStr(`${datePart} · ${timePart} IST`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return { timeStr, greeting };
}

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

  return (
    <>
      {isAdmin ? (
        <AdminShell>{children}</AdminShell>
      ) : isStaff ? (
        <StaffShell>{children}</StaffShell>
      ) : (
        <ResidentShell>{children}</ResidentShell>
      )}
      {isAdmin && <ActionAlertPopup />}
    </>
  );
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
    <div className="min-h-screen bg-background lg:flex overflow-x-hidden w-full max-w-full">
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

      <div className="flex-1 min-w-0 overflow-x-hidden w-full max-w-full">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden w-full max-w-full">
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
        <main className="mx-auto w-full max-w-7xl px-3 sm:px-6 py-4 sm:py-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function getCleanName(fullName?: string | null): string {
  if (!fullName) return "";
  return fullName.replace(/\s*\([^)]*\)/g, "").trim();
}

function StaffShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signOut = useSignOut();
  const { profile } = useAuth();
  const { timeStr } = useIstTime();
  const cleanName = getCleanName(profile?.full_name) || "Staff";

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden w-full max-w-full">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md w-full max-w-full overflow-x-hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <Brand linkTo="/staff" />
          </div>

          {/* Right: Staff Name + Badge + IST Clock + Sign Out */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-[#111215] truncate max-w-[100px] xs:max-w-[140px] sm:max-w-[220px]">
              {cleanName}
            </span>
            <span className="hidden xs:inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shrink-0">
              Staff
            </span>
            {timeStr && (
              <div className="hidden md:flex items-center gap-1.5 rounded-full bg-[#FAF8F2] px-2.5 py-1 text-xs font-medium text-[#4F5148] border border-[#DFD9CA] shadow-2xs shrink-0">
                <Clock className="size-3.5 text-[#1F3622]" weight="bold" />
                <span className="tabular-nums">{timeStr}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="h-7 sm:h-8 rounded-full border-[#DFD9CA] bg-white px-2.5 sm:px-3 text-xs font-medium text-slate-700 hover:bg-[#F3EFE6] hover:text-[#111215] cursor-pointer shadow-2xs gap-1.5 shrink-0"
            >
              <SignOut className="size-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl overflow-x-auto px-2 pb-2 scrollbar-none">
          <nav className="flex gap-1 min-w-max">
            {staffNav.map((item) => {
              const active =
                item.to === "/staff" ? pathname === "/staff" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "bg-secondary text-secondary-foreground font-semibold shadow-2xs",
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
      <main className="mx-auto w-full max-w-5xl px-3 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

function ResidentShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const signOut = useSignOut();
  const { profile } = useAuth();
  const { timeStr, greeting } = useIstTime();
  const cleanName = getCleanName(profile?.full_name) || "Resident";

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden w-full max-w-full">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md w-full max-w-full overflow-x-hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <Brand linkTo="/complaints" />
          </div>

          {/* Right: Greeting + Flat Tag + IST Clock + Sign Out */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <span className="text-xs sm:text-sm font-semibold text-[#111215] truncate max-w-[110px] xs:max-w-[150px] sm:max-w-none">
              {greeting}, {cleanName}
            </span>
            {profile?.unit_number && (
              <span className="hidden md:inline-flex items-center rounded-md bg-[#EDF4EE] px-2 py-0.5 text-[10px] font-semibold text-[#1F3622] border border-[#1F3622]/15 shrink-0">
                {profile.block ? `${profile.block} · ` : ""}Flat{" "}
                {profile.unit_number.replace(/^Flat\s*/i, "")}
              </span>
            )}
            {timeStr && (
              <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-[#FAF8F2] px-2.5 py-1 text-xs font-medium text-[#4F5148] border border-[#DFD9CA] shadow-2xs shrink-0">
                <Clock className="size-3.5 text-[#1F3622]" weight="bold" />
                <span className="tabular-nums">{timeStr}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="h-7 sm:h-8 rounded-full border-[#DFD9CA] bg-white px-2.5 sm:px-3 text-xs font-medium text-slate-700 hover:bg-[#F3EFE6] hover:text-[#111215] cursor-pointer shadow-2xs gap-1.5 shrink-0"
            >
              <SignOut className="size-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl overflow-x-auto px-2 pb-2 scrollbar-none">
          <nav className="flex gap-1 min-w-max">
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
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "bg-secondary text-secondary-foreground font-semibold shadow-2xs",
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
      <main className="mx-auto w-full max-w-5xl px-3 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
