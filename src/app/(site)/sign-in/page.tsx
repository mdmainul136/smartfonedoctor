"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Wrench,
  Smartphone,
} from "lucide-react";
import { loginAdminAction } from "@/actions/auth";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await loginAdminAction({
        email,
        password,
        rememberMe,
      });

      if (!res.success) {
        setError(res.error || "Authentication failed. Please verify your credentials.");
        return;
      }

      // Successful login redirect
      const target = from.startsWith("/") ? from : "/admin";
      router.push(target);
      router.refresh();
    });
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-md space-y-6">
        {/* BRAND LOGO & HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 mb-4">
            <Smartphone className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            SmartFone<span className="text-teal-600">Doctor</span> Portal
          </h1>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            Philly Flagship Store • Executive & Technician Access
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-red-700 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <div className="text-xs sm:text-sm font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL INPUT */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartfonedoctor.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME & SECURITY BADGE */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0"
                />
                <span className="text-xs text-gray-600 font-medium">Keep me signed in</span>
              </label>
              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>256-bit Encrypted</span>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* DEMO / QUICK FILL SHORTCUT PILLS */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center mb-2.5">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin@smartfonedoctor.com", "admin123456")}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-teal-50 hover:bg-teal-100/70 border border-teal-200/60 text-teal-800 text-xs font-semibold transition-colors text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("tech@smartfonedoctor.com", "tech123456")}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-purple-50 hover:bg-purple-100/70 border border-purple-200/60 text-purple-800 text-xs font-semibold transition-colors text-left"
              >
                <Wrench className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">Technician</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER NOTICE */}
        <p className="text-center text-xs text-gray-400">
          Authorized personnel only. All access attempts are cryptographically audited.
        </p>
      </div>
    </div>
  );
}
