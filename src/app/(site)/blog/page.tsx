"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  ArrowRight,
  Search,
  Tag,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  BlogArticle,
  BlogCategoryTaxonomy,
  getStoredBlogArticles,
  getStoredBlogCategories,
} from "@/lib/blogData";

export default function PublicBlogHubPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<BlogCategoryTaxonomy[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setArticles(getStoredBlogArticles());
    setCategories(getStoredBlogCategories());

    const handleUpdate = () => {
      setArticles(getStoredBlogArticles());
      setCategories(getStoredBlogCategories());
    };
    window.addEventListener("sfd-blog-updated", handleUpdate);
    return () => window.removeEventListener("sfd-blog-updated", handleUpdate);
  }, []);

  const filtered = articles.filter((a) => {
    const isPublished = a.status === "Published";
    const matchesCat =
      selectedCategory === "all" ||
      a.categoryId === selectedCategory ||
      a.categoryName.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return isPublished && matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      
      {/* 1. HERO HEADER */}
      <section className="bg-gradient-to-b from-[#1d1c1a] to-[#2b2926] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
        <div className="max-w-[1250px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00897b]/20 border border-[#00897b]/40 text-[#4dd0e1] text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Repair Bench Knowledge Base &amp; Guides</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Hardware Guides &amp; Repair Insights
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Written by certified technicians on Philadelphia repair benches. Free diagnostics advice, battery care, and micro-soldering guides.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-lg mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search troubleshooting guides, battery tips, HDMI fixes..."
                className="w-full h-[44px] pl-10 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-400 text-sm focus:outline-none focus:bg-white focus:text-[#111] focus:placeholder:text-gray-500 transition-all shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-[1250px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[#00897b] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Guides ({articles.filter((a) => a.status === "Published").length})
          </button>

          {categories.map((cat) => {
            const count = articles.filter(
              (a) => a.categoryId === cat.id && a.status === "Published"
            ).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#00897b] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && <span className="ml-1.5 opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ARTICLES GRID */}
      <main className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Featured Thumbnail */}
                <Link
                  href={`/blog/${article.slug}`}
                  className="block relative aspect-video bg-gray-100 overflow-hidden"
                >
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#1d1c1a]/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    {article.categoryName}
                  </span>
                </Link>

                {/* Article Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1 font-medium text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-[#00897b]" />
                        {article.readTime}
                      </span>
                      <span>•</span>
                      <span>{article.publishedAt}</span>
                    </div>

                    <h2 className="text-lg font-bold text-[#1d1c1a] group-hover:text-[#00897b] transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                    </h2>

                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Author & Read More Bar */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 text-[#00897b] text-[10px] font-bold flex items-center justify-center">
                        {article.author.avatar || article.author.name.slice(0, 2)}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">
                        {article.author.name}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-xs font-bold text-[#00897b] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              No articles found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We couldn't find any guides matching "{search}". Try searching for batteries, screens, or water damage.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-2 text-xs font-semibold text-[#00897b] underline"
            >
              Reset filters
            </button>
          </div>
        )}

      </main>

    </div>
  );
}
