"use client";

import dynamic from "next/dynamic";
import type { HostSection } from "@/puck/host";
import { createImagePickerField } from "@/puck/fields/ImagePickerField";
import { HERO_DEFAULTS } from "@/components/home/heroContent";
import { WARRANTY_DEFAULTS } from "@/components/site/warrantyContent";
import {
  BENEFITS_DEFAULTS,
  COMMON_ISSUES_DEFAULTS,
  FAQ_DEFAULTS,
  GUARANTEES_DEFAULTS,
  GUIDES_DEFAULTS,
  REVIEWS_DEFAULTS,
  STORE_FINDER_DEFAULTS,
  WISE_DEFAULTS,
  pickText,
  type StoreFinderProps,
} from "@/components/home/sectionContent";

/**
 * The site's coded sections, offered in the builder's "Site Section" block.
 * Keys are saved in page data: never rename one that pages already use.
 * Loaded on demand, so pages that don't use them don't download them;
 * they still render on the server (good for SEO and the hero's LCP image).
 */
const HomeHero = dynamic(() => import("@/components/home/HeroSection"));
const Benefits = dynamic(() => import("@/components/home/Benefits").then((m) => m.Benefits));
const CommonIssues = dynamic(() => import("@/components/home/CommonIssues").then((m) => m.CommonIssues));
const ReviewsSection = dynamic(() => import("@/components/home/ReviewsSection").then((m) => m.ReviewsSection));
const GuaranteesBento = dynamic(() => import("@/components/home/GuaranteesBento").then((m) => m.GuaranteesBento));
const WiseCertification = dynamic(() =>
  import("@/components/home/WiseCertification").then((m) => m.WiseCertification)
);
const FaqSection = dynamic(() => import("@/components/home/FaqSection").then((m) => m.FaqSection));
const LatestGuides = dynamic(() => import("@/components/home/LatestGuides").then((m) => m.LatestGuides));
const StoreLocator = dynamic(() => import("@/components/locator/StoreLocator").then((m) => m.StoreLocator));
const BlogArticle = dynamic(() => import("@/components/blog/BlogArticleSection").then((m) => m.BlogArticleSection));
const CategoryHub = dynamic(() => import("@/components/repairs/CategoryHub").then((m) => m.CategoryHub));
const DevicePage = dynamic(() => import("@/components/repairs/RepairPageSections").then((m) => m.DevicePageSection));
const RepairPage = dynamic(() => import("@/components/repairs/RepairPageSections").then((m) => m.RepairPageSection));
const CommonIssueArticle = dynamic(() => import("@/components/repairs/CommonIssueSection").then((m) => m.CommonIssueSection));
const Warranty = dynamic(() => import("@/components/site/WarrantySection").then((m) => m.WarrantySection));
const LocationsFinder = dynamic(() => import("@/components/locator/LocationsSection").then((m) => m.LocationsSection));

function HomeStoreFinder(props: StoreFinderProps) {
  return (
    <div id="locations">
      <StoreLocator
        isHomePage={true}
        showBreadcrumbs={false}
        title={pickText(props.title, STORE_FINDER_DEFAULTS.title)}
        subtitle={pickText(props.subtitle, STORE_FINDER_DEFAULTS.subtitle)}
      />
    </div>
  );
}

const yesNo = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

