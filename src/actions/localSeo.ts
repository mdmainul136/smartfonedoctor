"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface GmbPostItem {
  id: string;
  profileId: string;
  storeCode: string;
  storeId: number;
  type: "Offer" | "Update";
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  couponCode?: string | null;
  publishedAt: string;
  views: number;
  clicks: number;
}

const STORE_CODE_TO_ID: Record<string, number> = {
  "nd_st": 1,
  "lancaster_4016": 2,
  "lancaster_4060": 3,
};

const STORE_ID_TO_CODE: Record<number, string> = {
  1: "nd_st",
  2: "lancaster_4016",
  3: "lancaster_4060",
};

const SEED_PROFILES = [
  {
    storeCode: "nd_st",
    storeName: "SmartFoneDoctor - 33 S 52nd St (West Philly)",
    googlePlaceId: "ChIJW8Z16eTGxokR4k5Y2L7fK8k",
    googleCid: "15243892090",
    impressions: 3840,
    profileViews: 612,
    calls: 214,
    directions: 178,
    websiteClicks: 145,
    messages: 34,
    reviewsCount: 50,
    unrepliedReviews: 3,
    rating: 4.8,
  },
  {
    storeCode: "lancaster_4016",
    storeName: "SmartFoneDoctor - 4016 Lancaster Ave (University City)",
    googlePlaceId: "ChIJL5Y98_TGxokRv0y2Z58_b20",
    googleCid: "14839201923",
    impressions: 2210,
    profileViews: 340,
    calls: 143,
    directions: 97,
    websiteClicks: 88,
    messages: 19,
    reviewsCount: 89,
    unrepliedReviews: 2,
    rating: 4.6,
  },
  {
    storeCode: "lancaster_4060",
    storeName: "SmartFoneDoctor - 4060 Lancaster Ave (Lancaster Express)",
    googlePlaceId: "ChIJK2910_TGxokRb91280_4910",
    googleCid: "13902910291",
    impressions: 1760,
    profileViews: 265,
    calls: 98,
    directions: 74,
    websiteClicks: 64,
    messages: 12,
    reviewsCount: 61,
    unrepliedReviews: 1,
    rating: 4.5,
  },
];

const SEED_POSTS = [
  {
    storeCode: "nd_st",
    type: "Offer",
    title: "$15 Off Any iPhone 15 / 16 Pro Screen Repair",
    body: "Cracked your iPhone screen? Stop by our 33 S 52nd St flagship shop in West Philly for a 30-minute OEM-grade replacement and get a free tempered glass protector.",
    ctaLabel: "Book online",
    ctaUrl: "https://smartfonedoctor.com/locations",
    couponCode: "PHILLY15",
    views: 412,
    clicks: 29,
  },
  {
    storeCode: "nd_st",
    type: "Update",
    title: "Same-Day PS5 & Xbox HDMI Port Replacement",
    body: "No signal on your TV? Our micro-soldering bench at 33 S 52nd St replaces damaged console HDMI ports the same day with a 90-day warranty.",
    ctaLabel: "Call now",
    ctaUrl: "tel:+12155982090",
    views: 318,
    clicks: 19,
  },
  {
    storeCode: "lancaster_4016",
    type: "Update",
    title: "Express 25-Minute Battery Swaps at 4016 Lancaster Ave",
    body: "Drop off your phone near University City & Drexel at 4016 Lancaster Ave and pick it up with 100% battery health in under 30 minutes.",
    ctaLabel: "Get directions",
    ctaUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
    views: 245,
    clicks: 16,
  },
  {
    storeCode: "lancaster_4060",
    type: "Offer",
    title: "Free Diagnostic Check on Water-Damaged Devices",
    body: "Spilled coffee or water on your phone or MacBook? Bring it in to 4060 Lancaster Ave immediately—no diagnostic fee if we can't recover it.",
    ctaLabel: "Learn more",
    ctaUrl: "https://smartfonedoctor.com",
    couponCode: "RECOVER0",
    views: 190,
    clicks: 11,
  },
];

/**
 * Ensure GMB profiles and default posts exist in PostgreSQL
 */
