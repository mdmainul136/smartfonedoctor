"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminGuard";
import {
  Prisma,
  enum_leads_store,
  enum_reviews_source,
  enum_reviews_store,
} from "@prisma/client";
import {
  publishGbpReviewReplyLive,
  resolveValidGbpAccessToken,
  sendTwilioSmsLive,
  PHILLY_STORES,
} from "@/lib/externalApis";
import { triggerApiPullAction } from "@/actions/thirdPartyApis";
import type {
  TrackingChannelId,
  StoreQrAnalytics,
  QrScanEvent,
  CouponCode,
  TrackedLink,
} from "@/lib/qrTracking";

export type ReviewPlatform = "Google" | "Yelp" | "Trustpilot" | "Facebook";

export interface AdminReview {
  id: number;
  reviewer: string;
  deviceService: string;
  topicTag: string;
  rating: number;
  date: string;
  text: string;
  storeId: number;
  platform: ReviewPlatform;
  featuredOnSite?: boolean;
  externalReviewName?: string;
  reply?: { text: string; date: string };
}

export interface SmsCandidate {
  id: string;
  customer: string;
  phone: string;
  device: string;
  storeId: number;
  completedAgo: string;
  recommendedPlatform: ReviewPlatform;
  reason: string;
  sent: boolean;
}

export interface QrTrackingState {
  byStore: Record<number, StoreQrAnalytics>;
  events: QrScanEvent[];
  coupons: CouponCode[];
  links: TrackedLink[];
}

interface ReviewsHubPayload {
  reviews: AdminReview[];
  sentSmsLeadIds: string[];
}

const REVIEWS_HUB_KEY = "reviews-hub";
const QR_TRACKING_KEY = "qr-tracking";

const STORE_ID_TO_REVIEW_ENUM: Record<number, enum_reviews_store> = {
  1: enum_reviews_store.nd_st,
  2: enum_reviews_store.lancaster_4016,
  3: enum_reviews_store.lancaster_4060,
};

const STORE_ID_TO_GMB_CODE: Record<number, string> = {
  1: "nd_st",
  2: "lancaster_4016",
  3: "lancaster_4060",
};

const STORE_REASON: Record<number, string> = {
  1: "52nd St Flagship Google Maps review",
  2: "4016 Lancaster University City citation",
  3: "4060 Lancaster Express review",
};

function mapLeadStoreToId(store: enum_leads_store): number {
  if (store === enum_leads_store.lancaster_4016) return 2;
  if (store === enum_leads_store.lancaster_4060) return 3;
  return 1;
}

function mapPlatformToReviewSource(platform: ReviewPlatform): enum_reviews_source {
  if (platform === "Yelp") return enum_reviews_source.yelp;
  if (platform === "Google") return enum_reviews_source.google;
  return enum_reviews_source.qr_code;
}

function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  return date.toISOString().slice(0, 10);
}

const DEFAULT_REVIEWS: AdminReview[] = [
  {
    id: 1,
    reviewer: "Marcus Thompson",
    deviceService: "iPhone 15 Pro Screen",
    topicTag: "30-min turnaround",
    rating: 5,
    date: "2024-11-10",
    platform: "Google",
    storeId: 1,
    featuredOnSite: true,
    text: "Fixed my iPhone screen in under an hour. Super professional and reasonably priced. Will definitely be back!",
    reply: {
      text: "Thanks Marcus! Glad our 33 S 52nd St team could get your iPhone 15 Pro screen replaced fast.",
      date: "2024-11-10",
    },
  },
  {
    id: 2,
    reviewer: "Dalisah Lowe",
    deviceService: "Samsung S23 Screen",
    topicTag: "Saturday wait time",
    rating: 1,
    date: "2024-11-09",
    platform: "Google",
    storeId: 1,
    text: "Waited over two hours past the quoted time and nobody called to update me. Phone works now but the experience was frustrating.",
  },
  {
    id: 3,
    reviewer: "Kevin Moore",
    deviceService: "iPhone 14 Battery",
    topicTag: "Fair pricing",
    rating: 4,
    date: "2024-11-08",
    platform: "Facebook",
    storeId: 1,
    text: "Quick battery replacement, good price. Only complaint was a short wait, but staff was friendly.",
  },
  {
    id: 4,
    reviewer: "Madison Miller",
    deviceService: "Tempered Glass & Case",
    topicTag: "Friendly staff",
    rating: 5,
    date: "2024-11-07",
    platform: "Trustpilot",
    storeId: 1,
    featuredOnSite: true,
    text: "I love going to Smart Fone Doctor whenever I need a screen protector or battery check. The staff is friendly and knowledgeable.",
  },
  {
    id: 5,
    reviewer: "Shea Hawk",
    deviceService: "iPhone 15 OLED Screen",
    topicTag: "30-min turnaround",
    rating: 5,
    date: "2024-11-06",
    platform: "Yelp",
    storeId: 1,
    featuredOnSite: true,
    text: "Love this place, they have everything you are looking for in one spot. iPhone 15 screen done in 30 minutes.",
  },
  {
    id: 6,
    reviewer: "David Ruiz",
    deviceService: "iPhone 13 Digitizer",
    topicTag: "Touch sensitivity",
    rating: 2,
    date: "2024-11-03",
    platform: "Yelp",
    storeId: 1,
    text: "Screen replacement looked fine at first but the touch started acting up after a week.",
  },
  {
    id: 7,
    reviewer: "Jennifer Lin",
    deviceService: "Samsung Water Damage",
    topicTag: "Data recovery",
    rating: 5,
    date: "2024-11-09",
    platform: "Google",
    storeId: 2,
    featuredOnSite: true,
    text: "They saved my water-damaged Samsung near Drexel. I thought it was gone for good. Great team!",
  },
  {
    id: 8,
    reviewer: "Omar Haddad",
    deviceService: "PS5 HDMI Port",
    topicTag: "Turnaround quote",
    rating: 3,
    date: "2024-11-06",
    platform: "Facebook",
    storeId: 2,
    text: "Decent PS5 HDMI repair but had to wait longer than quoted. Final result works great though.",
  },
  {
    id: 9,
    reviewer: "Rachel Green",
    deviceService: "MacBook Air Screen",
    topicTag: "Fair pricing",
    rating: 5,
    date: "2024-11-02",
    platform: "Google",
    storeId: 2,
    text: "Fast, honest and fair pricing for UPenn students.",
    reply: {
      text: "Thank you Rachel! Happy to help UPenn and University City students with same-day MacBook and phone repairs.",
      date: "2024-11-02",
    },
  },
  {
    id: 10,
    reviewer: "Aisha Bello",
    deviceService: "iPhone 15 Cracked Screen",
    topicTag: "Walk-in speed",
    rating: 5,
    date: "2024-11-07",
    platform: "Google",
    storeId: 3,
    featuredOnSite: true,
    text: "Came in without an appointment for a cracked screen on Lancaster Ave. Ready in 35 minutes. Amazing!",
  },
  {
    id: 11,
    reviewer: "Tom Becker",
    deviceService: "iPad USB-C Port",
    topicTag: "Street parking",
    rating: 4,
    date: "2024-11-01",
    platform: "Yelp",
    storeId: 3,
    text: "Good work on my iPad charging port. Street parking on Lancaster Ave is tough though.",
    reply: {
      text: "Thanks Tom! Glad the iPad port is working like new.",
      date: "2024-11-02",
    },
  },
];

