"use client";

import SingleBlogPostClient from "@/app/(site)/blog/[slug]/SingleBlogPostClient";
import { useRouteData } from "@/components/site/RouteDataContext";
import type { BlogArticle } from "@/lib/blogData";

export type BlogPostRouteData = { article: BlogArticle; allArticles: BlogArticle[] };

/** Data block: the full blog article (header, image, body, sidebar, FAQ, related posts). */
export function BlogArticleSection() {
  const data = useRouteData<BlogPostRouteData>("blog-post");
  if (!data) {
    return (
      <div className="mx-auto my-10 max-w-xl rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
        The blog article appears here. It shows the post being viewed.
      </div>
    );
  }
  return <SingleBlogPostClient article={data.article} allArticles={data.allArticles} />;
}
