"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCustomLayoutAction,
  getThemeOverviewAction,
  removeCustomLayoutAction,
  type ThemeOverview,
} from "@/actions/theme";
import { createGlobalBlockAction, listGlobalBlocksAction } from "@/actions/globalBlocks";

function StatusPill({ status }: { status: string | null }) {
  const cls =
    status === "Published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-700 border-red-200";
  const text = status === "Published" ? "Live" : status ?? "Missing";
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{text}</span>;
}

/**
 * WordPress-style theme builder: each page type has one template (its layout for
 * every page of that type); any single page can get its own layout.
 */
export default function ThemeBuilderPage() {
  const [overview, setOverview] = useState<ThemeOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [globals, setGlobals] = useState<Awaited<ReturnType<typeof listGlobalBlocksAction>>>([]);
  const [newGlobal, setNewGlobal] = useState("");

  const load = () =>
    Promise.all([
      getThemeOverviewAction().then((res) => {
        if (res.success && res.overview) setOverview(res.overview);
        else setError(res.error ?? "Could not load page types.");
      }),
      listGlobalBlocksAction().then(setGlobals).catch(() => undefined),
    ]);

  const createGlobal = async () => {
    setBusy("new-global");
    const res = await createGlobalBlockAction(newGlobal);
    setBusy(null);
    if (!res.success || !res.slug) return setError(res.error ?? "Could not create the global block.");
    window.location.assign(`/admin/pages/${res.slug}`);
  };
  useEffect(() => {
    void load();
  }, []);

  const createCustom = async (type: string) => {
    const path = picked[type]?.trim();
    if (!path) return;
    setBusy(type);
    setError(null);
    const res = await createCustomLayoutAction(path);
    setBusy(null);
    if (!res.success || !res.slug) return setError(res.error ?? "Could not create the custom layout.");
    // Full navigation: a client-side push right after the action's revalidation can be dropped.
    window.location.assign(`/admin/pages/${res.slug}`);
  };

  const removeCustom = async (slug: string, path: string) => {
    if (!window.confirm(`Remove the custom layout of ${path}? The page goes back to its template. Its custom layout and history are deleted.`)) return;
    setBusy(slug);
    const res = await removeCustomLayoutAction(slug);
    setBusy(null);
    if (!res.success) return setError(res.error ?? "Could not remove it.");
    void load();
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5">
      <div className="pb-3 border-b border-[#e8e8e8]">
        <h1 className="text-[22px] font-bold text-[#111111] tracking-[-0.02em] inline-flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-sfd-teal" /> Theme Builder
        </h1>
        <p className="text-[12.5px] text-gray-500 mt-0.5 max-w-3xl">
          Each page type has one template: edit it once and every page of that type changes. Any single page can also get
          its own layout. Titles, descriptions and content stay per page (Blog, Device Models, Repair Types, Common Issues).
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-800">
          {error}
        </div>
      )}
      {!overview && !error && <p className="text-[13px] text-gray-500">Loading page types…</p>}

      {overview && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {overview.types.map((t) => (
            <section key={t.type} className="bg-white border border-[#e8e8e8] rounded-[8px] p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-gray-900">{t.label}</h2>
                    <StatusPill status={t.template.status} />
                  </div>
                  <p className="text-[12px] text-gray-500 mt-0.5">{t.description}</p>
                  <code className="text-[11.5px] text-gray-500">{t.pattern}</code>
                </div>
                {t.template.exists && (
                  <div className="flex shrink-0 gap-1.5">
                    <Link
                      href={`/preview/${t.template.slug}`}
                      target="_blank"
                      className="h-8 px-2.5 rounded-[6px] border border-[#d1d5db] text-[12px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </Link>
                    <Link
                      href={`/admin/pages/${t.template.slug}`}
                      className="h-8 px-3 rounded-[6px] bg-sfd-teal hover:bg-sfd-tealDark text-white text-[12px] font-semibold inline-flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit template
                    </Link>
                  </div>
                )}
              </div>

              {!t.template.exists && (
                <p className="text-[12px] text-red-700">
                  No template yet: pages use their built-in design. Run <code>node scripts/cms-ensure-templates.mjs</code> to create it.
                </p>
              )}

              <div className="text-[12.5px] text-gray-700">
                <span className="font-semibold">{t.urlCount}</span> page{t.urlCount === 1 ? "" : "s"} use this template
                {t.custom.length > 0 && <> ({t.custom.length} with their own layout)</>}
                <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  {t.sampleUrls.map((u) => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer" className="text-[12px] text-sfd-teal hover:underline inline-flex items-center gap-0.5">
                        {u} <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                  {t.urlCount > t.sampleUrls.length && <li className="text-[12px] text-gray-400">+{t.urlCount - t.sampleUrls.length} more</li>}
                </ul>
              </div>

              {t.custom.length > 0 && (
                <div className="rounded-[6px] border border-[#eee] divide-y divide-[#f1f1f1]">
                  {t.custom.map((c) => (
                    <div key={c.slug} className="flex items-center justify-between gap-2 px-3 py-2 text-[12.5px]">
                      <div className="min-w-0">
                        <code className="text-gray-800">{c.path}</code>{" "}
                        <StatusPill status={c.status} />
                        {c.status !== "Published" && <span className="ml-1 text-[11px] text-gray-500">not live until published</span>}
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <Link
                          href={`/admin/pages/${c.slug}`}
                          className="h-7 px-2 rounded-[6px] border border-[#d1d5db] text-[11.5px] font-semibold text-gray-700 inline-flex items-center gap-1 hover:bg-gray-50"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </Link>
                        <button
                          type="button"
                          disabled={busy === c.slug}
                          onClick={() => removeCustom(c.slug, c.path)}
                          className="h-7 px-2 rounded-[6px] border border-red-200 text-[11.5px] font-semibold text-red-700 inline-flex items-center gap-1 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  list={`urls-${t.type}`}
                  value={picked[t.type] ?? ""}
                  onChange={(e) => setPicked((p) => ({ ...p, [t.type]: e.target.value }))}
                  placeholder={`Give one page its own layout: ${t.pattern}`}
                  className="h-[34px] flex-1 min-w-0 rounded-[6px] border border-[#d1d5db] bg-white px-2.5 text-[12.5px] focus:outline-none focus:border-sfd-teal"
                />
                <datalist id={`urls-${t.type}`}>
                  {t.allUrls.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
                <button
                  type="button"
                  disabled={!picked[t.type] || busy === t.type}
                  onClick={() => createCustom(t.type)}
                  className="h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] font-semibold text-gray-800 inline-flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Customize
                </button>
              </div>
            </section>
          ))}

          <section className="bg-white border border-[#e8e8e8] rounded-[8px] p-4 flex flex-col gap-3 xl:col-span-2">
            <div>
              <h2 className="text-[16px] font-bold text-gray-900">Global blocks</h2>
              <p className="text-[12px] text-gray-500">
                Edit once, change everywhere: insert the &quot;Global block&quot; widget on any page or template and pick one of these.
              </p>
            </div>
            {globals.length === 0 && <p className="text-[12.5px] text-gray-500">No global blocks yet.</p>}
            {globals.length > 0 && (
              <div className="rounded-[6px] border border-[#eee] divide-y divide-[#f1f1f1]">
                {globals.map((g) => (
                  <div key={g.slug} className="flex items-center justify-between gap-3 px-3 py-2 text-[12.5px]">
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-800">{g.name}</span> <StatusPill status={g.status} />
                      <div className="text-[11.5px] text-gray-500 truncate">
                        {g.blocks} block{g.blocks === 1 ? "" : "s"} ·{" "}
                        {g.usedOn.length ? `used on ${g.usedOn.join(", ")}` : "not used on any page yet"}
                      </div>
                    </div>
                    <Link
                      href={`/admin/pages/${g.slug}`}
                      className="h-7 px-2 rounded-[6px] border border-[#d1d5db] text-[11.5px] font-semibold text-gray-700 inline-flex items-center gap-1 hover:bg-gray-50 shrink-0"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                value={newGlobal}
                onChange={(e) => setNewGlobal(e.target.value)}
                placeholder="New global block name, e.g. Holiday hours banner"
                className="h-[34px] flex-1 min-w-0 rounded-[6px] border border-[#d1d5db] bg-white px-2.5 text-[12.5px] focus:outline-none focus:border-sfd-teal"
              />
              <button
                type="button"
                disabled={!newGlobal.trim() || busy === "new-global"}
                onClick={createGlobal}
                className="h-[34px] px-3 rounded-[6px] bg-sfd-teal hover:bg-sfd-tealDark text-white text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> Create
              </button>
            </div>
          </section>

          <section className="bg-white border border-[#e8e8e8] rounded-[8px] p-4 flex flex-col gap-2 xl:col-span-2">
            <h2 className="text-[16px] font-bold text-gray-900">Category hubs</h2>
            <p className="text-[12px] text-gray-500">
              One page per repair category. Their device, brand and repair lists come from Device Models and Repair Types.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {overview.hubs.map((h) => (
                <div key={h.slug} className="rounded-[6px] border border-[#eee] px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-gray-800 truncate">{h.name}</div>
                    <code className="text-[11px] text-gray-500">{h.path}</code>
                  </div>
                  <Link
                    href={`/admin/pages/${h.slug}`}
                    className="h-7 px-2 rounded-[6px] border border-[#d1d5db] text-[11.5px] font-semibold text-gray-700 inline-flex items-center gap-1 hover:bg-gray-50 shrink-0"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
