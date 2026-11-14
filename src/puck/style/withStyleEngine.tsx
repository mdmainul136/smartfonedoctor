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
  label: "Container (Auto layout)",
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
  const source = { ...(config.components as unknown as Record<string, AnyComponent>), Box };

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

  const categories = { ...((config as { categories?: Record<string, { components?: string[] }> }).categories || {}) };
  if (categories.layout?.components && !categories.layout.components.includes("Box")) {
    categories.layout = { ...categories.layout, components: ["Box", ...categories.layout.components] };
  }

  const next = { ...config, components, categories } as unknown as C;
  cache.set(config, next);
  cache.set(next, next);
  return next;
}
