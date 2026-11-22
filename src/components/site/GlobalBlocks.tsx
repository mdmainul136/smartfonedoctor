"use client";

import { createContext, useContext, type ReactNode } from "react";
import { PuckRender, type RenderConfig, type RenderData } from "@/puck/render/PuckRender";
import { puckConfig as renderOnlyConfig } from "@/puck/render/generated/config.render";
import { withStyleRender } from "@/puck/style/styleRender";

/**
 * Global blocks: content edited once (Admin > Theme Builder > Global blocks) and
 * shown on every page that inserts the "Global block" widget. The site layout
 * loads the published ones on the server; the editor loads them for its canvas.
 */
export type GlobalBlockMap = Record<string, { name: string; content: unknown[] }>;

const GlobalBlocksContext = createContext<GlobalBlockMap>({});
const DepthContext = createContext(0);
const renderConfig = withStyleRender(renderOnlyConfig as unknown as RenderConfig);

export function GlobalBlocksProvider({ blocks, children }: { blocks: GlobalBlockMap; children: ReactNode }) {
  return <GlobalBlocksContext.Provider value={blocks}>{children}</GlobalBlocksContext.Provider>;
}

/** Renders one global block by its id (slug). Nested global blocks are capped to avoid loops. */
export function GlobalBlockView({ id }: { id?: string }) {
  const blocks = useContext(GlobalBlocksContext);
  const depth = useContext(DepthContext);
  if (!id) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Pick a global block in the panel.
      </div>
    );
  }
  const block = blocks[id];
  if (!block || depth >= 2) return null;
  return (
    <DepthContext.Provider value={depth + 1}>
      <PuckRender config={renderConfig} data={{ content: block.content } as RenderData} />
    </DepthContext.Provider>
  );
}

// Options for the widget's picker, set by the editor once global blocks are loaded.
let options: { label: string; value: string }[] = [];
export function setGlobalBlockOptions(next: { label: string; value: string }[]) {
  options = next;
}
export function getGlobalBlockOptions() {
  return options;
}
