// Saves a comparable snapshot (title, meta description, visible text, JSON-LD) of
// a list of URLs, to check a refactor didn't change what visitors or Google see.
//   node scripts/snapshot-pages.mjs <outFile.json> [baseUrl]
//   node scripts/snapshot-pages.mjs --diff <before.json> <after.json>
import { readFileSync, writeFileSync } from "node:fs";

const URLS = [
  "/repairs",
  "/repairs/smartphone/iphone-repair",
  "/repairs/tablet/ipad-repair",
  "/repairs/console/playstation-repair",
  "/repairs/smartphone/iphone-16-pro",
  "/repairs/smartphone/galaxy-s25",
  "/repairs/computer/macbook-pro",
  "/repairs/smartphone/iphone-16-pro/screen-repair",
  "/repairs/smartphone/galaxy-s25/battery-replacement",
  "/repairs/console/playstation-5/hdmi-port-replacement",
  "/repairs/smartphone/iphone-15/charging-port-repair",
  "/schedule-repair",
  "/schedule-repair?device=iphone-16-pro",
];

function extract(html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { title, desc, ld, text };
}

if (process.argv[2] === "--diff") {
  const a = JSON.parse(readFileSync(process.argv[3], "utf8"));
  const b = JSON.parse(readFileSync(process.argv[4], "utf8"));
  let diffs = 0;
  for (const url of Object.keys(a)) {
    const x = a[url], y = b[url];
    if (!y) { console.log(`MISSING ${url}`); diffs++; continue; }
    for (const k of ["status", "title", "desc"]) if (x[k] !== y[k]) { console.log(`${url} ${k}: "${x[k]}" -> "${y[k]}"`); diffs++; }
    if (JSON.stringify(x.ld) !== JSON.stringify(y.ld)) { console.log(`${url} JSON-LD differs`); diffs++; }
    if (x.text !== y.text) {
      const wa = x.text.split(" "), wb = y.text.split(" ");
      let i = 0; while (i < wa.length && wa[i] === wb[i]) i++;
      console.log(`${url} text differs near: "${wa.slice(Math.max(0, i - 5), i + 8).join(" ")}" vs "${wb.slice(Math.max(0, i - 5), i + 8).join(" ")}"`);
      diffs++;
    }
  }
  console.log(diffs ? `${diffs} difference(s)` : "IDENTICAL: all pages match");
  process.exit(0);
}

const out = process.argv[2];
const base = process.argv[3] || "http://localhost:3000";
// SNAP_URLS="/a,/b" snapshots those URLs instead of the default list.
const list = process.env.SNAP_URLS ? process.env.SNAP_URLS.split(",").filter(Boolean) : URLS;
const result = {};
for (const url of list) {
  let res;
  for (let i = 0; i < 3; i++) {
    res = await fetch(base + url);
    if (res.status === 200) break;
  }
  result[url] = { status: res.status, ...extract(await res.text()) };
  console.log(res.status, url, result[url].text.length, "chars");
}
writeFileSync(out, JSON.stringify(result, null, 1));
