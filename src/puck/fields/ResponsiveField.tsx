"use client";

import { useState } from "react";
import { FieldLabel, type CustomField } from "@puckeditor/core";
import { Tablet, Smartphone, RotateCcw } from "lucide-react";
import type { ResponsiveDeviceOverride, ResponsiveOverrides } from "@/puck/types";

interface ResponsiveFieldControlProps {
  label: string;
  includeLayout: boolean;
  value: ResponsiveOverrides | undefined;
  onChange: (value: ResponsiveOverrides | undefined) => void;
  readOnly?: boolean;
}

function ResponsiveFieldControl({
  label,
  includeLayout,
  value,
  onChange,
  readOnly,
}: ResponsiveFieldControlProps) {
  const [device, setDevice] = useState<"tablet" | "mobile">("tablet");
  const current: ResponsiveOverrides = value || {};
  const activeOverride: ResponsiveDeviceOverride = current[device] || {};

  const updateField = <K extends keyof ResponsiveDeviceOverride>(
    key: K,
    nextVal: ResponsiveDeviceOverride[K] | ""
  ) => {
    const nextDevice: ResponsiveDeviceOverride = { ...activeOverride };
    if (nextVal === "" || nextVal === undefined) {
      delete nextDevice[key];
    } else {
      nextDevice[key] = nextVal;
    }
    onChange({
      ...current,
      [device]: nextDevice,
    });
  };

  const resetDevice = () => {
    const next = { ...current };
    delete next[device];
    onChange(next);
  };

  const hasTablet = Boolean(
    current.tablet && Object.keys(current.tablet).length > 0
  );
  const hasMobile = Boolean(
    current.mobile && Object.keys(current.mobile).length > 0
  );

  return (
    <FieldLabel label={label} readOnly={readOnly}>
          <div className="rounded-lg border border-gray-200 bg-gray-50/70 p-2.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 rounded-md bg-gray-200/70 p-0.5">
                <button
                  type="button"
                  onClick={() => setDevice("tablet")}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    device === "tablet"
                      ? "bg-white text-[#009691] shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Tablet className="w-3 h-3" />
                  <span>Tablet</span>
                  {hasTablet && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#009691]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setDevice("mobile")}
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                    device === "mobile"
                      ? "bg-white text-[#009691] shadow-2xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                  {hasMobile && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#009691]" />
                  )}
                </button>
              </div>
              <button
                type="button"
                disabled={readOnly}
                onClick={resetDevice}
                title={`Reset ${device} overrides`}
                className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-200/60 hover:text-gray-800 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="text-[10px] text-gray-500">
              {device === "tablet"
                ? "Applies at <= 1024px (overrides desktop)"
                : "Applies at <= 640px (overrides tablet & desktop)"}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
                <span>Padding</span>
                <input
                  type="text"
                  value={activeOverride.padding || ""}
                  disabled={readOnly}
                  placeholder="Inherit"
                  onChange={(e) => updateField("padding", e.target.value)}
                  className="h-7 rounded border border-gray-300 bg-white px-2 text-[11px] text-gray-800 focus:border-[#009691] focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
                <span>Align</span>
                <select
                  value={activeOverride.align || ""}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateField(
                      "align",
                      (e.target.value as "left" | "center" | "") || ""
                    )
                  }
                  className="h-7 rounded border border-gray-300 bg-white px-1.5 text-[11px] text-gray-800 focus:border-[#009691] focus:outline-none"
                >
                  <option value="">Inherit</option>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
                <span>Background</span>
                <input
                  type="text"
                  value={activeOverride.bgColor || ""}
                  disabled={readOnly}
                  placeholder="Inherit"
                  onChange={(e) => updateField("bgColor", e.target.value)}
                  className="h-7 rounded border border-gray-300 bg-white px-2 text-[11px] font-mono text-gray-800 focus:border-[#009691] focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
                <span>Text Color</span>
                <input
                  type="text"
                  value={activeOverride.textColor || ""}
                  disabled={readOnly}
                  placeholder="Inherit"
                  onChange={(e) => updateField("textColor", e.target.value)}
                  className="h-7 rounded border border-gray-300 bg-white px-2 text-[11px] font-mono text-gray-800 focus:border-[#009691] focus:outline-none"
                />
              </label>

              {includeLayout && (
                <>
                  <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
                    <span>Grid Cols (1-6)</span>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={activeOverride.gridColumns ?? ""}
                      disabled={readOnly}
                      placeholder="Auto"
                      onChange={(e) =>
                        updateField(
                          "gridColumns",
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="h-7 rounded border border-gray-300 bg-white px-2 text-[11px] text-gray-800 focus:border-[#009691] focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-[11px] font-medium text-gray-600">
                    <span>Gap</span>
                    <input
                      type="text"
                      value={activeOverride.gap || ""}
                      disabled={readOnly}
                      placeholder="Inherit"
                      onChange={(e) => updateField("gap", e.target.value)}
                      className="h-7 rounded border border-gray-300 bg-white px-2 text-[11px] text-gray-800 focus:border-[#009691] focus:outline-none"
                    />
                  </label>

                  <label className="col-span-2 flex flex-col gap-1 text-[11px] font-medium text-gray-600">
                    <span>Flex Direction</span>
                    <select
                      value={activeOverride.flexDirection || ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        updateField(
                          "flexDirection",
                          (e.target.value as "row" | "column" | "") || ""
                        )
                      }
                      className="h-7 rounded border border-gray-300 bg-white px-1.5 text-[11px] text-gray-800 focus:border-[#009691] focus:outline-none"
                    >
                      <option value="">Inherit</option>
                      <option value="row">Row</option>
                      <option value="column">Column</option>
                    </select>
                  </label>
                </>
              )}
            </div>
          </div>
        </FieldLabel>
  );
}

export function createResponsiveField(options?: {
  label?: string;
  includeLayout?: boolean;
}): CustomField<ResponsiveOverrides | undefined> {
  const label = options?.label || "Responsive Overrides";
  const includeLayout = options?.includeLayout ?? false;

  return {
    type: "custom",
    label,
    render: ({ field, value, onChange, readOnly }) => (
      <ResponsiveFieldControl
        label={field.label || label}
        includeLayout={includeLayout}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    ),
  };
}

