"use server";

import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/authCrypto";

// Import all seeds for web installer
import { seedTaxonomies } from "../../prisma/seeds/taxonomies.seed";
import { seedNavigation } from "../../prisma/seeds/navigation.seed";
import { seedCmsPages } from "../../prisma/seeds/cmsPages.seed";
import { seedPageBuilder } from "../../prisma/seeds/pageBuilder.seed";
import { seedBlog } from "../../prisma/seeds/blog.seed";
import { seedSeoMetadata } from "../../prisma/seeds/seo.seed";
import { seedGeoAeo } from "../../prisma/seeds/geoAeo.seed";
import { seedThirdPartyApis } from "../../prisma/seeds/thirdPartyApis.seed";
import { seedServicesAndLocations } from "../../prisma/seeds/services.seed";
import { seedLeads } from "../../prisma/seeds/leads.seed";
import { seedSettings } from "../../prisma/seeds/settings.seed";

const LOCK_FILE_PATH = path.join(process.cwd(), ".installed");

export interface InstallStatusResult {
  isInstalled: boolean;
  installedAt?: string;
  adminEmail?: string;
  databaseConnected: boolean;
  error?: string;
}

/**
 * Checks if the system has already been installed and locked
 */
export async function checkInstallStatusAction(): Promise<InstallStatusResult> {
  let isInstalled = false;
  let installedAt: string | undefined;
  let adminEmail: string | undefined;
  let databaseConnected = false;

  try {
    // 1. Check lockfile
    if (fs.existsSync(LOCK_FILE_PATH)) {
      isInstalled = true;
      try {
        const data = JSON.parse(fs.readFileSync(LOCK_FILE_PATH, "utf8"));
        installedAt = data.installedAt;
        adminEmail = data.adminEmail;
      } catch {
        // ignore JSON parse error
      }
    }

    // 2. Check Database connection
    await prisma.$queryRaw`SELECT 1`;
    databaseConnected = true;

    // 3. Fallback: If admin user exists in DB, consider installed
    const adminCount = await prisma.adminUser.count({
      where: { role: "super_admin", isActive: true },
    });

    if (adminCount > 0) {
      isInstalled = true;
    }

    return {
      isInstalled,
      installedAt,
      adminEmail,
      databaseConnected,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      isInstalled,
      databaseConnected: false,
      error: error.message,
    };
  }
}

/**
 * One-Time Automated Installer Action
 * Synchronizes database, seeds all core datasets, and provisions the Super Admin
 */
export async function runInstallerAction(formData: {
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    // Prevent re-installation if already locked
    const status = await checkInstallStatusAction();
    if (status.isInstalled) {
      return {
        success: false,
        error: "Security Alert: Application is already installed and locked. Cannot run installer again.",
      };
    }

    const name = formData.adminName?.trim() || "Dr. Mike";
    const email = formData.adminEmail?.trim().toLowerCase();
    const password = formData.adminPassword;

    if (!email || !password || password.length < 6) {
      return {
        success: false,
        error: "Valid email and a password of at least 6 characters are required.",
      };
    }

    // Step 1: Run All Data Seeds
    await seedTaxonomies();
    await seedNavigation();
    await seedCmsPages();
    await seedPageBuilder();
    await seedBlog();
    await seedSeoMetadata();
    await seedGeoAeo();
    await seedThirdPartyApis();
    await seedServicesAndLocations();
    await seedLeads();
    await seedSettings();

    // Step 2: Create Super Admin Account
    const passwordHash = hashPassword(password);
    await prisma.adminUser.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        role: "super_admin",
        isActive: true,
      },
      create: {
        name,
        email,
        passwordHash,
        role: "super_admin",
        phone: "+1 (215) 555-0100",
        avatarUrl: "/avatar.png",
        address: "33 S 52nd St, Philadelphia, PA 19139",
        bio: "SmartFoneDoctor Flagship Store Admin & Head of Technical Operations.",
        department: "Executive Management & Flagship Ops",
        twoFactorEnabled: false,
        isActive: true,
      },
    });

    // Step 3: Write One-Time Lock
    const lockData = {
      installedAt: new Date().toISOString(),
      version: "1.0.0",
      adminEmail: email,
      adminName: name,
      status: "locked",
      installer: "web",
    };

    fs.writeFileSync(LOCK_FILE_PATH, JSON.stringify(lockData, null, 2), "utf8");

    return {
      success: true,
      message: "Installation & automated data seed completed successfully!",
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error("runInstallerAction error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during installation.",
    };
  }
}
