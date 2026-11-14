import { compileMotion } from "./motion";
import { BREAKPOINTS, type PbStyle, type StyleMap } from "./types";

const kebab = (prop: string) => prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Keeps a value from closing its rule or opening a tag. */
const clean = (value: string) => value.replace(/[{}<>;]/g, "").trim();

/**
 * Properties that position an element inside its parent. In the editor Puck
 * wraps every widget in its own div, and that div is the real flex/grid item,
 * so these must go on Puck's wrapper there (see `editing` below).
 */
const OUTER_PROPS = new Set([
  "width",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "alignSelf",
  "justifySelf",
  "order",
  "gridColumn",
  "gridRow",
]);

function declarations(map: StyleMap | undefined, keep?: (prop: string) => boolean): string {
  if (!map) return "";
  return Object.entries(map)
    .filter(([prop, value]) => value !== "" && value != null && (!keep || keep(prop)))
    .map(([prop, value]) => `${kebab(prop)}:${clean(String(value))}`)
    .join(";");
}

function rule(selector: string, body: string, media?: number): string {
  if (!body) return "";
  const css = `${selector}{${body}}`;
  return media ? `@media (max-width:${media}px){${css}}` : css;
}

export function isEmptyStyle(style?: PbStyle | null): boolean {
  if (!style) return true;
  const hasRules = [style.base, style.tablet, style.mobile, style.hover].some(
    (map) => map && Object.values(map).some((v) => v !== "" && v != null),
  );
  return !hasRules && !style.motion?.enter && !style.tag && !style.cssId && !style.className;
}

export const styleClass = (id: string) => `pb-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

/**
 * Turns one element's design data into CSS.
 *
 * `editing`: inside the editor, layout-in-parent properties are written for
 * Puck's wrapper div so the canvas matches the published page.
 */
export function compileStyle(id: string, style: PbStyle | undefined, opts: { editing?: boolean } = {}): string {
  if (!style) return "";
  const self = `.${styleClass(id)}`;
  const out: string[] = [];
  const scopes: [StyleMap | undefined, number | undefined][] = [
    [style.base, undefined],
    [style.tablet, BREAKPOINTS.tablet],
    [style.mobile, BREAKPOINTS.mobile],
  ];

  for (const [map, media] of scopes) {
    if (!opts.editing) {
      out.push(rule(self, declarations(map), media));
      continue;
    }
    const outer = declarations(map, (p) => OUTER_PROPS.has(p));
    let inner = declarations(map, (p) => !OUTER_PROPS.has(p));
    // The wrapper now carries the width, so the element fills the wrapper.
    if (map?.width) inner = inner ? `${inner};width:100%` : "width:100%";
    out.push(rule(`[data-puck-component="${id}"]`, outer, media));
    out.push(rule(self, inner, media));
  }

  const hover = declarations(style.hover);
  if (hover) {
    if (!style.base?.transition) out.push(rule(self, "transition:all .2s ease"));
    out.push(rule(`${self}:hover`, hover));
  }
  out.push(compileMotion(self, id, style.motion, opts.editing));
  return out.filter(Boolean).join("\n");
}
