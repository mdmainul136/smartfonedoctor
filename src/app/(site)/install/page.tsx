"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  Layers,
  Check,
} from "lucide-react";
import { checkInstallStatusAction, runInstallerAction, InstallStatusResult } from "@/actions/installer";

export default function WebInstallerPage() {
  const router = useRouter();
  const [status, setStatus] = useState<InstallStatusResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [adminName, setAdminName] = useState("Dr. Mike");
  const [adminEmail, setAdminEmail] = useState("admin@smartfonedoctor.com");
  const [adminPassword, setAdminPassword] = useState("admin123456");
  const [confirmPassword, setConfirmPassword] = useState("admin123456");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [installingStep, setInstallingStep] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    checkInstallStatusAction()
      .then((res) => {
        setStatus(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleInstall = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (adminPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (adminPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    startTransition(async () => {
      setInstallingStep("Connecting to Database & Seeding Core Datasets...");
      const res = await runInstallerAction({
        adminName,
        adminEmail,
        adminPassword,
      });

      if (!res.success) {
        setError(res.error || "Installation failed. Please check logs.");
        setInstallingStep(null);
        return;
      }

      setInstallingStep("Finalizing security locks and provisions...");
      setTimeout(() => {
        setSuccess(true);
        setInstallingStep(null);
      }, 1000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-8 h-8 text-sfd-teal animate-spin mb-3" />
        <span className="text-xs font-semibold text-gray-500">Checking system installation status...</span>
      </div>
    );
  }

  // If already installed, show permanent security lock screen
  if (status?.isInstalled && !success) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              System Already Installed
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
              Application is Locked
            </h1>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              SmartFoneDoctor has already been configured and initialized. For security reasons, the installer cannot be executed again.
            </p>
          </div>

          {status.installedAt && (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-left text-xs text-gray-600 space-y-1 font-mono">
              <div><span className="text-gray-400">Lock status:</span> Active (One-Time Lock)</div>
              <div><span className="text-gray-400">Super Admin:</span> {status.adminEmail || "Configured"}</div>
              <div><span className="text-gray-400">Installed on:</span> {new Date(status.installedAt).toLocaleString()}</div>
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/sign-in"
              className="w-full h-10 rounded-xl bg-sfd-teal hover:bg-[#007e7a] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Go to Admin Sign-In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Installation Completed Success Screen
  if (success) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Setup Completed
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
              Installation Successful!
            </h1>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              All 11 domain datasets, device taxonomies, Puck page templates, and your Super Administrator account have been provisioned.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs space-y-1.5 font-mono text-gray-700">
            <div><span className="text-gray-400">Super Admin:</span> {adminEmail}</div>
            <div><span className="text-gray-400">Password:</span> {adminPassword}</div>
            <div><span className="text-gray-400">Role:</span> Super Administrator</div>
            <div><span className="text-gray-400">Lock File:</span> Created (.installed)</div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in"
              className="w-full h-10 rounded-xl bg-sfd-teal hover:bg-[#007e7a] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Proceed to Sign-In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center justify-center"
            >
              View Public Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Installer Wizard Form
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] p-4 py-12">
      <div className="w-full max-w-[500px] flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-sfd-teal text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" />
            <span>SmartFoneDoctor OS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            System Installation Wizard
          </h1>
          <p className="text-xs sm:text-[13px] text-gray-500 max-w-sm mx-auto">
            One-time automated database setup, taxonomy seeding, and Super Administrator configuration.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-gray-800">PostgreSQL Database:</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleInstall} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Super Admin Name
              </label>
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Dr. Mike"
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-sfd-teal focus:ring-1 focus:ring-sfd-teal"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Super Admin Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@smartfonedoctor.com"
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-sfd-teal focus:ring-1 focus:ring-sfd-teal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-sfd-teal focus:ring-1 focus:ring-sfd-teal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-sfd-teal focus:ring-1 focus:ring-sfd-teal"
                />
              </div>
            </div>

            {/* Checklist of Auto-Installed Domains */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Automated Installation Manifest
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 22 Device Models</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 14 Issue Types</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Puck Page Templates</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Mega Menu Router</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> SEO / AEO Knowledge</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> 3 Philly Store Branches</div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-10 rounded-xl bg-sfd-teal hover:bg-[#007e7a] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{installingStep || "Installing..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run One-Time Automated Install</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400">
          Once installed, the installer automatically self-locks to prevent unauthorized resets.
        </p>

      </div>
    </div>
  );
}
