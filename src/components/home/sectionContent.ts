// Home page sections: prop types and today's content. Every value can be changed
// in the page builder (Site Section block). Kept apart from the components so the
// builder can read defaults without loading them.

export type BenefitCardContent = { stat: string; title: string; description: string; imageSrc: string };
export type BenefitsProps = {
  badge?: string;
  heading?: string;
  subtitle?: string;
  cards?: BenefitCardContent[];
};
export const BENEFITS_DEFAULTS: Required<BenefitsProps> = {
  badge: "Why Choose Us",
  heading: "Why customers choose us",
  subtitle: "Phone, tablet, laptop and console repairs with quality parts and a 90-day warranty.",
  cards: [
    {
      stat: "Parts & Labor",
      title: "90-Day Warranty",
      description:
        "If a part we installed or the repair isn't performing as it should, we'll make it right at no cost.",
      imageSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
      stat: "50,000+",
      title: "Devices Successfully Fixed",
      description:
        "From everyday phones to specialized devices like tablets and computers, we fix it all with care and expertise.",
      imageSrc: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80",
    },
    {
      stat: "< 45 Mins",
      title: "Fast Same-Day Repairs",
      description:
        "We offer same-day repair solutions for common issues, getting you back to your device faster than anyone.",
      imageSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    },
    {
      stat: "WISE Certified",
      title: "Expert Certified Technicians",
      description:
        "Our technicians combine proven methods with precision tools, ensuring every repair restores peak performance.",
      imageSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
  ],
};

export type IssueLink = { label: string; href: string; highlighted: boolean };
export type CommonIssuesProps = {
  heading?: string;
  items?: IssueLink[];
  footerText?: string;
  linkText?: string;
  linkHref?: string;
};
export const COMMON_ISSUES_DEFAULTS: Required<CommonIssuesProps> = {
  heading: "Common Issues We Fix Every Day",
  items: [
    { label: "iPhone Screen Repair", href: "/repairs/smartphone/iphone-16-pro/screen-repair", highlighted: true },
    { label: "iPhone Battery Replacement", href: "/repairs/smartphone/iphone-16-pro/battery-replacement", highlighted: true },
    { label: "Galaxy AMOLED Repair", href: "/repairs/smartphone/galaxy-s25/screen-repair", highlighted: true },
    { label: "Computer & Mac Repair", href: "/repairs/computer/macbook-pro", highlighted: true },
    { label: "PS5 HDMI Port Repair", href: "/repairs/console/playstation-5/hdmi-port-replacement", highlighted: false },
    { label: "Charging Port Repair", href: "/repairs/smartphone/iphone-16-pro/charging-port-repair", highlighted: false },
    { label: "Water Damage Recovery", href: "/repairs/smartphone/iphone-16-pro/water-damage-repair", highlighted: false },
    { label: "Back Glass Laser Repair", href: "/repairs/smartphone/iphone-16-pro/back-glass-repair", highlighted: false },
  ],
  footerText: "Need service for another device brand or specific hardware issue?",
  linkText: "Explore All Repair Services & Device Models",
  linkHref: "/repairs",
};

export type ReviewContent = { author: string; location: string; device: string; content: string; rating: number };
export type ReviewsProps = {
  badge?: string;
  heading?: string;
  subtitle?: string;
  reviews?: ReviewContent[];
};
// No built-in reviews: only real customer reviews, entered in the builder
// (Home > "Home: Customer reviews" section). With none, the section is hidden.
export const REVIEWS_DEFAULTS: Required<ReviewsProps> = {
  badge: "Customer Reviews",
  heading: "See Why Customers Trust Us",
  subtitle: "What customers say about our Philadelphia stores.",
  reviews: [],
};

export type StoreFinderProps = { title?: string; subtitle?: string };
export const STORE_FINDER_DEFAULTS: Required<StoreFinderProps> = {
  title: "Find Your Nearest SmartFoneDoctor Store",
  subtitle:
    "Walk in anytime or choose your store below to book your repair. 3 convenient Google-verified repair locations across Philadelphia.",
};

export type GuaranteeCard = {
  tag: string;
  title: string;
  text: string;
  linkText: string;
  linkHref: string;
  /** Shown on the 3rd and 4th cards only. */
  image: string;
};
export type GuaranteesProps = { cards?: GuaranteeCard[] };
export const GUARANTEES_DEFAULTS: Required<GuaranteesProps> = {
  cards: [
    {
      tag: "Warranty Guarantee",
      title: "We Stand Behind Every Repair",
      text: "All screen replacements, batteries, and internal hardware repairs are backed by our comprehensive warranty. If a replacement part ever malfunctions under normal use, we repair or replace it free of charge.",
      linkText: "Learn About Our Warranty",
      linkHref: "/warranty",
      image: "",
    },
    {
      tag: "Certified Pre-Owned",
      title: "Certified Pre-Owned Devices",
      text: "Upgrade for less with our fully tested and cleaned iPhones, Samsung Galaxy phones, and iPads. Every device undergoes a 32-point inspection and includes a warranty.",
      linkText: "Explore Pre-Owned Devices",
      linkHref: "/schedule-repair",
      image: "",
    },
    {
      tag: "Android Specialists",
      title: "Samsung Galaxy & Android Care",
      text: "Specialized micro-soldering, curved AMOLED glass replacement, and OEM charging board repairs for Galaxy S, Note, Z Fold, and Google Pixel.",
      linkText: "View Android Services",
      linkHref: "/repairs/smartphone",
      image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=400&q=80",
    },
    {
      tag: "Apple Certified Quality",
      title: "Apple & OEM-Grade Parts",
      text: "Precision TrueTone calibration, original display IC transfers, and Apple battery health preservation by WISE Certified technicians.",
      linkText: "View iPhone & Mac Services",
      linkHref: "/repairs/smartphone/iphone-repair",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80",
    },
  ],
};

export type WiseProps = {
  heading?: string;
  title?: string;
  body?: string;
  note?: string;
  buttonText?: string;
  buttonLink?: string;
};
export const WISE_DEFAULTS: Required<WiseProps> = {
  heading: "The SmartFoneDoctor Difference - Certified Technicians",
  title: "WISE Certified Technicians",
  body: "SmartFoneDoctor is a proud WISE Certified Partner, an industry-recognized standard for excellence in mobile device repair. Our WISE Certified Technicians complete extensive training, with a strong focus on repair quality, safety protocols, and proper lithium-ion battery handling. As a WISE Certified Partner, we are committed to protecting your data and personal information throughout the repair process. Technicians renew their certification annually, ensuring our repair practices stay current and reliable.",
  note: "SmartFoneDoctor will not void your preexisting warranty.",
  buttonText: "Choose Store",
  buttonLink: "#locations",
};

export type FaqContent = { question: string; answer: string };
export type FaqSectionProps = {
  heading?: string;
  items?: FaqContent[];
  buttonText?: string;
  buttonLink?: string;
};
export const FAQ_DEFAULTS: Required<FaqSectionProps> = {
  heading: "Frequently Asked Questions about SmartFoneDoctor",
  items: [
    {
      question: "How do I book a repair at a SmartFoneDoctor store?",
      answer:
        "You can book an appointment directly through our online store locator by selecting your nearest location and choosing 'Book Repair'. You can also call your local store or walk in anytime during business hours for same-day service.",
    },
    {
      question: "What kinds of devices do you repair?",
      answer:
        "We repair all major smartphone models (Apple iPhone, Samsung Galaxy, Google Pixel, Motorola), iPads and tablets, MacBooks, Windows laptops, desktop computers, gaming consoles (PlayStation, Xbox, Nintendo), and smartwatches.",
    },
    {
      question: "How much will my repair cost?",
      answer:
        "Pricing depends on the specific device model and type of repair needed. We provide a completely free diagnostic inspection and upfront estimate before any work begins, so you know the exact cost with no surprise fees.",
    },
    {
      question: "How long will my repair take?",
      answer:
        "Most standard smartphone repairs, such as cracked screen replacements and battery swaps, are completed in under 45 minutes to 1 hour. Tablet, laptop, and console repairs are usually completed same-day or within 24 to 48 hours.",
    },
    {
      question: "Does SmartFoneDoctor use certified parts?",
      answer:
        "Yes, we exclusively utilize OEM-grade and certified premium replacement parts that meet strict industry quality and safety specifications. All parts installed by our WISE Certified technicians include our limited warranty.",
    },
    {
      question: "Do you sell Certified Pre-Owned (CPO) devices?",
      answer:
        "Yes! Many of our SmartFoneDoctor locations carry a wide selection of fully inspected, cleaned, and tested Certified Pre-Owned smartphones, tablets, and laptops. Each device comes backed with a warranty for your peace of mind.",
    },
  ],
  buttonText: "View All Repair FAQs",
  buttonLink: "/faq",
};

export type LatestGuidesProps = { badge?: string; heading?: string; linkText?: string; count?: number };
export const GUIDES_DEFAULTS: Required<LatestGuidesProps> = {
  badge: "Technician Knowledge Base",
  heading: "Latest Repair Guides & Diagnostics",
  linkText: "Explore All Guides & Insights",
  count: 3,
};

/** Empty strings from the builder fall back to the built-in text. */
export function pickText(value: string | undefined, fallback: string): string {
  return value && value.trim() ? value : fallback;
}

/** An empty or missing list falls back to the built-in list. */
export function pickList<T>(value: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}
