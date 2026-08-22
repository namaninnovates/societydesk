import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignOut, CheckCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { updateProfileServerFn } from "@/lib/auth.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SocietyDesk" },
      { name: "description", content: "Update your name, flat, block and phone number." },
      { property: "og:title", content: "Profile — SocietyDesk" },
      { property: "og:description", content: "Manage your SocietyDesk resident profile." },
    ],
  }),
  component: ProfilePage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(80),
  unit_number: z.string().trim().max(20),
  block: z.string().trim().max(20),
  phone: z.string().trim().max(20),
});

function ProfilePage() {
  const { profile, profileLoading, session, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: "", unit_number: "", block: "", phone: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        unit_number: profile.unit_number ?? "",
        block: profile.block ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  if (profileLoading) return <Skeleton className="h-64 w-full rounded-xl" />;

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    toast.success("Signed out successfully");
    navigate({ to: "/auth" });
  };

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("societydesk_token") : null;
    if (!token) {
      toast.error("Session expired, please sign in again");
      return;
    }

    setBusy(true);
    try {
      const updated = await updateProfileServerFn({
        data: {
          token,
          full_name: parsed.data.full_name,
          unit_number: parsed.data.unit_number,
          block: parsed.data.block,
          phone: parsed.data.phone,
        },
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("societydesk_profile", JSON.stringify(updated));
      }
      queryClient.setQueryData(["auth_user"], updated);
      queryClient.invalidateQueries({ queryKey: ["auth_user"] });
      toast.success("Profile updated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111215]">Profile</h1>
          <p className="text-sm text-muted-foreground">{session?.user.email}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <SignOut className="mr-1.5 size-4" /> Sign out
        </Button>
      </div>

      <div className="surface space-y-4 p-6 border border-[#DFD9CA] rounded-2xl bg-white shadow-sm">
        {(
          [
            ["full_name", "Full name"],
            ["unit_number", "Flat / unit number"],
            ["block", "Block / tower"],
            ["phone", "Phone number"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={key} className="text-xs font-semibold uppercase text-slate-600">
              {label}
            </Label>
            <Input
              id={key}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="h-10"
            />
          </div>
        ))}

        <div className="pt-2 flex items-center gap-3">
          <Button onClick={save} disabled={busy} className="bg-[#1F3622] hover:bg-[#2E4E30]">
            <CheckCircle className="mr-1.5 size-4" /> Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
