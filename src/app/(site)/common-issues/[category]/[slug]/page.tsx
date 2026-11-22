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

  return {
    title: brandTitle(issue.seo.title),
    description: issue.seo.description,
    keywords: issue.seo.keywords,
    openGraph: {
      title: `${issue.title} | SmartFoneDoctor`,
      description: issue.seo.description,
      images: [issue.image],
    },
  };
}

export default async function CommonIssueDetailPage({ params }: PageProps) {
  const { category, slug } = await params;
  const issue = getCommonIssueBySlug(slug, category, await getCommonIssues());

  if (!issue) {
    notFound();
  }

  const related = getRelatedIssues(issue.slug, await getCommonIssues());

  // Layout from Admin > Pages > Templates > "Template: Common issue" (or this URL's own page).
  const layout = await pickLayout(`/common-issues/${category}/${slug}`, "common-issue");
  if (!layout) return <IssueArticleClient issue={issue} relatedIssues={related} />;
  return (
    <>
      <RouteDataProvider value={{ type: "common-issue", data: { issue, related } }}>
        <CMSSectionRenderer slug={layout.page.slug} initialPage={layout.page} />
      </RouteDataProvider>
      <Footer />
    </>
  );
}

