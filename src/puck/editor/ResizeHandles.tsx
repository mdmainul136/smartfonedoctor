"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useGetPuck, type ComponentData } from "@puckeditor/core";
import { BREAKPOINTS, type PbStyle, type StyleMap, type StyleScope } from "../style";

type Axis = "x" | "y" | "xy";

type Drag = {
  axis: Axis;
  startX: number;
  startY: number;
  width: number;
  height: number;
  /** Inner width of the parent, for percentage widths. */
  parentWidth: number;
  /** Set when the parent is a grid: dragging sideways changes the column span. */
  grid: { columns: number; track: number; gap: number } | null;
};

type Preview = { width: number; height: number; label: string };

const MIN = 24;

function measure(el: HTMLElement): Pick<Drag, "width" | "height" | "parentWidth" | "grid"> {
  const rect = el.getBoundingClientRect();
  const parent = el.parentElement;
  const view = el.ownerDocument.defaultView;
  let parentWidth = rect.width;
  let grid: Drag["grid"] = null;
  if (parent && view) {
    const cs = view.getComputedStyle(parent);
    parentWidth = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (cs.display.includes("grid")) {
      const tracks = cs.gridTemplateColumns.split(" ").map(parseFloat).filter((n) => n > 0);
      const gap = parseFloat(cs.columnGap) || 0;
      if (tracks.length > 1) {
        grid = { columns: tracks.length, gap, track: tracks.reduce((a, b) => a + b, 0) / tracks.length };
      }
    }
  }
  return { width: rect.width, height: rect.height, parentWidth, grid };
}

/** The design changes a drag of this size stands for. */
function resolve(drag: Drag, width: number, height: number): { changes: StyleMap; label: string } {
  const changes: StyleMap = {};
  const parts: string[] = [];
  if (drag.axis !== "y") {
    if (drag.grid) {
      const { columns, track, gap } = drag.grid;
      const span = Math.min(columns, Math.max(1, Math.round((width + gap) / (track + gap))));
      changes.gridColumn = `span ${span}`;
      changes.width = "";
      parts.push(`${span} of ${columns} columns`);
    } else {
      const pct = Math.min(100, Math.round((width / Math.max(1, drag.parentWidth)) * 1000) / 10);
      changes.width = `${pct}%`;
      parts.push(`${pct}%`);
    }
  }
  if (drag.axis !== "x") {
    changes.height = `${Math.round(height)}px`;
    parts.push(`${Math.round(height)}px tall`);
  }
  return { changes, label: parts.join(" · ") };
}

/**
 * Drag handles on the selected element: right edge for width (or column span
 * inside a grid), bottom edge for height, corner for both. The new size is
 * written to the element's design data for the device being viewed.
 */
export default function ResizeHandles({ componentId }: { componentId: string }) {
  const getPuck = useGetPuck();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  const sizeAt = (e: ReactPointerEvent) => {
    const drag = dragRef.current as Drag;
    return {
      width: drag.axis === "y" ? drag.width : Math.max(MIN, drag.width + e.clientX - drag.startX),
      height: drag.axis === "x" ? drag.height : Math.max(MIN, drag.height + e.clientY - drag.startY),
    };
  };

  const start = (axis: Axis) => (e: ReactPointerEvent<HTMLDivElement>) => {
    const doc = rootRef.current?.ownerDocument;
    const el = doc?.querySelector<HTMLElement>(`[data-puck-component="${componentId}"]`);
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { axis, startX: e.clientX, startY: e.clientY, ...measure(el) };
  };

  const move = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { width, height } = sizeAt(e);
    setPreview({ width, height, label: resolve(drag, width, height).label });
  };

  const end = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { width, height } = sizeAt(e);
    dragRef.current = null;
    setPreview(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    // A click without a real drag changes nothing.
    if (Math.abs(e.clientX - drag.startX) < 3 && Math.abs(e.clientY - drag.startY) < 3) return;

    const { getItemById, getSelectorForId, dispatch } = getPuck();
    const item = getItemById(componentId) as ComponentData | undefined;
    const selector = getSelectorForId(componentId);
    if (!item || !selector) return;

    // Write to the device currently shown on the canvas.
    const canvasWidth = rootRef.current?.ownerDocument.defaultView?.innerWidth ?? 1280;
    const scope: StyleScope =
      canvasWidth <= BREAKPOINTS.mobile ? "mobile" : canvasWidth <= BREAKPOINTS.tablet ? "tablet" : "base";

    const current = ((item.props as { pbStyle?: PbStyle }).pbStyle || {}) as PbStyle;
    const map: StyleMap = { ...(current[scope] || {}) };
    for (const [prop, value] of Object.entries(resolve(drag, width, height).changes)) {
      if (value === "") delete map[prop];
      else map[prop] = value;
    }
    dispatch({
      type: "replace",
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: { ...item, props: { ...item.props, pbStyle: { ...current, [scope]: map } } } as ComponentData,
    });
  };

  const handle = (axis: Axis, className: string, title: string) => (
    <div
      data-pb-resize={axis}
      title={title}
      onPointerDown={start(axis)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onClick={(e) => e.stopPropagation()}
      className={`pointer-events-auto absolute z-40 touch-none rounded-full border-2 border-white bg-[#009691] shadow ${className}`}
    />
  );

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0 z-40">
      {preview && (
        <div
          className="absolute left-0 top-0 border-2 border-dashed border-[#009691] bg-[#009691]/10"
          style={{ width: preview.width, height: preview.height }}
        >
          <span className="absolute bottom-1 right-1 whitespace-nowrap rounded bg-[#0f172a] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {preview.label}
          </span>
        </div>
      )}
      {handle("x", "right-0.5 top-1/2 h-8 w-2.5 -translate-y-1/2 cursor-ew-resize", "Drag to change width")}
      {handle("y", "bottom-0.5 left-1/2 h-2.5 w-8 -translate-x-1/2 cursor-ns-resize", "Drag to change height")}
      {handle("xy", "bottom-0.5 right-0.5 h-3.5 w-3.5 cursor-nwse-resize", "Drag to change width and height")}
    </div>
  );
}
