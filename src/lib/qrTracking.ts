"use client";

import { useState, useEffect, useCallback } from "react";

export type TrackingChannelId =
  | "gmb"
  | "apple"
  | "yelp"
  | "instagram"
  | "tiktok"
  | "facebook";

export interface ChannelMetric {
  id: TrackingChannelId;
  label: string;
  category: "Review Directory" | "Social Follow";
  handleOrTarget: string;
  destinationUrl: string;
  clicks: number;
  verifiedConversions: number; // Reviews posted or Follows verified via perk/API
  verificationMethod: string;
}

export interface QrScanEvent {
  id: string;
  storeId: number;
  timestamp: string;
  deviceOs: "iOS (iPhone)" | "Android";
  source: "Counter QR Standee" | "SMS Invite Link" | "Receipt QR";
  channelId: TrackingChannelId | "shield-intercept";
  channelLabel: string;
  outcome:
    | "Verified Follow (Perk Unlocked)"
    | "Review Redirect Clicked"
    | "Verified Review Posted"
    | "Private Shield Intercepted (1-3★)";
  customerHandleOrCode?: string;
}

export interface StoreQrAnalytics {
  storeId: number;
  slug: string;
  totalScans: number;
  iosScans: number;
  androidScans: number;
  counterQrScans: number;
  smsLinkClicks: number;
  shieldIntercepts: number;
  channels: Record<TrackingChannelId, ChannelMetric>;
}

const STORAGE_KEY = "sfd_qr_social_tracking_v1";

export const INITIAL_STORE_QR_ANALYTICS: Record<number, StoreQrAnalytics> = {
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
        handleOrTarget: "Smart Fone Doctor · 33 S 52nd St",
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
        handleOrTarget: "Smart Fone Doctor · 4016 Lancaster Ave",
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
        handleOrTarget: "Smart Fone Doctor · 4060 Lancaster Ave",
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

export const INITIAL_QR_EVENTS: QrScanEvent[] = [
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

// ─── Coupon / Discount Code ───────────────────────────────────────────────────
export interface CouponCode {
  id: string;
  code: string;             // e.g. "PHL1-INS5"
  discount: string;         // "$5 Off" | "Free Lens Wipe" | "10% Off"
  channelId: TrackingChannelId | "all";
  storeId: number | "all";
  uses: number;
  maxUses: number | null;
  expiresAt: string | null; // ISO date string "2025-03-01"
  active: boolean;
}

// ─── Tracked Link (custom slug / source tag) ─────────────────────────────────
export interface TrackedLink {
  id: string;
  label: string;             // "Counter Standee – 33 S 52nd St"
  slug: string;              // "phl-01"
  source: "Counter QR" | "SMS" | "IG Bio" | "TikTok Bio" | "Receipt QR";
  storeId: number;
  scans: number;
  clicks: number;
  verified: number;
}

// ─── Default seed data ────────────────────────────────────────────────────────
export const INITIAL_COUPONS: CouponCode[] = [
  { id: "c1", code: "PHL1-INS5",   discount: "$5 Off",         channelId: "instagram", storeId: 1, uses: 68,  maxUses: null, expiresAt: null,         active: true },
  { id: "c2", code: "PHL1-TT5",    discount: "$5 Off",         channelId: "tiktok",    storeId: 1, uses: 53,  maxUses: null, expiresAt: null,         active: true },
  { id: "c3", code: "PHL2-INS5",   discount: "$5 Off",         channelId: "instagram", storeId: 2, uses: 61,  maxUses: null, expiresAt: null,         active: true },
  { id: "c4", code: "PHL1-FB5",    discount: "Free Lens Wipe", channelId: "facebook",  storeId: 1, uses: 27,  maxUses: null, expiresAt: "2025-03-01", active: true },
  { id: "c5", code: "SPRING25",    discount: "10% Off",        channelId: "all",       storeId: "all", uses: 12, maxUses: 100, expiresAt: "2025-04-15", active: true },
];

export const INITIAL_LINKS: TrackedLink[] = [
  { id: "l1", label: "Counter Standee – 33 S 52nd St",     slug: "phl-01", source: "Counter QR",  storeId: 1, scans: 228, clicks: 193, verified: 54 },
  { id: "l2", label: "Counter Standee – 4016 Lancaster",   slug: "phl-02", source: "Counter QR",  storeId: 2, scans: 180, clicks: 149, verified: 41 },
  { id: "l3", label: "Counter Standee – 4060 Lancaster",   slug: "phl-03", source: "Counter QR",  storeId: 3, scans: 139, clicks: 115, verified: 33 },
  { id: "l4", label: "SMS Invite – 33 S 52nd St",          slug: "phl-01", source: "SMS",          storeId: 1, scans: 84,  clicks: 71,  verified: 22 },
  { id: "l5", label: "IG Bio Link – smartfonedoctor.philly", slug: "phl-01", source: "IG Bio",    storeId: 1, scans: 47,  clicks: 39,  verified: 16 },
];

interface StoredPayload {
  byStore: Record<number, StoreQrAnalytics>;
  events: QrScanEvent[];
  coupons: CouponCode[];
  links: TrackedLink[];
}

function loadState(): StoredPayload {
  if (typeof window === "undefined") {
    return {
      byStore: INITIAL_STORE_QR_ANALYTICS,
      events: INITIAL_QR_EVENTS,
      coupons: INITIAL_COUPONS,
      links: INITIAL_LINKS,
    };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        byStore: INITIAL_STORE_QR_ANALYTICS,
        events: INITIAL_QR_EVENTS,
        coupons: INITIAL_COUPONS,
        links: INITIAL_LINKS,
      };
    }
    const parsed = JSON.parse(raw) as StoredPayload;
    // backfill if older version had no coupons/links
    return {
      ...parsed,
      coupons: parsed.coupons ?? INITIAL_COUPONS,
      links: parsed.links ?? INITIAL_LINKS,
    };
  } catch {
    return {
      byStore: INITIAL_STORE_QR_ANALYTICS,
      events: INITIAL_QR_EVENTS,
      coupons: INITIAL_COUPONS,
      links: INITIAL_LINKS,
    };
  }
}

