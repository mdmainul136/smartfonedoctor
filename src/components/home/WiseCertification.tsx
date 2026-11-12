"use client";

import React from "react";
import Link from "next/link";

export function WiseCertification() {
  return (
    <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto">

        {/* Section Heading */}
        <h2 className="text-[22px] sm:text-[26px] font-[550] text-[#1d1c1a] text-center mb-8 tracking-tight">
          The SmartFoneDoctor Difference - Certified Technicians
        </h2>

        {/* Big Card Container */}
        <div className="bg-[#f8f9fa] border border-neutral-200/90 rounded-[20px] p-6 sm:p-10 lg:p-12 shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">

            {/* Left Column: WISE Logo with Owl */}
            <div className="flex flex-col items-center lg:items-start shrink-0 text-center lg:text-left">
              <div className="flex items-center gap-3">
                <span className="text-[52px] sm:text-[64px] font-black tracking-tighter text-[#4a4f55] lowercase leading-none">
                  wise
                </span>
                {/* Owl Icon Badge */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#7a9a3b] border-4 border-[#3e4448] flex items-center justify-center shadow-md relative overflow-hidden">
                  <div className="flex items-center gap-1.5 z-10">
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-neutral-800 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-neutral-800 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-900"></div>
                    </div>
                  </div>
                  {/* Small beak */}
                  <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-amber-400 z-20"></div>
                  {/* Graduation cap */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-neutral-900 rounded-xs"></div>
                </div>
              </div>

              <div className="text-[13px] sm:text-[14px] text-neutral-600 font-medium tracking-wide mt-2">
                Wireless Industry Service Excellence
              </div>
            </div>

            {/* Right Column: Copy & Actions */}
            <div className="flex-1 max-w-[620px] relative">

              {/* Decorative Red Cross Icon in Corner */}
              <div className="absolute -top-3 right-0 text-[#c8102e] font-black text-xl select-none">
                +
              </div>

              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#1d1c1a] mb-3">
                WISE Certified Technicians
              </h3>

              <p className="text-[12.5px] sm:text-[13px] text-neutral-600 leading-relaxed mb-4">
                SmartFoneDoctor is a proud WISE Certified Partner, an industry-recognized standard for
                excellence in mobile device repair. Our WISE Certified Technicians complete extensive
                training, with a strong focus on repair quality, safety protocols, and proper
                lithium-ion battery handling. As a WISE Certified Partner, we are committed to
                protecting your data and personal information throughout the repair process. Technicians
                renew their certification annually, ensuring our repair practices stay current and
                reliable.
              </p>

              <p className="text-[12.5px] sm:text-[13px] font-bold text-[#1d1c1a] mb-5">
                SmartFoneDoctor will not void your preexisting warranty.
              </p>

              <div>
                <Link
                  href="#locations"
                  className="inline-block py-2.5 px-6 rounded-full bg-[#c8102e] hover:bg-[#b31924] text-white text-[13px] font-bold tracking-tight shadow-xs transition-colors"
                >
                  Choose Store
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

