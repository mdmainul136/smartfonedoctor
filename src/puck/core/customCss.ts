/**
 * SmartFone Doctor CMS Custom CSS Scoping Engine
 * Sandboxes arbitrary user CSS to a specific section target (#sfd-section-${sectionId})
 * preventing any style leakage across the admin interface or neighboring sections.
 */

export interface CustomCssSnippet {
  name: string;
  label: string;
  snippet: string;
}

export const CSS_SNIPPETS: CustomCssSnippet[] = [
  {
    name: "Glassmorphism",
    label: "+ Glassmorphism",
    snippet: `selector {
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px 0 rgba(0, 150, 145, 0.08);
}`,
  },
  {
    name: "Hover Lift",
    label: "+ Hover Lift",
    snippet: `selector div[class*="group"]:hover,
selector div[class*="border"]:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 28px -6px rgba(0, 150, 145, 0.18);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}`,
  },
  {
    name: "Accent Border",
    label: "+ Accent Border",
    snippet: `selector {
  border-top: 4px solid #009691;
  box-shadow: 0 10px 25px -5px rgba(0, 150, 145, 0.12);
}`,
  },
  {
    name: "Glow Effect",
    label: "+ Glow",
    snippet: `selector {
  box-shadow: 0 0 35px rgba(0, 150, 145, 0.25);
  border: 1px solid rgba(0, 150, 145, 0.4);
}`,
  },
];

/**
 * Validates raw CSS input for common syntax issues and prohibited scripts.
 */
export function validateCustomCss(rawCss: string): { isValid: boolean; message?: string } {
  if (!rawCss || !rawCss.trim()) {
    return { isValid: true };
  }

  // Security checks: prohibit script tags and javascript execution
  if (/<script/i.test(rawCss) || /<\/script>/i.test(rawCss)) {
    return { isValid: false, message: "Script tags are prohibited in custom CSS." };
  }
  if (/javascript\s*:/i.test(rawCss)) {
    return { isValid: false, message: "javascript: URLs are prohibited in custom CSS." };
  }
  if (/expression\s*\(/i.test(rawCss)) {
    return { isValid: false, message: "CSS expressions are prohibited." };
  }

  // Brace balance verification
  let balance = 0;
  for (let i = 0; i < rawCss.length; i++) {
    const ch = rawCss[i];
    if (ch === "{") balance++;
    if (ch === "}") balance--;
    if (balance < 0) {
      return { isValid: false, message: "Unexpected closing '}' without matching '{'." };
    }
  }

  if (balance > 0) {
    return { isValid: false, message: `Unclosed '{' (${balance} unclosed block${balance > 1 ? "s" : ""}).` };
  }

  return { isValid: true };
}

/**
 * Compiles and scopes custom CSS rules strictly to the section's DOM ID.
 * Supports:
 * - 'selector' keyword (e.g. `selector { ... }` or `selector .card { ... }`)
 * - '&' nesting prefix
 * - Bare selectors (e.g. `h2 { color: teal; }` becomes `#sfd-section-id h2 { ... }`)
 * - Bare declarations without braces (e.g. `border: 1px solid red;`)
 * - Multi-selector lists (e.g. `h2, h3 { ... }`)
 * - Media queries (@media (...) { ... })
 * - Keyframes protection (@keyframes name { 0% { ... } })
 */
export function scopeCustomCss(rawCss: string, sectionId: string): string {
  if (!rawCss || !rawCss.trim() || !sectionId) {
    return "";
  }

  const scopeId = `#sfd-section-${sectionId}`;

  // 1. Sanitize against script tags and dangerous execution
  let sanitized = rawCss
    .replace(/<\/?script[^>]*>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/<\/style>/gi, "<\\/style>");

  // 2. If the user provided bare declarations without any braces, wrap in section scope
  if (!sanitized.includes("{") && !sanitized.includes("}")) {
    const trimmed = sanitized.trim();
    if (trimmed) {
      return `${scopeId} {\n  ${trimmed}\n}`;
    }
    return "";
  }

  // 3. Replace 'selector' and '&' with the section's DOM selector
  sanitized = sanitized
    .replace(/\bselector\b/gi, scopeId)
    .replace(/(^|[^a-zA-Z0-9_-])&(?=[^a-zA-Z0-9_-]|$)/g, `$1${scopeId}`);

  // Helper to scope a list of selectors
  const scopeSelectors = (selectorsStr: string): string => {
    return selectorsStr
      .split(",")
      .map((sel) => {
        const s = sel.trim();
        if (!s) return "";
        // If this selector is an at-rule like @keyframes steps (0%, 100%, from, to), leave untouched
        if (/^(from|to|\d+%)$/.test(s)) return s;
        if (s.startsWith("@")) return s;

        // If it already starts with the scope ID
        if (s.startsWith(scopeId)) return s;

        // If it starts with a pseudo-class on the root element, e.g. :hover, ::before
        if (s.startsWith(":") || s.startsWith("[")) {
          return `${scopeId}${s}`;
        }

        // Standard descendant selector
        return `${scopeId} ${s}`;
      })
      .filter(Boolean)
      .join(", ");
  };

  // Helper to scope standard rules { declarations }
  const scopeRuleBlock = (block: string): string => {
    return block.replace(
      /([^{}]+)\s*\{([^}]+)\}/g,
      (match, rawSelectors: string, declarations: string) => {
        const trimmed = rawSelectors.trim();
        // Skip @keyframes or top-level at-rules
        if (trimmed.startsWith("@keyframes") || trimmed.startsWith("@font-face")) {
          return match;
        }

        const scoped = scopeSelectors(trimmed);
        return `${scoped} {\n${declarations}\n}`;
      }
    );
  };

  // 4. Handle nested @media or @supports queries
  const atRuleRegex = /@(media|supports)[^{]+\{([\s\S]+?\}\s*)\}/gi;
  let result = sanitized.replace(atRuleRegex, (atRuleMatch) => {
    const firstBrace = atRuleMatch.indexOf("{");
    const atRuleHeader = atRuleMatch.slice(0, firstBrace + 1);
    const atRuleBody = atRuleMatch.slice(firstBrace + 1, atRuleMatch.lastIndexOf("}"));
    return `${atRuleHeader}\n${scopeRuleBlock(atRuleBody)}\n}`;
  });

  // 5. Scope remaining standard rules outside media queries
  return scopeRuleBlock(result);
}

