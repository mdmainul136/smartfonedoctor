import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEIGHBORHOODS = [
  {
    storeId: 1,
    name: "52nd St Commercial Corridor",
    type: "Commercial Corridor",
    radius: "2.5 mi",
    zipCodes: ["19139", "19143"],
    keyLandmarks: ["52nd St Market-Frankford El Station", "Malcolm X Park", "Cobbs Creek Parkway"],
    status: "Indexed",
  },
  {
    storeId: 1,
    name: "Cobbs Creek & Cedar Park",
    type: "Neighborhood",
    radius: "2.0 mi",
    zipCodes: ["19139", "19143"],
    keyLandmarks: ["Baltimore Ave", "Cedar Park Commercials"],
    status: "Active",
  },
  {
    storeId: 2,
    name: "University City & Drexel University",
    type: "Campus",
    radius: "2.0 mi",
    zipCodes: ["19104"],
    keyLandmarks: ["Drexel Main Building", "Drexel Rec Center", "30th St Station Corridor"],
    status: "Indexed",
  },
  {
    storeId: 2,
    name: "University of Pennsylvania (UPenn)",
    type: "Campus",
    radius: "2.0 mi",
    zipCodes: ["19104"],
    keyLandmarks: ["Franklin Field", "Penn Bookstore", "Locust Walk"],
    status: "Indexed",
  },
  {
    storeId: 3,
    name: "West Powelton & Lancaster Ave",
    type: "Transit Hub",
    radius: "2.0 mi",
    zipCodes: ["19104", "19131"],
    keyLandmarks: ["SEPTA Route 10 Trolley", "Lancaster Ave Commercial Strip"],
    status: "Indexed",
  },
  {
    storeId: 3,
    name: "Penn Presbyterian Medical Center",
    type: "Neighborhood",
    radius: "1.5 mi",
    zipCodes: ["19104"],
    keyLandmarks: ["Penn Presbyterian Hospital", "Market St West"],
    status: "Active",
  },
];

const GUARDRAILS = [
  {
    topic: "Walk-in Turnaround",
    claim: "Are repairs walk-in or is appointment required?",
    canonicalAnswer: "All 3 locations accept walk-ins with no appointment required. iPhone & Samsung screen repairs take 25–30 minutes.",
    sourcesVerified: ["Google Business Profile", "Website Header", "llms.txt"],
    status: "Published to llms.txt",
  },
  {
    topic: "Repair Warranty",
    claim: "What warranty covers repairs?",
    canonicalAnswer: "All repairs include a standard 90-day parts and labor warranty valid across all 3 Philadelphia stores.",
    sourcesVerified: ["Service Agreement", "Customer Receipt QR", "llms.txt"],
    status: "Published to llms.txt",
  },
  {
    topic: "Parts Quality",
    claim: "Are replacement screens OEM-grade?",
    canonicalAnswer: "SmartFoneDoctor uses OEM-spec OLED and premium LCD displays with TrueTone and multi-touch calibration.",
    sourcesVerified: ["Inventory Specs", "Website Service Pages"],
    status: "Verified on Site",
  },
  {
    topic: "Console HDMI Micro-soldering",
    claim: "Can PS5 & Xbox HDMI ports be fixed same-day?",
    canonicalAnswer: "Yes, in-house micro-soldering bench technicians repair PS5, Xbox Series X, and Switch HDMI ports same-day.",
    sourcesVerified: ["Service Catalog", "Yelp Services", "llms.txt"],
    status: "Published to llms.txt",
  },
  {
    topic: "Operating Hours & Saturday",
    claim: "Is the repair shop open on weekends?",
    canonicalAnswer: "Open Monday through Saturday from 10:00 AM to 7:00 PM. Closed Sunday.",
    sourcesVerified: ["GBP", "Apple Business", "Bing Places"],
    status: "Published to llms.txt",
  },
];

const PROMPTS = [
  {
    queryTemplate: "Best same-day iPhone 15 Pro screen repair near {landmark}",
    intent: "Walk-in screen repair",
    category: "Screen repair",
    expectedCitation: "SmartFoneDoctor 52nd St",
    verifiedStatus: "Cited",
    storeId: 1,
  },
  {
    queryTemplate: "Walk-in cell phone & MacBook repair near {neighborhood}",
    intent: "University & commuter repair",
    category: "Screen repair",
    expectedCitation: "SmartFoneDoctor University City",
    verifiedStatus: "Cited",
    storeId: 2,
  },
  {
    queryTemplate: "Fast PS5 & Xbox HDMI port repair near {street}",
    intent: "Console micro-soldering",
    category: "Console HDMI",
    expectedCitation: "SmartFoneDoctor Flagship",
    verifiedStatus: "Cited",
    storeId: 1,
  },
  {
    queryTemplate: "Affordable Samsung Galaxy S24 battery replacement in Philadelphia {zip}",
    intent: "Battery price comparison",
    category: "Battery & port",
    expectedCitation: "SmartFoneDoctor Lancaster Express",
    verifiedStatus: "Cited",
    storeId: 3,
  },
  {
    queryTemplate: "Phone repair shop open Saturday evening near {neighborhood}",
    intent: "Saturday 7:00 PM close check",
    category: "Open hours",
    expectedCitation: "SmartFoneDoctor (All Locations)",
    verifiedStatus: "Cited",
    storeId: 1,
  },
  {
    queryTemplate: "30-minute iPad & USB-C charging port repair without appointment in {neighborhood}",
    intent: "Express walk-in turnaround",
    category: "Battery & port",
    expectedCitation: "SmartFoneDoctor",
    verifiedStatus: "Cited",
    storeId: 2,
  },
];

