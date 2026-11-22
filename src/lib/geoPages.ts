// Shared canonical store and neighborhood metadata for dedicated GEO landing pages,
// schemas, llms.txt, markdown endpoints, and sitemap generation.

export interface GeoStoreProfile {
  storeId: number;
  storeCode: "nd_st" | "lancaster_4016" | "lancaster_4060";
  slug: string;
  name: string;
  shortName: string;
  badge: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  phone: string;
  telephoneSchema: string;
  hoursDisplay: string;
  latitude: number;
  longitude: number;
  gmbUrl: string;
  reviewSlug: string;
  transitNote: string;
  parkingNote: string;
  heroImage: string;
  specialties: string[];
  faqs: { question: string; answer: string }[];
}

export const GEO_STORES: GeoStoreProfile[] = [
  {
    storeId: 1,
    storeCode: "nd_st",
    slug: "west-philadelphia-52nd-st",
    name: "SmartFoneDoctor - 33 S 52nd St (West Philly Flagship)",
    shortName: "52nd St Flagship HQ",
    badge: "Flagship Repair Lab",
    streetAddress: "33 S 52nd St, Fl 2nd",
    addressLocality: "Philadelphia",
    addressRegion: "PA",
    postalCode: "19139",
    phone: "+1 (215) 598-2090",
    telephoneSchema: "+1-215-598-2090",
    hoursDisplay: "Mon–Sat: 10:00 AM – 7:00 PM · Sun: Closed",
    latitude: 39.9576,
    longitude: -75.2268,
    gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
    reviewSlug: "phl-01",
    transitNote:
      "Located steps from the SEPTA Market-Frankford Line (MFL) 52nd St Station and Route 52 bus stop.",
    parkingNote:
      "Metered street parking on S 52nd St & Chestnut St plus residential side-street spots nearby.",
    heroImage:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80",
    specialties: [
      "30-Minute iPhone & Samsung OLED Screen Replacements",
      "PS5, Xbox Series X & Switch HDMI 2.1 Micro-Soldering",
      "Fiber Laser iPhone Back Glass Restoration",
      "40kHz Ultrasonic Liquid Damage Board Recovery",
    ],
    faqs: [
      {
        question: "Do I need an appointment at the 33 S 52nd St West Philly store?",
        answer:
          "No appointment is needed. Walk-ins are welcomed Monday through Saturday from 10:00 AM to 7:00 PM for free diagnostics and same-day repairs.",
      },
      {
        question: "Does the 52nd St Flagship lab perform console HDMI micro-soldering in-house?",
        answer:
          "Yes. Our primary micro-soldering bench at 33 S 52nd St handles PS5, Xbox, and logic-board SMD repairs on-site without shipping devices away.",
      },
    ],
  },
  {
    storeId: 2,
    storeCode: "lancaster_4016",
    slug: "university-city-4016-lancaster",
    name: "SmartFoneDoctor - 4016 Lancaster Ave (University City)",
    shortName: "University City Branch",
    badge: "Penn & Drexel Express",
    streetAddress: "4016 Lancaster Ave",
    addressLocality: "Philadelphia",
    addressRegion: "PA",
    postalCode: "19104",
    phone: "+1 (215) 598-2090",
    telephoneSchema: "+1-215-598-2090",
    hoursDisplay: "Mon–Sat: 10:00 AM – 7:00 PM · Sun: Closed",
    latitude: 39.9634,
    longitude: -75.2038,
    gmbUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
    reviewSlug: "phl-02",
    transitNote:
      "Walking distance from Drexel University and UPenn; directly along SEPTA Trolley Route 10 & Market-Frankford 40th St Station.",
    parkingNote: "Lancaster Ave street parking and side-street spaces around 40th & Preston St.",
    heroImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80",
    specialties: [
      "Student Express 25-Minute iPhone & Pixel Battery Swaps",
      "MacBook Pro & Air Retina Display & Trackpad Service",
      "iPad Pro & Galaxy Tab Digitizer Repairs",
      "Same-Day Diagnostic Estimates Between Classes",
    ],
    faqs: [
      {
        question: "How close is 4016 Lancaster Ave to Drexel and UPenn?",
        answer:
          "Our 4016 Lancaster Ave store is a 5-to-8 minute walk from Drexel Main Building and the northern University of Pennsylvania campus.",
      },
      {
        question: "How fast can you replace a phone battery or screen near University City?",
        answer:
          "Most iPhone, Samsung Galaxy, and Pixel screens or batteries are completed in 25 to 45 minutes while you wait, backed by our 90-day warranty.",
      },
    ],
  },
  {
    storeId: 3,
    storeCode: "lancaster_4060",
    slug: "lancaster-express-4060",
    name: "SmartFoneDoctor - 4060 Lancaster Ave (Lancaster Express)",
    shortName: "Lancaster Express Branch",
    badge: "Rapid Walk-In Bench",
    streetAddress: "4060 Lancaster Ave",
    addressLocality: "Philadelphia",
    addressRegion: "PA",
    postalCode: "19104",
    phone: "+1 (215) 598-2090",
    telephoneSchema: "+1-215-598-2090",
    hoursDisplay: "Mon–Sat: 10:00 AM – 7:00 PM · Sun: Closed",
    latitude: 39.964,
    longitude: -75.2045,
    gmbUrl: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
    reviewSlug: "phl-03",
    transitNote:
      "Steps from SEPTA Route 10 Trolley at Lancaster Ave & 41st St, two blocks from Penn Presbyterian Medical Center.",
    parkingNote: "Convenient short-term street parking directly in front of 4060 Lancaster Ave.",
    heroImage:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80",
    specialties: [
      "Express Walk-In Charging Port Cleanings & Dock Swaps",
      "Same-Day Smartphone Cracked Screen Replacement",
      "Hospital & Transit Commuter Drop-Off Intake",
      "Nintendo Switch & Controller Diagnostics",
    ],
    faqs: [
      {
        question: "Can hospital staff or West Powelton commuters drop off without booking?",
        answer:
          "Yes, 4060 Lancaster Ave specializes in fast walk-in drop-offs for phones, tablets, and laptops with free upfront estimates.",
      },
      {
        question: "Are repairs at 4060 Lancaster Ave covered by the same warranty?",
        answer:
          "Yes. Every repair performed at all 3 SmartFoneDoctor Philadelphia branches includes our 90-day parts and labor warranty.",
      },
    ],
  },
];

export function getGeoStoreBySlug(slug: string): GeoStoreProfile | undefined {
  return GEO_STORES.find((s) => s.slug === slug);
}

export function getGeoStoreByCode(code: string): GeoStoreProfile | undefined {
  return GEO_STORES.find((s) => s.storeCode === code);
}

export function getGeoStoreById(storeId: number): GeoStoreProfile {
  return GEO_STORES.find((s) => s.storeId === storeId) || GEO_STORES[0];
}

export function toNeighborhoodSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
