import { compileStyle, isEmptyStyle } from "./compile";
import type { PbStyle } from "./types";

interface PuckNode {
  type?: string;
  props?: { id?: string; pbStyle?: PbStyle; [key: string]: unknown };
  [key: string]: unknown;
}

/**
 * Walk the full Puck content tree (including nested dropzones / slot props)
 * and compile every widget's pbStyle data into a single CSS string.
 *
 * This is called on Publish so the result can be stored in PostgreSQL and
 * delivered as a plain <style> tag in SSR HTML — zero FOUC, full Lighthouse.
 */
export function compilePageCss(content: unknown[]): string {
  const cssBlocks: string[] = [];

  function traverse(nodes: unknown[]): void {
    if (!Array.isArray(nodes)) return;

    for (const node of nodes as PuckNode[]) {
      if (!node || typeof node !== "object") continue;

      const props = (node.props ?? {}) as Record<string, unknown>;
      const id = typeof props.id === "string" ? props.id : undefined;
      const style = props.pbStyle as PbStyle | undefined;

      if (id && style && !isEmptyStyle(style)) {
        const css = compileStyle(id, style, { editing: false, wrapper: true });
        if (css) cssBlocks.push(css);
      }

      // Recurse into every prop value that looks like a dropzone array
      // (array of objects — these are nested widget lists in Puck slots)
      for (const val of Object.values(props)) {
        if (
          Array.isArray(val) &&
          val.length > 0 &&
          val.every((v) => v !== null && typeof v === "object")
        ) {
          traverse(val as unknown[]);
        }
      }
    }
  }

  traverse(content);
  return cssBlocks.join("\n");
}
