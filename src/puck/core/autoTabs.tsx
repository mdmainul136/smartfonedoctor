import { Fragment, type ReactNode } from "react";
import { FieldTab, type Config, type Field } from "@puckeditor/core";

/**
 * Elementor-style Content / Style / Advanced tabs for every widget.
 *
 * Widgets that ship their own `renderFields` keep it. Every other widget gets
 * its fields sorted into the three tabs by name and type, so a widget author
 * (or a host registering a plugin widget) gets the tabbed panel for free.
 */

export type FieldTabId = "content" | "style" | "advanced" | "design";

const ADVANCED_FIELDS = new Set([
  "customCss",
  "responsive",
  "visibility",
  "locked",
  "anchorId",
  "cssId",
  "cssClass",
  "className",
]);

/** Field types that always hold what the widget says, never how it looks. */
const CONTENT_TYPES = new Set(["array", "textarea", "richtext", "external", "object", "slot"]);

const STYLE_NAME =
  /(color|colour|bg|background|padding|margin|spacing|align|radius|rounded|shadow|size|width|height|gap|font|border|variant|theme|opacity|overlay|style|columns?$|cols$)/i;

export function classifyField(name: string, field?: Field): FieldTabId {
  // The style engine's panel (src/puck/style) always gets its own tab.
  if (name === "pbStyle") return "design";
  if (ADVANCED_FIELDS.has(name)) return "advanced";
  if (field && CONTENT_TYPES.has(field.type)) return "content";
  if (STYLE_NAME.test(name)) return "style";
  return "content";
}

const TAB_LABELS: Record<FieldTabId, string> = {
  content: "Content",
  style: "Style",
  advanced: "Advanced",
  design: "Design",
};

const TAB_ORDER: FieldTabId[] = ["content", "style", "advanced", "design"];

function buildRenderFields(fieldDefs: Record<string, Field>) {
  const groups: Record<FieldTabId, string[]> = { content: [], style: [], advanced: [], design: [] };
  for (const [name, def] of Object.entries(fieldDefs)) {
    groups[classifyField(name, def)].push(name);
  }
  const tabs = TAB_ORDER.filter((id) => groups[id].length > 0);

  // One tab only: no point in a tab strip.
  if (tabs.length < 2) return undefined;

  return function AutoTabbedFields({
    fields,
  }: {
    fields: Partial<Record<string, ReactNode>>;
  }) {
    // Fields added at runtime by a widget's resolveFields are not in fieldDefs:
    // place them by name, so they are never silently left out of the panel.
    const known = new Set(Object.keys(fieldDefs));
    const extra: Record<FieldTabId, string[]> = { content: [], style: [], advanced: [], design: [] };
    for (const name of Object.keys(fields)) {
      if (!known.has(name)) extra[classifyField(name)].push(name);
    }
    return (
      <>
        {tabs.map((id) => (
          <FieldTab key={id} label={TAB_LABELS[id]}>
            {[...groups[id], ...extra[id]].map((name) => (
              <Fragment key={name}>{fields[name]}</Fragment>
            ))}
          </FieldTab>
        ))}
      </>
    );
  };
}

/** Returns a copy of `config` where every widget has the tabbed settings panel. */
export function withAutoTabs<C extends Config>(config: C): C {
  const components: Record<string, unknown> = {};
  for (const [type, component] of Object.entries(config.components)) {
    const c = component as { renderFields?: unknown; fields?: Record<string, Field> };
    if (c.renderFields || !c.fields) {
      components[type] = component;
      continue;
    }
    const renderFields = buildRenderFields(c.fields);
    components[type] = renderFields ? { ...c, renderFields } : component;
  }
  return { ...config, components } as C;
}
