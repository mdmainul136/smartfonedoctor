export interface PageSectionItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  price?: string;
  icon?: string;
  image?: string;
  link?: string;
  linkText?: string;
  highlight?: boolean;
  colSpan?: 1 | 2 | 3 | "full";
  rowSpan?: 1 | 2;
  customCss?: string;
}

export interface PageSectionStyleBase {
  bgColor?: string;
  textColor?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  accentColor?: string;
  padding?: string;
  align?: "left" | "center";
  borderRadius?: string;

  // Elementor Container Controls
  displayLayout?: "grid" | "flex";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  alignItems?: "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
  gap?: string;
  gridColumns?: 1 | 2 | 3 | 4 | 5 | 6;
  gridTemplateColumns?: string;

  // Custom CSS
  customCss?: string;
}

export interface ResponsiveStyleOverride<B> {
  tablet?: Partial<B>;
  mobile?: Partial<B>;
}

export interface PageSectionStyle extends PageSectionStyleBase {
  responsive?: ResponsiveStyleOverride<PageSectionStyleBase>;
}

export interface PageSection {
  id: string;
  type: "services_grid" | "benefits" | "split_banner" | "faq" | "cta_banner" | "richtext";
  label: string;
  heading: string;
  subheading?: string;
  bodyHtml?: string;
  ctaText?: string;
  ctaLink?: string;
  items?: PageSectionItem[];
  columns?: 2 | 3 | 4;
  style?: PageSectionStyle;
  customCss?: string;
}

export interface HeroStyleBase {
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  badgeBg?: string;
  badgeColor?: string;
  padding?: string;
  align?: "left" | "center";
  customCss?: string;
}

export interface HeroStyle extends HeroStyleBase {
  responsive?: ResponsiveStyleOverride<HeroStyleBase>;
}

export type CMSViewport = "desktop" | "tablet" | "mobile";

/**
 * Returns the style for a given device, cascading overrides the way Elementor
 * does: desktop base -> tablet override -> mobile override.
 */
export function getEffectiveStyle<T extends PageSectionStyle | HeroStyle>(
  style: T | undefined,
  viewport: CMSViewport
): Omit<T, "responsive"> {
  const src = (style || {}) as T;
  const merged: Record<string, unknown> = { ...(src as unknown as Record<string, unknown>) };
  delete merged.responsive;
  const resp = (
    src as unknown as {
      responsive?: { tablet?: Record<string, unknown>; mobile?: Record<string, unknown> };
    }
  ).responsive;
  if (viewport === "tablet" || viewport === "mobile") {
    Object.assign(merged, resp?.tablet || {});
  }
  if (viewport === "mobile") {
    Object.assign(merged, resp?.mobile || {});
  }
  return merged as Omit<T, "responsive">;
}

export interface CMSPage {
  id: string;
  slug: string;
  name: string;
  path: string;
  category: "Core" | "Repairs" | "Utility" | "Legal";
  title: string;
  metaDesc: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroBadge: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  status: "Published" | "Draft";
  lastEdited: string;
  author: string;
  contentHtml?: string;
  focusKeyword?: string;
  keywords?: string[];
  featuredImage?: string;
  canonicalUrl?: string;
  schemaType?: string;
  heroStyle?: HeroStyle;
  sections?: PageSection[];
  puckData?: Record<string, unknown> | null;
  /** Set when someone publishes the page in the builder; seed upgrades never overwrite it after that. */
  puckEditedAt?: number;
  /** Pre-compiled CSS for all pbStyle widget data — saved on Publish, delivered as inline <style> in SSR. */
  compiledCss?: string;
  /** Created in Admin > Pages (not one of the built-in pages). Only these can be deleted. */
  custom?: boolean;
}

