"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import LocalSeoNav from "@/components/Dashboard/LocalSeoNav";
import {
  ExternalLink,
  ArrowRight,
  Plus,
  MessageSquare,
  MapPin,
  PhoneCall,
  Navigation,
  Globe,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { getGmbOverviewAction, type GmbOverviewData } from "@/actions/localSeo";

const FALLBACK_GMB_DATA: Record<number, GmbOverviewData> = {
  1: {
    impressions: 3840,
    profileViews: 612,
    calls: 214,
    directions: 178,
    websiteClicks: 145,
    messages: 34,
    reviews: 50,
    unrepliedReviews: 3,
    rating: 4.8,
    daysSinceLastPost: 9,
    activeOffersCount: 1,
    activeUpdatesCount: 1,
    monthlyTrend: [
      { month: "Jun", searchViews: 1800, mapViews: 1100, calls: 165, directions: 130 },
      { month: "Jul", searchViews: 1920, mapViews: 1180, calls: 180, directions: 145 },
      { month: "Aug", searchViews: 2100, mapViews: 1300, calls: 195, directions: 158 },
      { month: "Sep", searchViews: 2210, mapViews: 1390, calls: 200, directions: 165 },
      { month: "Oct", searchViews: 2280, mapViews: 1420, calls: 208, directions: 171 },
      { month: "Nov", searchViews: 2360, mapViews: 1480, calls: 214, directions: 178 },
    ],
  },
  2: {
    impressions: 2210,
    profileViews: 340,
    calls: 143,
    directions: 97,
    websiteClicks: 88,
    messages: 19,
    reviews: 89,
    unrepliedReviews: 2,
    rating: 4.6,
    daysSinceLastPost: 16,
    activeOffersCount: 0,
    activeUpdatesCount: 1,
    monthlyTrend: [
      { month: "Jun", searchViews: 1050, mapViews: 650, calls: 110, directions: 72 },
      { month: "Jul", searchViews: 1140, mapViews: 710, calls: 118, directions: 78 },
      { month: "Aug", searchViews: 1210, mapViews: 770, calls: 125, directions: 83 },
      { month: "Sep", searchViews: 1260, mapViews: 790, calls: 131, directions: 88 },
      { month: "Oct", searchViews: 1310, mapViews: 830, calls: 138, directions: 93 },
      { month: "Nov", searchViews: 1360, mapViews: 850, calls: 143, directions: 97 },
    ],
  },
  3: {
    impressions: 1760,
    profileViews: 265,
    calls: 98,
    directions: 74,
    websiteClicks: 64,
    messages: 12,
    reviews: 61,
    unrepliedReviews: 1,
    rating: 4.5,
    daysSinceLastPost: 14,
    activeOffersCount: 1,
    activeUpdatesCount: 0,
    monthlyTrend: [
      { month: "Jun", searchViews: 820, mapViews: 480, calls: 72, directions: 54 },
      { month: "Jul", searchViews: 900, mapViews: 520, calls: 79, directions: 59 },
      { month: "Aug", searchViews: 960, mapViews: 580, calls: 84, directions: 63 },
      { month: "Sep", searchViews: 1010, mapViews: 610, calls: 89, directions: 67 },
      { month: "Oct", searchViews: 1060, mapViews: 640, calls: 94, directions: 71 },
      { month: "Nov", searchViews: 1100, mapViews: 660, calls: 98, directions: 74 },
    ],
  },
};

export default function LocalSEOPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } = useStoreContext();
  const [data, setData] = useState<GmbOverviewData>(
    FALLBACK_GMB_DATA[selectedStoreId] ?? FALLBACK_GMB_DATA[1]
  );

  const storeShortName = isAllStores
    ? `All ${stores.length} Philadelphia locations`
    : selectedStore.name.replace("SmartFoneDoctor - ", "");

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      const res = await getGmbOverviewAction(isAllStores ? undefined : selectedStoreId);
      if (isMounted && res.success && res.data) {
        setData(res.data);
      }
    }
    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [selectedStoreId, isAllStores]);

  const totalActions = data.calls + data.directions + data.websiteClicks + data.messages;

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Google Business Profile &amp; Local SEO
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-gray-800">{storeShortName}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {data.rating.toFixed(1)} / 5.0
              </span>
              <span>({data.reviews} reviews)</span>
              <span>·</span>
              <span className={data.unrepliedReviews > 0 ? "text-amber-700 font-medium" : "text-gray-500"}>
                {data.unrepliedReviews} {data.unrepliedReviews === 1 ? "review needs" : "reviews need"} reply
              </span>
              <span>·</span>
              <span>Last post {data.daysSinceLastPost} days ago</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <a
              href={selectedStore.gmbUrl}
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#009691]" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            <Link
              href="/admin/reviews"
              className="h-9 px-3.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Reviews ({data.unrepliedReviews})</span>
            </Link>

            <Link
              href="/admin/local-seo/posts"
              className="h-9 px-4 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Post / Offer</span>
            </Link>
          </div>
        </div>

        {/* SUB NAVIGATION */}
        <LocalSeoNav />
      </div>

      {/* ── 2. PERFORMANCE METRIC CARDS ── */}
      <section aria-label="30-day performance funnel" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block">
            Search Impressions (30d)
          </span>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-900 block">
              {data.impressions.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-medium block mt-1">
              +6.2% vs previous 30 days
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block">
            Profile Views (30d)
          </span>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-900 block">
              {data.profileViews.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              {Math.round((data.profileViews / (data.impressions || 1)) * 100)}% view rate from search
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block">
            Customer Actions (30d)
          </span>
          <div className="mt-1">
            <span className="text-2xl font-bold text-[#009691] block">
              {totalActions.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-medium block mt-1">
              {Math.round((totalActions / (data.profileViews || 1)) * 100)}% conversion rate
            </span>
          </div>
        </div>

        {/* Metric 4: Key Conversion Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block mb-2">
            Action Breakdown
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Phone calls</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data.calls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Directions</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data.directions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Website visits</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data.websiteClicks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Messages</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data.messages}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CHARTS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Discovery Impressions Bar Chart */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Discovery Impressions
              </h2>
              <p className="text-xs text-gray-500">
                Google Search vs Google Maps views
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#009691]" />
                <span>Search</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-300" />
                <span>Maps</span>
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data.monthlyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={{ stroke: "#e2e8f0" }} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 6,
                  borderColor: "#e2e8f0",
                }}
              />
              <Bar dataKey="searchViews" fill="#009691" name="Google Search" />
              <Bar dataKey="mapViews" fill="#cbd5e1" name="Google Maps" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Calls & Directions Line Chart */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Calls &amp; Directions Requests
              </h2>
              <p className="text-xs text-gray-500">
                High-intent customer actions per month
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#009691]" />
                <span>Phone calls</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Directions</span>
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={data.monthlyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={{ stroke: "#e2e8f0" }} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 6,
                  borderColor: "#e2e8f0",
                }}
              />
              <Line type="monotone" dataKey="calls" stroke="#009691" strokeWidth={2} dot={false} name="Phone calls" />
              <Line type="monotone" dataKey="directions" stroke="#94a3b8" strokeWidth={2} dot={false} name="Directions" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 4. SEARCH QUERIES & NEARBY BENCHMARKS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trending Search Terms */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Popular Local Search Queries
              </h2>
              <p className="text-xs text-gray-500">
                Top repair searches in Philadelphia
              </p>
            </div>
            <Link
              href="/admin/local-seo/posts"
              className="text-xs font-medium text-[#009691] hover:underline inline-flex items-center gap-1"
            >
              <span>Create post</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {[
              { term: "iPhone 15 / 16 screen replacement", change: "+126%", searchVol: "1,420 / mo" },
              { term: "PS5 HDMI port repair same day", change: "+118%", searchVol: "890 / mo" },
              { term: "MacBook battery replacement West Philly", change: "+94%", searchVol: "640 / mo" },
              { term: "Same-day cell phone repair near 52nd St", change: "+78%", searchVol: "1,850 / mo" },
            ].map((item) => (
              <div key={item.term} className="py-2.5 flex items-center justify-between gap-3">
                <span className="font-medium text-gray-800 truncate">{item.term}</span>
                <span className="text-xs text-gray-500 tabular-nums shrink-0">{item.searchVol}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Competitors */}
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Nearby Competitor Benchmark
              </h2>
              <p className="text-xs text-gray-500">
                Compared against {storeShortName}
              </p>
            </div>
            <Link
              href="/admin/listings"
              className="text-xs font-medium text-[#009691] hover:underline inline-flex items-center gap-1"
            >
              <span>View listings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 text-xs">
            {[
              {
                name: "SmartFoneDoctor (Your Store)",
                sub: "Flagship West Philly · 500+ reviews",
                rating: "4.9",
              },
              {
                name: "iPhone Repair Philly - University City",
                sub: "0.8 mi away · 94 reviews",
                rating: "4.6",
              },
              {
                name: "Mr Fix Cell Phone & Computer Repair",
                sub: "1.4 mi away · 68 reviews",
                rating: "4.4",
              },
              {
                name: "Apple Store Walnut Street",
                sub: "2.3 mi away · Appointment required",
                rating: "2.9",
              },
            ].map((comp, idx) => (
              <div key={comp.name} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className={`block truncate ${idx === 0 ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {comp.name}
                  </span>
                  <span className="text-[11px] text-gray-400 block truncate">{comp.sub}</span>
                </div>
                <span className="text-xs font-medium text-gray-700 tabular-nums shrink-0">
                  ★ {comp.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}