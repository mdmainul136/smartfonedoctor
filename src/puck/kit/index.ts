/**
 * Global kit: the brand colors (and later fonts) every widget's pickers offer
 * first, like Elementor's Global Colors. The host passes its kit to
 * BuilderEditor; the builder ships a neutral one.
 */

export type KitColor = { name: string; value: string };

export type BuilderKit = {
  colors: KitColor[];
};

/** Always offered after the kit's own colors. */
export const BASE_COLORS: KitColor[] = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Transparent", value: "transparent" },
];

export const DEFAULT_KIT: BuilderKit = {
  colors: [
    { name: "Primary", value: "#2563eb" },
    { name: "Dark", value: "#0f172a" },
    { name: "Text", value: "#111827" },
    { name: "Muted", value: "#6b7280" },
    { name: "Border", value: "#e5e7eb" },
    { name: "Light", value: "#f8fafc" },
  ],
};

let currentKit: BuilderKit = DEFAULT_KIT;

/** Called by BuilderEditor before the editor renders. */
export function setBuilderKit(kit: BuilderKit | undefined) {
  currentKit = kit || DEFAULT_KIT;
}

export function getBuilderKit(): BuilderKit {
  return currentKit;
}

/** Kit colors followed by the base colors, without duplicates. */
export function getKitSwatches(): KitColor[] {
  const seen = new Set<string>();
  return [...currentKit.colors, ...BASE_COLORS].filter((c) => {
    const key = c.value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
