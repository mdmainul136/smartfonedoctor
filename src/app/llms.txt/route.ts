import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache on edge/CDN for 1 hour

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartfonedoctor.com";

export async function GET() {
  try {
    const [locations, faqs, blogPosts, cmsPages, settings] = await Promise.all([
      prisma.locations.findMany({ where: { is_active: true } }),
      prisma.faqs.findMany({ orderBy: { order: "asc" }, take: 6 }),
      prisma.blogPost.findMany({ include: { seo: true }, take: 10 }),
      prisma.cmsPage.findMany({ where: { status: "Published" }, include: { seo: true } }),
      prisma.siteSeoSettings.findUnique({ where: { id: "global_seo_settings" } }),
    ]);

    const siteName = settings?.siteName || "SmartFoneDoctor";

    let md = `# ${siteName} - Philadelphia Electronics & Phone Repair\n\n`;
    md += `> Philadelphia's trusted destination for smartphone, tablet, computer, and gaming console repairs.\n`;
    md += `> Certified technicians, OEM-grade replacement parts, same-day service (25–45 min), and 90-day comprehensive warranties.\n\n`;

    md += `## Business Summary & Contact\n`;
    md += `- Website: ${BASE_URL}\n`;
    md += `- Main Phone: +1 (215) 598-2090\n`;
    md += `- Primary Hours: Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM\n`;
    md += `- Walk-ins: Always welcome without an appointment at all 3 stores.\n`;
    md += `- Standard Turnaround: Most screen and battery replacements take under 45 minutes.\n`;
    md += `- Warranty: 90-day warranty on all replacement parts and technician craftsmanship.\n\n`;

    md += `## Store Locations\n`;
    for (const loc of locations) {
      md += `### ${loc.name}\n`;
      md += `- Address: ${loc.address}\n`;
      md += `- Neighborhood: ${loc.neighborhood || "Philadelphia, PA"}\n`;
      md += `- Phone: ${loc.phone}\n`;
      md += `- Hours: ${loc.hours || "Mon–Sat: 10:00 AM – 7:00 PM"}\n`;
      if (loc.google_maps_url) md += `- Google Maps: ${loc.google_maps_url}\n`;
      md += `\n`;
    }

    md += `## Key Services & Repair Specializations\n`;
    md += `- iPhone Screen & OLED Replacement (iPhone 11 through iPhone 16 Pro Max)\n`;
    md += `- Smartphone Battery Swaps (OEM-grade cells, 100% battery health restore)\n`;
    md += `- Samsung Galaxy & Google Pixel Screen, Back Glass & Charging Ports\n`;
    md += `- iPad & Android Tablet Digitizer & LCD Separation\n`;
    md += `- MacBook & Windows Laptop Screen, Keyboard, Battery, and Trackpad\n`;
    md += `- Game Console Micro-Soldering (PS5 / Xbox Series X / Nintendo Switch HDMI ports)\n`;
    md += `- Ultrasonic Liquid & Water Damage Remediation\n\n`;

    md += `## Core Web Pages & Online Actions\n`;
    md += `- [Schedule a Repair Online](${BASE_URL}/schedule-repair): Book priority bench diagnostic and instant price quote.\n`;
    md += `- [Repair Status Tracker](${BASE_URL}/repair-status): Check real-time repair progress with your ticket number.\n`;
    md += `- [Store Locations & Directions](${BASE_URL}/locations): View all 3 West Philadelphia repair shops.\n`;
    md += `- [Customer Reviews](${BASE_URL}/review): 4.9-star average across 1,500+ verified customer reviews.\n`;
    md += `- [Common Repair Issues](${BASE_URL}/repairs): Overview of hardware symptoms and repair procedures.\n\n`;

    if (blogPosts.length > 0) {
      md += `## Technical Knowledge Base & Diagnostic Guides\n`;
      for (const post of blogPosts) {
        const summary = post.seo?.aiSummary || post.excerpt || "Step-by-step diagnostic and troubleshooting guide.";
        md += `- [${post.title}](${BASE_URL}/blog/${post.slug}): ${summary}\n`;
      }
      md += `\n`;
    }

    if (faqs.length > 0) {
      md += `## Frequently Asked Questions\n`;
      for (const faq of faqs) {
        md += `Q: ${faq.question}\n`;
        md += `A: ${faq.answer}\n\n`;
      }
    }

    return new NextResponse(md, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to generate dynamic llms.txt:", error);
    return new NextResponse("# SmartFoneDoctor Philadelphia\n\nWebsite: https://smartfonedoctor.com\nPhone: +1 (215) 598-2090", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
