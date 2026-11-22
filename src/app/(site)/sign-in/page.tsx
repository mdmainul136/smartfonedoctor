"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { loginAdminAction } from "@/actions/auth";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
        setError(res.error || "Invalid credentials. Please verify and try again.");
        return;
      }

      const target = from.startsWith("/") ? from : "/admin";
      router.push(target);
      router.refresh();
    });
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] px-4 py-12 antialiased">
      {/* Background Subtle Grid / Clean Texture */}
      <div className="w-full max-w-[420px] flex flex-col gap-6">
        {/* Brand & Workspace Scope */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-2 py-1 rounded-md hover:opacity-80 transition-opacity"
          >
            <span
              aria-hidden="true"
              className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center text-sm font-semibold tracking-tight shadow-xs"
            >
              SF
            </span>
            <div className="flex flex-col text-left">
              <span className="text-base font-semibold text-zinc-900 leading-tight tracking-tight">
                SmartFoneDoctor
              </span>
              <span className="text-xs text-zinc-500 leading-tight">
                Philadelphia · Flagship Admin
              </span>
            </div>
          </Link>

          <div className="mt-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              Sign in to your account
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Enter your administrator credentials to access the command center
            </p>
          </div>
        </div>

        {/* Shadcn Card Container */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs">
          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50/60 p-3 text-xs text-red-900 flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admin-email"
                className="text-xs font-medium text-zinc-900 leading-none"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartfonedoctor.com"
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="text-xs font-medium text-zinc-900 leading-none"
                >
                  Password
                </label>
                <Link
                  href="/contact"
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 pr-9 py-1 text-sm shadow-xs transition-colors placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors focus-visible:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950"
                />
                <span className="text-xs text-zinc-600">Remember for 30 days</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="h-9 w-full rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