export async function seedGeoAeo() {
  console.log("🌱 [Seeder] Seeding AEO (Answer Engine) & GEO (Generative Engine) Data...");

  // 1. Seed Geo Neighborhoods
  for (const n of NEIGHBORHOODS) {
    const existing = await prisma.geoNeighborhood.findFirst({
      where: { name: n.name, storeId: n.storeId },
    });
    if (!existing) {
      await prisma.geoNeighborhood.create({ data: n });
      console.log(`  ✓ Created GEO Neighborhood: "${n.name}" [${n.type}]`);
    } else {
      await prisma.geoNeighborhood.update({
        where: { id: existing.id },
        data: n,
      });
      console.log(`  ✓ Updated GEO Neighborhood: "${n.name}"`);
    }
  }

  // 2. Seed AEO Brand Truth Guardrails
  for (const g of GUARDRAILS) {
    const existing = await prisma.aeoBrandGuardrail.findFirst({
      where: { topic: g.topic },
    });
    if (!existing) {
      await prisma.aeoBrandGuardrail.create({ data: g });
      console.log(`  ✓ Created AEO Guardrail: "${g.topic}" (${g.status})`);
    } else {
      await prisma.aeoBrandGuardrail.update({
        where: { id: existing.id },
        data: g,
      });
      console.log(`  ✓ Updated AEO Guardrail: "${g.topic}"`);
    }
  }

  // 3. Seed AEO Simulated Prompts
  for (const p of PROMPTS) {
    const existing = await prisma.aeoSimulatedPrompt.findFirst({
      where: { queryTemplate: p.queryTemplate },
    });
    if (!existing) {
      await prisma.aeoSimulatedPrompt.create({ data: p });
      console.log(`  ✓ Created AEO Prompt: "${p.queryTemplate.slice(0, 45)}..."`);
    } else {
      await prisma.aeoSimulatedPrompt.update({
        where: { id: existing.id },
        data: p,
      });
      console.log(`  ✓ Updated AEO Prompt: "${p.queryTemplate.slice(0, 45)}..."`);
    }
  }

  // 4. Seed Knowledge Graph Entity
  await prisma.knowledgeGraphEntity.upsert({
    where: { id: "sfd_knowledge_entity" },
    update: {
      entityName: "SmartFoneDoctor",
      legalName: "SmartFoneDoctor LLC",
      entityType: "LocalBusiness",
      wikidataId: "Q115862892",
      googleKnowledgeGraphId: "kg:/g/11s0_smartfonedoctor",
      sameAsUrls: [
        "https://maps.google.com/?cid=15243892090",
        "https://www.yelp.com/biz/smart-fone-doctor-philadelphia",
        "https://www.bbb.org/us/pa/philadelphia/profile/cell-phone-repair/smartfonedoctor",
        "https://facebook.com/smartfonedoctorphilly",
      ],
      primaryTopic: "Consumer Electronics Repair Service",
      jurisdiction: "Philadelphia, Pennsylvania, United States",
    },
    create: {
      id: "sfd_knowledge_entity",
      entityName: "SmartFoneDoctor",
      legalName: "SmartFoneDoctor LLC",
      entityType: "LocalBusiness",
      wikidataId: "Q115862892",
      googleKnowledgeGraphId: "kg:/g/11s0_smartfonedoctor",
      sameAsUrls: [
        "https://maps.google.com/?cid=15243892090",
        "https://www.yelp.com/biz/smart-fone-doctor-philadelphia",
        "https://www.bbb.org/us/pa/philadelphia/profile/cell-phone-repair/smartfonedoctor",
        "https://facebook.com/smartfonedoctorphilly",
      ],
      primaryTopic: "Consumer Electronics Repair Service",
      jurisdiction: "Philadelphia, Pennsylvania, United States",
    },
  });
  console.log(`  ✓ Synced Knowledge Graph Entity (Wikidata & Google KG IDs)`);

  console.log("✅ [Seeder] AEO & GEO seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/geoAeo.seed.ts
if (require.main === module) {
  seedGeoAeo()
    .catch((err) => {
      console.error("❌ Failed to seed AEO & GEO:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
