"use client";

import { useState } from "react";
import { FieldLabel, type CustomField } from "@puckeditor/core";
import { Link2, Unlink2 } from "lucide-react";

const SPACING_PRESETS = [
  { label: "0", value: "0px" },
  { label: "Compact", value: "24px 20px" },
  { label: "Standard", value: "48px 32px" },
  { label: "Spacious", value: "72px 32px" },
];

type Unit = "px" | "rem" | "%";

function parseFourSides(raw: string): {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: Unit;
} {
  const unitMatch = (raw || "").match(/(px|rem|%)/i);
  const unit: Unit =
    unitMatch?.[1]?.toLowerCase() === "rem"
      ? "rem"
      : unitMatch?.[1] === "%"
      ? "%"
      : "px";
  const nums = (raw || "").match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
  if (nums.length === 0) return { top: 48, right: 32, bottom: 48, left: 32, unit };
  if (nums.length === 1) {
    return { top: nums[0], right: nums[0], bottom: nums[0], left: nums[0], unit };
  }
  if (nums.length === 2) {
    return { top: nums[0], right: nums[1], bottom: nums[0], left: nums[1], unit };
  }
  if (nums.length === 3) {
    return { top: nums[0], right: nums[1], bottom: nums[2], left: nums[1], unit };
  }
  return { top: nums[0], right: nums[1], bottom: nums[2], left: nums[3], unit };
}

function SpacingFieldControl({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}) {
  const parsed = parseFourSides(value || "48px 32px");
  const allEqual =
    parsed.top === parsed.right &&
    parsed.right === parsed.bottom &&
    parsed.bottom === parsed.left;
  const [linked, setLinked] = useState(allEqual);

  const emit = (t: number, r: number, b: number, l: number, u: Unit) => {
    const clamp = (n: number) => Math.max(0, Math.min(300, Number.isFinite(n) ? n : 0));
    const ct = clamp(t);
    const cr = clamp(r);
    const cb = clamp(b);
    const cl = clamp(l);
    if (ct === cr && cr === cb && cb === cl) {
      onChange(`${ct}${u}`);
    } else if (ct === cb && cr === cl) {
      onChange(`${ct}${u} ${cr}${u}`);
    } else {
      onChange(`${ct}${u} ${cr}${u} ${cb}${u} ${cl}${u}`);
    }
  };

  const handleSideChange = (side: "top" | "right" | "bottom" | "left", nextVal: number) => {
    if (linked) {
      emit(nextVal, nextVal, nextVal, nextVal, parsed.unit);
      return;
    }
    emit(
      side === "top" ? nextVal : parsed.top,
      side === "right" ? nextVal : parsed.right,
      side === "bottom" ? nextVal : parsed.bottom,
      side === "left" ? nextVal : parsed.left,
      parsed.unit
    );
  };

  return (
    <FieldLabel label={label} readOnly={readOnly}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Box Model
          </span>
          <div className="flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 p-0.5 text-[10px] font-semibold">
            {(["px", "rem", "%"] as const).map((u) => (
              <button
                key={u}
                type="button"
                disabled={readOnly}
                onClick={() => emit(parsed.top, parsed.right, parsed.bottom, parsed.left, u)}
                className={`rounded px-1.5 py-0.5 uppercase cursor-pointer ${
                  parsed.unit === u
                    ? "bg-white text-[#009691] shadow-2xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 items-center">
          {(
            [
              { key: "top", lbl: "TOP", val: parsed.top },
              { key: "right", lbl: "RIGHT", val: parsed.right },
              { key: "bottom", lbl: "BTM", val: parsed.bottom },
              { key: "left", lbl: "LEFT", val: parsed.left },
            ] as const
          ).map((item) => (
            <label key={item.key} className="flex flex-col items-center gap-0.5">
              <input
                type="number"
                min={0}
                max={300}
                value={item.val}
                disabled={readOnly}
                onChange={(e) => handleSideChange(item.key, Number(e.target.value))}
                className="h-7 w-full rounded border border-gray-300 bg-white px-1 text-center text-[11px] font-medium text-gray-800 focus:border-[#009691] focus:outline-none"
              />
              <span className="text-[9px] font-semibold text-gray-400">{item.lbl}</span>
            </label>
          ))}

          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => setLinked((prev) => !prev)}
              title={linked ? "Unlink sides" : "Link all 4 sides"}
              className={`h-7 w-full rounded border flex items-center justify-center transition cursor-pointer ${
                linked
                  ? "border-[#009691] bg-[#009691]/10 text-[#007f7b]"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {linked ? <Link2 className="w-3.5 h-3.5" /> : <Unlink2 className="w-3.5 h-3.5" />}
            </button>
            <span className="text-[9px] font-semibold text-gray-400">LINK</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {SPACING_PRESETS.map((preset) => {
            const active = (value || "").trim() === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                disabled={readOnly}
                onClick={() => onChange(preset.value)}
                className={`rounded border px-2 py-0.5 text-[10px] font-medium transition cursor-pointer ${
                  active
                    ? "border-[#009691] bg-[#009691]/10 text-[#007f7b]"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </FieldLabel>
  );
}

export function createSpacingField<T extends string | undefined = string>(
  label: string
): CustomField<T> {
  return {
    type: "custom",
    label,
    render: ({ field, value, onChange, readOnly }) => (
      <SpacingFieldControl
        label={field.label || label}
        value={value || "48px 32px"}
        onChange={(val) => onChange(val as T)}
        readOnly={readOnly}
      />
    ),
  };
}
