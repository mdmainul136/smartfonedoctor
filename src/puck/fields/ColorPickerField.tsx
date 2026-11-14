"use client";

import { FieldLabel, type CustomField } from "@puckeditor/core";

const BRAND_SWATCHES = [
  "#009691",
  "#0f172a",
  "#ffffff",
  "#f8fafc",
  "#f9fafb",
  "#111827",
  "#e5e7eb",
  "transparent",
];

function toPickerHex(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#009691";
}

export function createColorField<T extends string | undefined = string>(
  label: string
): CustomField<T> {
  return {
    type: "custom",
    label,
    render: ({ field, value, onChange, readOnly }) => {
      const current = value || "";
      return (
        <FieldLabel label={field.label || label} readOnly={readOnly}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={toPickerHex(current)}
                disabled={readOnly}
                onChange={(e) => onChange(e.target.value as T)}
                className="h-8 w-9 shrink-0 cursor-pointer rounded border border-gray-300 bg-white p-0.5 disabled:opacity-50"
                title="Pick color"
              />
              <input
                type="text"
                value={current}
                disabled={readOnly}
                onChange={(e) => onChange(e.target.value as T)}
                placeholder="#009691 or rgba(...)"
                className="h-8 w-full rounded border border-gray-300 bg-white px-2.5 text-xs font-mono text-gray-800 focus:border-[#009691] focus:outline-none disabled:bg-gray-50"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {BRAND_SWATCHES.map((swatch) => {
                const isSelected = current.toLowerCase() === swatch.toLowerCase();
                return (
                  <button
                    key={swatch}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onChange(swatch as T)}
                    title={swatch}
                    style={{
                      backgroundColor: swatch === "transparent" ? "#ffffff" : swatch,
                      backgroundImage:
                        swatch === "transparent"
                          ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%)"
                          : undefined,
                      backgroundSize: swatch === "transparent" ? "8px 8px" : undefined,
                      backgroundPosition:
                        swatch === "transparent" ? "0 0, 4px 4px" : undefined,
                    }}
                    className={`h-5 w-5 rounded border transition cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-[#009691] ring-offset-1 border-[#009691]"
                        : "border-gray-300 hover:scale-110"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </FieldLabel>
      );
    },
  };
}

