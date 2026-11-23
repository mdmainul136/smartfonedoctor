import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../src/lib/authCrypto";

const prisma = new PrismaClient();

export async function seedAdminUsers() {
  console.log("🌱 [Seeder] Seeding Admin Users & Auth Profiles...");

  const adminUsersData = [
    {
      email: "admin@smartfonedoctor.com",
      name: "Dr. Mike",
      rawPassword: "admin123456",
      role: "super_admin",
      phone: "+1 (215) 555-0100",
      avatarUrl: "/avatar.png",
      address: "33 S 52nd St, Philadelphia, PA 19139",
      bio: "SmartFoneDoctor Flagship Store Admin & Head of Technical Operations.",
      department: "Executive Management & Flagship Ops",
      twoFactorEnabled: false,
      isActive: true,
    },
    {
      email: "tech@smartfonedoctor.com",
      name: "Sarah Jenkins",
      rawPassword: "tech123456",
      role: "technician",
      phone: "+1 (215) 555-0199",
      avatarUrl: "/avatar.png",
      address: "33 S 52nd St, Philadelphia, PA 19139",
      bio: "Master Micro-Soldering Technician and Diagnostics Lead.",
      department: "Diagnostic & Micro-Soldering Lab",
      twoFactorEnabled: false,
      isActive: true,
    },
  ];

  for (const user of adminUsersData) {
    const existing = await prisma.adminUser.findUnique({
      where: { email: user.email },
    });

    const passwordHash = hashPassword(user.rawPassword);

    if (!existing) {
      await prisma.adminUser.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash,
          role: user.role,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          address: user.address,
          bio: user.bio,
          department: user.department,
          twoFactorEnabled: user.twoFactorEnabled,
          isActive: user.isActive,
        },
      });
      console.log(`   ➕ Created Admin: ${user.name} (${user.email}) [Role: ${user.role}]`);
    } else {
      console.log(`   ✓ Preserved existing Admin Profile: ${existing.name} (${existing.email})`);
    }
  }

  console.log("✅ [Seeder] Admin Users seeded successfully.");
}

if (require.main === module) {
  seedAdminUsers()
    .catch((e) => {
      console.error("❌ Failed to seed Admin Users:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
