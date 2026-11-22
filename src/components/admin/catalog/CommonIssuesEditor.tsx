"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FolderOpen, Lock, Plus, Trash2 } from "lucide-react";
import MediaModal from "@/components/admin/MediaModal";
import { getCommonIssuesAdminAction, saveCommonIssuesAction } from "@/actions/commonIssues";
import type { CommonIssueDetail, IssueSection } from "@/data/commonIssuesData";
import { CATEGORY_OPTIONS, CatalogShell, LinesField, areaCls, inputCls, labelCls, toSlug } from "./CatalogShell";

/** Common-issue articles: /common-issues/<category>/<slug>. */
export default function CommonIssuesEditor() {
  const [issues, setIssues] = useState<CommonIssueDetail[]>([]);
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [mediaFor, setMediaFor] = useState<number | null>(null);

  useEffect(() => {
    getCommonIssuesAdminAction().then((res) => {
      if (!res.success || !res.issues) {
        setMessage({ kind: "error", text: res.error ?? "Could not load common issues." });
        return;
      }
      setIssues(res.issues);
      setSavedSlugs(new Set(res.issues.map((i) => i.slug)));
      setLoaded(true);
    });
  }, []);

  const update = (index: number, patch: Partial<CommonIssueDetail>) => {
    setIssues((list) => list.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    setDirty(true);
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    const res = await saveCommonIssuesAction(issues);
    setSaving(false);
    if (res.success) {
      setDirty(false);
      setSavedSlugs(new Set(issues.map((i) => i.slug)));
      setMessage({ kind: "ok", text: "Saved. The articles on the site are updated." });
    } else {
      setMessage({ kind: "error", text: `Not saved: ${res.error}` });
    }
  };

  if (!loaded) {
    return <div className="px-6 py-10 text-[13px] text-gray-500">{message?.text ?? "Loading articles from the database…"}</div>;
  }

  const setSection = (index: number, si: number, patch: Partial<IssueSection>) =>
    update(index, { sections: issues[index].sections.map((s, j) => (j === si ? { ...s, ...patch } : s)) });

  return (
    <>
      <CatalogShell<CommonIssueDetail>
        title="Common Issues"
        description="Troubleshooting articles at /common-issues/<category>/<article>. Their layout is set by Admin > Pages > Templates > Common issue."
        items={issues}
        savedSlugs={savedSlugs}
        dirty={dirty}
        saving={saving}
        message={message}
        addLabel="Add article"
        getName={(i) => i.title}
        onAdd={() => {
          const i: CommonIssueDetail = {
            slug: "",
            category: "smartphone",
            categoryName: "Smartphone",
            title: "",
            leadText: "",
            image: "",
            sections: [{ heading: "", paragraphs: [""] }],
            relatedSlugs: [],
            seo: { title: "", description: "", keywords: [] },
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
        viewHref={(i) => `/common-issues/${i.category}/${i.slug}`}
        renderRow={(i) => (
          <>
            <span className="font-semibold text-gray-900">{i.title || "Untitled"}</span>
            <span className="text-[11px] text-gray-500 block">{i.category}</span>
          </>
        )}
        renderForm={(i, index, isNew) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`${labelCls} sm:col-span-2`}>
              Title (the page H1)
              <input
                value={i.title}
                onChange={(e) => update(index, isNew ? { title: e.target.value, slug: toSlug(e.target.value) } : { title: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1">URL slug {!isNew && <Lock className="w-3 h-3 text-gray-400" />}</span>
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
                onChange={(e) => update(index, { category: e.target.value as CommonIssueDetail["category"] })}
                className={`${inputCls} ${isNew ? "" : "bg-gray-50 text-gray-500"}`}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Lead text
              <textarea rows={3} value={i.leadText} onChange={(e) => update(index, { leadText: e.target.value })} className={areaCls} />
            </label>
            <div className={`${labelCls} sm:col-span-2`}>
              Photo
              <div className="flex items-start gap-3">
                <div className="relative w-28 h-20 rounded-[6px] overflow-hidden bg-gray-100 border border-[#e5e7eb] shrink-0">
                  {i.image ? <Image src={i.image} alt="" fill sizes="112px" className="object-cover" unoptimized /> : null}
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <input value={i.image} onChange={(e) => update(index, { image: e.target.value })} className={inputCls} placeholder="https://…" />
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

            <div className={`${labelCls} sm:col-span-2`}>
              <span>Sections</span>
              <div className="flex flex-col gap-2.5">
                {i.sections.map((s, si) => (
                  <div key={si} className="rounded-[6px] border border-[#e5e7eb] bg-gray-50/50 p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={s.heading}
                        onChange={(e) => setSection(index, si, { heading: e.target.value })}
                        placeholder="Section heading"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        title="Remove section"
                        onClick={() => update(index, { sections: i.sections.filter((_, j) => j !== si) })}
                        className="h-8 w-8 shrink-0 rounded-[6px] border border-red-200 text-red-700 inline-flex items-center justify-center hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <label className="flex flex-col gap-1 text-[11.5px] font-semibold text-gray-600">
                      Paragraphs (blank line between paragraphs)
                      <textarea
                        rows={Math.max(3, s.paragraphs.join("\n\n").split("\n").length + 1)}
                        value={s.paragraphs.join("\n\n")}
                        onChange={(e) => setSection(index, si, { paragraphs: e.target.value.split(/\n\s*\n/) })}
                        className={areaCls}
                      />
                    </label>
                    <LinesField
                      label="Bullet list (optional)"
                      value={s.listItems ?? []}
                      onChange={(v) => setSection(index, si, { listItems: v })}
                    />
                    <label className="inline-flex items-center gap-2 text-[12px] font-medium text-gray-700">
                      <input type="checkbox" checked={Boolean(s.ordered)} onChange={(e) => setSection(index, si, { ordered: e.target.checked })} />
                      Numbered list
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => update(index, { sections: [...i.sections, { heading: "", paragraphs: [""] }] })}
                  className="self-start text-[12px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add section
                </button>
              </div>
            </div>

            <div className={`${labelCls} sm:col-span-2`}>
              Related articles
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-normal">
                {issues
                  .filter((o) => o.slug && o.slug !== i.slug)
                  .map((o) => (
                    <label key={o.slug} className="inline-flex items-center gap-2 text-[12.5px] text-gray-700">
                      <input
                        type="checkbox"
                        checked={i.relatedSlugs.includes(o.slug)}
                        onChange={(e) =>
                          update(index, {
                            relatedSlugs: e.target.checked ? [...i.relatedSlugs, o.slug] : i.relatedSlugs.filter((r) => r !== o.slug),
                          })
                        }
                      />
                      {o.title}
                    </label>
                  ))}
              </div>
            </div>

            <label className={`${labelCls} sm:col-span-2`}>
              SEO title
              <input value={i.seo.title} onChange={(e) => update(index, { seo: { ...i.seo, title: e.target.value } })} className={inputCls} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              SEO description
              <textarea
                rows={2}
                value={i.seo.description}
                onChange={(e) => update(index, { seo: { ...i.seo, description: e.target.value } })}
                className={areaCls}
              />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Keywords (comma separated)
              <input
                value={i.seo.keywords.join(", ")}
                onChange={(e) => update(index, { seo: { ...i.seo, keywords: e.target.value.split(",") } })}
                className={inputCls}
              />
            </label>
          </div>
        )}
      />
      <MediaModal
        isOpen={mediaFor !== null}
        onClose={() => setMediaFor(null)}
        initialSelectedUrl={mediaFor !== null ? issues[mediaFor]?.image : undefined}
        onSelect={(payload) => {
          if (mediaFor !== null) update(mediaFor, { image: payload.url });
          setMediaFor(null);
        }}
      />
    </>
  );
}