const DEFAULT_STORE_QR_ANALYTICS: Record<number, StoreQrAnalytics> = {
  1: {
    storeId: 1,
    slug: "phl-01",
    totalScans: 312,
    iosScans: 214,
    androidScans: 98,
    counterQrScans: 228,
    smsLinkClicks: 84,
    shieldIntercepts: 6,
    channels: {
      gmb: {
        id: "gmb",
        label: "Google Business Profile",
        category: "Review Directory",
        handleOrTarget: "SmartFoneDoctor · 33 S 52nd St",
        destinationUrl: "https://www.google.com/maps",
        clicks: 138,
        verifiedConversions: 54,
        verificationMethod: "Google Business API delta",
      },
      apple: {
        id: "apple",
        label: "Apple Business Connect",
        category: "Review Directory",
        handleOrTarget: "Apple Maps Place Card (iOS)",
        destinationUrl: "https://maps.apple.com",
        clicks: 64,
        verifiedConversions: 29,
        verificationMethod: "iOS Place Card action + return",
      },
      yelp: {
        id: "yelp",
        label: "Yelp for Business",
        category: "Review Directory",
        handleOrTarget: "yelp.com/biz/smart-fone-doctor",
        destinationUrl: "https://www.yelp.com",
        clicks: 34,
        verifiedConversions: 12,
        verificationMethod: "Yelp Fusion review polling",
      },
      instagram: {
        id: "instagram",
        label: "Instagram",
        category: "Social Follow",
        handleOrTarget: "@smartfonedoctor.philly",
        destinationUrl: "https://www.instagram.com",
        clicks: 92,
        verifiedConversions: 68,
        verificationMethod: "Return-to-tab $5 Perk + IG Graph",
      },
      tiktok: {
        id: "tiktok",
        label: "TikTok",
        category: "Social Follow",
        handleOrTarget: "@smartfonedoctor",
        destinationUrl: "https://www.tiktok.com",
        clicks: 76,
        verifiedConversions: 53,
        verificationMethod: "Return-to-tab Perk unlock",
      },
      facebook: {
        id: "facebook",
        label: "Facebook Page",
        category: "Social Follow",
        handleOrTarget: "fb.com/smartfonedoctor",
        destinationUrl: "https://www.facebook.com",
        clicks: 41,
        verifiedConversions: 27,
        verificationMethod: "Meta Graph Page insights",
      },
    },
  },
  2: {
    storeId: 2,
    slug: "phl-02",
    totalScans: 245,
    iosScans: 176,
    androidScans: 69,
    counterQrScans: 180,
    smsLinkClicks: 65,
    shieldIntercepts: 4,
    channels: {
      gmb: {
        id: "gmb",
        label: "Google Business Profile",
        category: "Review Directory",
        handleOrTarget: "SmartFoneDoctor · 4016 Lancaster Ave",
        destinationUrl: "https://www.google.com/maps",
        clicks: 104,
        verifiedConversions: 41,
        verificationMethod: "Google Business API delta",
      },
      apple: {
        id: "apple",
        label: "Apple Business Connect",
        category: "Review Directory",
        handleOrTarget: "Apple Maps Place Card (iOS)",
        destinationUrl: "https://maps.apple.com",
        clicks: 52,
        verifiedConversions: 21,
        verificationMethod: "iOS Place Card action + return",
      },
      yelp: {
        id: "yelp",
        label: "Yelp for Business",
        category: "Review Directory",
        handleOrTarget: "yelp.com/biz/smart-fone-doctor-ucity",
        destinationUrl: "https://www.yelp.com",
        clicks: 28,
        verifiedConversions: 9,
        verificationMethod: "Yelp Fusion review polling",
      },
      instagram: {
        id: "instagram",
        label: "Instagram",
        category: "Social Follow",
        handleOrTarget: "@smartfonedoctor.philly",
        destinationUrl: "https://www.instagram.com",
        clicks: 84,
        verifiedConversions: 61,
        verificationMethod: "Return-to-tab $5 Perk + IG Graph",
      },
      tiktok: {
        id: "tiktok",
        label: "TikTok",
        category: "Social Follow",
        handleOrTarget: "@smartfonedoctor",
        destinationUrl: "https://www.tiktok.com",
        clicks: 69,
        verifiedConversions: 49,
        verificationMethod: "Return-to-tab Perk unlock",
      },
      facebook: {
        id: "facebook",
        label: "Facebook Page",
        category: "Social Follow",
        handleOrTarget: "fb.com/smartfonedoctor",
        destinationUrl: "https://www.facebook.com",
        clicks: 29,
        verifiedConversions: 18,
        verificationMethod: "Meta Graph Page insights",
      },
    },
  },
  3: {
    storeId: 3,
    slug: "phl-03",
    totalScans: 189,
    iosScans: 128,
    androidScans: 61,
    counterQrScans: 139,
    smsLinkClicks: 50,
    shieldIntercepts: 3,
    channels: {
      gmb: {
        id: "gmb",
        label: "Google Business Profile",
        category: "Review Directory",
        handleOrTarget: "SmartFoneDoctor · 4060 Lancaster Ave",
        destinationUrl: "https://www.google.com/maps",
        clicks: 82,
        verifiedConversions: 33,
        verificationMethod: "Google Business API delta",
      },
      apple: {
        id: "apple",
        label: "Apple Business Connect",
        category: "Review Directory",
        handleOrTarget: "Apple Maps Place Card (iOS)",
        destinationUrl: "https://maps.apple.com",
        clicks: 38,
        verifiedConversions: 16,
        verificationMethod: "iOS Place Card action + return",
      },
      yelp: {
        id: "yelp",
        label: "Yelp for Business",
        category: "Review Directory",
        handleOrTarget: "yelp.com/biz/smart-fone-doctor-4060",
        destinationUrl: "https://www.yelp.com",
        clicks: 22,
        verifiedConversions: 8,
        verificationMethod: "Yelp Fusion review polling",
      },
      instagram: {
        id: "instagram",
        label: "Instagram",
        category: "Social Follow",
        handleOrTarget: "@smartfonedoctor.philly",
        destinationUrl: "https://www.instagram.com",
        clicks: 58,
        verifiedConversions: 42,
        verificationMethod: "Return-to-tab $5 Perk + IG Graph",
      },
      tiktok: {
        id: "tiktok",
        label: "TikTok",
        category: "Social Follow",
        handleOrTarget: "@smartfonedoctor",
        destinationUrl: "https://www.tiktok.com",
        clicks: 47,
        verifiedConversions: 34,
        verificationMethod: "Return-to-tab Perk unlock",
      },
      facebook: {
        id: "facebook",
        label: "Facebook Page",
        category: "Social Follow",
        handleOrTarget: "fb.com/smartfonedoctor",
        destinationUrl: "https://www.facebook.com",
        clicks: 21,
        verifiedConversions: 14,
        verificationMethod: "Meta Graph Page insights",
      },
    },
  },
};

