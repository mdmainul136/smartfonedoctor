import type { ComponentData, Data } from "@puckeditor/core";
import type { PbStyle, StyleMap } from "../style/types";

/**
 * Converts the older layout blocks (FlexBlock, GridBlock, ContainerBlock,
 * ColumnBlock) into the style-engine Container and Grid, so every page gets
 * the Design tab, drag-to-resize and per-device layout.
 *
 * A block is left as it is when it uses something the new container cannot
 * express the same way (custom CSS, the old responsive overrides, or
 * hide-on-device), so no page changes how it looks.
 */

type Props = Record<string, unknown>;
type Item = { type: string; props: Props };

const LEGACY = new Set(["FlexBlock", "GridBlock", "ContainerBlock", "ColumnBlock"]);

const SHADOWS: Record<string, string> = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const px = (v: unknown, fallback: number) => `${typeof v === "number" ? v : fallback}px`;
const isItem = (v: unknown): v is Item =>
  Boolean(v) && typeof v === "object" && typeof (v as Item).type === "string" && typeof (v as Item).props === "object";
const isItemList = (v: unknown): v is Item[] => Array.isArray(v) && v.length > 0 && v.every(isItem);

/** "8px 16px" -> one value per side. */
function sides(prefix: "padding" | "margin", shorthand: string): StyleMap {
  const parts = shorthand.split(/\s+/).filter(Boolean);
  if (!parts.length || parts.length > 4) return {};
  const [top, right = top, bottom = top, left = right] = parts;
  return { [`${prefix}Top`]: top, [`${prefix}Right`]: right, [`${prefix}Bottom`]: bottom, [`${prefix}Left`]: left };
}

function hasValues(v: unknown): boolean {
  return Boolean(v) && typeof v === "object" && Object.values(v as object).some((x) => x !== "" && x != null && x !== false);
}

/** True when the block relies on a feature that would not carry over unchanged. */
function mustStayLegacy(p: Props): boolean {
  const responsive = p.responsive as { tablet?: unknown; mobile?: unknown } | undefined;
  return Boolean(str(p.customCss)) || hasValues(responsive?.tablet) || hasValues(responsive?.mobile) || hasValues(p.visibility);
}

function put(map: StyleMap, prop: string, value: string, skip: string[] = []) {
  if (value && !skip.includes(value)) map[prop] = value;
}

/** Box, border and text settings shared by the old Flex and Grid blocks. */
function frame(p: Props, defaultPadY: number): StyleMap {
  const map: StyleMap = {};
  Object.assign(map, sides("padding", str(p.padding) || `${px(p.paddingY, defaultPadY)} ${px(p.paddingX, 24)}`));
  const margin = str(p.margin);
  if (margin && margin !== "0px" && margin !== "0") Object.assign(map, sides("margin", margin));
  put(map, "width", str(p.width) || "100%");
  put(map, "height", str(p.height), ["auto"]);
  put(map, "minWidth", str(p.minWidth));
  put(map, "minHeight", str(p.minHeight));
  put(map, "maxWidth", str(p.maxWidth));
  put(map, "maxHeight", str(p.maxHeight));
  put(map, "overflow", str(p.overflow), ["visible"]);
  put(map, "position", str(p.position) || "relative");
  if (typeof p.zIndex === "number") map.zIndex = String(p.zIndex);
  put(map, "backgroundColor", str(p.backgroundColor), ["transparent"]);
  border(map, p);
  const shadow = SHADOWS[str(p.boxShadow)];
  if (shadow) map.boxShadow = shadow;
  if (typeof p.opacity === "number" && p.opacity !== 1) map.opacity = String(p.opacity);
  put(map, "fontSize", str(p.fontSize));
  put(map, "fontWeight", str(p.fontWeight));
  put(map, "textAlign", str(p.textAlign));
  put(map, "color", str(p.textColor));
  return map;
}

function border(map: StyleMap, p: Props) {
  const style = str(p.borderStyle);
  if (typeof p.borderWidth === "number" && p.borderWidth > 0 && style && style !== "none") {
    map.borderWidth = `${p.borderWidth}px`;
    map.borderStyle = style;
    put(map, "borderColor", str(p.borderColor));
  }
  put(map, "borderRadius", str(p.borderRadius), ["0px", "0"]);
}

function box(type: "Box" | "GridBox", old: Item, pbStyle: PbStyle, content: Item[], idSuffix = ""): Item {
  return {
    type,
    props: {
      id: `${String(old.props.id)}${idSuffix}`,
      ...(old.props.locked && !idSuffix ? { locked: true } : {}),
      content,
      pbStyle,
    },
  };
}

/**
 * The old stylesheet made every child of a flex row share the width equally
 * and stack on phones. The new container says so in each child's design data.
 */
