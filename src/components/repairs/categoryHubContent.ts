// Category hub pages (/repairs/<category>): editable text per category and the
// built-in defaults. Device, brand and repair lists come from the repair catalog.

export type HubCategory = "smartphone" | "tablet" | "computer" | "console";
export const HUB_CATEGORIES: HubCategory[] = ["smartphone", "tablet", "computer", "console"];

export type HubPlatform = { title: string; body: string; image: string; href: string };

export type CategoryHubProps = {
  badge?: string;
  heroTitle?: string;
  heroIntro?: string;
  heroImage?: string;
  selectionHeading?: string;
  platforms?: HubPlatform[];
  warrantyText?: string;
  storeHeading?: string;
  storeIntro?: string;
};

const img = (id: string, w = 800) => `https://images.unsplash.com/${id}?w=${w}&auto=format&fit=crop&q=80`;

export const HUB_DEFAULTS: Record<HubCategory, Required<CategoryHubProps> & { name: string; seoTitle: string; seoDescription: string }> = {
  tablet: {
    name: "Tablet Repair",
    badge: "Tablet Repair",
    heroTitle: "Tablet Repair for iPad, Samsung Galaxy Tab & Surface",
    heroIntro:
      "Cracked iPad screen, a Galaxy Tab that won't charge or a Surface battery that dies by noon. SmartFoneDoctor fixes every major tablet brand with tested parts, most repairs the same day, and every repair is backed by our 90-day warranty. Stop by any of our Philadelphia stores for a free estimate.",
    heroImage: img("photo-1544244015-0df4b3ffc6b0", 1600),
    selectionHeading: "Explore our tablet repair selection and book your visit.",
    platforms: [
      {
        title: "iPad Repair",
        image: img("photo-1544244015-0df4b3ffc6b0"),
        body: "We repair every iPad generation, from the standard iPad to iPad Air, mini and Pro. Screens, batteries, ports and logic board faults are handled at our bench with tested parts.",
        href: "/repairs/tablet/ipad-repair",
      },
      {
        title: "Android Tablet Repair",
        image: img("photo-1623126908029-58cb08a2b272"),
        body: "Samsung Galaxy Tab, Google Pixel Tablet, Lenovo and more. Cracked screens, weak batteries and charging problems are fixed fast so your tablet is ready for work or play again.",
        href: "/schedule-repair?device=Android%20Tablet",
      },
      {
        title: "Microsoft Surface Repair",
        image: img("photo-1589739900243-4b52cd9b104e"),
        body: "Surface Pro and Surface Go repairs, including screen, battery and charging issues. We get your work device running again with minimal downtime.",
        href: "/schedule-repair?device=Microsoft%20Surface",
      },
    ],
    warrantyText:
      "Every tablet repair comes with a 90-day warranty on parts and workmanship. If a part we installed fails or the repair doesn't hold up, bring it back and we'll fix it at no cost.",
    storeHeading: "Your tablet fix is closer than you think",
    storeIntro:
      "Walk in or book ahead at one of our Philadelphia stores. From cracked screens to charging problems, our technicians will get your tablet working again.",
    seoTitle: "iPad & Tablet Repair in Philadelphia | SmartFoneDoctor",
    seoDescription:
      "Fast tablet repair in Philadelphia for iPad, Galaxy Tab, Pixel Tablet & Surface. Screen, battery, charging port and water damage with a 90-day warranty.",
  },
  smartphone: {
    name: "Phone Repair",
    badge: "Phone Repair",
    heroTitle: "Phone Repair for iPhone, Samsung Galaxy & Google Pixel",
    heroIntro:
      "A shattered screen, a battery that won't last the day or a phone that stopped charging. SmartFoneDoctor repairs iPhone, Samsung Galaxy, Google Pixel and more, most of them the same day, and every repair is backed by our 90-day warranty. Walk in for a free estimate at any Philadelphia store.",
    heroImage: img("photo-1592750475338-74b7b21085ab", 1600),
    selectionHeading: "Find your phone and book your repair.",
    platforms: [
      {
        title: "iPhone Repair",
        image: img("photo-1695048133142-1a20484d2569"),
        body: "Screens, batteries, charging ports, cameras and back glass for every recent iPhone, with True Tone and Face ID checked before you pick it up.",
        href: "/repairs/smartphone/iphone-repair",
      },
      {
        title: "Samsung Galaxy Repair",
        image: img("photo-1610945265064-0e34e5519bbf"),
        body: "Curved AMOLED screens, batteries and charging boards for Galaxy S, Z Fold and Z Flip, repaired at our bench with tested parts.",
        href: "/repairs/smartphone/galaxy-s25",
      },
      {
        title: "Google Pixel Repair",
        image: img("photo-1598327105666-5b89351aff97"),
        body: "Pixel screen, battery and charging repairs so your phone is back to full speed, usually the same day.",
        href: "/repairs/smartphone/pixel-9",
      },
    ],
    warrantyText:
      "Every phone repair comes with a 90-day warranty on parts and workmanship. If a part we installed fails or the repair doesn't hold up, bring it back and we'll fix it at no cost.",
    storeHeading: "Your phone fix is closer than you think",
    storeIntro:
      "Walk in or book ahead at one of our Philadelphia stores. From cracked screens to dead batteries, our technicians will get your phone working again.",
    seoTitle: "Phone Repair in Philadelphia | iPhone, Samsung & Pixel",
    seoDescription:
      "Same-day phone repair in Philadelphia for iPhone, Samsung Galaxy & Google Pixel. Screen, battery, charging port, back glass & water damage with 90-day warranty.",
  },
  computer: {
    name: "Computer Repair",
    badge: "Computer Repair",
    heroTitle: "Computer Repair for MacBook, iMac & Windows Laptops",
    heroIntro:
      "A cracked laptop screen, a MacBook that won't boot or a keyboard that stopped typing. SmartFoneDoctor repairs MacBook, iMac and Windows laptops at our Philadelphia benches, with a free diagnosis and a 90-day warranty on every repair.",
    heroImage: img("photo-1517336714731-489689fd1ca8", 1600),
    selectionHeading: "Find your computer and book your repair.",
    platforms: [
      {
        title: "MacBook Repair",
        image: img("photo-1517336714731-489689fd1ca8"),
        body: "Retina screens, batteries, keyboards and liquid damage on MacBook Air and MacBook Pro, with logic board diagnostics at our bench.",
        href: "/repairs/computer/macbook-pro",
      },
      {
        title: "iMac Repair",
        image: img("photo-1527443224154-c4a3942d3acf"),
        body: "Display, storage and power issues on iMac, from slow drives to screens that stay black.",
        href: "/repairs/computer/imac-repair",
      },
      {
        title: "Windows Laptop Repair",
        image: img("photo-1496181133206-80ce9b88a853"),
        body: "Dell, HP, Lenovo and Asus laptops: screens, batteries, charging ports and SSD upgrades.",
        href: "/repairs/computer/dell-xps",
      },
    ],
    warrantyText:
      "Every computer repair comes with a 90-day warranty on parts and workmanship. If a part we installed fails or the repair doesn't hold up, bring it back and we'll fix it at no cost.",
    storeHeading: "Your computer fix is closer than you think",
    storeIntro:
      "Bring your laptop or iMac to one of our Philadelphia stores for a free diagnosis. We'll tell you what's wrong and what it costs before any work starts.",
    seoTitle: "Computer & MacBook Repair Philadelphia | SmartFoneDoctor",
    seoDescription:
      "MacBook, iMac and Windows laptop repair in Philadelphia. Screens, batteries, keyboards, liquid damage and SSD upgrades with free diagnostics & 90-day warranty.",
  },
  console: {
    name: "Game Console Repair",
    badge: "Console Repair",
    heroTitle: "Game Console Repair for PlayStation, Xbox & Nintendo Switch",
    heroIntro:
      "No signal on the TV, a console that overheats or a Switch with a cracked screen. SmartFoneDoctor repairs PlayStation, Xbox and Nintendo Switch, including HDMI port micro-soldering, with a 90-day warranty on every repair.",
    heroImage: img("photo-1606813907291-d86efa9b94db", 1600),
    selectionHeading: "Find your console and book your repair.",
    platforms: [
      {
        title: "PlayStation Repair",
        image: img("photo-1606813907291-d86efa9b94db"),
        body: "PS5 and PS4 HDMI port replacement, overheating and fan issues, and disc drive repairs, done at our micro-soldering bench.",
        href: "/repairs/console/playstation-5",
      },
      {
        title: "Xbox Repair",
        image: img("photo-1621259182978-fbf93132d53d"),
        body: "Xbox Series X and S: HDMI ports, power faults and overheating, diagnosed and repaired with tested parts.",
        href: "/repairs/console/xbox-series-x",
      },
      {
        title: "Nintendo Switch Repair",
        image: img("photo-1578303512597-81e6cc155b3e"),
        body: "Switch and Switch OLED screens, charging ports, Joy-Con drift and game card readers.",
        href: "/repairs/console/nintendo-switch-oled",
      },
    ],
    warrantyText:
      "Every console repair comes with a 90-day warranty on parts and workmanship. If a part we installed fails or the repair doesn't hold up, bring it back and we'll fix it at no cost.",
    storeHeading: "Your console fix is closer than you think",
    storeIntro:
      "Drop off your console at one of our Philadelphia stores. Most HDMI port repairs are done the same or next day.",
    seoTitle: "Game Console Repair Philadelphia | PS5, Xbox & Switch",
    seoDescription:
      "PlayStation, Xbox and Nintendo Switch repair in Philadelphia: HDMI port micro-soldering, overheating, screens and charging ports, with a 90-day warranty.",
  },
};
