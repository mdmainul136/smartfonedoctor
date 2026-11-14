import { createElement, type ComponentType, type ReactNode } from "react";
import { FieldTab, type Config } from "@puckeditor/core";
import { compileStyle, isEmptyStyle, styleClass } from "./compile";
import { MotionRuntime } from "./motion";
import { StylePanel } from "./StylePanel";
import type { PbStyle } from "./types";

type AnyProps = Record<string, unknown> & { id: string; pbStyle?: PbStyle; puck?: { isEditing?: boolean } };
type AnyComponent = {
  label?: string;
  fields?: Record<string, unknown>;
  defaultProps?: Record<string, unknown>;
  render: ComponentType<AnyProps>;
  renderFields?: (params: { fields: Record<string, ReactNode> }) => ReactNode;
  /** The widget applies `pbStyle` to its own element (containers do). */
  pbSelf?: boolean;
};

export const STYLE_FIELD = "pbStyle";

const styleField = {
  type: "custom",
  label: "Design",
  render: ({ value, onChange }: { value?: PbStyle; onChange: (v: PbStyle) => void }) => (
    <StylePanel value={value} onChange={onChange} />
  ),
};

const cx = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");

/** Marks an element for MotionRuntime on the published page. */
function motionAttrs(style: PbStyle, editing?: boolean) {
  if (editing || !style.motion?.enter) return {};
  return { "data-pb-motion": style.motion.repeat ? "repeat" : "once" };
}

function StyleTag({ css }: { css: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

/** Wraps a widget in its styled element. Widgets with no design data are left exactly as they were. */
function Styled({ id, pbStyle, editing, children }: { id: string; pbStyle?: PbStyle; editing?: boolean; children: ReactNode }) {
  if (isEmptyStyle(pbStyle)) return <>{children}</>;
  const style = pbStyle as PbStyle;
  return (
    <>
      <StyleTag css={compileStyle(id, style, { editing, wrapper: true })} />
      {createElement(
        style.tag || "div",
        { id: style.cssId, className: cx(styleClass(id), style.className), ...motionAttrs(style, editing) },
        children,
      )}
      {!editing && style.motion?.enter && <MotionRuntime />}
    </>
  );
}

/**
 * Container whose own element is the auto-layout box: its children are the
 * direct flex / grid items, like a Figma frame.
 */
const Box: AnyComponent = {
  label: "Container",
  pbSelf: true,
  fields: { content: { type: "slot" } },
  defaultProps: {
    content: [],
    pbStyle: {
      base: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        paddingTop: "24px",
        paddingRight: "24px",
        paddingBottom: "24px",
        paddingLeft: "24px",
      },
    } satisfies PbStyle,
  },
  render: ({ id, pbStyle, puck, content }) => {
    const style = pbStyle || {};
    const Slot = content as ComponentType<Record<string, unknown>>;
    return (
      <>
        <StyleTag css={compileStyle(id, style, { editing: puck?.isEditing })} />
        <Slot
          as={style.tag || "div"}
          id={style.cssId}
          className={cx(styleClass(id), style.className)}
          minEmptyHeight={96}
          {...motionAttrs(style, puck?.isEditing)}
        />
        {!puck?.isEditing && style.motion?.enter && <MotionRuntime />}
      </>
    );
  },
};

/** The same container, starting as a three-column grid. */
const GridBox: AnyComponent = {
  ...Box,
  label: "Grid",
  defaultProps: {
    content: [],
    pbStyle: {
      base: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "16px",
        paddingTop: "24px",
        paddingRight: "24px",
        paddingBottom: "24px",
        paddingLeft: "24px",
      },
      mobile: { gridTemplateColumns: "repeat(1, minmax(0, 1fr))" },
    } satisfies PbStyle,
  },
};

const cache = new WeakMap<object, object>();

/**
 * Adds the Design tab (and the CSS it generates) to every widget in `config`,
 * plus the auto-layout Container. Use the result for both the editor and the
 * published page so they render the same.
 */
export function withStyleEngine<C extends Config>(config: C): C {
  const cached = cache.get(config);
  if (cached) return cached as C;

  const components: Record<string, AnyComponent> = {};
  const source = { ...(config.components as unknown as Record<string, AnyComponent>), Box, GridBox };

  for (const [type, c] of Object.entries(source)) {
    const Original = c.render;
    const ownTabs = c.renderFields;
    components[type] = {
      ...c,
      fields: { ...(c.fields || {}), [STYLE_FIELD]: styleField },
      render: c.pbSelf
        ? Original
        : (props: AnyProps) => (
            <Styled id={props.id} pbStyle={props.pbStyle} editing={props.puck?.isEditing}>
              <Original {...props} />
            </Styled>
          ),
      // Widgets with hand-built tabs get Design appended; the rest get it from withAutoTabs.
      renderFields: ownTabs
        ? (params) => (
            <>
              {ownTabs(params)}
              <FieldTab label="Design">{params.fields[STYLE_FIELD]}</FieldTab>
            </>
          )
        : undefined,
    };
  }

  // The widget list offers only the two new containers. The older layout
  // blocks stay registered (existing pages use them) but are not offered.
  type Category = { title?: string; components?: string[]; visible?: boolean };
  const categories: Record<string, Category> = {
    ...((config as { categories?: Record<string, Category> }).categories || {}),
  };
  if (categories.layout?.components) {
    const legacy = categories.layout.components.filter((name) => name !== "Box" && name !== "GridBox");
    categories.layout = { ...categories.layout, title: "Layout", components: ["Box", "GridBox"] };
    categories.legacyLayout = { title: "Older layout blocks", components: legacy, visible: false };
  }

  const next = { ...config, components, categories } as unknown as C;
  cache.set(config, next);
  cache.set(next, next);
  return next;
}