const DEFAULT_QR_EVENTS: QrScanEvent[] = [
  {
    id: "ev-1",
    storeId: 1,
    timestamp: "4 mins ago",
    deviceOs: "iOS (iPhone)",
    source: "Counter QR Standee",
    channelId: "instagram",
    channelLabel: "Instagram (@smartfonedoctor.philly)",
    outcome: "Verified Follow (Perk Unlocked)",
    customerHandleOrCode: "Perk: PHL1-IG5",
  },
  {
    id: "ev-2",
    storeId: 1,
    timestamp: "11 mins ago",
    deviceOs: "iOS (iPhone)",
    source: "SMS Invite Link",
    channelId: "gmb",
    channelLabel: "Google Business Profile",
    outcome: "Verified Review Posted",
    customerHandleOrCode: "5★ by Marcus T.",
  },
  {
    id: "ev-3",
    storeId: 2,
    timestamp: "19 mins ago",
    deviceOs: "iOS (iPhone)",
    source: "Counter QR Standee",
    channelId: "apple",
    channelLabel: "Apple Business Connect (Apple Maps)",
    outcome: "Review Redirect Clicked",
    customerHandleOrCode: "iOS Maps Deep-Link",
  },
  {
    id: "ev-4",
    storeId: 2,
    timestamp: "34 mins ago",
    deviceOs: "Android",
    source: "Counter QR Standee",
    channelId: "tiktok",
    channelLabel: "TikTok (@smartfonedoctor)",
    outcome: "Verified Follow (Perk Unlocked)",
    customerHandleOrCode: "Perk: PHL2-TT5",
  },
  {
    id: "ev-5",
    storeId: 3,
    timestamp: "52 mins ago",
    deviceOs: "iOS (iPhone)",
    source: "Receipt QR",
    channelId: "shield-intercept",
    channelLabel: "Private Feedback Shield (2★ Check-in)",
    outcome: "Private Shield Intercepted (1-3★)",
    customerHandleOrCode: "Escalated to Manager SMS",
  },
];

