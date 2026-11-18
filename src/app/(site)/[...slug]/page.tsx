import type { Metadata } from "next";
import { notFound, redirect, RedirectType } from "next/navigation";
import CustomPage from "@/components/site/CustomPage";
import { getCmsPage } from "@/actions/cmsPages";
import { compilePageCss } from "@/puck/style/compilePage";
import prisma from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

/** Look up page via standard PostgreSQL query with seed fallback */
async function resolvePage(slug: string[]) {
  // Never handle internal Next.js, API, or static asset extensions in the catch-all
  if (
    !slug ||
    slug.length === 0 ||
    slug[0] === "_next" ||
    slug[0] === "api" ||
    slug.some((s) => s.includes("."))
  ) {
    return { page: null, path: "" };
  }

  const path = `/${slug.join("/")}`;
  const page = await getCmsPage(path);
  return { page, path };
}

/**
 * Dynamic metadata generator for custom CMS pages.
 * Delivers accurate server-side Title, Description, OpenGraph, Canonical, and Twitter cards.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { page, path } = await resolvePage(slug);

  if (!page) {
    return {
      title: "Page Not Found | SmartFone Doctor",
      description: "The requested page could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const title = page.title || `${page.name} | SmartFone Doctor`;
  const description =
    page.metaDesc ||
    page.heroSubtitle ||
    "Professional phone, tablet, computer and electronics repair in Philadelphia.";
  const canonicalUrl = page.canonicalUrl || `https://smartfonedoctor.com${path}`;
  const ogImage = page.featuredImage || "/images/og-default.jpg";

  return {
    title,
    description,
    keywords: page.keywords?.length
      ? page.keywords
      : page.focusKeyword
      ? [page.focusKeyword]
      : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "SmartFone Doctor",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: page.status === "Published",
      follow: page.status === "Published",
    },
  };
}

/**
 * Pages created in Admin > Pages. Built-in pages have their own route folders,
 * which Next.js always prefers over this catch-all.
 *
 * Compiled widget CSS is injected as a plain <style> tag BEFORE the page
 * content — zero FOUC, full SSR, Google indexes styles, Lighthouse 99+.
 */
export default async function CustomPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const { page, path } = await resolvePage(slug);

  if (!page) {
    if (path) {
      const redirectRule = await prisma.urlRedirect.findFirst({
        where: {
          sourceUrl: path,
          isActive: true,
        },
      });

      if (redirectRule) {
        await prisma.urlRedirect
          .update({
            where: { id: redirectRule.id },
            data: { hitCount: { increment: 1 } },
          })
          .catch(() => {});
        redirect(redirectRule.targetUrl, redirectRule.statusCode === 302 ? RedirectType.replace : RedirectType.replace);
      }
    }

    notFound();
  }

  const css =
    page.compiledCss ||
    (page.puckData && (page.puckData as { content?: unknown[] }).content
      ? compilePageCss((page.puckData as { content: unknown[] }).content)
      : "");

  return (
    <>
      {css ? (
        <style
          id={`pb-css-${page.slug}`}
          dangerouslySetInnerHTML={{ __html: css }}
        />
      ) : null}
      <CustomPage path={path} initialPage={page} />
    </>
  );
}
