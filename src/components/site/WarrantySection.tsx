import Link from "next/link";
import { ShieldCheck, CheckCircle2, XCircle, ChevronRight, Receipt, Store, Wrench } from "lucide-react";
import { STORES } from "@/lib/stores";
import { WARRANTY_DEFAULTS, type WarrantyContent } from "./warrantyContent";

const STEP_ICONS = [Receipt, Store, Wrench];

/** Empty fields and empty lists fall back to the built-in text. */
function pick<T>(value: T | undefined, fallback: T): T {
  if (Array.isArray(value)) return (value.length ? value : fallback) as T;
  return typeof value === "string" && value.trim() === "" ? fallback : (value ?? fallback);
}

export function WarrantySection(props: Partial<WarrantyContent>) {
  const c = Object.fromEntries(
    Object.entries(WARRANTY_DEFAULTS).map(([k, v]) => [k, pick((props as Record<string, unknown>)[k] as typeof v, v)])
  ) as WarrantyContent;
  const phone = STORES[0]?.phone ?? "";
  const helpText = phone ? c.helpText.replace("{phone}", phone) : c.helpText.replace(" at {phone}", "").replace("{phone}", "");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-neutral-600">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="underline underline-offset-2 hover:text-[#111827]">Home</Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
          <li aria-current="page" className="text-[#111827]">Warranty</li>
        </ol>
      </nav>

      <header className="rounded-2xl bg-[#111827] text-white p-6 sm:p-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1 text-[13px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          {c.badge}
        </span>
        <h1 className="mt-5 text-3xl sm:text-5xl font-semibold leading-tight">{c.title}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-300">{c.intro}</p>
      </header>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Warranty coverage">
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{c.coveredHeading}</h2>
          <ul className="mt-4 space-y-3">
            {c.covered.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                <CheckCircle2 className="mt-0.5 w-5 h-5 shrink-0 text-sfd-teal" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[#E5DEC9] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{c.notCoveredHeading}</h2>
          <ul className="mt-4 space-y-3">
            {c.notCovered.map((item, i) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-neutral-700">
                <XCircle className="mt-0.5 w-5 h-5 shrink-0 text-neutral-400" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="claim-heading">
        <h2 id="claim-heading" className="text-2xl sm:text-3xl font-semibold">{c.claimHeading}</h2>
        <ol className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {c.steps.map(({ title, body }, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <li key={i} className="rounded-xl bg-[#F3EDE4] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sfd-teal text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <Icon className="w-5 h-5 text-neutral-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-neutral-700">{body}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#E5DEC9] bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold">{c.helpHeading}</h2>
          <p className="mt-1 text-[15px] text-neutral-700">{helpText}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={c.primaryHref}
            className="inline-flex items-center rounded-md bg-sfd-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-sfd-tealDark transition-colors"
          >
            {c.primaryLabel}
          </Link>
          <Link
            href={c.secondaryHref}
            className="inline-flex items-center rounded-md border border-[#111827] px-5 py-2.5 text-sm font-semibold hover:bg-[#111827] hover:text-white transition-colors"
          >
            {c.secondaryLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