function asRowChild(item: Item): Item {
  const style = (item.props.pbStyle || {}) as PbStyle;
  if (style.base?.flex) {
    return { ...item, props: { ...item.props, pbStyle: { ...style, mobile: { flex: "0 0 auto", maxWidth: "100%", ...style.mobile } } } };
  }
  return {
    ...item,
    props: {
      ...item.props,
      pbStyle: {
        ...style,
        base: { flex: "1 1 0%", minWidth: "0", ...style.base },
        mobile: { flex: "0 0 auto", ...style.mobile },
      },
    },
  };
}

function flexLayout(p: Props): { base: StyleMap; row: boolean } {
  const direction = str(p.direction) || "row";
  return {
    row: direction.startsWith("row"),
    base: {
      display: "flex",
      flexDirection: direction,
      flexWrap: str(p.wrap) || "nowrap",
      justifyContent: str(p.justify) || "flex-start",
      alignItems: str(p.align) || "stretch",
      columnGap: px(p.gap, 16),
      rowGap: px(p.rowGap ?? p.gap, 16),
    },
  };
}

function convert(item: Item, children: Item[]): Item {
  const p = item.props;

  if (item.type === "FlexBlock") {
    const { base, row } = flexLayout(p);
    return box(
      "Box",
      item,
      { tag: "section", base: { ...frame(p, 24), ...base }, ...(row ? { mobile: { flexDirection: "column" } } : {}) },
      row ? children.map(asRowChild) : children,
    );
  }

  if (item.type === "GridBlock") {
    const columns = Math.min(6, Math.max(1, Number(p.columns) || 3));
    return box(
      "GridBox",
      item,
      {
        tag: "section",
        base: {
          ...frame(p, 32),
          display: "grid",
          gridTemplateColumns: str(p.templateColumns) || `repeat(${columns}, minmax(0, 1fr))`,
          columnGap: px(p.gap, 16),
          rowGap: px(p.rowGap ?? p.gap, 16),
          alignItems: str(p.align) || "stretch",
          justifyItems: str(p.justifyItems) || "stretch",
        },
      },
      children,
    );
  }

  if (item.type === "ContainerBlock") {
    // The old block was a full-width band with a centered 1280px area inside.
    const isGrid = str(p.display) === "grid";
    const columns = Math.min(6, Math.max(1, Number(p.columns) || 1));
    const flex = flexLayout({ ...p, rowGap: p.gap });
    const row = !isGrid && flex.row;
    const layout: StyleMap = isGrid
      ? {
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: px(p.gap, 16),
          alignItems: str(p.align) || "stretch",
        }
      : flex.base;
    const inner = box(
      isGrid ? "GridBox" : "Box",
      item,
      {
        base: { maxWidth: "1280px", marginLeft: "auto", marginRight: "auto", paddingLeft: "32px", paddingRight: "32px", ...layout },
        tablet: { paddingLeft: "24px", paddingRight: "24px" },
        mobile: { paddingLeft: "16px", paddingRight: "16px", ...(row ? { flexDirection: "column" } : {}) },
      },
      row ? children.map(asRowChild) : children,
      "-inner",
    );
    const band: StyleMap = { width: "100%", ...sides("padding", `${px(p.paddingY, 40)} ${px(p.paddingX, 24)}`) };
    put(band, "backgroundColor", str(p.backgroundColor), ["transparent"]);
    return box("Box", item, { tag: "section", base: { display: "block", ...band } }, [inner]);
  }

  // ColumnBlock
  const base: StyleMap = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minWidth: "0",
    minHeight: str(p.minHeight) || "120px",
    ...sides("padding", `${px(p.paddingY, 16)} ${px(p.paddingX, 16)}`),
  };
  const ratio = str(p.flexRatio) || "1";
  if (/^\d+$/.test(ratio)) base.flex = `${ratio} 1 0%`;
  else if (/^\d+%$/.test(ratio)) {
    const pct = ratio === "33%" ? "33.333%" : ratio === "67%" ? "66.666%" : ratio;
    base.flex = `0 0 ${pct}`;
    base.maxWidth = pct;
  }
  const width = str(p.columnWidth);
  if (width && width !== "auto") base.width = width;
  put(base, "backgroundColor", str(p.backgroundColor), ["transparent"]);
  border(base, p);
  return box("Box", item, { base }, children);
}

function walk(item: Item): Item {
  const props: Props = {};
  for (const [key, value] of Object.entries(item.props)) {
    props[key] = isItemList(value) ? value.map(walk) : value;
  }
  const next = { ...item, props };
  if (!LEGACY.has(item.type) || mustStayLegacy(props)) return next;
  const children = Array.isArray(props.children) ? (props.children as Item[]).filter(isItem) : [];
  return convert(next, children);
}

function hasLegacy(list: unknown): boolean {
  if (!Array.isArray(list)) return false;
  return list.some(
    (item) => isItem(item) && (LEGACY.has(item.type) || Object.values(item.props).some((value) => hasLegacy(value))),
  );
}

/** Returns `data` itself when there is nothing to convert. */
export function migrateLegacyLayout<D extends Data>(data: D): D {
  if (!data || !hasLegacy(data.content)) return data;
  return { ...data, content: (data.content as unknown as Item[]).map(walk) as unknown as ComponentData[] } as D;
}
