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
      showNotification("success", res.message || "Profile details updated successfully!");
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
      showNotification("success", res.message || "Password successfully changed!");
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
    <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col gap-4 max-w-7xl w-full mx-auto">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-teal-50 via-teal-100/60 to-emerald-50 p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-teal-200/50">
        <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0 w-full sm:w-auto">
          {/* Avatar */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 bg-white">
            <Image
              src={user.avatarUrl || "/avatar.png"}
              alt={user.name}
              fill
              className="object-cover"
              sizes="80px"
              priority
            />
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight truncate">
                {user.name}
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-teal-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                {user.role.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 truncate">
              {user.email}
            </p>
            <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 truncate">
              <Building className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
              <span>{user.department || "Philly Flagship Store"} • SmartFoneDoctor</span>
            </p>
          </div>
        </div>

        {/* QUICK STATS & STATUS PILLS */}
        <div className="w-full md:w-auto bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-sm border border-teal-100 flex items-center justify-around md:justify-start gap-3 divide-x divide-gray-100 shrink-0">
          <div className="px-3 py-1 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  user.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                }`}
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-gray-800 leading-tight">
                {user.isActive ? "Active Admin" : "Inactive"}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 block mt-0.5">Account Status</span>
          </div>

          <div className="px-3 py-1 text-center pl-4">
            <button
              type="button"
              onClick={handleToggle2FA}
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 text-xs font-bold leading-tight cursor-pointer hover:opacity-80 transition-opacity"
              title="Click to toggle Two-Factor Authentication"
            >
              {user.twoFactorEnabled ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-700">2FA Active</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                  <span className="text-amber-700">2FA Off</span>
                </>
              )}
            </button>
            <span className="text-[10px] text-gray-400 block mt-0.5">Click to Toggle</span>
          </div>

          <div className="px-3 py-1 text-center pl-4">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <span className="text-[10px] text-gray-400 block mt-0.5">End Session</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK NOTIFICATION ALERTS */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
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
            className="text-gray-400 hover:text-gray-600 font-bold px-2 py-0.5 cursor-pointer text-lg leading-none"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-gray-200 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 pb-2.5 px-3.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === "general"
              ? "border-teal-600 text-teal-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <User className="w-4 h-4" aria-hidden="true" />
          <span>Profile Details</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-1.5 pb-2.5 px-3.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === "security"
              ? "border-teal-600 text-teal-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <KeyRound className="w-4 h-4" aria-hidden="true" />
          <span>Security &amp; Password</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-1.5 pb-2.5 px-3.5 transition-colors cursor-pointer border-b-2 ${
            activeTab === "sessions"
              ? "border-teal-600 text-teal-700 font-bold"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span>Session &amp; Audit Logs</span>
        </button>
      </div>

      {/* 3. TAB 1: GENERAL PROFILE DETAILS */}
      {activeTab === "general" && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Personal &amp; Store Information</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your administrative contact details and store dispatch assignment.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full font-medium">
              <Building className="w-3 h-3 text-teal-600" />
              <span>PostgreSQL Persisted</span>
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                  Admin Full Name
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm font-medium"
                    placeholder="Dr. Mike"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                  Email Address (Primary Login)
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-xs sm:text-sm"
                    title="Email cannot be changed directly for security reasons"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                  Direct Phone Number
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (215) 555-0100"
                    className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                  Department / Store Assignment
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Executive Management & Flagship Ops"
                    className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                Store Physical Address
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="33 S 52nd St, Philadelphia, PA 19139"
                  className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                Bio &amp; Operations Responsibility
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="SmartFoneDoctor Flagship Store Admin & Head of Technical Operations."
                className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm leading-relaxed resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 disabled:opacity-60 cursor-pointer"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB 2: SECURITY & PASSWORD UPDATE */}
      {activeTab === "security" && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-gray-100 max-w-2xl">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900">Change Account Password</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Your password is encrypted with NIST scrypt key derivation. Keep it unique and secure.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter existing password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                New Password (Minimum 8 Characters)
              </label>
              <input
                type="password"
                required
                placeholder="Enter new strong password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold uppercase tracking-wider text-[11px]">
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
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/10 text-gray-800 text-xs sm:text-sm"
              />
            </div>

            <div className="p-3.5 bg-teal-50/70 rounded-xl text-teal-900 text-xs leading-relaxed border border-teal-200/50 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Security Recommendation:</span> Use at least 8 characters with a mix of uppercase letters, numbers, and symbols to maximize entropy.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-teal-600/20 disabled:opacity-60 cursor-pointer"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB 3: SESSION & AUDIT LOGS */}
      {activeTab === "sessions" && (
        <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-xs border border-gray-100 max-w-3xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Active Session &amp; Security Audit</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Monitor active logins and ensure your admin credentials are not compromised.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      Current Admin Web Session
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      This Device
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    HTTP-Only Session Cookie • 256-bit Token
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <span className="text-emerald-600 font-semibold block">Connected</span>
                <span>Active now</span>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium text-gray-500">Last Sign-in Recorded:</span>
              <span className="font-semibold text-gray-900">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "First session"}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium text-gray-500">Account Created:</span>
              <span className="font-semibold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  dateStyle: "long",
                })}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium text-gray-500">Two-Factor Authentication:</span>
              <span
                className={`font-semibold ${
                  user.twoFactorEnabled ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {user.twoFactorEnabled ? "Enabled (Enforced)" : "Disabled (Optional)"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
            <div className="text-xs text-gray-600">
              <p className="font-bold text-gray-800">Need to terminate all other sessions?</p>
              <p className="text-gray-500">
                Sign out will invalidate your token in the PostgreSQL database.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Log Out Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
