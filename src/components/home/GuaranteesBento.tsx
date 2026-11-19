"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Smartphone, ArrowRight, Award } from "lucide-react";

export function GuaranteesBento() {
  return (
    <section className="bg-[#fcfcfc] py-8 sm:py-12 px-3 sm:px-6">
      <div className="max-w-[1265px] mx-auto flex flex-col gap-6">
        
        {/* Top 2 Cards: Warranty & Pre-Owned Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Warranty */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-sfd-teal/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sfd-teal bg-teal-50 px-3 py-1 rounded-full">
                Warranty Guarantee
              </span>
              <span className="text-xl font-black text-rose-600 select-none">+</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 leading-tight">
                We Stand Behind Every Repair
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                All screen replacements, batteries, and internal hardware repairs are backed by our comprehensive warranty. If a replacement part ever malfunctions under normal use, we repair or replace it free of charge.
              </p>
            </div>

            <div>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors border border-neutral-300 rounded-full px-4 py-2 hover:border-sfd-teal"
              >
                <span>Learn About Our Warranty</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Certified Pre-Owned */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-sfd-teal/40 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                Certified Pre-Owned
              </span>
              <span className="text-xl font-black text-rose-600 select-none">+</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 leading-tight">
                Certified Pre-Owned Devices
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                Upgrade for less with our curated collection of pristine, fully tested, and sanitized iPhones, Samsung Galaxy phones, and iPads. Every device undergoes a 32-point inspection and includes a warranty.
              </p>
            </div>

            <div>
              <Link
                href="/schedule-repair"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-sfd-teal transition-colors border border-neutral-300 rounded-full px-4 py-2 hover:border-sfd-teal"
              >
                <span>Explore Pre-Owned Devices</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom 2 Cards: Android & Apple Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 3: Samsung & Android Care */}
          <div className="bg-[#eef2f6] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-neutral-200/60 overflow-hidden group">
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-3 py-1 rounded-full inline-block mb-3">
                Android Specialists
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 leading-tight">
                Samsung Galaxy & Android Care
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                Specialized micro-soldering, curved AMOLED glass replacement, and OEM charging board repairs for Galaxy S, Note, Z Fold, and Google Pixel.
              </p>
              <Link
                href="/repairs/smartphone"
                className="text-xs font-bold text-neutral-900 hover:text-sfd-teal inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>View Android Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative w-40 h-44 sm:w-44 sm:h-48 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=400&q=80"
                alt="Samsung Galaxy Repair"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Card 4: Apple & Genuine Parts */}
          <div className="bg-[#1c2333] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-neutral-800 overflow-hidden group">
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-900/60 px-3 py-1 rounded-full inline-block mb-3">
                Apple Certified Quality
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                Apple & OEM-Grade Parts
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-4">
                Precision TrueTone calibration, original display IC transfers, and Apple battery health preservation by WISE Certified technicians.
              </p>
              <Link
                href="/repairs/iphone"
                className="text-xs font-bold text-teal-300 hover:text-white inline-flex items-center gap-1 underline underline-offset-4"
              >
                <span>View iPhone & Mac Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative w-40 h-44 sm:w-44 sm:h-48 shrink-0 overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80"
                alt="Apple iPhone Repair"
                fill
                sizes="(max-width: 640px) 160px, 176px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
