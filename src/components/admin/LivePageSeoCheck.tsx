"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";

type Check = { label: string; status: "pass" | "warn" | "fail"; detail: string };

const SITE = "https://smartfonedoctor.com";

/** Runs SEO checks on HTML the way search engines receive it. */
function analyze(html: string, path: string, keyword: string, contentOnly: boolean): Check[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const checks: Check[] = [];
  const kw = keyword.trim().toLowerCase();
  const has = (text: string | null | undefined) => Boolean(kw && text && text.toLowerCase().includes(kw));

  const title = doc.querySelector("title")?.textContent?.trim() ?? "";
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "";
  if (!contentOnly) {
    checks.push({
      label: "Title length",
      status: title.length >= 30 && title.length <= 60 ? "pass" : title.length ? "warn" : "fail",
      detail: title ? `${title.length} characters: "${title}"` : "No <title>",
    });
    checks.push({
      label: "Meta description",
      status: desc.length >= 120 && desc.length <= 160 ? "pass" : desc.length ? "warn" : "fail",
      detail: desc ? `${desc.length} characters (aim for 120–160)` : "Missing",
    });
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
    const own = `${SITE}${path === "/" ? "" : path}`;
    checks.push({
      label: "Canonical URL",
      status: !canonical ? "warn" : canonical.replace(/\/$/, "") === own.replace(/\/$/, "") || canonical === path ? "pass" : "warn",
      detail: canonical || "Not set",
    });
    const robots = doc.querySelector('meta[name="robots"]')?.getAttribute("content") ?? "";
    checks.push({
      label: "Indexable",
      status: /noindex/i.test(robots) ? "fail" : "pass",
      detail: /noindex/i.test(robots) ? `robots: ${robots}` : "Search engines may index this page",
    });
  }

  const h1s = [...doc.querySelectorAll("h1")].map((h) => h.textContent?.trim() ?? "");
  checks.push({
    label: "One H1 heading",
    status: h1s.length === 1 ? "pass" : h1s.length === 0 ? "fail" : "warn",
    detail: h1s.length ? `${h1s.length}: ${h1s.map((h) => `"${h.slice(0, 60)}"`).join(", ")}` : "No H1 on the page",
  });

  const main = doc.querySelector("main") ?? doc.body;
  main.querySelectorAll("script, style, noscript").forEach((n) => n.remove());
  const words = (main.textContent ?? "").split(/\s+/).filter(Boolean).length;
  checks.push({
    label: "Content length",
    status: words >= 600 ? "pass" : words >= 300 ? "warn" : "fail",
    detail: `${words} words in the page body`,
  });

  const imgs = [...main.querySelectorAll("img")];
  const noAlt = imgs.filter((i) => !(i.getAttribute("alt") ?? "").trim() && i.getAttribute("aria-hidden") !== "true");
  checks.push({
    label: "Image alt text",
    status: noAlt.length === 0 ? "pass" : "warn",
    detail: `${imgs.length} images, ${noAlt.length} without alt text`,
  });

  const internal = [...main.querySelectorAll("a[href]")].filter((a) => (a.getAttribute("href") ?? "").startsWith("/")).length;
  checks.push({ label: "Internal links", status: internal >= 3 ? "pass" : "warn", detail: `${internal} links to other pages` });

  const schemaTypes = new Set<string>();
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    for (const m of (s.textContent ?? "").matchAll(/"@type"\s*:\s*"([A-Za-z]+)"/g)) schemaTypes.add(m[1]);
  });
  if (!contentOnly) {
    checks.push({
      label: "Structured data",
      status: schemaTypes.size ? "pass" : "warn",
      detail: schemaTypes.size ? [...schemaTypes].slice(0, 8).join(", ") : "No JSON-LD schema",
    });
  }

  if (kw) {
    const firstPara = main.querySelector("p")?.textContent ?? "";
    const spots = [
      ["title", has(title)],
      ["H1", h1s.some((h) => has(h))],
      ["meta description", has(desc)],
      ["URL", path.toLowerCase().includes(kw.replace(/\s+/g, "-"))],
      ["first paragraph", has(firstPara)],
    ] as [string, boolean][];
    const relevant = contentOnly ? spots.filter(([k]) => k === "H1" || k === "first paragraph") : spots;
    const found = relevant.filter(([, ok]) => ok).map(([k]) => k);
    checks.push({
      label: `Focus keyword "${keyword.trim()}"`,
      status: found.length === relevant.length ? "pass" : found.length ? "warn" : "fail",
      detail: found.length ? `Found in: ${found.join(", ")}` : "Not found in the title, H1, description or URL",
    });
  }
  return checks;
}

const ICON = {
  pass: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  warn: <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
  fail: <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />,
};

/**
 * SEO check of the real page HTML (what Google receives), so pages built from
 * coded sections and data blocks are judged on their actual content.
 */
export default function LivePageSeoCheck({
  path,
  slug,
  isPublished,
  isTemplate,
  focusKeyword,
}: {
  path: string;
  slug: string;
  isPublished: boolean;
  isTemplate: boolean;
  focusKeyword?: string;
}) {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isTemplate) {
    return (
      <p className="text-[11.5px] text-gray-500">
        Templates are checked per page: open a page that uses this template (Theme Builder) and check it there.
      </p>
    );
  }

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = isPublished ? path : `/preview/${slug}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`The page answered ${res.status}`);
      setChecks(analyze(await res.text(), path, focusKeyword ?? "", !isPublished));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the page");
    } finally {
      setLoading(false);
    }
  };

  const score = checks
    ? Math.round((checks.reduce((n, c) => n + (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0), 0) / checks.length) * 100)
    : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11.5px] text-gray-500">
          {isPublished
            ? "Checks the live page exactly as Google receives it (save first to include your changes)."
            : "Not published yet: checks the content of the preview (title, description and schema are checked once published)."}
        </p>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="h-7 shrink-0 px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[11.5px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> {checks ? "Check again" : "Check live page"}
        </button>
      </div>
      {error && <p className="text-[11.5px] text-red-700">{error}</p>}
      {checks && (
        <>
          <div className="flex items-center gap-2">
            <span
              className={`text-[13px] font-black px-2 py-0.5 rounded-full ${
                (score ?? 0) >= 80 ? "bg-emerald-50 text-emerald-700" : (score ?? 0) >= 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
              }`}
            >
              {score}/100
            </span>
            <span className="text-[11.5px] text-gray-500">{checks.filter((c) => c.status === "pass").length} of {checks.length} checks passed</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2 text-[12px]">
                {ICON[c.status]}
                <span>
                  <span className="font-semibold text-gray-800">{c.label}</span>
                  <span className="text-gray-500"> · {c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
