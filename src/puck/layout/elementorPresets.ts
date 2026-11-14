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

/**
 * Generates an Elementor Flexbox Container block populated with ColumnBlock children
 */
export function createFlexPresetBlock(preset: FlexPreset): ComponentData {
  const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let children: ComponentData[] = [];

  if (preset.cols === 1 && (preset.id === "col-down" || preset.id === "row-right")) {
    children = [createColumnBlock(uid, 0, "1", "100")];
  } else if (preset.ratios && preset.ratios.length > 0) {
    children = preset.ratios.map((ratio, i) =>
      createColumnBlock(uid, i, ratio, preset.colRatios?.[i] || "")
    );
  } else {
    children = Array.from({ length: Math.max(1, preset.cols) }, (_, i) =>
      createColumnBlock(uid, i, "1", "")
    );
  }

  return {
    type: "FlexBlock",
    props: {
      id: `FlexBlock-${uid}`,
      label: `Flexbox (${preset.label})`,
      displayLayout: "flex",
      direction: preset.direction || "row",
      wrap: preset.cols > 4 ? "wrap" : "nowrap",
      justify: "flex-start",
      align: "stretch",
      gap: 16,
      rowGap: 16,
      paddingY: 32,
      paddingX: 24,
      width: "100%",
      maxWidth: "1280px",
      margin: "0 auto",
      backgroundColor: "transparent",
      customCss: "",
      children,
    },
  };
}

/**
 * Generates an Elementor Grid Container block populated with ColumnBlock children
 */
export function createGridPresetBlock(preset: GridPreset): ComponentData {
  const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const totalCells =
    preset.type === "grid3x2" ? 6 : preset.type === "grid2x2" ? 4 : preset.columns;

  const children = Array.from({ length: Math.max(1, totalCells) }, (_, i) =>
    createColumnBlock(uid, i, "1", "")
  );

  return {
    type: "GridBlock",
    props: {
      id: `GridBlock-${uid}`,
      label: `Grid (${preset.label})`,
      columns: preset.columns,
      templateColumns: preset.templateColumns || `repeat(${preset.columns}, minmax(0, 1fr))`,
      gap: 16,
      rowGap: 16,
      align: "stretch",
      justifyItems: "stretch",
      paddingY: 32,
      paddingX: 24,
      width: "100%",
      maxWidth: "1280px",
      margin: "0 auto",
      backgroundColor: "transparent",
      customCss: "",
      children,
    },
  };
}
