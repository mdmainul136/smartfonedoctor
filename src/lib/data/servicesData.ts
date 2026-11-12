export interface ServiceModel {
  id: string;
  title: string;
  specs?: string;
  image: string;
  turnaround: string;
}

export interface ServiceCommonIssue {
  id: string;
  title: string;
  description: string;
  image: string;
  turnaround: string;
}

export interface ServiceFeatureCard {
  title: string;
  description: string;
  image: string;
  linkText: string;
  linkHref?: string;
}

export interface ServicePartnerBanners {
  samsung: {
    badge: string;
    title: string;
    description: string;
    tag: string;
  };
  apple: {
    badge: string;
    title: string;
    description: string;
    guarantee: string;
  };
}

export interface ServiceSEO {
  title: string;
  description: string;
  keywords: string[];
}

export interface ServiceCMSData {
  categoryId: string; // e.g. "smartphone", "tablet", "computer", "console"
  categoryName: string; // e.g. "Smartphone Repair"
  serviceId: string; // e.g. "iphone-repair", "ipad-repair", "imac-repair"
  serviceName: string; // e.g. "iPhone Repair"
  tag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  modelsLabel: string;
  models: ServiceModel[];
  commonIssues: ServiceCommonIssue[];
  featureCards?: ServiceFeatureCard[];
  partnerBanners: ServicePartnerBanners;
  seo: ServiceSEO;
}

