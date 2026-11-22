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
  Trash2,
  CheckCircle2,
  MapPin,
  Tag,
  Megaphone,
  Eye,
  MousePointerClick,
  Copy,
  Check,
  Search,
  Store,
} from "lucide-react";
import {
  getGmbPostsAction,
  createGmbPostAction,
  deleteGmbPostAction,
  GmbPostItem,
} from "@/actions/localSeo";

type PostType = "Update" | "Offer";

export default function GmbPostsPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } = useStoreContext();
  const storeShortName = isAllStores
    ? `All ${stores.length} Philadelphia locations`
    : selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [posts, setPosts] = useState<GmbPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"All" | "Offer" | "Update">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    type: "Update" as PostType,
    title: "",
    body: "",
    ctaLabel: "Book online",
    couponCode: "",
  });

  // Load from PostgreSQL DB & sync with GMB
  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      const res = await getGmbPostsAction();
      if (res.success && res.posts) {
        setPosts(res.posts);
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

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

  const filteredPosts = storePosts.filter((p) => {
    const matchesType = filterType === "All" || p.type === filterType;
    const matchesSearch =
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleDraftWithAI = () => {
    const branchRef = selectedStore.address;
    if (form.type === "Offer") {
      setForm({
        ...form,
        title: "$20 Off Same-Day Screen & Battery Combo Repair",
        body: `Need a fresh screen and battery? Visit SmartFoneDoctor at ${branchRef} this week for fast 30-minute walk-in service backed by our 90-day warranty.`,
        couponCode: "COMBO20",
      });
    } else {
      setForm({
        ...form,
        title: "Express 30-Minute iPhone, Samsung & MacBook Repair",
        body: `Our certified repair specialists at ${branchRef} have OEM-grade parts in stock. Walk in Monday–Saturday 10:00 AM–7:00 PM—most screen and battery repairs take under 30 minutes.`,
      });
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    setPublishing(true);
    const targetStoreId = isAllStores ? 1 : selectedStoreId;

    const res = await createGmbPostAction({
      storeId: targetStoreId,
      type: form.type,
      title: form.title.trim(),
      body: form.body.trim(),
      ctaLabel: form.ctaLabel,
      ctaUrl: selectedStore.calendlyUrl,
      couponCode: form.type === "Offer" && form.couponCode.trim() ? form.couponCode.trim() : undefined,
    });

    if (res.success && res.post) {
      setPosts((prev) => [res.post!, ...prev]);
      setForm({
        type: "Update",
        title: "",
        body: "",
        ctaLabel: "Book online",
        couponCode: "",
      });
      setShowComposer(false);
    }
    setPublishing(false);
  };

  const handleDeletePost = async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await deleteGmbPostAction(id);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* ── 1. HEADER ROW ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-gray-900">
                Google Business posts
              </h1>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                API &amp; DB Synced
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Updates and offers for your Google Business Profile.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="h-9 px-4 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Google Post</span>
            </button>
          </div>
        </div>

        {/* SUB NAVIGATION */}
        <LocalSeoNav />
      </div>

      {/* ── 2. FILTER & SEARCH CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterType === "All"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            All Posts ({storePosts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Offer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterType === "Offer"
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            Promo Offers ({storePosts.filter((p) => p.type === "Offer").length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("Update")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filterType === "Update"
                ? "bg-[#009691] text-white"
                : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            Store Updates ({storePosts.filter((p) => p.type === "Update").length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
          />
        </div>
      </div>

      {/* ── 3. PUBLISHED POSTS GRID (CLEAN CSS & UX) ── */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-2">
          <Megaphone className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-800">No Google Posts Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? "No posts match your search query."
              : `Publish a new offer or repair announcement for ${storeShortName} to boost Google Maps impressions.`}
          </p>
          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="mt-2 h-8 px-3.5 rounded-lg bg-[#009691] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Post</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const branch = stores.find((s) => s.id === post.storeId);
            const branchLabel = branch?.name.replace("SmartFoneDoctor - ", "") || "West Philly Flagship";

            return (
              <article
                key={post.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs hover:border-[#009691]/40 transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  {/* CARD HEADER ROW */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      {post.type === "Offer" ? (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-600" />
                          <span>Promo Offer</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                          <Megaphone className="w-3 h-3 text-slate-600" />
                          <span>Store Update</span>
                        </span>
                      )}

                      <span className="text-xs text-gray-500 font-medium inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{branchLabel}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live on Google</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                        title="Delete this post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <h3 className="text-sm font-bold text-gray-900 mt-3 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    {post.body}
                  </p>

                  {/* COUPON CODE BOX */}
                  {post.couponCode && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-dashed border-amber-300 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-700 font-medium">Coupon Code:</span>
                        <code className="font-mono font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded">
                          {post.couponCode}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(post.couponCode!)}
                        className="text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCoupon === post.couponCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* CARD FOOTER ROW */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span>{post.views} views</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3 text-gray-400" />
                      <span>{post.clicks} clicks</span>
                    </span>
                  </div>

                  <a
                    href={post.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-[#009691] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{post.ctaLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── 4. COMPOSER MODAL (CLEAN SHADCN STYLE) ── */}
      {showComposer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  New Google Business Post
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Publishing update for <span className="font-semibold text-gray-800">{storeShortName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "Update" })}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      form.type === "Update"
                        ? "bg-white text-gray-900 shadow-2xs font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Store Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "Offer" })}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      form.type === "Offer"
                        ? "bg-white text-amber-800 shadow-2xs font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Promo Offer
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDraftWithAI}
                  className="h-7 px-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#009691]" />
                  <span>Draft with AI</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Post Headline / Offer Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. $15 Off iPhone 15 / 16 Screen Replacement"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-8 px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Post Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the repair service, warranty, turnaround time, or offer terms…"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#009691] resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Call To Action Button
                  </label>
                  <select
                    value={form.ctaLabel}
                    onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#009691]"
                  >
                    <option value="Book online">Book online</option>
                    <option value="Call now">Call now</option>
                    <option value="Get directions">Get directions</option>
                    <option value="Learn more">Learn more</option>
                  </select>
                </div>

                {form.type === "Offer" && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Coupon Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PHILLY15"
                      value={form.couponCode}
                      onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
                      className="w-full h-8 px-3 rounded-lg border border-gray-300 text-xs uppercase focus:outline-none focus:border-[#009691]"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowComposer(false)}
                  className="h-8 px-3 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="h-8 px-4 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
                >
                  {publishing ? "Publishing..." : "Publish to Google & DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}