/**
 * Page builder: a standalone product built on Puck.
 *
 * The host app talks to it through this file only:
 * - <BuilderEditor> for the admin editor, with `storage` and `kit`
 * - setBuilderHost() for links, media library, AI settings and app widgets
 * - BuilderStorage to keep drafts, revisions and templates (browser now, database later)
 */

import "./styles/puck-bundle.css";

export { puckConfig } from "./config";
export { default as BuilderEditor, type BuilderEditorProps, type BuilderPanel } from "./editor/BuilderEditor";
export { withAutoTabs, classifyField } from "./core/autoTabs";
export { cloneWithNewIds } from "./core/tree";
export {
  setBuilderHost,
  getBuilderHost,
  BuilderLink,
  type BuilderHost,
  type HostWidgets,
  type MediaPickerProps,
} from "./host";
export {
  createLocalStorageBuilderStorage,
  type BuilderStorage,
  type BuilderDraft,
  type BuilderRevision,
  type BuilderTemplate,
} from "./storage";
export { DEFAULT_KIT, type BuilderKit, type KitColor } from "./kit";
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
export type * from "./types";
