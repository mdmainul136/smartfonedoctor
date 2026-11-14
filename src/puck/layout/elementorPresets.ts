import type { ComponentData } from "@puckeditor/core";

export interface FlexPreset {
  id: string;
  label: string;
  cols: number;
  iconType: "arrow-down" | "arrow-right" | "bars" | "grid2x2" | "top1-btm2" | "left1-right2";
  bars?: number[];
  direction?: "row" | "column";
  ratios?: string[]; // CSS flex ratios (e.g. ["1", "2"] for 33/67)
  colRatios?: string[]; // e.g. ["33", "67"]
}

export interface GridPreset {
  id: string;
  label: string;
  columns: number;
  type?: "grid" | "grid2x2" | "grid3x2";
  templateColumns?: string;
}

export const FLEX_PRESETS: FlexPreset[] = [
  {
    id: "col-down",
    label: "Column ↓",
    cols: 1,
    direction: "column",
    iconType: "arrow-down",
  },
  {
    id: "row-right",
    label: "Row →",
    cols: 1,
    direction: "row",
    iconType: "arrow-right",
  },
  {
    id: "col-2",
    label: "2 Columns (50 / 50)",
    cols: 2,
    iconType: "bars",
    bars: [50, 50],
    ratios: ["1", "1"],
    colRatios: ["50", "50"],
  },
  {
    id: "col-3",
    label: "3 Columns (33 / 33 / 33)",
    cols: 3,
    iconType: "bars",
    bars: [33, 33, 33],
    ratios: ["1", "1", "1"],
    colRatios: ["33", "33", "33"],
  },
  {
    id: "col-4",
    label: "4 Columns (25 × 4)",
    cols: 4,
    iconType: "bars",
    bars: [25, 25, 25, 25],
    ratios: ["1", "1", "1", "1"],
    colRatios: ["25", "25", "25", "25"],
  },
  {
    id: "col-33-66",
    label: "2 Cols (33 / 67)",
    cols: 2,
    iconType: "bars",
    bars: [33, 67],
    ratios: ["1", "2"],
    colRatios: ["33", "67"],
  },
  {
    id: "col-66-33",
    label: "2 Cols (67 / 33)",
    cols: 2,
    iconType: "bars",
    bars: [67, 33],
    ratios: ["2", "1"],
    colRatios: ["67", "33"],
  },
  {
    id: "col-25-50-25",
    label: "3 Cols (25 / 50 / 25)",
    cols: 3,
    iconType: "bars",
    bars: [25, 50, 25],
    ratios: ["1", "2", "1"],
    colRatios: ["25", "50", "25"],
  },
  {
    id: "col-50-25-25",
    label: "3 Cols (50 / 25 / 25)",
    cols: 3,
    iconType: "bars",
    bars: [50, 25, 25],
    ratios: ["2", "1", "1"],
    colRatios: ["50", "25", "25"],
  },
  {
    id: "grid-2x2",
    label: "2x2 Quad Grid",
    cols: 4,
    iconType: "grid2x2",
  },
  {
    id: "top1-btm2",
    label: "1 Top + 2 Btm",
    cols: 3,
    iconType: "top1-btm2",
  },
  {
    id: "left1-right2",
    label: "1 Left + 2 Right",
    cols: 3,
    iconType: "left1-right2",
  },
];

export const GRID_PRESETS: GridPreset[] = [
  { id: "g-1", label: "1 Column", columns: 1 },
  { id: "g-2", label: "2 Columns", columns: 2 },
  { id: "g-3", label: "3 Columns", columns: 3 },
  { id: "g-4", label: "4 Columns", columns: 4 },
  {
    id: "g-2x2",
    label: "2×2 Grid (4 Cells)",
    columns: 2,
    type: "grid2x2",
  },
  {
    id: "g-3x2",
    label: "3×2 Grid (6 Cells)",
    columns: 3,
    type: "grid3x2",
  },
];

/**
 * Creates a dedicated ColumnBlock child with proper flex ratios and empty placeholder state
 */
