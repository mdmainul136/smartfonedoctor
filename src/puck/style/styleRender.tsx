import { createElement, type ComponentType, type ReactNode } from "react";
import { compileStyle, isEmptyStyle, styleClass } from "./compile";
import { MotionRuntime } from "./motion";
import type { PbStyle } from "./types";

// Render half of the style engine: no editor code, so the public site can use it.
// The editor's withStyleEngine adds the Design panel on top of the same render.

export type AnyProps = Record<string, unknown> & { id: string; pbStyle?: PbStyle; puck?: { isEditing?: boolean } };

export const cx = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(" ");

/** Marks an element for MotionRuntime on the published page. */
export function motionAttrs(style: PbStyle, editing?: boolean) {
  if (editing || !style.motion?.enter) return {};
  return { "data-pb-motion": style.motion.repeat ? "repeat" : "once" };
}

function StyleTag({ css }: { css: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

/** Wraps a widget in its styled element. Widgets with no design data are left exactly as they were. */
export function Styled({ id, pbStyle, editing, children }: { id: string; pbStyle?: PbStyle; editing?: boolean; children: ReactNode }) {
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
 * Render of the auto-layout Container (and Grid): its own element is the box,
 * its children are the direct flex / grid items.
 */
export function BoxRender({ id, pbStyle, puck, content }: AnyProps) {
  const style = (pbStyle as PbStyle | undefined) || {};
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
}

/** Wraps a widget's render so its Design styles apply (containers style themselves). */
export function styledRender(Original: ComponentType<AnyProps>, pbSelf?: boolean): ComponentType<AnyProps> {
  if (pbSelf) return Original;
  return function StyledWidget(props: AnyProps) {
    return (
      <Styled id={props.id} pbStyle={props.pbStyle} editing={props.puck?.isEditing}>
        <Original {...props} />
      </Styled>
    );
  };
}

type RenderComponent = { render: ComponentType<AnyProps>; pbSelf?: boolean };
const cache = new WeakMap<object, object>();

/**
 * Public-site version of withStyleEngine: same render output, no editor fields.
 * Takes a render-only config (components with `render`).
 */
export function withStyleRender<C extends { components: Record<string, unknown> }>(config: C): C {
  const cached = cache.get(config);
  if (cached) return cached as C;
  const source = {
    ...(config.components as Record<string, RenderComponent>),
    Box: { render: BoxRender, pbSelf: true },
    GridBox: { render: BoxRender, pbSelf: true },
  };
  const components: Record<string, RenderComponent> = {};
  for (const [type, c] of Object.entries(source)) components[type] = { ...c, render: styledRender(c.render, c.pbSelf) };
  const next = { ...config, components } as C;
  cache.set(config, next);
  return next;
}
