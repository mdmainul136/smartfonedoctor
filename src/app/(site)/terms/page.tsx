import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Use | SmartFoneDoctor",
  description:
    "Review the Terms of Use governing your access to and use of SmartFoneDoctor's website, diagnostic estimates, and device repair services.",
  keywords: [
    "Terms of Use",
    "SmartFoneDoctor Terms",
    "Repair Service Agreement",
    "Warranty Terms Philadelphia",
  ],
};

export default function TermsOfUsePage() {
  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-[12.5px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li className="text-neutral-400">&gt;</li>
            <li className="text-neutral-800 font-medium" aria-current="page">
              Terms of Use
            </li>
          </ol>
        </nav>

        {/* 2. Main Page Header */}
        <div className="border-b border-neutral-200 pb-6 mb-8">
          <h1 className="text-[28px] sm:text-[38px] lg:text-[44px] font-bold text-[#1d1c1a] tracking-tight leading-tight">
            Terms of Use
          </h1>
          <p className="text-xs sm:text-[13px] text-neutral-500 mt-2">
            Last Updated: November 2026 • Effective Date: January 1, 2026
          </p>
        </div>

        {/* 3. Legal Document Body (CPR Layout) */}
        <div className="space-y-8 text-[13.5px] sm:text-[14px] text-neutral-700 leading-[1.75] font-normal">
          
          {/* Acceptance of Terms Callout */}
          <section className="p-5 sm:p-6 rounded-2xl bg-neutral-100/90 border border-neutral-200/90 text-neutral-900 font-medium leading-relaxed">
            <p className="uppercase text-xs tracking-wider font-bold text-neutral-800 mb-2">
              Important Legal Notice
            </p>
            <p>
              PLEASE READ THESE TERMS OF USE CAREFULLY BEFORE ACCESSING OR USING ANY PORTION OF THIS WEBSITE OR ENGAGING ANY OF SMARTFONEDOCTOR&apos;S REPAIR SERVICES. BY ACCESSING THIS SITE, REQUESTING A DIAGNOSTIC QUOTE, OR VISITING A STORE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE LEGALLY BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT ACCESS OR USE THIS SITE.
            </p>
          </section>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              1. About the Website &amp; Services
            </h2>
            <p>
              This website is owned and operated by SmartFoneDoctor (&quot;SmartFoneDoctor,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), headquartered in Philadelphia, Pennsylvania. SmartFoneDoctor provides electronic device repair, diagnostics, screen replacements, battery services, micro-soldering, and certified pre-owned device sales for smartphones, tablets, computers, and game consoles through its physical store locations and digital booking portals.
            </p>
            <p>
              All store locations operated under the SmartFoneDoctor brand maintain strict operational, safety, and technician quality standards. Each location independently coordinates in-person repair intakes, hardware inventory, and specific customer inquiries.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              2. Permitted Use of the Website
            </h2>
            <p>
              You are granted a personal, revocable, limited, non-exclusive, and non-transferable license to access and use this website solely for informational purposes, to browse device repair capabilities, obtain diagnostic estimates, locate physical store branches, track active repair ticket progress, and book service consultations.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              3. Prohibited Conduct &amp; Misuse
            </h2>
            <p>
              As an express condition of your use of this site, you agree that you will not:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-2">
              <li>
                Use any automated script, scraper, bot, spider, crawler, or scraping tool to monitor, index, or extract data, images, prices, or store records from the site without express written consent.
              </li>
              <li>
                Engage in any denial-of-service (DoS) attack, flood our web servers, bypass rate limits, or intentionally introduce viruses, trojans, worms, or other malicious code.
              </li>
              <li>
                Attempt to gain unauthorized access to our internal booking systems, database servers, repair status tracking portals, or networks connected to our platform.
              </li>
              <li>
                Falsify, forge, or manipulate identifiers, ticket IDs, or customer names to access another individual&apos;s confidential repair ticket or personal device data.
              </li>
              <li>
                Frame, mirror, or utilize framing techniques to enclose any trademark, logo, or proprietary information of SmartFoneDoctor without explicit authorization.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              4. Independent Third-Party Repair Disclaimer &amp; Trademarks
            </h2>
            <p>
              SmartFoneDoctor is an independent repair service provider specializing in consumer electronic devices. We are not an Apple Authorized Service Provider (AASP), nor are we directly affiliated with, sponsored by, or endorsed by Apple Inc., Samsung Electronics Co., Ltd., Google LLC, Sony Interactive Entertainment Inc., Microsoft Corporation, or Nintendo of America Inc.
            </p>
            <p>
              All product and company names, logos, and brand designations displayed on this website—including Apple, iPhone, iPad, Mac, MacBook, iMac, Samsung, Galaxy, Pixel, PlayStation, Xbox, and Nintendo—are registered trademarks and trade names of their respective owners. Their reference on our website is purely for nominative fair-use purposes to identify the specific make, model, and compatibility of electronic devices we repair.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              5. Customer Repair Service Terms &amp; Data Disclaimer
            </h2>
            <p>
              When submitting any device to a SmartFoneDoctor store for diagnostic examination or physical hardware repair:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-2">
              <li>
                <strong className="text-neutral-900 font-semibold">Data Backup Responsibility:</strong> You understand that hardware servicing, logic board micro-soldering, and liquid damage recovery can result in accidental or unavoidable loss of stored user data. You are solely responsible for creating a complete external backup of all personal files, photos, contacts, and software before checking in your device. SmartFoneDoctor is not liable for data loss during service.
              </li>
              <li>
                <strong className="text-neutral-900 font-semibold">Preexisting Damage &amp; Internal Complications:</strong> Devices brought in with severe screen shattering, liquid exposure, or frame bending may experience latent component failure during disassembly. Technicians will notify you if preexisting internal board damage is discovered before proceeding.
              </li>
              <li>
                <strong className="text-neutral-900 font-semibold">Estimates &amp; Approval:</strong> Upfront diagnostic estimates are non-binding until our technicians have disassembled and inspected the device. Any additional parts required will be quoted for your authorization prior to installation.
              </li>
              <li>
                <strong className="text-neutral-900 font-semibold">Unclaimed &amp; Abandoned Devices:</strong> Devices completed and notified for pickup must be collected within 60 calendar days of initial notification. Devices left uncollected after 60 days may be subject to storage fees or recycled in accordance with Pennsylvania statutory disposition laws.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              6. Limited Repair Warranty
            </h2>
            <p>
              All replacement parts installed by our certified technicians are backed by a limited repair warranty covering manufacturing defects in the installed component. This warranty covers parts and labor necessary to rectify defects under normal operating conditions.
            </p>
            <p>
              Our warranty expressly excludes coverage for post-repair physical accidental drops, glass cracking, liquid exposure, unauthorized third-party tampering, or user software modification (jailbreaking/rooting). Consult your in-store repair receipt for the precise duration applicable to your service tier.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              7. Disclaimer of Warranties
            </h2>
            <div className="p-4 rounded-xl bg-neutral-100 text-neutral-800 text-xs sm:text-[13px] leading-relaxed uppercase font-mono">
              THIS WEBSITE, ITS CONTENTS, ONLINE STATUS TRACKERS, AND ESTIMATE TOOLS ARE PROVIDED STRICTLY ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT. SMARTFONEDOCTOR DOES NOT WARRANT THAT THE WEBSITE WILL OPERATE UNINTERRUPTED OR ERROR-FREE.
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              8. Limitation of Liability
            </h2>
            <div className="p-4 rounded-xl bg-neutral-100 text-neutral-800 text-xs sm:text-[13px] leading-relaxed uppercase font-mono">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SMARTFONEDOCTOR, ITS OFFICERS, DIRECTORS, EMPLOYEES, TECHNICIANS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS INTERRUPTION) ARISING OUT OF OR IN CONNECTION WITH YOUR ACCESS TO OR INABILITY TO ACCESS THIS SITE, OR REPAIR SERVICES RENDERED, REGARDLESS OF THE THEORY OF LIABILITY.
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              9. SMS &amp; Mobile Communications
            </h2>
            <p>
              By providing your mobile telephone number during repair booking, status inquiry, or in-store intake, you consent to receive informational and transactional SMS messages regarding your repair ticket status, pick-up readiness, and technician inquiries. Message frequency depends on your repair cycle. Message and data rates may apply. You may opt out of SMS messages at any time by replying &quot;STOP&quot;. For assistance, text &quot;HELP&quot; or call (215) 598-2090.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              10. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms of Use and any claims or disputes arising out of or related to this website or services provided shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without giving effect to any principles of conflicts of law. You irrevocably submit to the exclusive jurisdiction of the state and federal courts situated in Philadelphia County, Pennsylvania.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              11. Modifications to Terms
            </h2>
            <p>
              SmartFoneDoctor reserves the right to modify, amend, or update these Terms of Use at any time without prior individual notice. All updates will be published directly on this page with an updated &quot;Last Updated&quot; timestamp. Your continued use of the website following the posting of revised Terms constitutes your unconditional acceptance.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-3 pt-4 border-t border-neutral-200">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1d1c1a] tracking-tight">
              12. Contact &amp; Legal Notices
            </h2>
            <p>
              If you have any questions, concerns, or legal notices regarding these Terms of Use or our service operations, contact us through any of the following channels:
            </p>
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-1.5 shadow-xs">
              <p className="font-bold text-[#1d1c1a]">SmartFoneDoctor (Flagship Office)</p>
              <p className="text-neutral-600">33 S 52nd St, Philadelphia, PA 19139, United States</p>
              <p className="text-neutral-600">
                Telephone:{" "}
                <a href="tel:+12155982090" className="text-sfd-teal font-semibold hover:underline">
                  (215) 598-2090
                </a>
              </p>
              <p className="text-neutral-600">
                Email:{" "}
                <a href="mailto:support@smartfonedoctor.com" className="text-sfd-teal font-semibold hover:underline">
                  support@smartfonedoctor.com
                </a>
              </p>
              <p className="text-neutral-600">
                Store Hours: Monday – Saturday: 10:00 am – 7:00 pm | Sunday: Closed
              </p>
            </div>
          </section>

        </div>

        {/* Back to Home CTA button */}
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

      {/* Global Footer */}
      <Footer />
    </main>
  );
}

