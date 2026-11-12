import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | SmartFoneDoctor",
  description:
    "Learn how SmartFoneDoctor collects, protects, uses, and respects your personal information and device data.",
  keywords: ["Privacy Policy", "SmartFoneDoctor Privacy", "Data Protection Philadelphia"],
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="border-b border-neutral-200 pb-6 mb-8">
          <h1 className="text-[28px] sm:text-[38px] lg:text-[44px] font-bold text-[#1d1c1a] tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 mt-2">
            Last Updated: November 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Body Content */}
        <div className="space-y-8 text-[13.5px] sm:text-[14px] text-neutral-700 leading-[1.75] font-normal">
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              1. Information We Collect
            </h2>
            <p>
              SmartFoneDoctor collects information necessary to coordinate repair appointments, provide diagnostic quotes, and communicate repair status. This may include your name, email address, mobile telephone number, device make and model, diagnostic symptom descriptions, and physical billing/shipping address if courier or mail-in services are requested.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              2. Protection of Customer Device Data
            </h2>
            <p>
              We treat your electronic device data with the utmost confidentiality. Our technicians will never copy, browse, or export your personal photos, messages, contacts, or documents. Passcodes provided during intake are utilized solely to test hardware functionality (e.g., touch screen responsiveness, camera focus, microphone clarity, and speaker output) before and after service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              3. How We Use Your Information
            </h2>
            <p>
              We use your contact details solely to:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-1.5">
              <li>Send repair ticket status updates and pick-up readiness notifications.</li>
              <li>Provide accurate cost estimates and warranty records.</li>
              <li>Respond to customer service inquiries and schedule consultations.</li>
              <li>Send periodic promotional discounts only if you explicitly opted in.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              4. Third-Party Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We may share data only with trusted infrastructure providers (such as SMS delivery gateways and secure payment processors) strictly to execute services requested by you.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-neutral-200">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              5. Contact Us Regarding Privacy
            </h2>
            <p>
              For privacy-related inquiries, contact us at:
            </p>
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-1 shadow-xs">
              <p className="font-bold text-[#1d1c1a]">SmartFoneDoctor Privacy Officer</p>
              <p className="text-neutral-600">33 S 52nd St, Philadelphia, PA 19139</p>
              <p className="text-neutral-600">Email: <a href="mailto:support@smartfonedoctor.com" className="text-sfd-teal font-semibold hover:underline">support@smartfonedoctor.com</a></p>
              <p className="text-neutral-600">Phone: <a href="tel:+12155982090" className="text-sfd-teal font-semibold hover:underline">(215) 598-2090</a></p>
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
            href="/terms"
            className="text-xs sm:text-sm font-semibold text-sfd-teal hover:underline"
          >
            View Terms of Use →
          </Link>
        </div>

      </div>

      <Footer />
    </main>
  );
}

