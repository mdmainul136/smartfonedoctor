import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { getCommonIssues } from "@/lib/commonIssuesStore";
import { getGeoStoreByCode, getGeoStoreById, toNeighborhoodSlug } from "@/lib/geoPages";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "\n$1\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * /llms-full.txt Route Handler
 * Comprehensive aggregated Markdown file containing full text of store locations,
 * AEO ground-truth guardrails, GEO neighborhoods, full pSEO repair catalog & pricing matrix,
 * common hardware issue guides, technical blog posts, core pages, and FAQs.
 */
export async function GET() {
  try {
    const [
      locations,
      blogPosts,
      cmsPages,
      faqs,
      guardrails,
      neighborhoods,
      settings,
      catalog,
      commonIssues,
    ] = await Promise.all([
      prisma.locations.findMany({ where: { is_active: true }, orderBy: { id: "asc" } }),
      prisma.blogPost.findMany({ where: { status: "Published" }, include: { seo: true }, orderBy: { createdAt: "desc" } }),
      prisma.cmsPage.findMany({
        where: { status: "Published", NOT: [{ category: "Template" }, { category: "Global" }] },
        include: { seo: true },
      }),
      prisma.faqs.findMany({ orderBy: { order: "asc" } }),
      prisma.aeoBrandGuardrail.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.geoNeighborhood.findMany({ orderBy: { storeId: "asc" } }),
      prisma.siteSeoSettings.findUnique({ where: { id: "global_seo_settings" } }),
      getRepairCatalog(),
      getCommonIssues(),
    ]);

    const siteName = settings?.siteName || "SmartFoneDoctor";

    if (settings && settings.enableLlmsTxt === false) {
      return new NextResponse("LLMs-full.txt is disabled in SEO settings", { status: 404 });
    }

    let md = `# ${siteName} - Complete Documentation & Knowledge Base (llms-full.txt)\n\n`;
    md += `> Comprehensive full-text aggregate of all device repair services, pricing matrix, store locations, neighborhoods, common issues, and technical diagnostics.\n`;
    md += `> Generated dynamically from the SmartFoneDoctor PostgreSQL database.\n\n`;

    // 1. Business & Dedicated Store Locations
    md += `## 1. Store Locations in Philadelphia\n\n`;
    for (const loc of locations) {
      const geo = getGeoStoreByCode(loc.store_code);
      md += `### ${geo?.name || loc.name}\n`;
      if (geo) md += `- Dedicated Page: ${BASE_URL}/locations/${geo.slug}\n`;
      md += `- Address: ${loc.address}\n`;
      md += `- Phone: ${loc.phone}\n`;
      md += `- Hours: Mon–Sat: 10:00 AM – 7:00 PM | Sun: Closed\n`;
      if (geo) md += `- Transit: ${geo.transitNote}\n`;
      md += `- Google Maps: ${loc.google_maps_url || geo?.gmbUrl || ""}\n\n`;
    }

    // 2. Ground-Truth Brand Answers (AEO)
    if (guardrails.length > 0) {
      md += `## 2. Ground-Truth Brand Facts & Answer Capsules (AEO)\n\n`;
      for (const g of guardrails) {
        md += `- **${g.topic}**: ${g.canonicalAnswer}\n`;
      }
      md += `\n`;
    }

    // 3. Targeted Philadelphia Neighborhoods & Campuses (GEO)
    if (neighborhoods.length > 0) {
      md += `## 3. Philadelphia Neighborhoods & Campuses Served (GEO)\n\n`;
      for (const n of neighborhoods) {
        const nearest = getGeoStoreById(n.storeId);
        const areaUrl = `${BASE_URL}/locations/areas/${toNeighborhoodSlug(n.name)}`;
        md += `- **${n.name}** (${n.type} · ${n.radius} radius): ZIPs ${n.zipCodes.join(", ")}. Landmarks: ${n.keyLandmarks.join(", ")}. Nearest branch: ${nearest.shortName} (${nearest.streetAddress}). URL: ${areaUrl}\n`;
      }
      md += `\n`;
    }

    // 4. Complete Device & Repair Pricing Catalog (pSEO Matrix)
    md += `## 4. Complete Repair Catalog & Starting Prices\n\n`;
    md += `All repairs carry a 90-day parts and labor warranty. Walk-ins welcome without appointment; models released in 2024+ carry +$20 part adjustment.\n\n`;
    for (const category of ["smartphone", "tablet", "computer", "console"] as const) {
      const catIssues = catalog.issues.filter((i) => i.category === category);
      const catDevices = catalog.devices.filter((d) => d.category === category);
      md += `### Category: ${category.toUpperCase()} (${catDevices.length} models · ${catIssues.length} services)\n\n`;
      md += `**Services & Starting Prices:**\n`;
      for (const iss of catIssues) {
        md += `- ${iss.name} (\`${iss.slug}\`): From $${iss.basePrice} (OEM tier ~${iss.oemPriceMultiplier}x) · Turnaround: ${iss.turnaroundDisplay}\n`;
      }
      md += `\n**Supported Models:**\n`;
      for (const dev of catDevices) {
        md += `- [${dev.name}](${BASE_URL}/repairs/${dev.category}/${dev.slug}) (${dev.brand}, ${dev.releaseYear}): ${dev.specs}\n`;
      }
      md += `\n`;
    }

    // 5. Common Hardware Issues Guides
    if (commonIssues.length > 0) {
      md += `## 5. Common Hardware Issue Diagnostic Guides\n\n`;
      for (const ci of commonIssues) {
        md += `### ${ci.title} (${BASE_URL}/common-issues/${ci.category}/${ci.slug}.md)\n\n`;
        md += `> ${ci.leadText}\n\n`;
        for (const sec of ci.sections || []) {
          md += `#### ${sec.heading}\n`;
          for (const p of sec.paragraphs || []) md += `${p}\n\n`;
        }
      }
    }

    // 6. Technical Repair Guides (Blog)
    if (blogPosts.length > 0) {
      md += `## 6. Technical Repair Guides & Blog Articles\n\n`;
      for (const post of blogPosts) {
        md += `### ${post.title}\n\n`;
        if (post.excerpt) md += `> ${post.excerpt}\n\n`;
        md += `- Category: ${post.category}\n`;
        md += `- Author: ${post.author}\n\n`;
        md += stripHtml(post.content);
        md += `\n\n---\n\n`;
      }
    }

    // 7. Core CMS Pages
    md += `## 7. Core Pages Overview\n\n`;
    for (const page of cmsPages) {
      if (page.path === "/") continue;
      md += `### ${page.name} (${BASE_URL}${page.path})\n\n`;
      if (page.heroHeadline) md += `**${page.heroHeadline}**\n\n`;
      if (page.metaDesc) md += `${page.metaDesc}\n\n`;
      if (page.contentHtml) md += `${stripHtml(page.contentHtml)}\n\n`;
      md += `---\n\n`;
    }

    // 8. FAQs
    if (faqs.length > 0) {
      md += `## 8. Frequently Asked Questions\n\n`;
      for (const faq of faqs) {
        md += `#### Q: ${faq.question}\n`;
        md += `${faq.answer}\n\n`;
      }
    }

    return new NextResponse(md, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Link": `<${BASE_URL}/llms.txt>; rel="describedby"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate /llms-full.txt:", error);
    return new NextResponse("# Error generating llms-full.txt", { status: 500 });
  }
}