export const INITIAL_CMS_PAGES: CMSPage[] = [
  {
    id: "home",
    slug: "home",
    name: "Homepage",
    path: "/",
    category: "Core",
    title: "Fast & Reliable Phone & Electronics Repair in Philadelphia",
    metaDesc: "Philadelphia's top-rated cell phone, iPhone, iPad, MacBook, and console repair shop. 30-minute screen and battery service with warranty.",
    heroHeadline: "Fast, reliable repairs that keep your tech working when it matters.",
    heroSubtitle: "Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty.",
    heroBadge: "Philadelphia's Trusted Leader in",
    primaryCtaText: "Book your repair",
    primaryCtaLink: "/schedule-repair",
    status: "Published",
    lastEdited: "Today, 1:40 PM",
    author: "Dr. Mike",
    custom: false,
    puckData: null,
  },
  {
    id: "repairs",
    slug: "repairs",
    name: "Repairs Hub",
    path: "/repairs",
    category: "Repairs",
    title: "Professional Device Repair in Philadelphia | Same-Day Service | SmartFoneDoctor",
    metaDesc: "Expert walk-in repair services for iPhones, Samsung Galaxy, iPads, MacBooks, and Game Consoles in Philadelphia. 30-min screen replacements, battery repairs, and 90-day warranty.",
    heroHeadline: "Expert Device Repair — Every Brand, Every Model.",
    heroSubtitle: "Fast, reliable repairs for smartphones, tablets, computers, and game consoles backed by certified technicians and a 90-day warranty.",
    heroBadge: "Same-Day Walk-In Service",
    primaryCtaText: "Book Your Repair",
    primaryCtaLink: "/schedule-repair",
    status: "Published",
    lastEdited: "Today",
    author: "Dr. Mike",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-repairs-hero",
            badgeText: "Same-Day Walk-In Service",
            heading: "Expert Device Repair — Every Brand, Every Model.",
            subheading:
              "Fast, reliable repairs for smartphones, tablets, computers, and game consoles backed by certified technicians and a 90-day warranty.",
            ctaText: "Book Free Diagnostic",
            ctaLink: "/schedule-repair",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "ServicesGridBlock",
          props: {
            id: "ServicesGridBlock-repairs-categories",
            variant: "services_grid",
            heading: "Select Your Hardware Category",
            subheading: "Choose your device type to browse models, common issues, and upfront pricing.",
            displayLayout: "grid",
            gridColumns: 3,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "flex-start",
            alignItems: "stretch",
            gap: "16px",
            bgColor: "#ffffff",
            textColor: "#0f172a",
            cardBgColor: "#f8fafc",
            cardBorderColor: "#e2e8f0",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            borderRadius: "16px",
            customCss: "",
            items: [
              {
                title: "iPhone Repair",
                description: "iPhone 16 Pro down to iPhone 11. Screen replacements, batteries, cameras & back glass.",
                badge: "Most Popular",
                price: "from $69",
                icon: "Sparkles",
                link: "/repairs/iphone",
                linkText: "View iPhone Services",
                highlight: true,
                colSpan: "1",
                rowSpan: "1",
              },
              {
                title: "Samsung & Android Repair",
                description: "Galaxy S24/S23, Z Fold, Google Pixel & Motorola. AMOLED screens and charging ports.",
                badge: "Certified Tech",
                price: "from $79",
                icon: "Zap",
                link: "/repairs/smartphone",
                linkText: "View Android Services",
                highlight: false,
                colSpan: "1",
                rowSpan: "1",
              },
              {
                title: "iPad & Tablet Repair",
                description: "iPad Pro, Air, Mini, and standard iPad generations. Digitizer glass & charging docks.",
                badge: "Fast Turnaround",
                price: "from $89",
                icon: "Check",
                link: "/repairs/ipad",
                linkText: "View Tablet Services",
                highlight: false,
                colSpan: "1",
                rowSpan: "1",
              },
              {
                title: "MacBook & Laptop Repair",
                description: "MacBook Pro, Air, Dell & HP. Retina screens, logic board micro-soldering, and batteries.",
                badge: "Motherboard Lab",
                price: "from $129",
                icon: "Shield",
                link: "/repairs/mac",
                linkText: "View Computer Services",
                highlight: false,
                colSpan: "1",
                rowSpan: "1",
              },
              {
                title: "Game Console & HDMI",
                description: "PS5, Xbox Series X/S, and Nintendo Switch. HDMI port micro-soldering & thermal repasting.",
                badge: "Same Day",
                price: "from $99",
                icon: "CheckCircle2",
                link: "/repairs/computer",
                linkText: "View Console Services",
                highlight: false,
                colSpan: "1",
                rowSpan: "1",
              },
              {
                title: "Data Recovery & Diagnostics",
                description: "Ultrasonic liquid damage cleaning, NAND data extraction, and dead boot recovery.",
                badge: "Specialized Lab",
                price: "Free Inspection",
                icon: "Wrench",
                link: "/schedule-repair",
                linkText: "Emergency Diagnostic",
                highlight: false,
                colSpan: "1",
                rowSpan: "1",
              },
            ],
          },
        },
        {
          type: "PricingTableBlock",
          props: {
            id: "PricingTableBlock-repairs-pricing",
            heading: "Transparent, Upfront Repair Pricing",
            subheading: "No hidden diagnostic fees. Free inspection with every quote.",
            items: [
              {
                service: "OLED Screen Replacement",
                device: "iPhone 13 / 14 / 15",
                price: "$119",
                turnaround: "30 Mins",
                warranty: "Lifetime Limited",
                popular: true,
                badge: "Most Popular",
                ctaText: "Book Repair",
                ctaLink: "/schedule-repair",
              },
              {
                service: "OEM Battery Replacement",
                device: "All Smartphone Models",
                price: "$59",
                turnaround: "25 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Repair",
                ctaLink: "/schedule-repair",
              },
              {
                service: "Charging Port Micro-Solder",
                device: "iPhone / Android",
                price: "$69",
                turnaround: "45 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Repair",
                ctaLink: "/schedule-repair",
              },
              {
                service: "Liquid Damage Ultrasonic Clean",
                device: "Laptops & Phones",
                price: "$89",
                turnaround: "Same Day",
                warranty: "Diagnostic Certified",
                popular: false,
                badge: "",
                ctaText: "Book Repair",
                ctaLink: "/schedule-repair",
              },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            cardBgColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-repairs-steps",
            heading: "How Our Repair Process Works",
            subheading: "Walk in or schedule online—we make getting your tech repaired completely painless.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Walk In or Book", description: "Visit our 33 S 52nd St store or reserve a bench spot online.", badge: "Step 1" },
              { stepNumber: "02", title: "Free Diagnostic", description: "Technician inspects your device and gives a transparent, fixed quote.", badge: "Step 2" },
              { stepNumber: "03", title: "Fast Bench Repair", description: "Precision repair completed with OEM-grade parts in 30-45 minutes.", badge: "Step 3" },
              { stepNumber: "04", title: "18-Point QC Test", description: "Rigorous functional audit and 90-day warranty card handover.", badge: "Step 4" },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-repairs-faq",
            heading: "Repair Warranty & Turnaround FAQs",
            subheading: "Common questions about turnaround times, parts authenticity, and warranty terms.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#f8fafc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "How long will my repair take?",
                description: "Smartphone screens and batteries take 30 to 45 minutes. MacBooks, iPads, and gaming consoles are usually finished same-day or within 24 hours.",
                colSpan: "1",
              },
              {
                title: "What warranty do you provide on repairs?",
                description: "All replacement parts and technician labor are backed by our 90-day comprehensive guarantee against defects.",
                colSpan: "1",
              },
              {
                title: "Do I need to back up my device before bringing it in?",
                description: "While we do not wipe your device for hardware repairs, we always recommend having a recent backup for peace of mind.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-repairs-cta",
            heading: "Need an Instant Repair Estimate?",
            subheading: "Contact our bench technicians directly or walk into our 52nd St flagship location today.",
            ctaText: "Schedule Your Device Now",
            ctaLink: "/schedule-repair",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "repairs-iphone",
    slug: "repairs-iphone",
    name: "iPhone Repair",
    path: "/repairs/iphone",
    category: "Repairs",
    title: "Express iPhone Screen & Battery Repair Philadelphia | Same Day",
    metaDesc: "Same-day cracked screen replacement, battery renewal, and back glass repair for iPhone 16 Pro down to iPhone 11 at 3 Philadelphia branches.",
    heroHeadline: "Philadelphia's Premier iPhone Screen & Battery Repair Experts.",
    heroSubtitle: "OEM-grade OLED displays, 30-minute battery replacements, and precision laser back glass repair backed by our 90-day guarantee.",
    heroBadge: "Certified Apple Repair Specialists",
    primaryCtaText: "Get iPhone Estimate",
    primaryCtaLink: "/schedule-repair?device=iphone",
    status: "Published",
    lastEdited: "Yesterday",
    author: "Dr. Mike",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-iphone-hero",
            badgeText: "Certified Apple Repair Specialists",
            heading: "Philadelphia's Premier iPhone Screen & Battery Repair Experts.",
            subheading:
              "OEM-grade OLED displays, 30-minute battery replacements, and precision laser back glass repair backed by our 90-day guarantee.",
            ctaText: "Book iPhone Repair",
            ctaLink: "/schedule-repair?device=iphone",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "PricingTableBlock",
          props: {
            id: "PricingTableBlock-iphone-pricing",
            heading: "iPhone Repair Pricing & Services",
            subheading: "All repairs completed with OEM-grade parts and a 90-day warranty.",
            items: [
              {
                service: "OLED Screen Replacement",
                device: "iPhone 15 / 14 / 13 Pro",
                price: "$129",
                turnaround: "30 Mins",
                warranty: "Lifetime Limited",
                popular: true,
                badge: "Most Requested",
                ctaText: "Book Screen Fix",
                ctaLink: "/schedule-repair?device=iphone",
              },
              {
                service: "OEM Battery Replacement",
                device: "iPhone 15 down to iPhone 11",
                price: "$59",
                turnaround: "25 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Battery Fix",
                ctaLink: "/schedule-repair?device=iphone",
              },
              {
                service: "Laser Back Glass Renewal",
                device: "iPhone 15 / 14 / 13 / 12",
                price: "$89",
                turnaround: "Same Day",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Back Glass",
                ctaLink: "/schedule-repair?device=iphone",
              },
              {
                service: "Camera Lens & Sensor Fix",
                device: "All iPhone Pro Models",
                price: "$69",
                turnaround: "40 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Camera Fix",
                ctaLink: "/schedule-repair?device=iphone",
              },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            cardBgColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-iphone-flow",
            heading: "Same-Day iPhone Repair Flow",
            subheading: "From broken glass to factory calibration in 4 simple steps.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Walk In / Schedule", description: "Bring your iPhone to 33 S 52nd St or book online for instant priority.", badge: "Drop-off" },
              { stepNumber: "02", title: "Free Diagnostic", description: "Technician tests OLED touch grid, FaceID sensor, and battery cycles.", badge: "Audit" },
              { stepNumber: "03", title: "30-Min Bench Fix", description: "Precision cleanroom disassembly and TrueTone data transfer.", badge: "Repair" },
              { stepNumber: "04", title: "Handover & Warranty", description: "Final multi-point functional audit and 90-day warranty card issuance.", badge: "Done" },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "TestimonialBlock",
          props: {
            id: "TestimonialBlock-iphone-reviews",
            heading: "What iPhone Owners Say",
            subheading: "Real feedback from local iPhone users across Philadelphia.",
            columns: 3,
            items: [
              {
                name: "Marcus Jenkins",
                role: "iPhone 14 Pro User",
                rating: 5,
                text: "Fixed my iPhone 14 Pro shattered screen in 35 minutes flat while I waited. Screen looks OEM perfect and touch is super responsive!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "Ashley Davis",
                role: "iPhone 13 User",
                rating: 5,
                text: "Battery was draining in 2 hours. SmartFoneDoctor swapped it in 20 minutes, now lasts all day again. Super affordable!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "Robert Morales",
                role: "iPhone 15 Pro Max",
                rating: 5,
                text: "Cracked both front and back glass after a drop on concrete. They used laser separation and it looks brand new. Amazing work!",
                date: "Google Review",
                source: "Google",
              },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            cardBgColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-iphone-faq",
            heading: "iPhone Repair Questions & Answers",
            subheading: "Everything you need to know about parts quality and data security.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#ffffff",
            textColor: "#1d1c1a",
            cardBgColor: "#f8fafc",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Will my TrueTone and FaceID continue working after screen replacement?",
                description: "Yes! We use specialized EEPROM programmers to copy TrueTone calibration data from your original display to the replacement screen.",
                colSpan: "1",
              },
              {
                title: "Do you wipe the phone during screen or battery repairs?",
                description: "No. Your photos, apps, messages, and settings remain 100% intact. We never erase data for hardware component repairs.",
                colSpan: "1",
              },
              {
                title: "How long is the warranty on iPhone replacement parts?",
                description: "All iPhone screens and batteries include our 90-day comprehensive guarantee covering both parts and labor against defects.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-iphone-cta",
            heading: "Get Your iPhone Repaired in 30 Minutes",
            subheading: "Walk into 33 S 52nd St today or reserve your parts online now.",
            ctaText: "Book Same-Day Appointment",
            ctaLink: "/schedule-repair?device=iphone",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "repairs-smartphone",
    slug: "repairs-smartphone",
    name: "Samsung & Android Repair",
    path: "/repairs/smartphone",
    category: "Repairs",
    title: "Samsung Galaxy & Google Pixel Repair in Philadelphia",
    metaDesc: "Authorized repair for Samsung Galaxy S24/S23, Z Fold, and Google Pixel. AMOLED screen replacements, charging ports, and water damage.",
    heroHeadline: "Professional Samsung Galaxy & Android Smartphone Care.",
    heroSubtitle: "Genuine Samsung service packs, authentic Pixel displays, and charging port replacements done in under 45 minutes.",
    heroBadge: "Certified Android Technicians",
    primaryCtaText: "Fix My Samsung",
    primaryCtaLink: "/schedule-repair?device=samsung",
    status: "Published",
    lastEdited: "Nov 10",
    author: "Tech Lead",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-android-hero",
            badgeText: "Certified Android Technicians",
            heading: "Professional Samsung Galaxy & Android Smartphone Care.",
            subheading:
              "Genuine Samsung service packs, authentic Pixel displays, and charging port replacements done in under 45 minutes.",
            ctaText: "Book Android Repair",
            ctaLink: "/schedule-repair?device=samsung",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "PricingTableBlock",
          props: {
            id: "PricingTableBlock-android-pricing",
            heading: "Samsung & Google Pixel Repair Pricing",
            subheading: "Authentic Dynamic AMOLED service packs with factory fingerprint calibration.",
            items: [
              {
                service: "Dynamic AMOLED Screen",
                device: "Samsung Galaxy S24 / S23 / S22",
                price: "$149",
                turnaround: "45 Mins",
                warranty: "Lifetime Limited",
                popular: true,
                badge: "Most Requested",
                ctaText: "Book Screen Fix",
                ctaLink: "/schedule-repair?device=samsung",
              },
              {
                service: "OEM Battery Replacement",
                device: "Galaxy S, Note & Google Pixel",
                price: "$59",
                turnaround: "30 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Battery Fix",
                ctaLink: "/schedule-repair?device=samsung",
              },
              {
                service: "USB-C Sub-Board Replacement",
                device: "Galaxy, Pixel & Motorola",
                price: "$69",
                turnaround: "35 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Port Fix",
                ctaLink: "/schedule-repair?device=samsung",
              },
              {
                service: "Liquid Damage Ultrasonic Clean",
                device: "All Android Devices",
                price: "$79",
                turnaround: "Same Day",
                warranty: "Diagnostic Certified",
                popular: false,
                badge: "",
                ctaText: "Book Cleaning",
                ctaLink: "/schedule-repair?device=samsung",
              },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            cardBgColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-android-flow",
            heading: "45-Minute Android Repair Process",
            subheading: "Restoring water resistance seals and ultrasonic fingerprint sensors.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Walk In / Schedule", description: "Bring your Galaxy or Pixel to our shop or book online.", badge: "Intake" },
              { stepNumber: "02", title: "Diagnostic Audit", description: "Testing touch digitizer, optical sensor, and charging draw.", badge: "Bench" },
              { stepNumber: "03", title: "Thermal Bench Fix", description: "Precision hot-plate back cover removal and OEM part swap.", badge: "Repair" },
              { stepNumber: "04", title: "Sensor Calibration", description: "Biometric optical calibration and 90-day warranty card issuance.", badge: "QC" },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-android-faq",
            heading: "Android Repair FAQs",
            subheading: "Common questions about Samsung parts authenticity and fingerprint sensors.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#f8fafc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Will my under-display fingerprint reader work after screen repair?",
                description: "Yes! We use genuine Samsung Service Pack displays and perform optical sensor recalibration so your biometric security works flawlessly.",
                colSpan: "1",
              },
              {
                title: "Do you repair curved screen phones like the Galaxy Ultra?",
                description: "Yes! We stock pre-bonded curved OLED frames for S24 Ultra, S23 Ultra, and S22 series for seamless factory fit.",
                colSpan: "1",
              },
              {
                title: "How long is the warranty on Android replacement parts?",
                description: "Every Android screen and battery replacement is covered by our 90-day comprehensive parts and workmanship guarantee.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-android-cta",
            heading: "Fix Your Samsung or Android Phone Today",
            subheading: "Walk-ins welcome every day at 33 S 52nd St, Philadelphia.",
            ctaText: "Schedule Same-Day Repair",
            ctaLink: "/schedule-repair?device=samsung",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "repairs-ipad",
    slug: "repairs-ipad",
    name: "iPad & Tablet Repair",
    path: "/repairs/ipad",
    category: "Repairs",
    title: "iPad Pro, Air, & Mini Screen Repair in West Philadelphia",
    metaDesc: "Fast digitizer glass replacement, LCD repair, and charging dock restoration for iPad Pro, iPad Air, iPad Mini, and Galaxy Tabs.",
    heroHeadline: "Fast iPad Glass & Digitizer Replacement in Philadelphia.",
    heroSubtitle: "Restore your iPad or tablet to mint condition. Same-day repairs for schools, businesses, and everyday users.",
    heroBadge: "All iPad Generations Supported",
    primaryCtaText: "Book Tablet Service",
    primaryCtaLink: "/schedule-repair?device=ipad",
    status: "Published",
    lastEdited: "Nov 08",
    author: "Tech Lead",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-ipad-hero",
            badgeText: "All iPad Generations Supported",
            heading: "Fast iPad Glass & Digitizer Replacement in Philadelphia.",
            subheading:
              "Restore your iPad or tablet to mint condition. Same-day repairs for schools, businesses, and everyday users.",
            ctaText: "Book iPad Repair",
            ctaLink: "/schedule-repair?device=ipad",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "PricingTableBlock",
          props: {
            id: "PricingTableBlock-ipad-pricing",
            heading: "iPad & Tablet Repair Pricing",
            subheading: "OEM glass digitizers with Apple Pencil pressure sensitivity preserved.",
            items: [
              {
                service: "Glass Digitizer Replacement",
                device: "iPad 10th / 9th / 8th / 7th Gen",
                price: "$89",
                turnaround: "Same Day",
                warranty: "90-Day Free",
                popular: true,
                badge: "Most Common",
                ctaText: "Book Digitizer",
                ctaLink: "/schedule-repair?device=ipad",
              },
              {
                service: "Full Retina LCD + Glass",
                device: "iPad Pro 11 / 12.9 & iPad Air",
                price: "$179",
                turnaround: "Same Day",
                warranty: "Lifetime Limited",
                popular: false,
                badge: "",
                ctaText: "Book Screen Fix",
                ctaLink: "/schedule-repair?device=ipad",
              },
              {
                service: "OEM Battery Replacement",
                device: "All iPad Pro & Air Models",
                price: "$99",
                turnaround: "24 Hours",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Battery",
                ctaLink: "/schedule-repair?device=ipad",
              },
              {
                service: "Lightning / USB-C Dock Fix",
                device: "All iPad Generations",
                price: "$79",
                turnaround: "Same Day",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Port Fix",
                ctaLink: "/schedule-repair?device=ipad",
              },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            cardBgColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-ipad-flow",
            heading: "Cleanroom Tablet Repair Flow",
            subheading: "Uniform pressure bonding to prevent dust and glass lifting.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Intake & Testing", description: "Audit digitizer grid zones and LCD backlight bleed.", badge: "Step 1" },
              { stepNumber: "02", title: "Thermal Separation", description: "Controlled heat bed softens factory adhesive cleanly.", badge: "Step 2" },
              { stepNumber: "03", title: "OEM Digitizer Fit", description: "Precision copper grounding and dust-free chamber assembly.", badge: "Step 3" },
              { stepNumber: "04", title: "Pencil & Touch QC", description: "Pencil latency test and 90-day warranty card handover.", badge: "Step 4" },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-ipad-faq",
            heading: "iPad Repair FAQs",
            subheading: "Common questions about tablet glass vs LCD repair.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#f8fafc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Can you fix just the top cracked glass if my iPad display still turns on?",
                description: "Yes! On standard iPads (7th, 8th, 9th, 10th gen), the glass digitizer is separate from the LCD panel, making repair significantly less expensive.",
                colSpan: "1",
              },
              {
                title: "Will my Apple Pencil still work after replacement?",
                description: "Yes! We test palm rejection and pencil drawing latency across the entire screen before certifying your repair.",
                colSpan: "1",
              },
              {
                title: "Do you offer education or bulk discounts for schools?",
                description: "Yes, we partner with multiple Philadelphia schools and universities for expedited batch iPad repairs with warranty.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-ipad-cta",
            heading: "Need Your iPad Repaired for Class or Work?",
            subheading: "Walk into 33 S 52nd St or book online for priority turnaround.",
            ctaText: "Schedule Tablet Service",
            ctaLink: "/schedule-repair?device=ipad",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "repairs-mac",
    slug: "repairs-mac",
    name: "MacBook & Laptop Repair",
    path: "/repairs/mac",
    category: "Repairs",
    title: "MacBook Pro, Air & PC Laptop Repair Philadelphia",
    metaDesc: "Retina screen replacements, keyboard repair, battery service, and liquid damage logic board diagnostics in Philadelphia.",
    heroHeadline: "Expert MacBook & PC Computer Repair in West Philly.",
    heroSubtitle: "Component-level motherboard repair, SSD upgrades, and battery replacements for MacBook Pro, MacBook Air, Dell, and HP laptops.",
    heroBadge: "Hardware & Logic Board Certified",
    primaryCtaText: "Request Laptop Diagnostic",
    primaryCtaLink: "/schedule-repair?device=laptop",
    status: "Published",
    lastEdited: "Nov 06",
    author: "Dr. Mike",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-mac-hero",
            badgeText: "Hardware & Logic Board Certified",
            heading: "Expert MacBook & PC Computer Repair in West Philly.",
            subheading:
              "Component-level motherboard repair, SSD upgrades, and battery replacements for MacBook Pro, MacBook Air, Dell, and HP laptops.",
            ctaText: "Book Laptop Diagnostic",
            ctaLink: "/schedule-repair?device=laptop",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "PricingTableBlock",
          props: {
            id: "PricingTableBlock-mac-pricing",
            heading: "MacBook & PC Computer Repair Pricing",
            subheading: "Component-level micro-soldering fixes what Apple says is unfixable.",
            items: [
              {
                service: "Retina Display OEM Assembly",
                device: "MacBook Pro & Air 13 / 14 / 16",
                price: "$249",
                turnaround: "24-48 Hours",
                warranty: "Lifetime Limited",
                popular: true,
                badge: "OEM Grade",
                ctaText: "Book Screen Fix",
                ctaLink: "/schedule-repair?device=laptop",
              },
              {
                service: "Logic Board Micro-Soldering",
                device: "MacBook Pro, Air & iMac",
                price: "$189",
                turnaround: "Same Day",
                warranty: "90-Day Free",
                popular: false,
                badge: "Specialized Lab",
                ctaText: "Book Board Fix",
                ctaLink: "/schedule-repair?device=laptop",
              },
              {
                service: "OEM Battery Replacement",
                device: "All MacBook & PC Laptops",
                price: "$119",
                turnaround: "Same Day",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Battery Fix",
                ctaLink: "/schedule-repair?device=laptop",
              },
              {
                service: "Liquid Spill Ultrasonic Clean",
                device: "Laptops & Desktops",
                price: "$99",
                turnaround: "Same Day",
                warranty: "Diagnostic Certified",
                popular: false,
                badge: "",
                ctaText: "Book Cleaning",
                ctaLink: "/schedule-repair?device=laptop",
              },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            cardBgColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-mac-flow",
            heading: "Computer Diagnostic & Bench Workflow",
            subheading: "Accurate micro-probing to isolate faulty shorted capacitors and chips.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Intake & Audit", description: "Serial logging, power-draw meter check, and visual board inspection.", badge: "Step 1" },
              { stepNumber: "02", title: "Thermal Probe", description: "Infrared thermal imaging to spot boiling shorted power-rail ICs.", badge: "Step 2" },
              { stepNumber: "03", title: "Micro-Solder", description: "Clean micro-soldering replacement using authentic OEM chips.", badge: "Step 3" },
              { stepNumber: "04", title: "Burn-In Stress Test", description: "2-hour CPU/GPU stress test and 90-day warranty handover.", badge: "Step 4" },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-mac-faq",
            heading: "MacBook & Laptop Repair FAQs",
            subheading: "Everything you need to know about computer diagnostics and data safety.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#f8fafc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Apple told me my MacBook needs a $900 board replacement. Can you fix it for less?",
                description: "Yes! Apple does not solder; they simply swap entire assemblies. Our technicians micro-solder the individual failed capacitor or power chip, saving you hundreds of dollars.",
                colSpan: "1",
              },
              {
                title: "Will I lose my files during MacBook repair?",
                description: "No. Your SSD storage and data remain untouched during display, battery, and power-circuit micro-soldering repairs.",
                colSpan: "1",
              },
              {
                title: "Do you repair Windows laptops like Dell, HP, and Lenovo?",
                description: "Yes! We service all Windows laptops and gaming rigs for broken hinges, DC power jacks, cracked screens, and overheating fans.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-mac-cta",
            heading: "Get Your Computer Inspected Today",
            subheading: "Walk into our 33 S 52nd St repair lab or schedule online for priority intake.",
            ctaText: "Schedule Computer Service",
            ctaLink: "/schedule-repair?device=laptop",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "repairs-computer",
    slug: "repairs-computer",
    name: "Game Console & HDMI Repair",
    path: "/repairs/computer",
    category: "Repairs",
    title: "PS5, Xbox & Nintendo Switch HDMI Port Repair Philadelphia",
    metaDesc: "Micro-soldering HDMI port replacement, power supply diagnostics, and fan cleaning for PlayStation 5, Xbox Series X, and Switch.",
    heroHeadline: "Next-Gen Gaming Console Repair & Micro-Soldering.",
    heroSubtitle: "No signal on your TV? We specialize in precision micro-soldering HDMI port replacement for PS5, PS4, Xbox Series X/S, and Switch OLED.",
    heroBadge: "Micro-Soldering Lab On-Site",
    primaryCtaText: "Fix My Console",
    primaryCtaLink: "/schedule-repair?device=console",
    status: "Published",
    lastEdited: "Nov 04",
    author: "Lead Tech",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-console-hero",
            badgeText: "Micro-Soldering Lab On-Site",
            heading: "Next-Gen Gaming Console Repair & Micro-Soldering.",
            subheading:
              "No signal on your TV? We specialize in precision micro-soldering HDMI port replacement for PS5, PS4, Xbox Series X/S, and Switch OLED.",
            ctaText: "Book Console Repair",
            ctaLink: "/schedule-repair?device=console",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "PricingTableBlock",
          props: {
            id: "PricingTableBlock-console-pricing",
            heading: "Gaming Console Repair Pricing",
            subheading: "Clean micro-soldered replacement HDMI ports backed by our 6-month warranty.",
            items: [
              {
                service: "HDMI 2.1 Micro-Solder",
                device: "PlayStation 5 (Disc & Digital)",
                price: "$139",
                turnaround: "Same Day",
                warranty: "6-Month HDMI",
                popular: true,
                badge: "Most Common",
                ctaText: "Book PS5 HDMI",
                ctaLink: "/schedule-repair?device=console",
              },
              {
                service: "HDMI Port Replacement",
                device: "Xbox Series X / Series S",
                price: "$139",
                turnaround: "Same Day",
                warranty: "6-Month HDMI",
                popular: false,
                badge: "",
                ctaText: "Book Xbox HDMI",
                ctaLink: "/schedule-repair?device=console",
              },
              {
                service: "Liquid Metal Repaste & Clean",
                device: "PS5 Overheating Fix",
                price: "$79",
                turnaround: "45 Mins",
                warranty: "Bench Certified",
                popular: false,
                badge: "",
                ctaText: "Book Overheating Fix",
                ctaLink: "/schedule-repair?device=console",
              },
              {
                service: "USB-C & Joy-Con Drift Fix",
                device: "Nintendo Switch & OLED",
                price: "$59",
                turnaround: "30 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Book Switch Fix",
                ctaLink: "/schedule-repair?device=console",
              },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            cardBgColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-console-flow",
            heading: "Console Micro-Soldering Protocol",
            subheading: "Restoring 4K 120Hz display output without motherboard damage.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Bench Teardown", description: "ESD-safe teardown of casing, power supply, and thermal shielding.", badge: "Step 1" },
              { stepNumber: "02", title: "Microscope Desolder", description: "Hot air removal of broken port without lifting copper trace pads.", badge: "Step 2" },
              { stepNumber: "03", title: "OEM HDMI Solder", description: "19-pin precision microscope soldering and through-hole anchor bonding.", badge: "Step 3" },
              { stepNumber: "04", title: "4K 120Hz Testing", description: "Display output and HDR test on our 4K gaming monitor bench.", badge: "Step 4" },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-console-faq",
            heading: "Gaming Console FAQs",
            subheading: "Common questions about HDMI port damage and turnaround times.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#f8fafc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "How long does a PS5 HDMI port repair take?",
                description: "Most HDMI port micro-soldering jobs are completed same-day within 2 to 4 hours. You can drop off in the morning and pick up by afternoon.",
                colSpan: "1",
              },
              {
                title: "What if the pins were pulled out and the motherboard pads are torn?",
                description: "We are micro-soldering specialists! If copper trace pads were ripped from the board, we reconstruct micro jumper wires to restore video signals.",
                colSpan: "1",
              },
              {
                title: "Do I need to bring my cables and controllers?",
                description: "No, please bring only the console itself. We have all necessary power cords, HDMI cables, and test monitors at our bench.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-console-cta",
            heading: "Get Your Console Back in the Game",
            subheading: "Same-day HDMI micro-soldering in West Philadelphia with a 6-month warranty.",
            ctaText: "Schedule Console Repair",
            ctaLink: "/schedule-repair?device=console",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "locations",
    slug: "locations",
    name: "All Store Locations",
    path: "/locations",
    category: "Core",
    title: "Find Your Nearest SmartFoneDoctor Store | 3 Philly Branches",
    metaDesc: "Visit SmartFoneDoctor on 52nd St or Lancaster Ave. Walk-ins welcome Monday through Saturday with dedicated technician bench service.",
    heroHeadline: "3 Convenient Google-Verified Stores Across Philadelphia.",
    heroSubtitle: "Choose your nearest location below for instant walk-in directions, store hours, and direct shop technician phone lines.",
    heroBadge: "Philadelphia Neighborhood Hubs",
    primaryCtaText: "View Interactive Map",
    primaryCtaLink: "/locations#map",
    status: "Published",
    lastEdited: "Today",
    author: "Dr. Mike",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-locations-hero",
            badgeText: "Philadelphia Neighborhood Hubs",
            heading: "3 Convenient Google-Verified Stores Across Philadelphia.",
            subheading:
              "Choose your nearest location below for instant walk-in directions, store hours, and direct shop technician phone lines.",
            ctaText: "Book Appointment Online",
            ctaLink: "/schedule-repair",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "StoreCardBlock",
          props: {
            id: "StoreCardBlock-loc-flagship",
            storeName: "SmartFoneDoctor Flagship Store #1",
            badge: "Main Repair Lab • Open Today",
            address: "33 S 52nd St, Philadelphia, PA 19139",
            phone: "(215) 598-2090",
            hoursText: "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM",
            gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
            appointmentUrl: "/schedule-repair",
            accentColor: "#00807A",
            bgColor: "#ffffff",
            textColor: "#0f172a",
            padding: "32px 24px",
            customCss: "",
          },
        },
        {
          type: "StoreCardBlock",
          props: {
            id: "StoreCardBlock-loc-lancaster",
            storeName: "SmartFoneDoctor University City Branch",
            badge: "Express Walk-in Center",
            address: "4016 Lancaster Ave, Philadelphia, PA 19104",
            phone: "(215) 598-2090",
            hoursText: "Mon–Sat: 10:00 AM – 7:00 PM | Sun: Closed",
            gmbUrl: "https://maps.google.com/?q=4016+Lancaster+Ave+Philadelphia+PA",
            appointmentUrl: "/schedule-repair",
            accentColor: "#00807A",
            bgColor: "#ffffff",
            textColor: "#0f172a",
            padding: "32px 24px",
            customCss: "",
          },
        },
        {
          type: "StatsCounterRowBlock",
          props: {
            id: "StatsCounterRowBlock-loc-stats",
            heading: "Neighborhood Convenience & Certified Expertise",
            subheading: "Visit any location for fast, guaranteed repairs.",
            columns: 4,
            items: [
              { value: "3", suffix: "", label: "Philly Locations", subtext: "West Philly & Univ City" },
              { value: "No", suffix: " Appt Needed", label: "Walk-ins Welcome", subtext: "Monday through Saturday" },
              { value: "45", suffix: " min", label: "Average Turnaround", subtext: "screen & battery service" },
              { value: "4.9", suffix: " ★", label: "Google Rating", subtext: "500+ verified customer reviews" },
            ],
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "GoogleMapBlock",
          props: {
            id: "GoogleMapBlock-loc-map",
            address: "33 S 52nd St, Philadelphia, PA 19139",
            height: 380,
            borderRadius: "16px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-loc-faq",
            heading: "Frequently Asked Questions About Store Visits",
            subheading: "Everything you need to know before walking into our shops.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#f8fafc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Do I need to make an appointment before visiting?",
                description: "No appointment is needed! You can walk in at any time during business hours. Booking online simply gives you front-of-the-line bench priority.",
                colSpan: "1",
              },
              {
                title: "Which location is best for complex motherboard soldering?",
                description: "All three locations accept all devices, but our 33 S 52nd St flagship houses our dedicated cleanroom micro-soldering and laser back glass lab.",
                colSpan: "1",
              },
              {
                title: "Is parking available at your stores?",
                description: "Yes, street parking is available along 52nd St and Lancaster Ave, and all locations are conveniently situated near SEPTA transit stops.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-loc-cta",
            heading: "Walk In Today for a Free 10-Minute Diagnostic",
            subheading: "No hidden inspection fees. Upfront fixed quotes before any bench work begins.",
            ctaText: "Book Priority Appointment",
            ctaLink: "/schedule-repair",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "about",
    slug: "about",
    name: "About Us",
    path: "/about",
    category: "Core",
    title: "About SmartFoneDoctor | Trusted Philadelphia Repair Specialists",
    metaDesc: "Learn about SmartFoneDoctor's mission, certified technicians, community commitment, and lifetime workmanship warranty.",
    heroHeadline: "Keeping Philadelphia Connected Since 2018.",
    heroSubtitle: "Locally owned, community focused, and dedicated to fast, transparent electronics repair that extends the lifespan of your devices.",
    heroBadge: "Locally Owned & Operated",
    primaryCtaText: "Meet the Team",
    primaryCtaLink: "/about#team",
    status: "Published",
    lastEdited: "Oct 28",
    author: "Dr. Mike",
    focusKeyword: "About SmartFoneDoctor Philadelphia",
    featuredImage: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
    canonicalUrl: "https://smartfonedoctor.com/about",
    schemaType: "AboutPage",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-about-hero",
            badgeText: "Locally Owned & Operated",
            heading: "Keeping Philadelphia Connected Since 2018.",
            subheading:
              "Locally owned, community focused, and dedicated to fast, transparent electronics repair that extends the lifespan of your devices.",
            ctaText: "Schedule a Visit",
            ctaLink: "/schedule-repair",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "SplitBannerBlock",
          props: {
            id: "SplitBannerBlock-about-mission",
            heading: "Electronics Repair Rooted in Integrity & Speed",
            subheading: "We founded SmartFoneDoctor to provide Philadelphia with a repair center that values customer trust above everything else. No predatory pricing, no fake diagnostics—just honest bench work.",
            ctaText: "View Our Stores",
            ctaLink: "/locations",
            bgColor: "#ffffff",
            textColor: "#0f172a",
            cardBgColor: "#f8fafc",
            cardBorderColor: "#e2e8f0",
            accentColor: "#00807A",
            padding: "56px 24px",
            borderRadius: "16px",
            customCss: "",
            items: [
              {
                badge: "Sustainability",
                title: "Right to Repair & E-Waste Reduction",
                description: "By repairing rather than replacing, we prevent tons of toxic electronics from entering Philadelphia landfills.",
                icon: "Shield",
              },
              {
                badge: "Community First",
                title: "Supporting Local Schools & Clinics",
                description: "We provide priority expedited repair discounts for university students, educators, and healthcare workers.",
                icon: "Sparkles",
              },
              {
                badge: "Craftsmanship",
                title: "Precision Micro-Soldering Lab",
                description: "Our benches handle complex logic board repairs that ordinary mall kiosks turn away.",
                icon: "Wrench",
              },
            ],
          },
        },
        {
          type: "StatsCounterRowBlock",
          props: {
            id: "StatsCounterRowBlock-about-stats",
            heading: "Six Years of Serving the Philadelphia Community",
            subheading: "Numbers that reflect our dedication to prompt, dependable service.",
            columns: 4,
            items: [
              { value: "6+", suffix: " Years", label: "In Business", subtext: "locally operated" },
              { value: "5,000+", suffix: "", label: "Devices Saved", subtext: "from landfills" },
              { value: "100%", suffix: "", label: "OEM Parts Checked", subtext: "before installation" },
              { value: "4.9", suffix: " ★", label: "Average Review", subtext: "from 500+ locals" },
            ],
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-about-process",
            heading: "Our Standard of Workmanship",
            subheading: "Every device entrusted to us undergoes a standardized 4-stage quality protocol.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Intake & Visual Inspection", description: "Safe physical audit, serial number logging, and pre-repair diagnostic checks.", badge: "Intake" },
              { stepNumber: "02", title: "Cleanroom Disassembly", description: "Anti-static wristbands, ESD mats, and specialized thermal heat beds.", badge: "Bench" },
              { stepNumber: "03", title: "OEM Grade Component Fit", description: "Precision screwdriving, adhesive sealing, and factory water-resistant gaskets.", badge: "Install" },
              { stepNumber: "04", title: "18-Point QC Handover", description: "Display touch grid, cameras, speaker, mic, and charging tested before customer pickup.", badge: "QA" },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "TestimonialBlock",
          props: {
            id: "TestimonialBlock-about-reviews",
            heading: "Trusted by Philadelphia Residents & Students",
            subheading: "Here is what our community has to say about their experience at SmartFoneDoctor.",
            columns: 3,
            items: [
              {
                name: "Elena Rostova",
                role: "Penn Medicine Student",
                rating: 5,
                text: "Had my iPad screen crushed right before finals week. They repaired it in 40 minutes and gave me a student discount. Lifesavers!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "James Wilson",
                role: "West Philly Resident",
                rating: 5,
                text: "They are honest. Took in my phone thinking the port was broken, but they showed me it was just compacted lint. Cleaned it for free!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "Michael Chang",
                role: "Drexel University",
                rating: 5,
                text: "Best tech repair in Philadelphia by far. Quick turnaround, clear communication, and fair pricing.",
                date: "Google Review",
                source: "Google",
              },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            cardBgColor: "#f8fafc",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-about-faq",
            heading: "Questions About Our Team & Quality",
            subheading: "Everything you need to know about our repair shop policies and certifications.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#f8fafc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Are your technicians certified?",
                description: "Yes, our technicians undergo extensive WISE (Wireless Industry Service Excellence) training and adhere to IPC micro-soldering standards.",
                colSpan: "1",
              },
              {
                title: "Do you offer warranties on repairs?",
                description: "Every repair includes a 90-day comprehensive warranty covering all parts and labor. If the replaced part fails due to a defect, we fix it at zero cost.",
                colSpan: "1",
              },
              {
                title: "Where do you source your replacement parts?",
                description: "We work directly with certified OEM supply chain partners to source Grade-A+ screens, authentic batteries, and genuine charging components.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-about-cta",
            heading: "Visit Us in West Philadelphia Today",
            subheading: "Walk-ins welcome Monday through Saturday. Experience fast, honest repair service.",
            ctaText: "Find Nearest Store",
            ctaLink: "/locations",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "schedule-repair",
    slug: "schedule-repair",
    name: "Schedule Repair Flow",
    path: "/schedule-repair",
    category: "Utility",
    title: "Schedule Your Phone or Device Repair Online | Instant Estimate",
    metaDesc: "Book your repair appointment online for priority bench check-in. Free diagnostics, 90-day warranty, and fast turnaround.",
    heroHeadline: "Book Your Repair Online for Priority Bench Service.",
    heroSubtitle: "Select your device, describe the issue, and pick your preferred Philadelphia store. Walk-ins always welcome.",
    heroBadge: "Zero Waiting Time",
    primaryCtaText: "Start Booking Flow",
    primaryCtaLink: "#form",
    status: "Published",
    lastEdited: "Nov 11",
    author: "Dr. Mike",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-schedule-hero",
            badgeText: "Zero Waiting Time",
            heading: "Book Your Repair Online for Priority Bench Service.",
            subheading:
              "Select your device, describe the issue, and pick your preferred Philadelphia store. Walk-ins always welcome.",
            ctaText: "Check Ticket Status",
            ctaLink: "/repair-status",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "StepProcessBlock",
          props: {
            id: "StepProcessBlock-schedule-flow",
            heading: "Simple 4-Step Repair Booking",
            subheading: "Takes less than 60 seconds to lock in priority bench turnaround.",
            layout: "horizontal",
            steps: [
              { stepNumber: "01", title: "Select Hardware", description: "Choose smartphone, tablet, laptop, or game console brand and model.", badge: "Hardware" },
              { stepNumber: "02", title: "Describe Issue", description: "Pick screen crack, battery drain, liquid spill, or request a diagnostic.", badge: "Problem" },
              { stepNumber: "03", title: "Choose Store Branch", description: "Select 52nd St Flagship or Lancaster Ave Express center.", badge: "Location" },
              { stepNumber: "04", title: "Instant Intake SMS", description: "Receive immediate SMS confirmation with your live tracker ticket code.", badge: "Ready" },
            ],
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "BookingFormBlock",
          props: {
            id: "form",
            mode: "interactive",
            heading: "Schedule Your Same-Day Repair",
            subheading:
              "Select your device, describe the issue, and pick your preferred Philadelphia store for express bench check-in.",
            badge: "Priority Bench Check-In",
            accentColor: "#00807A",
            bgColor: "#ffffff",
            textColor: "#0f172a",
            padding: "32px 16px",
            customCss: "",
          },
        },
        {
          type: "PricingTableBlock",
          props: {
            id: "PricingTableBlock-schedule-prices",
            heading: "Transparent Repair Price Estimates",
            subheading: "Free inspection with every quote. No work performed without your prior approval.",
            items: [
              {
                service: "OLED Screen Replacement",
                device: "iPhone 13 / 14 / 15",
                price: "$119",
                turnaround: "30 Mins",
                warranty: "Lifetime Limited",
                popular: true,
                badge: "Most Popular",
                ctaText: "Select This Repair",
                ctaLink: "#form",
              },
              {
                service: "OEM Battery Replacement",
                device: "All Smartphone Models",
                price: "$59",
                turnaround: "25 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Select This Repair",
                ctaLink: "#form",
              },
              {
                service: "Charging Port Micro-Solder",
                device: "iPhone / Android",
                price: "$69",
                turnaround: "45 Mins",
                warranty: "90-Day Free",
                popular: false,
                badge: "",
                ctaText: "Select This Repair",
                ctaLink: "#form",
              },
              {
                service: "Liquid Damage Ultrasonic Clean",
                device: "Laptops & Phones",
                price: "$89",
                turnaround: "Same Day",
                warranty: "Diagnostic Certified",
                popular: false,
                badge: "",
                ctaText: "Select This Repair",
                ctaLink: "#form",
              },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            cardBgColor: "#f8fafc",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StoreCardBlock",
          props: {
            id: "StoreCardBlock-schedule-flagship",
            storeName: "SmartFoneDoctor Flagship Store #1",
            badge: "Primary Drop-Off Hub",
            address: "33 S 52nd St, Philadelphia, PA 19139",
            phone: "(215) 598-2090",
            hoursText: "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM",
            gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
            appointmentUrl: "#form",
            accentColor: "#00807A",
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            padding: "32px 24px",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-schedule-faq",
            heading: "Booking & Drop-Off Policies",
            subheading: "Common questions regarding intake, cancellations, and parts reservations.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#ffffff",
            textColor: "#1d1c1a",
            cardBgColor: "#f8fafc",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Can I cancel or reschedule my appointment?",
                description: "Yes, you can reschedule at any time via the SMS confirmation link with zero cancellation fee.",
                colSpan: "1",
              },
              {
                title: "What if I arrive late for my appointment?",
                description: "No worries! We operate as a walk-in friendly shop. Your reservation will remain active on our bench queue.",
                colSpan: "1",
              },
              {
                title: "Do I need to leave my password or passcode?",
                description: "We only ask for passcodes if full functional verification (cameras, mic, speakers) is required. You are welcome to test the device yourself at pickup.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-schedule-cta",
            heading: "Need Emergency Same-Hour Service?",
            subheading: "Call our bench dispatch directly or walk into 33 S 52nd St right now.",
            ctaText: "Call Shop (215) 598-2090",
            ctaLink: "tel:2155982090",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "review",
    slug: "review",
    name: "Customer Reviews",
    path: "/review",
    category: "Core",
    title: "Customer Reviews & Store Ratings | SmartFoneDoctor Philadelphia",
    metaDesc: "Read 420+ verified 5-star customer reviews across our 3 Philadelphia repair centers. Rate your technician or book a repair.",
    heroHeadline: "Real Reviews from Real Philadelphia Customers.",
    heroSubtitle: "Over 500+ verified five-star ratings across West Philadelphia and University City. See why our neighbors trust us with their devices.",
    heroBadge: "4.9 / 5 Rating • 500+ Reviews",
    primaryCtaText: "Leave a Review",
    primaryCtaLink: "/review#write",
    status: "Published",
    lastEdited: "Today",
    author: "Dr. Mike",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-review-hero",
            badgeText: "4.9 / 5 Rating • 500+ Reviews",
            heading: "Real Reviews from Real Philadelphia Customers.",
            subheading:
              "Over 500+ verified five-star ratings across West Philadelphia and University City. See why our neighbors trust us with their devices.",
            ctaText: "Book Your Repair Online",
            ctaLink: "/schedule-repair",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "64px 32px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "StatsCounterRowBlock",
          props: {
            id: "StatsCounterRowBlock-review-stats",
            heading: "Our Service Standards in Numbers",
            subheading: "Authentic feedback compiled directly from Google Maps and customer intake audits.",
            columns: 4,
            items: [
              { value: "4.9", suffix: " ★", label: "Average Rating", subtext: "across all 3 stores" },
              { value: "500+", suffix: "", label: "Verified Reviews", subtext: "on Google Business" },
              { value: "3", suffix: "", label: "Philly Locations", subtext: "West Philly & Univ City" },
              { value: "90", suffix: " Days", label: "Free Warranty", subtext: "on parts & labor" },
            ],
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "TestimonialBlock",
          props: {
            id: "TestimonialBlock-review-wall",
            heading: "Verified Customer Experiences",
            subheading: "Read recent reviews from customers who had their iPhones, laptops, and game consoles repaired.",
            columns: 3,
            items: [
              {
                name: "Marcus Jenkins",
                role: "University City",
                rating: 5,
                text: "Fixed my iPhone 14 Pro shattered screen in 35 minutes flat while I waited. Screen looks OEM perfect and touch is super responsive. Highly recommended!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "Sarah Lin",
                role: "West Philadelphia",
                rating: 5,
                text: "My MacBook wouldn't turn on after a coffee spill. The Apple Store said I needed a $900 board replacement. SmartFoneDoctor repaired it same day for a fraction of that!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "David Thompson",
                role: "Center City",
                rating: 5,
                text: "Fastest repair service in the city. Clear pricing, no surprise fees, and they gave me a 90-day warranty on my Samsung battery replacement.",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "Elena Rostova",
                role: "Penn Medicine",
                rating: 5,
                text: "Had my iPad screen crushed right before finals week. They repaired it in 40 minutes and gave me a student discount. Lifesavers!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "James Wilson",
                role: "West Philly",
                rating: 5,
                text: "They are honest. Took in my phone thinking the port was broken, but they showed me it was just compacted lint. Cleaned it for free!",
                date: "Google Review",
                source: "Google",
              },
              {
                name: "Michael Chang",
                role: "Drexel University",
                rating: 5,
                text: "Best tech repair in Philadelphia by far. Quick turnaround, clear communication, and fair pricing.",
                date: "Google Review",
                source: "Google",
              },
            ],
            bgColor: "#ffffff",
            textColor: "#0f172a",
            cardBgColor: "#f8fafc",
            accentColor: "#00807A",
            padding: "56px 24px",
            customCss: "",
          },
        },
        {
          type: "StoreCardBlock",
          props: {
            id: "StoreCardBlock-review-store",
            storeName: "SmartFoneDoctor Flagship Store #1",
            badge: "West Philadelphia HQ • 4.9★",
            address: "33 S 52nd St, Philadelphia, PA 19139",
            phone: "(215) 598-2090",
            hoursText: "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM",
            gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
            appointmentUrl: "/schedule-repair",
            accentColor: "#00807A",
            bgColor: "#f8fafc",
            textColor: "#0f172a",
            padding: "32px 24px",
            customCss: "",
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-review-cta",
            heading: "Ready for 5-Star Device Service?",
            subheading: "Join thousands of satisfied Philadelphia device owners. Fast repairs backed by a 90-day warranty.",
            ctaText: "Book Your Repair Online",
            ctaLink: "/schedule-repair",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "56px 24px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
  {
    id: "track",
    slug: "track",
    name: "Repair Status Tracking",
    path: "/track",
    category: "Utility",
    title: "Track Your Device Repair Status Live | SmartFoneDoctor",
    metaDesc: "Check real-time bench diagnostic, parts arrival, and ready-for-pickup status using your ticket number.",
    heroHeadline: "Check Live Repair Bench & Pickup Status.",
    heroSubtitle: "Enter your 4-digit ticket number or phone number to see real-time updates from our assigned bench technician.",
    heroBadge: "Live Customer Portal",
    primaryCtaText: "Check Ticket",
    primaryCtaLink: "#tracker",
    status: "Published",
    lastEdited: "Nov 02",
    author: "Dispatcher",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-track-hero",
            badgeText: "Live Customer Portal",
            heading: "Check Live Repair Bench & Pickup Status.",
            subheading:
              "Enter your 4-digit ticket number or phone number to see real-time updates from our assigned bench technician.",
            ctaText: "Check Ticket Status",
            ctaLink: "#tracker",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(0, 150, 145, 0.2)",
            badgeColor: "#5eead4",
            padding: "56px 36px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "RepairTrackerBlock",
          props: {
            id: "RepairTrackerBlock-live-widget",
            title: "Check Your Repair Status",
            subtitle:
              "Checking the live status of your repair is quick and easy. Enter your ticket ID and last name below to see real-time diagnostic and repair progress.",
            badge: "Live Bench Portal",
            accentColor: "#00807A",
            secondaryColor: "#00807A",
            demoTicketId: "SFD-84920",
            demoLastName: "Smith",
            paddingY: 48,
            paddingX: 24,
            backgroundColor: "#f8fafc",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-track-faq",
            heading: "Repair Tracking & Warranty FAQs",
            subheading:
              "Common questions about repair ticket lookup, bench turnaround times, and warranty coverage.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#ffffff",
            textColor: "#1d1c1a",
            cardBgColor: "#f8fafc",
            cardBorderColor: "#e2e8f0",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "Where can I find my Ticket ID?",
                description:
                  "Your Ticket ID (e.g. SFD-84920) is printed at the top-right of your intake receipt and was also sent via SMS/Email confirmation upon device check-in.",
                colSpan: "1",
              },
              {
                title: "How often is the bench status updated?",
                description:
                  "Our technicians update diagnostic findings and part installation status directly at their work benches in real time.",
                colSpan: "1",
              },
              {
                title: "What do I need to bring for pickup?",
                description:
                  "Please bring a government-issued photo ID and your repair intake ticket or SMS confirmation to collect your repaired device.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-track-help",
            heading: "Ready to Fix Your Device Today?",
            subheading:
              "Call our bench technicians directly or check store hours across Philadelphia.",
            ctaText: "Schedule Repair Now",
            ctaLink: "/schedule-repair",
            align: "center",
            bgColor: "#0f172a",
            textColor: "#ffffff",
            accentColor: "#00807A",
          },
        },
      ],
    },
  },
  {
    id: "faq",
    slug: "faq",
    name: "FAQ Page",
    path: "/faq",
    category: "Utility",
    title: "Frequently Asked Questions | SmartFoneDoctor Philadelphia",
    metaDesc: "Answers to common questions about pricing, repair times, 90-day warranty, data privacy, and walk-in policies.",
    heroHeadline: "FAQ About Cell Phone Repair",
    heroSubtitle: "If you have questions about warranties, what's wrong with your device, or how SmartFoneDoctor's repair services work, this section is for you! We've compiled a list of our most frequently asked questions about cell phone repairs and our services.",
    heroBadge: "FAQS",
    primaryCtaText: "Schedule Repair",
    primaryCtaLink: "/schedule-repair",
    status: "Published",
    lastEdited: "Nov 01",
    author: "Dr. Mike",
    puckData: {
      root: { props: {} },
      content: [
        {
          type: "HeroBlock",
          props: {
            id: "HeroBlock-faq-hero",
            badgeText: "FAQS",
            heading: "FAQ About Cell Phone Repair",
            subheading:
              "If you have questions about warranties, what's wrong with your device, or how SmartFoneDoctor's repair services work, this section is for you! We've compiled a list of our most frequently asked questions about cell phone repairs and our services. Get answers to our FAQ below!",
            ctaText: "Schedule Repair",
            ctaLink: "/schedule-repair",
            bgColor: "#171717",
            textColor: "#ffffff",
            accentColor: "#00807A",
            badgeBg: "rgba(255, 255, 255, 0.12)",
            badgeColor: "#ffffff",
            padding: "56px 36px",
            align: "left",
            customCss: "",
          },
        },
        {
          type: "FaqBlock",
          props: {
            id: "FaqBlock-faq-list",
            heading: "Frequently Asked Questions",
            subheading:
              "Clear, upfront answers regarding parts quality, repair duration, warranty coverage, and data safety.",
            displayLayout: "grid",
            gridColumns: 1,
            gap: "12px",
            bgColor: "#fcfcfc",
            textColor: "#1d1c1a",
            cardBgColor: "#ffffff",
            cardBorderColor: "#e5e5e5",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            borderRadius: "14px",
            customCss: "",
            items: [
              {
                title: "How can I find a SmartFoneDoctor repair store near me?",
                description:
                  "You can easily locate your nearest store using our online Store Locator at /locations/i/book-repair. Enter your zip code, city, or allow browser location access to view all nearby stores, their operating hours, contact phone numbers, and get instant directions.",
                colSpan: "1",
              },
              {
                title: "Are certified pre-owned phones unlocked and ready for my carrier?",
                description:
                  "Yes! All SmartFoneDoctor Certified Pre-Owned (CPO) phones are fully network unlocked, meaning they can be used with any major carrier including Verizon, AT&T, T-Mobile, and international GSM networks. Simply insert your SIM card or activate your eSIM.",
                colSpan: "1",
              },
              {
                title: "What does SmartFoneDoctor repair?",
                description:
                  "We provide full-service hardware and software repair for smartphones, tablets, iPads, MacBooks, Windows laptops, desktop PCs, smartwatches, and major gaming consoles (PlayStation, Xbox, Nintendo Switch).",
                colSpan: "1",
              },
              {
                title: "Does SmartFoneDoctor fix cracked phone screens?",
                description:
                  "Yes, screen repair is our specialty! We replace cracked glass, damaged OLED/LCD panels, and malfunctioning touch digitizers using premium OEM-grade parts. Most screen replacements are completed in under 45 minutes.",
                colSpan: "1",
              },
              {
                title: "Does SmartFoneDoctor repair water damaged phones?",
                description:
                  "Yes. If your device was submerged or splashed with liquid, bring it in immediately. Our technicians use specialized ultrasonic cleaning chambers and diagnostic tools to remove corrosion and restore functionality whenever possible.",
                colSpan: "1",
              },
              {
                title: "How much will my repair cost?",
                description:
                  "Pricing varies depending on device model and the part being replaced. We provide a completely free diagnostic inspection and upfront estimate before performing any work, with zero hidden fees.",
                colSpan: "1",
              },
              {
                title: "How long will my repair take?",
                description:
                  "Most standard smartphone repairs, including screen and battery replacements, take between 30 and 60 minutes. More extensive tablet, computer, or board-level repairs typically take same-day or 24–48 hours depending on parts availability.",
                colSpan: "1",
              },
              {
                title: "What kind of warranty does SmartFoneDoctor offer on repairs?",
                description:
                  "We back our work with a limited warranty on all replacement parts and labor. If the replaced part malfunctions due to a manufacturing defect, we will inspect and repair or replace it at no charge.",
                colSpan: "1",
              },
              {
                title: "Does SmartFoneDoctor repair tablets and iPads?",
                description:
                  "Yes. We repair all iPad generations (iPad Pro, iPad Air, iPad Mini, standard iPad) as well as Samsung Galaxy Tabs and Microsoft Surface tablets for cracked screens, charging ports, and battery degradation.",
                colSpan: "1",
              },
              {
                title: "Does SmartFoneDoctor repair MacBooks and other Apple computers?",
                description:
                  "Yes! Our technicians service MacBook Pro, MacBook Air, and iMac desktops for screen replacements, battery service, keyboard and trackpad issues, logic board diagnostics, and liquid damage cleanup.",
                colSpan: "1",
              },
              {
                title: "Can SmartFoneDoctor fix laptops and desktop computers?",
                description:
                  "Yes. We service Windows laptops and desktop PCs from Dell, HP, Lenovo, Asus, Acer, and custom gaming rigs. Services include hardware repairs, SSD upgrades, data recovery, RAM installation, and virus removal.",
                colSpan: "1",
              },
              {
                title: "Do you repair game consoles?",
                description:
                  "Yes! We repair PlayStation 5, PlayStation 4, Xbox Series X/S, Xbox One, and Nintendo Switch consoles for HDMI ports, optical disc drive failures, overheating, and power supply issues.",
                colSpan: "1",
              },
              {
                title: "Can SmartFoneDoctor fix HDMI or display issues on a game console?",
                description:
                  "Yes. Damaged or bent HDMI ports are one of the most common console repairs we perform. We provide precision micro-soldering to replace the broken HDMI port with an OEM replacement.",
                colSpan: "1",
              },
              {
                title: "Can SmartFoneDoctor replace my device battery?",
                description:
                  "Yes! If your battery drains quickly, shuts off unexpectedly, or is swelling, we replace it with a brand new, safety-tested lithium-ion battery. Battery replacements are usually completed in 30 minutes.",
                colSpan: "1",
              },
              {
                title: "Does SmartFoneDoctor use quality parts for repairs?",
                description:
                  "Yes. We exclusively use premium, OEM-grade, and WISE-certified replacement parts that adhere to stringent quality, durability, and safety specifications.",
                colSpan: "1",
              },
              {
                title: "Do Certified Pre-Owned Devices come with a warranty?",
                description:
                  "Yes, every Certified Pre-Owned device sold at SmartFoneDoctor comes backed by a comprehensive warranty and undergoes a rigorous multi-point functional inspection and battery health verification.",
                colSpan: "1",
              },
              {
                title: "Do I need an appointment to visit a store?",
                description:
                  "No appointment is required! Walk-ins are always welcome during business hours. However, scheduling an appointment online in advance guarantees prioritized service and ensures your replacement parts are reserved.",
                colSpan: "1",
              },
              {
                title: "Why should I choose a SmartFoneDoctor Certified Pre-Owned Phone over a new or refurbished phone?",
                description:
                  "Our CPO phones offer substantial savings compared to buying brand new, while delivering the peace of mind of a multi-point certified inspection, guaranteed battery health, clean IMEI, warranty protection, and complete carrier freedom.",
                colSpan: "1",
              },
              {
                title: "Does SmartFoneDoctor sell Certified Pre-Owned phones?",
                description:
                  "Yes! Many of our store locations maintain a curated inventory of popular Apple iPhone, Samsung Galaxy, and Google Pixel models in pristine condition.",
                colSpan: "1",
              },
            ],
          },
        },
        {
          type: "CtaBannerBlock",
          props: {
            id: "CtaBannerBlock-faq-cta",
            heading: "Get an Upfront Diagnostic & Price Quote",
            subheading:
              "Walk in to any of our 3 Philadelphia store branches or schedule online to hold replacement parts and skip the queue.",
            ctaText: "Schedule Repair",
            ctaLink: "/schedule-repair",
            bgColor: "#1d1c1a",
            textColor: "#ffffff",
            accentColor: "#00807A",
            padding: "48px 32px",
            align: "center",
            customCss: "",
          },
        },
      ],
    },
  },
];


export interface CatalogServiceItem {
  id: string;
  name: string;
  category: "smartphone" | "tablet" | "computer" | "console";
  brand: string;
  model: string;
  retailPrice: number;
  costPrice: number;
  turnaroundTag: string;
  warrantyTag: string;
  stockStatus: "In Stock" | "Low Stock" | "24h Order";
  isPopular: boolean;
}

export const INITIAL_SERVICES_CATALOG: CatalogServiceItem[] = [
  {
    id: "srv-1",
    name: "OEM OLED Screen Replacement",
    category: "smartphone",
    brand: "Apple",
    model: "iPhone 15 Pro",
    retailPrice: 219,
    costPrice: 78,
    turnaroundTag: "30 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-2",
    name: "Authentic Battery Replacement",
    category: "smartphone",
    brand: "Apple",
    model: "iPhone 14 / 13",
    retailPrice: 79,
    costPrice: 22,
    turnaroundTag: "25 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-3",
    name: "Laser Back Glass Renewal",
    category: "smartphone",
    brand: "Apple",
    model: "iPhone 15 / 14 Series",
    retailPrice: 129,
    costPrice: 35,
    turnaroundTag: "60 Mins",
    warrantyTag: "Lifetime Workmanship",
    stockStatus: "In Stock",
    isPopular: false,
  },
  {
    id: "srv-4",
    name: "Dynamic AMOLED 2X Display",
    category: "smartphone",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    retailPrice: 249,
    costPrice: 95,
    turnaroundTag: "45 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-5",
    name: "USB-C Port Sub-Board Replacement",
    category: "smartphone",
    brand: "Google",
    model: "Pixel 8 / 7 Pro",
    retailPrice: 79,
    costPrice: 20,
    turnaroundTag: "30 Mins",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: false,
  },
  {
    id: "srv-6",
    name: "Liquid Damage Ultrasonic Clean",
    category: "smartphone",
    brand: "All Brands",
    model: "Universal Phone Diagnostics",
    retailPrice: 69,
    costPrice: 10,
    turnaroundTag: "Same Day",
    warrantyTag: "Bench Certified",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-7",
    name: "Digitizer Glass + LCD Assembly",
    category: "tablet",
    brand: "Apple",
    model: "iPad Pro 12.9 (5th Gen)",
    retailPrice: 229,
    costPrice: 85,
    turnaroundTag: "Same Day",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-8",
    name: "Retina Display OEM Assembly",
    category: "computer",
    brand: "Apple",
    model: "MacBook Pro 14 (M1/M2/M3)",
    retailPrice: 389,
    costPrice: 160,
    turnaroundTag: "24-48 Hours",
    warrantyTag: "90-Day Free Warranty",
    stockStatus: "24h Order",
    isPopular: false,
  },
  {
    id: "srv-9",
    name: "HDMI Port Micro-Soldering Replacement",
    category: "console",
    brand: "Sony",
    model: "PlayStation 5 (Disc & Digital)",
    retailPrice: 149,
    costPrice: 18,
    turnaroundTag: "Same Day",
    warrantyTag: "6-Month HDMI Warranty",
    stockStatus: "In Stock",
    isPopular: true,
  },
  {
    id: "srv-10",
    name: "Internal Thermal Fan & Liquid Metal Repaste",
    category: "console",
    brand: "Sony",
    model: "PS5 Overheating Fix",
    retailPrice: 79,
    costPrice: 12,
    turnaroundTag: "45 Mins",
    warrantyTag: "Bench Certified",
    stockStatus: "In Stock",
    isPopular: false,
  },
];

export const CMS_PAGES_STORAGE_KEY = "sfd_cms_pages_v4";

export function getStoredCMSPages(): CMSPage[] {
  if (typeof window === "undefined") return INITIAL_CMS_PAGES;
  try {
    const raw = localStorage.getItem(CMS_PAGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CMS_PAGES_STORAGE_KEY, JSON.stringify(INITIAL_CMS_PAGES));
      return INITIAL_CMS_PAGES;
    }
    const parsed = JSON.parse(raw) as CMSPage[];
    let changed = false;

    // Ensure any new initial pages are added to storage
    for (const init of INITIAL_CMS_PAGES) {
      if (!parsed.some((p) => p.slug === init.slug || p.id === init.id)) {
        parsed.push(init);
        changed = true;
      }
    }

    const hydrated = parsed.map((stored) => {
      const seed = INITIAL_CMS_PAGES.find(
        (init) => init.slug === stored.slug || init.id === stored.id
      );
      if (!seed?.puckData) return stored;

      const storedContent = (stored.puckData as { content?: unknown[] } | undefined)?.content;
      const seedContent = (seed.puckData as { content?: unknown[] } | undefined)?.content;

      // A page someone published in the builder is theirs: never replace it,
      // even if it now has fewer sections than the seed template.
      if (stored.puckEditedAt) return stored;

      // Untouched pages: fill a missing layout, or pick up sections added to the seed.
      if (
        !stored.puckData ||
        !Array.isArray(storedContent) ||
        storedContent.length === 0 ||
        (Array.isArray(seedContent) && seedContent.length > (storedContent?.length || 0))
      ) {
        changed = true;
        return {
          ...stored,
          puckData: seed.puckData,
          featuredImage: stored.featuredImage?.includes("1581092160607")
            ? seed.featuredImage
            : stored.featuredImage || seed.featuredImage,
        };
      }

      if (
        stored.featuredImage?.includes("1581092160607") &&
        seed?.featuredImage
      ) {
        changed = true;
        return { ...stored, featuredImage: seed.featuredImage };
      }
      return stored;
    });

    if (changed) {
      localStorage.setItem(CMS_PAGES_STORAGE_KEY, JSON.stringify(hydrated));
    }
    return hydrated;
  } catch (err) {
    return INITIAL_CMS_PAGES;
  }
}

/** Returns false when the browser refused to store the pages (storage full). */
export function saveStoredCMSPages(pages: CMSPage[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(CMS_PAGES_STORAGE_KEY, JSON.stringify(pages));
    window.dispatchEvent(new CustomEvent("sfd-cms-pages-updated"));
    return true;
  } catch (err) {
    console.error("Failed to save CMS pages", err);
    return false;
  }
}

/** URL prefixes a custom page may not use. */
const RESERVED_PATHS = ["/admin", "/api", "/_next", "/profile", "/settings", "/logout", "/sign-in"];

/** "About our team" -> "/about-our-team" */
export function pathFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^[-/]+|[-/]+$/g, "");
  return `/${slug}`;
}

/** Returns a message when `path` cannot be used for a page, otherwise null. */
export function validatePagePath(path: string, pages: CMSPage[], ignoreId?: string): string | null {
  if (!/^\/[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(path)) {
    return "Use lowercase letters, numbers and dashes, starting with /. Example: /summer-offer";
  }
  if (RESERVED_PATHS.some((r) => path === r || path.startsWith(`${r}/`))) return "That address is reserved by the system.";
  if (pages.some((p) => p.path === path && p.id !== ignoreId)) return "Another page already uses that address.";
  return null;
}

/** Makes a new, empty draft page. The caller saves it. */
export function createCustomPage(name: string, path: string, category: CMSPage["category"]): CMSPage {
  const slug = path.slice(1).replace(/\//g, "-");
  return {
    id: `page-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    slug,
    name,
    path,
    category,
    title: `${name} | SmartFoneDoctor`,
    metaDesc: "",
    heroHeadline: name,
    heroSubtitle: "",
    heroBadge: "",
    primaryCtaText: "",
    primaryCtaLink: "",
    status: "Draft",
    lastEdited: "Just now",
    author: "Admin",
    puckData: { root: { props: {} }, content: [] },
    puckEditedAt: Date.now(),
    custom: true,
  };
}
