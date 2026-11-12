import React from "react";
import Link from "next/link";
import Image from 'next/image';

const socials = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "X",
    href: "https://x.com",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
];

// link: 14px always
const linkClass =
  "inline-block py-1 text-[14px] text-[#fcfcfc] hover:text-sfd-teal transition-colors";
// heading: 15px always
const headingClass =
  "text-[15px] font-bold text-[#fcfcfc] mb-3 sm:mb-4 tracking-tight";

export default function Footer() {
  return (
    <footer className="bg-[#fcfcfc] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-3 sm:gap-4">

        {/* ===== Dark card ===== */}
        <div className="bg-[#0b0b0f] text-white rounded-2xl sm:rounded-[20px] border-t border-[#302f2c] w-full p-5 sm:p-8 lg:p-10 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 lg:gap-10">

            {/* Brand: mobile-এ full width */}
            <div className="col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-3 group">
                 <Image
                            src="/logo-png.jpg"
                            alt="SmartFone Doctor Logo"
                            width={180}
                            height={60}
                            priority
                            className="h-11 sm:h-14 w-auto object-contain"
                          />
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold tracking-tight text-white group-hover:text-sfd-teal transition-colors">
                    SMARTFONE DOCTOR
                  </span>
                  <span className="text-[11px] text-neutral-400 tracking-wider">
                    by CERTIFIED TECH
                  </span>
                </div>
              </Link>
            </div>

            {/* Repair Services */}
            <nav aria-label="Repair services">
              <h4 className={headingClass}>Repair Services</h4>
              <ul className="space-y-0.5">
                <li><Link href="/repairs/iphone" className={linkClass}>iPhone Repair</Link></li>
                <li><Link href="/repairs/smartphone" className={linkClass}>Smartphone Repair</Link></li>
                <li><Link href="/repairs/ipad" className={linkClass}>iPod Repair</Link></li>
                <li><Link href="/repairs/mac" className={linkClass}>Mac Repair</Link></li>
                <li><Link href="/repairs/computer" className={linkClass}>Laptop/Computer Repair</Link></li>
                <li><Link href="/repairs/tablet" className={linkClass}>Tablet Repair</Link></li>
              </ul>
            </nav>

            {/* Information */}
            <nav aria-label="Information">
              <h4 className={headingClass}>Information</h4>
              <ul className="space-y-0.5">
                <li><Link href="/blog" className={linkClass}>Blog</Link></li>
                <li><Link href="/common-issues" className={linkClass}>Common Issues</Link></li>
                <li><Link href="/franchise" className={linkClass}>Franchise info</Link></li>
                <li><Link href="/media" className={linkClass}>Media Inquiries</Link></li>
                <li><Link href="/locations" className={linkClass}>Locations</Link></li>
                <li><Link href="/faq" className={linkClass}>FAQ</Link></li>
              </ul>
            </nav>

            {/* Business & Programs */}
            <nav aria-label="Business and programs" className="col-span-2 lg:col-span-1">
              <h4 className={`${headingClass} lg:invisible`}>Programs</h4>
              <ul className="grid grid-cols-2 lg:grid-cols-1 gap-x-6 space-y-0.5 lg:space-y-0.5">
                <li><Link href="/business" className={linkClass}>SFD for Business</Link></li>
                <li><Link href="/education" className={linkClass}>SFD for Education</Link></li>
                <li><Link href="/warranty" className={linkClass}>Limited Warranty</Link></li>
                <li><Link href="/about" className={linkClass}>About Us</Link></li>
              </ul>
            </nav>
          </div>
        </div>

        {/* ===== Light card ===== */}
        <div className="bg-[#f4f4f6] text-neutral-800 rounded-2xl sm:rounded-[20px] p-5 sm:p-8 lg:p-10 border border-neutral-200/80">

          {/* Social + policy links */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4 pb-5 border-b border-neutral-300/80">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white hover:text-sfd-teal transition-colors"
                >
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Policy links: 13px always */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 sm:gap-x-6 gap-y-1 text-[16px] text-[#1d1c1a]">
              <Link href="/privacy" className="py-1 hover:text-sfd-teal transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="py-1 hover:text-sfd-teal transition-colors">Terms of Use</Link>
              <Link href="/supply-chain" className="py-1 hover:text-sfd-teal transition-colors">California Supply Chain Act</Link>
              <Link href="/accessibility" className="py-1 hover:text-sfd-teal transition-colors">Accessibility Statement</Link>
            </div>
          </div>

          {/* Badges + disclaimer */}
          <div className="pt-5 flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-8">
            <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-bold text-neutral-800">
                <span className="tracking-widest uppercase font-black text-[16px]">SAMSUNG</span>
                <span className="px-2 py-0.5 rounded border border-neutral-300 text-[11px] bg-white font-medium">WISE Certified</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-white text-[16px] font-bold">Top 500</span>
              </div>
              {/* copyright: 13px */}
              <p className="text-[13px] leading-relaxed text-[#1d1c1a] m-0">
                © 2026 SmartFoneDoctor. All Rights Reserved
              </p>
            </div>

            {/* disclaimer: 12px always — no responsive override */}
            <p className="w-full lg:max-w-[856px] text-[14px] leading-relaxed text-[#1d1c1a] m-0">
              All SmartFoneDoctor stores are independently owned and operated and may not offer all of the repair and warranty types listed on this website. Contact your local store for their specific repair capabilities and warranty terms. SmartFoneDoctor and its stores are not liable for warranties made by third parties on specific accessories or devices sold at SmartFoneDoctor stores. All product and company names are trademarks of their respective holders. iPhone, iPad, iPod, iPod touch, Mac and iMac are registered trademarks and property of Apple, Inc. SmartFoneDoctor is a third-party repair company and is not affiliated with Apple.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
