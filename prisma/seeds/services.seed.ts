import { PrismaClient, Prisma, enum_faqs_category } from "@prisma/client";

const prisma = new PrismaClient();

const LOCATIONS = [
  {
    name: "SmartFoneDoctor - Flagship Store",
    store_code: "nd_st",
    address: "33 S 52nd St, Fl 2nd, Philadelphia, PA 19139",
    neighborhood: "West Philadelphia, PA",
    phone: "+1 (215) 598-2090",
    hours: "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM",
    google_maps_url: "https://share.google/gTlyWLewR88ToAdJQ",
    google_rating: new Prisma.Decimal(4.9),
    total_reviews: new Prisma.Decimal(1520),
    is_active: true,
  },
  {
    name: "SmartFoneDoctor - University City",
    store_code: "lancaster_4016",
    address: "4016 Lancaster Ave, Philadelphia, PA 19104",
    neighborhood: "University City, PA",
    phone: "+1 (215) 598-2090",
    hours: "Mon–Sat: 10:00 AM – 7:00 PM | Sun: Closed",
    google_maps_url: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
    google_rating: new Prisma.Decimal(4.8),
    total_reviews: new Prisma.Decimal(430),
    is_active: true,
  },
  {
    name: "SmartFoneDoctor - Lancaster Express",
    store_code: "lancaster_4060",
    address: "4060 Lancaster Ave, Philadelphia, PA 19104",
    neighborhood: "Lancaster Corridor, PA",
    phone: "+1 (215) 598-2090",
    hours: "Mon–Sat: 10:00 AM – 7:00 PM | Sun: Closed",
    google_maps_url: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
    google_rating: new Prisma.Decimal(4.9),
    total_reviews: new Prisma.Decimal(310),
    is_active: true,
  },
];

const FAQS = [
  {
    question: "How long does a typical screen repair take?",
    answer: "Most smartphone screen replacements take between 30 and 45 minutes. You can wait in our comfortable lounge or pick it up later same-day.",
    category: enum_faqs_category.General,
    order: new Prisma.Decimal(1),
  },
  {
    question: "Do you offer a warranty on repairs?",
    answer: "Yes! Every hardware repair comes with our 90-day comprehensive guarantee covering all replacement parts and technician craftsmanship.",
    category: enum_faqs_category.Warranty,
    order: new Prisma.Decimal(2),
  },
  {
    question: "Do I need an appointment or can I walk in?",
    answer: "Walk-ins are always welcome at all 3 of our Philadelphia stores! However, booking online guarantees priority bench placement.",
    category: enum_faqs_category.General,
    order: new Prisma.Decimal(3),
  },
  {
    question: "Will my phone data be erased during repair?",
    answer: "No. For standard hardware repairs like screen and battery swaps, your data remains completely untouched and secure.",
    category: enum_faqs_category.General,
    order: new Prisma.Decimal(4),
  },
];

export async function seedServicesAndLocations() {
  console.log("🌱 [Seeder] Seeding Locations & FAQs...");

  for (const loc of LOCATIONS) {
    await prisma.locations.upsert({
      where: { store_code: loc.store_code },
      update: loc,
      create: loc,
    });
    console.log(`  ✓ Synced location: ${loc.name} (${loc.store_code})`);
  }

  const faqCount = await prisma.faqs.count();
  if (faqCount === 0) {
    for (const faq of FAQS) {
      await prisma.faqs.create({ data: faq });
    }
    console.log(`  ✓ Synced ${FAQS.length} FAQs`);
  } else {
    console.log(`  ℹ FAQs already populated (${faqCount} entries). Skipping.`);
  }

  console.log("✅ [Seeder] Locations & FAQs seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/services.seed.ts
if (require.main === module) {
  seedServicesAndLocations()
    .catch((err) => {
      console.error("❌ Failed to seed Services & Locations:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
