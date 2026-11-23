"use client";

import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import type { RepairDetailTabsData } from "@/lib/repairTabDefaults";
import { areaCls, inputCls } from "./CatalogShell";

type EditorTab = "specs" | "features" | "why" | "faqs";

interface RepairTabsEditorProps {
  value: RepairDetailTabsData;
  onChange: (patch: Partial<RepairDetailTabsData>) => void;
  defaults: Required<RepairDetailTabsData>;
}

/**
 * Reusable 4-tab Admin editor matching storefront PSeoRichSection tabs:
 * Specification Table, Key Features, Why Choose Us, and Hardware FAQs.
 */
export default function RepairTabsEditor({
  value,
  onChange,
  defaults,
}: RepairTabsEditorProps) {
  const [tab, setTab] = useState<EditorTab>("specs");

  const activeSpecs = value.specifications ?? [];
  const activeFeatures = value.keyFeatures ?? [];
  const activeStats = value.whyChooseStats ?? [];
  const activeFaqs = value.faqs ?? [];

  const hasCustomSpecs = activeSpecs.length > 0;
  const hasCustomFeatures = activeFeatures.length > 0;
  const hasCustomWhy = Boolean(
    value.whyChooseHeadline || value.whyChooseText || activeStats.length > 0
  );
  const hasCustomFaqs = activeFaqs.length > 0;

  return (
    <div className="sm:col-span-2 rounded-[8px] border border-[#d1d5db] bg-white overflow-hidden">
      <div className="px-3.5 py-2.5 bg-gray-50 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[12px] font-bold text-gray-800 block">
            Page Tabs Content (Specification Table, Key Features, Why Choose Us, FAQs)
          </span>
          <span className="text-[11px] text-gray-500">
            Leave blank for automatic smart defaults, or click &ldquo;Load defaults&rdquo; to customize per item.
          </span>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="px-3 py-2 border-b border-[#e5e7eb] bg-gray-50/40 flex flex-wrap gap-1.5">
        {[
          { id: "specs" as EditorTab, label: "Specification Table", custom: hasCustomSpecs },
          { id: "features" as EditorTab, label: "Key Features", custom: hasCustomFeatures },
          { id: "why" as EditorTab, label: "Why Choose Us", custom: hasCustomWhy },
          { id: "faqs" as EditorTab, label: "Hardware FAQs", custom: hasCustomFaqs },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-2.5 py-1 rounded-[5px] text-[11.5px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              tab === t.id
                ? "bg-sfd-teal text-white"
                : "bg-white border border-[#e5e7eb] text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] ${
                tab === t.id
                  ? "bg-white/20 text-white"
                  : t.custom
                  ? "bg-teal-50 text-sfd-teal"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {t.custom ? "Custom" : "Auto"}
            </span>
          </button>
        ))}
      </div>

      <div className="p-3.5 space-y-3">
        {/* TAB 1: SPECIFICATION TABLE */}
        {tab === "specs" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] text-gray-500">
                {hasCustomSpecs
                  ? `${activeSpecs.length} custom spec rows stored in DB`
                  : "Using automatic category specification rows"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ specifications: [...defaults.specifications] })}
                  className="text-[11.5px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Load defaults
                </button>
                {hasCustomSpecs && (
                  <button
                    type="button"
                    onClick={() => onChange({ specifications: undefined })}
                    className="text-[11.5px] font-semibold text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>

            {activeSpecs.map((spec, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <input
                  value={spec.label}
                  onChange={(e) =>
                    onChange({
                      specifications: activeSpecs.map((s, j) =>
                        j === idx ? { ...s, label: e.target.value } : s
                      ),
                    })
                  }
                  placeholder="Label (e.g. Warranty)"
                  className={`${inputCls} sm:col-span-4`}
                />
                <input
                  value={spec.value}
                  onChange={(e) =>
                    onChange({
                      specifications: activeSpecs.map((s, j) =>
                        j === idx ? { ...s, value: e.target.value } : s
                      ),
                    })
                  }
                  placeholder="Value (e.g. 90 days on parts and labor)"
                  className={`${inputCls} sm:col-span-7`}
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      specifications: activeSpecs.filter((_, j) => j !== idx),
                    })
                  }
                  className="h-[34px] w-full sm:w-8 rounded-[6px] border border-red-200 text-red-700 inline-flex items-center justify-center hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                onChange({
                  specifications: [...activeSpecs, { label: "", value: "" }],
                })
              }
              className="text-[12px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add specification row
            </button>
          </div>
        )}

        {/* TAB 2: KEY FEATURES */}
        {tab === "features" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] text-gray-500">
                {hasCustomFeatures
                  ? `${activeFeatures.length} custom feature cards stored in DB`
                  : "Using automatic Key Features cards"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ keyFeatures: [...defaults.keyFeatures] })}
                  className="text-[11.5px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Load defaults
                </button>
                {hasCustomFeatures && (
                  <button
                    type="button"
                    onClick={() => onChange({ keyFeatures: undefined })}
                    className="text-[11.5px] font-semibold text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>

            {activeFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[6px] border border-[#e5e7eb] bg-gray-50/50 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={feat.title}
                    onChange={(e) =>
                      onChange({
                        keyFeatures: activeFeatures.map((f, j) =>
                          j === idx ? { ...f, title: e.target.value } : f
                        ),
                      })
                    }
                    placeholder="Feature title"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        keyFeatures: activeFeatures.filter((_, j) => j !== idx),
                      })
                    }
                    className="h-[34px] w-8 shrink-0 rounded-[6px] border border-red-200 text-red-700 inline-flex items-center justify-center hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={feat.desc}
                  onChange={(e) =>
                    onChange({
                      keyFeatures: activeFeatures.map((f, j) =>
                        j === idx ? { ...f, desc: e.target.value } : f
                      ),
                    })
                  }
                  placeholder="Feature description"
                  className={areaCls}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                onChange({
                  keyFeatures: [...activeFeatures, { title: "", desc: "" }],
                })
              }
              className="text-[12px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add feature card
            </button>
          </div>
        )}

        {/* TAB 3: WHY CHOOSE US */}
        {tab === "why" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] text-gray-500">
                {hasCustomWhy ? "Custom Why Choose Us copy saved in DB" : "Using default Philadelphia store pitch"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      whyChooseHeadline: defaults.whyChooseHeadline,
                      whyChooseText: defaults.whyChooseText,
                      whyChooseStats: [...defaults.whyChooseStats],
                    })
                  }
                  className="text-[11.5px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Load defaults
                </button>
                {hasCustomWhy && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        whyChooseHeadline: undefined,
                        whyChooseText: undefined,
                        whyChooseStats: undefined,
                      })
                    }
                    className="text-[11.5px] font-semibold text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>

            <label className="flex flex-col gap-1 text-[11.5px] font-semibold text-gray-600">
              Headline
              <input
                value={value.whyChooseHeadline ?? ""}
                onChange={(e) => onChange({ whyChooseHeadline: e.target.value })}
                placeholder={defaults.whyChooseHeadline}
                className={inputCls}
              />
            </label>

            <label className="flex flex-col gap-1 text-[11.5px] font-semibold text-gray-600">
              Body paragraph
              <textarea
                rows={3}
                value={value.whyChooseText ?? ""}
                onChange={(e) => onChange({ whyChooseText: e.target.value })}
                placeholder={defaults.whyChooseText}
                className={areaCls}
              />
            </label>

            <div className="space-y-2">
              <span className="text-[11.5px] font-semibold text-gray-600 block">
                Highlight Stats (up to 3)
              </span>
              {[0, 1, 2].map((idx) => {
                const st = activeStats[idx] ?? { value: "", label: "" };
                return (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <input
                      value={st.value}
                      onChange={(e) => {
                        const base = [0, 1, 2].map(
                          (k) => activeStats[k] ?? { value: "", label: "" }
                        );
                        base[idx] = { ...base[idx], value: e.target.value };
                        onChange({ whyChooseStats: base });
                      }}
                      placeholder={defaults.whyChooseStats[idx]?.value || "Value"}
                      className={inputCls}
                    />
                    <input
                      value={st.label}
                      onChange={(e) => {
                        const base = [0, 1, 2].map(
                          (k) => activeStats[k] ?? { value: "", label: "" }
                        );
                        base[idx] = { ...base[idx], label: e.target.value };
                        onChange({ whyChooseStats: base });
                      }}
                      placeholder={defaults.whyChooseStats[idx]?.label || "Label"}
                      className={inputCls}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: HARDWARE FAQS */}
        {tab === "faqs" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11.5px] text-gray-500">
                {hasCustomFaqs
                  ? `${activeFaqs.length} custom FAQs stored in DB & schema JSON-LD`
                  : "Using automatic category FAQs"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ faqs: [...defaults.faqs] })}
                  className="text-[11.5px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Load defaults
                </button>
                {hasCustomFaqs && (
                  <button
                    type="button"
                    onClick={() => onChange({ faqs: undefined })}
                    className="text-[11.5px] font-semibold text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>

            {activeFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-[6px] border border-[#e5e7eb] bg-gray-50/50 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={faq.question}
                    onChange={(e) =>
                      onChange({
                        faqs: activeFaqs.map((f, j) =>
                          j === idx ? { ...f, question: e.target.value } : f
                        ),
                      })
                    }
                    placeholder="Question"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        faqs: activeFaqs.filter((_, j) => j !== idx),
                      })
                    }
                    className="h-[34px] w-8 shrink-0 rounded-[6px] border border-red-200 text-red-700 inline-flex items-center justify-center hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) =>
                    onChange({
                      faqs: activeFaqs.map((f, j) =>
                        j === idx ? { ...f, answer: e.target.value } : f
                      ),
                    })
                  }
                  placeholder="Answer"
                  className={areaCls}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                onChange({
                  faqs: [...activeFaqs, { question: "", answer: "" }],
                })
              }
              className="text-[12px] font-semibold text-sfd-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add FAQ item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
