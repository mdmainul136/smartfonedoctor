import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCommonIssueBySlug, getRelatedIssues } from "@/data/commonIssuesData";
import IssueArticleClient from "./IssueArticleClient";
import Footer from "@/components/layout/Footer";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider } from "@/components/site/RouteDataContext";
import { getCommonIssues } from "@/lib/commonIssuesStore";
import { pickLayout } from "@/lib/pickLayout";
import { getDefaultIssueFaqs } from "@/lib/repairTabDefaults";
import { JsonLd, SITE_URL, buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema";
import { buildSocialMetadata } from "@/lib/seoSocial";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const allIssues = await getCommonIssues();
  return allIssues.map((issue) => ({
    category: issue.category,
    slug: issue.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const issue = getCommonIssueBySlug(slug, category, await getCommonIssues());

  if (!issue) {
    return {
      title: brandTitle("Issue Not Found | SmartFoneDoctor"),
    };
  }

  const keywords = Array.from(
    new Set([issue.seo.focusKeyword, ...(issue.seo.keywords ?? [])].map((k) => k?.trim()).filter(Boolean) as string[])
  );

  const ogTitle = issue.seo.title?.trim() || `${issue.title} | SmartFoneDoctor`;
  const ogDescription = issue.seo.description?.trim() || issue.leadText;
  const canonical = issue.seo.canonicalUrl?.trim() || `/common-issues/${category}/${slug}`;

  return {
    title: brandTitle(issue.seo.title),
    description: ogDescription,
    keywords,
    alternates: {
      canonical,
    },
    ...buildSocialMetadata({
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      image: issue.image,
      imageAlt: issue.title,
      type: "article",
    }),
  };
}

export default async function CommonIssueDetailPage({ params }: PageProps) {
  const { category, slug } = await params;
  const issue = getCommonIssueBySlug(slug, category, await getCommonIssues());

  if (!issue) {
    notFound();
  }

  const related = getRelatedIssues(issue.slug, await getCommonIssues());
  const canonicalPath = issue.seo.canonicalUrl?.trim() || `/common-issues/${category}/${slug}`;
  const absoluteCanonical = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Common Issues", url: "/common-issues" },
    { name: issue.categoryName, url: "/common-issues" },
    { name: issue.title, url: `/common-issues/${category}/${slug}` },
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": issue.seo.schemaType?.trim() || "TechArticle",
    headline: issue.seo.title?.trim() || issue.title,
    description: issue.seo.description?.trim() || issue.leadText,
    image: issue.image || `${SITE_URL}/logo-png.jpg`,
    mainEntityOfPage: absoluteCanonical,
    author: {
      "@type": "Person",
      name: "Dr. Mike",
      jobTitle: "Lead Hardware Technician & Founder",
    },
    publisher: {
      "@type": ["LocalBusiness", "ElectronicsStore"],
      "@id": `${SITE_URL}/#localbusiness`,
      name: "SmartFoneDoctor",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-png.jpg`,
      },
    },
  };

  const faqSchema = buildFaqSchema(
    issue.faqs?.length ? issue.faqs : getDefaultIssueFaqs(issue.title)
  );

  // Layout from Admin > Pages > Templates > "Template: Common issue" (or this URL's own page).
  const layout = await pickLayout(`/common-issues/${category}/${slug}`, "common-issue");
  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      {layout ? (
        <>
          <RouteDataProvider value={{ type: "common-issue", data: { issue, related } }}>
            <CMSSectionRenderer slug={layout.page.slug} initialPage={layout.page} />
          </RouteDataProvider>
          <Footer />
        </>
      ) : (
        <IssueArticleClient issue={issue} relatedIssues={related} />
      )}
    </>
  );
}

