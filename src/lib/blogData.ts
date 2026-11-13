/**
 * SmartFoneDoctor Blog & Guides Architecture
 * Professional WordPress / Shopify / Strapi Grade Content & Taxonomy Model
 */

export interface BlogCategoryTaxonomy {
  id: string;
  slug: string;
  name: string;
  description: string;
  postCount?: number;
}

export interface BlogArticleSection {
  id: string;
  heading: string;
  body: string;
  calloutType?: "tip" | "warning" | "note";
  calloutText?: string;
  image?: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  featuredImage: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: string;
  status: "Published" | "Draft" | "Archived";
  sections: BlogArticleSection[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    focusKeyword?: string;
    canonicalUrl?: string;
  };
  connectedService?: {
    title: string;
    price: string;
    bookingUrl: string;
  };
}

export const INITIAL_BLOG_CATEGORIES: BlogCategoryTaxonomy[] = [
  {
    id: "cat-iphone",
    slug: "iphone-guides",
    name: "iPhone Repair Guides",
    description: "Battery replacements, screen care, iOS diagnostics, and back glass repair tips.",
  },
  {
    id: "cat-android",
    slug: "android-care",
    name: "Samsung & Android Care",
    description: "AMOLED care, charging dock maintenance, and water damage emergency care.",
  },
  {
    id: "cat-consoles",
    slug: "console-diagnostics",
    name: "Console & Micro-Soldering",
    description: "PS5 HDMI ports, Xbox overheating, Switch Joy-Con drift, and fan repasting.",
  },
  {
    id: "cat-emergency",
    slug: "emergency-care",
    name: "Emergency Device First Aid",
    description: "What to do right after dropping your phone in water or on concrete.",
  },
];

