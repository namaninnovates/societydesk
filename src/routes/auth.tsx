import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { Buildings, SpinnerGap, ShieldCheck, UserCheck, Key } from "@phosphor-icons/react";
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
  mode: z.enum(["signin", "signup", "admin"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign In / Register — SocietyDesk" },
      { name: "description", content: "Sign in as admin or register as resident on SocietyDesk." },
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
  const [tab, setTab] = useState<string>(search.mode || "signin");

  // Controlled form states for 1-click filling
  const [adminEmail, setAdminEmail] = useState("admin@societydesk.com");
  const [adminPassword, setAdminPassword] = useState("SocietyDesk@2026!");
  const [residentEmail, setResidentEmail] = useState("resident@societydesk.com");
  const [residentPassword, setResidentPassword] = useState("Resident@2026!");

  useEffect(() => {
    if (search.mode) {
      setTab(search.mode);
    }
  }, [search.mode]);

  useEffect(() => {
    if (session && profile) {
      navigate({ to: profile.role === "admin" ? "/admin" : "/complaints", replace: true });
    }
  }, [session, profile, navigate]);

  const handleSignIn = async (
    e: React.FormEvent<HTMLFormElement>,
    roleHint?: "admin" | "resident",
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
        roleHint === "admin" ? "Welcome back, Admin" : `Welcome back, ${res.profile.full_name}`,
      );
      navigate({ to: res.profile.role === "admin" ? "/admin" : "/complaints", replace: true });
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

  const fillAdmin = () => {
    setTab("admin");
    setAdminEmail("admin@societydesk.com");
    setAdminPassword("SocietyDesk@2026!");
    toast.info("Admin credentials loaded");
  };

  const fillResident = () => {
    setTab("signin");
    setResidentEmail("resident@societydesk.com");
    setResidentPassword("Resident@2026!");
    toast.info("Demo Resident credentials loaded");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F4ED] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <BrandLogo linkTo="/" />
        </div>

        <div className="surface p-6 shadow-sm border border-[#DFD9CA] bg-white rounded-2xl">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3 bg-[#F1EDE1] p-1 rounded-xl">
              <TabsTrigger
                value="signin"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#111215]"
              >
                Resident
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#111215]"
              >
                Register Flat
              </TabsTrigger>
              <TabsTrigger
                value="admin"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#111215]"
              >
                Admin
              </TabsTrigger>
            </TabsList>

            {/* RESIDENT SIGN IN */}
            <TabsContent value="signin">
              <form onSubmit={(e) => handleSignIn(e, "resident")} className="space-y-4 pt-4">
                <Field
                  label="Email address"
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
                  {busy ? <SpinnerGap className="size-4 animate-spin" /> : null} Sign in as Resident
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER AS RESIDENT */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
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
            </TabsContent>

            {/* ADMIN SIGN IN */}
            <TabsContent value="admin">
              <form onSubmit={(e) => handleSignIn(e, "admin")} className="space-y-4 pt-4">
                <div className="rounded-lg bg-[#E8EFEA] border border-[#C2D6CA] p-2.5 text-xs text-[#1F3622]">
                  <span className="font-bold">Admin Portal:</span> For society committee members &
                  facility managers.
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
          <div className="mt-6 rounded-xl border border-dashed border-[#DFD9CA] bg-[#FAF8F2] p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Key className="size-3.5 text-[#1F3622]" />
              Quick Demo Logins:
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="size-3 text-emerald-600" />
                Fill Admin (admin@societydesk.com)
              </button>
              <button
                type="button"
                onClick={fillResident}
                className="flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2.5 py-1 font-medium text-slate-800 hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                <UserCheck className="size-3 text-blue-600" />
                Fill Resident
              </button>
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
