"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/layout/Footer";
import { Benefits } from "@/components/home/Benefits";
import { CommonIssues } from "@/components/home/CommonIssues";
import { StoreLocator } from "@/components/locator/StoreLocator";
import { WiseCertification } from "@/components/home/WiseCertification";
import { FaqSection } from "@/components/home/FaqSection";

export default function HomePage() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <main>
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

      {/* 6. Frequently Asked Questions (Accordion) */}
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