const DEFAULT_COUPONS: CouponCode[] = [
  { id: "c1", code: "PHL1-INS5", discount: "$5 Off", channelId: "instagram", storeId: 1, uses: 68, maxUses: null, expiresAt: null, active: true },
  { id: "c2", code: "PHL1-TT5", discount: "$5 Off", channelId: "tiktok", storeId: 1, uses: 53, maxUses: null, expiresAt: null, active: true },
  { id: "c3", code: "PHL2-INS5", discount: "$5 Off", channelId: "instagram", storeId: 2, uses: 61, maxUses: null, expiresAt: null, active: true },
  { id: "c4", code: "PHL1-FB5", discount: "Free Lens Wipe", channelId: "facebook", storeId: 1, uses: 27, maxUses: null, expiresAt: "2025-03-01", active: true },
  { id: "c5", code: "SPRING25", discount: "10% Off", channelId: "all", storeId: "all", uses: 12, maxUses: 100, expiresAt: "2025-04-15", active: true },
];

const DEFAULT_LINKS: TrackedLink[] = [
  { id: "l1", label: "Counter Standee – 33 S 52nd St", slug: "phl-01", source: "Counter QR", storeId: 1, scans: 228, clicks: 193, verified: 54 },
  { id: "l2", label: "Counter Standee – 4016 Lancaster", slug: "phl-02", source: "Counter QR", storeId: 2, scans: 180, clicks: 149, verified: 41 },
  { id: "l3", label: "Counter Standee – 4060 Lancaster", slug: "phl-03", source: "Counter QR", storeId: 3, scans: 139, clicks: 115, verified: 33 },
  { id: "l4", label: "SMS Invite – 33 S 52nd St", slug: "phl-01", source: "SMS", storeId: 1, scans: 84, clicks: 71, verified: 22 },
  { id: "l5", label: "IG Bio Link – smartfonedoctor.philly", slug: "phl-01", source: "IG Bio", storeId: 1, scans: 47, clicks: 39, verified: 16 },
];

async function syncGmbReviewCounts(reviews: AdminReview[]): Promise<void> {
  for (const storeId of [1, 2, 3]) {
    const storeCode = STORE_ID_TO_GMB_CODE[storeId];
    const storeRevs = reviews.filter((r) => r.storeId === storeId);
    const unrepliedReviews = storeRevs.filter((r) => !r.reply).length;
    await prisma.gmbProfile
      .updateMany({
        where: { storeCode },
        data: { unrepliedReviews },
      })
      .catch(() => {});
  }
}

async function loadOrSeedReviewsHub(): Promise<ReviewsHubPayload> {
  const row = await prisma.taxonomyStore.findUnique({
    where: { id: REVIEWS_HUB_KEY },
  });
  if (row && row.data && typeof row.data === "object") {
    const raw = row.data as unknown as Partial<ReviewsHubPayload>;
    if (Array.isArray(raw.reviews)) {
      return {
        reviews: raw.reviews,
        sentSmsLeadIds: Array.isArray(raw.sentSmsLeadIds) ? raw.sentSmsLeadIds : [],
      };
    }
  }

  const initial: ReviewsHubPayload = {
    reviews: DEFAULT_REVIEWS,
    sentSmsLeadIds: [],
  };
  await prisma.taxonomyStore.upsert({
    where: { id: REVIEWS_HUB_KEY },
    update: { data: initial as unknown as Prisma.InputJsonValue },
    create: {
      id: REVIEWS_HUB_KEY,
      data: initial as unknown as Prisma.InputJsonValue,
    },
  });
  await syncGmbReviewCounts(initial.reviews);
  return initial;
}

async function saveReviewsHub(payload: ReviewsHubPayload): Promise<void> {
  await prisma.taxonomyStore.upsert({
    where: { id: REVIEWS_HUB_KEY },
    update: { data: payload as unknown as Prisma.InputJsonValue },
    create: {
      id: REVIEWS_HUB_KEY,
      data: payload as unknown as Prisma.InputJsonValue,
    },
  });
}

async function loadOrSeedQrTrackingFromDb(): Promise<QrTrackingState> {
  const row = await prisma.taxonomyStore.findUnique({
    where: { id: QR_TRACKING_KEY },
  });
  if (row && row.data && typeof row.data === "object") {
    const parsed = row.data as unknown as Partial<QrTrackingState>;
    if (parsed.byStore) {
      return {
        byStore: parsed.byStore,
        events: Array.isArray(parsed.events) ? parsed.events : DEFAULT_QR_EVENTS,
        coupons: Array.isArray(parsed.coupons) ? parsed.coupons : DEFAULT_COUPONS,
        links: Array.isArray(parsed.links) ? parsed.links : DEFAULT_LINKS,
      };
    }
  }

  const initial: QrTrackingState = {
    byStore: DEFAULT_STORE_QR_ANALYTICS,
    events: DEFAULT_QR_EVENTS,
    coupons: DEFAULT_COUPONS,
    links: DEFAULT_LINKS,
  };
  await prisma.taxonomyStore.upsert({
    where: { id: QR_TRACKING_KEY },
    update: { data: initial as unknown as Prisma.InputJsonValue },
    create: {
      id: QR_TRACKING_KEY,
      data: initial as unknown as Prisma.InputJsonValue,
    },
  });
  return initial;
}

