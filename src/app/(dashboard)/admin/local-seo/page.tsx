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
  TrendingUp,
  MapPin,
  PhoneCall,
  Navigation,
  Globe,
  Star,
  CheckCircle2,
  RefreshCw,
  Eye,
  Megaphone,
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

const FALLBACK_GMB_DATA: Record<
  number,
  GmbOverviewData
> = {
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
  const [isLoading, setIsLoading] = useState(false);

  const storeShortName = isAllStores
    ? `All ${stores.length} Philadelphia locations`
    : selectedStore.name.replace("SmartFoneDoctor - ", "");

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      setIsLoading(true);
      const res = await getGmbOverviewAction(isAllStores ? undefined : selectedStoreId);
      if (isMounted && res.success && res.data) {
        setData(res.data);
      }
      if (isMounted) setIsLoading(false);
    }
    loadMetrics();
    return () => {
      isMounted = false;
    };
  }, [selectedStoreId, isAllStores]);

  const totalActions = data.calls + data.directions + data.websiteClicks + data.messages;

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* ── 1. MATERIAL 3 HERO ROW ── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                GMB &amp; Local SEO
              </h1>
              <span className="bg-[#009691]/10 text-[#009691] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#009691]/20 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Google Verified Profile
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800">{storeShortName}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {data.rating.toFixed(1)} / 5.0
              </span>
              <span>({data.reviews} reviews)</span>
              <span>·</span>
              <span className={data.unrepliedReviews > 0 ? "text-amber-700 font-semibold" : "text-emerald-700"}>
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
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#009691]" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <Link
              href="/admin/reviews"
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Reviews ({data.unrepliedReviews})</span>
            </Link>

            <Link
              href="/admin/local-seo/posts"
              className="h-9 px-4 rounded-xl bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Publish Post / Offer</span>
            </Link>
          </div>
        </div>

        {/* SUB NAVIGATION */}
        <LocalSeoNav />
      </div>

      {/* ── 2. MATERIAL 3 PERFORMANCE FUNNEL TILES ── */}
      <section
        aria-label="30-day performance funnel"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-[#009691]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Impressions (30d)
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#009691]/10 flex items-center justify-center text-[#009691]">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums block">
              {data.impressions.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+6.2% vs prior month</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-[#009691]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Profile Views (30d)
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums block">
              {data.profileViews.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              {Math.round((data.profileViews / (data.impressions || 1)) * 100)}% view rate from search
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between hover:border-[#009691]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Customer Actions (30d)
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <PhoneCall className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-[#009691] tracking-tight tabular-nums block">
              {totalActions.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              {Math.round((totalActions / (data.profileViews || 1)) * 100)}% conversion rate
            </span>
          </div>
        </div>

        {/* Metric 4: Key Conversion Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Action Breakdown
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 inline-flex items-center gap-1.5">
                <PhoneCall className="w-3 h-3 text-[#009691]" />
                Phone calls
              </span>
              <span className="font-bold text-slate-900 tabular-nums">{data.calls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 inline-flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-teal-600" />
                Directions
              </span>
              <span className="font-bold text-slate-900 tabular-nums">{data.directions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 inline-flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-sky-600" />
                Website visits
              </span>
              <span className="font-bold text-slate-900 tabular-nums">{data.websiteClicks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 inline-flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-indigo-600" />
                Messages
              </span>
              <span className="font-bold text-slate-900 tabular-nums">{data.messages}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CHARTS ROW WITH BRAND TEAL PALETTE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Discovery Impressions Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Discovery Impressions
              </h2>
              <p className="text-xs text-slate-500">
                Jun – Nov · Google Search vs Google Maps
              </p>
            </div>
            <div className="flex items-center gap-3.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#009691]" />
                <span className="font-medium text-slate-700">Search</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#99F6E4] border border-[#2DD4BF]" />
                <span className="font-medium text-slate-700">Maps</span>
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.monthlyTrend}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#F1F5F9"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  borderColor: "#E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              />
              <Bar dataKey="searchViews" fill="#009691" radius={[4, 4, 0, 0]} name="Google Search" />
              <Bar dataKey="mapViews" fill="#99F6E4" stroke="#2DD4BF" radius={[4, 4, 0, 0]} name="Google Maps" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Calls & Directions Line Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Direct Conversion Trend
              </h2>
              <p className="text-xs text-slate-500">
                Jun – Nov · High-intent calls &amp; navigation requests
              </p>
            </div>
            <div className="flex items-center gap-3.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#009691]" />
                <span className="font-medium text-slate-700">Phone Calls</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
                <span className="font-medium text-slate-700">Directions</span>
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data.monthlyTrend}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#F1F5F9"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#64748B" }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  borderColor: "#E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              />
              <Line
                type="monotone"
                dataKey="calls"
                stroke="#009691"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#009691" }}
                name="Phone Calls"
              />
              <Line
                type="monotone"
                dataKey="directions"
                stroke="#64748B"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#64748B" }}
                name="Directions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 4. PHILADELPHIA LOCAL SEARCH DEMAND & COMPETITOR RADAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trending Search Terms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Trending Philadelphia Search Queries
                </h2>
                <p className="text-xs text-slate-500">
                  Top repair demand in West Philly &amp; University City (Last 14 days)
                </p>
              </div>
              <Link
                href="/admin/local-seo/posts"
                className="text-xs font-bold text-[#009691] hover:text-[#007f7b] inline-flex items-center gap-1"
              >
                <span>Target in post</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                { term: "iPhone 15 / 16 Pro back glass laser repair", change: "+126%", searchVol: "1,420/mo" },
                { term: "PS5 HDMI port replacement same day", change: "+118%", searchVol: "890/mo" },
                { term: "MacBook liquid damage logic board clean", change: "+94%", searchVol: "640/mo" },
                { term: "Walk-in cell phone screen repair near 52nd St", change: "+78%", searchVol: "1,850/mo" },
              ].map((item) => (
                <div key={item.term} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 block truncate">{item.term}</span>
                    <span className="text-[11px] text-slate-400">Est. local search volume: {item.searchVol}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200 shrink-0">
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Auto-synced into AI Search bio keywords</span>
            <Link
              href="/admin/listings/ai-visibility"
              className="text-[#009691] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>View AI Knowledge Graph</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Nearby Competitors Radar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Nearby Philadelphia Competitor Radar
                </h2>
                <p className="text-xs text-slate-500">
                  Local citation &amp; review benchmark vs {storeShortName}
                </p>
              </div>
              <Link
                href="/admin/listings"
                className="text-xs font-bold text-[#009691] hover:text-[#007f7b] inline-flex items-center gap-1"
              >
                <span>Audit citations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {[
                {
                  name: "SmartFoneDoctor (Your Store)",
                  sub: "Flagship West Philly · 500+ reviews",
                  rating: "4.9",
                  highlight: true,
                },
                {
                  name: "iPhone Repair Philly - University City",
                  sub: "0.8 mi away · 94 reviews",
                  rating: "4.6",
                  highlight: false,
                },
                {
                  name: "Mr Fix Cell Phone & Computer Repair",
                  sub: "1.4 mi away · 68 reviews",
                  rating: "4.4",
                  highlight: false,
                },
                {
                  name: "Apple Store Walnut Street",
                  sub: "2.3 mi away · Long repair wait times",
                  rating: "2.9",
                  highlight: false,
                },
              ].map((comp) => (
                <div
                  key={comp.name}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 ${
                    comp.highlight ? "bg-[#009691]/5 border border-[#009691]/20 my-1" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <span
                      className={`block font-semibold truncate ${
                        comp.highlight ? "text-[#009691] font-bold" : "text-slate-800"
                      }`}
                    >
                      {comp.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">{comp.sub}</span>
                  </div>
                  <span
                    className={`text-xs tabular-nums font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      comp.highlight
                        ? "bg-[#009691] text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    ★ {comp.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">30+ local directory citations monitored</span>
            <Link
              href="/admin/listings/catalog"
              className="text-[#009691] font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Explore Directory Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}