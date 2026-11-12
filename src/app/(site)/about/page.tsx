import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, MapPin } from "lucide-react";
import Footer from "@/components/layout/Footer";
import AboutMap from "@/components/about/AboutMap";

export const metadata: Metadata = {
  title: "About Us | SmartFoneDoctor",
  description:
    "Learn about SmartFoneDoctor. Expert phone, tablet, and computer repair focused on quality craftsmanship, sustainability, and community service.",
};

export default function AboutPage() {
  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">

        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 ml-2 text-[16px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-700 font-medium" aria-current="page">
              About us
            </li>
          </ol>
        </nav>

        {/* 2. Hero Banner Card */}
        <div className="relative w-full rounded-[24px] overflow-hidden bg-neutral-900 min-h-[380px] sm:min-h-[440px] flex items-center mb-12 sm:mb-16 shadow-sm">
          {/* Background Store Interior Image with Dark Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=85"
              alt="SmartFoneDoctor Store Interior"
              fill
              className="object-cover object-center opacity-40 brightness-75"
              priority
            />
            {/* Gradient overlay to ensure crisp contrast on the left side */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
          </div>

          {/* Hero Content (Left side aligned) */}
          <div className="relative z-10 max-w-xl p-8 sm:p-12 lg:p-16 text-white">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[16px] font-semibold text-white mb-4"> 
              <span>About Us</span>
            </div>

            <h1 className="text-[32px] sm:text-[40px] lg:text-[46px] font-extrabold tracking-tight text-white leading-tight mb-2">
              SmartFoneDoctor
            </h1>

            <div className="text-[14px] sm:text-[15px] font-semibold text-neutral-300 tracking-wide mb-4">
              So Much More Than Cell Phone Repair
            </div>

            <p className="text-[14px] sm:text-[14px] text-neutral-200 leading-relaxed font-normal">
              SmartFoneDoctor provides expert repair for phones, computers, tablets, and more—backed by a local service you can trust. Our commitment goes beyond fixing devices to supporting sustainability, quality craftsmanship, and the communities we serve.
            </p>
          </div>
        </div>

        {/* 3. Alternating 4 Feature Blocks */}
        <div className="space-y-8 sm:space-y-12">

          {/* Block 1: Problem Solvers (Image Left, Card Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Image Column */}
            <div className="lg:col-span-6 relative min-h-[280px] sm:min-h-[340px] rounded-[20px] overflow-hidden shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
                alt="Problem Solvers collaborating on laptops"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Card Column */}
            <div className="lg:col-span-6 bg-[#f4f5f7] border border-neutral-200/80 rounded-[20px] p-8 sm:p-10 flex flex-col justify-center">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1d1c1a] tracking-tight mb-4">
                Problem Solvers
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed">
                At SmartFoneDoctor, we focus on quality, customer service, and improvement. Our dedicated technicians build trust and strong partnerships. We guarantee the best service, resulting in satisfied customers who choose us over competitors. We monitor performance through continuous improvement to enhance training and ensure our technicians are highly qualified.
              </p>
            </div>
          </div>

          {/* Block 2: We Are Growing / Global Footprint (Card Left, Graphic Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Card Column */}
            <div className="lg:col-span-6 bg-[#f4f5f7] border border-neutral-200/80 rounded-[20px] p-8 sm:p-10 flex flex-col justify-center order-2 lg:order-1">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1d1c1a] tracking-tight mb-4">
                We Are Expanding Locally &amp; Regionally
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed">
                On a local and regional level, our goal is to be on hand in every community we serve. We have grown to provide dependable, fast-turnaround repair services to schools, businesses, and everyday consumers. As our footprint grows, we remain the dedicated &quot;go-to guys&quot; for electronic device repair and look forward to welcoming you at one of our convenient store locations.
              </p>
            </div>

            {/* Graphic Column: Interactive Leaflet Map with 3 Store Pins */}
            <div className="lg:col-span-6 min-h-[440px] sm:min-h-[480px] flex flex-col order-1 lg:order-2">
              <AboutMap />
            </div>
          </div>

          {/* Block 3: Going Green (Image Left, Card Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Image Column */}
            <div className="lg:col-span-6 relative min-h-[280px] sm:min-h-[340px] rounded-[20px] overflow-hidden shadow-xs">
              <Image
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"
                alt="Hand holding glass sphere in natural forest - sustainability"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Card Column */}
            <div className="lg:col-span-6 bg-[#f4f5f7] border border-neutral-200/80 rounded-[20px] p-8 sm:p-10 flex flex-col justify-center">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1d1c1a] tracking-tight mb-4">
                Going Green
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed">
                As a company with a strong commitment to environmental stewardship, we believe repair is recycling in its highest form. By repairing devices, we extend their useful lifespan and keep perfectly good electronics out of landfills. We also properly recycle old and damaged lithium-ion batteries and electronic components, minimizing our carbon footprint and protecting nature.
              </p>
            </div>
          </div>

          {/* Block 4: Customer Focus (Card Left, Image Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Card Column */}
            <div className="lg:col-span-6 bg-[#f4f5f7] border border-neutral-200/80 rounded-[20px] p-8 sm:p-10 flex flex-col justify-center order-2 lg:order-1">
              <h2 className="text-[22px] sm:text-[24px] font-bold text-[#1d1c1a] tracking-tight mb-4">
                Our Customers Are The Most Important To Us
              </h2>
              <p className="text-[13px] sm:text-[13.5px] text-neutral-600 leading-relaxed">
                Our customers mean everything to us, and because of them we strive to continuously refine our techniques and diagnostic standards. Our warranty backing is proof of our stance on quality repairs and superior service. Each day our customers continue to tell us how satisfied they are, and that makes our work truly rewarding.
              </p>
            </div>

            {/* Image Column: Modern Store / Showcase Counter */}
            <div className="lg:col-span-6 relative min-h-[280px] sm:min-h-[340px] rounded-[20px] overflow-hidden shadow-xs order-1 lg:order-2">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                alt="SmartFoneDoctor customer service front desk"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}