export function createColumnBlock(
  uid: string,
  idx: number,
  flexRatio = "1",
  colRatio = ""
): ComponentData {
  return {
    type: "ColumnBlock",
    props: {
      id: `ColumnBlock-${uid}-col${idx + 1}`,
      label: `Column ${idx + 1}`,
      flexRatio: flexRatio,
      colRatio: colRatio,
      minHeight: "120px",
      paddingY: 16,
      paddingX: 16,
      backgroundColor: "transparent",
      borderWidth: 0,
      borderStyle: "none",
      borderColor: "#e2e8f0",
      borderRadius: "0px",
      customCss: "",
      children: [],
    },
  };
}

const newUid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const SECTION_FRAME = {
  width: "100%",
  maxWidth: "1280px",
  marginLeft: "auto",
  marginRight: "auto",
  gap: "16px",
  paddingTop: "32px",
  paddingRight: "24px",
  paddingBottom: "32px",
  paddingLeft: "24px",
};

/** An empty Container (see src/puck/style) that sits inside a section as one column or cell. */
function createCell(uid: string, idx: number, base: Record<string, string> = {}, mobile?: Record<string, string>): ComponentData {
  return {
    type: "Box",
    props: {
      id: `Box-${uid}-c${idx + 1}`,
      content: [],
      pbStyle: {
        base: { display: "flex", flexDirection: "column", gap: "12px", minHeight: "120px", minWidth: "0", ...base },
        ...(mobile ? { mobile } : {}),
      },
    },
  };
}

/**
 * Builds a section from a flex preset: a Container laid out as a row whose
 * columns are Containers sized by the preset's ratios. Stacks on mobile.
 */
export function createFlexPresetBlock(preset: FlexPreset): ComponentData {
  const uid = newUid();
  const section = (type: string, base: Record<string, string>, content: ComponentData[], mobile?: Record<string, string>) => ({
    type,
    props: {
      id: `${type}-${uid}`,
      content,
      pbStyle: { base: { ...SECTION_FRAME, ...base }, ...(mobile ? { mobile } : {}) },
    },
  });
  const oneColumn = { gridTemplateColumns: "repeat(1, minmax(0, 1fr))" };
  const twoColumns = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" };

  // A single empty container the user fills directly.
  if (preset.id === "col-down" || preset.id === "row-right") {
    return section("Box", { display: "flex", flexDirection: preset.direction || "row", minHeight: "120px" }, []);
  }
  if (preset.id === "grid-2x2") {
    return section("GridBox", twoColumns, [0, 1, 2, 3].map((i) => createCell(uid, i)), oneColumn);
  }
  if (preset.id === "top1-btm2" || preset.id === "left1-right2") {
    const wide: Record<string, string> = preset.id === "top1-btm2" ? { gridColumn: "span 2" } : { gridRow: "span 2" };
    const reset: Record<string, string> = preset.id === "top1-btm2" ? { gridColumn: "span 1" } : { gridRow: "span 1" };
    return section(
      "GridBox",
      twoColumns,
      [createCell(uid, 0, wide, reset), createCell(uid, 1), createCell(uid, 2)],
      oneColumn,
    );
  }

  const ratios = preset.ratios?.length ? preset.ratios : Array.from({ length: Math.max(1, preset.cols) }, () => "1");
  return section(
    "Box",
    { display: "flex", flexDirection: "row", alignItems: "stretch" },
    ratios.map((ratio, i) => createCell(uid, i, { flex: `${ratio} 1 0%` }, { flex: "0 0 auto" })),
    { flexDirection: "column" },
  );
}

/** Builds a section from a grid preset: a Grid with one empty Container per cell. One column on mobile. */
export function createGridPresetBlock(preset: GridPreset): ComponentData {
  const uid = newUid();
  const cells = preset.type === "grid3x2" ? 6 : preset.type === "grid2x2" ? 4 : preset.columns;
  return {
    type: "GridBox",
    props: {
      id: `GridBox-${uid}`,
      content: Array.from({ length: Math.max(1, cells) }, (_, i) => createCell(uid, i)),
      pbStyle: {
        base: {
          ...SECTION_FRAME,
          display: "grid",
          gridTemplateColumns: preset.templateColumns || `repeat(${preset.columns}, minmax(0, 1fr))`,
        },
        ...(preset.columns > 1 ? { mobile: { gridTemplateColumns: "repeat(1, minmax(0, 1fr))" } } : {}),
      },
    },
  };
}
