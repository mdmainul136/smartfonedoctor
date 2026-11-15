"use client";

import React, { useState, useMemo } from "react";
import { FieldLabel, type CustomField } from "@puckeditor/core";
import { ICON_OPTIONS, RenderItemIcon } from "@/puck/components/shared";
import type { PuckIconName } from "@/puck/types";
import { Search, X } from "lucide-react";

export function createIconPickerField(label = "Icon"): CustomField<PuckIconName> {
  return {
    type: "custom",
    label,
    render: ({ field, value, onChange, readOnly }) => {
      const current = value || "None";
      const [searchQuery, setSearchQuery] = useState("");
      const [selectedCat, setSelectedCat] = useState<string>("All");

      const categories = [
        "All",
        "Trust & Badges",
        "Devices & Tech",
        "Repair & Tools",
        "Business & Contact",
        "Arrows & Actions",
      ];

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

      return (
        <FieldLabel label={field.label || label} readOnly={readOnly}>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-2.5">
            {/* Active Selected Icon Bar */}
            <div className="flex items-center justify-between rounded-md bg-white px-2.5 py-1.5 border border-gray-200 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-gray-500">Selected:</span>
                <div className="flex items-center gap-1.5 font-bold text-[#009691]">
                  {current !== "None" && <RenderItemIcon name={current} className="h-4 w-4 text-[#009691]" />}
                  <span>{current}</span>
                </div>
              </div>
              {current !== "None" && !readOnly && (
                <button
                  type="button"
                  onClick={() => onChange("None")}
                  className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear icon"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                disabled={readOnly}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 65+ icons (e.g. phone, battery, star)..."
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
            <div className="grid grid-cols-6 gap-1 max-h-44 overflow-y-auto p-1 bg-white rounded border border-gray-200">
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
              <span>{filteredIcons.length} icons available</span>
              <span>Click to select</span>
            </div>
          </div>
        </FieldLabel>
      );
    },
  };
}
