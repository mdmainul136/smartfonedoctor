"use client";

import { FieldLabel, type CustomField } from "@puckeditor/core";
import { ICON_OPTIONS, RenderItemIcon } from "@/puck/components/shared";
import type { PuckIconName } from "@/puck/types";

export function createIconPickerField(label = "Icon"): CustomField<PuckIconName> {
  return {
    type: "custom",
    label,
    render: ({ field, value, onChange, readOnly }) => {
      const current = value || "None";
      return (
        <FieldLabel label={field.label || label} readOnly={readOnly}>
          <div className="grid grid-cols-5 gap-1.5">
            {ICON_OPTIONS.map((opt) => {
              const active = current === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChange(opt.value)}
                  title={opt.label}
                  className={`flex h-9 flex-col items-center justify-center rounded border text-[10px] font-medium transition cursor-pointer ${
                    active
                      ? "border-[#009691] bg-[#009691]/10 text-[#007f7b] ring-1 ring-[#009691]"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {opt.value === "None" ? (
                    <span>None</span>
                  ) : (
                    <RenderItemIcon name={opt.value} className="h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>
        </FieldLabel>
      );
    },
  };
}

