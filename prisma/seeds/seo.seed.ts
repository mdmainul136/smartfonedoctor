import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedSeoMetadata() {
  console.log("🌱 [Seeder] Seeding Enterprise Plugin-Style SEO & AI/LLM Metadata...");

  // 1. Seed SEO Metadata for CMS Pages
  const pages = await prisma.cmsPage.findMany();
  for (const page of pages) {
    const metaTitle = page.title || `${page.name} | SmartFoneDoctor`;
    const metaDesc = page.metaDesc || page.heroSubtitle || "Professional electronics repair services in Philadelphia, PA.";
    const canonical = page.canonicalUrl || `https://smartfonedoctor.com${page.path === "/" ? "" : page.path}`;
    const kw = page.focusKeyword || page.keywords?.[0] || "phone repair philadelphia";
    const aiSummary = `${page.name} offers certified, same-day electronic repair services in Philadelphia, specializing in ${kw}. Includes 90-day comprehensive warranty and fast turnaround at 33 S 52nd St and Lancaster Ave locations.`;

    const seoData = {
      metaTitle,
      metaDescription: metaDesc,
      focusKeyword: kw,
      keywords: page.keywords || [kw],
      secondaryKeywords: page.keywords?.filter((k) => k !== kw) || [],
      canonicalUrl: canonical,
      breadcrumbTitle: page.name,

      // Robots crawling directives
      robotsIndex: true,
      robotsFollow: true,
      robotsNoArchive: false,
      robotsNoSnippet: false,
      robotsMaxSnippet: -1,
      robotsMaxImagePreview: "large",
      robotsMaxVideoPreview: -1,

      // AI & LLM Search Optimization
      allowAiCrawlers: true,
      allowAiTraining: true,
      aiSummary,
      aiSnippetEnabled: true,

      // Social / OpenGraph
      ogTitle: metaTitle,
      ogDescription: metaDesc,
      ogImage: page.featuredImage || "/logo-png.jpg",
      ogType: "website",
      ogLocale: "en_US",
      ogSiteName: "SmartFoneDoctor",

      // Twitter Cards
      twitterCard: "summary_large_image",
      twitterTitle: metaTitle,
      twitterDescription: metaDesc,
      twitterImage: page.featuredImage || "/logo-png.jpg",
      twitterCreator: "@smartfonedoctor",

      // Structured Data
      schemaType: page.schemaType || (page.path === "/" ? "LocalBusiness" : "Service"),
      structuredData: {
        "@context": "https://schema.org",
        "@type": page.schemaType || "LocalBusiness",
        name: `SmartFoneDoctor - ${page.name}`,
        url: canonical,
        description: metaDesc,
        telephone: "+1 (215) 598-2090",
        address: {
          "@type": "PostalAddress",
          streetAddress: "33 S 52nd St, Fl 2nd",
          addressLocality: "Philadelphia",
          addressRegion: "PA",
          postalCode: "19139",
          addressCountry: "US",
        },
      },

      // RankMath Live Scoring
      score: 95,
      readabilityScore: 92,
      auditPassed: 14,
      auditTotal: 15,
      auditLog: [
        { id: "kw-title", label: "Focus Keyword in Title", passed: true, scoreWeight: 20 },
        { id: "kw-url", label: "Focus Keyword in URL Slug", passed: true, scoreWeight: 15 },
        { id: "kw-desc", label: "Focus Keyword in Meta Description", passed: true, scoreWeight: 15 },
        { id: "kw-intro", label: "Focus Keyword in Content Intro", passed: true, scoreWeight: 15 },
        { id: "content-len", label: "Content Length", passed: true, scoreWeight: 15 },
        { id: "internal-links", label: "Internal Links Found", passed: true, scoreWeight: 10 },
        { id: "external-links", label: "External References Found", passed: true, scoreWeight: 10 },
      ],

      // Sitemap
      includeInSitemap: true,
      sitemapPriority: new Prisma.Decimal(page.path === "/" ? 1.0 : 0.8),
      changeFrequency: page.path === "/" ? "daily" : "weekly",
    };

    await prisma.seoMetadata.upsert({
      where: { pageId: page.id },
      update: {},
      create: {
        pageId: page.id,
        ...seoData,
      },
    });
    console.log(`  ✓ Ensured SEO & AI metadata for page: "${page.name}"`);
  }

  // 2. Seed SEO Metadata for Blog Posts
  const posts = await prisma.blogPost.findMany();
  for (const post of posts) {
    const metaTitle = `${post.title} | SmartFoneDoctor Repair Guides`;
    const metaDesc = post.excerpt || "Comprehensive step-by-step troubleshooting and repair guide.";
    const canonical = `https://smartfonedoctor.com/blog/${post.slug}`;
    const kw = post.focusKeyword || "hardware repair guide";

    const blogSeoData = {
      metaTitle,
      metaDescription: metaDesc,
      focusKeyword: kw,
      keywords: [kw, "technician guide", "troubleshooting"],
      secondaryKeywords: ["repair tips", "diagnostics"],
      canonicalUrl: canonical,
      breadcrumbTitle: post.title,

      // Robots
      robotsIndex: true,
      robotsFollow: true,
      robotsNoArchive: false,
      robotsNoSnippet: false,
      robotsMaxSnippet: -1,
      robotsMaxImagePreview: "large",
      robotsMaxVideoPreview: -1,

      // AI/LLM
      allowAiCrawlers: true,
      allowAiTraining: true,
      aiSummary: `Technical repair guide detailing: ${post.title}. Authored by certified technicians covering diagnostic symptoms, equipment required, and bench procedures.`,
      aiSnippetEnabled: true,

      // Social
      ogTitle: metaTitle,
      ogDescription: metaDesc,
      ogImage: post.featuredImage || "/logo-png.jpg",
      ogType: "article",
      ogLocale: "en_US",
      ogSiteName: "SmartFoneDoctor",

      // Twitter
      twitterCard: "summary_large_image",
      twitterTitle: metaTitle,
      twitterDescription: metaDesc,
      twitterImage: post.featuredImage || "/logo-png.jpg",
      twitterCreator: "@smartfonedoctor",

      // Schema
      schemaType: "TechArticle",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: post.title,
        description: metaDesc,
        image: post.featuredImage || "/logo-png.jpg",
        author: {
          "@type": "Person",
          name: post.author || "Certified Technician",
        },
        publisher: {
          "@type": "LocalBusiness",
          name: "SmartFoneDoctor Philadelphia",
        },
      },

      // RankMath
      score: 92,
      readabilityScore: 89,
      auditPassed: 13,
      auditTotal: 15,

      // Sitemap
      includeInSitemap: true,
      sitemapPriority: new Prisma.Decimal(0.7),
      changeFrequency: "monthly",
    };

    await prisma.seoMetadata.upsert({
      where: { postId: post.id },
      update: {},
      create: {
        postId: post.id,
        ...blogSeoData,
      },
    });
    console.log(`  ✓ Ensured SEO & AI metadata for blog: "${post.title}"`);
  }

  // 3. Seed Global Site SEO Settings (non-destructive: never overwrite verification tokens or admin edits)
  await prisma.siteSeoSettings.upsert({
    where: { id: "global_seo_settings" },
    update: {},
    create: {
      id: "global_seo_settings",
      siteName: "SmartFoneDoctor",
      titleSeparator: "|",
      defaultMetaTitle: "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia",
      defaultMetaDescription: "Expert cell phone, iPhone, iPad, MacBook, computer, and gaming console repair in Philadelphia, PA. Fast 30-minute screen and battery replacement with warranty.",
      defaultOgImage: "/logo-png.jpg",
      googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || null,
      bingSiteVerification: process.env.BING_SITE_VERIFICATION || null,
      pinterestVerification: process.env.PINTEREST_SITE_VERIFICATION || null,
      facebookAppId: process.env.FACEBOOK_APP_ID || null,
      twitterHandle: "@smartfonedoctor",
      enableSitemap: true,
      enableRobotsTxt: true,
      enableLlmsTxt: true,
      enableAiBots: true,
    },
  });
  console.log(`  ✓ Ensured Global Site SEO Settings (existing Webmaster tokens preserved)`);

  // 4. Seed 301/302 Redirect Rules (create-if-missing only)
  const SAMPLE_REDIRECTS = [
    { sourceUrl: "/repair/iphone", targetUrl: "/repairs/iphone", statusCode: 301, notes: "Legacy slug migration" },
    { sourceUrl: "/repair/screen-replacement", targetUrl: "/repairs/iphone", statusCode: 301, notes: "Old WordPress landing page" },
    { sourceUrl: "/locations/52nd-st", targetUrl: "/locations", statusCode: 301, notes: "Consolidated multi-store page" },
    { sourceUrl: "/estimate", targetUrl: "/schedule-repair", statusCode: 302, notes: "Temporary promo campaign" },
  ];

  for (const red of SAMPLE_REDIRECTS) {
    await prisma.urlRedirect.upsert({
      where: { sourceUrl: red.sourceUrl },
      update: {},
      create: {
        sourceUrl: red.sourceUrl,
        targetUrl: red.targetUrl,
        statusCode: red.statusCode,
        notes: red.notes,
        isActive: true,
      },
    });
    console.log(`  ✓ Ensured URL Redirect: ${red.sourceUrl} → ${red.targetUrl} [${red.statusCode}]`);
  }

  console.log("✅ [Seeder] Enterprise SEO & AI/LLM Metadata seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/seo.seed.ts
if (require.main === module) {
  seedSeoMetadata()
    .catch((err) => {
      console.error("❌ Failed to seed SEO metadata:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
