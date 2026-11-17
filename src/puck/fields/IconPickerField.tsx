"use client";

import React, { useState, useMemo } from "react";
import { FieldLabel, type CustomField } from "@puckeditor/core";
import { ICON_OPTIONS, RenderItemIcon } from "@/puck/components/shared";
import type { PuckIconName } from "@/puck/types";
import { Search, X, Sparkles, Code2, Image as ImageIcon, Smile } from "lucide-react";
import { icons } from "lucide-react";

export function createIconPickerField(label = "Icon"): CustomField<PuckIconName> {
  return {
    type: "custom",
    label,
    render: function IconPickerRenderer({ field, value, onChange, readOnly }) {
      const current = value || "None";
      const [pickerMode, setPickerMode] = useState<"preset" | "custom">("preset");
      const [searchQuery, setSearchQuery] = useState("");
      const [selectedCat, setSelectedCat] = useState<string>("All");
      const [customInput, setCustomInput] = useState(
        current.startsWith("<svg") ||
          current.startsWith("http") ||
          current.startsWith("/") ||
          current.length <= 4
          ? current
          : ""
      );

      const categories = [
        "All",
        "Trust & Badges",
        "Devices & Tech",
        "Repair & Tools",
        "Business & Contact",
        "Arrows & Actions",
      ];

      // Normalized PascalCase search for dynamic Lucide matching
      const pascalSearch = searchQuery.trim()
        ? searchQuery.trim().replace(/[-_ ]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^[a-z]/, (c) => c.toUpperCase())
        : "";

      const dynamicLucideFound =
        pascalSearch && Boolean((icons as Record<string, any>)[pascalSearch]);

      const filteredIcons = useMemo(() => {
        return ICON_OPTIONS.filter((opt) => {
          if (opt.value === "None") return true;
          const matchesCat = selectedCat === "All" || opt.category === selectedCat;
          const matchesSearch =
            !searchQuery.trim() ||
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opt.value.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCat && matchesSearch;
        });
      }, [selectedCat, searchQuery]);

      const handleApplyCustom = () => {
        if (!customInput.trim()) {
          onChange("None");
        } else {
          onChange(customInput.trim());
        }
      };

      return (
        <FieldLabel label={field.label || label} readOnly={readOnly}>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-2.5">
            {/* Header: Mode Switcher & Active Preview */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2">
              <div className="flex items-center gap-1 bg-gray-200/80 p-0.5 rounded-md text-[10px]">
                <button
                  type="button"
                  onClick={() => setPickerMode("preset")}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    pickerMode === "preset"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Lucide Icons (2,000+)
                </button>
                <button
                  type="button"
                  onClick={() => setPickerMode("custom")}
                  className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                    pickerMode === "custom"
                      ? "bg-white text-gray-900 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Custom SVG / URL / Emoji
                </button>
              </div>

              {/* Clear button */}
              {current !== "None" && !readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("None");
                    setCustomInput("");
                  }}
                  className="text-[10px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Clear icon"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Currently Selected Banner */}
            <div className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 border border-gray-200 text-xs shadow-xs">
              <span className="text-[11px] font-semibold text-gray-500">Active Icon:</span>
              <div className="flex items-center gap-1.5 font-bold text-[#009691] max-w-[200px] truncate">
                {current !== "None" && (
                  <div className="w-4 h-4 flex items-center justify-center shrink-0">
                    <RenderItemIcon name={current} className="w-4 h-4 text-[#009691]" />
                  </div>
                )}
                <span className="truncate text-[11px]">
                  {current.startsWith("<svg")
                    ? "Custom SVG Code"
                    : current.startsWith("http") || current.startsWith("/")
                    ? "Custom Image URL"
                    : current}
                </span>
              </div>
            </div>

            {/* MODE 1: PRESET & LUCIDE 2,000+ SEARCH */}
            {pickerMode === "preset" ? (
              <>
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    disabled={readOnly}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search all 2,000+ Lucide icons (e.g. coffee, flame, cpu)..."
                    className="w-full pl-8 pr-7 py-1.5 text-[11px] rounded bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Direct Dynamic Match Banner if typed custom Lucide icon */}
                {dynamicLucideFound && (
                  <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded px-2.5 py-1 text-xs text-[#007f7b]">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#009691]" />
                      <span className="text-[11px] font-medium">Found Lucide: <strong>{pascalSearch}</strong></span>
                      <RenderItemIcon name={pascalSearch} className="w-4 h-4 text-[#009691]" />
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange(pascalSearch)}
                      className="text-[10px] bg-[#009691] text-white font-bold px-2 py-0.5 rounded hover:bg-[#007f7b] transition cursor-pointer"
                    >
                      Use
                    </button>
                  </div>
                )}

                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] no-scrollbar">
                  {categories.map((cat) => {
                    const isCatActive = selectedCat === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={readOnly}
                        onClick={() => setSelectedCat(cat)}
                        className={`whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                          isCatActive
                            ? "bg-[#009691] text-white shadow-xs"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Scrollable Icon Grid */}
                <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1 bg-white rounded border border-gray-200">
                  {filteredIcons.map((opt) => {
                    const active = current === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={readOnly}
                        onClick={() => onChange(opt.value)}
                        title={`${opt.label} (${opt.value})`}
                        className={`flex h-8 flex-col items-center justify-center rounded border transition cursor-pointer ${
                          active
                            ? "border-[#009691] bg-[#009691]/15 text-[#007f7b] ring-2 ring-[#009691]/40"
                            : "border-transparent text-gray-700 hover:bg-gray-100 hover:border-gray-200"
                        }`}
                      >
                        {opt.value === "None" ? (
                          <span className="text-[9px] font-semibold text-gray-400">None</span>
                        ) : (
                          <RenderItemIcon name={opt.value} className="h-4 w-4" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400 px-0.5">
                  <span>{filteredIcons.length} curated + 2,000+ Lucide icons</span>
                  <span>Type any name to use</span>
                </div>
              </>
            ) : (
              /* MODE 2: CUSTOM SVG, URL OR EMOJI INPUT */
              <div className="space-y-2 bg-white p-2.5 rounded border border-gray-200">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-gray-700 block">
                    Paste Raw SVG Code, Image URL, or Emoji:
                  </span>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Supports <code>&lt;svg ...&gt;</code>, image paths (<code>/icons/apple.svg</code> or <code>https://...</code>), or emojis (🛠️, ⚡, 🍎).
                  </p>
                </div>

                <textarea
                  rows={3}
                  disabled={readOnly}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder='e.g. <svg viewBox="0 0 24 24">...</svg> or https://example.com/logo.svg or 🛠️'
                  className="w-full p-2 text-[11px] font-mono rounded bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#009691] focus:ring-1 focus:ring-[#009691]"
                />

                <div className="flex items-center justify-between pt-1">
                  {/* Live preview */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="text-[10px] font-semibold text-gray-400">Preview:</span>
                    <div className="w-6 h-6 border rounded border-gray-200 bg-gray-50 flex items-center justify-center p-0.5">
                      {customInput.trim() ? (
                        <RenderItemIcon name={customInput.trim()} className="w-5 h-5 text-[#009691]" />
                      ) : (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={readOnly || !customInput.trim()}
                    onClick={handleApplyCustom}
                    className="px-3 py-1 bg-[#009691] hover:bg-[#007f7b] disabled:opacity-40 text-white rounded text-[11px] font-bold transition shadow-xs cursor-pointer"
                  >
                    Apply Custom Icon
                  </button>
                </div>
              </div>
            )}
          </div>
        </FieldLabel>
      );
    },
  };
}
