"use client";

import { useState, useEffect } from "react";
import { useStoreContext } from "@/lib/storeContext";
import LocalSeoNav from "@/components/Dashboard/LocalSeoNav";
import {
  Plus,
  Sparkles,
  Calendar,
  ExternalLink,
  X,
} from "lucide-react";

type PostType = "Update" | "Offer";

interface GmbPost {
  id: number;
  storeId: number;
  type: PostType;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  couponCode?: string;
  publishedAt: string;
  views: number;
  clicks: number;
}

const INITIAL_POSTS: GmbPost[] = [
  {
    id: 1,
    storeId: 1,
    type: "Offer",
    title: "$15 Off Any iPhone 15 / 16 Pro Screen Repair",
    body: "Cracked your iPhone screen? Stop by our 33 S 52nd St flagship shop in West Philly for a 30-minute OEM-grade replacement and get a free tempered glass protector.",
    ctaLabel: "Book online",
    ctaUrl: "https://smartfonedoctor.com/locations",
    couponCode: "PHILLY15",
    publishedAt: "2024-11-03",
    views: 412,
    clicks: 29,
  },
  {
    id: 2,
    storeId: 1,
    type: "Update",
    title: "Same-Day PS5 & Xbox HDMI Port Replacement",
    body: "No signal on your TV? Our micro-soldering bench at 33 S 52nd St replaces damaged console HDMI ports the same day with a 90-day warranty.",
    ctaLabel: "Call now",
    ctaUrl: "tel:+12155982090",
    publishedAt: "2024-10-24",
    views: 318,
    clicks: 19,
  },
  {
    id: 3,
    storeId: 2,
    type: "Update",
    title: "Express 25-Minute Battery Swaps at 4016 Lancaster Ave",
    body: "Drop off your phone near University City & Drexel at 4016 Lancaster Ave and pick it up with 100% battery health in under 30 minutes.",
    ctaLabel: "Get directions",
    ctaUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
    publishedAt: "2024-10-27",
    views: 245,
    clicks: 16,
  },
  {
    id: 4,
    storeId: 3,
    type: "Offer",
    title: "Free Diagnostic Check on Water-Damaged Devices",
    body: "Spilled coffee or water on your phone or MacBook? Bring it in to 4060 Lancaster Ave immediately—no diagnostic fee if we can't recover it.",
    ctaLabel: "Learn more",
    ctaUrl: "https://smartfonedoctor.com",
    publishedAt: "2024-10-29",
    views: 190,
    clicks: 11,
  },
];

