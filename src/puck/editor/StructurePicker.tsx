"use client";

import React, { useState, useEffect } from "react";
import { useGetPuck, ComponentData } from "@puckeditor/core";
import { usePuckSelect } from "./puckStore";
import {
  Plus,
  Sparkles,
  X,
  ChevronLeft,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import {
  FLEX_PRESETS,
  GRID_PRESETS,
  createFlexPresetBlock,
  createGridPresetBlock,
  type FlexPreset,
  type GridPreset,
} from "@/puck/layout/elementorPresets";

export default function PuckStructurePicker({
  onOpenAi,
  position = "bottom",
  targetIndex,
  initialStep = "idle",
  onClose,
  inline = false,
  title,
}: {
  onOpenAi?: () => void;
  position?: "top" | "bottom" | "custom";
  targetIndex?: number;
  initialStep?: "idle" | "choice" | "flex" | "grid";
  onClose?: () => void;
  inline?: boolean;
  title?: string;
}) {
  // Read on demand: these values are only needed when the user acts.
  const getPuck = useGetPuck();
  const dispatch = usePuckSelect((s) => s.dispatch);
  const [step, setStep] = useState<"idle" | "choice" | "flex" | "grid">(
    inline ? "choice" : initialStep
  );

  // Handle Escape key to navigate back or close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (step === "flex" || step === "grid") {
          setStep("choice");
        } else if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, onClose]);

  const insertBlockAtTarget = (newBlock: ComponentData) => {
    const { appState } = getPuck();
    const existing = (appState.data?.content || []) as ComponentData[];
    let insertIdx = existing.length;
    const selectedIndex = appState.ui?.itemSelector?.index;

    if (typeof targetIndex === "number" && targetIndex >= 0) {
      insertIdx = Math.min(targetIndex, existing.length);
    } else if (selectedIndex !== undefined) {
      insertIdx = selectedIndex;
    }

    const nextContent = [
      ...existing.slice(0, insertIdx),
      newBlock,
      ...existing.slice(insertIdx),
    ];

    dispatch({
      type: "setData",
      data: {
        ...appState.data,
        content: nextContent,
      },
    });
    dispatch({
      type: "setUi",
      ui: {
        itemSelector: {
          index: insertIdx,
          zone: "root:default-zone",
        },
      },
    });

    if (onClose) {
      onClose();
    } else {
      setStep("idle");
    }
  };

  const handleInsertFlex = (preset: FlexPreset) => {
    const block = createFlexPresetBlock(preset);
    insertBlockAtTarget(block);
  };

  const handleInsertGrid = (preset: GridPreset) => {
    const block = createGridPresetBlock(preset);
    insertBlockAtTarget(block);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setStep("idle");
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={
        inline
          ? "w-full my-3 rounded-xl border-2 border-dashed border-[#e11d48] bg-white p-4 shadow-xl relative z-40 animate-in fade-in zoom-in-95 duration-150 text-left select-none pointer-events-auto"
          : position === "top"
          ? "mb-3 rounded-xl border border-dashed border-gray-300 bg-white/95 px-4 py-2.5 text-center shadow-xs transition hover:border-[#009691]/60"
          : "my-4 rounded-xl border-2 border-dashed border-gray-300 bg-white/90 p-6 text-center transition hover:border-[#009691]/70"
      }
    >
      {/* Unified Header for Inline Mode */}
      {inline && (
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {step === "flex" || step === "grid" ? (
              <button
                type="button"
                onClick={() => setStep("choice")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition cursor-pointer"
                title="Go back to layout choices"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-[#e11d48]">
                {title || "Insert Section"}
              </span>
            )}
          </div>

          <div className="text-xs font-semibold text-gray-800">
            {step === "flex"
              ? "Choose Flexbox Structure"
              : step === "grid"
              ? "Choose Grid Structure"
              : "Which layout would you like to use?"}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Standalone Button (for top or bottom standing bar) */}
      {!inline && step === "idle" && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep("choice")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#e11d48] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#be123c] transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Section</span>
            </button>
            {onOpenAi && (
              <button
                type="button"
                onClick={onOpenAi}
                title="Generate section with AI"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#9333ea] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#7e22ce] transition cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Section</span>
              </button>
            )}
          </div>
          <span className="text-[11px] text-gray-500">
            Elementor Flexbox & Grid • Click <strong>+</strong> to pick a layout structure
          </span>
        </div>
      )}

      {/* Step 1: Layout Choice (FLEXBOX vs GRID) */}
      {step === "choice" && (
        <div className="relative mx-auto max-w-xl py-2">
          {!inline && (
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-0 top-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {!inline && (
            <div className="mb-4 text-xs font-semibold text-gray-700 text-center">
              Which layout would you like to use?
            </div>
          )}

          <div className="flex items-center justify-center gap-6">
            {/* Flexbox Card */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStep("flex");
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-transparent bg-gray-50 p-5 hover:border-[#e11d48] hover:bg-white hover:shadow-md transition cursor-pointer w-44"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 group-hover:bg-[#e11d48]/10 transition-colors p-2 pointer-events-none">
                <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full">
                  <div className="bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                  <div className="bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                  <div className="col-span-2 bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 group-hover:text-[#e11d48] pointer-events-none">
                Flexbox
              </span>
            </button>

            {/* Grid Card */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStep("grid");
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="group flex flex-col items-center gap-3 rounded-xl border-2 border-transparent bg-gray-50 p-5 hover:border-[#0284c7] hover:bg-white hover:shadow-md transition cursor-pointer w-44"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 group-hover:bg-[#0284c7]/10 transition-colors p-2 pointer-events-none">
                <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full border border-dashed border-slate-400 group-hover:border-[#0284c7] p-1 rounded-xs">
                  <div className="border border-dashed border-slate-400 group-hover:border-[#0284c7]" />
                  <div className="border border-dashed border-slate-400 group-hover:border-[#0284c7]" />
                  <div className="border border-dashed border-slate-400 group-hover:border-[#0284c7]" />
                  <div className="border border-dashed border-slate-400 group-hover:border-[#0284c7]" />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700 group-hover:text-[#0284c7] pointer-events-none">
                Grid
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2A: Flexbox Presets */}
      {step === "flex" && (
        <div className="relative mx-auto max-w-3xl py-2">
          {!inline && (
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <button
                type="button"
                onClick={() => setStep("choice")}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div className="text-xs font-semibold text-gray-700">
                Select your structure
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FLEX_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleInsertFlex(preset)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 hover:border-[#e11d48] hover:bg-rose-50/30 transition cursor-pointer"
              >
                <div className="flex h-9 w-full items-center justify-center rounded bg-slate-200 group-hover:bg-[#e11d48]/15 transition-colors p-1">
                  {preset.iconType === "arrow-down" && (
                    <ArrowDown className="h-4 w-4 text-slate-500 group-hover:text-[#e11d48]" />
                  )}
                  {preset.iconType === "arrow-right" && (
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-[#e11d48]" />
                  )}
                  {preset.iconType === "bars" && preset.bars && (
                    <div className="flex h-full w-full gap-1">
                      {preset.bars.map((pct, i) => (
                        <div
                          key={i}
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-xs bg-slate-400 group-hover:bg-[#e11d48] transition-colors"
                        />
                      ))}
                    </div>
                  )}
                  {preset.iconType === "grid2x2" && (
                    <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full w-full">
                      <div className="bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                    </div>
                  )}
                  {preset.iconType === "top1-btm2" && (
                    <div className="flex flex-col gap-1 h-full w-full">
                      <div className="h-1/2 w-full bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                      <div className="flex gap-1 h-1/2 w-full">
                        <div className="w-1/2 bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                        <div className="w-1/2 bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                      </div>
                    </div>
                  )}
                  {preset.iconType === "left1-right2" && (
                    <div className="flex gap-1 h-full w-full">
                      <div className="w-1/2 h-full bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                      <div className="flex flex-col gap-1 w-1/2 h-full">
                        <div className="h-1/2 bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                        <div className="h-1/2 bg-slate-400 group-hover:bg-[#e11d48] rounded-xs" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-gray-600 group-hover:text-[#e11d48] truncate">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2B: Grid Presets */}
      {step === "grid" && (
        <div className="relative mx-auto max-w-2xl py-2">
          {!inline && (
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <button
                type="button"
                onClick={() => setStep("choice")}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div className="text-xs font-semibold text-gray-700">
                Select your structure
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {GRID_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleInsertGrid(preset)}
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-gray-200 bg-white p-2 hover:border-[#0284c7] hover:bg-sky-50/30 transition cursor-pointer"
              >
                <div className="flex h-9 w-full items-center justify-center rounded bg-slate-200 group-hover:bg-[#0284c7]/15 transition-colors p-1">
                  {preset.type === "grid2x2" ? (
                    <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full w-full">
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                    </div>
                  ) : preset.type === "grid3x2" ? (
                    <div className="grid grid-cols-3 grid-rows-2 gap-1 h-full w-full">
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                      <div className="bg-slate-400 group-hover:bg-[#0284c7] rounded-xs" />
                    </div>
                  ) : (
                    <div className="flex h-full w-full gap-1">
                      {Array.from({ length: preset.columns }).map((_, i) => (
                        <div
                          key={i}
                          className="h-full flex-1 rounded-xs bg-slate-400 group-hover:bg-[#0284c7] transition-colors"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-gray-600 group-hover:text-[#0284c7] truncate">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
