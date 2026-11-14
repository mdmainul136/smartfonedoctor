/**
 * Standalone Puck Page Builder Module
 * Page builder module built on Puck. Styling relies on the host Tailwind build.
 * Editor entry: ./editor/BuilderEditor.
 */

import "./styles/puck-bundle.css";

export { puckConfig } from "./config";
export { ColumnBlock } from "./layout/ElementorColumn";
export {
  FLEX_PRESETS,
  GRID_PRESETS,
  createFlexPresetBlock,
  createGridPresetBlock,
  createColumnBlock,
  type FlexPreset,
  type GridPreset,
} from "./layout/elementorPresets";
export { cmsPageToPuckData } from "./migrateCmsPageToPuck";
export type * from "./types";
