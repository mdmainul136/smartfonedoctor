import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Accessibility Statement | SmartFoneDoctor",
  description:
    "SmartFoneDoctor is committed to digital accessibility and providing a website that is usable for all people, including those with disabilities.",
  keywords: ["Accessibility Statement", "SmartFoneDoctor Accessibility", "WCAG 2.1 AAA"],
};

export default function AccessibilityStatementPage() {
  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12.5px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400">&gt;</li>
            <li className="text-neutral-800 font-medium" aria-current="page">
              Accessibility Statement
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-6 mb-8">
          <h1 className="text-[28px] sm:text-[38px] lg:text-[44px] font-bold text-[#1d1c1a] tracking-tight leading-tight">
            Accessibility Statement
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 mt-2">
            Commitment to Web Content Accessibility Guidelines (WCAG 2.1 Level AA/AAA)
          </p>
        </div>

        {/* Body */}
        <div className="space-y-8 text-[13.5px] sm:text-[14px] text-neutral-700 leading-[1.75] font-normal">
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              Our Commitment
            </h2>
            <p>
              SmartFoneDoctor is committed to ensuring digital accessibility for individuals of all abilities and disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards, following the Web Content Accessibility Guidelines (WCAG 2.1) Level AA standards across all web pages and booking workflows.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              Accessibility Measures
            </h2>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5">
              <li>High-contrast visual design meeting and exceeding the 4.5:1 ratio for standard text.</li>
              <li>Visible focus indicators and full keyboard navigational support.</li>
              <li>Descriptive alt text for images, diagrams, and informative UI graphics.</li>
              <li>Semantic HTML5 landmark tags (`header`, `main`, `nav`, `article`, `footer`).</li>
              <li>Form elements equipped with explicit programmatic labels and aria attributes.</li>
              <li>Integration of the UserWay accessibility assistant widget for custom font sizing, contrast toggling, and screen-reading enhancements.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-neutral-200">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              Feedback &amp; Assistance
            </h2>
            <p>
              If you experience difficulty accessing any part of our website or require assistance in booking a repair, contact our accessibility coordinator:
            </p>
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-1 shadow-xs">
              <p className="font-bold text-[#1d1c1a]">SmartFoneDoctor Accessibility Team</p>
              <p className="text-neutral-600">33 S 52nd St, Philadelphia, PA 19139</p>
              <p className="text-neutral-600">Phone: <a href="tel:+12155982090" className="text-sfd-teal font-semibold hover:underline">(215) 598-2090</a></p>
              <p className="text-neutral-600">Email: <a href="mailto:support@smartfonedoctor.com" className="text-sfd-teal font-semibold hover:underline">support@smartfonedoctor.com</a></p>
            </div>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-12 pt-6 border-t border-neutral-200 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-sfd-teal transition-colors"
          >
            ← Return to Home
          </Link>
          <Link
            href="/schedule-repair"
            className="px-6 py-2.5 rounded-full bg-sfd-teal hover:bg-sfd-dark text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
          >
            Book a Repair
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}

