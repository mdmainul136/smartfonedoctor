import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { buildDeviceModelCMS, buildPSeoPageData } from "@/lib/pSeoEngine";
import { getCommonIssues } from "@/lib/commonIssuesStore";
import { HUB_DEFAULTS, type HubCategory } from "@/components/repairs/categoryHubContent";
import { GEO_STORES, getGeoStoreByCode, getGeoStoreById, getGeoStoreBySlug, toNeighborhoodSlug } from "@/lib/geoPages";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";
const VALID_CATEGORIES: HubCategory[] = ["smartphone", "tablet", "computer", "console"];

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
    const url = new URL(req.url);
    const fromQuery = req.nextUrl.searchParams.get("path") || url.searchParams.get("path");
    let rawPath = fromQuery || (url.pathname.endsWith(".md") ? url.pathname : "");
    rawPath = rawPath.replace(/^\/+/, "").replace(/\.md$/, "");

    let markdown = "";

    // 1. Blog article: blog/<slug>
    if (rawPath.startsWith("blog/")) {
      const slug = rawPath.replace(/^blog\//, "");
      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { seo: true },
      });

      if (post && post.status === "Published") {
        markdown += `# ${post.title}\n\n`;
        if (post.excerpt) markdown += `> ${post.excerpt}\n\n`;
        markdown += `- Category: ${post.category}\n`;
        markdown += `- Author: ${post.author}\n`;
        markdown += `- Last Updated: ${post.updatedAt.toISOString().split("T")[0]}\n`;
        if (post.seo?.focusKeyword) markdown += `- Focus Topic: ${post.seo.focusKeyword}\n`;
        markdown += `\n---\n\n`;
        markdown += stripHtml(post.content);
        markdown += `\n\n---\n`;
        markdown += `*Book bench service in Philadelphia: call +1 (215) 598-2090 or visit ${BASE_URL}/schedule-repair.*\n`;
      }
    }

    // 2. Programmatic Repair Pages: repairs/<category>, repairs/<category>/<device>, repairs/<category>/<device>/<issue>
    if (!markdown && rawPath.startsWith("repairs/")) {
      const parts = rawPath.split("/").filter(Boolean);
      const catalog = await getRepairCatalog();

      if (parts.length === 4) {
        const [, categorySlug, deviceSlug, issueSlug] = parts;
        const page = buildPSeoPageData(categorySlug, deviceSlug, issueSlug, catalog);
        if (page) {
          markdown += `# ${page.device.name} ${page.issue.name} in Philadelphia\n\n`;
          markdown += `> ${page.answerCapsule}\n\n`;
          markdown += `## Repair Summary\n`;
          markdown += `- Device: ${page.device.name} (${page.device.specs})\n`;
          markdown += `- Standard OEM-Grade Price: $${page.pricing.aftermarket}\n`;
          markdown += `- Original Manufacturer (OEM) Price: $${page.pricing.oem}\n`;
          markdown += `- Turnaround Time: ${page.pricing.turnaround}\n`;
          markdown += `- Warranty: ${page.pricing.warrantyDays}-Day Parts & Labor Warranty\n`;
          markdown += `- Book Online: ${BASE_URL}/schedule-repair?device=${page.device.category}&model=${encodeURIComponent(page.device.name)}&issue=${encodeURIComponent(page.issue.slug)}\n\n`;

          if (page.issue.symptoms.length > 0) {
            markdown += `## Common Symptoms Fixed\n`;
            for (const s of page.issue.symptoms) markdown += `- ${s}\n`;
            markdown += `\n`;
          }

          if (page.issue.benchProcedures.length > 0) {
            markdown += `## Bench Procedure Steps\n`;
            page.issue.benchProcedures.forEach((step, idx) => {
              markdown += `${idx + 1}. **${step.title}**: ${step.desc}\n`;
            });
            markdown += `\n`;
          }

          if (page.issue.faqs.length > 0) {
            markdown += `## Frequently Asked Questions\n`;
            for (const f of page.issue.faqs) {
              markdown += `### ${f.question}\n${f.answer}\n\n`;
            }
          }
        }
      } else if (parts.length === 3) {
        const [, categorySlug, serviceId] = parts;
        const svc = buildDeviceModelCMS(categorySlug, serviceId, catalog);
        if (svc) {
          markdown += `# ${svc.serviceName} in Philadelphia\n\n`;
          markdown += `> ${svc.heroSubtitle}\n\n`;
          markdown += `## Available Repairs & Turnaround\n`;
          for (const issue of svc.commonIssues) {
            markdown += `- [${issue.title}](${BASE_URL}/repairs/${svc.categoryId}/${svc.serviceId}/${issue.id}.md): ${issue.description} (${issue.turnaround})\n`;
          }
          markdown += `\n## Philadelphia Store Locations\n`;
          for (const st of GEO_STORES) {
            markdown += `- [${st.name}](${BASE_URL}/locations/${st.slug}.md): ${st.streetAddress}, ${st.addressLocality}, ${st.addressRegion} ${st.postalCode} (${st.hoursDisplay})\n`;
          }
        }
      } else if (parts.length === 2 && VALID_CATEGORIES.includes(parts[1] as HubCategory)) {
        const cat = parts[1] as HubCategory;
        const hub = HUB_DEFAULTS[cat];
        const devs = catalog.devices.filter((d) => d.category === cat);
        const reps = catalog.issues.filter((i) => i.category === cat);
        markdown += `# ${hub.heroTitle}\n\n`;
        markdown += `> ${hub.heroIntro}\n\n`;
        markdown += `## Repairs Offered\n`;
        for (const r of reps) {
          markdown += `- **${r.name}**: From $${r.basePrice} · ${r.turnaroundDisplay}\n`;
        }
        markdown += `\n## Supported Models (${devs.length})\n`;
        for (const d of devs) {
          markdown += `- [${d.name}](${BASE_URL}/repairs/${d.category}/${d.slug}.md): ${d.specs}\n`;
        }
      }
    }

    // 3. Common Hardware Issues: common-issues/<category>/<slug>
    if (!markdown && rawPath.startsWith("common-issues/")) {
      const parts = rawPath.split("/").filter(Boolean);
      const issues = await getCommonIssues();
      if (parts.length === 3) {
        const match = issues.find((i) => i.category === parts[1] && i.slug === parts[2]);
        if (match) {
          markdown += `# ${match.title}\n\n`;
          markdown += `> ${match.leadText}\n\n`;
          for (const sec of match.sections || []) {
            markdown += `## ${sec.heading}\n\n`;
            for (const p of sec.paragraphs || []) markdown += `${p}\n\n`;
            for (const li of sec.listItems || []) markdown += `- ${li}\n`;
            markdown += `\n`;
          }
          markdown += `---\n*Free diagnostics and same-day bench repair at SmartFoneDoctor Philadelphia: ${BASE_URL}/schedule-repair*\n`;
        }
      } else if (rawPath === "common-issues") {
        markdown += `# Common Hardware Issues & Troubleshooting Guides\n\n`;
        for (const ci of issues) {
          markdown += `- [${ci.title} (${ci.categoryName})](${BASE_URL}/common-issues/${ci.category}/${ci.slug}.md): ${ci.leadText}\n`;
        }
      }
    }

    // 4. Dedicated Location & Neighborhood GEO Pages
    if (!markdown && rawPath.startsWith("locations/areas/")) {
      const areaSlug = rawPath.replace(/^locations\/areas\//, "");
      const neighborhoods = await prisma.geoNeighborhood.findMany();
      const hood = neighborhoods.find((n) => toNeighborhoodSlug(n.name) === areaSlug);
      if (hood) {
        const nearest = getGeoStoreById(hood.storeId);
        markdown += `# Device & Phone Repair Serving ${hood.name}, Philadelphia\n\n`;
        markdown += `> Fast same-day smartphone, tablet, MacBook, and console repair serving ${hood.name} (${hood.zipCodes.join(", ")}), within ${hood.radius} of ${hood.keyLandmarks.join(", ")}. Nearest branch: ${nearest.streetAddress} (${nearest.hoursDisplay}).\n\n`;
        markdown += `## Nearest Store Branch\n`;
        markdown += `- **Branch**: [${nearest.name}](${BASE_URL}/locations/${nearest.slug}.md)\n`;
        markdown += `- **Address**: ${nearest.streetAddress}, ${nearest.addressLocality}, ${nearest.addressRegion} ${nearest.postalCode}\n`;
        markdown += `- **Phone**: ${nearest.phone}\n`;
        markdown += `- **Transit**: ${nearest.transitNote}\n`;
        markdown += `- **Book Online**: ${BASE_URL}/schedule-repair?store=${nearest.storeId}\n`;
      }
    }

    if (!markdown && rawPath.startsWith("locations/") && rawPath !== "locations/i/book-repair") {
      const storeSlug = rawPath.replace(/^locations\//, "");
      const geo = getGeoStoreBySlug(storeSlug);
      if (geo) {
        markdown += `# ${geo.name}\n\n`;
        markdown += `> Visit SmartFoneDoctor at ${geo.streetAddress}, ${geo.addressLocality}, ${geo.addressRegion} ${geo.postalCode}. Open ${geo.hoursDisplay}. Call ${geo.phone}. Walk-ins welcomed with free diagnostics and 90-day warranty.\n\n`;
        markdown += `## Branch Information\n`;
        markdown += `- **Address**: ${geo.streetAddress}, ${geo.addressLocality}, ${geo.addressRegion} ${geo.postalCode}\n`;
        markdown += `- **Phone**: ${geo.phone}\n`;
        markdown += `- **Hours**: ${geo.hoursDisplay}\n`;
        markdown += `- **Transit**: ${geo.transitNote}\n`;
        markdown += `- **Parking**: ${geo.parkingNote}\n`;
        markdown += `- **Google Maps**: ${geo.gmbUrl}\n`;
        markdown += `- **Book Bench Service**: ${BASE_URL}/schedule-repair?store=${geo.storeId}\n\n`;
        markdown += `## Bench Specialties\n`;
        for (const sp of geo.specialties) markdown += `- ${sp}\n`;
      }
    }

    // 5. Locations overview (/locations.md or /stores.md)
    if (!markdown && (rawPath === "locations" || rawPath === "stores")) {
      const locations = await prisma.locations.findMany({ where: { is_active: true }, orderBy: { id: "asc" } });
      markdown += `# SmartFoneDoctor Store Locations in Philadelphia\n\n`;
      markdown += `> 3 convenient repair labs across West Philadelphia and University City.\n\n`;
      for (const loc of locations) {
        const geo = getGeoStoreByCode(loc.store_code);
        markdown += `## ${geo?.name || loc.name}\n\n`;
        markdown += `- Dedicated Page: ${BASE_URL}/locations/${geo?.slug || "i/book-repair"}.md\n`;
        markdown += `- Address: ${loc.address}\n`;
        markdown += `- Neighborhood: ${loc.neighborhood || "Philadelphia, PA"}\n`;
        markdown += `- Telephone: ${loc.phone}\n`;
        markdown += `- Hours: Mon–Sat: 10:00 AM – 7:00 PM (Sun: Closed)\n`;
        if (loc.google_maps_url) markdown += `- Google Maps Navigation: ${loc.google_maps_url}\n`;
        markdown += `\n`;
      }
    }

    // 6. FAQ page (/faq.md)
    if (!markdown && rawPath === "faq") {
      const faqs = await prisma.faqs.findMany({ orderBy: { order: "asc" } });
      markdown += `# SmartFoneDoctor - Frequently Asked Questions\n\n`;
      for (const faq of faqs) {
        markdown += `### Q: ${faq.question}\n\n`;
        markdown += `${faq.answer}\n\n`;
      }
    }

    // 7. Fallback CMS Pages (e.g. home, repairs, about, schedule-repair, review, warranty)
    if (!markdown) {
      const lookupSlug = rawPath.replace(/\//g, "-") || "home";
      const page = await prisma.cmsPage.findFirst({
        where: {
          status: "Published",
          NOT: [{ category: "Template" }, { category: "Global" }],
          OR: [{ slug: lookupSlug }, { path: `/${rawPath}` }, { path: rawPath }],
        },
        include: { seo: true },
      });

      if (page) {
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

    if (!markdown) {
      return new NextResponse(
        `# 404 - Document Not Found\n\nThe requested resource \`${rawPath}\` does not exist in Markdown format.\n\nBrowse [llms.txt](${BASE_URL}/llms.txt) or [llms-full.txt](${BASE_URL}/llms-full.txt) for available resources.`,
        {
          status: 404,
          headers: { "Content-Type": "text/markdown; charset=utf-8" },
        }
      );
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
