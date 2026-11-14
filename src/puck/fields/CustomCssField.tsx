"use client";

import { FieldLabel, type CustomField } from "@puckeditor/core";
import { CSS_SNIPPETS, validateCustomCss } from "@/lib/cmsCustomCss";

export function createCustomCssField(label = "Custom CSS (scoped)"): CustomField<string> {
  return {
    type: "custom",
    label,
    render: ({ field, value, onChange, readOnly }) => {
      const current = value || "";
      const validation = validateCustomCss(current);

      const appendSnippet = (snippet: string) => {
        const next = current.trim() ? `${current.trim()}\n\n${snippet}` : snippet;
        onChange(next);
      };

      return (
        <FieldLabel label={field.label || label} readOnly={readOnly}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1">
              {CSS_SNIPPETS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  disabled={readOnly}
                  onClick={() => appendSnippet(s.snippet)}
                  className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold text-gray-700 hover:border-[#009691] hover:text-[#007f7b] transition cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <textarea
              rows={5}
              value={current}
              disabled={readOnly}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`selector { border-top: 4px solid #009691; }`}
              spellCheck={false}
              className={`w-full rounded border bg-slate-950 p-2.5 font-mono text-[11px] leading-relaxed text-emerald-300 focus:outline-none ${
                validation.isValid
                  ? "border-slate-700 focus:border-[#009691]"
                  : "border-red-500 focus:border-red-500"
              }`}
            />
            {!validation.isValid && validation.message && (
              <p className="rounded bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 border border-red-200">
                {validation.message}
              </p>
            )}
          </div>
        </FieldLabel>
      );
    },
  };
}

