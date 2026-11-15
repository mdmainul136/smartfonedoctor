import { PrismaClient, Prisma, enum_leads_store, enum_leads_status, enum_leads_source } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_LEADS = [
  { customerName: "Marcus Johnson", device: "iPhone 15 Pro", issue: "Cracked OLED Screen", store: enum_leads_store.nd_st, source: enum_leads_source.google_maps, status: enum_leads_status.scheduled, estValue: 189, phone: "+1 (215) 555-1001", email: "marcus.j@example.com", notes: "Prefers text message updates" },
  { customerName: "Aliyah Thompson", device: "Samsung Galaxy S23", issue: "Battery Replacement", store: enum_leads_store.lancaster_4016, source: enum_leads_source.ai, status: enum_leads_status.new, estValue: 69, phone: "+1 (215) 555-1002", email: "aliyah.t@example.com", notes: "Walk-in expected afternoon" },
  { customerName: "David Kim", device: "iPhone 13", issue: "Water Damage Ultrasonic", store: enum_leads_store.lancaster_4060, source: enum_leads_source.google_search, status: enum_leads_status.contacted, estValue: 110, phone: "+1 (610) 555-1003", email: "dkim@example.com", notes: "Dropped in sink yesterday" },
  { customerName: "Priya Patel", device: "Google Pixel 8", issue: "USB-C Charging Port", store: enum_leads_store.nd_st, source: enum_leads_source.website_form, status: enum_leads_status.completed, estValue: 69, phone: "+1 (215) 555-1004", email: "priya.p@example.com", notes: "Repaired same day, picked up" },
  { customerName: "James Williams", device: "iPhone 15", issue: "Back Glass Laser Repair", store: enum_leads_store.lancaster_4016, source: enum_leads_source.yelp, status: enum_leads_status.completed, estValue: 129, phone: "+1 (215) 555-1005", email: "jwilliams@example.com", notes: "Laser separation completed" },
  { customerName: "Sarah Chen", device: "Samsung Galaxy A54", issue: "Speaker & Earpiece", store: enum_leads_store.lancaster_4060, source: enum_leads_source.google_maps, status: enum_leads_status.lost, estValue: 59, phone: "+1 (610) 555-1006", email: "schen@example.com", notes: "Customer cancelled intake" },
  { customerName: "Robert Davis", device: "iPhone 12", issue: "Screen Replacement", store: enum_leads_store.nd_st, source: enum_leads_source.social, status: enum_leads_status.scheduled, estValue: 139, phone: "+1 (215) 555-1007", email: "rdavis@example.com", notes: "Needs OEM grade screen" },
  { customerName: "Antoine Vance", device: "PS5 Console", issue: "HDMI Port Micro-Soldering", store: enum_leads_store.nd_st, source: enum_leads_source.ai, status: enum_leads_status.new, estValue: 149, phone: "+1 (215) 555-1009", email: "avance@example.com", notes: "Bent pins on HDMI port" },
];

export async function seedLeads() {
  console.log("🌱 [Seeder] Seeding Customer Repair Leads...");

  const count = await prisma.lead.count();
  if (count > 0) {
    console.log(`  ℹ Lead records already exist (${count} entries). Skipping overwrite.`);
    return;
  }

  for (const s of SAMPLE_LEADS) {
    const created = await prisma.lead.create({
      data: {
        customer_name: s.customerName,
        phone: s.phone,
        email: s.email,
        device: s.device,
        issue: s.issue,
        store: s.store,
        status: s.status,
        source: s.source,
        est_value: new Prisma.Decimal(s.estValue),
        notes: s.notes,
      },
    });

    console.log(`  ✓ Created lead: ${s.customerName} (Ticket: SFD-${10000 + created.id}) - ${s.device}`);
  }

  console.log("✅ [Seeder] Leads seeded successfully.");
}

// Allow independent CLI execution: npx tsx prisma/seeds/leads.seed.ts
if (require.main === module) {
  seedLeads()
    .catch((err) => {
      console.error("❌ Failed to seed Leads:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
