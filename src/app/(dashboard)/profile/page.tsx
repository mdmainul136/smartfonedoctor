"use client";

import Image from "next/image";
import { useState } from "react";
import {
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Building,
  Mail,
  Phone,
} from "lucide-react";

const AdminProfilePage = () => {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  // General profile state
  const [profile, setProfile] = useState({
    name: "Dr. Mike",
    email: "admin@smartfonedoctor.com",
    phone: "+1 (215) 555-0100",
    role: "Super Admin / Business Owner",
    address: "33 S 52nd St, Philadelphia, PA 19139",
    bio: "SmartFoneDoctor Flagship Store Admin & Head of Technical Operations.",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage("Profile information updated successfully!");
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="flex-1 p-3 sm:p-4 lg:p-6 flex flex-col gap-4 max-w-7xl w-full mx-auto">
      {/* 1. TOP HEADER BANNER (Responsive & Awesome-Design standard) */}
      <div className="bg-lamaSky p-4 sm:p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs border border-teal-100/40">
        <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0 w-full sm:w-auto">
          {/* Avatar */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
            <Image
              src="/avatar.png"
              alt={profile.name}
              fill
              className="object-cover"
              sizes="80px"
              priority
            />
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight truncate">
                {profile.name}
              </h1>
              <span className="text-[10px] sm:text-[11px] font-semibold bg-white text-teal-800 px-2.5 py-0.5 rounded-full shadow-2xs border border-white/60">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-1 truncate">
              {profile.role}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1 truncate">
              <Building className="w-3 h-3 text-teal-600 shrink-0" aria-hidden="true" />
              <span>SmartFoneDoctor • Philly Flagship</span>
            </p>
          </div>
        </div>

        {/* QUICK STATS PILLS (Sleek integrated bar for mobile & desktop) */}
        <div className="w-full md:w-auto bg-white/90 backdrop-blur-xs rounded-xl p-1.5 shadow-2xs border border-white/80 flex items-center justify-around md:justify-start divide-x divide-gray-100 shrink-0">
          <div className="px-1 py-1 text-center flex-1 md:flex-initial">
            <div className="flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="text-xs font-bold text-gray-800 leading-tight">Active</span>
            </div>
            <span className="text-[10px] text-gray-400 block mt-0.5">Account Status</span>
          </div>

          <div className="px-1 py-1 text-center flex-1 md:flex-initial">
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-800 leading-tight">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
              <span>2FA Enabled</span>
            </div>
            <span className="text-[10px] text-gray-400 block mt-0.5">Security</span>
          </div>
        </div>
      </div>

      {/* SUCCESS NOTIFICATION */}
      {savedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="font-medium">{savedMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold px-2 py-0.5 cursor-pointer"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. TAB NAVIGATION (With clean SVG icons) */}
      <div className="flex items-center gap-1 border-b border-gray-200 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-1.5 pb-2.5 px-3.5 transition-colors cursor-pointer ${
            activeTab === "general"
              ? "border-b-2 border-teal-600 text-teal-700 font-bold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <User className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Profile Details</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-1.5 pb-2.5 px-3.5 transition-colors cursor-pointer ${
            activeTab === "security"
              ? "border-b-2 border-teal-600 text-teal-700 font-bold"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Security &amp; Password</span>
        </button>
      </div>

      {/* 3. TAB 1: GENERAL PROFILE DETAILS */}
      {activeTab === "general" && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xs border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Edit Admin Profile
          </h2>
          <p className="text-xs text-gray-400 mb-5">
            Manage your personal admin information and contact details.
          </p>

          <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold">Admin Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold">Admin Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-700 font-semibold">Job Title / Access Level</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold">Physical Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold">Bio / Notes</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700 leading-relaxed resize-none"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-4">
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB 2: SECURITY & PASSWORD UPDATE */}
      {activeTab === "security" && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xs border border-gray-100 max-w-2xl">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Update Password</h2>
          <p className="text-xs text-gray-400 mb-5">
            Ensure your account uses a strong, random password to stay secure.
          </p>

          <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, currentPassword: e.target.value })
                }
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold">New Password</label>
              <input
                type="password"
                placeholder="Enter minimum 8 characters"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-gray-700 font-semibold">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirmPassword: e.target.value })
                }
                className="p-2.5 rounded-lg border border-gray-200 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-gray-700"
                required
              />
            </div>

            <div className="p-3.5 bg-lamaSkyLight/70 rounded-lg text-gray-600 text-[11px] leading-relaxed border border-teal-100/50">
              💡 <span className="font-semibold text-gray-700">Recommendation:</span> Use at least 8 characters with a combination of letters, numbers, and special symbols.
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProfilePage;
