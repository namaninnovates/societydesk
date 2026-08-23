import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import {
  Buildings,
  SpinnerGap,
  ShieldCheck,
  UserCheck,
  Key,
  ArrowLeft,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { signInServerFn, signUpServerFn } from "@/lib/auth.functions";
import { BrandLogo } from "@/components/brand";

const authSearchSchema = z.object({
  mode: z.enum(["signin", "signup", "admin", "staff"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign In / Register — SocietyDesk" },
      { name: "description", content: "Sign in as admin, staff, or resident on SocietyDesk." },
      { property: "og:title", content: "Sign In / Register — SocietyDesk" },
      { property: "og:description", content: "Access your society maintenance portal." },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  unit_number: z.string().trim().min(1, "Flat / unit is required").max(20),
  block: z.string().trim().min(1, "Block / tower is required").max(20),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const { session, profile, setAuth } = useAuth();
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<string>(() => {
    if (search.mode === "staff") return "staff";
    if (search.mode === "admin") return "admin";
    return "resident";
  });
  const [residentMode, setResidentMode] = useState<"signin" | "register">(() =>
    search.mode === "signup" ? "register" : "signin",
  );

  // Controlled form states for 1-click filling
  const [adminEmail, setAdminEmail] = useState("naman@societydesk.com");
  const [adminPassword, setAdminPassword] = useState("SocietyDesk@2026!");
  const [staffEmail, setStaffEmail] = useState("ramesh.staff@societydesk.com");
  const [staffPassword, setStaffPassword] = useState("Staff@2026!");
  const [residentEmail, setResidentEmail] = useState("resident@societydesk.com");
  const [residentPassword, setResidentPassword] = useState("Resident@2026!");

  useEffect(() => {
    if (search.mode === "signup") {
      setTab("resident");
      setResidentMode("register");
    } else if (search.mode === "staff") {
      setTab("staff");
    } else if (search.mode === "admin") {
      setTab("admin");
    } else if (search.mode === "signin") {
      setTab("resident");
      setResidentMode("signin");
    }
  }, [search.mode]);

  useEffect(() => {
    if (session && profile) {
      const destination =
        profile.role === "admin" ? "/admin" : profile.role === "staff" ? "/staff" : "/complaints";
      navigate({ to: destination, replace: true });
    }
  }, [session, profile, navigate]);

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement>,
    roleHint?: "admin" | "resident" | "staff",
  ) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setBusy(true);
    try {
      const res = await signInServerFn({ data: { email, password } });
      setAuth(res.profile, res.token);
      toast.success(
        res.profile.role === "admin"
          ? `Welcome back, ${res.profile.full_name} (Admin)`
          : res.profile.role === "staff"
            ? `Welcome back, ${res.profile.full_name} (Staff)`
            : `Welcome back, ${res.profile.full_name}`,
      );
      const destination =
        res.profile.role === "admin"
          ? "/admin"
          : res.profile.role === "staff"
            ? "/staff"
            : "/complaints";
      navigate({ to: destination, replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }
    const v = parsed.data;
    setBusy(true);
    try {
      const res = await signUpServerFn({
        data: {
          full_name: v.full_name,
          email: v.email,
          password: v.password,
          unit_number: v.unit_number,
          block: v.block,
          phone: v.phone,
          role: "resident",
        },
      });
      setAuth(res.profile, res.token);
      toast.success(`Welcome to SocietyDesk, ${res.profile.full_name}!`);
      navigate({ to: "/complaints", replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const fillSuperAdmin = () => {
    setTab("admin");
    setAdminEmail("naman@societydesk.com");
    setAdminPassword("SocietyDesk@2026!");
    toast.info("Naman Gupta (Super Admin) loaded");
  };

  const fillAdmin2 = () => {
    setTab("admin");
    setAdminEmail("rohit.admin@societydesk.com");
    setAdminPassword("SocietyDesk@2026!");
    toast.info("Rohit Khanna (Admin) loaded");
  };

  const fillAdmin3 = () => {
    setTab("admin");
    setAdminEmail("meera.admin@societydesk.com");
    setAdminPassword("SocietyDesk@2026!");
    toast.info("Meera Sengupta (Admin) loaded");
  };

  const fillStaffElectrician = () => {
    setTab("staff");
    setStaffEmail("ramesh.staff@societydesk.com");
    setStaffPassword("Staff@2026!");
    toast.info("Ramesh Kumar (Staff - Electrician) loaded");
  };

  const fillStaffPlumber = () => {
    setTab("staff");
    setStaffEmail("suresh.staff@societydesk.com");
    setStaffPassword("Staff@2026!");
    toast.info("Suresh Sharma (Staff - Plumber) loaded");
  };

  const fillResidentPriya = () => {
    setTab("resident");
    setResidentMode("signin");
    setResidentEmail("resident@societydesk.com");
    setResidentPassword("Resident@2026!");
    toast.info("Priya Sharma (Resident) loaded");
  };

  const fillResidentVikram = () => {
    setTab("resident");
    setResidentMode("signin");
    setResidentEmail("vikram.malhotra@societydesk.com");
    setResidentPassword("Resident@2026!");
    toast.info("Vikram Malhotra (Resident) loaded");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F4ED] px-4 py-6 sm:py-8">
      {/* Top Navigation Bar */}
      <header className="mx-auto w-full max-w-4xl flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#DFD9CA] bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#F3EFE6] hover:text-[#111215] transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="size-3.5 text-[#1F3622]" weight="bold" />
          <span>Back to Home</span>
        </Link>
        <BrandLogo linkTo="/" />
        <div className="w-24 hidden sm:block" />
      </header>

      <div className="my-auto mx-auto w-full max-w-md py-6">
        <div className="surface p-6 shadow-sm border border-[#DFD9CA] bg-white rounded-2xl">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3 bg-[#F1EDE1] p-1 rounded-xl">
              <TabsTrigger
                value="resident"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#111215]"
              >
                Resident
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#111215]"
              >
                Staff
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#111215]"
              >
                Admin
              </TabsTrigger>
            </TabsList>

            {/* RESIDENT TAB (SIGN IN / REGISTER TOGGLE) */}
            <TabsContent value="resident">
              {residentMode === "signin" ? (
                <div className="space-y-4 pt-4">
                  <form onSubmit={(e) => handleSignIn(e, "resident")} className="space-y-4">
                    <Field
                      label="Resident Email"
                      name="email"
                      type="email"
                      value={residentEmail}
                      onChange={(e) => setResidentEmail(e.target.value)}
                      placeholder="resident@societydesk.com"
                      required
                    />
                    <Field
                      label="Password"
                      name="password"
                      type="password"
                      value={residentPassword}
                      onChange={(e) => setResidentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-[#1F3622] hover:bg-[#2E4E30]"
                      disabled={busy}
                    >
                      {busy ? <SpinnerGap className="size-4 animate-spin" /> : null} Sign in as
                      Resident
                    </Button>
                  </form>

                  {/* Register prompt below sign in */}
                  <div className="pt-2 text-center border-t border-slate-100">
                    <p className="text-xs text-muted-foreground">
                      New resident in our society?{" "}
                      <button
                        type="button"
                        onClick={() => setResidentMode("register")}
                        className="font-bold text-[#1F3622] hover:underline cursor-pointer"
                      >
                        Register your flat
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between border-b border-[#DFD9CA] pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#111215] uppercase tracking-wider">
                        Register Flat
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Create an account for your unit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResidentMode("signin")}
                      className="text-xs font-semibold text-[#1F3622] hover:underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    <Field label="Full name" name="full_name" placeholder="Rahul Sharma" required />
                    <Field
                      label="Email address"
                      name="email"
                      type="email"
                      placeholder="name@email.com"
                      required
                    />
                    <Field
                      label="Create password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Flat / Unit" name="unit_number" placeholder="B-1204" required />
                      <Field label="Block / Tower" name="block" placeholder="Tower B" required />
                    </div>
                    <Field
                      label="Phone number"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-[#1F3622] hover:bg-[#2E4E30]"
                      disabled={busy}
                    >
                      {busy ? <SpinnerGap className="size-4 animate-spin" /> : null} Register Flat
                    </Button>
                  </form>

                  {/* Sign in prompt below register */}
                  <div className="pt-2 text-center border-t border-slate-100">
                    <p className="text-xs text-muted-foreground">
                      Already registered?{" "}
                      <button
                        type="button"
                        onClick={() => setResidentMode("signin")}
                        className="font-bold text-[#1F3622] hover:underline cursor-pointer"
                      >
                        Sign in to your flat
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* STAFF SIGN IN */}
            <TabsContent value="staff">
              <form onSubmit={(e) => handleSignIn(e, "staff")} className="space-y-4 pt-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                  <span className="font-bold">Staff Technician Portal:</span> For electricians,
                  plumbers, security, and maintenance crew.
                </div>
                <Field
                  label="Staff Email"
                  name="email"
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="ramesh.staff@societydesk.com"
                  required
                />
                <Field
                  label="Staff Password"
                  name="password"
                  type="password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-[#1F3622] hover:bg-[#2E4E30]"
                  disabled={busy}
                >
                  {busy ? <SpinnerGap className="size-4 animate-spin" /> : null} Sign in as Staff
                </Button>
              </form>
            </TabsContent>

            {/* ADMIN SIGN IN */}
            <TabsContent value="admin">
              <form onSubmit={(e) => handleSignIn(e, "admin")} className="space-y-4 pt-4">
                <div className="rounded-lg bg-[#E8EFEA] border border-[#C2D6CA] p-2.5 text-xs text-[#1F3622]">
                  <span className="font-bold">Admin Portal:</span> For Naman Gupta (Super Admin) &
                  society management committee.
                </div>
                <Field
                  label="Admin Email"
                  name="email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <Field
                  label="Admin Password"
                  name="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-[#1F3622] text-white hover:bg-[#2E4E30]"
                  disabled={busy}
                >
                  {busy ? <SpinnerGap className="size-4 animate-spin" /> : null} Sign in as Admin
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-6 rounded-xl border border-[#DFD9CA] bg-[#FAF8F2] p-3 text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span className="flex items-center gap-1.5 text-xs text-[#1F3622]">
                <Key className="size-3.5" />
                Quick 1-Click Demo Accounts
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">Click to fill</span>
            </div>

            {/* Exactly 3 Admins */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Society Admins (3)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={fillSuperAdmin}
                  className="flex items-center gap-1.5 rounded-md bg-white border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-[#EDF4EE] hover:border-[#1F3622] hover:text-[#1F3622] transition-colors cursor-pointer"
                >
                  <span className="size-1.5 rounded-full bg-[#1F3622]" />
                  Naman Gupta (Super Admin)
                </button>
                <button
                  type="button"
                  onClick={fillAdmin2}
                  className="flex items-center gap-1.5 rounded-md bg-white border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-[#EDF4EE] hover:border-[#1F3622] hover:text-[#1F3622] transition-colors cursor-pointer"
                >
                  <span className="size-1.5 rounded-full bg-[#1F3622]" />
                  Rohit Khanna (Admin)
                </button>
                <button
                  type="button"
                  onClick={fillAdmin3}
                  className="flex items-center gap-1.5 rounded-md bg-white border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-[#EDF4EE] hover:border-[#1F3622] hover:text-[#1F3622] transition-colors cursor-pointer"
                >
                  <span className="size-1.5 rounded-full bg-[#1F3622]" />
                  Meera Sengupta (Admin)
                </button>
              </div>
            </div>

            {/* 5 Staff Technicians */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Staff Technicians (5)
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={fillStaffElectrician}
                  className="flex items-center gap-1.5 rounded-md bg-white border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-[#EDF4EE] hover:border-[#1F3622] hover:text-[#1F3622] transition-colors cursor-pointer"
                >
                  <span className="size-1.5 rounded-full bg-[#788F54]" />
                  Ramesh Kumar (Electrician)
                </button>
                <button
                  type="button"
                  onClick={fillStaffPlumber}
                  className="flex items-center gap-1.5 rounded-md bg-white border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-[#EDF4EE] hover:border-[#1F3622] hover:text-[#1F3622] transition-colors cursor-pointer"
                >
                  <span className="size-1.5 rounded-full bg-[#788F54]" />
                  Suresh Sharma (Plumber)
                </button>
              </div>
            </div>

            {/* Residents */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Residents
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={fillResidentPriya}
                  className="flex items-center gap-1.5 rounded-md bg-white border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-[#EDF4EE] hover:border-[#1F3622] hover:text-[#1F3622] transition-colors cursor-pointer"
                >
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  Priya Sharma (Unit 402)
                </button>
                <button
                  type="button"
                  onClick={fillResidentVikram}
                  className="flex items-center gap-1.5 rounded-md bg-white border border-[#DFD9CA] px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-[#EDF4EE] hover:border-[#1F3622] hover:text-[#1F3622] transition-colors cursor-pointer"
                >
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  Vikram Malhotra (Unit 801)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  ...rest
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-semibold text-slate-700">
        {label}
      </Label>
      <Input id={name} name={name} className="h-9 text-sm" {...rest} />
    </div>
  );
}
