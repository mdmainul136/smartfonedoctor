import Link from "next/link";
import { Metadata } from "next";
import { BLOG_POSTS_TAXONOMY, SERVICE_ISSUES_TAXONOMY, BRANDS_TAXONOMY } from "@/lib/taxonomy";
import { BookOpen, Clock, ArrowRight, Wrench, ShieldCheck, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Repair Guides, Blog & Troubleshooting Hub | SmartFoneDoctor",
  description:
    "Expert troubleshooting tips, hardware diagnostics, and step-by-step guides for iPhone, Samsung, iPad, PlayStation, and laptops from certified Philadelphia bench technicians.",
};

export default function BlogHubPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc]">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1d1c1a] to-[#2b2926] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
        <div className="max-w-[1200px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00897b]/20 border border-[#00897b]/40 text-[#4dd0e1] text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Repair Bench Knowledge Base &amp; Blog</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Hardware Guides &amp; Tech Insights
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Written directly by certified technicians working on our Philadelphia repair benches. Upfront troubleshooting and repair advice before you walk into the store.
          </p>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Featured Posts */}
        <div>
          <h2 className="text-2xl font-bold text-[#1d1c1a] mb-6 flex items-center gap-2">
            <span>Featured Repair Articles</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS_TAXONOMY.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-[#00897b] bg-[#00897b]/10 px-2 py-0.5 rounded">
                      {post.categoryName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#1d1c1a] hover:text-[#00897b] transition-colors leading-snug">
                    <Link href={post.url}>{post.title}</Link>
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="p-6 pt-0 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <Link
                    href={post.url}
                    className="inline-flex items-center gap-1 text-sm font-bold text-[#00897b] hover:underline"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Common Issues Cross-Taxonomy Grid */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1d1c1a]">
                Direct Hardware Issue Fix Guides
              </h2>
              <p className="text-sm text-gray-500">
                Detailed diagnostics and symptoms for cracked screens, water damage, batteries, and HDMI ports.
              </p>
            </div>
            <Link
              href="/common-issues"
              className="text-sm font-bold text-[#00897b] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View All 15+ Issue Guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_ISSUES_TAXONOMY.slice(0, 8).map((issue) => (
              <Link
                key={issue.id}
                href={issue.url}
                className="p-4 rounded-lg bg-white border border-gray-200 hover:border-[#00897b] hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
                      {issue.categorySlug}
                    </span>
                    <span className="font-bold text-[#00897b]">
                      From ${issue.startingPrice}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1d1c1a] group-hover:text-[#00897b] transition-colors">
                    {issue.title}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>⏱ {issue.turnaround}</span>
                  <span className="text-[#00897b] font-semibold group-hover:translate-x-0.5 transition-transform">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Hardware Brands Directory */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-[#1d1c1a] mb-4">
            Supported Device Brands
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {BRANDS_TAXONOMY.map((brand) => (
              <Link
                key={brand.id}
                href={brand.url}
                className="px-3.5 py-2 rounded-lg bg-white border border-gray-200 hover:border-gray-400 text-sm font-medium text-gray-800 hover:text-black transition-colors flex items-center gap-2 shadow-2xs"
              >
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                <span>{brand.name}</span>
                <span className="text-xs text-gray-400 font-normal">
                  ({brand.tagline})
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
