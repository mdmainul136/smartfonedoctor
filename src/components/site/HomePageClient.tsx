"use client";

import HeroSection from "@/components/home/HeroSection";
import Footer from "@/components/layout/Footer";
import { Benefits } from "@/components/home/Benefits";
import { CommonIssues } from "@/components/home/CommonIssues";
import { StoreLocator } from "@/components/locator/StoreLocator";
import { WiseCertification } from "@/components/home/WiseCertification";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { GuaranteesBento } from "@/components/home/GuaranteesBento";
import { FaqSection, HOMEPAGE_FAQS, homeFaqItems } from "@/components/home/FaqSection";
import type { FaqSectionProps, ReviewContent } from "@/components/home/sectionContent";
import { JsonLd, buildWebSiteSchema, buildFaqSchema } from "@/lib/schema";
import { LatestGuides } from "@/components/home/LatestGuides";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider } from "@/components/site/RouteDataContext";
import type { CMSPage } from "@/lib/cmsData";

export interface HomePageClientProps {
  initialPage?: CMSPage | null;
  initialReviews?: ReviewContent[];
}

export default function HomePageClient({ initialPage, initialReviews }: HomePageClientProps) {
  const webSiteSchema = buildWebSiteSchema();

  // FAQ schema must match the questions visitors see. With the builder layout
  // live, that is the "Home: FAQ" section and/or any FAQ blocks on the page.
  type Block = {
    type?: string;
    props?: { section?: string; content?: FaqSectionProps; items?: { title?: string; description?: string }[] };
  };
  const blocks =
    initialPage?.status === "Published"
      ? ((initialPage.puckData as { content?: Block[] } | undefined)?.content ?? [])
      : [];
  const usesBuilder = blocks.length > 0;
  const faqs = usesBuilder
    ? [
        ...blocks
          .filter((b) => b.type === "SiteSectionBlock" && b.props?.section === "home-faq")
          .flatMap((b) => homeFaqItems(b.props?.content)),
        ...blocks
          .filter((b) => b.type === "FaqBlock")
          .flatMap((b) => b.props?.items ?? [])
          .filter((i) => i.title && i.description)
          .map((i) => ({ question: i.title as string, answer: i.description as string })),
      ]
    : HOMEPAGE_FAQS;
  const faqSchema = faqs.length ? buildFaqSchema(faqs) : null;

  return (
    <main>
      {/* ── JSON-LD Structured Data ── */}
      <JsonLd data={webSiteSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      {/* CMS Dynamic Section Renderer with SSR fallback */}
      <RouteDataProvider value={{ type: "home", data: { featuredReviews: initialReviews ?? [] } }}>
      <CMSSectionRenderer slug="home" initialPage={initialPage} fallbackHero={<HeroSection />}>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Why Choose Us / Benefits */}
        <Benefits />

        {/* 3. Common Issues Grid */}
        <CommonIssues />

        {/* 4. See Why Customers Trust Us (Authentic Google Reviews) */}
        <ReviewsSection reviews={initialReviews} />

        {/* 5. Book a Repair & Store Locator with Map */}
        <div id="locations">
          <StoreLocator
            isHomePage={true}
            showBreadcrumbs={false}
            title="Find Your Nearest SmartFoneDoctor Store"
            subtitle="Walk in anytime or choose your store below to book your repair. 3 convenient Google-verified repair locations across Philadelphia."
          />
        </div>

        {/* 6. Guarantees & Genuine Parts Bento */}
        <GuaranteesBento />

        {/* 7. The SmartFoneDoctor Difference - WISE Certified Technicians */}
        <WiseCertification />

        {/* 8. Frequently Asked Questions (Accordion) */}
        <FaqSection />

        {/* 9. Latest Repair Guides */}
        <LatestGuides />

      </CMSSectionRenderer>
      </RouteDataProvider>

      {/* Footer */}
      <Footer />
    </main>
  );
}