export const SERVICES_CMS: ServiceCMSData[] = [
  // 1. SMARTPHONE - IPHONE REPAIR
  {
    categoryId: "smartphone",
    categoryName: "Smartphone Repair",
    serviceId: "iphone-repair",
    serviceName: "iPhone Repair",
    tag: "Smartphone Repair",
    heroTitle: "iPhone Repair: Screens, Batteries & More for Every Model, Fixed Same Day",
    heroSubtitle:
      "From cracked screens and worn-out batteries, SmartFoneDoctor repair experts fix every model—from older favorites to the newest flagship devices. Most repairs are done in 45 minutes or less, backed by our warranty on parts and labor. Walk into your local SmartFoneDoctor store or book an appointment online today.",
    heroImage:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1600&auto=format&fit=crop&q=85",
    modelsLabel: "All iPhone Repair Series",
    models: [
      {
        id: "ip-16",
        title: "iPhone 16 Series",
        specs: "iPhone 16 Pro Max, 16 Pro, 16 Plus, iPhone 16",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "ip-15",
        title: "iPhone 15 Series",
        specs: "iPhone 15 Pro Max, 15 Pro, 15 Plus, iPhone 15",
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "ip-14",
        title: "iPhone 14 Series",
        specs: "iPhone 14 Pro Max, 14 Pro, 14 Plus, iPhone 14",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "ip-13",
        title: "iPhone 13 Series",
        specs: "iPhone 13 Pro Max, 13 Pro, 13 Mini, iPhone 13",
        image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "ip-12",
        title: "iPhone 12 & 11 Series",
        specs: "iPhone 12 Pro, 12 Mini, 11 Pro Max, iPhone 11",
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 30 Mins",
      },
      {
        id: "ip-se",
        title: "iPhone SE & Legacy",
        specs: "iPhone SE 3rd/2nd Gen, iPhone X/XR/XS Series",
        image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 30 Mins",
      },
    ],
    commonIssues: [
      {
        id: "scrn",
        title: "Cracked OLED & Touch Screen Fix",
        description: "Replace shattered front glass and responsive OLED panels while preserving True Tone and Face ID.",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "batt",
        title: "iPhone Battery Replacement",
        description: "New lithium battery swap to fix low battery health alerts, random shutdowns, and rapid battery drops.",
        image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 30 Mins",
      },
      {
        id: "chrg",
        title: "USB-C & Lightning Port Replacement",
        description: "Fix loose cables, lint buildup, or burnt connector pins preventing your iPhone from charging.",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "cam",
        title: "Rear Camera Lens & Shaky Sensor Fix",
        description: "Restore crystal-clear photos and eliminate vibrating focus issues or shattered sapphire camera glass.",
        image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 30 Mins",
      },
      {
        id: "backglass",
        title: "Back Glass Laser Removal & Repair",
        description: "High-tech cold laser ablation to replace shattered back glass without damaging MagSafe wireless coils.",
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "water",
        title: "Liquid Damage Ultrasonic Treatment",
        description: "Deep chemical and ultrasonic cleaning to reverse liquid corrosion and save irreplaceable photos and data.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80",
        turnaround: "1–2 Business Days",
      },
    ],
    featureCards: [
      {
        title: "Screen Replacement",
        description: "A cracked screen doesn't mean your phone is finished. We replace damaged OLED and glass panels using OEM-grade assemblies.",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80",
        linkText: "Schedule screen repair >",
      },
      {
        title: "Battery Replacement",
        description: "If your phone dies quickly or feels sluggish, we install brand-new, tested high-capacity batteries in 30 minutes.",
        image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80",
        linkText: "Schedule battery replacement >",
      },
      {
        title: "How much will it cost?",
        description: "100% transparent pricing. Every repair starts with a free multi-point diagnostic check and an exact upfront quote.",
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600&auto=format&fit=crop&q=80",
        linkText: "Get free store estimate >",
      },
    ],
    partnerBanners: {
      samsung: {
        badge: "Genuine OEM Quality",
        title: "Samsung parts you can depend on",
        description: "We service Samsung Galaxy S-Series, Z Fold, Z Flip, and Note devices with premium OEM AMOLED displays.",
        tag: "Galaxy Certified Service",
      },
      apple: {
        badge: "Available at SFD",
        title: "Apple® Genuine Parts & Service",
        description: "Restore your iPhone with factory-spec original parts. Enjoy peace of mind knowing your Face ID and True Tone remain 100% functional.",
        guarantee: "Lifetime Workmanship Guarantee",
      },
    },
    seo: {
      title: "iPhone Repair in Philadelphia | Same-Day Screen & Battery Fix",
      description: "Expert iPhone screen replacement, battery repair, charging port, and liquid damage recovery in Philadelphia. 45-minute repairs backed by warranty.",
      keywords: ["iPhone Repair Philadelphia", "iPhone Screen Fix 19139", "iPhone Battery Swap", "Same Day iPhone Repair"],
    },
  },

  // 2. TABLET - IPAD REPAIR (Matching User Screenshot 1)
  {
    categoryId: "tablet",
    categoryName: "Tablet Repair",
    serviceId: "ipad-repair",
    serviceName: "iPad Tablet Repair",
    tag: "Tablet Repair",
    heroTitle: "iPad Screen Repair & More: Every iPad Model Fixed Fast",
    heroSubtitle:
      "Cracked iPad screen or battery trouble? SmartFoneDoctor repair experts fix every iPad, iPad Air, Mini and Pro model with quality parts and fast turnaround. Every repair is backed by our warranty. Get your free estimate today.",
    heroImage:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1600&auto=format&fit=crop&q=85",
    modelsLabel: "All iPad Tablet Repair Series",
    models: [
      {
        id: "ipad-air",
        title: "iPad Air Series",
        specs: "iPad Air 11\" & 13\" (M2), Air 5, Air 4",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "ipad-pro",
        title: "iPad Pro Series",
        specs: "iPad Pro 11\" & 13\" (M4/M2), 12.9\" Pro",
        image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "ipad-mini",
        title: "iPad Mini Series",
        specs: "iPad Mini 7 (A17 Pro), Mini 6, Mini 5",
        image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "ipad-std",
        title: "iPad Standard Series",
        specs: "iPad 10th Gen, 9th, 8th & 7th Gen",
        image: "https://images.unsplash.com/photo-1585770107532-367d890f7b48?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
    ],
    commonIssues: [
      {
        id: "screen",
        title: "Cracked Glass & Digitizer Replacement",
        description: "Replace broken top glass and responsive touch sensors while preserving vibrant LCD/Liquid Retina colors.",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "battery",
        title: "iPad Battery Replacement",
        description: "High-capacity lithium battery installation to resolve rapid battery drain, random restarts, or swelling.",
        image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "charging",
        title: "USB-C & Lightning Port Repair",
        description: "Fix loose cables, slow charging, or burnt pins with precision micro-soldered replacement ports.",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "bent",
        title: "Bent Housing & Frame Straightening",
        description: "Precision CNC reshaping to realign warped aluminum enclosures so new screens seal flush.",
        image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "water",
        title: "Liquid Damage Ultrasonic Treatment",
        description: "Corrosion removal, logic board cleaning, and short-circuit diagnostics for spilled liquids.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80",
        turnaround: "1–2 Business Days",
      },
      {
        id: "audio",
        title: "Speaker & Microphone Repair",
        description: "Fix crackling sound, muffled FaceTime microphone audio, and distorted volume output.",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 30 Mins",
      },
    ],
    partnerBanners: {
      samsung: {
        badge: "Service You Can Trust",
        title: "Samsung parts you can depend on.",
        description: "As a trusted repair provider, SmartFoneDoctor proudly offers genuine OEM parts on select Samsung Galaxy Tab repairs.",
        tag: "Galaxy Tab Certified Service",
      },
      apple: {
        badge: "Available at SFD",
        title: "Apple® Genuine Parts",
        description: "SmartFoneDoctor uses genuine Apple parts along with trusted diagnostics to service select Apple devices with safety, quality, and reliability.",
        guarantee: "Apple Certified Workmanship",
      },
    },
    seo: {
      title: "iPad & Tablet Repair in Philadelphia | Screens & Batteries",
      description: "Fast, certified iPad Pro, Air, and Mini repair in Philadelphia. Screen replacements, battery fixes, and warranty-backed service.",
      keywords: ["iPad Repair Philadelphia", "iPad Screen Replacement", "iPad Battery Repair", "Tablet Repair 19139"],
    },
  },

  // 3. COMPUTER - IMAC REPAIR (Matching User Screenshot 2)
  {
    categoryId: "computer",
    categoryName: "Computer Repair",
    serviceId: "imac-repair",
    serviceName: "iMac Series Repair",
    tag: "Computer Repair",
    heroTitle: "iMac Repair: Screens, Hard Drives, Slow Performance & More",
    heroSubtitle:
      "SmartFoneDoctor repair experts repair iMac and iMac Pro, whether it's screen damage, a hard drive failure, an upgrade or a slowdown. Our expert technicians back every repair with a limited warranty. Get a free repair estimate today.",
    heroImage:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=85",
    modelsLabel: "All iMac Computer Models",
    models: [
      {
        id: "imac-pro",
        title: "iMac Pro",
        specs: "27-inch 5K Retina (Space Gray, Intel Xeon)",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • Diagnostics",
      },
      {
        id: "imac-24",
        title: "iMac 24\"",
        specs: "4.5K Retina Display (Apple Silicon M1, M3, M4)",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "imac-27",
        title: "iMac 27\"",
        specs: "5K Retina Slim Aluminum Unibody All-in-One",
        image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • Hardware Fix",
      },
    ],
    commonIssues: [
      {
        id: "screen",
        title: "Retina Screen & Glass Replacement",
        description: "Fix cracked glass, distorted vertical lines, black screen of death, or damaged LCD flex cables.",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "ssd",
        title: "High-Speed SSD Upgrade & Data Recovery",
        description: "Upgrade slow mechanical hard drives or Fusion drives to blazing-fast NVMe SSDs with complete file transfer.",
        image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 1–2 Hours",
      },
      {
        id: "logicboard",
        title: "Logic Board Micro-Soldering Repair",
        description: "Component-level repairs for no-power symptoms, blown capacitors, shorted GPU/CPU power rails, and backlight ICs.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
        turnaround: "1–3 Business Days",
      },
      {
        id: "liquid",
        title: "Liquid Spill Ultrasonic Cleaning",
        description: "Emergency board treatment to neutralize sticky coffee, water, and wine spills before corrosion permanently damages circuits.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day Assessment",
      },
      {
        id: "battery",
        title: "Power Supply & Fan Replacement",
        description: "Fix loud buzzing fan noise, thermal shutdown, and faulty internal power supplies.",
        image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
    ],
    partnerBanners: {
      samsung: {
        badge: "Service You Can Trust",
        title: "Samsung parts you can depend on.",
        description: "As a trusted service provider, SmartFoneDoctor proudly offers genuine OEM SSDs and memory components.",
        tag: "Certified Memory & Storage",
      },
      apple: {
        badge: "Available at SFD",
        title: "Apple® Genuine Parts",
        description: "SmartFoneDoctor uses genuine Apple parts along with trusted diagnostics to service select Mac computers with safety and quality.",
        guarantee: "Apple Certified Workmanship",
      },
    },
    seo: {
      title: "iMac Repair in Philadelphia | Screens, SSD Upgrades & Logic Board",
      description: "Professional iMac, iMac Pro, and desktop Mac repair in Philadelphia. Cracked screens, SSD upgrades, and liquid spill recovery with warranty.",
      keywords: ["iMac Repair Philadelphia", "iMac Screen Fix", "iMac SSD Upgrade 19139", "Apple Desktop Repair"],
    },
  },

  // 4. COMPUTER - MACBOOK REPAIR
  {
    categoryId: "computer",
    categoryName: "Computer Repair",
    serviceId: "macbook-repair",
    serviceName: "MacBook Repair",
    tag: "Computer Repair",
    heroTitle: "MacBook Repair: Screens, Batteries, Keyboards & Logic Boards",
    heroSubtitle:
      "From broken Liquid Retina displays to worn-out batteries and sticky keyboards, SmartFoneDoctor certified technicians repair MacBook Pro and MacBook Air with genuine parts and quick turnaround. Every repair backed by warranty.",
    heroImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&auto=format&fit=crop&q=85",
    modelsLabel: "All MacBook Laptop Models",
    models: [
      {
        id: "mb-pro",
        title: "MacBook Pro Series",
        specs: "14\" & 16\" (M3/M2/M1 Pro/Max), 13\" Touch Bar",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "mb-air",
        title: "MacBook Air Series",
        specs: "13\" & 15\" Liquid Retina (M1/M2/M3)",
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
    ],
    commonIssues: [
      {
        id: "screen",
        title: "Retina Screen Assembly Replacement",
        description: "Complete top lid display swap resolving cracked glass, flexgate lines, and blank black screens.",
        image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "battery",
        title: "MacBook Battery Replacement",
        description: "Genuine capacity battery replacement to remove 'Service Recommended' warnings and prevent trackpad swelling.",
        image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "keyboard",
        title: "Keyboard & Trackpad Repair",
        description: "Fix unresponsive keys, sticky spills, or broken haptic trackpad feedback.",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
    ],
    partnerBanners: {
      samsung: {
        badge: "Quality Workmanship",
        title: "Ultra-Fast Storage & Upgrades",
        description: "We use high-grade storage drives and diagnostic tools for all laptop upgrades.",
        tag: "Certified High Performance",
      },
      apple: {
        badge: "Available at SFD",
        title: "Apple® Genuine Parts",
        description: "Keep your MacBook running at factory specs with certified replacement parts and precision calibration.",
        guarantee: "Apple Certified Workmanship",
      },
    },
    seo: {
      title: "MacBook Repair in Philadelphia | Screens, Batteries & Keyboards",
      description: "Same-day MacBook Pro and MacBook Air repair in Philadelphia. Battery replacements, Retina screens, and water damage recovery.",
      keywords: ["MacBook Repair Philadelphia", "MacBook Screen Fix", "MacBook Battery Replacement 19139"],
    },
  },

  // 5. CONSOLE - PLAYSTATION & GAMING REPAIR
  {
    categoryId: "console",
    categoryName: "Gaming Console Repair",
    serviceId: "playstation-repair",
    serviceName: "PlayStation Console Repair",
    tag: "Game Console Repair",
    heroTitle: "PlayStation Repair: HDMI Ports, Disc Drives, Overheating & More",
    heroSubtitle:
      "PlayStation 5 won't show video or shuts down unexpectedly? SmartFoneDoctor specializes in micro-soldered HDMI port replacements, laser lens disc drive repairs, and liquid metal thermal service with fast turnaround and warranty.",
    heroImage:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1600&auto=format&fit=crop&q=85",
    modelsLabel: "All PlayStation Console Models",
    models: [
      {
        id: "ps5",
        title: "PlayStation 5 (PS5 & PS5 Pro)",
        specs: "Standard Disc, Digital Edition, and PS5 Slim",
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "ps4",
        title: "PlayStation 4 (PS4 Pro / Slim)",
        specs: "PS4 Original, PS4 Slim, and PS4 Pro 4K",
        image: "https://images.unsplash.com/photo-1507457379470-08b800bebc67?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
    ],
    commonIssues: [
      {
        id: "hdmi",
        title: "HDMI Port Micro-Soldering Replacement",
        description: "Fix bent, pushed-in, or loose HDMI port pins causing 'No Signal' or black screen output on your TV.",
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 60 Mins",
      },
      {
        id: "overheat",
        title: "Overheating & Liquid Metal Re-application",
        description: "Deep clean dust clogs and re-spread liquid metal thermal interface to prevent abrupt overheating shutdowns.",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80",
        turnaround: "Same-Day • 45 Mins",
      },
      {
        id: "power",
        title: "Power Supply & Motherboard Diagnostic",
        description: "Fix console not turning on, beep once and shutting down (Blue Light of Death), or power surge damage.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80",
        turnaround: "1–2 Business Days",
      },
    ],
    partnerBanners: {
      samsung: {
        badge: "Pro Storage Upgrades",
        title: "High-Speed SSD Storage for Consoles",
        description: "Expand your PS5 storage with authentic Gen4 NVMe SSDs with integrated heatsinks for maximum load speeds.",
        tag: "Certified High Speed",
      },
      apple: {
        badge: "Precision Lab",
        title: "Micro-soldering & Component Care",
        description: "Our certified technicians use precision soldering microscopes for OEM-spec console board repairs.",
        guarantee: "100% Tested & Certified",
      },
    },
    seo: {
      title: "PlayStation & PS5 Repair in Philadelphia | HDMI Ports & Overheating Fix",
      description: "Same-day PS5 and PS4 HDMI port replacement, power supply fix, and disc drive repair in Philadelphia with warranty.",
      keywords: ["PS5 HDMI Port Repair Philadelphia", "PlayStation Repair 19139", "Console Repair Philadelphia"],
    },
  },
];

// Helper functions for CMS routing
export function getAllServicesCMS(): ServiceCMSData[] {
  return SERVICES_CMS;
}

export function getServiceCMS(
  categoryId: string,
  serviceId: string
): ServiceCMSData | undefined {
  return SERVICES_CMS.find(
    (s) =>
      s.categoryId.toLowerCase() === categoryId.toLowerCase() &&
      s.serviceId.toLowerCase() === serviceId.toLowerCase()
  );
}

export function getServicesByCategory(categoryId: string): ServiceCMSData[] {
  return SERVICES_CMS.filter(
    (s) => s.categoryId.toLowerCase() === categoryId.toLowerCase()
  );
}

