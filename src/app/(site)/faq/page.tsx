import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { HelpCircle, Calendar, MapPin, Wrench } from "lucide-react";
import Footer from "@/components/layout/Footer";
import { JsonLd, buildFaqSchema, buildBreadcrumbSchema } from "@/lib/schema";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { getCmsPage } from "@/actions/cmsPages";
import { getFaqsAction } from "@/actions/faqs";
import FaqClient from "@/components/site/FaqClient";
import { withCmsMetadata } from "@/lib/cmsMetadata";

// Coded defaults; title, description and canonical can be changed in Admin > Pages > SEO.
const baseMetadata: Metadata = {
  title: brandTitle("Frequently Asked Questions | SmartFoneDoctor"),
  description:
    "Find answers to common questions about phone, tablet, computer, and game console repairs, warranty policies, pricing, and certified pre-owned devices at SmartFoneDoctor.",
};

export async function generateMetadata(): Promise<Metadata> {
  return withCmsMetadata("faq", baseMetadata);
}

export default async function FaqPage() {
  const cmsPage = await getCmsPage("faq");
  const faqsRes = await getFaqsAction();
  const faqs = faqsRes?.success && faqsRes.data ? faqsRes.data : [];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Frequently Asked Questions", url: "/faq" },
  ]);

  // Schema must match what visitors see: when the builder layout is live, its
  // FAQ blocks are the page's questions; otherwise the coded list from the faqs table.
  type BuilderBlock = { type?: string; props?: { items?: { title?: string; description?: string }[] } };
  const builderFaqs =
    cmsPage?.status === "Published"
      ? (((cmsPage.puckData as { content?: BuilderBlock[] } | undefined)?.content ?? [])
          .filter((b) => b.type === "FaqBlock")
          .flatMap((b) => b.props?.items ?? [])
          .filter((i) => i.title && i.description)
          .map((i) => ({ question: i.title as string, answer: i.description as string })))
      : [];
  const faqSchema = buildFaqSchema(
    builderFaqs.length
      ? builderFaqs
      : faqs.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))
  );

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      {/* ── JSON-LD Structured Data ── */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <CMSSectionRenderer slug="faq" initialPage={cmsPage}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">

          {/* 1. Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 text-[12px] text-neutral-500 font-normal">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-sfd-teal transition-colors">
                  Home
                </Link>
              </li>
              <li>&gt;</li>
              <li className="text-neutral-700 font-medium" aria-current="page">
                Frequently Asked Questions
              </li>
            </ol>
          </nav>

          {/* 2. Hero Banner Card */}
          <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[380px] sm:min-h-[440px] flex items-center mb-14 sm:mb-16 shadow-sm">
            {/* Background Photo */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1600&auto=format&fit=crop&q=85"
                alt="Person working on laptop"
                fill
                className="object-cover object-center opacity-45 brightness-75"
                priority
              />
              {/* Contrast overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
            </div>

            {/* Left Hero Content */}
            <div className="relative z-10 max-w-xl p-8 sm:p-12 lg:p-16 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white mb-4">
                <HelpCircle className="w-3.5 h-3.5 text-sfd-teal" />
                <span>FAQS</span>
              </div>

              <h1 className="text-[30px] sm:text-[38px] lg:text-[44px] font-extrabold tracking-tight text-white leading-tight mb-4">
                FAQ About Cell Phone Repair
              </h1>

              <p className="text-[13px] sm:text-[14px] text-neutral-300 leading-relaxed font-normal">
                If you have questions about warranties, what&apos;s wrong with your device, or how SmartFoneDoctor&apos;s repair services work, this section is for you! We&apos;ve compiled a list of our most frequently asked questions about cell phone repairs and our services. Get answers to our FAQ below!
              </p>
            </div>
          </div>

          {/* 3. FAQ Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-semibold text-neutral-600 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-sfd-teal" />
              <span>FAQS</span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <h2 className="text-[26px] sm:text-[32px] font-bold text-[#1d1c1a] tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="flex items-center gap-0.5">
                <span className="text-sfd-teal font-black text-lg leading-none">+</span>
                <span className="text-sfd-teal font-black text-xs leading-none">*</span>
              </div>
            </div>
          </div>

          {/* 4. Dynamic Client-interactive FAQ List */}
          <FaqClient initialFaqs={faqs} />

          {/* 5. Conversion & Cross-Linking CTA Banner */}
          <div className="max-w-[1000px] mx-auto mt-16 rounded-[24px] bg-[#1d1c1a] text-white p-8 sm:p-10 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-200">
                <Wrench className="w-4 h-4 text-sfd-teal" />
                <span>Have a Specific Device Issue?</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Get an Upfront Diagnostic &amp; Price Quote
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-lg">
                Walk in to any of our 3 Philadelphia store branches or schedule online to hold replacement parts and skip the queue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/schedule-repair"
                className="w-full sm:w-auto text-center px-6 py-3.5 rounded-full bg-sfd-teal hover:bg-sfd-tealDark text-white font-bold text-xs uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule Repair</span>
              </Link>
              <Link
                href="/locations/i/book-repair"
                className="w-full sm:w-auto text-center px-5 py-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition border border-neutral-700 flex items-center justify-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Find Nearest Store</span>
              </Link>
            </div>
          </div>

        </div>
      </CMSSectionRenderer>

      {/* Footer */}
      <Footer />
    </main>
  );
}
