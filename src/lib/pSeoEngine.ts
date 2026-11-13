/**
 * SmartFoneDoctor Programmatic SEO (pSEO) & Juicy Linking Engine
 * Multi-dimensional repair matrix:
 * [Device Category] x [Device Model] x [Hardware Issue] x [Philadelphia Location]
 * Generates rich, high-intent landing pages with zero thin-content penalties.
 */

import { ServiceCMSData } from "@/data/servicesData";

export interface PSeoDevice {
  slug: string;
  name: string;
  category: "smartphone" | "tablet" | "computer" | "console";
  categoryName: string;
  brand: "Apple" | "Samsung" | "Google" | "Motorola" | "Sony" | "Microsoft" | "Nintendo" | "Dell" | "HP" | "Lenovo" | "Asus";
  brandSlug: string;
  image: string;
  specs: string;
  releaseYear: number;
}

export interface PSeoIssue {
  slug: string;
  name: string;
  shortName: string;
  category: "smartphone" | "tablet" | "computer" | "console";
  iconName: string;
  turnaroundMinutes: number;
  turnaroundDisplay: string;
  basePrice: number;
  oemPriceMultiplier: number;
  symptoms: string[];
  benchProcedures: { title: string; desc: string }[];
  toolsUsed: string[];
  faqs: { question: string; answer: string }[];
  blogArticleSlug?: string;
}

