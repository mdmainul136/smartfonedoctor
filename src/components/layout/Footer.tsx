"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { twitterHandleToUrl, useSiteBrand } from "@/components/site/SiteBrandContext";

const ICON_PATHS = {
  Facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  X: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  Instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  YouTube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
};

const linkClass =
  "inline-block py-1 text-[14px] text-neutral-300 hover:text-sfd-teal transition-colors";
const headingClass =
  "text-[15px] font-bold text-white mb-3 sm:mb-4 tracking-tight";

export default function Footer() {
  const brand = useSiteBrand();
  const phoneDisplay = brand.contactPhone.trim() || "(215) 598-2090";
  const phoneDigits = phoneDisplay.replace(/[^\d+]/g, "") || "2155982090";
  const addressLine = [brand.streetAddress.trim(), brand.cityStateZip.trim()]
    .filter(Boolean)
    .join(", ") || "33 S 52nd St, Philadelphia, PA 19139";
  const hoursLine = brand.businessHours.trim() || "Mon–Sat: 10:00 AM – 7:00 PM";

  const twitterUrl = twitterHandleToUrl(brand.twitterHandle);
  const socials = [
    { name: "Facebook", href: brand.facebookUrl.trim(), path: ICON_PATHS.Facebook },
    { name: "X", href: twitterUrl || "", path: ICON_PATHS.X },
    { name: "Instagram", href: brand.instagramUrl.trim(), path: ICON_PATHS.Instagram },
    { name: "YouTube", href: brand.youtubeUrl.trim(), path: ICON_PATHS.YouTube },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="bg-[#fcfcfc] pt-12 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-200/50">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-4">

        {/* ===== 1. MAIN DARK CARD (4-Column Layout) ===== */}
        <div className="bg-[#111315] text-white rounded-2xl sm:rounded-[20px] border border-neutral-800/80 w-full p-6 sm:p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">

            {/* Column 1: Brand & Contact (4 Columns on Desktop) */}
            <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <Link href="/" className="inline-flex items-center gap-3 group">
                  <Image
                    src="/logo-png.jpg"
                    alt="SmartFoneDoctor Logo"
                    width={180}
                    height={60}
                    priority
                    className="h-10 sm:h-12 w-auto object-contain rounded-md"
                  />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold tracking-tight text-white group-hover:text-sfd-teal transition-colors">
                      SMARTFONE DOCTOR
                    </span>
                    <span className="text-[11px] text-neutral-400 tracking-wider uppercase font-medium">
                      by Certified Tech
                    </span>
                  </div>
                </Link>

                <p className="text-[13px] text-neutral-400 leading-relaxed max-w-sm">
                  Philadelphia&apos;s trusted experts for fast, same-day device repairs.
                </p>
              </div>

              {/* Quick Contact Block */}
              <div className="space-y-2 text-[13px] text-neutral-300 pt-3 border-t border-neutral-800/80">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-sfd-teal shrink-0 mt-0.5" />
                  <Link href="/locations/i/book-repair" className="hover:text-sfd-teal transition-colors">
                    {addressLine}
                  </Link>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sfd-teal shrink-0" />
                  <a href={`tel:${phoneDigits}`} className="hover:text-sfd-teal transition-colors font-medium">
                    {phoneDisplay}
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-400">
                  <Clock className="w-4 h-4 text-sfd-teal shrink-0" />
                  <span>{hoursLine}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Repair Services (3 Columns on Desktop) */}
            <nav aria-label="Repair services" className="col-span-1 md:col-span-4 lg:col-span-3">
              <h2 className={headingClass}>Repair Services</h2>
              <ul className="space-y-1">
                <li><Link href="/repairs/smartphone/iphone-repair" className={linkClass}>iPhone Repair</Link></li>
                <li><Link href="/repairs/smartphone" className={linkClass}>Smartphone Repair</Link></li>
                <li><Link href="/repairs/computer/imac-repair" className={linkClass}>Mac Repair</Link></li>
                <li><Link href="/repairs/computer" className={linkClass}>Laptop/Computer Repair</Link></li>
                <li><Link href="/repairs/tablet" className={linkClass}>Tablet Repair</Link></li>
                <li><Link href="/repairs/tablet/ipad-repair" className={linkClass}>iPad Repair</Link></li>
              </ul>
            </nav>

            {/* Column 3: Information (2 Columns on Desktop) */}
            <nav aria-label="Information" className="col-span-1 md:col-span-3 lg:col-span-2">
              <h2 className={headingClass}>Information</h2>
              <ul className="space-y-1">
                <li><Link href="/about" className={linkClass}>About Us</Link></li>
                <li><Link href="/locations/i/book-repair" className={linkClass}>Locations</Link></li>
                <li><Link href="/common-issues" className={linkClass}>Common Issues</Link></li>
                <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
                <li><Link href="/warranty" className={linkClass}>Warranty</Link></li>
                <li><Link href="/blog" className={linkClass}>Blog</Link></li>
              </ul>
            </nav>

            {/* Column 4: Business & Action (3 Columns on Desktop) */}
            <div className="col-span-1 md:col-span-5 lg:col-span-3 flex flex-col justify-between gap-6">
              <nav aria-label="Programs and support">
                <h2 className={headingClass}>Programs &amp; Support</h2>
                <ul className="space-y-1">
                  <li><Link href="/schedule-repair" className={linkClass}>Schedule a Repair</Link></li>
                  <li><Link href="/repair-status" className={linkClass}>Track Repair Status</Link></li>
                  <li><Link href="/review" className={linkClass}>Customer Reviews</Link></li>
                  <li><Link href="/supply-chain" className={linkClass}>Supply Chain Act</Link></li>
                </ul>
              </nav>

              {/* High-conversion CTA Button */}
              <div className="pt-2">
                <Link
                  href="/locations/i/book-repair"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-sfd-teal hover:bg-[#007e7a] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <span>Get Free Estimate</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ===== 2. BOTTOM LIGHT CARD (Legal & Trust Section) ===== */}
        <div className="bg-[#f4f4f6] text-neutral-800 rounded-2xl sm:rounded-[20px] p-5 sm:p-8 border border-neutral-200/80">

          {/* Upper Row: Social Media + Policy Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b border-neutral-300/80">
            {/* Social media icons in soft circular buttons */}
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white hover:bg-sfd-teal hover:text-white border border-neutral-200/90 shadow-2xs transition-all text-neutral-700"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Policy links */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 sm:gap-x-6 gap-y-1.5 text-xs sm:text-[13px] font-medium text-neutral-700">
              <Link href="/privacy" className="hover:text-sfd-teal transition-colors py-0.5">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-sfd-teal transition-colors py-0.5">Terms of Use</Link>
              <Link href="/supply-chain" className="hover:text-sfd-teal transition-colors py-0.5">California Supply Chain Act</Link>
              <Link href="/accessibility" className="hover:text-sfd-teal transition-colors py-0.5">Accessibility Statement</Link>
            </div>
          </div>

          {/* Lower Row: Badges, copyright & disclaimer */}
          <div className="pt-5 flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-8">
            <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 font-bold text-neutral-800">
                <span className="tracking-widest uppercase font-black text-xs text-neutral-900">SAMSUNG</span>
                <span className="px-2 py-0.5 rounded border border-neutral-300 text-[11px] bg-white font-medium text-neutral-700">WISE Certified</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-white text-[11px] font-bold">Top 500</span>
              </div>
              <p className="text-xs text-neutral-600 m-0 leading-normal">
                © 2026 SmartFoneDoctor. All Rights Reserved
              </p>
            </div>

            <p className="w-full lg:max-w-[856px] text-xs leading-relaxed text-neutral-600 m-0">
              All SmartFoneDoctor stores are independently owned and operated and may not offer all of the repair and warranty types listed on this website. Contact your local store for their specific repair capabilities and warranty terms. SmartFoneDoctor and its stores are not liable for warranties made by third parties on specific accessories or devices sold at SmartFoneDoctor stores. All product and company names are trademarks of their respective holders. iPhone, iPad, iPod, iPod touch, Mac and iMac are registered trademarks and property of Apple, Inc. SmartFoneDoctor is a third-party repair company and is not affiliated with Apple.
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
