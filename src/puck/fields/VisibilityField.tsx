"use client";

import { FieldLabel, type CustomField } from "@puckeditor/core";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import type { BlockVisibility } from "@/puck/types";

interface VisibilityFieldControlProps {
  label: string;
  value: BlockVisibility | undefined;
  onChange: (value: BlockVisibility | undefined) => void;
  readOnly?: boolean;
}

function VisibilityFieldControl({
  label,
  value,
  onChange,
  readOnly,
}: VisibilityFieldControlProps) {
  const current: BlockVisibility = value || {};

  const toggle = (key: keyof BlockVisibility) => {
    const next = { ...current, [key]: !current[key] };
    if (!next.hideOnMobile && !next.hideOnTablet && !next.hideOnDesktop) {
      onChange(undefined);
    } else {
      onChange(next);
    }
  };

  return (
    <FieldLabel label={label} readOnly={readOnly}>
      <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-2.5 flex flex-col gap-2">
        <span className="text-[10px] text-gray-500 font-medium">
          Toggle to hide this block on specific devices:
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggle("hideOnDesktop")}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              current.hideOnDesktop
                ? "border-red-400 bg-red-50 text-red-700 font-semibold"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
            <span className="text-[9px] opacity-75">
              {current.hideOnDesktop ? "Hidden" : "Visible"}
            </span>
          </button>

          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggle("hideOnTablet")}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              current.hideOnTablet
                ? "border-red-400 bg-red-50 text-red-700 font-semibold"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
            <span className="text-[9px] opacity-75">
              {current.hideOnTablet ? "Hidden" : "Visible"}
            </span>
          </button>

          <button
            type="button"
            disabled={readOnly}
            onClick={() => toggle("hideOnMobile")}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-md border text-[11px] font-medium transition cursor-pointer ${
              current.hideOnMobile
                ? "border-red-400 bg-red-50 text-red-700 font-semibold"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
            <span className="text-[9px] opacity-75">
              {current.hideOnMobile ? "Hidden" : "Visible"}
            </span>
          </button>
        </div>
      </div>
    </FieldLabel>
  );
}

export function createVisibilityField(
  label = "Device Visibility"
): CustomField<BlockVisibility | undefined> {
  return {
    type: "custom",
    label,
    render: ({ value, onChange, readOnly }) => (
      <VisibilityFieldControl
        label={label}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    ),
  };
}
