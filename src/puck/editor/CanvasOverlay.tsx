"use client";

import React, { useEffect, useRef, useState } from "react";
import { ActionBar, type ComponentData } from "@puckeditor/core";
import ResizeHandles from "./ResizeHandles";
import { usePuckSelect } from "./puckStore";
import {
  BookmarkPlus,
  Copy,
  ClipboardPaste,
  CopyPlus,
  Paintbrush,
  RotateCcw,
  Lock,
  Unlock,
  Trash2,
  Pencil,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";
import PuckStructurePicker from "./StructurePicker";
import { cloneWithNewIds } from "../core/tree";
import { useOptionalBuilderStorage } from "../storage";

const BLOCK_CLIPBOARD_KEY = "sfd_puck_clipboard_block_v1";
const STYLE_CLIPBOARD_KEY = "sfd_puck_clipboard_style_v1";

const STYLE_PROP_KEYS = new Set([
  "bgColor",
  "backgroundColor",
  "textColor",
  "color",
  "accentColor",
  "badgeBg",
  "badgeColor",
  "cardBgColor",
  "cardBorderColor",
  "padding",
  "paddingY",
  "paddingX",
  "marginBottom",
  "align",
  "borderRadius",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "maxWidth",
  "width",
  "gap",
  "display",
  "displayLayout",
  "columns",
  "gridColumns",
  "direction",
  "flexDirection",
  "wrap",
  "flexWrap",
  "justify",
  "justifyContent",
  "alignItems",
  "variant",
  "customCss",
  "responsive",
]);

interface LocatedComponent {
  zone: string;
  index: number;
  item: ComponentData;
  parentList: ComponentData[];
}

function findComponentInTree(
  items: ComponentData[],
  targetId: string,
  zone: string
): LocatedComponent | null {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.props?.id === targetId) {
      return { zone, index: i, item, parentList: items };
    }
    const props = (item.props || {}) as Record<string, unknown>;
    for (const [key, val] of Object.entries(props)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "type" in val[0]) {
        const nestedZone = `${item.props?.id}:${key}`;
        const found = findComponentInTree(val as ComponentData[], targetId, nestedZone);
        if (found) return found;
      }
    }
  }
  return null;
}

function insertAfterInTree(
  items: ComponentData[],
  targetId: string,
  newItem: ComponentData
): { list: ComponentData[]; inserted: boolean } {
  const out: ComponentData[] = [];
  let inserted = false;
  for (const item of items) {
    if (item.props?.id === targetId) {
      out.push(item, newItem);
      inserted = true;
      continue;
    }
    const props = (item.props || {}) as Record<string, unknown>;
    let updatedItem = item;
    for (const [key, val] of Object.entries(props)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "type" in val[0]) {
        const res = insertAfterInTree(val as ComponentData[], targetId, newItem);
        if (res.inserted) {
          inserted = true;
          updatedItem = {
            ...item,
            props: { ...item.props, [key]: res.list },
          };
        }
      }
    }
    out.push(updatedItem);
  }
  return { list: out, inserted };
}

function readClipboard<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeClipboard(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

const QUICK_WIDGETS: Array<{ type: string; label: string }> = [
  { type: "HeadingBlock", label: "Heading (H1-H6)" },
  { type: "ParagraphBlock", label: "Paragraph (<p>)" },
  { type: "ImageBlock", label: "Image" },
  { type: "ButtonBlock", label: "Button" },
  { type: "VideoBlock", label: "Video (YouTube/MP4)" },
  { type: "IconBlock", label: "Icon Widget" },
  { type: "CounterBlock", label: "Number Counter" },
  { type: "GoogleMapBlock", label: "Google Map" },
  { type: "SpacerDividerBlock", label: "Spacer / Divider" },
  { type: "FlexBlock", label: "Inner Flex" },
  { type: "GridBlock", label: "Inner Grid" },
  { type: "HtmlBlock", label: "Custom HTML" },
];

function insertChildIntoContainer(
  items: ComponentData[],
  containerId: string,
  child: ComponentData
): { list: ComponentData[]; inserted: boolean } {
  let inserted = false;
  const list = items.map((item) => {
    if (item.props?.id === containerId) {
      inserted = true;
      const prevChildren = Array.isArray(item.props?.children)
        ? (item.props.children as ComponentData[])
        : [];
      return {
        ...item,
        props: {
          ...item.props,
          children: [...prevChildren, child],
        },
      };
    }
    const props = (item.props || {}) as Record<string, unknown>;
    let updatedItem = item;
    for (const [key, val] of Object.entries(props)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "type" in val[0]) {
        const res = insertChildIntoContainer(val as ComponentData[], containerId, child);
        if (res.inserted) {
          inserted = true;
          updatedItem = {
            ...item,
            props: { ...item.props, [key]: res.list },
          };
        }
      }
    }
    return updatedItem;
  });
  return { list, inserted };
}

