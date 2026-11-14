import type { ComponentData } from "@puckeditor/core";

/** Deep copy of a block (and the blocks in its slots) with fresh ids, ready to insert again. */
export function cloneWithNewIds(node: ComponentData): ComponentData {
  const uid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const nextProps: ComponentData["props"] = {
    ...(node.props || {}),
    id: `${node.type}-${uid}`,
  };

  for (const [key, val] of Object.entries(nextProps)) {
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null && "type" in val[0]) {
      nextProps[key] = (val as ComponentData[]).map(cloneWithNewIds);
    }
  }

  return {
    ...node,
    props: nextProps,
  };
}