export default function GmbPostsPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } =
    useStoreContext();
  const storeShortName = isAllStores
    ? `All ${stores.length} Philadelphia locations`
    : selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [posts, setPosts] = useState<GmbPost[]>(INITIAL_POSTS);
  const [showComposer, setShowComposer] = useState(false);
  const [form, setForm] = useState({
    type: "Update" as PostType,
    title: "",
    body: "",
    ctaLabel: "Book online",
    couponCode: "",
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowComposer(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const storePosts = isAllStores
    ? posts
    : posts.filter((p) => p.storeId === selectedStoreId);

  const handleDraftWithAI = () => {
    const branchRef = selectedStore.address;
    if (form.type === "Offer") {
      setForm({
        ...form,
        title: "$20 Off Same-Day Screen & Battery Combo Repair",
        body: `Need a fresh screen and battery? Visit Smart Fone Doctor (${branchRef}) this week for fast 30-minute walk-in service backed by our 90-day warranty.`,
        couponCode: "COMBO20",
      });
    } else {
      setForm({
        ...form,
        title: "Walk-In iPhone, Samsung & iPad Repairs Ready Today",
        body: `Our certified technicians at ${branchRef} have OEM-grade screens and batteries in stock. Walk in Monday–Saturday 10:00 AM–7:00 PM—most repairs finish in 30 minutes.`,
      });
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    const created: GmbPost = {
      id: Date.now(),
      storeId: selectedStoreId,
      type: form.type,
      title: form.title.trim(),
      body: form.body.trim(),
      ctaLabel: form.ctaLabel,
      ctaUrl: selectedStore.calendlyUrl,
      couponCode:
        form.type === "Offer" && form.couponCode.trim()
          ? form.couponCode.trim()
          : undefined,
      publishedAt: new Date().toISOString().split("T")[0],
      views: 0,
      clicks: 0,
    };

    setPosts([created, ...posts]);
    setForm({
      type: "Update",
      title: "",
      body: "",
      ctaLabel: "Book online",
      couponCode: "",
    });
    setShowComposer(false);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW + UNDERLINE TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
              Posts &amp; offers
            </h1>
            <p className="text-[14px] text-[#5f6368] mt-1">
              {storePosts.length} published updates for{" "}
              <span className="text-[#111111] font-medium">
                {storeShortName}
              </span>{" "}
              · Publish weekly offers to keep Google Business Profile active
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="h-[32px] self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Google post</span>
          </button>
        </div>

        <LocalSeoNav />
      </div>

      {/* 2. PUBLISHED POSTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storePosts.map((post) => {
          const branchLabel = stores
            .find((s) => s.id === post.storeId)
            ?.name.replace("SmartFoneDoctor - ", "");
          return (
            <article
              key={post.id}
              className="bg-white border border-[#e8e8e8] rounded-[8px] p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium ${
                        post.type === "Offer"
                          ? "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
                          : "bg-[#eeeeee] text-[#111111]"
                      }`}
                    >
                      {post.type === "Offer" ? "Promo offer" : "Store update"}
                    </span>
                    <span className="text-[12px] text-[#5f6368] truncate">
                      {branchLabel}
                    </span>
                  </div>

                  <span className="h-[20px] px-2 rounded-[4px] bg-[#dcfae5] text-[#04250e] text-[12px] font-medium inline-flex items-center">
                    Live on Google
                  </span>
                </div>

                <h2 className="text-[15px] font-semibold text-[#111111] mt-2.5">
                  {post.title}
                </h2>
                <p className="text-[13px] text-[#5f6368] mt-1 leading-relaxed">
                  {post.body}
                </p>

                {post.couponCode && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-[#f9f9f9] border border-[#e8e8e8] text-[12px]">
                    <span className="text-[#5f6368]">Coupon code:</span>
                    <span className="font-mono font-medium text-[#111111]">
                      {post.couponCode}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#f2f2f2] flex items-center justify-between text-[12px] text-[#5f6368]">
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Calendar
                      className="w-3 h-3 text-[#6b6b6b]"
                      aria-hidden="true"
                    />
                    <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                  </span>
                  <span>{post.views} views</span>
                  <span>{post.clicks} clicks</span>
                </div>

                <a
                  href={post.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#111111] hover:underline"
                >
                  <span>{post.ctaLabel}</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* 3. COMPOSER MODAL */}
      {showComposer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compose-post-title"
        >
          <div className="w-full max-w-lg bg-white rounded-[8px] border border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f2f2f2] flex items-center justify-between">
              <div>
                <h2
                  id="compose-post-title"
                  className="text-[16px] font-semibold text-[#111111]"
                >
                  New Google Business post
                </h2>
                <p className="text-[12px] text-[#5f6368] mt-0.5">
                  Publishing to{" "}
                  {selectedStore.name.replace("SmartFoneDoctor - ", "")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                aria-label="Close composer"
                className="p-1 rounded-[5px] text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handlePublish}
              className="p-5 flex flex-col gap-3.5 text-[14px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(["Update", "Offer"] as PostType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`h-[28px] px-2.5 rounded-[5px] text-[13px] transition-colors cursor-pointer ${
                        form.type === t
                          ? "bg-[#eeeeee] text-[#111111] font-medium"
                          : "text-[#5f6368] hover:text-[#111111]"
                      }`}
                    >
                      {t === "Update" ? "Store update" : "Promo offer"}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleDraftWithAI}
                  className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  <span>Draft with AI</span>
                </button>
              </div>

              <div>
                <label
                  htmlFor="post-headline"
                  className="block text-[13px] font-medium text-[#111111] mb-1.5"
                >
                  Headline
                </label>
                <input
                  id="post-headline"
                  type="text"
                  required
                  placeholder="e.g., $15 Off iPhone Screen Replacement This Week"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div>
                <label
                  htmlFor="post-details"
                  className="block text-[13px] font-medium text-[#111111] mb-1.5"
                >
                  Post details
                </label>
                <textarea
                  id="post-details"
                  rows={3}
                  required
                  placeholder="Describe the repair service, turnaround time, or offer details…"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full p-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111] resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="post-cta"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Action button
                  </label>
                  <select
                    id="post-cta"
                    value={form.ctaLabel}
                    onChange={(e) =>
                      setForm({ ...form, ctaLabel: e.target.value })
                    }
                    className="w-full h-[38px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="Book online">Book online</option>
                    <option value="Call now">Call now</option>
                    <option value="Get directions">Get directions</option>
                    <option value="Learn more">Learn more</option>
                  </select>
                </div>

                {form.type === "Offer" && (
                  <div>
                    <label
                      htmlFor="post-coupon"
                      className="block text-[13px] font-medium text-[#111111] mb-1.5"
                    >
                      Coupon code
                    </label>
                    <input
                      id="post-coupon"
                      type="text"
                      placeholder="e.g., PHILLY15"
                      value={form.couponCode}
                      onChange={(e) =>
                        setForm({ ...form, couponCode: e.target.value })
                      }
                      className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f2f2]">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
                >
                  Publish to Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
