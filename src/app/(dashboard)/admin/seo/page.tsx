"use client";

import { useState } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import {
  Globe,
  Save,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Star,
  Clock,
  Shield,
  Smartphone,
  Share2,
} from "lucide-react";

export default function SeoManagerPage() {
  const { stores } = useStoreContext();
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "SmartFoneDoctor (Smartphone Doctor)",
    telephone: "+1-215-598-2090",
    url: "https://smartfonedoctor.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "33 S 52nd St",
      addressLocality: "Philadelphia",
      addressRegion: "PA",
      postalCode: "19139",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 39.9572,
      longitude: -75.2267,
    },
    department: stores.map((s) => ({
      "@type": "LocalBusiness",
      name: s.name,
      telephone: s.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: s.address,
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: s.cityStateZip.match(/\d{5}/)?.[0] || "19104",
        addressCountry: "US",
      },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1524",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonLdData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">
              LocalBusiness SEO &amp; Google Schema
            </h1>
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Structured Data, Google Rich Snippets, and OpenGraph social metadata for all 3 Philadelphia stores
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <button
            type="button"
            onClick={handleCopy}
            className="h-[34px] px-3.5 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied JSON-LD!" : "Copy Schema Code"}</span>
          </button>
        </div>
      </div>

      {/* 2. STORE NAP & LOCAL AUTHORITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stores.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-[#e8e8e8] rounded-[10px] p-4 shadow-2xs flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#009691] uppercase tracking-wider">
                  Store #{s.id}
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  Google Verified
                </span>
              </div>
              <h2 className="text-[14px] font-bold text-[#111111]">{s.name}</h2>
              <p className="text-[12px] text-gray-600 mt-1">{s.address}, Philadelphia, PA</p>
            </div>

            <div className="bg-[#fafafa] p-2.5 rounded-[6px] text-[11px] text-gray-600 flex flex-col gap-1 border border-gray-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#009691]" />
                <span className="font-semibold text-gray-800">{s.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>4.9 / 5.0 (500+ Google Reviews)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>Mon–Sat 10:00 AM – 7:00 PM</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. JSON-LD CODE VIEWER */}
      <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#f2f2f2]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#009691]" />
            <h2 className="text-[15px] font-bold text-[#111111]">
              Live JSON-LD Schema (Rendered on public site &lt;head&gt;)
            </h2>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Schema.org / LocalBusiness
          </span>
        </div>

        <pre className="p-4 rounded-[8px] bg-[#111111] text-emerald-400 font-mono text-[12px] leading-relaxed overflow-x-auto max-h-[380px] no-scrollbar">
          {JSON.stringify(jsonLdData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

