"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  AlertCircle,
  Clock,
  Laptop,
  LogOut,
  ShieldAlert,
  Loader2,
  MapPin,
} from "lucide-react";
import {
  AdminUserPublic,
  updateAdminProfileAction,
  changeAdminPasswordAction,
  toggleTwoFactorAction,
  logoutAdminAction,
} from "@/actions/auth";

interface AdminProfileClientProps {
  initialUser: AdminUserPublic;
}

export default function AdminProfileClient({ initialUser }: AdminProfileClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "sessions">("general");

  // Profile Form State
  const [user, setUser] = useState<AdminUserPublic>(initialUser);
  const [formData, setFormData] = useState({
    name: initialUser.name || "",
    email: initialUser.email || "",
    phone: initialUser.phone || "",
    role: initialUser.role || "super_admin",
    address: initialUser.address || "",
    bio: initialUser.bio || "",
    department: initialUser.department || "",
  });

  // Password Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification States
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const showNotification = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    if (type === "success") {
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // 1. Save General Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const res = await updateAdminProfileAction({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        department: formData.department,
      });

      if (!res.success || !res.data) {
        showNotification("error", res.error || "Failed to update profile.");
        return;
      }

      setUser(res.data);
      window.dispatchEvent(
        new CustomEvent("sfd-admin-profile-updated", {
          detail: {
            name: res.data.name,
            email: res.data.email,
            avatarUrl: res.data.avatarUrl,
          },
        })
      );
      router.refresh();
      showNotification("success", res.message || "Profile details updated successfully.");
    });
  };

  // 2. Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (passwords.newPassword.length < 8) {
      showNotification("error", "New password must be at least 8 characters long.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotification("error", "New password and confirmation do not match.");
      return;
    }

    startTransition(async () => {
      const res = await changeAdminPasswordAction({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });

      if (!res.success) {
        showNotification("error", res.error || "Failed to update password.");
        return;
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showNotification("success", res.message || "Password successfully changed.");
    });
  };

  // 3. Toggle 2FA
  const handleToggle2FA = () => {
    startTransition(async () => {
      const res = await toggleTwoFactorAction();
      if (!res.success || !res.data) {
        showNotification("error", res.error || "Failed to toggle Two-Factor Authentication.");
        return;
      }
      setUser((prev) => ({ ...prev, twoFactorEnabled: res.data!.twoFactorEnabled }));
      showNotification("success", res.message || "Security settings updated.");
    });
  };

  // 4. Sign Out
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdminAction();
      router.push("/sign-in");
      router.refresh();
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-5xl w-full mx-auto antialiased">
      {/* 1. TOP HEADER BANNER (Shadcn Clean) */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
          {/* Avatar */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
            <Image
              src={user.avatarUrl || "/avatar.png"}
              alt={user.name}
              fill
              className="object-cover"
              sizes="72px"
              priority
            />
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 leading-tight truncate">
                {user.name}
              </h1>
              <span className="text-[11px] font-medium uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200/80 px-2 py-0.5 rounded-md">
                {user.role.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 truncate">
              {user.email}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5 truncate">
              <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden="true" />
              <span>{user.department || "Philly Flagship Store"} · SmartFoneDoctor</span>
            </p>
          </div>
        </div>

        {/* QUICK STATUS PILLS */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100">
          <div className="h-9 px-3 rounded-md border border-zinc-200 bg-zinc-50/50 flex items-center gap-2 text-xs font-medium text-zinc-700">
            <span
              className={`w-2 h-2 rounded-full ${
                user.isActive ? "bg-emerald-500" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            <span>{user.isActive ? "Active Account" : "Suspended"}</span>
          </div>

          <button
            type="button"
            onClick={handleToggle2FA}
            disabled={isPending}
            className="h-9 px-3 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Toggle Two-Factor Authentication"
          >
            {user.twoFactorEnabled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>2FA On</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                <span>2FA Off</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="h-9 px-3 rounded-md border border-zinc-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-xs font-medium text-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-red-50/70 border-red-200 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-zinc-400 hover:text-zinc-700 px-2 py-0.5 text-base leading-none cursor-pointer"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. TAB NAVIGATION (Shadcn Tabs) */}
      <div className="flex items-center gap-1 border-b border-zinc-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`h-9 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "general"
              ? "border-zinc-950 text-zinc-950 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`h-9 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "security"
              ? "border-zinc-950 text-zinc-950 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Password &amp; Security</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`h-9 px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "sessions"
              ? "border-zinc-950 text-zinc-950 font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sessions &amp; Audit</span>
        </button>
      </div>

      {/* 3. TAB 1: GENERAL PROFILE DETAILS */}
      {activeTab === "general" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-zinc-900">Personal &amp; Store Information</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage your administrative contact details and store dispatch assignment
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. Mike"
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">
                  Direct Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (215) 555-0100"
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-900">
                  Department / Store Assignment
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Flagship Store Ops"
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">
                Store Physical Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="33 S 52nd St, Philadelphia, PA 19139"
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">
                Bio &amp; Technical Scope
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Flagship Store Admin & Head of Technical Operations."
                className="w-full rounded-md border border-zinc-200 bg-transparent p-3 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={isPending}
                className="h-9 rounded-md bg-zinc-950 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB 2: SECURITY & PASSWORD UPDATE */}
      {activeTab === "security" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs max-w-2xl">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-zinc-900">Update Password</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Your password is encrypted with NIST-standard scrypt key derivation
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">
                New Password (Minimum 8 Characters)
              </label>
              <input
                type="password"
                required
                placeholder="Enter new password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-900">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmPassword: e.target.value })
                }
                className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
              />
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-zinc-900">Security Requirement:</span> Use at least 8 characters with a mix of letters, numbers, and symbols.
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={isPending}
                className="h-9 rounded-md bg-zinc-950 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB 3: SESSION & AUDIT LOGS */}
      {activeTab === "sessions" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs max-w-3xl flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Active Sessions &amp; Security</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage your active administrator sessions and credentials
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-200">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900">
                      Current Web Session
                    </span>
                    <span className="text-[10px] bg-zinc-100 text-zinc-800 border border-zinc-200 px-1.5 py-0.5 rounded font-medium">
                      This Device
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    HTTP-Only Session Cookie · 256-bit Token
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-emerald-600">Active now</span>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Last Sign-in:</span>
              <span className="font-medium text-zinc-900">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "First session"}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Account Created:</span>
              <span className="font-medium text-zinc-900">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  dateStyle: "long",
                })}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Two-Factor Authentication:</span>
              <span className="font-medium text-zinc-900">
                {user.twoFactorEnabled ? "Active" : "Not configured"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="text-xs">
              <p className="font-medium text-zinc-900">Sign out of all sessions?</p>
              <p className="text-zinc-500">
                This will invalidate your session token in PostgreSQL.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="h-8 rounded-md bg-zinc-950 px-3 text-xs font-medium text-white hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
