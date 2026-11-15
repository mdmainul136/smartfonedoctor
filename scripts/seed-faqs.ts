import { prisma } from "../src/lib/prisma";

const faqs = [
  {
    question: "How can I find a SmartFoneDoctor repair store near me?",
    answer:
      "You can easily locate your nearest store using our online Store Locator at /locations/i/book-repair. Enter your zip code, city, or allow browser location access to view all nearby stores, their operating hours, contact phone numbers, and get instant directions.",
    category: "General" as const,
    order: 1,
  },
  {
    question: "Are certified pre-owned phones unlocked and ready for my carrier?",
    answer:
      "Yes! All SmartFoneDoctor Certified Pre-Owned (CPO) phones are fully network unlocked, meaning they can be used with any major carrier including Verizon, AT&T, T-Mobile, and international GSM networks. Simply insert your SIM card or activate your eSIM.",
    category: "General" as const,
    order: 2,
  },
  {
    question: "What does SmartFoneDoctor repair?",
    answer:
      "We provide full-service hardware and software repair for smartphones, tablets, iPads, MacBooks, Windows laptops, desktop PCs, smartwatches, and major gaming consoles (PlayStation, Xbox, Nintendo Switch).",
    category: "General" as const,
    order: 3,
  },
  {
    question: "Does SmartFoneDoctor fix cracked phone screens?",
    answer:
      "Yes, screen repair is our specialty! We replace cracked glass, damaged OLED/LCD panels, and malfunctioning touch digitizers using premium OEM-grade parts. Most screen replacements are completed in under 45 minutes.",
    category: "General" as const,
    order: 4,
  },
  {
    question: "Does SmartFoneDoctor repair water damaged phones?",
    answer:
      "Yes. If your device was submerged or splashed with liquid, bring it in immediately. Our technicians use specialized ultrasonic cleaning chambers and diagnostic tools to remove corrosion and restore functionality whenever possible.",
    category: "General" as const,
    order: 5,
  },
  {
    question: "How much will my repair cost?",
    answer:
      "Pricing varies depending on device model and the part being replaced. We provide a completely free diagnostic inspection and upfront estimate before performing any work, with zero hidden fees.",
    category: "Pricing" as const,
    order: 6,
  },
  {
    question: "How long will my repair take?",
    answer:
      "Most standard smartphone repairs, including screen and battery replacements, take between 30 and 60 minutes. More extensive tablet, computer, or board-level repairs typically take same-day or 24–48 hours depending on parts availability.",
    category: "General" as const,
    order: 7,
  },
  {
    question: "What kind of warranty does SmartFoneDoctor offer on repairs?",
    answer:
      "We back our work with a limited warranty on all replacement parts and labor. If the replaced part malfunctions due to a manufacturing defect, we will inspect and repair or replace it at no charge.",
    category: "Warranty" as const,
    order: 8,
  },
  {
    question: "Does SmartFoneDoctor repair tablets and iPads?",
    answer:
      "Yes. We repair all iPad generations (iPad Pro, iPad Air, iPad Mini, standard iPad) as well as Samsung Galaxy Tabs and Microsoft Surface tablets for cracked screens, charging ports, and battery degradation.",
    category: "General" as const,
    order: 9,
  },
  {
    question: "Does SmartFoneDoctor repair MacBooks and other Apple computers?",
    answer:
      "Yes! Our technicians service MacBook Pro, MacBook Air, and iMac desktops for screen replacements, battery service, keyboard and trackpad issues, logic board diagnostics, and liquid damage cleanup.",
    category: "General" as const,
    order: 10,
  },
  {
    question: "Can SmartFoneDoctor fix laptops and desktop computers?",
    answer:
      "Yes. We service Windows laptops and desktop PCs from Dell, HP, Lenovo, Asus, Acer, and custom gaming rigs. Services include hardware repairs, SSD upgrades, data recovery, RAM installation, and virus removal.",
    category: "General" as const,
    order: 11,
  },
  {
    question: "Do you repair game consoles?",
    answer:
      "Yes! We repair PlayStation 5, PlayStation 4, Xbox Series X/S, Xbox One, and Nintendo Switch consoles for HDMI ports, optical disc drive failures, overheating, and power supply issues.",
    category: "General" as const,
    order: 12,
  },
  {
    question: "Can SmartFoneDoctor fix HDMI or display issues on a game console?",
    answer:
      "Yes. Damaged or bent HDMI ports are one of the most common console repairs we perform. We provide precision micro-soldering to replace the broken HDMI port with an OEM replacement.",
    category: "General" as const,
    order: 13,
  },
  {
    question: "Can SmartFoneDoctor replace my device battery?",
    answer:
      "Yes! If your battery drains quickly, shuts off unexpectedly, or is swelling, we replace it with a brand new, safety-tested lithium-ion battery. Battery replacements are usually completed in 30 minutes.",
    category: "General" as const,
    order: 14,
  },
  {
    question: "Does SmartFoneDoctor use quality parts for repairs?",
    answer:
      "Yes. We exclusively use premium, OEM-grade, and WISE-certified replacement parts that adhere to stringent quality, durability, and safety specifications.",
    category: "Warranty" as const,
    order: 15,
  },
  {
    question: "Do Certified Pre-Owned Devices come with a warranty?",
    answer:
      "Yes, every Certified Pre-Owned device sold at SmartFoneDoctor comes backed by a comprehensive warranty and undergoes a rigorous multi-point functional inspection and battery health verification.",
    category: "Warranty" as const,
    order: 16,
  },
  {
    question: "Do I need an appointment to visit a store?",
    answer:
      "No appointment is required! Walk-ins are always welcome during business hours. However, scheduling an appointment online in advance guarantees prioritized service and ensures your replacement parts are reserved.",
    category: "General" as const,
    order: 17,
  },
  {
    question: "Why should I choose a SmartFoneDoctor Certified Pre-Owned Phone over a new or refurbished phone?",
    answer:
      "Our CPO phones offer substantial savings compared to buying brand new, while delivering the peace of mind of a multi-point certified inspection, guaranteed battery health, clean IMEI, warranty protection, and complete carrier freedom.",
    category: "General" as const,
    order: 18,
  },
  {
    question: "Does SmartFoneDoctor sell Certified Pre-Owned phones?",
    answer:
      "Yes! Many of our store locations maintain a curated inventory of popular Apple iPhone, Samsung Galaxy, and Google Pixel models in pristine condition.",
    category: "General" as const,
    order: 19,
  },
];

async function seedFaqs() {
  for (const f of faqs) {
    const existing = await prisma.faqs.findFirst({ where: { question: f.question } });
    if (!existing) {
      await prisma.faqs.create({
        data: {
          question: f.question,
          answer: f.answer,
          category: f.category,
          order: f.order,
        },
      });
      console.log(`Created FAQ: "${f.question.slice(0, 30)}..."`);
    } else {
      console.log(`Exists: "${f.question.slice(0, 30)}..."`);
    }
  }
  const count = await prisma.faqs.count();
  console.log("Total FAQs in DB:", count);
}

seedFaqs()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