async function ensureGmbSeedData() {
  const profileCount = await prisma.gmbProfile.count();
  if (profileCount === 0) {
    for (const p of SEED_PROFILES) {
      await prisma.gmbProfile.create({
        data: {
          storeCode: p.storeCode,
          storeName: p.storeName,
          googlePlaceId: p.googlePlaceId,
          googleCid: p.googleCid,
          impressions: p.impressions,
          profileViews: p.profileViews,
          calls: p.calls,
          directions: p.directions,
          websiteClicks: p.websiteClicks,
          messages: p.messages,
          reviewsCount: p.reviewsCount,
          unrepliedReviews: p.unrepliedReviews,
          rating: p.rating,
        },
      });
    }

    const profiles = await prisma.gmbProfile.findMany();
    const profileMap = new Map(profiles.map((pr) => [pr.storeCode, pr.id]));

    for (const post of SEED_POSTS) {
      const pId = profileMap.get(post.storeCode);
      if (pId) {
        await prisma.gmbPost.create({
          data: {
            profileId: pId,
            type: post.type,
            title: post.title,
            body: post.body,
            ctaLabel: post.ctaLabel,
            ctaUrl: post.ctaUrl,
            couponCode: post.couponCode,
            views: post.views,
            clicks: post.clicks,
          },
        });
      }
    }
  }
}

/**
 * Fetch all GMB posts across all stores or for a specific store
 */
export async function getGmbPostsAction(storeId?: number) {
  try {
    await ensureGmbSeedData();

    const targetCode = storeId ? STORE_ID_TO_CODE[storeId] : undefined;
    const where = targetCode
      ? { profile: { storeCode: targetCode } }
      : {};

    const posts = await prisma.gmbPost.findMany({
      where,
      include: { profile: true },
      orderBy: { publishedAt: "desc" },
    });

    const serialized: GmbPostItem[] = posts.map((p) => ({
      id: p.id,
      profileId: p.profileId,
      storeCode: p.profile.storeCode,
      storeId: STORE_CODE_TO_ID[p.profile.storeCode] || 1,
      type: p.type as "Offer" | "Update",
      title: p.title,
      body: p.body,
      ctaLabel: p.ctaLabel,
      ctaUrl: p.ctaUrl,
      couponCode: p.couponCode,
      publishedAt: p.publishedAt.toISOString().split("T")[0],
      views: p.views,
      clicks: p.clicks,
    }));

    return { success: true, posts: serialized };
  } catch (err: unknown) {
    console.error("Failed to fetch GMB posts:", err);
    return { success: false, posts: [], error: err instanceof Error ? err.message : "Database error" };
  }
}

export interface CreateGmbPostInput {
  storeId: number;
  type: "Offer" | "Update";
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  couponCode?: string;
}

/**
 * Create a new GMB post
 */
export async function createGmbPostAction(input: CreateGmbPostInput) {
  try {
    await ensureGmbSeedData();

    const storeCode = STORE_ID_TO_CODE[input.storeId] || "nd_st";
    const profile = await prisma.gmbProfile.findUnique({
      where: { storeCode },
    });

    if (!profile) {
      return { success: false, error: `GMB profile for store #${input.storeId} not found` };
    }

    const created = await prisma.gmbPost.create({
      data: {
        profileId: profile.id,
        type: input.type,
        title: input.title,
        body: input.body,
        ctaLabel: input.ctaLabel,
        ctaUrl: input.ctaUrl,
        couponCode: input.couponCode || null,
        views: 0,
        clicks: 0,
      },
      include: { profile: true },
    });

    revalidatePath("/admin/local-seo/posts");
    revalidatePath("/admin/listings/ai-visibility");
    revalidatePath("/llms.txt");

    const serialized: GmbPostItem = {
      id: created.id,
      profileId: created.profileId,
      storeCode: created.profile.storeCode,
      storeId: STORE_CODE_TO_ID[created.profile.storeCode] || 1,
      type: created.type as "Offer" | "Update",
      title: created.title,
      body: created.body,
      ctaLabel: created.ctaLabel,
      ctaUrl: created.ctaUrl,
      couponCode: created.couponCode,
      publishedAt: created.publishedAt.toISOString().split("T")[0],
      views: created.views,
      clicks: created.clicks,
    };

    return { success: true, post: serialized };
  } catch (err: unknown) {
    console.error("Failed to create GMB post:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database create failed" };
  }
}

/**
 * Delete a GMB post
 */
export async function deleteGmbPostAction(id: string) {
  try {
    await prisma.gmbPost.delete({ where: { id } });
    revalidatePath("/admin/local-seo/posts");
    revalidatePath("/admin/listings/ai-visibility");
    revalidatePath("/llms.txt");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete GMB post:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database delete failed" };
  }
}
