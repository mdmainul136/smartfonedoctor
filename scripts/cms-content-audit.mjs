// Read-only content audit of every CMS page's builder data.
// Flags wrong phone numbers, old brand spellings, warranty claims, internal
// links that 404, and images that fail to load. Needs the dev server for links.
//   node scripts/cms-content-audit.mjs [baseUrl]
import { PrismaClient } from "@prisma/client";

const BASE = process.argv[2] || "http://localhost:3000";
const PHONE_OK = /215[^0-9]{0,3}598[^0-9]{0,3}2090/;
const prisma = new PrismaClient();

/** Every string inside a JSON value, with its key path. */
function* strings(value, path = "") {
  if (typeof value === "string") yield [path, value];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* strings(value[i], `${path}[${i}]`);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) yield* strings(v, path ? `${path}.${k}` : k);
}

const linkCache = new Map();
async function status(url) {
  if (linkCache.has(url)) return linkCache.get(url);
  let code;
  try {
    const res = await fetch(url, { method: "GET", redirect: "manual" });
    code = res.status;
  } catch {
    code = "ERR";
  }
  linkCache.set(url, code);
  return code;
}

try {
  const pages = await prisma.cmsPage.findMany({ orderBy: { path: "asc" } });
  for (const page of pages) {
    const issues = [];
    const data = { puckData: page.puckData, title: page.title, metaDesc: page.metaDesc };
    for (const [path, text] of strings(data)) {
      if (/lifetime/i.test(text)) issues.push(`warranty  ${path}: "${text.slice(0, 80)}"`);
      if (/smart\s+fone\s*doctor|smartfone\s+doctor|smart\s+fonedoctor/i.test(text))
        issues.push(`brand     ${path}: "${text.slice(0, 80)}"`);
      for (const m of text.matchAll(/\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g))
        if (!PHONE_OK.test(m[0])) issues.push(`phone     ${path}: ${m[0]}`);
      if (/#c8102e|#009691|#C55221/i.test(text)) issues.push(`color     ${path}: ${text}`);
      // Internal links / images
      if (/^\/[a-z0-9]/i.test(text) && !/\s/.test(text) && text.length < 200) {
        const code = await status(BASE + text.split("#")[0]);
        if (code === 404 || code === "ERR" || code >= 500) issues.push(`link ${code}  ${path}: ${text}`);
      }
      if (/^https?:\/\/\S+\.(jpe?g|png|webp|avif)|images\.unsplash\.com/i.test(text)) {
        const code = await status(text);
        if (code !== 200) issues.push(`image ${code} ${path}: ${text.slice(0, 90)}`);
      }
    }
    const blocks = page.puckData?.content?.length ?? 0;
    console.log(`\n${page.path}  [${page.slug}]  blocks=${blocks}  issues=${issues.length}`);
    for (const i of issues) console.log("   " + i);
  }
} finally {
  await prisma.$disconnect();
}
