"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, HelpCircle } from "lucide-react";
import Footer from "@/components/layout/Footer";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How can I find a SmartFoneDoctor repair store near me?",
    answer:
      "You can easily locate your nearest store using our online Store Locator at /locations/i/book-repair. Enter your zip code, city, or allow browser location access to view all nearby stores, their operating hours, contact phone numbers, and get instant directions.",
  },
  {
    question: "Are certified pre-owned phones unlocked and ready for my carrier?",
    answer:
      "Yes! All SmartFoneDoctor Certified Pre-Owned (CPO) phones are fully network unlocked, meaning they can be used with any major carrier including Verizon, AT&T, T-Mobile, and international GSM networks. Simply insert your SIM card or activate your eSIM.",
  },
  {
    question: "What does SmartFoneDoctor repair?",
    answer:
      "We provide full-service hardware and software repair for smartphones, tablets, iPads, MacBooks, Windows laptops, desktop PCs, smartwatches, and major gaming consoles (PlayStation, Xbox, Nintendo Switch).",
  },
  {
    question: "Does SmartFoneDoctor fix cracked phone screens?",
    answer:
      "Yes, screen repair is our specialty! We replace cracked glass, damaged OLED/LCD panels, and malfunctioning touch digitizers using premium OEM-grade parts. Most screen replacements are completed in under 45 minutes.",
  },
  {
    question: "Does SmartFoneDoctor repair water damaged phones?",
    answer:
      "Yes. If your device was submerged or splashed with liquid, bring it in immediately. Our technicians use specialized ultrasonic cleaning chambers and diagnostic tools to remove corrosion and restore functionality whenever possible.",
  },
  {
    question: "How much will my repair cost?",
    answer:
      "Pricing varies depending on device model and the part being replaced. We provide a completely free diagnostic inspection and upfront estimate before performing any work, with zero hidden fees.",
  },
  {
    question: "How long will my repair take?",
    answer:
      "Most standard smartphone repairs, including screen and battery replacements, take between 30 and 60 minutes. More extensive tablet, computer, or board-level repairs typically take same-day or 24–48 hours depending on parts availability.",
  },
  {
    question: "What kind of warranty does SmartFoneDoctor offer on repairs?",
    answer:
      "We back our work with a limited warranty on all replacement parts and labor. If the replaced part malfunctions due to a manufacturing defect, we will inspect and repair or replace it at no charge.",
  },
  {
    question: "Does SmartFoneDoctor repair tablets and iPads?",
    answer:
      "Yes. We repair all iPad generations (iPad Pro, iPad Air, iPad Mini, standard iPad) as well as Samsung Galaxy Tabs and Microsoft Surface tablets for cracked screens, charging ports, and battery degradation.",
  },
  {
    question: "Does SmartFoneDoctor repair MacBooks and other Apple computers?",
    answer:
      "Yes! Our technicians service MacBook Pro, MacBook Air, and iMac desktops for screen replacements, battery service, keyboard and trackpad issues, logic board diagnostics, and liquid damage cleanup.",
  },
  {
    question: "Can SmartFoneDoctor fix laptops and desktop computers?",
    answer:
      "Yes. We service Windows laptops and desktop PCs from Dell, HP, Lenovo, Asus, Acer, and custom gaming rigs. Services include hardware repairs, SSD upgrades, data recovery, RAM installation, and virus removal.",
  },
  {
    question: "Do you repair game consoles?",
    answer:
      "Yes! We repair PlayStation 5, PlayStation 4, Xbox Series X/S, Xbox One, and Nintendo Switch consoles for HDMI ports, optical disc drive failures, overheating, and power supply issues.",
  },
  {
    question: "Can SmartFoneDoctor fix HDMI or display issues on a game console?",
    answer:
      "Yes. Damaged or bent HDMI ports are one of the most common console repairs we perform. We provide precision micro-soldering to replace the broken HDMI port with an OEM replacement.",
  },
  {
    question: "Can SmartFoneDoctor replace my device battery?",
    answer:
      "Yes! If your battery drains quickly, shuts off unexpectedly, or is swelling, we replace it with a brand new, safety-tested lithium-ion battery. Battery replacements are usually completed in 30 minutes.",
  },
  {
    question: "Does SmartFoneDoctor use quality parts for repairs?",
    answer:
      "Yes. We exclusively use premium, OEM-grade, and WISE-certified replacement parts that adhere to stringent quality, durability, and safety specifications.",
  },
  {
    question: "Do Certified Pre-Owned Devices come with a warranty?",
    answer:
      "Yes, every Certified Pre-Owned device sold at SmartFoneDoctor comes backed by a comprehensive warranty and undergoes a rigorous multi-point functional inspection and battery health verification.",
  },
  {
    question: "Do I need an appointment to visit a store?",
    answer:
      "No appointment is required! Walk-ins are always welcome during business hours. However, scheduling an appointment online in advance guarantees prioritized service and ensures your replacement parts are reserved.",
  },
  {
    question: "Why should I choose a SmartFoneDoctor Certified Pre-Owned Phone over a new or refurbished phone?",
    answer:
      "Our CPO phones offer substantial savings compared to buying brand new, while delivering the peace of mind of a multi-point certified inspection, guaranteed battery health, clean IMEI, warranty protection, and complete carrier freedom.",
  },
  {
    question: "Does SmartFoneDoctor sell Certified Pre-Owned phones?",
    answer:
      "Yes! Many of our store locations maintain a curated inventory of popular Apple iPhone, Samsung Galaxy, and Google Pixel models in pristine condition.",
  },
];

export default function FaqPage() {
  const [openIndexes, setOpenIndexes] = useState<{ [key: number]: boolean }>({});

  const toggleFaq = (index: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
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
              <span className="text-[#c8102e] font-black text-lg leading-none">+</span>
              <span className="text-sfd-teal font-black text-xs leading-none">*</span>
            </div>
          </div>
        </div>

        {/* 4. Full-Width Clean Accordion List matching Screenshot */}
        <div className="max-w-[1000px] mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = !!openIndexes[index];

            return (
              <div
                key={faq.question}
                className="rounded-[14px] border border-neutral-200/90 bg-white overflow-hidden shadow-xs transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-6 py-4 sm:py-4.5 text-left gap-4 hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-[14px] sm:text-[15px] font-normal text-neutral-800 leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-sfd-teal" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-4.5 pt-1 text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}

