"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FolderOpen, Lock } from "lucide-react";
import MediaModal from "@/components/admin/MediaModal";
import { getRepairCatalogAction, saveCatalogDevicesAction } from "@/actions/repairCatalog";
import type { PSeoDevice } from "@/lib/pSeoEngine";
import { CATEGORY_OPTIONS, CatalogShell, inputCls, labelCls, toSlug } from "./CatalogShell";

const CATEGORY_NAME: Record<string, string> = {
  smartphone: "Smartphone Repair",
  tablet: "Tablet Repair",
  computer: "Computer Repair",
  console: "Console Repair",
};

/** Devices of the repair catalog: each one has a page /repairs/<category>/<slug> plus one page per repair type. */
export default function DevicesEditor() {
  const [devices, setDevices] = useState<PSeoDevice[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [mediaFor, setMediaFor] = useState<number | null>(null);
  const [repairCounts, setRepairCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getRepairCatalogAction().then((res) => {
      if (!res.success || !res.catalog) {
        setMessage({ kind: "error", text: res.error ?? "Could not load the catalog." });
        return;
      }
      setDevices(res.catalog.devices);
      setSavedSlugs(new Set(res.catalog.devices.map((d) => d.slug)));
      const counts: Record<string, number> = {};
      for (const i of res.catalog.issues) counts[i.category] = (counts[i.category] || 0) + 1;
      setRepairCounts(counts);
      setLoaded(true);
    });
  }, []);

  const update = (index: number, patch: Partial<PSeoDevice>) => {
    setDevices((list) => list.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    setDirty(true);
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    const res = await saveCatalogDevicesAction(devices);
    setSaving(false);
    if (res.success) {
      setDirty(false);
      setSavedSlugs(new Set(devices.map((d) => d.slug)));
      setMessage({ kind: "ok", text: "Saved. The repair pages show the changes now." });
    } else {
      setMessage({ kind: "error", text: `Not saved: ${res.error}` });
    }
  };

  if (!loaded) {
    return <div className="px-6 py-10 text-[13px] text-gray-500">{message?.text ?? "Loading devices from the database…"}</div>;
  }

  return (
    <>
      <CatalogShell<PSeoDevice>
        title="Devices"
        description="Each device has a repair page (/repairs/<category>/<device>) and one page per repair type in its category. Prices come from Repair types."
        items={devices}
        savedSlugs={savedSlugs}
        dirty={dirty}
        saving={saving}
        message={message}
        addLabel="Add device"
        onAdd={() => {
          const d: PSeoDevice = {
            slug: "",
            name: "",
            category: "smartphone",
            categoryName: CATEGORY_NAME.smartphone,
            brand: "Apple",
            brandSlug: "apple",
            image: "",
            specs: "",
            releaseYear: new Date().getFullYear(),
          };
          setDevices((list) => [...list, d]);
          setDirty(true);
          return d;
        }}
        onDelete={(index) => {
          setDevices((list) => list.filter((_, i) => i !== index));
          setDirty(true);
        }}
        onSave={save}
        viewHref={(d) => `/repairs/${d.category}/${d.slug}`}
        renderRow={(d) => (
          <>
            <span className="font-semibold text-gray-900">{d.name || "Untitled"}</span>
            <span className="text-[11px] text-gray-500 block">
              {d.brand} · {d.category}
            </span>
          </>
        )}
        renderForm={(d, index, isNew) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={labelCls}>
              Name
              <input
                value={d.name}
                onChange={(e) =>
                  update(index, isNew ? { name: e.target.value, slug: toSlug(e.target.value) } : { name: e.target.value })
                }
                className={inputCls}
                placeholder="iPhone 17 Pro"
              />
            </label>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1">
                URL slug {!isNew && <Lock className="w-3 h-3 text-gray-400" />}
              </span>
              <input
                value={d.slug}
                readOnly={!isNew}
                onChange={(e) => update(index, { slug: toSlug(e.target.value) })}
                className={`${inputCls} ${isNew ? "" : "bg-gray-50 text-gray-500"}`}
              />
              <span className="font-normal text-[11px] text-gray-400">
                {isNew ? "Part of the page address. Fixed once saved." : "Fixed: changing it would break this device's live URLs."}
              </span>
            </label>
            <label className={labelCls}>
              Category
              <select
                value={d.category}
                disabled={!isNew}
                onChange={(e) =>
                  update(index, {
                    category: e.target.value as PSeoDevice["category"],
                    categoryName: CATEGORY_NAME[e.target.value],
                  })
                }
                className={`${inputCls} ${isNew ? "" : "bg-gray-50 text-gray-500"}`}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              Brand
              <input
                value={d.brand}
                onChange={(e) =>
                  update(index, { brand: e.target.value as PSeoDevice["brand"], brandSlug: toSlug(e.target.value) })
                }
                className={inputCls}
                placeholder="Apple"
              />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Specs line
              <input
                value={d.specs}
                onChange={(e) => update(index, { specs: e.target.value })}
                className={inputCls}
                placeholder="A19 Pro · 6.3-inch OLED · USB-C"
              />
            </label>
            <label className={labelCls}>
              Release year
              <input
                type="number"
                value={d.releaseYear}
                onChange={(e) => update(index, { releaseYear: Number(e.target.value) })}
                className={inputCls}
              />
              <span className="font-normal text-[11px] text-gray-400">2024 or newer adds $20 to repair prices.</span>
            </label>
            <div className={labelCls}>
              Photo
              <div className="flex items-start gap-3">
                <div className="relative w-20 h-20 rounded-[6px] overflow-hidden bg-gray-100 border border-[#e5e7eb] shrink-0">
                  {d.image ? <Image src={d.image} alt={d.name} fill sizes="80px" className="object-cover" unoptimized /> : null}
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <input
                    value={d.image}
                    onChange={(e) => update(index, { image: e.target.value })}
                    className={inputCls}
                    placeholder="https://…"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaFor(index)}
                    className="self-start h-8 px-2.5 rounded-[6px] border border-[#d1d5db] text-[12px] font-semibold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" /> Media library
                  </button>
                </div>
              </div>
            </div>
            <p className="sm:col-span-2 text-[12px] text-gray-500 bg-gray-50 rounded-[6px] px-3 py-2">
              Pages: <code>/repairs/{d.category}/{d.slug || "…"}</code> and {repairCounts[d.category] ?? 0} repair page(s) under it.
            </p>
          </div>
        )}
      />
      <MediaModal
        isOpen={mediaFor !== null}
        onClose={() => setMediaFor(null)}
        initialSelectedUrl={mediaFor !== null ? devices[mediaFor]?.image : undefined}
        onSelect={(payload) => {
          if (mediaFor !== null) update(mediaFor, { image: payload.url });
          setMediaFor(null);
        }}
      />
    </>
  );
}
