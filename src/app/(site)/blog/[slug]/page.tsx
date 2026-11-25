import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  INITIAL_BLOG_ARTICLES,
  type BlogArticle,
} from "@/lib/blogData";
import { getBlogPostBySlugAction, getBlogPostsAction } from "@/actions/blog";
import SingleBlogPostClient from "./SingleBlogPostClient";
import Footer from "@/components/layout/Footer";
import { getCmsPage } from "@/actions/cmsPages";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider } from "@/components/site/RouteDataContext";
import { templateSlug } from "@/lib/cmsTemplates";
import type { CMSPage } from "@/lib/cmsData";
import { buildSocialMetadata } from "@/lib/seoSocial";

/** Extracts Q&A items from RichTextEditor `.sfd-faq-accordion` blocks for FAQPage JSON-LD. */
function extractFaqsFromHtml(html?: string): Array<{ question: string; answer: string }> {
  if (!html) return [];
  const cleanText = (s: string) =>
    s
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/\s+/g, " ")
      .trim();

  const items: Array<{ question: string; answer: string }> = [];
  const regex =
    /<details[^>]*class="[^"]*sfd-faq-accordion[^"]*"[^>]*>[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<div[^>]*class="[^"]*sfd-faq-answer[^"]*"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/details>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null && items.length < 8) {
    const question = cleanText(match[1]);
    const answer = cleanText(match[2]);
    if (question && answer) {
      items.push({ question, answer });
    }
  }
  return items;
}

/** A published CMS page that has a builder layout. */
function usable(page: CMSPage | null): page is CMSPage {
  const blocks = (page?.puckData as { content?: unknown[] } | undefined)?.content;
  return Boolean(page && page.status === "Published" && Array.isArray(blocks) && blocks.length > 0);
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const postsRes = await getBlogPostsAction();
  const articles = postsRes?.success && postsRes.articles ? postsRes.articles : INITIAL_BLOG_ARTICLES;

  return articles.map((art) => ({
    slug: art.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const postRes = await getBlogPostBySlugAction(slug);
  // Built-in copy only when the database can't be reached (a draft stays hidden).
  const article = postRes?.success ? postRes.article : INITIAL_BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: brandTitle("Repair Guide Not Found | SmartFoneDoctor"),
    };
  }

  const metaTitle = article.seo?.metaTitle || `${article.title} | SmartFoneDoctor Philadelphia`;
  const metaDescription = article.seo?.metaDescription || article.excerpt;

  return {
    title: brandTitle(metaTitle),
    description: metaDescription,
    keywords: article.tags,
    alternates: {
      canonical: `https://smartfonedoctor.com/blog/${article.slug}`,
    },
    ...buildSocialMetadata({
      title: metaTitle,
      description: metaDescription,
      url: `/blog/${article.slug}`,
      image: article.featuredImage,
      imageAlt: article.title,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    }),
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const postRes = await getBlogPostBySlugAction(slug);
  // Built-in copy only when the database can't be reached (a draft stays hidden).
  const article = postRes?.success ? postRes.article : INITIAL_BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const allRes = await getBlogPostsAction();
  const allArticles = allRes?.success && allRes.articles ? allRes.articles : INITIAL_BLOG_ARTICLES;

  // WordPress-style layout: a custom layout for this one URL wins, then the
  // "Blog post" template (Admin > Pages > Templates), else the built-in design.
  const [override, template] = await Promise.all([
    getCmsPage(`/blog/${article.slug}`),
    getCmsPage(templateSlug("blog-post")),
  ]);
  const layout = usable(override) && override.category !== "Template" ? override : usable(template) ? template : null;

  // ── JSON-LD Structured Data for Google Rich Snippets ──
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smartfonedoctor.com" },
      { "@type": "ListItem", position: 2, name: "Guides & Blog", item: "https://smartfonedoctor.com/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: article.categoryName,
        item: `https://smartfonedoctor.com/blog?cat=${article.categoryId}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: `https://smartfonedoctor.com/blog/${article.slug}`,
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.seo?.metaTitle || article.title,
    description: article.seo?.metaDescription || article.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "LocalBusiness",
      name: "SmartFoneDoctor Philadelphia",
      logo: { "@type": "ImageObject", url: "https://smartfonedoctor.com/logo-png.jpg" },
      address: {
        "@type": "PostalAddress",
        streetAddress: "33 S 52nd St",
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: "19139",
        addressCountry: "US",
      },
      telephone: "+1-215-598-2090",
    },
    keywords: article.tags.join(", "),
    articleSection: article.categoryName,
    mainEntityOfPage: `https://smartfonedoctor.com/blog/${article.slug}`,
  };

  const extractedFaqs = extractFaqsFromHtml(article.contentHtml);
  const faqEntities =
    extractedFaqs.length >= 2
      ? extractedFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        }))
      : [
          {
            "@type": "Question",
            name: `How quickly can SmartFoneDoctor resolve this issue in Philadelphia?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Most repairs related to ${article.title} are completed within 20 to 45 minutes on our repair bench at 33 S 52nd St. We keep all popular replacement components in stock for same-day walk-in service.`,
            },
          },
          {
            "@type": "Question",
            name: "Do I need to book an appointment or can I just walk in?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No appointment is needed! Walk-ins are welcome daily at our West Philadelphia flagship (33 S 52nd St) and our Lancaster Ave stores. Booking online reserves replacement parts and secures priority bench time.",
            },
          },
          {
            "@type": "Question",
            name: "Will my photos, messages, or apps be erased during the repair?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Our technicians work directly on hardware modules without factory-resetting or erasing storage. Your personal data stays untouched and confidential.",
            },
          },
          {
            "@type": "Question",
            name: "What warranty do you offer on repairs?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Every completed repair includes our comprehensive 90-day parts and labor warranty against manufacturer defects and touchscreen or component unresponsiveness.",
            },
          },
        ];

  // Structured FAQ Schema for Google Rich SERP snippets
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqEntities,
  };

  return (
    <main className="bg-[#fafbfc] min-h-screen">
      {/* ── SSR Injected JSON-LD for Search Engines ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {layout ? (
        <>
          <RouteDataProvider value={{ type: "blog-post", data: { article, allArticles } }}>
            <CMSSectionRenderer slug={layout.slug} initialPage={layout} />
          </RouteDataProvider>
        </>
      ) : (
        <SingleBlogPostClient article={article} allArticles={allArticles} />
      )}
      <Footer />
    </main>
  );
}
