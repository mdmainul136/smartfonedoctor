"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import { useQrTracking, TrackingChannelId } from "@/lib/qrTracking";
import type { CouponCode, TrackedLink } from "@/lib/qrTracking";
import {
  RealQrCodeSvg,
  ChannelBrandBadge,
} from "@/components/Dashboard/QrCodeSvg";
import {
  Star,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CornerDownRight,
  Send,
  QrCode,
  ShieldCheck,
  X,
  Globe,
  Activity,
} from "lucide-react";

type Platform = "Google" | "Yelp" | "Trustpilot" | "Facebook";
type WorkspaceTab = "inbox" | "campaigns" | "qr-tracking" | "sentiment";
type InboxFilter = "needs-reply" | "escalations" | "all" | "featured";
type ReplyTone = "seo-entity" | "manager-recovery" | "warranty-check";

interface Review {
  id: number;
  reviewer: string;
  deviceService: string;
  topicTag: string;
  rating: number;
  date: string;
  text: string;
  storeId: number;
  platform: Platform;
  featuredOnSite?: boolean;
  reply?: { text: string; date: string };
}

interface SmsCandidate {
  id: string;
  customer: string;
  phone: string;
  device: string;
  storeId: number;
  completedAgo: string;
  recommendedPlatform: Platform;
  reason: string;
  sent: boolean;
}

const REPLYABLE_VIA_API: Record<Platform, boolean> = {
  Google: true,
  Facebook: true,
  Trustpilot: true,
  Yelp: false,
};

const PLATFORM_URL: Record<Platform, string> = {
  Google: "https://business.google.com/reviews",
  Yelp: "https://biz.yelp.com",
  Trustpilot: "https://business.trustpilot.com",
  Facebook: "https://business.facebook.com",
};

