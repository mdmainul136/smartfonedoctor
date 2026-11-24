import type { Metadata } from "next";
import { getBlogPostsAction } from "@/actions/blog";
import { getTaxonomyAction } from "@/actions/taxonomy";
import { INITIAL_BLOG_ARTICLES, type BlogCategoryTaxonomy } from "@/lib/blogData";
import { brandTitle } from "@/lib/seoTitle";
import { buildSocialMetadata } from "@/lib/seoSocial";
import BlogHubClient from "./BlogHubClient";

const blogDesc =
  "Repair guides from SmartFoneDoctor's Philadelphia technicians: battery health, water damage, screen and charging port problems, and console HDMI repairs.";

export const metadata: Metadata = {
  title: brandTitle("Repair Guides & Hardware Insights | SmartFoneDoctor"),
  description: blogDesc,
  alternates: { canonical: "/blog" },
  ...buildSocialMetadata({
    title: "Repair Guides & Hardware Insights | SmartFoneDoctor",
    description: blogDesc,
    url: "/blog",
    type: "website",
  }),
};

/** Blog index: posts from the database (Admin > Guides & Blog), rendered on the server. */
export default async function BlogIndexPage() {
  const [res, cats] = await Promise.all([getBlogPostsAction(), getTaxonomyAction<BlogCategoryTaxonomy>("blog-categories")]);
  const articles = res.success ? res.articles : INITIAL_BLOG_ARTICLES;
  // Categories live in the database (Admin > Guides & Blog > Categories).
  return <BlogHubClient articles={articles} categories={cats.data} />;
}