/** Section id → label shown in the builder, the component, and its editable fields. */
export const SITE_SECTIONS: Record<string, HostSection> = {
  "home-hero": {
    label: "Home: Hero (photo + booking CTA)",
    component: HomeHero,
    defaults: HERO_DEFAULTS,
    fields: {
      badge: { type: "text", label: "Badge (small pill above headline)" },
      headline: { type: "textarea", label: "Headline (the page H1)" },
      subtitle: { type: "textarea", label: "Subtitle" },
      ctaText: { type: "text", label: "Button text" },
      ctaLink: { type: "text", label: "Button link" },
      imageUrl: createImagePickerField("Background photo"),
      imageAlt: { type: "text", label: "Photo description (alt text)" },
      statusText: { type: "text", label: "Status pill text" },
      statusLinkText: { type: "text", label: "Status pill link text" },
      statusLink: { type: "text", label: "Status pill link" },
    },
  },
  "home-benefits": {
    label: "Home: Why choose us",
    component: Benefits,
    defaults: BENEFITS_DEFAULTS,
    fields: {
      badge: { type: "text", label: "Badge" },
      heading: { type: "text", label: "Heading" },
      subtitle: { type: "textarea", label: "Subtitle" },
      cards: {
        type: "array",
        label: "Cards (best with 4)",
        getItemSummary: (item: { title?: string }) => item.title || "Card",
        defaultItemProps: { stat: "", title: "New card", description: "", imageSrc: "" },
        arrayFields: {
          stat: { type: "text", label: "Small stat (e.g. 50,000+)" },
          title: { type: "text", label: "Title" },
          description: { type: "textarea", label: "Text" },
          imageSrc: createImagePickerField("Photo"),
        },
      },
    },
  },
  "home-common-issues": {
    label: "Home: Common issues",
    component: CommonIssues,
    defaults: COMMON_ISSUES_DEFAULTS,
    fields: {
      heading: { type: "text", label: "Heading" },
      items: {
        type: "array",
        label: "Repair links",
        getItemSummary: (item: { label?: string }) => item.label || "Link",
        defaultItemProps: { label: "New repair", href: "/repairs", highlighted: false },
        arrayFields: {
          label: { type: "text", label: "Text" },
          href: { type: "text", label: "Link" },
          highlighted: { type: "radio", label: "Highlight", options: yesNo },
        },
      },
      footerText: { type: "text", label: "Footer text" },
      linkText: { type: "text", label: "Footer link text" },
      linkHref: { type: "text", label: "Footer link" },
    },
  },
  "home-reviews": {
    label: "Home: Customer reviews (hidden until you add real reviews)",
    component: ReviewsSection,
    defaults: REVIEWS_DEFAULTS,
    fields: {
      badge: { type: "text", label: "Badge" },
      heading: { type: "text", label: "Heading" },
      subtitle: { type: "text", label: "Subtitle (keep review counts accurate)" },
      reviews: {
        type: "array",
        label: "Reviews (real customer reviews only)",
        getItemSummary: (item: { author?: string }) => item.author || "Review",
        defaultItemProps: { author: "", location: "Philadelphia", device: "", content: "", rating: 5 },
        arrayFields: {
          author: { type: "text", label: "Customer name" },
          location: { type: "text", label: "Neighborhood" },
          device: { type: "text", label: "Repair" },
          content: { type: "textarea", label: "Review text" },
          rating: { type: "number", label: "Stars (1-5)", min: 1, max: 5 },
        },
      },
    },
  },
  "home-store-finder": {
    label: "Home: Store finder + map",
    component: HomeStoreFinder,
    defaults: STORE_FINDER_DEFAULTS,
    fields: {
      title: { type: "text", label: "Title" },
      subtitle: { type: "textarea", label: "Subtitle" },
    },
  },
  "home-guarantees": {
    label: "Home: Guarantees & genuine parts",
    component: GuaranteesBento,
    defaults: GUARANTEES_DEFAULTS,
    fields: {
      cards: {
        type: "array",
        label: "Cards (4 slots: 2 white, then 2 with a photo)",
        max: 4,
        getItemSummary: (item: { title?: string }) => item.title || "Card",
        defaultItemProps: { tag: "", title: "", text: "", linkText: "", linkHref: "", image: "" },
        arrayFields: {
          tag: { type: "text", label: "Tag" },
          title: { type: "text", label: "Title" },
          text: { type: "textarea", label: "Text" },
          linkText: { type: "text", label: "Link text" },
          linkHref: { type: "text", label: "Link" },
          image: createImagePickerField("Photo (cards 3 and 4)"),
        },
      },
    },
  },
  "home-wise": {
    label: "Home: WISE-certified technicians",
    component: WiseCertification,
    defaults: WISE_DEFAULTS,
    fields: {
      heading: { type: "text", label: "Section heading" },
      title: { type: "text", label: "Card title" },
      body: { type: "textarea", label: "Text" },
      note: { type: "text", label: "Bold note" },
      buttonText: { type: "text", label: "Button text" },
      buttonLink: { type: "text", label: "Button link" },
    },
  },
  "home-faq": {
    label: "Home: FAQ (with FAQ schema)",
    component: FaqSection,
    defaults: FAQ_DEFAULTS,
    fields: {
      heading: { type: "text", label: "Heading" },
      items: {
        type: "array",
        label: "Questions (also sent to Google as FAQ schema)",
        getItemSummary: (item: { question?: string }) => item.question || "Question",
        defaultItemProps: { question: "", answer: "" },
        arrayFields: {
          question: { type: "text", label: "Question" },
          answer: { type: "textarea", label: "Answer" },
        },
      },
      buttonText: { type: "text", label: "Button text" },
      buttonLink: { type: "text", label: "Button link" },
    },
  },
  // Data blocks for type templates: they show the record of the page being viewed.
  "blog-article": { label: "Blog post: full article (current post)", component: BlogArticle },
  "device-page": { label: "Repairs: device page (current device)", component: DevicePage },
  "repair-page": { label: "Repairs: repair page (current device + repair)", component: RepairPage },
  "common-issue-article": { label: "Common issue: full article (current article)", component: CommonIssueArticle },
  "warranty-page": {
    label: "Warranty page (coverage, claim steps, contact box)",
    component: Warranty,
    defaults: WARRANTY_DEFAULTS,
    fields: {
      badge: { type: "text", label: "Badge" },
      title: { type: "text", label: "Headline (the page H1)" },
      intro: { type: "textarea", label: "Intro" },
      coveredHeading: { type: "text", label: "\"Covered\" heading" },
      covered: {
        type: "array",
        label: "What's covered",
        getItemSummary: (item: { text?: string }) => item.text || "Item",
        defaultItemProps: { text: "" },
        arrayFields: { text: { type: "textarea", label: "Text" } },
      },
      notCoveredHeading: { type: "text", label: "\"Not covered\" heading" },
      notCovered: {
        type: "array",
        label: "What's not covered",
        getItemSummary: (item: { text?: string }) => item.text || "Item",
        defaultItemProps: { text: "" },
        arrayFields: { text: { type: "textarea", label: "Text" } },
      },
      claimHeading: { type: "text", label: "Claim steps heading" },
      steps: {
        type: "array",
        label: "Claim steps",
        getItemSummary: (item: { title?: string }) => item.title || "Step",
        defaultItemProps: { title: "", body: "" },
        arrayFields: { title: { type: "text", label: "Title" }, body: { type: "textarea", label: "Text" } },
      },
      helpHeading: { type: "text", label: "Contact box heading" },
      helpText: { type: "textarea", label: "Contact box text ({phone} = store phone)" },
      primaryLabel: { type: "text", label: "Main button text" },
      primaryHref: { type: "text", label: "Main button link" },
      secondaryLabel: { type: "text", label: "Second button text" },
      secondaryHref: { type: "text", label: "Second button link" },
    },
  },
  "locations-finder": {
    label: "Locations: store finder + map (page H1)",
    component: LocationsFinder,
    fields: {
      title: { type: "text", label: "Heading (empty = built-in)" },
      subtitle: { type: "textarea", label: "Subtitle (empty = built-in)" },
    },
  },
  "repair-category-hub": {
    label: "Repairs: category hub (devices, brands, repairs of this category)",
    component: CategoryHub,
    fields: {
      badge: { type: "text", label: "Badge" },
      heroTitle: { type: "textarea", label: "Headline (the page H1)" },
      heroIntro: { type: "textarea", label: "Intro" },
      heroImage: createImagePickerField("Hero photo"),
      selectionHeading: { type: "text", label: "Heading above the device/brand/repair tabs" },
      platforms: {
        type: "array",
        label: "Platform cards",
        getItemSummary: (item: { title?: string }) => item.title || "Card",
        defaultItemProps: { title: "", body: "", image: "", href: "" },
        arrayFields: {
          title: { type: "text", label: "Title" },
          body: { type: "textarea", label: "Text" },
          image: createImagePickerField("Photo"),
          href: { type: "text", label: "Link" },
        },
      },
      warrantyText: { type: "textarea", label: "Warranty text" },
      storeHeading: { type: "text", label: "Store section heading" },
      storeIntro: { type: "textarea", label: "Store section intro" },
    },
  },
  "home-guides": {
    label: "Home: Latest repair guides",
    component: LatestGuides,
    defaults: GUIDES_DEFAULTS,
    fields: {
      badge: { type: "text", label: "Badge" },
      heading: { type: "text", label: "Heading" },
      linkText: { type: "text", label: "Link text" },
      count: { type: "number", label: "How many guides (1-6)", min: 1, max: 6 },
    },
  },
};

/** Default home layout: the coded home page, one block per section. */
export const HOME_SECTION_ORDER = [
  "home-hero",
  "home-benefits",
  "home-common-issues",
  "home-reviews",
  "home-store-finder",
  "home-guarantees",
  "home-wise",
  "home-faq",
  "home-guides",
] as const;
