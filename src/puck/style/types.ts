/**
 * Design data for one element. This JSON is the source of truth; CSS is always
 * generated from it (see compile.ts), never edited by hand.
 *
 * Each map holds plain CSS declarations in camelCase ({ paddingTop: "24px" }),
 * so any CSS property can be stored without changing the schema.
 */
export type StyleMap = Record<string, string>;

export type PbStyle = {
  /** HTML element to render (div, section, article ...). */
  tag?: string;
  cssId?: string;
  className?: string;
  /** Desktop and up; tablet and mobile override it. */
  base?: StyleMap;
  tablet?: StyleMap;
  mobile?: StyleMap;
  /** Applied on mouse hover. */
  hover?: StyleMap;
};

export type StyleScope = "base" | "tablet" | "mobile" | "hover";

/** max-width media queries, in px. */
export const BREAKPOINTS = { tablet: 1024, mobile: 767 } as const;

export const HTML_TAGS = [
  "div",
  "section",
  "article",
  "header",
  "footer",
  "main",
  "nav",
  "aside",
  "figure",
  "span",
] as const;
