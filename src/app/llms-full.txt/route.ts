import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
 * Comprehensive aggregated Markdown file containing full text of all core pages,
 * diagnostic repair guides, store locations, and FAQs in a single context window.
 */
export async function GET() {
  try {
    const [locations, blogPosts, cmsPages, faqs, settings] = await Promise.all([
      prisma.locations.findMany({ where: { is_active: true } }),
      prisma.blogPost.findMany({ include: { seo: true }, orderBy: { createdAt: "desc" } }),
      prisma.cmsPage.findMany({ where: { status: "Published" }, include: { seo: true } }),
      prisma.faqs.findMany({ orderBy: { order: "asc" } }),
      prisma.siteSeoSettings.findUnique({ where: { id: "global_seo_settings" } }),
    ]);

    const siteName = settings?.siteName || "SmartFoneDoctor";

    let md = `# ${siteName} - Complete Documentation & Knowledge Base (llms-full.txt)\n\n`;
    md += `> Comprehensive full-text aggregate of all services, repair procedures, store locations, and technical diagnostics.\n`;
    md += `> Generated dynamically from SmartFoneDoctor PostgreSQL database.\n\n`;

    // 1. Business & Locations
    md += `## 1. Store Locations in Philadelphia\n\n`;
    for (const loc of locations) {
      md += `### ${loc.name}\n`;
      md += `- Address: ${loc.address}\n`;
      md += `- Phone: ${loc.phone}\n`;
      md += `- Hours: ${loc.hours || "Mon–Sat 10:00 AM – 7:00 PM"}\n`;
      md += `- Rating: 4.9/5.0 (${loc.total_reviews ? Number(loc.total_reviews) : "500+"} Reviews)\n\n`;
    }

    // 2. Technical Repair Guides
    md += `## 2. Technical Repair Guides & Diagnostics\n\n`;
    for (const post of blogPosts) {
      md += `### ${post.title}\n\n`;
      if (post.excerpt) md += `> ${post.excerpt}\n\n`;
      md += `- Category: ${post.category}\n`;
      md += `- Author: ${post.author}\n\n`;
      md += stripHtml(post.content);
      md += `\n\n---\n\n`;
    }

    // 3. Core Pages Content
    md += `## 3. Core Repair Services & Pages\n\n`;
    for (const page of cmsPages) {
      if (page.path === "/" || !page.contentHtml) continue;
      md += `### ${page.name} (${page.path})\n\n`;
      if (page.heroHeadline) md += `**${page.heroHeadline}**\n\n`;
      if (page.heroSubtitle) md += `${page.heroSubtitle}\n\n`;
      if (page.contentHtml) md += stripHtml(page.contentHtml);
      md += `\n\n---\n\n`;
    }

    // 4. FAQs
    if (faqs.length > 0) {
      md += `## 4. Frequently Asked Questions\n\n`;
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