function saveState(payload: StoredPayload) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event("sfd-qr-tracking-updated"));
  } catch {
    // ignore storage quota errors
  }
}

export function useQrTracking() {
  const [data, setData] = useState<StoredPayload>(() => ({
    byStore: INITIAL_STORE_QR_ANALYTICS,
    events: INITIAL_QR_EVENTS,
    coupons: INITIAL_COUPONS,
    links: INITIAL_LINKS,
  }));

  useEffect(() => {
    setData(loadState());
    const sync = () => setData(loadState());
    window.addEventListener("storage", sync);
    window.addEventListener("sfd-qr-tracking-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("sfd-qr-tracking-updated", sync);
    };
  }, []);

  const recordQrScan = useCallback(
    (
      storeId: number,
      deviceOs: "iOS (iPhone)" | "Android" = "iOS (iPhone)",
      source: "Counter QR Standee" | "SMS Invite Link" | "Receipt QR" = "Counter QR Standee"
    ) => {
      const current = loadState();
      const target = current.byStore[storeId] ?? current.byStore[1];
      const updatedStore: StoreQrAnalytics = {
        ...target,
        totalScans: target.totalScans + 1,
        iosScans:
          deviceOs === "iOS (iPhone)" ? target.iosScans + 1 : target.iosScans,
        androidScans:
          deviceOs === "Android"
            ? target.androidScans + 1
            : target.androidScans,
        counterQrScans:
          source === "Counter QR Standee"
            ? target.counterQrScans + 1
            : target.counterQrScans,
        smsLinkClicks:
          source === "SMS Invite Link"
            ? target.smsLinkClicks + 1
            : target.smsLinkClicks,
      };
      const next: StoredPayload = {
        ...current,
        byStore: {
          ...current.byStore,
          [storeId]: updatedStore,
        },
      };
      saveState(next);
      setData(next);
    },
    []
  );

  const recordChannelClick = useCallback(
    (
      storeId: number,
      channelId: TrackingChannelId,
      verifiedConversion: boolean = false,
      perkOrNote?: string
    ) => {
      const current = loadState();
      const target = current.byStore[storeId] ?? current.byStore[1];
      const ch = target.channels[channelId];
      if (!ch) return;

      const updatedChannel: ChannelMetric = {
        ...ch,
        clicks: ch.clicks + 1,
        verifiedConversions: verifiedConversion
          ? ch.verifiedConversions + 1
          : ch.verifiedConversions,
      };

      const isSocial = ch.category === "Social Follow";
      const newEvent: QrScanEvent = {
        id: `ev-${Date.now()}`,
        storeId,
        timestamp: "Just now",
        deviceOs: channelId === "apple" ? "iOS (iPhone)" : "iOS (iPhone)",
        source: "Counter QR Standee",
        channelId,
        channelLabel: `${ch.label} (${ch.handleOrTarget})`,
        outcome: verifiedConversion
          ? isSocial
            ? "Verified Follow (Perk Unlocked)"
            : "Verified Review Posted"
          : "Review Redirect Clicked",
        customerHandleOrCode:
          perkOrNote ||
          (verifiedConversion ? `Perk: PHL${storeId}-VIP5` : "Outbound Click"),
      };

      const next: StoredPayload = {
        ...current,
        byStore: {
          ...current.byStore,
          [storeId]: {
            ...target,
            channels: {
              ...target.channels,
              [channelId]: updatedChannel,
            },
          },
        },
        events: [newEvent, ...current.events].slice(0, 20),
      };
      saveState(next);
      setData(next);
    },
    []
  );

  const recordShieldIntercept = useCallback(
    (storeId: number, rating: number, feedbackNote: string) => {
      const current = loadState();
      const target = current.byStore[storeId] ?? current.byStore[1];
      const newEvent: QrScanEvent = {
        id: `ev-${Date.now()}`,
        storeId,
        timestamp: "Just now",
        deviceOs: "iOS (iPhone)",
        source: "Counter QR Standee",
        channelId: "shield-intercept",
        channelLabel: `Private Feedback Shield (${rating}★ Intercepted)`,
        outcome: "Private Shield Intercepted (1-3★)",
        customerHandleOrCode: feedbackNote || "Manager SMS Alert Sent",
      };

      const next: StoredPayload = {
        ...current,
        byStore: {
          ...current.byStore,
          [storeId]: {
            ...target,
            shieldIntercepts: target.shieldIntercepts + 1,
          },
        },
        events: [newEvent, ...current.events].slice(0, 20),
      };
      saveState(next);
      setData(next);
    },
    []
  );

  // ─── Coupon management ──────────────────────────────────────────────────────
  const addCoupon = useCallback((coupon: Omit<CouponCode, "id" | "uses">) => {
    const current = loadState();
    const newCoupon: CouponCode = { ...coupon, id: `c-${Date.now()}`, uses: 0 };
    const next: StoredPayload = { ...current, coupons: [...current.coupons, newCoupon] };
    saveState(next);
    setData(next);
  }, []);

  const deactivateCoupon = useCallback((couponId: string) => {
    const current = loadState();
    const next: StoredPayload = {
      ...current,
      coupons: current.coupons.map((c) =>
        c.id === couponId ? { ...c, active: false } : c
      ),
    };
    saveState(next);
    setData(next);
  }, []);

  // ─── Link management ────────────────────────────────────────────────────────
  const addLink = useCallback((link: Omit<TrackedLink, "id" | "scans" | "clicks" | "verified">) => {
    const current = loadState();
    const newLink: TrackedLink = { ...link, id: `l-${Date.now()}`, scans: 0, clicks: 0, verified: 0 };
    const next: StoredPayload = { ...current, links: [...current.links, newLink] };
    saveState(next);
    setData(next);
  }, []);

  return {
    byStore: data.byStore,
    events: data.events,
    coupons: data.coupons,
    links: data.links,
    recordQrScan,
    recordChannelClick,
    recordShieldIntercept,
    addCoupon,
    deactivateCoupon,
    addLink,
  };
}

