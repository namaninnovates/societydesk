import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  UserPlus,
  Wrench,
  Shield,
  User,
  Trash,
  PencilSimple,
  MagnifyingGlass,
  Phone,
  Buildings,
  Check,
  CaretDown,
} from "@phosphor-icons/react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  fetchResidentsServerFn,
  createUserByAdminServerFn,
  updateUserRoleServerFn,
  updateUserServerFn,
  deleteUserServerFn,
  type AuthProfile,
} from "@/lib/auth.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/residents")({
  head: () => ({
    meta: [
      { title: "User & Staff Management — SocietyDesk" },
      {
        name: "description",
        content: "Manage residents, staff technicians, and admin permissions.",
      },
      { property: "og:title", content: "User & Staff Management — SocietyDesk" },
      {
        property: "og:description",
        content: "Admin console to manage users, roles, and staff directory.",
      },
    ],
  }),
  component: UserManagement,
});

const ROLE_CONFIG = {
  resident: {
    label: "Resident",
    icon: User,
    badge: "bg-slate-100 text-slate-800 border-slate-300",
  },
  staff: {
    label: "Staff / Technician",
    icon: Wrench,
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  admin: {
    label: "Administrator",
    icon: Shield,
    badge: "bg-[#EDF4EE] text-[#1F3622] border-[#C8DAC2]",
  },
} as const;

function UserManagement() {
  const { profile, isAdmin, profileLoading } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "resident" | "staff" | "admin">("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthProfile | null>(null);

  // Form states for creating new user
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("SocietyDesk@2026");
  const [newRole, setNewRole] = useState<"admin" | "staff" | "resident">("staff");
  const [newPhone, setNewPhone] = useState("");
  const [newBlock, setNewBlock] = useState("");
  const [newUnit, setNewUnit] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["residents"],
    queryFn: async () => {
      return await fetchResidentsServerFn();
    },
    enabled: Boolean(isAdmin && profile?.role === "admin"),
  });

  const allUsers = useMemo(() => data ?? [], [data]);

  const filteredUsers = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!term) return true;
      return (
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.unit_number ?? "").toLowerCase().includes(term) ||
        (u.block ?? "").toLowerCase().includes(term) ||
        (u.phone ?? "").toLowerCase().includes(term)
      );
    });
  }, [allUsers, roleFilter, q]);

  const residentsCount = allUsers.filter((u) => u.role === "resident").length;
  const staffCount = allUsers.filter((u) => u.role === "staff").length;
  const adminCount = allUsers.filter((u) => u.role === "admin").length;

  const createUserMut = useMutation({
    mutationFn: async () => {
      if (!newFullName.trim() || !newEmail.trim()) {
        throw new Error("Full name and email are required.");
      }
      return await createUserByAdminServerFn({
        data: {
          full_name: newFullName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
          phone: newPhone.trim() || null,
          block: newBlock.trim() || null,
          unit_number: newUnit.trim() || null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success(`New ${newRole} account created successfully!`);
      setIsAddOpen(false);
      setNewFullName("");
      setNewEmail("");
      setNewPhone("");
      setNewBlock("");
      setNewUnit("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateRoleMut = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "staff" | "resident";
    }) => {
      return await updateUserRoleServerFn({
        data: { userId, role },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("User role updated successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateUserMut = useMutation({
    mutationFn: async () => {
      if (!editingUser) return;
      return await updateUserServerFn({
        data: {
          userId: editingUser.id,
          full_name: editingUser.full_name,
          email: editingUser.email,
          role: editingUser.role,
          phone: editingUser.phone,
          block: editingUser.block,
          unit_number: editingUser.unit_number,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("User details updated");
      setEditingUser(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUserMut = useMutation({
    mutationFn: async (userId: string) => {
      if (!confirm("Are you sure you want to remove this user account?")) return;
      return await deleteUserServerFn({ data: { userId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("User removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (profileLoading) return <Skeleton className="h-64 w-full rounded-2xl" />;
  if (!profile || !isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111215]">
            User & Staff Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage society residents, onboard maintenance staff technicians, and assign role
            permissions.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-[#1F3622] text-white hover:bg-[#2E4E30] cursor-pointer"
        >
          <UserPlus className="mr-2 size-4" />
          Add User / Staff
        </Button>
      </div>

      {/* ── ROLE TABS & SEARCH ────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#DFD9CA] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              roleFilter === "all"
                ? "bg-[#1F3622] text-white shadow-xs"
                : "bg-white border border-[#DFD9CA] text-[#4F5148] hover:bg-[#F3EFE6]"
            }`}
          >
            All Users ({allUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("staff")}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === "staff"
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-white border border-[#DFD9CA] text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <Wrench className="size-3.5" />
            Staff Technicians ({staffCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("resident")}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === "resident"
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-white border border-[#DFD9CA] text-slate-700 hover:bg-slate-100"
            }`}
          >
            <User className="size-3.5" />
            Residents ({residentsCount})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("admin")}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              roleFilter === "admin"
                ? "bg-[#1F3622] text-white shadow-xs"
                : "bg-white border border-[#DFD9CA] text-[#1F3622] hover:bg-[#EDF4EE]"
            }`}
          >
            <Shield className="size-3.5" />
            Admins ({adminCount})
          </button>
        </div>

        <div className="relative">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, unit, phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-9 w-full sm:w-72 pl-8 text-xs bg-white"
          />
        </div>
      </div>

      {/* ── USERS DIRECTORY TABLE ─────────────────────────────── */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          body="Try adjusting your filter or search keyword."
        />
      ) : (
        <div className="rounded-2xl border border-[#DFD9CA] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] border-b border-[#DFD9CA] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Location / Unit</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE0]">
                {filteredUsers.map((u) => {
                  const roleConf = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.resident;
                  const isCurrentUser = u.id === profile.id;

                  return (
                    <tr key={u.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#EDF4EE] text-[#1F3622] font-bold text-xs">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.full_name || "—"}</p>
                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleConf.badge}`}
                          >
                            <roleConf.icon className="size-3" weight="bold" />
                            {roleConf.label}
                          </span>

                          {!isCurrentUser && (
                            <Select
                              value={u.role}
                              onValueChange={(newR: "admin" | "staff" | "resident") => {
                                updateRoleMut.mutate({ userId: u.id, role: newR });
                              }}
                            >
                              <SelectTrigger className="h-6 w-20 text-[10px] bg-white border-dashed">
                                <SelectValue placeholder="Change" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="resident">Resident</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {u.phone ? (
                          <a
                            href={`tel:${u.phone}`}
                            className="inline-flex items-center gap-1 hover:underline text-[#1F3622] font-medium"
                          >
                            <Phone className="size-3" />
                            {u.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {u.block || u.unit_number ? (
                          <div className="flex items-center gap-1">
                            <Buildings className="size-3.5 text-slate-400" />
                            <span>
                              {u.block ? `${u.block} ` : ""}
                              {u.unit_number ? `Unit ${u.unit_number}` : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Main Campus</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(u)}
                            className="h-7 px-2 text-xs text-slate-600 hover:bg-[#FAF8F2] cursor-pointer"
                            title="Edit details"
                          >
                            <PencilSimple className="size-3.5" />
                          </Button>
                          {!isCurrentUser && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteUserMut.mutate(u.id)}
                              className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete user"
                            >
                              <Trash className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD USER / STAFF MODAL ───────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Onboard New User or Staff</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createUserMut.mutate();
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-xs font-medium">Role Assignment</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setNewRole("staff")}
                  className={`cursor-pointer rounded-xl border p-2.5 text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                    newRole === "staff"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-border bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Wrench className="size-4 text-emerald-700" weight="bold" />
                  Staff / Tech
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole("resident")}
                  className={`cursor-pointer rounded-xl border p-2.5 text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                    newRole === "resident"
                      ? "border-slate-800 bg-slate-100 text-slate-900"
                      : "border-border bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <User className="size-4 text-slate-700" weight="bold" />
                  Resident
                </button>
                <button
                  type="button"
                  onClick={() => setNewRole("admin")}
                  className={`cursor-pointer rounded-xl border p-2.5 text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                    newRole === "admin"
                      ? "border-[#1F3622] bg-[#EDF4EE] text-[#1F3622]"
                      : "border-border bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Shield className="size-4 text-[#1F3622]" weight="bold" />
                  Admin
                </button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Full Name *</Label>
              <Input
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar (Electrician)"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Email Address *</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="ramesh@societydesk.com"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium">Phone Number</Label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Initial Password</Label>
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium">Tower / Block</Label>
                <Input
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  placeholder="e.g. Tower B / Maintenance"
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Unit Number</Label>
                <Input
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. 402 / Dept 1"
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createUserMut.isPending || !newFullName.trim() || !newEmail.trim()}
                className="text-xs bg-[#1F3622] text-white hover:bg-[#2E4E30] cursor-pointer"
              >
                {createUserMut.isPending ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── EDIT USER MODAL ──────────────────────────────────── */}
      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(v) => {
          if (!v) setEditingUser(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>

          {editingUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateUserMut.mutate();
              }}
              className="space-y-4 pt-2"
            >
              <div>
                <Label className="text-xs font-medium">Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(val: "admin" | "staff" | "resident") =>
                    setEditingUser({ ...editingUser, role: val })
                  }
                >
                  <SelectTrigger className="mt-1 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="staff">Staff Technician</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium">Full Name</Label>
                <Input
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium">Email Address</Label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-medium">Phone</Label>
                  <Input
                    value={editingUser.phone ?? ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Block</Label>
                  <Input
                    value={editingUser.block ?? ""}
                    onChange={(e) => setEditingUser({ ...editingUser, block: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Unit Number</Label>
                <Input
                  value={editingUser.unit_number ?? ""}
                  onChange={(e) => setEditingUser({ ...editingUser, unit_number: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateUserMut.isPending}
                  className="text-xs bg-[#1F3622] text-white hover:bg-[#2E4E30] cursor-pointer"
                >
                  {updateUserMut.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