const INITIAL_REVIEWS: Review[] = [
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

const INITIAL_SMS_QUEUE: SmsCandidate[] = [
  {
    id: "sms-1",
    customer: "Marcus Johnson",
    phone: "(215) 839-4412",
    device: "iPhone 15 Pro — OEM OLED Screen",
    storeId: 1,
    completedAgo: "22 mins ago",
    recommendedPlatform: "Google",
    reason: "Boosts West Philly Local Pack rank",
    sent: false,
  },
  {
    id: "sms-2",
    customer: "Priya Patel",
    phone: "(267) 410-9920",
    device: "Google Pixel 8 — USB-C Port",
    storeId: 1,
    completedAgo: "48 mins ago",
    recommendedPlatform: "Yelp",
    reason: "Balances Yelp rating for Perplexity AI",
    sent: false,
  },
  {
    id: "sms-3",
    customer: "Aliyah Thompson",
    phone: "(215) 902-3188",
    device: "Samsung Galaxy S23 — Battery Swap",
    storeId: 2,
    completedAgo: "1 hr ago",
    recommendedPlatform: "Trustpilot",
    reason: "Builds Trustpilot score for ChatGPT Search",
    sent: false,
  },
  {
    id: "sms-4",
    customer: "Maria Garcia",
    phone: "(267) 551-7804",
    device: "iPhone 14 — Back Glass Laser",
    storeId: 3,
    completedAgo: "2 hrs ago",
    recommendedPlatform: "Google",
    reason: "4060 Lancaster Ave needs +4 Google reviews",
    sent: false,
  },
];

function generateContextualReply(
  review: Review,
  storeAddress: string,
  tone: ReplyTone
): string {
  const first = review.reviewer.split(" ")[0];

  if (tone === "manager-recovery") {
    return `Hi ${first}, I'm truly sorry your visit for your ${review.deviceService} took longer than quoted. That is not the standard we set at Smart Fone Doctor (${storeAddress}). Please call or text our store manager directly at (215) 598-2090—we'd like to issue a $20 courtesy refund and priority VIP service on any future visit.`;
  }

  if (tone === "warranty-check") {
    return `Hi ${first}, thank you for letting us know about your ${review.deviceService}. Every repair at Smart Fone Doctor (${storeAddress}) is backed by our 90-day parts and labor warranty. Please bring your device back in at your convenience—no appointment needed—and our lead technician will replace the part free of charge in under 25 minutes.`;
  }

  if (review.rating <= 2) {
    return `Hi ${first}, we apologize that your ${review.deviceService} visit at ${storeAddress} didn't meet expectations. Every repair includes our 90-day warranty—please stop by or call (215) 598-2090 so our manager can make this right immediately.`;
  }

  return `Thank you, ${first}! We're glad our technicians at Smart Fone Doctor (${storeAddress}) could complete your same-day ${review.deviceService} repair quickly. Remember all repairs include our 90-day warranty—see you next time in Philadelphia!`;
}

function Stars({
  rating,
  size = "w-3.5 h-3.5",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={`${size} ${
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-[#e5e7eb] text-[#e5e7eb]"
          }`}
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } =
    useStoreContext();
  const { byStore, events, coupons, links, recordQrScan, recordChannelClick, addCoupon, deactivateCoupon, addLink } = useQrTracking();

  const storeShortName = isAllStores
    ? "All 3 Philly stores"
    : selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("inbox");
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [smsQueue, setSmsQueue] = useState<SmsCandidate[]>(INITIAL_SMS_QUEUE);
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("needs-reply");
  const [platformFilter, setPlatformFilter] = useState<Platform | "All">("All");
  const [replyingId, setReplyingId] = useState<number | null>(2);
  const [replyTone, setReplyTone] = useState<ReplyTone>("seo-entity");
  const [draft, setDraft] = useState<string>(() =>
    generateContextualReply(
      INITIAL_REVIEWS[1],
      "33 S 52nd St",
      "manager-recovery"
    )
  );
  const [copied, setCopied] = useState(false);
  const [shieldEnabled, setShieldEnabled] = useState(true);
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);

  // ── QR Tab: Coupon form state ──────────────────────────────────────────────
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("$5 Off");
  const [newCouponChannel, setNewCouponChannel] = useState<TrackingChannelId | "all">("all");
  const [newCouponExpiry, setNewCouponExpiry] = useState("");

  // ── QR Tab: Link form state ───────────────────────────────────────────────
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [newLinkSource, setNewLinkSource] = useState<TrackedLink["source"]>("Counter QR");

  const handleAddCoupon = () => {
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discount: newCouponDiscount,
      channelId: newCouponChannel,
      storeId: isAllStores ? "all" : selectedStoreId,
      maxUses: null,
      expiresAt: newCouponExpiry || null,
      active: true,
    });
    setNewCouponCode("");
    setNewCouponExpiry("");
    setShowCouponForm(false);
    setNoticeBanner("Coupon code created and activated.");
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim()) return;
    const storeId = isAllStores ? 1 : selectedStoreId;
    const slug = `phl-0${storeId}`;
    addLink({ label: newLinkLabel.trim(), slug, source: newLinkSource, storeId });
    setNewLinkLabel("");
    setShowLinkForm(false);
    setNoticeBanner("Tracked link added.");
  };

  const storeAddressFor = (storeId: number) =>
    stores.find((s) => s.id === storeId)?.address ?? selectedStore.address;

  const storeReviews = useMemo(
    () =>
      isAllStores
        ? reviews
        : reviews.filter((r) => r.storeId === selectedStoreId),
    [reviews, isAllStores, selectedStoreId]
  );

  const stats = useMemo(() => {
    const total = storeReviews.length;
    const avg = total
      ? storeReviews.reduce((s, r) => s + r.rating, 0) / total
      : 0;
    const replied = storeReviews.filter((r) => r.reply).length;
    const escalations = storeReviews.filter(
      (r) => r.rating <= 2 && !r.reply
    ).length;
    const featured = storeReviews.filter((r) => r.featuredOnSite).length;
    const positiveUnreplied = storeReviews.filter(
      (r) => r.rating >= 4 && !r.reply && REPLYABLE_VIA_API[r.platform]
    ).length;

    return {
      total,
      avg,
      needsReply: total - replied,
      responseRate: total ? Math.round((replied / total) * 100) : 0,
      escalations,
      featured,
      positiveUnreplied,
    };
  }, [storeReviews]);

  // Aggregate QR & Social Flow Analytics for selectedStoreId or All 3 Stores
  const qrSummary = useMemo(() => {
    const targetIds = isAllStores ? [1, 2, 3] : [selectedStoreId];
    const channelOrder: TrackingChannelId[] = [
      "gmb",
      "apple",
      "yelp",
      "instagram",
      "tiktok",
      "facebook",
    ];

    let totalScans = 0;
    let iosScans = 0;
    let androidScans = 0;
    let counterQrScans = 0;
    let smsLinkClicks = 0;
    let shieldIntercepts = 0;

    const aggregatedChannels = channelOrder.map((cid) => {
      const base = byStore[1].channels[cid];
      let clicks = 0;
      let verifiedConversions = 0;
      targetIds.forEach((sid) => {
        const st = byStore[sid];
        if (st && st.channels[cid]) {
          clicks += st.channels[cid].clicks;
          verifiedConversions += st.channels[cid].verifiedConversions;
        }
      });
      return {
        ...base,
        clicks,
        verifiedConversions,
        convRate: clicks > 0 ? Math.round((verifiedConversions / clicks) * 100) : 0,
      };
    });

    targetIds.forEach((sid) => {
      const st = byStore[sid];
      if (st) {
        totalScans += st.totalScans;
        iosScans += st.iosScans;
        androidScans += st.androidScans;
        counterQrScans += st.counterQrScans;
        smsLinkClicks += st.smsLinkClicks;
        shieldIntercepts += st.shieldIntercepts;
      }
    });

    const directoryChannels = aggregatedChannels.filter(
      (c) => c.category === "Review Directory"
    );
    const socialChannels = aggregatedChannels.filter(
      (c) => c.category === "Social Follow"
    );

    const directoryClicks = directoryChannels.reduce((s, c) => s + c.clicks, 0);
    const directoryVerified = directoryChannels.reduce(
      (s, c) => s + c.verifiedConversions,
      0
    );
    const socialClicks = socialChannels.reduce((s, c) => s + c.clicks, 0);
    const socialVerified = socialChannels.reduce(
      (s, c) => s + c.verifiedConversions,
      0
    );

    const scopedEvents = isAllStores
      ? events
      : events.filter((e) => e.storeId === selectedStoreId);

    return {
      totalScans,
      iosScans,
      androidScans,
      iosPct: totalScans ? Math.round((iosScans / totalScans) * 100) : 68,
      counterQrScans,
      smsLinkClicks,
      shieldIntercepts,
      directoryChannels,
      socialChannels,
      directoryClicks,
      directoryVerified,
      socialClicks,
      socialVerified,
      scopedEvents,
    };
  }, [byStore, events, isAllStores, selectedStoreId]);

  const visibleReviews = useMemo(() => {
    const list = storeReviews.filter((r) => {
      if (platformFilter !== "All" && r.platform !== platformFilter)
        return false;
      if (inboxFilter === "needs-reply") return !r.reply;
      if (inboxFilter === "escalations") return r.rating <= 2;
      if (inboxFilter === "featured") return !!r.featuredOnSite;
      return true;
    });
    return [...list].sort((a, b) =>
      inboxFilter === "needs-reply"
        ? a.rating - b.rating || b.date.localeCompare(a.date)
        : b.date.localeCompare(a.date)
    );
  }, [storeReviews, inboxFilter, platformFilter]);

  const visibleSmsQueue = useMemo(
    () =>
      isAllStores
        ? smsQueue
        : smsQueue.filter((item) => item.storeId === selectedStoreId),
    [smsQueue, isAllStores, selectedStoreId]
  );

  const openReplyComposer = (review: Review) => {
    const defaultTone: ReplyTone =
      review.rating <= 2 ? "manager-recovery" : "seo-entity";
    setReplyingId(review.id);
    setReplyTone(defaultTone);
    setDraft(
      review.reply?.text ??
        generateContextualReply(
          review,
          storeAddressFor(review.storeId),
          defaultTone
        )
    );
    setCopied(false);
  };

  const handleToneChange = (review: Review, tone: ReplyTone) => {
    setReplyTone(tone);
    setDraft(
      generateContextualReply(review, storeAddressFor(review.storeId), tone)
    );
  };

  const publishReply = (id: number) => {
    const text = draft.trim();
    if (!text) return;
    const today = new Date().toISOString().slice(0, 10);
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, reply: { text, date: today } } : r))
    );
    setReplyingId(null);
    setDraft("");
    setNoticeBanner(
      "Reply published and synced to the review platform."
    );
  };

  const handleAutoReplyAllPositive = () => {
    const today = new Date().toISOString().slice(0, 10);
    let count = 0;
    setReviews((prev) =>
      prev.map((r) => {
        const inScope = isAllStores || r.storeId === selectedStoreId;
        if (
          inScope &&
          !r.reply &&
          r.rating >= 4 &&
          REPLYABLE_VIA_API[r.platform]
        ) {
          count += 1;
          return {
            ...r,
            reply: {
              text: generateContextualReply(
                r,
                storeAddressFor(r.storeId),
                "seo-entity"
              ),
              date: today,
            },
          };
        }
        return r;
      })
    );
    setNoticeBanner(
      `AI Agent auto-replied to ${count} positive (4★–5★) reviews with Philadelphia neighborhood & service keywords.`
    );
  };

  const toggleFeaturedOnSite = (id: number) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, featuredOnSite: !r.featuredOnSite } : r
      )
    );
  };

  const handleSendSms = (id: string) => {
    setSmsQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, sent: true } : item))
    );
    setNoticeBanner(
      "Review invite SMS sent with Smart Platform Routing and Negative Feedback Shield."
    );
  };

  const handleSendAllSms = () => {
    setSmsQueue((prev) => prev.map((item) => ({ ...item, sent: true })));
    setNoticeBanner(
      "Sent review invites to all recently completed repair customers."
    );
  };

  const handleSimulateLiveQrFlow = (channel: TrackingChannelId) => {
    recordQrScan(selectedStoreId, "iOS (iPhone)", "Counter QR Standee");
    recordChannelClick(
      selectedStoreId,
      channel,
      true,
      `Perk: PHL${selectedStoreId}-${channel.toUpperCase().slice(0, 3)}5`
    );
    setNoticeBanner(
      `Simulated live Counter QR scan + verified ${channel.toUpperCase()} action at ${
        selectedStore.address
      }.`
    );
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. HEADER & CLEAN TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-semibold text-[#111111] tracking-tight">
                Reviews &amp; reputation
              </h1>
              <span className="text-[12px] text-[#5f6368] font-normal">
                · {storeShortName}
              </span>
            </div>
            <p className="text-[13px] text-[#5f6368] mt-0.5">
              Customer feedback, in-store QR links, and promo tracking
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/review/phl-0${selectedStore.id}`}
              target="_blank"
              className="h-[30px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#5f6368]" aria-hidden="true" />
              <span>Customer Standee</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setWorkspaceTab("qr-tracking");
                setShowCouponForm(true);
              }}
              className="h-[30px] px-3 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>+ Create code</span>
            </button>
          </div>
        </div>

        {/* Minimal Tab Navigation */}
        <nav
          aria-label="Reviews workspace tabs"
          className="flex items-center gap-6 border-b border-[#e5e7eb]"
        >
          {[
            {
              key: "inbox" as WorkspaceTab,
              label: "Reviews",
              count: stats.needsReply,
            },
            {
              key: "campaigns" as WorkspaceTab,
              label: "SMS Invites",
              count: visibleSmsQueue.filter((i) => !i.sent).length,
            },
            {
              key: "qr-tracking" as WorkspaceTab,
              label: "QR & Tracking",
            },
            {
              key: "sentiment" as WorkspaceTab,
              label: "Insights",
            },
          ].map((t) => {
            const active = workspaceTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setWorkspaceTab(t.key)}
                className={`py-2 text-[13px] border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? "border-[#111111] text-[#111111] font-semibold"
                    : "border-transparent text-[#5f6368] hover:text-[#111111]"
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[#f3f4f6] text-[#5f6368]">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {noticeBanner && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-[6px] px-3.5 py-2 flex items-center justify-between gap-3 text-[12px]"
        >
          <span>{noticeBanner}</span>
          <button
            type="button"
            onClick={() => setNoticeBanner(null)}
            aria-label="Dismiss notice"
            className="p-0.5 hover:opacity-75 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 2. SIMPLE, CLEAN KPI STRIP (No fake progress bars, no neon pills) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Average rating</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[22px] font-semibold text-[#111111] tabular-nums leading-none">
              {stats.avg.toFixed(1)}
            </span>
            <span className="text-amber-500 text-[13px]">★</span>
            <span className="text-[12px] text-[#5f6368]">
              ({stats.total} reviews)
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Response rate</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[22px] font-semibold text-[#111111] tabular-nums leading-none">
              {stats.responseRate}%
            </span>
            {stats.needsReply > 0 ? (
              <span className="text-[12px] text-[#b45309]">
                ({stats.needsReply} pending)
              </span>
            ) : (
              <span className="text-[12px] text-[#15803d]">All caught up</span>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">In-store scans</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[22px] font-semibold text-[#111111] tabular-nums leading-none">
              {qrSummary.totalScans}
            </span>
            <span className="text-[12px] text-[#5f6368]">
              ({qrSummary.socialVerified} follows/reviews)
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Private recoveries</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[22px] font-semibold text-[#111111] tabular-nums leading-none">
              {qrSummary.shieldIntercepts}
            </span>
            <span className="text-[12px] text-[#5f6368]">
              (1–3★ shielded)
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: REVIEW INBOX & AI SEO RESPONDER
      =================================================================== */}
      {workspaceTab === "inbox" && (
        <section
          aria-label="Customer reviews inbox"
          className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
        >
          {/* Filter Bar */}
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                {
                  id: "needs-reply" as InboxFilter,
                  label: "Needs reply",
                  count: stats.needsReply,
                },
                {
                  id: "escalations" as InboxFilter,
                  label: "1★–2★ Escalations",
                  count: storeReviews.filter((r) => r.rating <= 2).length,
                },
                {
                  id: "all" as InboxFilter,
                  label: "All reviews",
                  count: stats.total,
                },
                {
                  id: "featured" as InboxFilter,
                  label: "Featured on website",
                  count: stats.featured,
                },
              ].map((t) => {
                const active = inboxFilter === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setInboxFilter(t.id)}
                    className={`h-[28px] px-2.5 rounded-[5px] text-[12px] font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      active
                        ? "bg-[#111111] text-white"
                        : "bg-[#f3f4f6] text-[#5f6368] hover:text-[#111111]"
                    }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`text-[11px] tabular-nums ${
                        active ? "text-white/80" : "text-[#5f6368]"
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(
                ["All", "Google", "Yelp", "Trustpilot", "Facebook"] as const
              ).map((p) => {
                const active = platformFilter === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatformFilter(p)}
                    className={`h-[28px] px-2.5 rounded-[5px] text-[12px] font-medium cursor-pointer transition-colors ${
                      active
                        ? "border border-[#111111] bg-white text-[#111111]"
                        : "border border-transparent text-[#5f6368] hover:text-[#111111]"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Rows */}
          {visibleReviews.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-[14px] font-medium text-[#111111]">
                No reviews match this filter
              </p>
              <p className="text-[12px] text-[#5f6368] mt-1">
                Switch filter tabs above to inspect other customer reviews.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f2f2f2]">
              {visibleReviews.map((r) => {
                const isOpen = replyingId === r.id;
                const canReplyInline = REPLYABLE_VIA_API[r.platform];
                const branchAddr = storeAddressFor(r.storeId);

                return (
                  <article
                    key={r.id}
                    className="p-4 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-semibold text-[#111111]">
                            {r.reviewer}
                          </span>
                          <Stars rating={r.rating} />
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#111111] text-[11px] font-medium">
                            {r.platform}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px]">
                            {branchAddr}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium ${
                              r.rating <= 2
                                ? "bg-[#ffedea] text-[#831c1e]"
                                : "bg-[#dcfae5] text-[#04250e]"
                            }`}
                          >
                            {r.topicTag}
                          </span>
                          <span className="text-[12px] text-[#5f6368] tabular-nums">
                            · {r.date}
                          </span>
                        </div>

                        <p className="text-[13px] text-[#111111] mt-2 leading-relaxed max-w-3xl">
                          {r.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {r.rating >= 4 && (
                          <button
                            type="button"
                            onClick={() => toggleFeaturedOnSite(r.id)}
                            className={`h-[28px] px-2.5 rounded-[5px] text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors ${
                              r.featuredOnSite
                                ? "bg-[#dcfae5] text-[#04250e]"
                                : "border border-[#d1d5db] bg-white text-[#5f6368] hover:text-[#111111]"
                            }`}
                          >
                            <Globe className="w-3 h-3" aria-hidden="true" />
                            <span>
                              {r.featuredOnSite
                                ? "On website ✓"
                                : "Feature on site"}
                            </span>
                          </button>
                        )}

                        {!isOpen && (
                          <button
                            type="button"
                            onClick={() => openReplyComposer(r)}
                            className={`h-[28px] px-3 rounded-[5px] text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                              r.reply
                                ? "border border-[#d1d5db] bg-white text-[#111111] hover:bg-[#f9f9f9]"
                                : "bg-[#1d1f20] hover:bg-[#111111] text-white"
                            }`}
                          >
                            <span>{r.reply ? "Edit reply" : "Reply"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {r.reply && !isOpen && (
                      <div className="mt-3 pl-3.5 border-l-2 border-[#d1d5db] flex items-start gap-2">
                        <CornerDownRight
                          className="w-3.5 h-3.5 text-[#5f6368] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <div className="text-[12px] text-[#5f6368] leading-relaxed">
                          <span className="font-medium text-[#111111]">
                            Smart Fone Doctor ({branchAddr})
                          </span>{" "}
                          · {r.reply.date}: {r.reply.text}
                        </div>
                      </div>
                    )}

                    {isOpen && (
                      <div className="mt-3 p-3.5 rounded-[6px] bg-[#f9fafb] border border-[#e8e8e8] flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12px] font-medium text-[#111111] mr-1">
                              Response template:
                            </span>
                            {[
                              {
                                id: "seo-entity" as ReplyTone,
                                label: "Local SEO & Entity Boost",
                              },
                              {
                                id: "manager-recovery" as ReplyTone,
                                label: "Manager Escalation ($20 credit)",
                              },
                              {
                                id: "warranty-check" as ReplyTone,
                                label: "90-Day Warranty Re-check",
                              },
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleToneChange(r, preset.id)}
                                className={`h-[26px] px-2.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-colors ${
                                  replyTone === preset.id
                                    ? "bg-[#111111] text-white"
                                    : "bg-white border border-[#d1d5db] text-[#5f6368] hover:text-[#111111]"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          <span className="text-[11px] text-[#5f6368]">
                            Injects:{" "}
                            <strong className="text-[#111111]">
                              {branchAddr}
                            </strong>{" "}
                            +{" "}
                            <strong className="text-[#111111]">
                              {r.deviceService}
                            </strong>
                          </span>
                        </div>

                        <textarea
                          rows={3}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          aria-label={`Reply to ${r.reviewer}`}
                          className="w-full p-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[12px] text-[#5f6368]">
                            {canReplyInline
                              ? `Direct API publish to ${r.platform}`
                              : `Yelp requires posting in Yelp for Business portal`}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingId(null)}
                              className="h-[28px] px-3 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-medium text-[#5f6368] hover:text-[#111111] cursor-pointer"
                            >
                              Cancel
                            </button>

                            {canReplyInline ? (
                              <button
                                type="button"
                                onClick={() => publishReply(r.id)}
                                className="h-[28px] px-3 rounded-[5px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[12px] font-medium cursor-pointer"
                              >
                                Publish reply
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(draft);
                                    setCopied(true);
                                  }}
                                  className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-medium text-[#111111] inline-flex items-center gap-1 cursor-pointer"
                                >
                                  {copied ? (
                                    <Check className="w-3.5 h-3.5 text-[#15803d]" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>{copied ? "Copied" : "Copy reply"}</span>
                                </button>
                                <a
                                  href={PLATFORM_URL[r.platform]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-[28px] px-3 rounded-[5px] bg-[#1d1f20] text-white text-[12px] font-medium inline-flex items-center gap-1"
                                >
                                  <span>Open Yelp</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ===================================================================
          TAB 2: GET MORE REVIEWS (SMS CAMPAIGN & COUNTER QR STANDEE)
      =================================================================== */}
      {workspaceTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left 2 Columns: Post-Repair SMS/Email Review Request Queue */}
          <section
            aria-label="Automated post-repair review requests"
            className="lg:col-span-2 bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[15px] font-semibold text-[#111111]">
                  Completed repairs ready for review invite
                </h2>
                <p className="text-[12px] text-[#5f6368]">
                  Smart routing sends customers to the directory that needs reviews most at each branch
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendAllSms}
                className="h-[30px] px-3 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  Send all SMS invites (
                  {visibleSmsQueue.filter((i) => !i.sent).length})
                </span>
              </button>
            </div>

            <div className="divide-y divide-[#f2f2f2]">
              {visibleSmsQueue.map((item) => {
                const branchAddr = storeAddressFor(item.storeId);
                return (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f9f9f9]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-medium text-[#111111]">
                          {item.customer}
                        </span>
                        <span className="text-[12px] text-[#5f6368] tabular-nums">
                          {item.phone}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px]">
                          {branchAddr}
                        </span>
                      </div>
                      <div className="text-[12px] text-[#5f6368] mt-0.5">
                        {item.device} · Completed {item.completedAgo}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#111111] text-[11px] font-medium">
                          Target: {item.recommendedPlatform}
                        </span>
                        <div className="text-[11px] text-[#5f6368] mt-0.5">
                          {item.reason}
                        </div>
                      </div>

                      {item.sent ? (
                        <span className="h-[28px] px-2.5 rounded-[5px] bg-[#dcfae5] text-[#04250e] text-[12px] font-medium inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>SMS Sent</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendSms(item.id)}
                          className="h-[28px] px-3 rounded-[5px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[12px] font-medium inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send SMS</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-3 bg-[#f9fafb] border-t border-[#eaeaea] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#15803d] shrink-0" />
                <div className="text-[12px]">
                  <span className="font-medium text-[#111111]">
                    Negative Feedback Recovery Shield
                  </span>{" "}
                  <span className="text-[#5f6368]">
                    — Alerts store manager immediately via SMS if a customer checks in with a 1★–3★ issue
                  </span>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={shieldEnabled}
                onClick={() => setShieldEnabled(!shieldEnabled)}
                className={`h-[24px] px-2.5 rounded-[4px] text-[11px] font-medium cursor-pointer transition-colors shrink-0 ${
                  shieldEnabled
                    ? "bg-[#dcfae5] text-[#04250e]"
                    : "bg-[#f3f4f6] text-[#5f6368]"
                }`}
              >
                {shieldEnabled ? "Active ✓" : "Paused"}
              </button>
            </div>
          </section>

          {/* Right Column: Countertop QR Standee Generator */}
          <section
            aria-label="In-store QR review card"
            className="bg-white border border-[#e8e8e8] rounded-[8px] p-4 flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#111111]">
                  Counter QR standee
                </h2>
                <p className="text-[12px] text-[#5f6368]">
                  {selectedStore.address}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#111111] text-[11px] font-mono">
                phl-0{selectedStore.id}
              </span>
            </div>

            <div className="p-4 rounded-[6px] bg-[#f9fafb] border border-[#e8e8e8] flex flex-col items-center text-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5f6368]">
                Smart Fone Doctor · {selectedStore.address}
              </span>
              <p className="text-[14px] font-semibold text-[#111111]">
                Review &amp; Follow for $5 Off
              </p>
              <div className="my-1 p-3 bg-white border border-[#e5e7eb] rounded-[8px]">
                <RealQrCodeSvg
                  value={`https://smartfonedoctor.com/review/phl-0${selectedStore.id}`}
                  size={136}
                />
              </div>
              <span className="text-[12px] text-[#5f6368]">
                Tracks{" "}
                <strong className="text-[#111111]">
                  Google, Apple Maps, Yelp, IG &amp; TikTok
                </strong>{" "}
                clicks for {selectedStore.address}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={`/review/phl-0${selectedStore.id}`}
                className="h-[32px] w-full rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[12px] font-medium inline-flex items-center justify-center gap-1.5"
              >
                <span>Open customer QR page ↗</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `http://localhost:3000/review/phl-0${selectedStore.id}`
                  );
                  setNoticeBanner(
                    `Copied tracked QR link for ${selectedStore.address}.`
                  );
                }}
                className="h-[32px] w-full rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy tracked link (/review/phl-0{selectedStore.id})</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================
          TAB 3: QR & PROMOS — Clean, human-designed SaaS management
      =================================================================== */}
      {workspaceTab === "qr-tracking" && (
        <div className="flex flex-col gap-5">
          {/* 1. Summary Strip (4 KPI Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                label: "In-Store Scans",
                value: qrSummary.totalScans,
                sub: `${qrSummary.counterQrScans} Counter Standee · ${qrSummary.smsLinkClicks} SMS`,
              },
              {
                label: "Directory Clicks",
                value: qrSummary.directoryClicks,
                sub: `${qrSummary.directoryVerified} reviews verified`,
              },
              {
                label: "Social Follows",
                value: qrSummary.socialVerified,
                sub: `From ${qrSummary.socialClicks} social visits`,
              },
              {
                label: "Active Promo Codes",
                value: coupons.filter((c) => c.active).length,
                sub: `${coupons.reduce((acc, c) => acc + c.uses, 0)} total redemptions`,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-white border border-[#e8e8e8] rounded-[8px] p-4 flex flex-col gap-1.5"
              >
                <span className="text-[12px] font-medium text-[#5f6368]">
                  {card.label}
                </span>
                <span className="text-[26px] font-semibold text-[#111111] tabular-nums leading-none">
                  {card.value}
                </span>
                <span className="text-[11px] text-[#5f6368]">{card.sub}</span>
              </div>
            ))}
          </div>

          {/* 2. Two-Column Workspace: Tracked Links (Left) & Coupon Management (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT 6 COLS: Tracked Links & Standees */}
            <section
              aria-label="Tracked links and standees"
              className="lg:col-span-6 bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#111111]">
                    Tracked QR Links &amp; Standees
                  </h2>
                  <p className="text-[12px] text-[#5f6368]">
                    In-store acrylic stands, receipt QR, and short links
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLinkForm((prev) => !prev)}
                  className="h-[28px] px-2.5 rounded-[5px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{showLinkForm ? "Cancel" : "+ Add Link"}</span>
                </button>
              </div>

              {/* Inline Link Creation Form */}
              {showLinkForm && (
                <div className="p-4 bg-[#f9fafb] border-b border-[#e5e7eb] flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5f6368] mb-1">
                        Link Label
                      </label>
                      <input
                        type="text"
                        value={newLinkLabel}
                        onChange={(e) => setNewLinkLabel(e.target.value)}
                        placeholder="e.g. Counter Standee – 33 S 52nd St"
                        className="w-full h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] bg-white focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5f6368] mb-1">
                        Source Placement
                      </label>
                      <select
                        value={newLinkSource}
                        onChange={(e) =>
                          setNewLinkSource(e.target.value as TrackedLink["source"])
                        }
                        className="w-full h-[32px] px-2 rounded-[5px] border border-[#d1d5db] text-[12px] bg-white focus:outline-none focus:border-[#111111] cursor-pointer"
                      >
                        <option value="Counter QR">Counter Standee (QR)</option>
                        <option value="SMS">SMS Invite</option>
                        <option value="IG Bio">Instagram Bio</option>
                        <option value="TikTok Bio">TikTok Bio</option>
                        <option value="Receipt QR">Receipt Footer (QR)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLinkForm(false)}
                      className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#5f6368] hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLink}
                      className="h-[28px] px-3 rounded-[5px] bg-[#111111] text-white text-[12px] font-medium hover:bg-[#222222]"
                    >
                      Save Tracked Link
                    </button>
                  </div>
                </div>
              )}

              {/* Active Standee Quick Card */}
              <div className="p-4 bg-[#fafafa] border-b border-[#e5e7eb] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-white border border-[#e5e7eb] rounded-[6px] shrink-0">
                    <RealQrCodeSvg
                      value={`https://smartfonedoctor.com/review/phl-0${selectedStore.id}`}
                      size={64}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[13px] font-semibold text-[#111111] block truncate">
                      {selectedStore.address}
                    </span>
                    <span className="text-[11px] font-mono text-[#5f6368] block truncate">
                      smartfonedoctor.com/review/phl-0{selectedStore.id}
                    </span>
                    <span className="text-[11px] text-[#15803d] font-medium mt-0.5 inline-block">
                      ● Active In-Store Standee
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://smartfonedoctor.com/review/phl-0${selectedStore.id}`
                      );
                      setNoticeBanner(
                        `Copied standee link for ${selectedStore.address}`
                      );
                    }}
                    className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] text-[12px] text-[#111111] inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3 text-[#5f6368]" />
                    <span>Copy</span>
                  </button>
                  <Link
                    href={`/review/phl-0${selectedStore.id}`}
                    target="_blank"
                    className="h-[28px] px-2.5 rounded-[5px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] inline-flex items-center gap-1 transition-colors"
                  >
                    <span>View Standee</span>
                  </Link>
                </div>
              </div>

              {/* Tracked Links Table */}
              <div className="divide-y divide-[#f2f2f2]">
                {(isAllStores
                  ? links
                  : links.filter((l) => l.storeId === selectedStoreId)
                ).map((link) => {
                  const convRate =
                    link.scans > 0
                      ? Math.round((link.verified / link.scans) * 100)
                      : 0;
                  return (
                    <div
                      key={link.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#111111] truncate">
                            {link.label}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[10px] font-medium shrink-0">
                            {link.source}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#5f6368]">
                          /review/{link.slug}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div className="text-[12px]">
                          <span className="font-semibold text-[#111111] tabular-nums">
                            {link.scans}
                          </span>{" "}
                          <span className="text-[#5f6368]">scans</span>
                          <span className="text-[#d1d5db] mx-1.5">·</span>
                          <span className="font-semibold text-[#15803d] tabular-nums">
                            {link.verified}
                          </span>{" "}
                          <span className="text-[#5f6368]">verified</span>
                        </div>
                        <span className="w-12 text-[11px] font-medium text-[#5f6368] tabular-nums bg-[#f9fafb] border border-[#e5e7eb] px-1.5 py-0.5 rounded text-center">
                          {convRate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* RIGHT 6 COLS: Coupon & Discount Management */}
            <section
              aria-label="Coupon and discount code management"
              className="lg:col-span-6 bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[14px] font-semibold text-[#111111]">
                    Coupon &amp; Promo Code Management
                  </h2>
                  <p className="text-[12px] text-[#5f6368]">
                    In-store reward codes unlocked upon following or reviewing
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCouponForm((prev) => !prev)}
                  className="h-[28px] px-2.5 rounded-[5px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{showCouponForm ? "Cancel" : "+ New Code"}</span>
                </button>
              </div>

              {/* Inline Coupon Creation Form */}
              {showCouponForm && (
                <div className="p-4 bg-[#f9fafb] border-b border-[#e5e7eb] flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#5f6368] mb-1">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        placeholder="e.g. PHL1-VIP5"
                        className="w-full h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] font-mono uppercase bg-white focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5f6368] mb-1">
                        Discount Value
                      </label>
                      <select
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="w-full h-[32px] px-2 rounded-[5px] border border-[#d1d5db] text-[12px] bg-white focus:outline-none focus:border-[#111111] cursor-pointer"
                      >
                        <option value="$5 Off">$5 Off Repair</option>
                        <option value="$10 Off">$10 Off Repair</option>
                        <option value="10% Off">10% Off Any Service</option>
                        <option value="Free Lens Wipe">Free Premium Screen Wipe</option>
                        <option value="Free Glass Protector">Free Tempered Glass</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5f6368] mb-1">
                        Target Platform
                      </label>
                      <select
                        value={newCouponChannel}
                        onChange={(e) =>
                          setNewCouponChannel(
                            e.target.value as TrackingChannelId | "all"
                          )
                        }
                        className="w-full h-[32px] px-2 rounded-[5px] border border-[#d1d5db] text-[12px] bg-white focus:outline-none focus:border-[#111111] cursor-pointer"
                      >
                        <option value="all">All Channels</option>
                        <option value="instagram">Instagram Follow</option>
                        <option value="tiktok">TikTok Follow</option>
                        <option value="facebook">Facebook Page</option>
                        <option value="gmb">Google Business Review</option>
                        <option value="apple">Apple Maps Tap</option>
                        <option value="yelp">Yelp Review</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#5f6368] mb-1">
                        Expiration (Optional)
                      </label>
                      <input
                        type="date"
                        value={newCouponExpiry}
                        onChange={(e) => setNewCouponExpiry(e.target.value)}
                        className="w-full h-[32px] px-2 rounded-[5px] border border-[#d1d5db] text-[12px] bg-white focus:outline-none focus:border-[#111111]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCouponForm(false)}
                      className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#5f6368] hover:bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCoupon}
                      className="h-[28px] px-3 rounded-[5px] bg-[#111111] text-white text-[12px] font-medium hover:bg-[#222222]"
                    >
                      Create Code
                    </button>
                  </div>
                </div>
              )}

              {/* Coupon Table */}
              <div className="divide-y divide-[#f2f2f2]">
                {(isAllStores
                  ? coupons
                  : coupons.filter(
                      (c) => c.storeId === selectedStoreId || c.storeId === "all"
                    )
                ).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[13px] text-[#111111] tracking-tight">
                          {item.code}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-[4px] bg-[#dcfae5] text-[#04250e] text-[11px] font-medium">
                          {item.discount}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5f6368] mt-0.5 block truncate">
                        Linked to{" "}
                        <strong className="font-medium text-[#111111] capitalize">
                          {item.channelId === "all"
                            ? "All Platforms"
                            : item.channelId}
                        </strong>{" "}
                        ·{" "}
                        {item.storeId === "all"
                          ? "All Philadelphia branches"
                          : storeAddressFor(item.storeId as number)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[12px] font-semibold text-[#111111] tabular-nums block">
                          {item.uses} used
                        </span>
                        <span className="text-[11px] text-[#5f6368]">
                          {item.expiresAt ? `Exp: ${item.expiresAt}` : "No expiry"}
                        </span>
                      </div>

                      {item.active ? (
                        <button
                          type="button"
                          onClick={() => deactivateCoupon(item.id)}
                          className="h-[24px] px-2 rounded-[4px] border border-[#e5e7eb] hover:border-[#fca5a5] hover:bg-[#fff5f5] text-[11px] font-medium text-[#15803d] hover:text-[#991b1b] transition-colors cursor-pointer"
                        >
                          Active ✓
                        </button>
                      ) : (
                        <span className="h-[24px] px-2 rounded-[4px] bg-[#f3f4f6] text-[11px] font-medium text-[#5f6368] inline-flex items-center">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 3. Channel Attribution Matrix (Google, Apple, Yelp, IG, TikTok, FB) */}
          <section
            aria-label="Channel attribution matrix"
            className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Channel Attribution &amp; Conversion Tracing
                </h2>
                <p className="text-[12px] text-[#5f6368]">
                  Breakdown of customer actions across review directories and social follow links
                </p>
              </div>
              <span className="text-[12px] text-[#5f6368] tabular-nums">
                {qrSummary.directoryClicks + qrSummary.socialClicks} total clicks
              </span>
            </div>

            <div className="divide-y divide-[#f2f2f2]">
              {[...qrSummary.directoryChannels, ...qrSummary.socialChannels].map(
                (ch) => {
                  const isSocial = ch.category === "Social Follow";
                  return (
                    <div
                      key={ch.id}
                      className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 sm:w-[35%]">
                        <ChannelBrandBadge channelId={ch.id} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-[#111111] truncate">
                              {ch.label}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[10px] font-medium shrink-0">
                              {isSocial ? "Social Follow" : "Review"}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#5f6368] block truncate">
                            {ch.handleOrTarget}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar (Subtle & Clean) */}
                      <div className="hidden sm:flex flex-1 items-center gap-2.5 max-w-[280px]">
                        <div className="w-full h-[6px] rounded-full bg-[#f1f3f4] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSocial ? "bg-[#15803d]" : "bg-[#111111]"
                            }`}
                            style={{ width: `${ch.convRate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-[#5f6368] tabular-nums shrink-0 w-9 text-right">
                          {ch.convRate}%
                        </span>
                      </div>

                      {/* Numbers */}
                      <div className="flex items-center gap-4 shrink-0 text-right tabular-nums text-[12px]">
                        <div>
                          <span className="font-semibold text-[#111111]">
                            {ch.clicks}
                          </span>{" "}
                          <span className="text-[#5f6368]">clicks</span>
                        </div>
                        <span className="text-[#d1d5db]">→</span>
                        <div>
                          <span className="font-semibold text-[#15803d]">
                            {ch.verifiedConversions}
                          </span>{" "}
                          <span className="text-[#5f6368]">
                            {isSocial ? "followed" : "reviewed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* 4. Recent In-Store Scans & Activity Log */}
          <section
            aria-label="Recent in-store activity feed"
            className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Recent Scan &amp; Conversion Activity
                </h2>
                <p className="text-[12px] text-[#5f6368]">
                  Verified visits, channel clicks, and promo redemptions
                </p>
              </div>
              <span className="text-[11px] text-[#5f6368]">Live updates</span>
            </div>

            <div className="divide-y divide-[#f2f2f2]">
              {qrSummary.scopedEvents.slice(0, 8).map((ev) => (
                <div
                  key={ev.id}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#fafafa] transition-colors text-[12px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ChannelBrandBadge channelId={ev.channelId} />
                    <div className="min-w-0">
                      <span className="font-medium text-[#111111] block truncate">
                        {ev.channelLabel}
                      </span>
                      <span className="text-[11px] text-[#5f6368]">
                        {storeAddressFor(ev.storeId)} · {ev.deviceOs} · {ev.source}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                        ev.outcome.includes("Verified")
                          ? "bg-[#dcfae5] text-[#04250e]"
                          : ev.outcome.includes("Shield")
                          ? "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
                          : "bg-[#f3f4f6] text-[#111111]"
                      }`}
                    >
                      {ev.outcome}
                    </span>
                    <span className="text-[11px] text-[#5f6368] tabular-nums">
                      {ev.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================
          TAB 4: SENTIMENT RADAR & COMPETITOR BENCHMARK (Visual Progress Bars)
      =================================================================== */}
      {workspaceTab === "sentiment" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          <section
            aria-label="Customer sentiment by operational topic"
            className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="px-4 py-3 border-b border-[#e5e7eb]">
                <h2 className="text-[15px] font-semibold text-[#111111]">
                  Customer sentiment by operational topic
                </h2>
                <p className="text-[12px] text-[#5f6368]">
                  Aggregated from customer feedback on Google, Yelp, and Facebook
                </p>
              </div>

              <div className="p-4 flex flex-col gap-3.5">
                {[
                  {
                    topic: "Staff friendliness & honesty",
                    mentions: "64 reviews",
                    pct: 96,
                    tone: "bg-[#15803d]",
                  },
                  {
                    topic: "OEM screen & HDMI repair quality",
                    mentions: "82 reviews",
                    pct: 94,
                    tone: "bg-[#15803d]",
                  },
                  {
                    topic: "Pricing transparency (vs Apple Store)",
                    mentions: "49 reviews",
                    pct: 91,
                    tone: "bg-[#15803d]",
                  },
                  {
                    topic: "Saturday afternoon wait times",
                    mentions: "14 reviews",
                    pct: 68,
                    tone: "bg-[#d97706]",
                  },
                  {
                    topic: "Street parking near Lancaster Ave",
                    mentions: "9 reviews",
                    pct: 62,
                    tone: "bg-[#d97706]",
                  },
                ].map((row) => (
                  <div key={row.topic} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-[#111111] truncate">
                          {row.topic}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px] shrink-0">
                          {row.mentions}
                        </span>
                      </div>
                      <span className="text-[12px] font-medium text-[#111111] tabular-nums">
                        {row.pct}% positive
                      </span>
                    </div>
                    <div className="w-full h-[7px] rounded-full bg-[#f1f3f4] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.tone}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-2.5 bg-[#f9fafb] border-t border-[#eaeaea] text-[12px] text-[#5f6368]">
              Actionable insight: Adding an extra Saturday bench tech at{" "}
              <strong className="text-[#111111]">33 S 52nd St</strong> resolves
              80% of wait-time complaints.
            </div>
          </section>

          <section
            aria-label="Philadelphia competitor rating benchmark"
            className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="px-4 py-3 border-b border-[#e5e7eb]">
                <h2 className="text-[15px] font-semibold text-[#111111]">
                  Philadelphia Local Pack reputation benchmark
                </h2>
                <p className="text-[12px] text-[#5f6368]">
                  Aggregate rating &amp; review volume across West Philly and University City
                </p>
              </div>

              <div className="p-4 flex flex-col gap-3.5">
                {[
                  {
                    name: `Smart Fone Doctor (${storeShortName})`,
                    meta: "200 total reviews · +18/mo velocity",
                    rating: 4.8,
                    isSelf: true,
                  },
                  {
                    name: "iPhone Repair Philly — University City",
                    meta: "165 reviews · +9/mo velocity",
                    rating: 4.7,
                    isSelf: false,
                  },
                  {
                    name: "uBreakiFix by Asurion — Center City",
                    meta: "240 reviews · +11/mo velocity",
                    rating: 4.5,
                    isSelf: false,
                  },
                  {
                    name: "Mr Fix Cell Phone & Computer Repair",
                    meta: "94 reviews · +4/mo velocity",
                    rating: 4.4,
                    isSelf: false,
                  },
                  {
                    name: "Apple Store Walnut Street",
                    meta: "310 reviews · Long appointment wait complaints",
                    rating: 3.9,
                    isSelf: false,
                  },
                ].map((comp) => (
                  <div key={comp.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-[13px]">
                      <div className="min-w-0">
                        <span
                          className={`truncate block ${
                            comp.isSelf
                              ? "font-semibold text-[#111111]"
                              : "font-normal text-[#111111]"
                          }`}
                        >
                          {comp.name}
                        </span>
                        <span className="text-[11px] text-[#5f6368]">
                          {comp.meta}
                        </span>
                      </div>
                      <span
                        className={`text-[13px] font-semibold tabular-nums shrink-0 ${
                          comp.isSelf ? "text-[#15803d]" : "text-[#111111]"
                        }`}
                      >
                        {comp.rating.toFixed(1)} ★
                      </span>
                    </div>
                    <div className="w-full h-[7px] rounded-full bg-[#f1f3f4] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          comp.isSelf ? "bg-[#111111]" : "bg-[#cbd5e1]"
                        }`}
                        style={{ width: `${(comp.rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-2.5 bg-[#f9fafb] border-t border-[#eaeaea] flex items-center justify-between text-[12px] text-[#5f6368]">
              <span>Highest rated walk-in repair brand in 19139 &amp; 19104</span>
              <span className="font-medium text-[#15803d]">#1 Rated</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
