"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Calendar,
  User,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Info,
  Wrench,
  Share2,
  Bookmark,
  Check,
} from "lucide-react";
import {
  BlogArticle,
  getStoredBlogArticles,
} from "@/lib/blogData";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function SingleBlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = use(params);
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [copied, setCopied] = useState(false);
  const [allArticles, setAllArticles] = useState<BlogArticle[]>([]);

  useEffect(() => {
    const list = getStoredBlogArticles();
    setAllArticles(list);
    const found = list.find((a) => a.slug === resolvedParams.slug);
    if (found) {
      setArticle(found);
    }
  }, [resolvedParams.slug]);

  if (!article && allArticles.length > 0) {
    // If list loaded and article not found
    return notFound();
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Loading guide...
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.categoryId === article.categoryId)
    .slice(0, 2);

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.seo.metaTitle || article.title,
    description: article.seo.metaDescription || article.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "SmartFoneDoctor Philadelphia",
      logo: {
        "@type": "ImageObject",
        url: "https://smartfonedoctor.com/logo-png.jpg",
      },
    },
  };

  return (
    <article className="min-h-screen bg-[#fafbfc] pb-16">
      
      {/* Schema.org JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. TOP BREADCRUMBS & ARTICLE HEADER */}
      <header className="bg-white border-b border-gray-200 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto space-y-5">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/blog" className="hover:text-black">
              Blog &amp; Guides
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#00897b] font-medium truncate">
              {article.categoryName}
            </span>
          </nav>

          {/* Category Tag */}
          <div>
            <span className="bg-[#00897b]/10 text-[#00897b] border border-[#00897b]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {article.categoryName}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1d1c1a] tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Lead Excerpt */}
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            {article.excerpt}
          </p>

          {/* Author, Date & Share Metadata Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#1d1c1a] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {article.author.avatar || article.author.name.slice(0, 2)}
              </span>
              <div>
                <span className="text-sm font-bold text-gray-900 block leading-tight">
                  {article.author.name}
                </span>
                <span className="text-xs text-gray-500 block">
                  {article.author.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {article.publishedAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00897b]" />
                {article.readTime}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={handleShare}
                className="h-[30px] px-2.5 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy link to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00897b]" />
                    <span className="text-[#00897b]">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 2. FEATURED HERO IMAGE */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 mt-8">
        <div className="rounded-2xl overflow-hidden shadow-md aspect-21/9 bg-gray-100 border border-gray-200">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. MAIN ARTICLE CONTENT */}
      <div className="max-w-[850px] mx-auto px-4 sm:px-6 mt-10 space-y-8">
        
        {/* Render Rich Sections */}
        {article.sections.map((sec, idx) => (
          <section key={sec.id || idx} className="space-y-4">
            
            {/* Section Heading */}
            {sec.heading && (
              <h2 className="text-xl sm:text-2xl font-bold text-[#1d1c1a] tracking-tight">
                {sec.heading}
              </h2>
            )}

            {/* Paragraph Text */}
            <p className="text-base text-gray-700 leading-relaxed font-normal whitespace-pre-line">
              {sec.body}
            </p>

            {/* Callout Alert Box */}
            {sec.calloutType && sec.calloutText && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 my-4 ${
                  sec.calloutType === "warning"
                    ? "bg-red-50/80 border-red-200 text-red-900"
                    : sec.calloutType === "tip"
                    ? "bg-teal-50/80 border-teal-200 text-teal-950"
                    : "bg-blue-50/80 border-blue-200 text-blue-950"
                }`}
              >
                {sec.calloutType === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                {sec.calloutType === "tip" && (
                  <Lightbulb className="w-5 h-5 text-[#00897b] shrink-0 mt-0.5" />
                )}
                {sec.calloutType === "note" && (
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                )}
                <div className="text-sm leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-[11px] block mb-0.5 opacity-80">
                    Technician {sec.calloutType}
                  </span>
                  <span>{sec.calloutText}</span>
                </div>
              </div>
            )}

          </section>
        ))}

        {/* 4. CONNECTED SERVICE REPAIR CTA BANNER */}
        {article.connectedService && (
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#1d1c1a] to-[#2e2a25] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 my-10">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[#4dd0e1] tracking-wider block">
                Professional Philadelphia Service
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                {article.connectedService.title}
              </h3>
              <p className="text-sm text-neutral-300">
                Backed by certified technician bench service and our 90-day warranty.
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0 space-y-2">
              <span className="text-2xl font-black text-[#4dd0e1] block">
                {article.connectedService.price}
              </span>
              <Link
                href={article.connectedService.bookingUrl}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                <span>Book This Repair</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        )}

        {/* 5. ARTICLE TAGS */}
        {article.tags.length > 0 && (
          <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-2">
              Related Tags:
            </span>
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 6. AUTHOR BIO BOX */}
        <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-start gap-4">
          <span className="w-12 h-12 rounded-full bg-[#00897b] text-white text-base font-bold flex items-center justify-center shrink-0">
            {article.author.avatar || article.author.name.slice(0, 2)}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900">
                Written by {article.author.name}
              </span>
              <ShieldCheck className="w-4 h-4 text-[#00897b]" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {article.author.role} at SmartFoneDoctor. Specializing in component-level PCB micro-soldering, OLED display assemblies, and lithium battery calibration.
            </p>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="pt-6 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#00897b] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Guides &amp; Articles</span>
          </Link>
        </div>

      </div>

    </article>
  );
}
