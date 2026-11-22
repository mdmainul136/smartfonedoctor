// Generates the render-only page-builder config that the public site uses, so
// visitors don't download the editor (fields, panels, pickers, @puckeditor/core).
// Source of truth stays src/puck/config.tsx (+ the column block). Re-run after
// changing blocks:   npx tsx scripts/gen-puck-render-config.ts
// It strips editor-only properties (fields, renderFields, resolve*, defaultProps),
// then removes declarations and imports that became unused.
import ts from "typescript";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { puckConfig } from "../src/puck/config";
import { withStyleEngine } from "../src/puck/style";

const OUT_DIR = "src/puck/render/generated";
const STRIP = new Set(["fields", "renderFields", "resolveFields", "resolveData", "resolvePermissions", "defaultProps", "categories"]);

const SOURCES: { from: string; to: string; rewrite?: Record<string, string> }[] = [
  {
    from: "src/puck/layout/ElementorColumn.tsx",
    to: `${OUT_DIR}/column.render.tsx`,
  },
  {
    // The "General" widgets (Icon Box, Gallery, Before/After…).
    from: "src/puck/widgets/general.tsx",
    to: `${OUT_DIR}/general.render.tsx`,
  },
  {
    from: "src/puck/config.tsx",
    to: `${OUT_DIR}/config.render.tsx`,
    rewrite: { "@/puck/layout/ElementorColumn": "./column.render", "@/puck/widgets/general": "./general.render" },
  },
  {
    // The site's coded sections without their editor fields.
    from: "src/plugins/repair-shop/siteSections.tsx",
    to: `${OUT_DIR}/siteSections.render.tsx`,
  },
];

function absolutize(spec: string, fromFile: string): string {
  if (!spec.startsWith(".")) return spec;
  const abs = path.posix.join(path.posix.dirname(fromFile), spec);
  return "@/" + abs.replace(/^src\//, "");
}

function stripEditorProps(sf: ts.SourceFile): string {
  const transformer: ts.TransformerFactory<ts.SourceFile> = (ctx) => {
    const visit = (node: ts.Node): ts.Node => {
      if (ts.isObjectLiteralExpression(node)) {
        const kept = node.properties.filter((p) => {
          const name = p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : null;
          return !(name && STRIP.has(name));
        });
        return ts.visitEachChild(ts.factory.updateObjectLiteralExpression(node, kept), visit, ctx);
      }
      return ts.visitEachChild(node, visit, ctx);
    };
    return (root) => ts.visitNode(root, visit) as ts.SourceFile;
  };
  const result = ts.transform(sf, [transformer]);
  return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0]);
}

/** Drops non-exported top-level declarations that nothing references, until stable. */
function dropUnused(code: string): string {
  for (let pass = 0; pass < 20; pass++) {
    const sf = ts.createSourceFile("x.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let removed = false;
    const keep: string[] = [];
    for (const st of sf.statements) {
      const text = st.getFullText(sf);
      const exported = ts.canHaveModifiers(st) && ts.getModifiers(st)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      let names: string[] = [];
      if (!exported && ts.isVariableStatement(st)) names = st.declarationList.declarations.map((d) => (ts.isIdentifier(d.name) ? d.name.text : "")).filter(Boolean);
      if (!exported && (ts.isFunctionDeclaration(st) || ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) && st.name) names = [st.name.text];
      if (names.length) {
        const rest = code.replace(text, "");
        const used = names.some((n) => new RegExp(`\\b${n}\\b`).test(rest));
        if (!used) {
          removed = true;
          continue;
        }
      }
      keep.push(text);
    }
    code = keep.join("");
    if (!removed) break;
  }
  return code;
}

/** Removes import specifiers (and whole imports) whose names are unused. */
function dropUnusedImports(code: string): string {
  const sf = ts.createSourceFile("x.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let out = "";
  const body = sf.statements.filter((s) => !ts.isImportDeclaration(s)).map((s) => s.getFullText(sf)).join("");
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st)) continue;
    const spec = (st.moduleSpecifier as ts.StringLiteral).text;
    const clause = st.importClause;
    if (!clause) {
      out += st.getFullText(sf);
      continue;
    }
    const used = (n: string) => new RegExp(`\\b${n}\\b`).test(body);
    const def = clause.name && used(clause.name.text) ? clause.name.text : null;
    let named: string[] = [];
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      named = clause.namedBindings.elements
        .filter((e) => used(e.name.text))
        .map((e) => (e.isTypeOnly ? "type " : "") + (e.propertyName ? `${e.propertyName.text} as ${e.name.text}` : e.name.text));
    } else if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings) && used(clause.namedBindings.name.text)) {
      named = [`* as ${clause.namedBindings.name.text}`];
    }
    if (!def && !named.length) continue;
    // All names are types: a type-only import, so nothing is loaded at runtime.
    const allTypes = !def && named.length > 0 && named.every((n) => n.startsWith("type "));
    if (allTypes) named = named.map((n) => n.replace(/^type /, ""));
    const typeOnly = clause.isTypeOnly || allTypes ? "type " : "";
    const parts = [def, named.length ? (named[0].startsWith("*") ? named[0] : `{ ${named.join(", ")} }`) : null].filter(Boolean);
    out += `\nimport ${typeOnly}${parts.join(", ")} from "${spec}";`;
  }
  return out + "\n" + body;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const { from, to, rewrite } of SOURCES) {
  let src = readFileSync(from, "utf8").replace(/\r\n/g, "\n");
  // Absolute imports, so the file works from the generated folder.
  src = src.replace(/(from\s+["'])(\.[^"']+)(["'])/g, (_m, a, spec, b) => `${a}${absolutize(spec, from)}${b}`);
  for (const [k, v] of Object.entries(rewrite ?? {})) src = src.split(`"${k}"`).join(`"${v}"`);
  const sf = ts.createSourceFile(from, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let code = stripEditorProps(sf);
  code = dropUnused(code);
  code = dropUnusedImports(code);
  const header =
    `"use client";\n// GENERATED by scripts/gen-puck-render-config.ts from ${from}. Do not edit.\n` +
    `// Render-only: no editor fields, so the public site doesn't load the page-builder editor.\n` +
    `/* eslint-disable */\n// @ts-nocheck\n`;
  writeFileSync(to, header + code.replace(/^"use client";\s*/m, ""));
  console.log("wrote", to, code.split("\n").length, "lines");
}

// Which props are slots / rich text, per block (the renderer needs it; fields are stripped).
type F = { type?: string };
const full = withStyleEngine(puckConfig) as unknown as { components: Record<string, { fields?: Record<string, F> }> };
const kinds: Record<string, { slots: string[]; richtext: string[] }> = {};
for (const [name, c] of Object.entries(full.components)) {
  const slots = Object.entries(c.fields ?? {}).filter(([, f]) => f?.type === "slot").map(([k]) => k);
  const richtext = Object.entries(c.fields ?? {}).filter(([, f]) => f?.type === "richtext").map(([k]) => k);
  if (slots.length || richtext.length) kinds[name] = { slots, richtext };
}
writeFileSync(
  `${OUT_DIR}/fieldKinds.ts`,
  `// GENERATED by scripts/gen-puck-render-config.ts. Slot and rich-text props per block.\n` +
    `export const FIELD_KINDS: Record<string, { slots: string[]; richtext: string[] }> = ${JSON.stringify(kinds, null, 2)};\n`
);
console.log("wrote fieldKinds:", Object.keys(kinds).join(", "));
