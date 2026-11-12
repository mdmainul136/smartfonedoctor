"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { STORES } from "@/lib/stores";
import { useQrTracking, TrackingChannelId } from "@/lib/qrTracking";
import { ChannelBrandBadge } from "@/components/Dashboard/QrCodeSvg";
import { Star, Check, ExternalLink, MapPin, Phone } from "lucide-react";

const SLUG_TO_STORE_ID: Record<string, number> = {
  "phl-01": 1,
  "phl-02": 2,
  "phl-03": 3,
  "1": 1,
  "2": 2,
  "3": 3,
};

const STAR_LABELS: Record<number, string> = {
  5: "Awesome! Choose a platform below to review or follow:",
  4: "Glad we could help! Share a quick review or follow us:",
  3: "Tell our store manager how we can make your experience 5 stars:",
  2: "We're sorry! Let our store manager resolve this immediately:",
  1: "Tell our store manager what happened so we can make it right:",
};

export default function CustomerQrReviewHubPage() {
  const params = useParams<{ storeSlug: string }>();
  const rawSlug = params?.storeSlug || "phl-01";
  const storeId = SLUG_TO_STORE_ID[rawSlug.toLowerCase()] ?? 1;
  const store = STORES.find((s) => s.id === storeId) ?? STORES[0];

  const { recordQrScan, recordChannelClick, recordShieldIntercept } =
    useQrTracking();

  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [clickedChannel, setClickedChannel] =
    useState<TrackingChannelId | null>(null);
  const [unlockedPerkCode, setUnlockedPerkCode] = useState<string | null>(null);
  const [shieldMessage, setShieldMessage] = useState("");
  const [shieldPhone, setShieldPhone] = useState("");
  const [shieldSubmitted, setShieldSubmitted] = useState(false);

  // Record the QR scan for this specific branch when the customer opens the link
  useEffect(() => {
    const isAndroid =
      typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
    recordQrScan(
      storeId,
      isAndroid ? "Android" : "iOS (iPhone)",
      "Counter QR Standee"
    );
  }, [storeId, recordQrScan]);

  // Listen for return-to-tab (visibilitychange) after customer opens IG/TikTok/Google app
  useEffect(() => {
    if (!clickedChannel || unlockedPerkCode) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && clickedChannel) {
        const code = `PHL${storeId}-${clickedChannel.toUpperCase().slice(0, 3)}5`;
        setUnlockedPerkCode(code);
        recordChannelClick(storeId, clickedChannel, true, `Perk: ${code}`);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [clickedChannel, unlockedPerkCode, storeId, recordChannelClick]);

  const handleDestinationClick = (
    channelId: TrackingChannelId,
    url: string
  ) => {
    setClickedChannel(channelId);
    setUnlockedPerkCode(null);
    recordChannelClick(storeId, channelId, false, "Outbound QR Click");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConfirmFollowOrReview = (channelId: TrackingChannelId) => {
    const code = `PHL${storeId}-${channelId.toUpperCase().slice(0, 3)}5`;
    setUnlockedPerkCode(code);
    recordChannelClick(storeId, clickedChannel ?? channelId, true, `Perk: ${code}`);
  };

  const handleShieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordShieldIntercept(
      storeId,
      selectedStars,
      shieldPhone ? `Callback: ${shieldPhone}` : "Manager Recovery Requested"
    );
    setShieldSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111111] flex flex-col items-center justify-center px-4 py-8">
      {/* Standalone Customer Card for this Specific Branch */}
      <main className="w-full max-w-[460px] bg-white border border-[#e8e8e8] rounded-[12px] overflow-hidden">
        {/* Clean Store Identity Header (No Admin links, No Warranty pill) */}
        <div className="p-5 border-b border-[#eaeaea]">
          <div className="flex items-baseline justify-between gap-2">
            <h1 className="text-[20px] font-semibold text-[#111111] tracking-[-0.02em]">
              Smart Fone Doctor
            </h1>
            <span className="text-[13px] font-medium text-[#111111] tabular-nums shrink-0">
              4.8 <span className="text-amber-500">★</span>{" "}
              <span className="text-[#5f6368] font-normal">(200+)</span>
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#5f6368]">
            <span className="inline-flex items-center gap-1 text-[#111111]">
              <MapPin
                className="w-3.5 h-3.5 text-[#5f6368]"
                aria-hidden="true"
              />
              {store.address}, Philadelphia
            </span>
            <a
              href={`tel:${store.phone}`}
              className="inline-flex items-center gap-1 tabular-nums text-[#5f6368] hover:text-[#111111]"
            >
              <Phone
                className="w-3.5 h-3.5 text-[#5f6368]"
                aria-hidden="true"
              />
              {store.phone}
            </a>
          </div>

          {/* Clean, Uniform 1–5 Star Selector */}
          <div className="mt-4 pt-4 border-t border-[#f2f2f2]">
            <label className="block text-[12px] font-medium text-[#111111] mb-2">
              {STAR_LABELS[selectedStars]}
            </label>

            <div
              role="radiogroup"
              aria-label="Rate your repair experience from 1 to 5 stars"
              className="grid grid-cols-5 gap-2"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = star === selectedStars;
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setSelectedStars(star);
                      setShieldSubmitted(false);
                    }}
                    className={`h-[38px] rounded-[6px] border flex items-center justify-center gap-1 text-[13px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#e5e7eb] bg-white text-[#111111] hover:bg-[#f9fafb] hover:border-[#d1d5db]"
                    }`}
                  >
                    <span className="tabular-nums">{star}</span>
                    <Star
                      className={`w-3.5 h-3.5 ${
                        star <= selectedStars
                          ? "fill-amber-400 text-amber-400"
                          : "fill-[#e5e7eb] text-[#e5e7eb]"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Unlocked Counter Reward Code Banner */}
        {unlockedPerkCode && (
          <div
            role="status"
            aria-live="polite"
            className="mx-5 mt-4 p-3.5 rounded-[8px] bg-[#dcfae5] text-[#04250e] flex items-center justify-between gap-3"
          >
            <div className="text-[12px]">
              <span className="font-semibold block">
                $5 Counter Reward Unlocked
              </span>
              <span>
                Show code{" "}
                <strong className="font-mono underline">
                  {unlockedPerkCode}
                </strong>{" "}
                at {store.address}.
              </span>
            </div>
            <span className="h-[26px] px-2.5 rounded-[4px] bg-white text-[#04250e] font-mono text-[12px] font-semibold inline-flex items-center shrink-0">
              {unlockedPerkCode}
            </span>
          </div>
        )}

        {/* Instant Follow / Review Verification Prompt */}
        {clickedChannel && !unlockedPerkCode && (
          <div className="mx-5 mt-4 p-3.5 rounded-[8px] bg-[#fffbeb] border border-[#fde68a] text-[#92400e] flex items-center justify-between gap-3 text-[12px]">
            <span>
              Opened{" "}
              <strong className="uppercase">{clickedChannel}</strong>. Tap
              verify to unlock your $5 counter voucher:
            </span>
            <button
              type="button"
              onClick={() => handleConfirmFollowOrReview(clickedChannel)}
              className="h-[28px] px-3 rounded-[5px] bg-[#111111] text-white text-[12px] font-medium shrink-0 cursor-pointer"
            >
              Verify &amp; claim $5
            </button>
          </div>
        )}

        {/* CASE A: 1–3 STARS -> PRIVATE FEEDBACK RECOVERY SHIELD */}
        {selectedStars <= 3 ? (
          <div className="p-5">
            {shieldSubmitted ? (
              <div className="p-4 rounded-[8px] bg-[#dcfae5] text-[#04250e] text-[13px]">
                <div className="font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Sent directly to {store.address} Store Manager</span>
                </div>
                <p className="text-[12px] mt-1 leading-relaxed">
                  Our manager has received your priority message and will call
                  or text you within 10 minutes to make this right.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleShieldSubmit}
                className="flex flex-col gap-3.5"
              >
                <div className="p-3 rounded-[6px] bg-[#fffbeb] border border-[#fde68a] text-[12px] text-[#92400e]">
                  <strong>Direct Manager Resolution:</strong> Tell us what
                  happened so we can fix it right away.
                </div>

                <div>
                  <label
                    htmlFor="shield-phone"
                    className="block text-[12px] font-medium text-[#111111] mb-1"
                  >
                    Your phone number for manager callback
                  </label>
                  <input
                    id="shield-phone"
                    type="tel"
                    required
                    value={shieldPhone}
                    onChange={(e) => setShieldPhone(e.target.value)}
                    placeholder="(215) 555-0199"
                    className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] text-[13px] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shield-note"
                    className="block text-[12px] font-medium text-[#111111] mb-1"
                  >
                    How can we make this right?
                  </label>
                  <textarea
                    id="shield-note"
                    rows={3}
                    required
                    value={shieldMessage}
                    onChange={(e) => setShieldMessage(e.target.value)}
                    placeholder="e.g., Wait time was longer than 30 minutes..."
                    className="w-full p-2.5 rounded-[6px] border border-[#d1d5db] text-[13px] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <button
                  type="submit"
                  className="h-[38px] w-full rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
                >
                  Send to Store Manager
                </button>
              </form>
            )}
          </div>
        ) : (
          /* CASE B: 4–5 STARS -> TRACKED REVIEW DIRECTORIES & SOCIAL FOLLOW FUNNEL */
          <div className="p-5 flex flex-col gap-5">
            {/* 1. Review Directories */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#111111]">
                  1. Leave a quick review
                </span>
                <span className="text-[#5f6368]">Takes 15 seconds</span>
              </div>

              <div className="divide-y divide-[#f2f2f2] border border-[#e8e8e8] rounded-[8px] overflow-hidden">
                {[
                  {
                    id: "gmb" as TrackingChannelId,
                    title: "Google Business Profile",
                    sub: `Smart Fone Doctor · ${store.address}`,
                    badge: "Most Popular",
                    url: "https://www.google.com/maps",
                  },
                  {
                    id: "apple" as TrackingChannelId,
                    title: "Apple Maps (Apple Business)",
                    sub: "1-Tap Thumbs Up on iPhone Place Card",
                    badge: "iOS Fast Tap",
                    url: "https://maps.apple.com",
                  },
                  {
                    id: "yelp" as TrackingChannelId,
                    title: "Yelp Philadelphia",
                    sub: "Share your 30-minute walk-in repair",
                    badge: "Verified Local",
                    url: "https://www.yelp.com",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDestinationClick(item.id, item.url)}
                    className="w-full px-3.5 py-3 bg-white hover:bg-[#f9fafb] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ChannelBrandBadge channelId={item.id} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[#111111] truncate">
                            {item.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#111111] text-[11px] font-medium shrink-0 whitespace-nowrap">
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-[12px] text-[#5f6368] block truncate">
                          {item.sub}
                        </span>
                      </div>
                    </div>
                    <ExternalLink
                      className="w-4 h-4 text-[#5f6368] shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Social Follow Funnel */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-[#111111]">
                  2. Follow us on social
                </span>
                <span className="text-[#15803d] font-medium">
                  Unlocks $5 counter code
                </span>
              </div>

              <div className="divide-y divide-[#f2f2f2] border border-[#e8e8e8] rounded-[8px] overflow-hidden">
                {[
                  {
                    id: "instagram" as TrackingChannelId,
                    title: "Instagram",
                    sub: "@smartfonedoctor.philly · Repair reels & student deals",
                    reward: "+$5 Off Code",
                    url: "https://www.instagram.com",
                  },
                  {
                    id: "tiktok" as TrackingChannelId,
                    title: "TikTok",
                    sub: "@smartfonedoctor · 30-min screen & PS5 HDMI fixes",
                    reward: "+$5 Off Code",
                    url: "https://www.tiktok.com",
                  },
                  {
                    id: "facebook" as TrackingChannelId,
                    title: "Facebook Page",
                    sub: "Smart Fone Doctor Philadelphia",
                    reward: "+Free Lens Wipe",
                    url: "https://www.facebook.com",
                  },
                ].map((soc) => (
                  <button
                    key={soc.id}
                    type="button"
                    onClick={() => handleDestinationClick(soc.id, soc.url)}
                    className="w-full px-3.5 py-3 bg-white hover:bg-[#f9fafb] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ChannelBrandBadge channelId={soc.id} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-[#111111] truncate">
                            {soc.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#dcfae5] text-[#04250e] text-[11px] font-medium shrink-0 whitespace-nowrap">
                            {soc.reward}
                          </span>
                        </div>
                        <span className="text-[12px] text-[#5f6368] block truncate">
                          {soc.sub}
                        </span>
                      </div>
                    </div>
                    <ExternalLink
                      className="w-4 h-4 text-[#5f6368] shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
