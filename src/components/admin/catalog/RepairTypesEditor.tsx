"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { getRepairCatalogAction, saveCatalogRepairsAction } from "@/actions/repairCatalog";
import type { PSeoDevice, PSeoIssue } from "@/lib/pSeoEngine";
import { CATEGORY_OPTIONS, CatalogShell, LinesField, PairsField, inputCls, labelCls, toSlug } from "./CatalogShell";

/**
 * Repair types of the repair catalog (screen, battery, charging port…). Each one
 * makes a page for every device in its category: /repairs/<category>/<device>/<repair>.
 */
export default function RepairTypesEditor() {
  const [issues, setIssues] = useState<PSeoIssue[]>([]);
  const [devices, setDevices] = useState<PSeoDevice[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    getRepairCatalogAction().then((res) => {
      if (!res.success || !res.catalog) {
        setMessage({ kind: "error", text: res.error ?? "Could not load the catalog." });
        return;
      }
      setIssues(res.catalog.issues);
      setDevices(res.catalog.devices);
      setSavedSlugs(new Set(res.catalog.issues.map((i) => `${i.category}:${i.slug}`)));
      setLoaded(true);
    });
  }, []);

  const update = (index: number, patch: Partial<PSeoIssue>) => {
    setIssues((list) => list.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    setDirty(true);
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    const res = await saveCatalogRepairsAction(issues);
    setSaving(false);
    if (res.success) {
      setDirty(false);
      setSavedSlugs(new Set(issues.map((i) => `${i.category}:${i.slug}`)));
      setMessage({ kind: "ok", text: "Saved. Prices and text on the repair pages are updated." });
    } else {
      setMessage({ kind: "error", text: `Not saved: ${res.error}` });
    }
  };

  if (!loaded) {
    return <div className="px-6 py-10 text-[13px] text-gray-500">{message?.text ?? "Loading repair types from the database…"}</div>;
  }

  const sampleDevice = (category: string) => devices.find((d) => d.category === category);

  return (
    <CatalogShell<PSeoIssue>
      title="Repair types"
      description="Each repair type creates a page for every device in its category, with its price, turnaround, symptoms, bench steps and FAQs (also sent to Google as FAQ schema)."
      items={issues}
      savedSlugs={savedSlugs}
      getKey={(i) => `${i.category}:${i.slug}`}
      dirty={dirty}
      saving={saving}
      message={message}
      addLabel="Add repair type"
      onAdd={() => {
        const i: PSeoIssue = {
          slug: "",
          name: "",
          shortName: "",
          category: "smartphone",
          iconName: "Wrench",
          turnaroundMinutes: 30,
          turnaroundDisplay: "30 Mins",
          basePrice: 79,
          oemPriceMultiplier: 1.4,
          symptoms: [],
          benchProcedures: [],
          toolsUsed: [],
          faqs: [],
        };
        setIssues((list) => [...list, i]);
        setDirty(true);
        return i;
      }}
      onDelete={(index) => {
        setIssues((list) => list.filter((_, i) => i !== index));
        setDirty(true);
      }}
      onSave={save}
      viewHref={(i) => {
        const d = sampleDevice(i.category);
        return d ? `/repairs/${i.category}/${d.slug}/${i.slug}` : null;
      }}
      renderRow={(i) => (
        <>
          <span className="font-semibold text-gray-900">{i.name || "Untitled"}</span>
          <span className="text-[11px] text-gray-500 block">
            {i.category} · from ${i.basePrice} · {i.turnaroundDisplay}
          </span>
        </>
      )}
      renderForm={(i, index, isNew) => {
        const count = devices.filter((d) => d.category === i.category).length;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={labelCls}>
              Name
              <input
                value={i.name}
                onChange={(e) =>
                  update(index, isNew ? { name: e.target.value, slug: toSlug(e.target.value) } : { name: e.target.value })
                }
                className={inputCls}
                placeholder="Screen Repair"
              />
            </label>
            <label className={labelCls}>
              Short name (used in titles)
              <input value={i.shortName} onChange={(e) => update(index, { shortName: e.target.value })} className={inputCls} />
            </label>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1">
                URL slug {!isNew && <Lock className="w-3 h-3 text-gray-400" />}
              </span>
              <input
                value={i.slug}
                readOnly={!isNew}
                onChange={(e) => update(index, { slug: toSlug(e.target.value) })}
                className={`${inputCls} ${isNew ? "" : "bg-gray-50 text-gray-500"}`}
              />
            </label>
            <label className={labelCls}>
              Category
              <select
                value={i.category}
                disabled={!isNew}
                onChange={(e) => update(index, { category: e.target.value as PSeoIssue["category"] })}
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
              Starting price ($, aftermarket part)
              <input
                type="number"
                min={1}
                value={i.basePrice}
                onChange={(e) => update(index, { basePrice: Number(e.target.value) })}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              OEM part price multiplier
              <input
                type="number"
                step="0.05"
                min={1}
                value={i.oemPriceMultiplier}
                onChange={(e) => update(index, { oemPriceMultiplier: Number(e.target.value) })}
                className={inputCls}
              />
              <span className="font-normal text-[11px] text-gray-400">
                OEM price ≈ ${Math.round(i.basePrice * i.oemPriceMultiplier)} (devices from 2024 on: +$20 before the multiplier).
              </span>
            </label>
            <label className={labelCls}>
              Turnaround (shown)
              <input
                value={i.turnaroundDisplay}
                onChange={(e) => update(index, { turnaroundDisplay: e.target.value })}
                className={inputCls}
                placeholder="30 Mins"
              />
            </label>
            <label className={labelCls}>
              Turnaround (minutes)
              <input
                type="number"
                value={i.turnaroundMinutes}
                onChange={(e) => update(index, { turnaroundMinutes: Number(e.target.value) })}
                className={inputCls}
              />
            </label>
            <div className="sm:col-span-2">
              <LinesField label="Symptoms" value={i.symptoms} onChange={(v) => update(index, { symptoms: v })} />
            </div>
            <div className="sm:col-span-2">
              <PairsField
                label="Bench procedure steps"
                value={i.benchProcedures}
                onChange={(v) => update(index, { benchProcedures: v as PSeoIssue["benchProcedures"] })}
                k1="title"
                k2="desc"
                l1="Step title"
                l2="What the technician does"
              />
            </div>
            <div className="sm:col-span-2">
              <LinesField label="Tools used" value={i.toolsUsed} onChange={(v) => update(index, { toolsUsed: v })} />
            </div>
            <div className="sm:col-span-2">
              <PairsField
                label="FAQs (also FAQ schema on each page)"
                value={i.faqs}
                onChange={(v) => update(index, { faqs: v as PSeoIssue["faqs"] })}
                k1="question"
                k2="answer"
                l1="Question"
                l2="Answer"
              />
            </div>
            <p className="sm:col-span-2 text-[12px] text-gray-500 bg-gray-50 rounded-[6px] px-3 py-2">
              Makes {count} page(s): <code>/repairs/{i.category}/&lt;device&gt;/{i.slug || "…"}</code>
            </p>
          </div>
        );
      }}
    />
  );
}
