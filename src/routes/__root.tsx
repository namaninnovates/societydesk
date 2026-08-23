import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Warning } from "@phosphor-icons/react";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F4ED] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-[#DFD9CA] bg-white p-8 text-center shadow-md space-y-6">
        {/* Themed 404 Illustration Badge */}
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[#1F3622] text-white shadow-lg relative">
          <span className="text-3xl font-extrabold tracking-tight">404</span>
          <div className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-white">
            <span className="text-sm font-bold">?</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-[#EDF4EE] px-3 py-1 text-xs font-bold text-[#1F3622] uppercase tracking-wider">
            Corridor Not Found
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#111215] sm:text-3xl">
            This page isn't on the society map
          </h1>
          <p className="text-sm text-[#5A5E68] leading-relaxed max-w-sm mx-auto">
            The flat, complaint ticket, or admin route you are trying to visit may have been moved,
            resolved, or does not exist.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[#1F3622] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2E4E30]"
          >
            Go to Homepage
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-full border border-[#DFD9CA] bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-[#FAF8F2]"
          >
            Sign In Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F4ED] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-md space-y-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <Warning className="size-8 text-red-700" weight="fill" />
        </div>
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 uppercase tracking-wider">
            System Notice
          </span>
          <h1 className="text-2xl font-bold text-[#111215]">Temporary maintenance hiccup</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We encountered a temporary issue loading this society data. You can try refreshing
            below.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-[#1F3622] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2E4E30] cursor-pointer"
          >
            Retry Sync
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-[#DFD9CA] bg-white px-5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-[#FAF8F2]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#1F3622" },
      { title: "SocietyDesk — Society Maintenance Tracker" },
      {
        name: "description",
        content:
          "Raise, track and resolve apartment society maintenance complaints with notices and analytics.",
      },
      { property: "og:title", content: "SocietyDesk — Society Maintenance Tracker" },
      {
        property: "og:description",
        content: "Complaint tracking, overdue alerts and a notice board for housing societies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-[#F6F4ED]">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#F6F4ED] text-[#111215] antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SecurityAuthWatcher() {
  useEffect(() => {
    const checkAuthStatus = () => {
      if (typeof window === "undefined") return;
      const pathname = window.location.pathname;
      const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/complaints") ||
        pathname.startsWith("/notices") ||
        pathname.startsWith("/profile");

      const token = localStorage.getItem("societydesk_token");
      if (isProtected && !token) {
        window.location.replace("/auth");
      }
    };

    window.addEventListener("pageshow", checkAuthStatus);
    window.addEventListener("popstate", checkAuthStatus);
    window.addEventListener("focus", checkAuthStatus);
    window.addEventListener("storage", checkAuthStatus);

    // Initial sync
    checkAuthStatus();

    return () => {
      window.removeEventListener("pageshow", checkAuthStatus);
      window.removeEventListener("popstate", checkAuthStatus);
      window.removeEventListener("focus", checkAuthStatus);
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SecurityAuthWatcher />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
