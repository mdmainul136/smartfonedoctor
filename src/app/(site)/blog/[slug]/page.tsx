import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { BLOG_POSTS_TAXONOMY, resolveTaxonomyUrl } from "@/lib/taxonomy";

interface BlogArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS_TAXONOMY.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS_TAXONOMY.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Repair Article | SmartFoneDoctor Philadelphia",
    };
  }

  return {
    title: `${post.title} | SmartFoneDoctor Knowledge Base`,
    description: post.excerpt,
  };
}

export default async function BlogArticleDetailPage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS_TAXONOMY.find((p) => p.slug === slug);

  if (post && post.url) {
    // Redirect to the dedicated in-depth hardware issue guide
    redirect(post.url);
  }

  // Fallback: check if matches any taxonomy URL
  const targetUrl = resolveTaxonomyUrl("blog", slug);
  if (targetUrl && targetUrl !== "/schedule-repair?item=" + slug) {
    redirect(targetUrl);
  }

  notFound();
}

