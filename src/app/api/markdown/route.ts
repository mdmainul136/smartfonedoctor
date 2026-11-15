import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let rawPath = searchParams.get("path") || "";
    // Clean leading slashes and trailing .md
    rawPath = rawPath.replace(/^\/+/, "").replace(/\.md$/, "");

    let markdown = "";
    let pageTitle = "Document";

    // 1. Check if it is a blog article: blog/slug
    if (rawPath.startsWith("blog/")) {
      const slug = rawPath.replace(/^blog\//, "");
      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { seo: true },
      });

      if (post) {
        pageTitle = post.title;
        markdown += `# ${post.title}\n\n`;
        if (post.excerpt) markdown += `> ${post.excerpt}\n\n`;
        markdown += `- Category: ${post.category}\n`;
        markdown += `- Author: ${post.author}\n`;
        markdown += `- Last Updated: ${post.updatedAt.toISOString().split("T")[0]}\n`;
        if (post.seo?.focusKeyword) markdown += `- Focus Topic: ${post.seo.focusKeyword}\n`;
        markdown += `\n---\n\n`;
        markdown += stripHtml(post.content);
        markdown += `\n\n---\n`;
        markdown += `*To book professional bench service for this repair in Philadelphia, call (215) 598-2090 or visit ${BASE_URL}/schedule-repair.*\n`;
      }
    }

    // 2. Check if it is the locations page
    if (!markdown && (rawPath === "locations" || rawPath === "stores")) {
      const locations = await prisma.locations.findMany({ where: { is_active: true } });
      pageTitle = "Store Locations";
      markdown += `# SmartFoneDoctor Store Locations in Philadelphia\n\n`;
      markdown += `> 3 convenient repair shops across West Philadelphia and University City.\n\n`;
      for (const loc of locations) {
        markdown += `## ${loc.name}\n\n`;
        markdown += `- Address: ${loc.address}\n`;
        markdown += `- Neighborhood: ${loc.neighborhood || "Philadelphia, PA"}\n`;
        markdown += `- Telephone: ${loc.phone}\n`;
        markdown += `- Hours: ${loc.hours || "Mon–Sat: 10:00 AM – 7:00 PM"}\n`;
        markdown += `- Rating: 4.9/5.0 (${loc.total_reviews ? Number(loc.total_reviews) : "500+"} Google Reviews)\n`;
        if (loc.google_maps_url) markdown += `- Google Maps Navigation: ${loc.google_maps_url}\n`;
        markdown += `\n`;
      }
    }

    // 3. Check if it is the FAQ page
    if (!markdown && rawPath === "faq") {
      const faqs = await prisma.faqs.findMany({ orderBy: { order: "asc" } });
      pageTitle = "Frequently Asked Questions";
      markdown += `# SmartFoneDoctor - Frequently Asked Questions\n\n`;
      for (const faq of faqs) {
        markdown += `### Q: ${faq.question}\n\n`;
        markdown += `${faq.answer}\n\n`;
      }
    }

    // 4. Check CMS Pages (e.g. repairs, repairs/iphone, about, schedule-repair, review)
    if (!markdown) {
      const lookupSlug = rawPath.replace(/\//g, "-") || "home";
      const page = await prisma.cmsPage.findFirst({
        where: {
          OR: [
            { slug: lookupSlug },
            { path: `/${rawPath}` },
            { path: rawPath },
          ],
        },
        include: { seo: true },
      });

      if (page) {
        pageTitle = page.name;
        markdown += `# ${page.name} - SmartFoneDoctor\n\n`;
        if (page.heroHeadline) markdown += `## ${page.heroHeadline}\n\n`;
        if (page.heroSubtitle) markdown += `> ${page.heroSubtitle}\n\n`;
        if (page.metaDesc && page.metaDesc !== page.heroSubtitle) {
          markdown += `${page.metaDesc}\n\n`;
        }
        if (page.contentHtml) {
          markdown += `\n---\n\n`;
          markdown += stripHtml(page.contentHtml);
        }
        markdown += `\n\n### Actions\n`;
        markdown += `- Online Booking: ${BASE_URL}/schedule-repair\n`;
        markdown += `- Contact Phone: +1 (215) 598-2090\n`;
      }
    }

    // 5. Fallback if not found
    if (!markdown) {
      return new NextResponse(`# 404 - Document Not Found\n\nThe requested resource \`${rawPath}\` does not exist in Markdown format.\n\nBrowse [llms.txt](${BASE_URL}/llms.txt) for available resources.`, {
        status: 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
        },
      });
    }

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Link": `<${BASE_URL}/llms.txt>; rel="describedby"`,
      },
    });
  } catch (error) {
    console.error("Failed to render dynamic markdown:", error);
    return new NextResponse("# Error\n\nAn unexpected error occurred while rendering the markdown document.", {
      status: 500,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }
}
