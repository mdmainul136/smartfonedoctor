import type React from "react";
import { forwardRef, type ComponentType, type ElementType, type ReactNode } from "react";
import { FIELD_KINDS } from "./generated/fieldKinds";

/**
 * Renders saved page-builder data on the public site without loading the
 * editor. Mirrors Puck's own server Render (@puckeditor/core, ServerRender +
 * SlotRender): same props, same slot wrapper elements, same `puck` prop.
 */

type Item = { type: string; props: Record<string, unknown> & { id: string } };
export type RenderData = {
  root?: { props?: Record<string, unknown> } & Record<string, unknown>;
  content?: Item[];
  zones?: Record<string, Item[]>;
};
type AnyComponent = ComponentType<Record<string, unknown>>;
export type RenderConfig = {
  components: Record<string, { render: unknown }>;
  root?: { render?: unknown };
};

// Props a slot consumes itself (Puck's getDropZoneProps); the rest go to its element.
const CONSUMED = new Set([
  "zone", "allow", "disallow", "style", "minEmptyHeight", "className", "collisionAxis",
  "ref", "as", "content", "config", "metadata", "fieldTransforms",
]);
const NOT_FORWARDED = new Set(["children", "dangerouslySetInnerHTML"]);

type Ctx = { config: RenderConfig; metadata: Record<string, unknown> };

/** Turns slot and rich-text props into what the block's render expects. */
function renderProps(item: Item, ctx: Ctx, puck: Record<string, unknown>): Record<string, unknown> {
  const props: Record<string, unknown> = { ...item.props, puck };
  const kinds = FIELD_KINDS[item.type];
  if (!kinds) return props;
  for (const key of kinds.slots) {
    const content = (item.props[key] as Item[] | undefined) ?? [];
    props[key] = function Slot(dzProps: Record<string, unknown>) {
      return <SlotRender allow={[]} disallow={[]} {...dzProps} zone={key} content={content} ctx={ctx} />;
    };
  }
  for (const key of kinds.richtext) {
    const html = item.props[key];
    if (typeof html === "string") {
      props[key] = (
        <div>
          <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }
  }
  return props;
}

function SlotItem({ item, ctx }: { item: Item; ctx: Ctx }) {
  const Component = ctx.config.components[item.type]?.render as AnyComponent | undefined;
  if (!Component) return null;
  return <Component {...renderProps(item, ctx, { metadata: ctx.metadata })} />;
}

const SlotRender = forwardRef<HTMLElement, Record<string, unknown> & { content: Item[]; ctx: Ctx }>(function SlotRender(
  allProps,
  ref
) {
  const ctx = allProps.ctx as Ctx;
  const content = allProps.content as Item[];
  const forwardable: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(allProps)) {
    if (k === "ctx" || CONSUMED.has(k) || NOT_FORWARDED.has(k)) continue;
    forwardable[k] = v;
  }
  const El = ((allProps.as as ElementType) ?? "div") as ElementType;
  return (
    <El
      {...forwardable}
      className={allProps.className as string | undefined}
      style={allProps.style as React.CSSProperties | undefined}
      ref={ref}
    >
      {content.map((item) =>
        ctx.config.components[item.type] ? <SlotItem key={item.props.id} item={item} ctx={ctx} /> : null
      )}
    </El>
  );
});

function ZoneRender({ zone, areaId, data, ctx }: { zone: string; areaId?: string; data: RenderData; ctx: Ctx }) {
  const content = areaId && zone !== "default-zone" ? data.zones?.[`${areaId}:${zone}`] ?? [] : data.content ?? [];
  return (
    <>
      {content.map((item) => {
        const Component = ctx.config.components[item.type]?.render as AnyComponent | undefined;
        if (!Component) return null;
        const puck = {
          renderDropZone: ({ zone: z }: { zone: string }) => <ZoneRender zone={z} areaId={item.props.id} data={data} ctx={ctx} />,
          metadata: ctx.metadata,
          dragRef: null,
          isEditing: false,
        };
        return <Component key={item.props.id} {...renderProps(item, ctx, puck)} />;
      })}
    </>
  );
}

/** Drop-in for Puck's <Render config data /> on the public site. */
export function PuckRender({
  config,
  data,
  metadata = {},
}: {
  config: RenderConfig;
  data: RenderData;
  metadata?: Record<string, unknown>;
}): ReactNode {
  const ctx: Ctx = { config, metadata };
  const body = <ZoneRender zone="default-zone" data={data} ctx={ctx} />;
  const RootRender = config.root?.render as AnyComponent | undefined;
  if (!RootRender) return body;
  const rootProps = (data.root && "props" in data.root ? data.root.props : data.root) ?? {};
  return (
    <RootRender
      {...rootProps}
      puck={{ renderDropZone: ({ zone }: { zone: string }) => <ZoneRender zone={zone} data={data} ctx={ctx} />, isEditing: false, dragRef: null, metadata }}
      title={(rootProps as { title?: string }).title || ""}
      editMode={false}
      id="puck-root"
    >
      {body}
    </RootRender>
  );
}
