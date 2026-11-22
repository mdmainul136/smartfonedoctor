import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { INITIAL_BLOG_ARTICLES } from "@/lib/blogData";
import { GUIDES_DEFAULTS, pickText, type LatestGuidesProps } from "./sectionContent";

/** Home page: the three newest repair guides from the blog. */
export function LatestGuides(props: LatestGuidesProps) {
  const d = GUIDES_DEFAULTS;
  const count = Math.min(6, Math.max(1, Math.round(Number(props.count) || d.count)));
  const featuredArticles = INITIAL_BLOG_ARTICLES.slice(0, count);

  return (
    <section className="bg-[#fcfcfc] py-14 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/70">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sfd-teal mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{pickText(props.badge, d.badge)}</span>
            </div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1d1c1a] tracking-tight">
              {pickText(props.heading, d.heading)}
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>{pickText(props.linkText, d.linkText)}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-sfd-teal transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/20">
                      {article.categoryName}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-bold text-[#1d1c1a] group-hover:text-sfd-teal transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">{article.excerpt}</p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-sfd-teal" />
                  {article.readTime}
                </span>
                <Link
                  href={`/blog/${article.slug}`}
                  className="font-bold text-sfd-teal hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
