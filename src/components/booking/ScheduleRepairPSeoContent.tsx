"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  Wrench,
  CheckCircle2,
  MapPin,
  Phone,
  Calendar,
  ChevronDown,
  Star,
  Award,
  Cpu,
  Lock,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
  Check,
} from "lucide-react";
import { resolveDevice, PSEO_DEVICES } from "@/lib/pSeoEngine";

interface Props {
  deviceParam?: string;
  makeParam?: string;
  modelParam?: string;
  issueParam?: string;
}

export default function ScheduleRepairPSeoContent({
  deviceParam,
  makeParam,
  modelParam,
  issueParam,
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<"specs" | "features" | "why" | "faqs">("specs");

  // Resolve device if present in query param (e.g. "iPad-Pro-12.9" or "ipad")
  const queryDevice = deviceParam || modelParam || "";
  const matchedDevice = queryDevice ? resolveDevice(queryDevice) : undefined;

  const deviceName = matchedDevice
    ? matchedDevice.name
    : modelParam
    ? `${makeParam ? makeParam + " " : ""}${modelParam}`
    : "Smartphone, Tablet & Laptop";

  const categoryName = matchedDevice
    ? matchedDevice.categoryName
    : makeParam
    ? `${makeParam} Device Repair`
    : "Electronics Hardware Repair";

  const deviceSpecs = matchedDevice
    ? matchedDevice.specs
    : "All generations supported · OEM & Premium Grade-A+ components · Same-day walk-in service";

  // Specifications Table Data
  const specifications = [
    { label: "Service Name", value: `${deviceName} Express Repair & Diagnostics` },
    { label: "Device Category", value: categoryName },
    { label: "Turnaround Time", value: "20 – 45 Minutes (Average Same-Day Bench Service)" },
    { label: "Diagnostic Fee", value: "$0.00 (100% Free Upfront Assessment)" },
    { label: "Component Quality", value: "OEM Original & Premium Grade-A+ Certified Assemblies" },
    { label: "Warranty Coverage", value: "90-Day Comprehensive Parts & Labor Guarantee" },
    { label: "Technician Credentials", value: "WISE Certified Level 2 & IPC-A-610 Master Technicians" },
    { label: "Data Safety Policy", value: "Zero Data Wipe Guarantee (Photos, files & apps kept 100% intact)" },
    { label: "Walk-in Policy", value: "Walk-ins Welcome Daily – No Appointment Required" },
    { label: "Flagship Bench Location", value: "33 S 52nd St, Philadelphia, PA 19139 (West Philly)" },
    { label: "Store Hours", value: "Mon–Sat: 10:00 AM – 7:00 PM | Sun: 11:00 AM – 5:00 PM" },
    { label: "Customer Helpline", value: "(215) 598-2090 / (215) 387-1700" },
  ];

  // Key Features
  const keyFeatures = [
    {
      title: "Same-Day Express Turnaround",
      desc: "Most cracked screens, battery replacements, and charging port fixes are completed in under 45 minutes while you wait.",
    },
    {
      title: "TrueTone & Face ID / Touch ID Calibration",
      desc: "Our technicians use specialized EEPROM programmers to transfer display serials and ambient sensors, preserving factory biometric security and color calibration.",
    },
    {
      title: "100% Zero Data Loss Policy",
      desc: "Unlike factory mail-in programs that automatically factory-reset your device, our bench repairs leave your photos, messages, apps, and credentials completely untouched.",
    },
    {
      title: "Component-Level Micro-Soldering",
      desc: "In-house soldering station for HDMI ports, USB-C charge ports, blown backlight filters, and liquid damage board repairs.",
    },
    {
      title: "OEM & Premium Certified Parts",
      desc: "We stock factory original and top-tier Grade-A+ displays, high-cycle batteries, and precision flex cables to ensure original tactile feel.",
    },
    {
      title: "90-Day Peace of Mind Warranty",
      desc: "Every completed repair is backed by a 90-day parts and labor warranty against manufacturing defects and touch unresponsiveness.",
    },
  ];

  // High-Intent FAQs for pSEO Rich Snippets
  const faqs = [
    {
      question: `How much does a ${deviceName} repair cost in Philadelphia?`,
      answer: `At SmartFoneDoctor, diagnostic testing is always 100% free. Screen replacements typically start from $69–$129 depending on your specific model and whether you choose our Premium Aftermarket or OEM Original component tier. You receive a guaranteed upfront quote before any work starts—zero hidden fees.`,
    },
    {
      question: "Do I need to make an appointment or can I walk in?",
      answer: "No appointment is necessary! Walk-ins are welcome every day at our 33 S 52nd St flagship location in West Philadelphia as well as our Lancaster Ave and Woodland Ave branches. Booking online simply reserves your replacement part and secures priority bench queue time.",
    },
    {
      question: `Will I lose my photos, files, or apps during a ${deviceName} repair?`,
      answer: "No. Unlike carrier stores or manufacturer mail-in depots that wipe devices clean, our hardware repairs are performed directly on the damaged component without touching your motherboard data storage. Your photos, contacts, and personal data remain 100% safe and intact.",
    },
    {
      question: `How long will it take to repair my ${deviceName}?`,
      answer: "Most smartphone and tablet screen or battery replacements take between 20 and 45 minutes. More complex micro-soldering, motherboard diagnostics, or ultrasonic liquid-damage restorations are typically completed within 2 to 24 hours.",
    },
    {
      question: "What does the 90-day repair warranty cover?",
      answer: "Our 90-day warranty covers any defect in the installed replacement part (such as touch screen unresponsiveness, LCD ghosting, flickering, or battery cycle failure) as well as the technician workmanship. Physical drops, cracked glass after pickup, and liquid damage are excluded.",
    },
    {
      question: "Where are your Philadelphia repair shops located?",
      answer: "Our primary walk-in flagship is located at 33 S 52nd St, Philadelphia, PA 19139, right off Market Street next to the 52nd St SEPTA Market-Frankford Line subway station. We also operate locations at 4016 Lancaster Ave and 4060 Lancaster Ave in West Philadelphia / University City.",
    },
    {
      question: "What should I do before bringing my device to the shop?",
      answer: "If your screen is still visible, we recommend performing a quick iCloud or Google Drive backup and knowing your passcode so our technicians can run the 16-point post-repair quality checklist. If your device is completely dead or unresponsive, simply bring it in and our bench team will perform a free hardware diagnostic.",
    },
  ];

  // Schema.org FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  // Schema.org Service structured data
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${deviceName} Repair Philadelphia`,
    serviceType: categoryName,
    description: `Professional same-day ${deviceName} repair service in Philadelphia. Screen replacement, battery repair, water damage recovery, and micro-soldering with 90-day warranty.`,
    provider: {
      "@type": "LocalBusiness",
      name: "SmartFoneDoctor",
      telephone: "+1-215-598-2090",
      address: {
        "@type": "PostalAddress",
        streetAddress: "33 S 52nd St",
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: "19139",
        addressCountry: "US",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "284",
      },
    },
    areaServed: [
      "West Philadelphia",
      "University City",
      "Center City Philadelphia",
      "Fishtown",
      "South Philadelphia",
    ],
  };

  // Popular Device Shortcuts for Crawl Equity
  const popularDevices = [
    { name: "iPhone 16 Pro", cat: "smartphone", slug: "iphone-16-pro", price: "From $119" },
    { name: "iPhone 15 / 15 Pro", cat: "smartphone", slug: "iphone-15", price: "From $99" },
    { name: 'iPad Pro 12.9"', cat: "tablet", slug: "ipad-pro-12-9", price: "From $149" },
    { name: "iPad Air 5th Gen", cat: "tablet", slug: "ipad-air-5", price: "From $129" },
    { name: "Samsung Galaxy S25", cat: "smartphone", slug: "galaxy-s25", price: "From $139" },
    { name: "MacBook Pro M-Series", cat: "computer", slug: "macbook-pro", price: "From $169" },
    { name: "PlayStation 5 HDMI", cat: "console", slug: "playstation-5", price: "From $119" },
    { name: "Water Damage Repair", cat: "smartphone", slug: "iphone-16-pro", price: "Free Diagnostic" },
  ];

  return (
    <section className="border-t border-neutral-200/90 bg-white text-neutral-800 pt-12 pb-20">
      {/* ── Schema.org JSON-LD for Search Engines ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── SECTION HEADER & PILL TABS (E-Commerce Style like Reference Image) ── */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-[#009691]/10 text-[#009691] border border-[#009691]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Philadelphia Repair Bench Spec
            </span>
            <span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium border border-neutral-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#009691]" />
              Same-Day 20–45 Min Turnaround
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              90-Day Warranty Included
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1c1a] tracking-tight">
            {deviceName} Repair Specifications &amp; Bench Overview
          </h2>
          <p className="text-sm text-neutral-600 mt-2 max-w-3xl leading-relaxed">
            SmartFoneDoctor provides certified, fast-turnaround hardware repair for {deviceName} devices in Philadelphia, PA. 
            All repairs are performed by WISE-certified bench technicians using factory-grade components with zero data loss.
          </p>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-neutral-200 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "specs"
                  ? "bg-[#009691] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Specification Table
            </button>
            <button
              onClick={() => setActiveTab("features")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "features"
                  ? "bg-[#009691] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Key Repair Features
            </button>
            <button
              onClick={() => setActiveTab("why")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "why"
                  ? "bg-[#009691] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Why Choose SmartFoneDoctor
            </button>
            <button
              onClick={() => setActiveTab("faqs")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === "faqs"
                  ? "bg-[#009691] text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              Hardware FAQs ({faqs.length})
            </button>
          </div>
        </div>

        {/* ── TAB 1: SPECIFICATION TABLE (Matching E-Commerce Screenshot) ── */}
        <div className="space-y-10">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#009691]" />
                  <span>Technical Bench Specification</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Hardware standards and laboratory guidelines for {deviceName}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#009691] uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-neutral-200">
                Verified Bench Spec
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {specifications.map((spec, idx) => (
                    <tr
                      key={spec.label}
                      className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50/60"}
                    >
                      <th
                        scope="row"
                        className="py-3 px-6 text-xs font-bold text-neutral-700 w-1/3 sm:w-1/4 border-b border-neutral-200/70"
                      >
                        {spec.label}
                      </th>
                      <td className="py-3 px-6 text-xs sm:text-sm text-neutral-900 border-b border-neutral-200/70 font-medium">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TAB 2: KEY FEATURES & BENCH CAPABILITIES ── */}
          <div className="bg-[#fafbfc] rounded-2xl border border-neutral-200 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-[#009691]" />
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                Key Features &amp; Laboratory Standards for {deviceName}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mb-6">
              Every device brought to our Philadelphia stores receives surgical-grade bench care:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keyFeatures.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#009691]/10 text-[#009691] flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed pl-8">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── TAB 3: WHY CHOOSE SMARTFONEDOCTOR IN PHILADELPHIA ── */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#009691] block">
                  Philadelphia&apos;s Independent Repair Authority
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Why Choose SmartFoneDoctor in Philadelphia?
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Located in the heart of West Philadelphia at 33 S 52nd St, SmartFoneDoctor has been 
                  the trusted electronics repair provider for University City students, local families, 
                  and city professionals for years. Unlike big-box retailers that outsource repairs to out-of-state 
                  warehouses for weeks, all our repairs are performed on-site at our own clean benches.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="text-2xl font-black text-neutral-900">5,000+</div>
                    <div className="text-xs text-neutral-500 mt-1 font-medium">Local Philly Repairs</div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="text-2xl font-black text-neutral-900">4.9 ★</div>
                    <div className="text-xs text-neutral-500 mt-1 font-medium">Customer Rating</div>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="text-2xl font-black text-neutral-900">3 Stores</div>
                    <div className="text-xs text-neutral-500 mt-1 font-medium">Walk-In Locations</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#1d1c1a] text-white p-6 rounded-2xl space-y-4 shadow-md">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>WISE Certified Shop</span>
                </div>
                <h4 className="text-base font-bold text-white">
                  Visit Our West Philly Flagship
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  33 S 52nd St, Philadelphia, PA 19139<br />
                  Right by 52nd St Market-Frankford Subway Station.
                </p>
                <div className="pt-2 border-t border-neutral-700/60 flex items-center justify-between text-xs text-neutral-400">
                  <span>Mon–Sat: 10am–7pm</span>
                  <span>Sun: 11am–5pm</span>
                </div>
                <a
                  href="tel:+12155982090"
                  className="block w-full text-center py-2.5 rounded-xl bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-bold uppercase tracking-wider transition"
                >
                  Call (215) 598-2090
                </a>
              </div>
            </div>
          </div>

          {/* ── TAB 4: FREQUENTLY ASKED QUESTIONS (ACCORDION WITH SCHEMA) ── */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#009691] block mb-1">
                  Got Questions? We Have Answers
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Frequently Asked Questions About {deviceName} Repair
                </h3>
              </div>
              <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
                {faqs.length} Answers
              </span>
            </div>

            <div className="space-y-3 mt-6">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-neutral-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-neutral-900 bg-neutral-50/60 hover:bg-neutral-100/70 transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 sm:p-5 text-xs sm:text-sm text-neutral-700 leading-relaxed bg-white border-t border-neutral-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── TAB 5: CHECK MORE POPULAR REPAIRS (INTERNAL LINKING FOR PSEO) ── */}
          <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#009691]" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900">
                  Check More Philadelphia Hardware Repairs
                </h3>
              </div>
              <Link
                href="/repairs"
                className="text-xs font-bold text-[#009691] hover:underline flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-neutral-500 mb-6">
              Looking for a different device or repair service? Book any device online for reserved bench time:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {popularDevices.map((item) => (
                <Link
                  key={item.name}
                  href={`/schedule-repair?device=${item.slug}`}
                  className="bg-white p-4 rounded-xl border border-neutral-200 hover:border-[#009691] hover:shadow-2xs transition-all group"
                >
                  <span className="text-xs font-bold text-neutral-900 group-hover:text-[#009691] transition-colors block truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {item.price}
                    </span>
                    <span className="text-[10px] text-neutral-400 group-hover:text-[#009691] transition-colors font-medium">
                      Book &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
