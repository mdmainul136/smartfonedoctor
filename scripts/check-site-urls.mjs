// Site URL health check (read-only).
//  1. Every URL in /sitemap.xml must answer 200 (no redirects, no 404s).
//  2. Every old/alias URL must redirect in ONE hop to a page that answers 200.
//   node scripts/check-site-urls.mjs [baseUrl]
import { PrismaClient } from "@prisma/client";

const BASE = process.argv[2] || "http://localhost:3000";
const SITE = "https://smartfonedoctor.com";

async function status(path) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(BASE + path, { redirect: "manual" });
      return { code: r.status, location: r.headers.get("location") };
    } catch {
      /* retry */
    }
  }
  return { code: "ERR", location: null };
}

const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "") || "/");
let bad = 0;
for (const u of urls) {
  const { code, location } = await status(u);
  if (code !== 200) {
    bad++;
    console.log(`SITEMAP ${code} ${u}${location ? " -> " + location : ""}`);
  }
}
console.log(`Sitemap: ${urls.length} URLs, ${bad} not 200`);

const prisma = new PrismaClient();
const rules = await prisma.urlRedirect.findMany({ where: { isActive: true } });
await prisma.$disconnect();
const OLD = [
  ...rules.map((r) => ({ from: r.sourceUrl, expect: r.statusCode })),
  { from: "/track" }, { from: "/locations" }, { from: "/repairs/iphone" }, { from: "/repairs/ipad" },
  { from: "/repairs/mac" }, { from: "/california-supply-chain-act" },
];
let badOld = 0;
for (const { from, expect } of OLD) {
  const first = await status(from);
  const target = first.location ? first.location.replace(BASE, "").replace(SITE, "") : null;
  const second = target ? await status(target) : null;
  const ok = [301, 302, 307, 308].includes(first.code) && second?.code === 200;
  const permanent = expect === 301 ? [301, 308].includes(first.code) : true;
  if (!ok || !permanent) badOld++;
  console.log(`${ok && permanent ? "ok  " : "BAD "} ${from} -> ${first.code} ${target ?? "-"} -> ${second?.code ?? "-"}${expect ? ` (rule ${expect})` : ""}`);
}
console.log(`Old URLs: ${OLD.length}, ${badOld} problem(s)`);