export const INITIAL_BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "post-1",
    slug: "iphone-battery-health-guide",
    title: "When to Replace Your iPhone Battery: Signs, Cycles & Peak Performance",
    excerpt: "Learn how to read your iOS Maximum Capacity score and know when throttling begins.",
    categoryId: "cat-iphone",
    categoryName: "iPhone Repair Guides",
    tags: ["iPhone", "Battery", "Apple", "Performance"],
    featuredImage: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&auto=format&fit=crop&q=80",
    author: {
      name: "Dr. Mike",
      role: "Lead Hardware Technician & Founder",
      avatar: "DM",
    },
    publishedAt: "Nov 10, 2026",
    readTime: "4 min read",
    status: "Published",
    sections: [
      {
        id: "sec-1",
        heading: "1. The Truth About the 80% Battery Health Threshold",
        body: "Apple's lithium-ion batteries are designed to retain up to 80% of their original capacity after 500 complete charge cycles under normal operating conditions. Once your battery drops below 80% maximum capacity in iOS Settings, iOS automatically enables Performance Management throttling to prevent unexpected shutdowns.",
        calloutType: "warning",
        calloutText: "If your battery health shows 'Service' or is below 80%, your iPhone's CPU may be running at 30-50% slower speeds to prevent sudden shutdowns.",
      },
      {
        id: "sec-2",
        heading: "2. Physical Warning Signs: Swollen Batteries",
        body: "A degrading battery does not just drain quickly—it can pose a physical safety hazard. As lithium-ion pouch cells age or suffer thermal degradation, chemical decomposition produces gas, causing the battery pack to swell. If you notice your screen popping out of its frame or lifting slightly on the left side, this is almost always a swollen battery pushing outward from the inside.",
        calloutType: "tip",
        calloutText: "Do not attempt to press a lifting screen back down with force! You risk puncturing the swollen cell. Bring it immediately to our repair bench for safe discharge.",
      },
      {
        id: "sec-3",
        heading: "3. What to Expect During a 30-Minute Replacement",
        body: "At SmartFoneDoctor's Philadelphia stores (33 S 52nd St and Lancaster Ave), an iPhone battery replacement takes approximately 25 to 30 minutes. We clean old adhesive, install OEM-specification cells with brand new laser-cut pull tabs, and calibrate the thermal sensors. You walk out with full day battery endurance and restored peak performance.",
      },
    ],
    seo: {
      metaTitle: "When to Replace Your iPhone Battery: Cycles, Symptoms & Cost | SmartFoneDoctor",
      metaDescription: "Is your iPhone dying quickly or below 80% health? Learn the warning signs of failing lithium batteries and get same-day replacement in Philadelphia.",
      focusKeyword: "replace iphone battery",
      canonicalUrl: "/blog/iphone-battery-health-guide",
    },
    connectedService: {
      title: "Express iPhone Battery Replacement",
      price: "From $69",
      bookingUrl: "/schedule-repair?device=iPhone-Battery",
    },
  },
  {
    id: "post-2",
    slug: "what-to-do-water-damaged-phone",
    title: "Dropped Phone in Water? 4 Critical Steps Before Bringing It to the Shop",
    excerpt: "Why the rice trick causes corrosion, and how ultrasonic cleaning saves motherboards.",
    categoryId: "cat-emergency",
    categoryName: "Emergency Device First Aid",
    tags: ["Water Damage", "Emergency", "Motherboard", "Data Recovery"],
    featuredImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=80",
    author: {
      name: "Marcus Vance",
      role: "Micro-Soldering Specialist",
      avatar: "MV",
    },
    publishedAt: "Nov 08, 2026",
    readTime: "5 min read",
    status: "Published",
    sections: [
      {
        id: "sec-1",
        heading: "1. Turn It Off Immediately—Do Not Charge It!",
        body: "The biggest mistake people make with a wet phone is plugging it into a charger to see if it still turns on. Water itself does not immediately destroy electronic components; it is the combination of water, dissolved minerals, and electrical current that causes instant electrolysis, short circuits, and burned copper traces on the motherboard.",
        calloutType: "warning",
        calloutText: "Never plug in a wet phone! If electricity travels through water bridging two capacitor pins, it will instantly fry the main power management IC (PMIC).",
      },
      {
        id: "sec-2",
        heading: "2. The Rice Myth: Why Rice Actually Harms Your Phone",
        body: "Placing your phone in a bowl of dry rice does almost nothing to absorb moisture trapped under electromagnetic shields on the logic board. Even worse, rice dust and starch enter the charging port, speaker grills, and microphone mesh, mixing with the water to create an acidic paste that accelerates copper corrosion and mold.",
        calloutType: "note",
        calloutText: "Instead of rice, gently wipe the exterior with a microfiber cloth, remove the SIM tray to create an airway, and keep the phone powered down.",
      },
      {
        id: "sec-3",
        heading: "3. Professional Ultrasonic Motherboard Restoration",
        body: "When you bring a water-damaged device to our shop, we immediately disconnect the battery, dismantle the motherboard, and place it in an industrial ultrasonic cleaner filled with specialized anhydrous chemical solvents. This sweeps away mineral deposits and oxidation from microscopic BGA solder balls before permanent corrosion eats the metal.",
      },
    ],
    seo: {
      metaTitle: "Dropped Phone in Water? Immediate First Aid & Repair | SmartFoneDoctor",
      metaDescription: "Don't put your wet phone in rice! Follow these 4 technician-approved emergency steps to save your data and logic board after liquid damage.",
      focusKeyword: "water damaged phone repair",
      canonicalUrl: "/blog/what-to-do-water-damaged-phone",
    },
    connectedService: {
      title: "Liquid Damage Ultrasonic Clean & Diagnostics",
      price: "$69 Evaluation",
      bookingUrl: "/schedule-repair?device=Water-Damage",
    },
  },
  {
    id: "post-3",
    slug: "ps5-hdmi-port-no-signal-fix",
    title: "PS5 White Light of Death or No Signal: HDMI Port vs Encoder IC",
    excerpt: "How micro-soldering repairs PlayStation 5 HDMI ports with zero motherboard warpage.",
    categoryId: "cat-consoles",
    categoryName: "Console & Micro-Soldering",
    tags: ["PS5", "PlayStation", "HDMI", "Micro-Soldering"],
    featuredImage: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&auto=format&fit=crop&q=80",
    author: {
      name: "Marcus Vance",
      role: "Micro-Soldering Specialist",
      avatar: "MV",
    },
    publishedAt: "Nov 05, 2026",
    readTime: "6 min read",
    status: "Published",
    sections: [
      {
        id: "sec-1",
        heading: "1. The Fragility of the PS5 HDMI Port",
        body: "The original Sony PlayStation 5 HDMI 2.1 port is mounted to the motherboard with surface-mount anchor legs that can sheer off if the console is tripped over, dropped, or if HDMI cables are inserted at an angle. When the anchor pins break, the 19 tiny data pins inside bend, bridge, or snap off the PCB pads.",
      },
      {
        id: "sec-2",
        heading: "2. Solid White Light vs Pulsing Blue Light",
        body: "If your PS5 turns on with a pulsing blue light that switches to a solid white light ('White Light of Death'), but your TV displays 'No Signal', the APU and RAM have booted successfully. In 90% of cases, the fault is either physical HDMI port damage or a blown Panasonic MN864739 HDMI Retimer / Encoder chip.",
        calloutType: "tip",
        calloutText: "Look into the back of your PS5 with a flashlight. If you see broken plastic teeth or bent gold pins, your HDMI port requires micro-soldering.",
      },
      {
        id: "sec-3",
        heading: "3. Precision Hot Air & Amtech Flux Replacement",
        body: "At SmartFoneDoctor, we use high-grade preheaters, leaded eutectic solder, and genuine reinforced OEM replacement ports. We test all 19 traces for diode continuity before reassembling the liquid metal heatsink. Most PS5 HDMI repairs are completed same-day with a 6-month warranty.",
      },
    ],
    seo: {
      metaTitle: "PS5 HDMI Port Replacement & No Signal Repair | Philadelphia",
      metaDescription: "PS5 turns on with white light but no TV signal? Expert micro-soldering HDMI port replacement done same day in Philadelphia at SmartFoneDoctor.",
      focusKeyword: "ps5 hdmi port repair",
      canonicalUrl: "/blog/ps5-hdmi-port-no-signal-fix",
    },
    connectedService: {
      title: "PlayStation 5 HDMI Micro-Soldering Repair",
      price: "$149 Fixed Rate",
      bookingUrl: "/schedule-repair?device=PS5-HDMI",
    },
  },
];

const BLOG_STORAGE_KEY = "sfd_blog_articles_v2";
const BLOG_CAT_STORAGE_KEY = "sfd_blog_categories_v2";

export function getStoredBlogArticles(): BlogArticle[] {
  if (typeof window === "undefined") return INITIAL_BLOG_ARTICLES;
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_BLOG_ARTICLES;
}

export function saveStoredBlogArticles(articles: BlogArticle[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(articles));
  window.dispatchEvent(new Event("sfd-blog-updated"));
}

export function getStoredBlogCategories(): BlogCategoryTaxonomy[] {
  if (typeof window === "undefined") return INITIAL_BLOG_CATEGORIES;
  try {
    const raw = localStorage.getItem(BLOG_CAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_BLOG_CATEGORIES;
}

export function saveStoredBlogCategories(categories: BlogCategoryTaxonomy[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BLOG_CAT_STORAGE_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event("sfd-blog-categories-updated"));
}
