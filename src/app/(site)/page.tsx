"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, BookOpen, Clock, ArrowRight } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/layout/Footer";
import { Benefits } from "@/components/home/Benefits";
import { CommonIssues } from "@/components/home/CommonIssues";
import { StoreLocator } from "@/components/locator/StoreLocator";
import { WiseCertification } from "@/components/home/WiseCertification";
import { FaqSection, HOMEPAGE_FAQS } from "@/components/home/FaqSection";
import { JsonLd, buildWebSiteSchema, buildFaqSchema } from "@/lib/schema";
import { INITIAL_BLOG_ARTICLES } from "@/lib/blogData";

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true);

  const webSiteSchema = buildWebSiteSchema();
  const faqSchema = buildFaqSchema(HOMEPAGE_FAQS);
  const featuredArticles = INITIAL_BLOG_ARTICLES.slice(0, 3);

  return (
    <main>
      {/* ── JSON-LD Structured Data ── */}
      <JsonLd data={webSiteSchema} />
      <JsonLd data={faqSchema} />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Why Choose Us / Benefits */}
      <Benefits />

      {/* 3. Common Issues Grid */}
      <CommonIssues />

      {/* 4. Book a Repair & Store Locator with Map */}
      <div id="locations">
        <StoreLocator
          isHomePage={true}
          showBreadcrumbs={false}
          title="Find Your Nearest SmartFoneDoctor Store"
          subtitle="Walk in anytime or choose your store below to book your repair. 3 convenient Google-verified repair locations across Philadelphia."
        />
      </div>

      {/* 5. The SmartFoneDoctor Difference - WISE Certified Technicians */}
      <WiseCertification />

      {/* 6. Latest Repair Guides & Bench Diagnostics Section */}
      <section className="bg-[#fcfcfc] py-14 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/70">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sfd-teal mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Technician Knowledge Base</span>
              </div>
              <h2 className="text-[22px] sm:text-[26px] font-bold text-[#1d1c1a] tracking-tight">
                Latest Repair Guides &amp; Diagnostics
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs font-bold text-sfd-teal hover:underline inline-flex items-center gap-1 group self-start sm:self-auto"
            >
              <span>Explore All Guides &amp; Insights</span>
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
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-900">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
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
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
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

      {/* 7. Frequently Asked Questions (Accordion) */}
      <FaqSection />

      {/* Blue Lead/Subscribe Strip */}
      {showBanner && (
        <div className="bg-[#1a4ea0] text-white py-3 px-4 shadow-sm">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="font-bold text-sm tracking-wide uppercase whitespace-nowrap">
              Subscribe for Email Updates
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center"
            >
              <input
                type="text"
                placeholder="Type your name"
                aria-label="Your full name"
                className="bg-white text-neutral-800 text-xs px-3 py-1.5 rounded-xs border border-transparent focus:outline-none w-36 sm:w-44"
              />
              <input
                type="email"
                placeholder="Type your email"
                aria-label="Your email address"
                className="bg-white text-neutral-800 text-xs px-3 py-1.5 rounded-xs border border-transparent focus:outline-none w-36 sm:w-44"
              />
              <input
                type="tel"
                placeholder="Type your phone number"
                aria-label="Your phone number"
                className="bg-white text-neutral-800 text-xs px-3 py-1.5 rounded-xs border border-transparent focus:outline-none w-36 sm:w-44"
              />
              <button
                type="submit"
                className="bg-[#2d3748] hover:bg-[#1a202c] text-white text-xs font-semibold px-4 py-1.5 rounded-xs uppercase tracking-wider transition cursor-pointer"
              >
                Submit
              </button>
            </form>

            <button
              onClick={() => setShowBanner(false)}
              className="text-white hover:text-neutral-300 transition p-1 cursor-pointer"
              aria-label="Close newsletter banner"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 7. Footer */}
      <Footer />
    </main>
  );
}