export interface PSeoPageData {
  device: PSeoDevice;
  issue: PSeoIssue;
  pricing: {
    aftermarket: number;
    oem: number;
    warrantyDays: number;
    turnaround: string;
  };
  seo: {
    title: string;
    metaDescription: string;
    focusKeywords: string[];
    canonicalUrl: string;
  };
  schemas: {
    breadcrumb: Record<string, unknown>;
    service: Record<string, unknown>;
    localBusiness: Record<string, unknown>;
    faq: Record<string, unknown>;
  };
  siblingRepairs: { name: string; url: string; price: number; turnaround: string }[];
  siblingDevices: { name: string; url: string; image: string }[];
  relatedBlogGuides: { title: string; url: string; readTime: string }[];
  neighborhoods: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DEVICE DATABASE
// ─────────────────────────────────────────────────────────────────────────────
export const PSEO_DEVICES: PSeoDevice[] = [
  // iPhone
  {
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    specs: "Grade 5 Titanium · A18 Pro · Super Retina XDR OLED 120Hz · USB-C 3",
    releaseYear: 2024,
  },
  {
    slug: "iphone-16",
    name: "iPhone 16",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
    specs: "Aluminum Enclosure · A18 Bionic · Dynamic Island · USB-C",
    releaseYear: 2024,
  },
  {
    slug: "iphone-15-pro",
    name: "iPhone 15 Pro",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    specs: "Titanium Chassis · A17 Pro · Action Button · Ceramic Shield",
    releaseYear: 2023,
  },
  {
    slug: "iphone-15",
    name: "iPhone 15",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
    specs: "Color-infused back glass · A16 Bionic · Dynamic Island",
    releaseYear: 2023,
  },
  {
    slug: "iphone-14-pro",
    name: "iPhone 14 Pro",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&auto=format&fit=crop&q=80",
    specs: "Stainless Steel Frame · ProMotion 120Hz · 48MP Main Sensor",
    releaseYear: 2022,
  },
  {
    slug: "iphone-14",
    name: "iPhone 14",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80",
    specs: "6.1-inch Super Retina XDR · Removable Back Glass Architecture",
    releaseYear: 2022,
  },
  {
    slug: "iphone-13",
    name: "iPhone 13",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
    specs: "Ceramic Shield · A15 Bionic · Diagonal Dual-Camera",
    releaseYear: 2021,
  },

  // Samsung
  {
    slug: "galaxy-s25",
    name: "Samsung Galaxy S25",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Samsung",
    brandSlug: "samsung",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    specs: "Dynamic AMOLED 2X 120Hz · Snapdragon 8 Elite · Armor Aluminum",
    releaseYear: 2025,
  },
  {
    slug: "galaxy-s24",
    name: "Samsung Galaxy S24 Ultra",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Samsung",
    brandSlug: "samsung",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    specs: "Titanium Frame · Gorilla Armor Anti-Reflective Display · S-Pen",
    releaseYear: 2024,
  },
  {
    slug: "galaxy-z-fold",
    name: "Samsung Galaxy Z Fold 6",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Samsung",
    brandSlug: "samsung",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
    specs: "Dual Screen Foldable OLED · Ultra Thin Glass (UTG) · Dual Rail Hinge",
    releaseYear: 2024,
  },

  // Google Pixel
  {
    slug: "pixel-9",
    name: "Google Pixel 9 Pro",
    category: "smartphone",
    categoryName: "Smartphone Repair",
    brand: "Google",
    brandSlug: "google",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    specs: "Super Actua OLED 120Hz · Tensor G4 · Gorilla Glass Victus 2",
    releaseYear: 2024,
  },

  // Tablets
  {
    slug: "ipad-pro-12-9",
    name: 'iPad Pro 12.9" M2/M4',
    category: "tablet",
    categoryName: "Tablet & iPad Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    specs: "Liquid Retina XDR Mini-LED / Tandem OLED · Apple Silicon M-Series",
    releaseYear: 2024,
  },
  {
    slug: "ipad-air-5",
    name: "iPad Air 5th / 6th Gen",
    category: "tablet",
    categoryName: "Tablet & iPad Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80",
    specs: "10.9-inch Liquid Retina Display · Touch ID Top Button · USB-C",
    releaseYear: 2023,
  },

  // Consoles
  {
    slug: "playstation-5",
    name: "Sony PlayStation 5",
    category: "console",
    categoryName: "Game Console Repair",
    brand: "Sony",
    brandSlug: "sony",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    specs: "Custom AMD Zen 2 CPU · RDNA 2 GPU · Liquid Metal Cooling · Ultra HD Disc",
    releaseYear: 2020,
  },
  {
    slug: "xbox-series-x",
    name: "Microsoft Xbox Series X",
    category: "console",
    categoryName: "Game Console Repair",
    brand: "Microsoft",
    brandSlug: "microsoft",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80",
    specs: "12 Teraflop RDNA 2 · Split Motherboard Architecture · 1TB NVMe SSD",
    releaseYear: 2020,
  },
  {
    slug: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    category: "console",
    categoryName: "Game Console Repair",
    brand: "Nintendo",
    brandSlug: "nintendo",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80",
    specs: "7-inch Vibrant OLED · Joy-Con Rail Connectors · 64GB Internal",
    releaseYear: 2021,
  },

  // Computers
  {
    slug: "macbook-pro",
    name: 'MacBook Pro 14"/16"',
    category: "computer",
    categoryName: "Computer & Mac Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    specs: "Liquid Retina XDR 120Hz · MagSafe 3 · Apple Silicon Pro/Max",
    releaseYear: 2023,
  },
  {
    slug: "macbook-air",
    name: "MacBook Air M2/M3",
    category: "computer",
    categoryName: "Computer & Mac Repair",
    brand: "Apple",
    brandSlug: "apple",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
    specs: "Fanless Ultra-Thin Unibody · Liquid Retina 500 nits · MagSafe 3",
    releaseYear: 2024,
  },
  {
    slug: "dell-xps",
    name: "Dell XPS & Inspiron",
    category: "computer",
    categoryName: "Computer & Laptop Repair",
    brand: "Dell",
    brandSlug: "dell",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    specs: "InfinityEdge OLED Touch · CNC Machined Aluminum · Carbon Fiber Palmrest",
    releaseYear: 2023,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. HARDWARE ISSUE DATABASE
// ─────────────────────────────────────────────────────────────────────────────
export const PSEO_ISSUES: PSeoIssue[] = [
  {
    slug: "screen-repair",
    name: "Screen & OLED Replacement",
    shortName: "Screen Repair",
    category: "smartphone",
    iconName: "Smartphone",
    turnaroundMinutes: 30,
    turnaroundDisplay: "20–30 Minutes",
    basePrice: 89,
    oemPriceMultiplier: 1.5,
    symptoms: [
      "Cracked, spider-webbed, or shattered front glass",
      "Green, white, or purple vertical lines on display panel",
      "Black screen of death while phone still vibrates or rings",
      "Touchscreen ghost clicking or dead zones that do not respond",
      "Flickering brightness or color distortion after dropping",
    ],
    benchProcedures: [
      {
        title: "Thermal Separation & Bezel Clean",
        desc: "We heat the perimeter frame to 75°C to soften water-resistant adhesive seals and lift the damaged display without scratching the chassis.",
      },
      {
        title: "TrueTone & Sensor Transfer",
        desc: "Using our EEPROM programmer, we transfer the display serial numbers and ambient light sensors to preserve TrueTone and biometric FaceID integrity.",
      },
      {
        title: "Laser Precision Seal Application",
        desc: "We install an OEM die-cut water/dust ingress gasket and press-fit the new display assembly with 40 PSI pneumatic clamp.",
      },
      {
        title: "Touch Matrix & Color Calibration",
        desc: "A 16-point digitizer test and high-refresh 120Hz test verify zero ghost touches and accurate white balance.",
      },
    ],
    toolsUsed: ["iFixit iSlack Suction", "JCID V1SE EEPROM Programmer", "Anti-static ESD Mat", "OEM Pressure Clamp", "Heat Platform"],
    faqs: [
      {
        question: "Will my Face ID or Touch ID still work after the screen replacement?",
        answer: "Yes, 100%. Our certified bench technicians transfer your original front sensor flex cable assembly to the new screen so your Face ID or biometric fingerprint security continues functioning seamlessly.",
      },
      {
        question: "How long does a screen repair take at your Philadelphia store?",
        answer: "Most smartphone screen repairs are completed within 20 to 30 minutes. You can relax in our waiting lounge or grab a coffee nearby on 52nd St.",
      },
      {
        question: "Do you offer a warranty on screen replacements?",
        answer: "Every screen replacement includes our comprehensive 90-day parts and labor warranty against touchscreen defects, line artifacts, and touch unresponsiveness.",
      },
    ],
    blogArticleSlug: "what-to-do-water-damaged-phone",
  },
  {
    slug: "battery-replacement",
    name: "Battery Replacement & Health Calibration",
    shortName: "Battery Replacement",
    category: "smartphone",
    iconName: "BatteryCharging",
    turnaroundMinutes: 25,
    turnaroundDisplay: "20–25 Minutes",
    basePrice: 69,
    oemPriceMultiplier: 1.4,
    symptoms: [
      "Battery health shows below 80% or 'Service Recommended'",
      "Phone shuts off unexpectedly at 20% to 30% battery charge",
      "Battery depletes within 2 to 4 hours of normal usage",
      "Screen is lifting or popping out of frame due to swollen battery",
      "Phone runs abnormally hot during standard charging or browsing",
    ],
    benchProcedures: [
      {
        title: "Safe Pouch Cell Discharge Check",
        desc: "We inspect the battery pack for thermal swelling, micro-punctures, and check cycle count via hardware diagnostic bus.",
      },
      {
        title: "Adhesive Pull-Tab Extraction",
        desc: "Old stretch-release adhesive strips are removed without bending or puncturing the lithium pouch cell.",
      },
      {
        title: "OEM-Spec Cell Installation",
        desc: "A fresh zero-cycle OEM-specification lithium-ion cell is installed with brand new laser-cut adhesive tabs.",
      },
      {
        title: "BMS Calibration & Thermal Sensor Check",
        desc: "We verify the Battery Management System (BMS) thermal thermistor and calibrate charging curve up to peak wattage.",
      },
    ],
    toolsUsed: ["Torx & Pentalobe Drivers", "ESD Safe Ceramic Spudger", "Laser Pull-Tab Strips", "USB Digital Power Meter"],
    faqs: [
      {
        question: "How do I know if my battery is swollen?",
        answer: "If your screen is lifting out of its metal or aluminum frame on the left side, or if the back glass feels raised, your battery has started degassing and swelling. Stop charging immediately and bring it in for safe replacement.",
      },
      {
        question: "Will replacing the battery restore my phone's speed?",
        answer: "Yes! iOS and Android throttle CPU performance when an aged battery cannot deliver peak voltage. A fresh battery allows your processor to run at 100% full clock speed without throttling.",
      },
    ],
    blogArticleSlug: "iphone-battery-health-guide",
  },
  {
    slug: "charging-port-repair",
    name: "Charging Port Replacement & Micro-Soldering",
    shortName: "Charging Port Fix",
    category: "smartphone",
    iconName: "Zap",
    turnaroundMinutes: 30,
    turnaroundDisplay: "30 Minutes",
    basePrice: 79,
    oemPriceMultiplier: 1.35,
    symptoms: [
      "Cable falls out or wiggles loosely inside the charging port",
      "Phone only charges when holding the cable at an awkward angle",
      "Moisture detected in charging port error that won't go away",
      "No charging icon and no data connection when plugged into PC",
      "Burnt smell or blackened pins inside USB-C or Lightning port",
    ],
    benchProcedures: [
      {
        title: "Microscope Debris & Pin Inspection",
        desc: "We inspect internal contact fingers under 40x optical magnification to differentiate between compressed pocket lint and snapped tension pins.",
      },
      {
        title: "Safe Lint Extraction or Dock Replacement",
        desc: "If pins are intact, we perform ESD ultrasonic micro-brushing. If charred or deformed, we replace the entire flex assembly.",
      },
      {
        title: "Power Delivery Wattage Verification",
        desc: "We hook the port up to our digital ammeter to confirm PD fast-charging (9V/2A or 15V/3A) and data sync lines are fully intact.",
      },
    ],
    toolsUsed: ["40x Stereo Zoom Microscope", "ESD Precision Tweezers", "USB-C Digital Inline Multimeter", "Micro-soldering Station"],
    faqs: [
      {
        question: "Can pocket lint really stop my phone from charging?",
        answer: "Yes, over 40% of charging port issues are caused by heavily compacted pocket lint preventing the cable from clicking all the way into place. We inspect this free of charge at our front bench.",
      },
      {
        question: "Do you micro-solder USB-C ports on Android and Consoles?",
        answer: "Yes, our certified bench technicians have over 10 years of micro-soldering experience, replacing board-level USB-C and HDMI ports daily.",
      },
    ],
    blogArticleSlug: "what-to-do-water-damaged-phone",
  },
  {
    slug: "back-glass-repair",
    name: "Back Glass Laser Repair & Frame Restoration",
    shortName: "Back Glass Fix",
    category: "smartphone",
    iconName: "Shield",
    turnaroundMinutes: 60,
    turnaroundDisplay: "60 Minutes",
    basePrice: 119,
    oemPriceMultiplier: 1.45,
    symptoms: [
      "Shattered or cracked rear glass causing cuts and glass shards",
      "Wireless charging (MagSafe/Qi) failing or disconnecting",
      "Exposed rear camera magnets or internal wireless coils",
      "Frame bent or corner dented from impact drop",
    ],
    benchProcedures: [
      {
        title: "Precision Fiber Laser Ablation",
        desc: "Our computer-guided blue laser ablates the epoxy adhesive underneath the shattered rear glass without touching internal coils or cameras.",
      },
      {
        title: "Glass Shard Removal & Vacuum Clean",
        desc: "Broken glass particles are removed and the aluminum midframe is deburred to ensure a perfectly flat foundation.",
      },
      {
        title: "OEM Spec Cold-Press Adhesive Glass",
        desc: "A factory-grade Corning glass back panel is bonded with industrial thermal-cure adhesive for high rigidity.",
      },
    ],
    toolsUsed: ["M-Triangel Laser Separation Machine", "Pneumatic Clamping Mold", "HEPA Glass Dust Extractor", "Thermal-Cure Epoxy"],
    faqs: [
      {
        question: "Do you take the whole phone apart to change back glass?",
        answer: "With our advanced fiber laser machine, we break the epoxy bonds directly from the exterior without requiring complete motherboard disassembly, preserving factory seals and component safety.",
      },
    ],
  },
  {
    slug: "water-damage-repair",
    name: "Water & Liquid Damage Ultrasonic Recovery",
    shortName: "Water Damage Repair",
    category: "smartphone",
    iconName: "Droplets",
    turnaroundMinutes: 120,
    turnaroundDisplay: "Same Day (2–4 Hours)",
    basePrice: 89,
    oemPriceMultiplier: 1.5,
    symptoms: [
      "Dropped in pool, toilet, sink, ocean, or caught in heavy rain",
      "Screen has water ripples, dark spots, or backlight flickering",
      "Phone getting hot and refusing to turn on after liquid exposure",
      "Red Liquid Contact Indicator (LCI) triggered inside SIM tray",
      "Camera lenses foggy with condensation droplets trapped inside",
    ],
    benchProcedures: [
      {
        title: "Immediate Battery Disconnection",
        desc: "We immediately isolate the power source to stop active electrolysis that eats through copper motherboard traces.",
      },
      {
        title: "Motherboard Ultrasonic Chemical Wash",
        desc: "The logic board is submerged in an ultrasonic bath of pure electronics-grade solvent at 40kHz to dissolve mineral corrosion.",
      },
      {
        title: "Bake-Out & Microscope Trace Inspection",
        desc: "After dehydration in a thermal chamber, we inspect and micro-solder any damaged capacitors or oxidized power rails.",
      },
    ],
    toolsUsed: ["Branson Ultrasonic Cleaner", "Micro-soldering Iron", "Thermal Baking Oven", "Electrolyte Diagnostic Probes"],
    faqs: [
      {
        question: "Does the rice trick actually fix water damage?",
        answer: "No! Rice does not absorb internal moisture fast enough and leaves behind sticky starch dust. Meanwhile, electric current corrodes the motherboard. The only proven fix is immediate ultrasonic cleaning by a technician.",
      },
    ],
    blogArticleSlug: "what-to-do-water-damaged-phone",
  },
  {
    slug: "hdmi-port-replacement",
    name: "HDMI Port Micro-Soldering Replacement",
    shortName: "HDMI Port Fix",
    category: "console",
    iconName: "Tv",
    turnaroundMinutes: 60,
    turnaroundDisplay: "Same Day (60–90 Mins)",
    basePrice: 139,
    oemPriceMultiplier: 1.3,
    symptoms: [
      "No signal / Black screen on television when console is turned on",
      "Bent, crooked, pushed-in, or missing pins inside HDMI socket",
      "Console shows white light of death (WOD) with zero video output",
      "Video flickering or dropping to 480p resolution randomly",
    ],
    benchProcedures: [
      {
        title: "Motherboard Extraction & Shield Removal",
        desc: "We safely dismantle the console and extract the main logic board without disturbing APU liquid metal.",
      },
      {
        title: "Hot Air Desoldering of Broken Port",
        desc: "Using calibrated hot-air rework station (380°C), we lift the damaged HDMI connector without tearing motherboard pads.",
      },
      {
        title: "Reinforced OEM HDMI 2.1 Port Solder",
        desc: "All 19 high-speed data pins and 4 ground anchor brackets are hand-soldered with leaded solder for superior mechanical strength.",
      },
      {
        title: "4K 120Hz HDR Handshake Benchmark",
        desc: "We test the console on our bench 4K 120Hz display with full HDCP handshake before reassembly.",
      },
    ],
    toolsUsed: ["Quick 861DW Hot Air Station", "JBC Micro-soldering Iron", "Amtech NC-559 Flux", "Microscope"],
    faqs: [
      {
        question: "Why do PS5 and Xbox HDMI ports break so easily?",
        answer: "Heavy HDMI cables or moving the console while plugged in puts leverage on the port, snapping the tiny internal surface-mount pins. We reinforce our replacements with extra solder anchors so they are stronger than factory.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. PHILADELPHIA NEIGHBORHOODS & LOCAL SEO
// ─────────────────────────────────────────────────────────────────────────────
export const PHILLY_LOCAL_AREAS = [
  "West Philadelphia (52nd St)",
  "University City (Penn / Drexel)",
  "Center City Philadelphia",
  "Fishtown & Northern Liberties",
  "South Philadelphia",
  "Kensington",
  "Upper Darby & Delco",
  "Overbrook & Wynnefield",
  "Germantown & Mount Airy",
  "Cobbs Creek",
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. RESOLVER & PAGE DATA BUILDER
// ─────────────────────────────────────────────────────────────────────────────
export function resolveDevice(slug: string): PSeoDevice | undefined {
  const clean = slug.toLowerCase().trim();

  // Flagship category service alias mappings
  if (clean === "iphone-repair" || clean === "iphone") return PSEO_DEVICES.find((d) => d.slug === "iphone-16-pro");
  if (clean === "samsung-repair" || clean === "samsung") return PSEO_DEVICES.find((d) => d.slug === "galaxy-s25");
  if (clean === "ipad-repair" || clean === "ipad") return PSEO_DEVICES.find((d) => d.slug === "ipad-pro-12-9");
  if (clean === "playstation-repair" || clean === "playstation" || clean === "ps5") return PSEO_DEVICES.find((d) => d.slug === "playstation-5");
  if (clean === "macbook-repair" || clean === "macbook" || clean === "imac-repair") return PSEO_DEVICES.find((d) => d.slug === "macbook-pro");

  return PSEO_DEVICES.find(
    (d) =>
      d.slug.toLowerCase() === clean ||
      d.name.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(clean)
  );
}

export function resolveIssue(slug: string): PSeoIssue | undefined {
  const clean = slug.toLowerCase().trim();
  // Map common synonyms
  const mappedSlug =
    clean === "cracked-screen-repair" || clean === "screen" || clean === "cracked-glass-replacement"
      ? "screen-repair"
      : clean === "phone-battery-replacement" || clean === "battery"
      ? "battery-replacement"
      : clean === "charging-port" || clean === "charging-port-replacement"
      ? "charging-port-repair"
      : clean === "back-glass" || clean === "back-glass-laser-repair"
      ? "back-glass-repair"
      : clean === "water-damage" || clean === "water-damaged-phone-repair"
      ? "water-damage-repair"
      : clean === "hdmi-port" || clean === "hdmi-port-repair"
      ? "hdmi-port-replacement"
      : clean;

  return PSEO_ISSUES.find((i) => i.slug === mappedSlug);
}

export function buildPSeoPageData(
  categorySlug: string,
  deviceSlug: string,
  issueSlug: string
): PSeoPageData | null {
  const device = resolveDevice(deviceSlug);
  const issue = resolveIssue(issueSlug);

  if (!device || !issue) return null;

  // Pricing calculations
  const aftermarketPrice = issue.basePrice + (device.releaseYear >= 2024 ? 20 : 0);
  const oemPrice = Math.round(aftermarketPrice * issue.oemPriceMultiplier);

  const canonicalUrl = `/repairs/${categorySlug}/${device.slug}/${issue.slug}`;

  // SEO Titles & Metadata
  const seoTitle = `${device.name} ${issue.shortName} in Philadelphia | Same-Day from $${aftermarketPrice} | SmartFoneDoctor`;
  const metaDescription = `Need fast ${device.name} ${issue.shortName.toLowerCase()} in Philadelphia? Done in ${issue.turnaroundDisplay} with 90-day warranty. Walk into 33 S 52nd St or book online today!`;

  // Schemas
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smartfonedoctor.com" },
      { "@type": "ListItem", position: 2, name: device.categoryName, item: `https://smartfonedoctor.com/repairs/${device.category}` },
      { "@type": "ListItem", position: 3, name: device.name, item: `https://smartfonedoctor.com/repairs/${device.category}/${device.slug}` },
      { "@type": "ListItem", position: 4, name: issue.shortName, item: `https://smartfonedoctor.com${canonicalUrl}` },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `${device.name} ${issue.name}`,
    provider: {
      "@type": "LocalBusiness",
      name: "SmartFoneDoctor Philadelphia",
      image: "https://smartfonedoctor.com/logo-png.jpg",
      telephone: "+1-215-387-1700",
      address: {
        "@type": "PostalAddress",
        streetAddress: "33 S 52nd St",
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: "19139",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 39.9576,
        longitude: -75.2268,
      },
    },
    areaServed: PHILLY_LOCAL_AREAS.map((a) => ({ "@type": "AdministrativeArea", name: a })),
    offers: [
      {
        "@type": "Offer",
        name: "Standard OEM-Grade Component",
        price: aftermarketPrice,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Premium Original Manufacturer (OEM)",
        price: oemPrice,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RepairShop",
    name: "SmartFoneDoctor Philadelphia",
    image: "https://smartfonedoctor.com/logo-png.jpg",
    telephone: "+1-215-387-1700",
    url: "https://smartfonedoctor.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "33 S 52nd St",
      addressLocality: "Philadelphia",
      addressRegion: "PA",
      postalCode: "19139",
      addressCountry: "US",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "11:00",
        closes: "17:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "420",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: issue.faqs.map((f) => ({
      "@type": "Question",
      name: f.question.replace("smartphone", device.name),
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  // Juicy Internal Linking Resolvers
  const siblingRepairs = PSEO_ISSUES.filter((i) => i.slug !== issue.slug && i.category === device.category).map((i) => ({
    name: `${device.name} ${i.shortName}`,
    url: `/repairs/${device.category}/${device.slug}/${i.slug}`,
    price: i.basePrice,
    turnaround: i.turnaroundDisplay,
  }));

  const siblingDevices = PSEO_DEVICES.filter((d) => d.slug !== device.slug && d.category === device.category)
    .slice(0, 4)
    .map((d) => ({
      name: d.name,
      url: `/repairs/${d.category}/${d.slug}/${issue.slug}`,
      image: d.image,
    }));

  const relatedBlogGuides = [
    {
      title: "When to Replace Your iPhone Battery: Signs & Performance",
      url: "/blog/iphone-battery-health-guide",
      readTime: "4 min read",
    },
    {
      title: "Dropped Phone in Water? 4 Critical First Aid Steps",
      url: "/blog/what-to-do-water-damaged-phone",
      readTime: "5 min read",
    },
    {
      title: "Common Charging Port Issues & Clean Bench Fixes",
      url: "/common-issues/smartphone/charging-port-replacement",
      readTime: "3 min read",
    },
  ];

  return {
    device,
    issue,
    pricing: {
      aftermarket: aftermarketPrice,
      oem: oemPrice,
      warrantyDays: 90,
      turnaround: issue.turnaroundDisplay,
    },
    seo: {
      title: seoTitle,
      metaDescription,
      focusKeywords: [
        `${device.name} ${issue.shortName} Philadelphia`,
        `Fix ${device.name} ${issue.shortName}`,
        `${device.name} repair near me`,
        `Philadelphia ${issue.shortName} shop`,
      ],
      canonicalUrl,
    },
    schemas: {
      breadcrumb,
      service: serviceSchema,
      localBusiness: localBusinessSchema,
      faq: faqSchema,
    },
    siblingRepairs,
    siblingDevices,
    relatedBlogGuides,
    neighborhoods: PHILLY_LOCAL_AREAS,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. DYNAMIC DEVICE MODEL CMS BUILDER
// Converts any device slug into a full ServiceCMSData object for /repairs/[category]/[serviceId]
// ─────────────────────────────────────────────────────────────────────────────
export function buildDeviceModelCMS(category: string, deviceSlug: string): ServiceCMSData | null {
  const device = resolveDevice(deviceSlug);
  if (!device) return null;

  const relevantIssues = PSEO_ISSUES.filter(
    (i) => i.category === device.category || (device.category === "smartphone" && i.category === "smartphone")
  );

  return {
    categoryId: device.category,
    categoryName: device.categoryName,
    serviceId: device.slug,
    serviceName: `${device.name} Repair`,
    tag: `${device.brand} Certified Bench Service`,
    heroTitle: `${device.name} Repair Services in Philadelphia`,
    heroSubtitle: `Expert same-day repair for ${device.name} (${device.specs}). From genuine OLED displays and battery calibration to precision charging port fixes with a 90-day warranty.`,
    heroImage: device.image,
    modelsLabel: `Available ${device.brand} Models`,
    models: PSEO_DEVICES.filter((d) => d.brand === device.brand).map((d) => ({
      id: d.slug,
      title: d.name,
      specs: d.specs,
      image: d.image,
      turnaround: "Same-Day • 30 Mins",
    })),
    commonIssues: relevantIssues.map((i) => ({
      id: i.slug,
      title: i.name,
      description: i.symptoms[0] || `Professional ${i.shortName.toLowerCase()} performed in ${i.turnaroundDisplay} by certified bench technicians.`,
      image: device.image,
      turnaround: i.turnaroundDisplay,
    })),
    partnerBanners: {
      samsung: {
        badge: "Authorized Care Grade",
        title: "Factory-Specification Calibration",
        description: "All hardware components are tested with specialized digital analyzers for thermal and voltage safety.",
        tag: "Certified Parts",
      },
      apple: {
        badge: "Philadelphia's Top Repair Bench",
        title: "90-Day Parts & Labor Guarantee",
        description: "Every repair is backed by our direct walk-in warranty covering parts and workmanship.",
        guarantee: "100% Quality Assurance",
      },
    },
    seo: {
      title: `${device.name} Repair in Philadelphia | Same-Day 30 Mins | SmartFoneDoctor`,
      description: `Need same-day ${device.name} repair in Philadelphia? Screens, batteries, charging ports, and water damage. Walk in at 33 S 52nd St or book online!`,
      keywords: [
        `${device.name} repair Philadelphia`,
        `fix ${device.name} screen`,
        `${device.name} battery replacement`,
        `phone repair 19139`,
      ],
    },
  };
}
