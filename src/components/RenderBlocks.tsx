'use client'

import React from 'react'
import HeroSection from '@/components/home/HeroSection'
import { BenefitsSection } from '@/components/home/BenefitsSection'
import { FaqSection } from '@/components/home/FaqSection'
import { CommonIssues } from '@/components/home/CommonIssues'
import Link from 'next/link'

type BlockData = {
  blockType: string
  id?: string
  [key: string]: any
}

type Props = {
  blocks?: BlockData[] | null
}

export default function RenderBlocks({ blocks }: Props) {
  if (!blocks || blocks.length === 0) {
    // If no blocks configured yet, show default home sections
    return (
      <>
        <HeroSection />
        <CommonIssues />
        <BenefitsSection />
        <FaqSection />
      </>
    )
  }

  return (
    <div>
      {blocks.map((block, index) => {
        const { blockType, id } = block
        const key = id || `${blockType}-${index}`

        switch (blockType) {
          case 'hero':
            return (
              <section key={key} className="bg-[#fcfcfc] pt-3 sm:pt-3 pb-8 px-3 sm:px-6">
                <div className="max-w-[1265px] mx-auto relative rounded-3xl sm:rounded-[32px] overflow-hidden shadow-sm min-h-[560px] lg:min-h-[540px] flex flex-col justify-between">
                  <div
                    className="absolute inset-0 bg-cover bg-center sm:bg-right bg-no-repeat"
                    style={{
                      backgroundImage:
                        "url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80')",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/95 via-black/80 to-black/40 lg:to-transparent" />
                  <div className="relative z-10 max-w-2xl px-5 sm:px-12 lg:px-16 pt-7 sm:pt-12 text-white">
                    {block.topPillTag && (
                      <div className="inline-block bg-white/25 text-[#fcfcfc] rounded-[60px] py-1 px-[13px] mb-3 sm:mb-[13px] min-h-6 leading-[24px] text-xs sm:text-sm font-[350] tracking-wide select-none">
                        <span>{block.topPillTag}</span>
                      </div>
                    )}
                    <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-normal tracking-[-0.8px] sm:tracking-[-0.96px] leading-[1.2] sm:leading-[57.6px] text-[#fcfcfc] mt-3 sm:mt-4 mb-3 sm:mb-[9.6px] max-w-[525px]">
                      {block.headline || 'Fast, reliable repairs that keep your tech working when it matters.'}
                    </h1>
                    <p className="text-xs sm:text-base text-neutral-200/90 font-normal leading-relaxed max-w-lg mb-6 sm:mb-8">
                      {block.subtitle ||
                        'Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href={block.primaryCtaLink || '/schedule-repair'}
                        className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 rounded-full bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        {block.primaryCtaText || 'Book your repair'}
                      </Link>
                      {block.secondaryCtaText && (
                        <a
                          href={block.secondaryCtaLink || 'tel:+12155982090'}
                          className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/20"
                        >
                          {block.secondaryCtaText}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )

          case 'benefits':
            return <BenefitsSection key={key} />

          case 'servicesGrid':
            return <CommonIssues key={key} />

          case 'faqSection':
            return <FaqSection key={key} />

          case 'ctaBanner':
            return (
              <section key={key} className="py-14 px-4 bg-emerald-950 text-white">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {block.headline || 'Need your phone fixed right now?'}
                  </h2>
                  <p className="text-neutral-300 max-w-2xl mx-auto text-base">
                    {block.subtext ||
                      'Walk in today to any of our 3 West Philadelphia locations or schedule online.'}
                  </p>
                  <div className="pt-2">
                    <Link
                      href={block.buttonLink || '/schedule-repair'}
                      className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-emerald-950 font-bold hover:bg-neutral-100 transition shadow-lg"
                    >
                      {block.buttonText || 'Schedule Repair Online'}
                    </Link>
                  </div>
                </div>
              </section>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