export function PuckComponentOverlay({
  children,
  hover,
  isSelected,
  componentId,
  componentType,
}: {
  children: React.ReactNode;
  hover: boolean;
  isSelected: boolean;
  componentId: string;
  componentType: string;
}) {
  // Only the page data: hover and drag state changes must not re-render every overlay.
  const puckData = usePuckSelect((s) => s.appState.data);
  const dispatch = usePuckSelect((s) => s.dispatch);
  const editorConfig = usePuckSelect((s) => s.config);
  // The canvas can render outside the full editor (a bare <Puck>), so storage is optional.
  const storage = useOptionalBuilderStorage()?.storage;
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showInsertAbove, setShowInsertAbove] = useState(false);
  const [showInsertBelow, setShowInsertBelow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const doc = wrapperRef.current?.ownerDocument;
    if (!doc) return;

    const onDocContextMenu = (e: MouseEvent) => {
      const targetEl = e.target instanceof Element ? e.target : null;
      if (targetEl?.closest("[data-sfd-context-menu]")) return;

      const puckEl = targetEl?.closest("[data-puck-component]");
      const isMatch = puckEl
        ? puckEl.getAttribute("data-puck-component") === componentId
        : hover || isSelected;

      if (!isMatch) {
        setMenuPos(null);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      const win = doc.defaultView || window;
      const x = Math.min(e.clientX, win.innerWidth - 220);
      const y = Math.min(e.clientY, win.innerHeight - 340);
      setMenuPos({ x: Math.max(8, x), y: Math.max(8, y) });
    };

    doc.addEventListener("contextmenu", onDocContextMenu, true);
    return () => {
      doc.removeEventListener("contextmenu", onDocContextMenu, true);
    };
  }, [componentId, hover, isSelected]);

  useEffect(() => {
    if (!menuPos) return;
    const doc = menuRef.current?.ownerDocument || document;
    const close = (e: Event) => {
      if (menuRef.current && e.target instanceof Node && menuRef.current.contains(e.target)) {
        return;
      }
      setMenuPos(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuPos(null);
    };
    doc.addEventListener("mousedown", close);
    doc.addEventListener("keydown", onKey);
    return () => {
      doc.removeEventListener("mousedown", close);
      doc.removeEventListener("keydown", onKey);
    };
  }, [menuPos]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const win = e.currentTarget.ownerDocument.defaultView || window;
    const x = Math.min(e.clientX, win.innerWidth - 220);
    const y = Math.min(e.clientY, win.innerHeight - 340);
    setMenuPos({ x: Math.max(8, x), y: Math.max(8, y) });
  };

  const located = findComponentInTree(
    (puckData.content || []) as ComponentData[],
    componentId,
    "root:default-zone"
  );

  const compConfig = (editorConfig.components as Record<string, { label?: string; defaultProps?: Record<string, unknown> }>)[
    componentType
  ];
  const label = compConfig?.label || componentType;
  const isLocked = Boolean(located?.item?.props?.locked);
  const hasCopiedBlock = Boolean(menuPos && readClipboard<ComponentData>(BLOCK_CLIPBOARD_KEY));
  const hasCopiedStyle = Boolean(menuPos && readClipboard<Record<string, unknown>>(STYLE_CLIPBOARD_KEY));

  const handleEdit = () => {
    if (located) {
      dispatch({
        type: "setUi",
        ui: { itemSelector: { index: located.index, zone: located.zone } },
      });
    }
    setMenuPos(null);
  };

  const handleDuplicate = () => {
    if (located && !isLocked) {
      dispatch({
        type: "duplicate",
        sourceIndex: located.index,
        sourceZone: located.zone,
      });
    }
    setMenuPos(null);
  };

  const handleSaveTemplate = async () => {
    setMenuPos(null);
    if (!located || !storage) return;
    const name = window.prompt("Name this template", label);
    if (!name?.trim()) return;
    try {
      await storage.saveTemplate(name.trim(), [located.item]);
      window.dispatchEvent(new Event("pb:templates-changed"));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Could not save the template");
    }
  };

  const handleCopy = () => {
    if (located) {
      writeClipboard(BLOCK_CLIPBOARD_KEY, located.item);
    }
    setMenuPos(null);
  };

  const handlePaste = () => {
    const copied = readClipboard<ComponentData>(BLOCK_CLIPBOARD_KEY);
    if (copied && located) {
      const cloned = cloneWithNewIds(copied);
      const res = insertAfterInTree(
        (puckData.content || []) as ComponentData[],
        componentId,
        cloned
      );
      if (res.inserted) {
        dispatch({
          type: "setData",
          data: {
            ...puckData,
            content: res.list,
          },
        });
      }
    }
    setMenuPos(null);
  };

  const handleCopyStyle = () => {
    if (located) {
      const props = (located.item.props || {}) as Record<string, unknown>;
      const styleSnapshot: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(props)) {
        if (STYLE_PROP_KEYS.has(k) && v !== undefined) {
          styleSnapshot[k] = v;
        }
      }
      writeClipboard(STYLE_CLIPBOARD_KEY, styleSnapshot);
    }
    setMenuPos(null);
  };

  const handlePasteStyle = () => {
    const styleSnapshot = readClipboard<Record<string, unknown>>(STYLE_CLIPBOARD_KEY);
    if (styleSnapshot && located) {
      const currentProps = located.item.props || { id: componentId };
      const mergedProps: ComponentData["props"] = { ...currentProps };
      for (const [k, v] of Object.entries(styleSnapshot)) {
        if (k in currentProps || k === "customCss" || k === "responsive") {
          mergedProps[k] = v;
        }
      }
      dispatch({
        type: "replace",
        destinationIndex: located.index,
        destinationZone: located.zone,
        data: {
          ...located.item,
          props: mergedProps,
        },
      });
    }
    setMenuPos(null);
  };

  const handleResetStyle = () => {
    if (located && compConfig?.defaultProps) {
      const currentProps = located.item.props || { id: componentId };
      const nextProps: ComponentData["props"] = { ...currentProps };
      for (const k of Array.from(STYLE_PROP_KEYS)) {
        if (k in compConfig.defaultProps) {
          nextProps[k] = compConfig.defaultProps[k];
        } else if (k === "responsive" || k === "customCss") {
          delete nextProps[k];
        }
      }
      dispatch({
        type: "replace",
        destinationIndex: located.index,
        destinationZone: located.zone,
        data: {
          ...located.item,
          props: nextProps,
        },
      });
    }
    setMenuPos(null);
  };

  const handleToggleLock = () => {
    if (located) {
      dispatch({
        type: "replace",
        destinationIndex: located.index,
        destinationZone: located.zone,
        data: {
          ...located.item,
          props: {
            ...located.item.props,
            locked: !isLocked,
          },
        },
      });
    }
    setMenuPos(null);
  };

  const handleDelete = () => {
    if (located && !isLocked) {
      dispatch({
        type: "remove",
        index: located.index,
        zone: located.zone,
      });
    }
    setMenuPos(null);
  };

  const isContainerType = componentType === "FlexBlock" || componentType === "GridBlock";
  const currentContainer = isContainerType
    ? findComponentInTree(
      (puckData.content || []) as ComponentData[],
      componentId,
      "root:default-zone"
    )
    : null;
  const isEmptyContainer = Boolean(
    isContainerType &&
    currentContainer &&
    Array.isArray(currentContainer.item.props?.children) &&
    (currentContainer.item.props.children as ComponentData[]).length === 0
  );

  const handleQuickAddWidget = (widgetType: string) => {
    const cfg = (
      editorConfig.components as Record<string, { defaultProps?: Record<string, unknown> }>
    )[widgetType];
    const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const newChild: ComponentData = {
      type: widgetType,
      props: {
        ...(cfg?.defaultProps || {}),
        id: `${widgetType}-${uid}`,
      },
    };
    const res = insertChildIntoContainer(
      (puckData.content || []) as ComponentData[],
      componentId,
      newChild
    );
    if (res.inserted) {
      dispatch({
        type: "setData",
        data: {
          ...puckData,
          content: res.list,
        },
      });
      dispatch({
        type: "setUi",
        ui: {
          itemSelector: {
            index: 0,
            zone: `${componentId}:children`,
          },
        },
      });
    }
    setShowQuickAdd(false);
  };

  return (
    <div ref={wrapperRef} onContextMenu={handleContextMenu} className="w-full h-full relative">
      {isSelected && !isLocked && <ResizeHandles componentId={componentId} />}
      {/* Inline Structure Picker ABOVE Active Section */}
      {showInsertAbove && (
        <div
          data-sfd-picker="true"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full relative z-50 pointer-events-auto"
        >
          <PuckStructurePicker
            inline
            title="Insert Section Above"
            targetIndex={located?.index ?? 0}
            onClose={() => setShowInsertAbove(false)}
          />
        </div>
      )}

      {/* Top Handle Pill on Selected Container (Elementor Style) */}
      {isSelected && located?.zone === "root:default-zone" && (
        <div
          data-sfd-handle="true"
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#e11d48] text-white rounded-t-md px-2 py-0.5 shadow-md text-xs font-semibold gap-1.5 pointer-events-auto select-none"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInsertAbove((prev) => !prev);
              setShowInsertBelow(false);
            }}
            className={`p-1 rounded transition cursor-pointer flex items-center gap-1 text-[11px] ${
              showInsertAbove ? "bg-white text-[#e11d48]" : "hover:bg-white/20 text-white"
            }`}
            title="Add Section Above"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[10px] hidden sm:inline">Add Above</span>
          </button>
          <span className="px-1.5 font-mono text-[11px] opacity-80 cursor-grab" title={label}>
            :::
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInsertBelow((prev) => !prev);
              setShowInsertAbove(false);
            }}
            className={`p-1 rounded transition cursor-pointer flex items-center gap-1 text-[11px] ${
              showInsertBelow ? "bg-white text-[#e11d48]" : "hover:bg-white/20 text-white"
            }`}
            title="Add Section Below"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[10px] hidden sm:inline">Add Below</span>
          </button>
          <button
            type="button"
            disabled={isLocked}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="hover:bg-white/20 p-1 rounded transition cursor-pointer text-white/90 hover:text-white"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {children}

      {/* Inline Structure Picker BELOW Active Section */}
      {showInsertBelow && (
        <div
          data-sfd-picker="true"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full relative z-50 pointer-events-auto"
        >
          <PuckStructurePicker
            inline
            title="Insert Section Below"
            targetIndex={(located?.index ?? 0) + 1}
            onClose={() => setShowInsertBelow(false)}
          />
        </div>
      )}
      {isEmptyContainer && (isSelected || showQuickAdd) && (
        <div
          style={{ pointerEvents: "none" }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          {!showQuickAdd ? (
            <button
              type="button"
              style={{ pointerEvents: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickAdd(true);
              }}
              title="Add widget inside this column"
              className="inline-flex items-center gap-1 rounded-full bg-white/95 border border-[#009691]/40 px-2.5 py-1 text-[11px] font-semibold text-[#007f7b] shadow-sm hover:bg-[#009691] hover:text-white transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Widget</span>
            </button>
          ) : (
            <div
              style={{ pointerEvents: "auto" }}
              onClick={(e) => e.stopPropagation()}
              className="w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-xl text-left"
            >
              <div className="flex items-center justify-between px-1 pb-1.5 mb-1.5 border-b border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#009691]">
                  Insert Widget
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickAdd(false)}
                  className="text-[10px] text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {QUICK_WIDGETS.map((w) => (
                  <button
                    key={w.type}
                    type="button"
                    onClick={() => handleQuickAddWidget(w.type)}
                    className="rounded px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-teal-50 hover:text-[#007f7b] text-left truncate cursor-pointer"
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {menuPos && (
        <div
          ref={menuRef}
          data-sfd-context-menu="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: menuPos.x,
            top: menuPos.y,
            zIndex: 99999,
            pointerEvents: "auto",
          }}
          className="w-52 rounded-lg border border-gray-200 bg-white py-1.5 shadow-xl text-xs text-gray-800 select-none"
        >
          <div className="px-3 py-1 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-[#009691] truncate">
            {label}
          </div>

          <button
            type="button"
            onClick={handleEdit}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-teal-50 hover:text-[#007f7b] text-left cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit {label}</span>
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={handleDuplicate}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-teal-50 hover:text-[#007f7b] disabled:opacity-40 text-left cursor-pointer"
          >
            <CopyPlus className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={() => void handleSaveTemplate()}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-teal-50 hover:text-[#007f7b] text-left cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Save as template</span>
          </button>

          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            onClick={handleCopy}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-teal-50 hover:text-[#007f7b] text-left cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </button>

          <button
            type="button"
            disabled={!hasCopiedBlock}
            onClick={handlePaste}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-teal-50 hover:text-[#007f7b] disabled:opacity-40 text-left cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste Below</span>
          </button>

          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            onClick={handleCopyStyle}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-teal-50 hover:text-[#007f7b] text-left cursor-pointer"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Copy Style</span>
          </button>

          <button
            type="button"
            disabled={!hasCopiedStyle}
            onClick={handlePasteStyle}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-teal-50 hover:text-[#007f7b] disabled:opacity-40 text-left cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste Style</span>
          </button>

          <button
            type="button"
            onClick={handleResetStyle}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 text-left cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Style</span>
          </button>

          <div className="my-1 border-t border-gray-100" />

          <button
            type="button"
            onClick={handleToggleLock}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-amber-50 hover:text-amber-700 text-left cursor-pointer"
          >
            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isLocked ? "Unlock Block" : "Lock Block"}</span>
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={handleDelete}
            className="w-full px-3 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50 disabled:opacity-40 text-left cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

function getZoneList(content: ComponentData[], zone: string): ComponentData[] | null {
  if (zone === "root:default-zone") return content;
  const colonIdx = zone.indexOf(":");
  if (colonIdx === -1) return null;
  const parentId = zone.slice(0, colonIdx);
  const slotKey = zone.slice(colonIdx + 1);
  for (const item of content) {
    if (item.props?.id === parentId) {
      const val = (item.props as Record<string, unknown>)?.[slotKey];
      return Array.isArray(val) ? (val as ComponentData[]) : null;
    }
    for (const val of Object.values((item.props || {}) as Record<string, unknown>)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "type" in val[0]) {
        const found = getZoneList(val as ComponentData[], zone);
        if (found) return found;
      }
    }
  }
  return null;
}

function replaceZoneList(
  content: ComponentData[],
  zone: string,
  nextList: ComponentData[]
): ComponentData[] {
  if (zone === "root:default-zone") return nextList;
  const colonIdx = zone.indexOf(":");
  if (colonIdx === -1) return content;
  const parentId = zone.slice(0, colonIdx);
  const slotKey = zone.slice(colonIdx + 1);
  return content.map((item) => {
    if (item.props?.id === parentId) {
      return {
        ...item,
        props: {
          ...item.props,
          [slotKey]: nextList,
        },
      };
    }
    let updated = item;
    for (const [k, val] of Object.entries((item.props || {}) as Record<string, unknown>)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "type" in val[0]) {
        const replaced = replaceZoneList(val as ComponentData[], zone, nextList);
        if (replaced !== val) {
          updated = {
            ...updated,
            props: { ...updated.props, [k]: replaced },
          };
        }
      }
    }
    return updated;
  });
}

export function PuckActionBar({
  label,
  children,
  parentAction,
}: {
  label?: string;
  children: React.ReactNode;
  parentAction: React.ReactNode;
  dragHandle?: React.ReactNode;
  dragHandleRef?: (element: Element | null) => void;
}) {
  const puckData = usePuckSelect((s) => s.appState.data);
  const selector = usePuckSelect((s) => s.appState.ui.itemSelector);
  const dispatch = usePuckSelect((s) => s.dispatch);
  const zone = selector?.zone || "root:default-zone";
  const content = (puckData.content || []) as ComponentData[];
  const zoneList = selector ? getZoneList(content, zone) : null;
  const index = selector?.index ?? -1;
  const canMoveUp = Boolean(selector && zoneList && index > 0);
  const canMoveDown = Boolean(selector && zoneList && index >= 0 && index < zoneList.length - 1);

  const moveSelected = (delta: -1 | 1) => {
    if (!selector || !zoneList) return;
    const targetIdx = selector.index + delta;
    if (targetIdx < 0 || targetIdx >= zoneList.length) return;
    const nextList = [...zoneList];
    const [moved] = nextList.splice(selector.index, 1);
    nextList.splice(targetIdx, 0, moved);

    dispatch({
      type: "setData",
      data: {
        ...puckData,
        content: replaceZoneList(content, zone, nextList),
      },
    });
    dispatch({
      type: "setUi",
      ui: {
        itemSelector: {
          index: targetIdx,
          zone,
        },
      },
    });
  };

  return (
    <ActionBar label={label}>
      {parentAction && <ActionBar.Group>{parentAction}</ActionBar.Group>}
      <ActionBar.Group>
        <ActionBar.Action
          label="Move Up"
          onClick={(e) => {
            e.stopPropagation();
            moveSelected(-1);
          }}
          disabled={!canMoveUp}
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </ActionBar.Action>
        <ActionBar.Action
          label="Move Down"
          onClick={(e) => {
            e.stopPropagation();
            moveSelected(1);
          }}
          disabled={!canMoveDown}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </ActionBar.Action>
        {children}
      </ActionBar.Group>
    </ActionBar>
  );
}
