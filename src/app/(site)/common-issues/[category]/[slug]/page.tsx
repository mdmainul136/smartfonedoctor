import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllCommonIssuesCMS,
  getCommonIssueBySlug,
  getRelatedIssues,
} from "@/data/commonIssuesData";
import IssueArticleClient from "./IssueArticleClient";

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const allIssues = getAllCommonIssuesCMS();
  return allIssues.map((issue) => ({
    category: issue.category,
    slug: issue.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const issue = getCommonIssueBySlug(slug, category);

  if (!issue) {
    return {
      title: "Issue Not Found | SmartFoneDoctor",
    };
  }

  return {
    title: issue.seo.title,
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
  const issue = getCommonIssueBySlug(slug, category);

  if (!issue) {
    notFound();
  }

  const related = getRelatedIssues(issue.slug);

  return <IssueArticleClient issue={issue} relatedIssues={related} />;
}