async function saveQrTrackingToDb(state: QrTrackingState): Promise<void> {
  await prisma.taxonomyStore.upsert({
    where: { id: QR_TRACKING_KEY },
    update: { data: state as unknown as Prisma.InputJsonValue },
    create: {
      id: QR_TRACKING_KEY,
      data: state as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function getReviewsHubAction(): Promise<{
  success: boolean;
  reviews: AdminReview[];
  smsQueue: SmsCandidate[];
  error?: string;
}> {
  try {
    await requireAdmin();
    const [hub, leads] = await Promise.all([
      loadOrSeedReviewsHub(),
      prisma.lead.findMany({
        orderBy: { created_at: "desc" },
        take: 30,
      }),
    ]);

    const platforms: ReviewPlatform[] = ["Google", "Google", "Yelp", "Trustpilot"];
    const smsQueue: SmsCandidate[] = leads.map((lead, idx) => {
      const storeId = mapLeadStoreToId(lead.store);
      const id = `lead-${lead.id}`;
      return {
        id,
        customer: lead.customer_name,
        phone: lead.phone,
        device: `${lead.device} — ${lead.issue}`,
        storeId,
        completedAgo: formatRelativeDate(lead.created_at),
        recommendedPlatform: platforms[idx % platforms.length],
        reason: STORE_REASON[storeId] || "Google Maps local ranking",
        sent: hub.sentSmsLeadIds.includes(id),
      };
    });

    return { success: true, reviews: hub.reviews, smsQueue };
  } catch (err) {
    console.error("[getReviewsHubAction] Error:", err);
    return {
      success: false,
      reviews: [],
      smsQueue: [],
      error: err instanceof Error ? err.message : "Failed to load reviews",
    };
  }
}

export async function replyToReviewAction(
  id: number,
  replyText: string
): Promise<{ success: boolean; pushedLiveToGoogle?: boolean; error?: string }> {
  try {
    await requireAdmin();
    const text = replyText.trim();
    if (!text) return { success: false, error: "Reply text is required" };

    const hub = await loadOrSeedReviewsHub();
    const targetReview = hub.reviews.find((r) => r.id === id);
    const today = new Date().toISOString().slice(0, 10);
    hub.reviews = hub.reviews.map((r) =>
      r.id === id ? { ...r, reply: { text, date: today } } : r
    );
    await saveReviewsHub(hub);

    await prisma.reviews
      .updateMany({
        where: { id },
        data: { staff_response: text, updated_at: new Date() },
      })
      .catch(() => {});

    let pushedLiveToGoogle = false;
    if (targetReview?.platform === "Google" && targetReview.externalReviewName) {
      const gbpConn = await prisma.apiConnector
        .findUnique({ where: { id: "google-gbp" } })
        .catch(() => null);
      const tokenRes = await resolveValidGbpAccessToken(
        gbpConn?.apiKeyEncrypted,
        gbpConn?.apiSecretEncrypted
      );
      if (tokenRes.accessToken) {
        const pushRes = await publishGbpReviewReplyLive({
          accessToken: tokenRes.accessToken,
          externalReviewName: targetReview.externalReviewName,
          comment: text,
          refreshToken: gbpConn?.apiSecretEncrypted,
        });
        pushedLiveToGoogle = pushRes.pushedLive;
        const newestToken = pushRes.rotatedAccessToken || (tokenRes.refreshed ? tokenRes.accessToken : undefined);
        if (newestToken && gbpConn) {
          await prisma.apiConnector
            .update({
              where: { id: "google-gbp" },
              data: { apiKeyEncrypted: newestToken, connected: true },
            })
            .catch(() => {});
        }
      }
    }

    await syncGmbReviewCounts(hub.reviews);
    revalidatePath("/admin/reviews");
    revalidatePath("/admin/local-seo");
    return { success: true, pushedLiveToGoogle };
  } catch (err) {
    console.error("[replyToReviewAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to save reply" };
  }
}

export async function bulkReplyReviewsAction(
  replies: { id: number; text: string }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (!replies.length) return { success: true };

    const hub = await loadOrSeedReviewsHub();
    const today = new Date().toISOString().slice(0, 10);
    const replyMap = new Map(replies.map((item) => [item.id, item.text.trim()]));

    hub.reviews = hub.reviews.map((r) => {
      const txt = replyMap.get(r.id);
      return txt ? { ...r, reply: { text: txt, date: today } } : r;
    });
    await saveReviewsHub(hub);

    for (const item of replies) {
      if (!item.text.trim()) continue;
      await prisma.reviews
        .updateMany({
          where: { id: item.id },
          data: { staff_response: item.text.trim(), updated_at: new Date() },
        })
        .catch(() => {});
    }

    await syncGmbReviewCounts(hub.reviews);
    revalidatePath("/admin/reviews");
    revalidatePath("/admin/local-seo");
    return { success: true };
  } catch (err) {
    console.error("[bulkReplyReviewsAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Bulk reply failed" };
  }
}

export async function toggleReviewFeaturedAction(
  id: number
): Promise<{ success: boolean; featuredOnSite?: boolean; error?: string }> {
  try {
    await requireAdmin();
    const hub = await loadOrSeedReviewsHub();
    let nextFeatured = false;
    hub.reviews = hub.reviews.map((r) => {
      if (r.id !== id) return r;
      nextFeatured = !r.featuredOnSite;
      return { ...r, featuredOnSite: nextFeatured };
    });
    await saveReviewsHub(hub);

    await prisma.reviews
      .updateMany({
        where: { id },
        data: { published: nextFeatured, updated_at: new Date() },
      })
      .catch(() => {});

    revalidatePath("/admin/reviews");
    revalidatePath("/review");
    revalidatePath("/");
    return { success: true, featuredOnSite: nextFeatured };
  } catch (err) {
    console.error("[toggleReviewFeaturedAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to toggle feature" };
  }
}

export async function createReviewAction(
  input: Omit<AdminReview, "id">
): Promise<{ success: boolean; review?: AdminReview; error?: string }> {
  try {
    await requireAdmin();
    const hub = await loadOrSeedReviewsHub();
    const created = await prisma.reviews.create({
      data: {
        customer_name: input.reviewer.trim(),
        rating: new Prisma.Decimal(input.rating),
        review_text: input.text.trim(),
        store: STORE_ID_TO_REVIEW_ENUM[input.storeId] || enum_reviews_store.nd_st,
        source: mapPlatformToReviewSource(input.platform),
        published: Boolean(input.featuredOnSite),
        staff_response: input.reply?.text || null,
      },
    });

    const maxId = hub.reviews.reduce((m, r) => Math.max(m, r.id), 0);
    const nextId = hub.reviews.some((r) => r.id === created.id)
      ? maxId + 1
      : created.id;

    const newReview: AdminReview = {
      ...input,
      id: nextId,
      reviewer: input.reviewer.trim(),
      text: input.text.trim(),
    };
    hub.reviews = [newReview, ...hub.reviews];
    await saveReviewsHub(hub);
    await syncGmbReviewCounts(hub.reviews);

    const storeCode = STORE_ID_TO_GMB_CODE[input.storeId] || "nd_st";
    await prisma.gmbProfile
      .updateMany({
        where: { storeCode },
        data: { reviewsCount: { increment: 1 } },
      })
      .catch(() => {});

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/local-seo");
    revalidatePath("/review");
    revalidatePath("/");
    return { success: true, review: newReview };
  } catch (err) {
    console.error("[createReviewAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create review" };
  }
}

export async function deleteReviewAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const hub = await loadOrSeedReviewsHub();
    const target = hub.reviews.find((r) => r.id === id);
    hub.reviews = hub.reviews.filter((r) => r.id !== id);
    await saveReviewsHub(hub);

    await prisma.reviews.deleteMany({ where: { id } }).catch(() => {});
    await syncGmbReviewCounts(hub.reviews);

    if (target) {
      const storeCode = STORE_ID_TO_GMB_CODE[target.storeId] || "nd_st";
      const profile = await prisma.gmbProfile.findUnique({ where: { storeCode } }).catch(() => null);
      if (profile && profile.reviewsCount > 0) {
        await prisma.gmbProfile
          .update({
            where: { storeCode },
            data: { reviewsCount: profile.reviewsCount - 1 },
          })
          .catch(() => {});
      }
    }

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/local-seo");
    revalidatePath("/review");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("[deleteReviewAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete review" };
  }
}

export async function markReviewSmsSentAction(
  leadIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    const hub = await loadOrSeedReviewsHub();
    const merged = new Set([...hub.sentSmsLeadIds, ...leadIds]);
    hub.sentSmsLeadIds = Array.from(merged);
    await saveReviewsHub(hub);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (err) {
    console.error("[markReviewSmsSentAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to mark SMS sent" };
  }
}

export async function syncLiveExternalReviewsAction(): Promise<{
  success: boolean;
  needsApiKey?: boolean;
  reviews?: AdminReview[];
  smsQueue?: SmsCandidate[];
  message: string;
}> {
  try {
    await requireAdmin();
    const [googleConn, yelpConn] = await Promise.all([
      prisma.apiConnector.findUnique({ where: { id: "google-gbp" } }),
      prisma.apiConnector.findUnique({ where: { id: "yelp-fusion" } }),
    ]);

    const rawGoogleKey =
      googleConn?.apiKeyEncrypted ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_PLACES_API_KEY;
    const rawYelpKey = yelpConn?.apiKeyEncrypted || process.env.YELP_API_KEY;

    const googleKey = rawGoogleKey && !rawGoogleKey.includes("••") ? rawGoogleKey : undefined;
    const yelpKey = rawYelpKey && !rawYelpKey.includes("••") ? rawYelpKey : undefined;

    if (!googleKey && !yelpKey) {
      return {
        success: false,
        needsApiKey: true,
        message:
          "No Google Places or Yelp Fusion API key configured yet. Add your API key in Directory Listings → API & Auto-Sync (or .env) to pull live external reviews.",
      };
    }

    let totalAdded = 0;
    const warnings: string[] = [];
    if (googleKey) {
      const gRes = await triggerApiPullAction("google-gbp");
      if (gRes.newReviewsAdded) totalAdded += gRes.newReviewsAdded;
      if (gRes.warningMessage) warnings.push(`Google: ${gRes.warningMessage}`);
    }
    if (yelpKey) {
      const yRes = await triggerApiPullAction("yelp-fusion");
      if (yRes.newReviewsAdded) totalAdded += yRes.newReviewsAdded;
      if (yRes.warningMessage) warnings.push(`Yelp: ${yRes.warningMessage}`);
    }

    const fresh = await getReviewsHubAction();
    return {
      success: true,
      reviews: fresh.reviews,
      smsQueue: fresh.smsQueue,
      message:
        warnings.length > 0
          ? `Sync finished with warnings (${warnings.join(" | ")}). Added ${totalAdded} new reviews.`
          : `Synced live external APIs. Imported ${totalAdded} new customer review(s).`,
    };
  } catch (err) {
    console.error("[syncLiveExternalReviewsAction] Error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to sync external reviews",
    };
  }
}

export async function sendReviewInviteSmsAction(leadId: string): Promise<{
  success: boolean;
  sentLiveViaTwilio: boolean;
  smsUri: string;
  message: string;
}> {
  try {
    await requireAdmin();
    const numericId = Number(leadId.replace(/^lead-/, ""));
    const lead = Number.isFinite(numericId)
      ? await prisma.lead.findUnique({ where: { id: numericId } })
      : null;

    const storeId = lead ? mapLeadStoreToId(lead.store) : 1;
    const storeAddr = PHILLY_STORES[storeId]?.address || "33 S 52nd St, Philadelphia, PA 19139";
    const firstName = (lead?.customer_name || "there").split(" ")[0];
    const smsBody = `Hi ${firstName}, thank you for choosing SmartFoneDoctor (${storeAddr}) for your ${
      lead?.device || "device"
    } repair! We'd love your feedback: https://smartfonedoctor.com/review/phl-0${storeId}`;
    const cleanPhone = (lead?.phone || "").replace(/[^+\d]/g, "");
    const smsUri = `sms:${cleanPhone}?&body=${encodeURIComponent(smsBody)}`;

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    let sentLiveViaTwilio = false;
    let message =
      "Marked review invite sent (add TWILIO_* env vars to send automatically, or use 'Open SMS app').";

    if (sid && token && fromNumber && cleanPhone) {
      const smsRes = await sendTwilioSmsLive({
        to: cleanPhone,
        body: smsBody,
        accountSid: sid,
        authToken: token,
        fromNumber,
      });
      if (smsRes.sentLive) {
        sentLiveViaTwilio = true;
        message = `Live SMS dispatched to ${lead?.customer_name || cleanPhone} via Twilio (SID: ${
          smsRes.sid || "sent"
        }).`;
      } else {
        message = `Twilio send failed (${smsRes.error}); marked queued locally—you can use 'Open SMS app'.`;
      }
    }

    const hub = await loadOrSeedReviewsHub();
    const merged = new Set([...hub.sentSmsLeadIds, leadId]);
    hub.sentSmsLeadIds = Array.from(merged);
    await saveReviewsHub(hub);
    revalidatePath("/admin/reviews");

    return { success: true, sentLiveViaTwilio, smsUri, message };
  } catch (err) {
    console.error("[sendReviewInviteSmsAction] Error:", err);
    return {
      success: false,
      sentLiveViaTwilio: false,
      smsUri: "",
      message: err instanceof Error ? err.message : "Failed to send SMS invite",
    };
  }
}

export async function getQrTrackingStateAction(): Promise<{
  success: boolean;
  state: QrTrackingState | null;
  error?: string;
}> {
  try {
    const state = await loadOrSeedQrTrackingFromDb();
    return { success: true, state };
  } catch (err) {
    console.error("[getQrTrackingStateAction] Error:", err);
    return {
      success: false,
      state: null,
      error: err instanceof Error ? err.message : "Failed to load QR tracking",
    };
  }
}

export type PublicQrEventInput =
  | {
      type: "scan";
      storeId: number;
      deviceOs: "iOS (iPhone)" | "Android";
      source: "Counter QR Standee" | "SMS Invite Link" | "Receipt QR";
    }
  | {
      type: "channel_click";
      storeId: number;
      channelId: TrackingChannelId;
      verifiedConversion?: boolean;
      perkOrNote?: string;
    }
  | {
      type: "shield_intercept";
      storeId: number;
      rating: number;
      feedbackNote: string;
      message?: string;
    };

export async function recordQrEventAction(event: PublicQrEventInput): Promise<{
  success: boolean;
  state?: QrTrackingState;
  error?: string;
}> {
  try {
    const state = await loadOrSeedQrTrackingFromDb();
    const sid = event.storeId;
    const target = state.byStore[sid] ?? state.byStore[1];
    if (!target) {
      return { success: false, error: "Store QR analytics missing" };
    }

    if (event.type === "scan") {
      state.byStore = {
        ...state.byStore,
        [sid]: {
          ...target,
          totalScans: target.totalScans + 1,
          iosScans: event.deviceOs === "iOS (iPhone)" ? target.iosScans + 1 : target.iosScans,
          androidScans: event.deviceOs === "Android" ? target.androidScans + 1 : target.androidScans,
          counterQrScans:
            event.source === "Counter QR Standee"
              ? target.counterQrScans + 1
              : target.counterQrScans,
          smsLinkClicks:
            event.source === "SMS Invite Link"
              ? target.smsLinkClicks + 1
              : target.smsLinkClicks,
        },
      };
    } else if (event.type === "channel_click") {
      const ch = target.channels[event.channelId];
      if (ch) {
        const verified = Boolean(event.verifiedConversion);
        const isSocial = ch.category === "Social Follow";
        const newEvent: QrScanEvent = {
          id: `ev-${Date.now()}`,
          storeId: sid,
          timestamp: "Just now",
          deviceOs: "iOS (iPhone)",
          source: "Counter QR Standee",
          channelId: event.channelId,
          channelLabel: `${ch.label} (${ch.handleOrTarget})`,
          outcome: verified
            ? isSocial
              ? "Verified Follow (Perk Unlocked)"
              : "Verified Review Posted"
            : "Review Redirect Clicked",
          customerHandleOrCode:
            event.perkOrNote || (verified ? `Perk: PHL${sid}-VIP5` : "Outbound Click"),
        };

        state.byStore = {
          ...state.byStore,
          [sid]: {
            ...target,
            channels: {
              ...target.channels,
              [event.channelId]: {
                ...ch,
                clicks: ch.clicks + 1,
                verifiedConversions: verified
                  ? ch.verifiedConversions + 1
                  : ch.verifiedConversions,
              },
            },
          },
        };
        state.events = [newEvent, ...state.events].slice(0, 20);
      }
    } else if (event.type === "shield_intercept") {
      const newEvent: QrScanEvent = {
        id: `ev-${Date.now()}`,
        storeId: sid,
        timestamp: "Just now",
        deviceOs: "iOS (iPhone)",
        source: "Counter QR Standee",
        channelId: "shield-intercept",
        channelLabel: `Private Feedback Shield (${event.rating}★ Intercepted)`,
        outcome: "Private Shield Intercepted (1-3★)",
        customerHandleOrCode: event.feedbackNote || "Manager SMS Alert Sent",
      };
      state.byStore = {
        ...state.byStore,
        [sid]: {
          ...target,
          shieldIntercepts: target.shieldIntercepts + 1,
        },
      };
      state.events = [newEvent, ...state.events].slice(0, 20);

      // Append intercepted 1-3 star feedback into Reviews Hub & prisma.reviews
      const hub = await loadOrSeedReviewsHub();
      const reviewText =
        event.message?.trim() ||
        "Customer requested store manager follow-up via Counter QR Shield.";
      const reviewerLabel =
        event.feedbackNote && !event.feedbackNote.includes("Manager Recovery Requested")
          ? `Customer (${event.feedbackNote})`
          : "In-Store QR Customer";

      const created = await prisma.reviews.create({
        data: {
          customer_name: reviewerLabel,
          rating: new Prisma.Decimal(event.rating),
          review_text: reviewText,
          store: STORE_ID_TO_REVIEW_ENUM[sid] || enum_reviews_store.nd_st,
          source: enum_reviews_source.qr_code,
          published: false,
          staff_response: null,
        },
      });
      const maxId = hub.reviews.reduce((m, r) => Math.max(m, r.id), 0);
      const nextId = hub.reviews.some((r) => r.id === created.id) ? maxId + 1 : created.id;

      hub.reviews = [
        {
          id: nextId,
          reviewer: reviewerLabel,
          deviceService: "Counter QR Check-in",
          topicTag: "Private Shield Escalation",
          rating: event.rating,
          date: new Date().toISOString().slice(0, 10),
          text: reviewText,
          storeId: sid,
          platform: "Google",
          featuredOnSite: false,
        },
        ...hub.reviews,
      ];
      await saveReviewsHub(hub);
      await syncGmbReviewCounts(hub.reviews);
      revalidatePath("/admin/reviews");
      revalidatePath("/admin/local-seo");
    }

    await saveQrTrackingToDb(state);
    revalidatePath("/admin/reviews");
    return { success: true, state };
  } catch (err) {
    console.error("[recordQrEventAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save QR event",
    };
  }
}

export async function addQrCouponAction(
  coupon: Omit<CouponCode, "id" | "uses">
): Promise<{ success: boolean; state?: QrTrackingState; error?: string }> {
  try {
    await requireAdmin();
    const state = await loadOrSeedQrTrackingFromDb();
    const newCoupon: CouponCode = {
      ...coupon,
      id: `c-${Date.now()}`,
      uses: 0,
    };
    state.coupons = [...state.coupons, newCoupon];
    await saveQrTrackingToDb(state);
    revalidatePath("/admin/reviews");
    return { success: true, state };
  } catch (err) {
    console.error("[addQrCouponAction] Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to add coupon" };
  }
}

export async function deactivateQrCouponAction(
  couponId: string
): Promise<{ success: boolean; state?: QrTrackingState; error?: string }> {
  try {
    await requireAdmin();
    const state = await loadOrSeedQrTrackingFromDb();
    state.coupons = state.coupons.map((c) =>
      c.id === couponId ? { ...c, active: false } : c
    );
    await saveQrTrackingToDb(state);
    revalidatePath("/admin/reviews");
    return { success: true, state };
  } catch (err) {
    console.error("[deactivateQrCouponAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to deactivate coupon",
    };
  }
}

export interface PublicFeaturedReview {
  id: number;
  author: string;
  location: string;
  device: string;
  rating: number;
  content: string;
  date: string;
  platform: ReviewPlatform;
  topicTag: string;
  storeId: number;
}

const PUBLIC_STORE_LOCATION_MAP: Record<number, string> = {
  1: "33 S 52nd St (Flagship)",
  2: "4016 Lancaster Ave",
  3: "4060 Lancaster Ave",
};

/** Public action: returns featured 4–5★ customer reviews marked featuredOnSite in PostgreSQL. */
export async function getPublicFeaturedReviewsAction(): Promise<PublicFeaturedReview[]> {
  try {
    const hub = await loadOrSeedReviewsHub();
    return hub.reviews
      .filter((r) => Boolean(r.featuredOnSite) && r.rating >= 4)
      .map((r) => ({
        id: r.id,
        author: r.reviewer,
        location: PUBLIC_STORE_LOCATION_MAP[r.storeId] || "Philadelphia, PA",
        device: r.deviceService || "Verified Repair",
        rating: r.rating,
        content: r.text,
        date: r.date,
        platform: r.platform,
        topicTag: r.topicTag || "Verified Customer",
        storeId: r.storeId,
      }));
  } catch (err) {
    console.error("[getPublicFeaturedReviewsAction] Error:", err);
    return [];
  }
}

export async function addQrTrackedLinkAction(
  link: Omit<TrackedLink, "id" | "scans" | "clicks" | "verified">
): Promise<{ success: boolean; state?: QrTrackingState; error?: string }> {
  try {
    await requireAdmin();
    const state = await loadOrSeedQrTrackingFromDb();
    const newLink: TrackedLink = {
      ...link,
      id: `l-${Date.now()}`,
      scans: 0,
      clicks: 0,
      verified: 0,
    };
    state.links = [...state.links, newLink];
    await saveQrTrackingToDb(state);
    revalidatePath("/admin/reviews");
    return { success: true, state };
  } catch (err) {
    console.error("[addQrTrackedLinkAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add tracked link",
    };
  }
}
