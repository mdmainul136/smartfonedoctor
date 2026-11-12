"use client";

import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import LocalSeoNav from "@/components/Dashboard/LocalSeoNav";
import { ExternalLink, ArrowRight } from "lucide-react";
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

const GMB_DATA: Record<
  number,
  {
    impressions: number;
    profileViews: number;
    calls: number;
    directions: number;
    websiteClicks: number;
    messages: number;
    reviews: number;
    unrepliedReviews: number;
    rating: number;
    daysSinceLastPost: number;
    monthlyTrend: {
      month: string;
      searchViews: number;
      mapViews: number;
      calls: number;
      directions: number;
    }[];
  }
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
  const { stores, selectedStoreId, selectedStore, isAllStores } =
    useStoreContext();
  const storeShortName = isAllStores
    ? `All ${stores.length} Philadelphia locations`
    : selectedStore.name.replace("SmartFoneDoctor - ", "");
  const data = isAllStores
    ? {
        impressions:
          GMB_DATA[1].impressions +
          GMB_DATA[2].impressions +
          GMB_DATA[3].impressions,
        profileViews:
          GMB_DATA[1].profileViews +
          GMB_DATA[2].profileViews +
          GMB_DATA[3].profileViews,
        calls: GMB_DATA[1].calls + GMB_DATA[2].calls + GMB_DATA[3].calls,
        directions:
          GMB_DATA[1].directions +
          GMB_DATA[2].directions +
          GMB_DATA[3].directions,
        websiteClicks:
          GMB_DATA[1].websiteClicks +
          GMB_DATA[2].websiteClicks +
          GMB_DATA[3].websiteClicks,
        messages:
          GMB_DATA[1].messages + GMB_DATA[2].messages + GMB_DATA[3].messages,
        reviews:
          GMB_DATA[1].reviews + GMB_DATA[2].reviews + GMB_DATA[3].reviews,
        unrepliedReviews:
          GMB_DATA[1].unrepliedReviews +
          GMB_DATA[2].unrepliedReviews +
          GMB_DATA[3].unrepliedReviews,
        rating: 4.7,
        daysSinceLastPost: 9,
        monthlyTrend: GMB_DATA[1].monthlyTrend.map((m, idx) => ({
          month: m.month,
          searchViews:
            m.searchViews +
            GMB_DATA[2].monthlyTrend[idx].searchViews +
            GMB_DATA[3].monthlyTrend[idx].searchViews,
          mapViews:
            m.mapViews +
            GMB_DATA[2].monthlyTrend[idx].mapViews +
            GMB_DATA[3].monthlyTrend[idx].mapViews,
          calls:
            m.calls +
            GMB_DATA[2].monthlyTrend[idx].calls +
            GMB_DATA[3].monthlyTrend[idx].calls,
          directions:
            m.directions +
            GMB_DATA[2].monthlyTrend[idx].directions +
            GMB_DATA[3].monthlyTrend[idx].directions,
        })),
      }
    : GMB_DATA[selectedStoreId] ?? GMB_DATA[1];
  const totalActions =
    data.calls + data.directions + data.websiteClicks + data.messages;

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW + UNDERLINE TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
              GMB &amp; Local SEO
            </h1>
            <p className="text-[14px] text-[#5f6368] mt-1">
              <span className="text-[#111111] font-medium">{storeShortName}</span>{" "}
              is rated {data.rating.toFixed(1)} /5 ({data.reviews} reviews) ·{" "}
              {data.unrepliedReviews} {data.unrepliedReviews === 1 ? "review needs" : "reviews need"} a reply and last Google post was {data.daysSinceLastPost} days ago
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={selectedStore.gmbUrl}
              target="_blank"
              rel="noreferrer"
              className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Open Google Maps</span>
              <ExternalLink className="w-3 h-3 text-[#6b6b6b]" aria-hidden="true" />
            </a>

            <Link
              href="/portal/reviews"
              className="h-[32px] px-3 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Reply to reviews ({data.unrepliedReviews})</span>
            </Link>
          </div>
        </div>

        <LocalSeoNav />
      </div>

      {/* 2. DIVIDED 30-DAY PERFORMANCE FUNNEL (1 container split by 1px hairlines, no icons) */}
      <section
        aria-label="Last 30 days performance funnel"
        className="bg-white border border-[#e8e8e8] rounded-[8px] grid grid-cols-2 lg:grid-cols-4"
      >
        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">
            Search &amp; map impressions (30d)
          </span>
          <div className="mt-1.5">
            <span className="text-[28px] font-semibold text-[#111111] tabular-nums leading-none">
              {data.impressions.toLocaleString()}
            </span>
            <span className="block text-[12px] text-[#5f6368] mt-1">
              +6.2% vs prior 30 days
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Profile views (30d)</span>
          <div className="mt-1.5">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {data.profileViews.toLocaleString()}
            </span>
            <span className="block text-[12px] text-[#5f6368] mt-1">
              {Math.round((data.profileViews / data.impressions) * 100)}% view rate from search
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Customer actions (30d)</span>
          <div className="mt-1.5">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {totalActions}
            </span>
            <span className="block text-[12px] text-[#247b50] mt-1">
              {Math.round((totalActions / data.profileViews) * 100)}% conversion from views
            </span>
          </div>
        </div>

        {/* Key-value breakdown cell */}
        <div className="p-4 flex flex-col justify-center gap-1.5 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-[#5f6368]">Phone calls</span>
            <span className="font-medium text-[#111111] tabular-nums">
              {data.calls}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5f6368]">Directions requests</span>
            <span className="font-medium text-[#111111] tabular-nums">
              {data.directions}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5f6368]">Website clicks</span>
            <span className="font-medium text-[#111111] tabular-nums">
              {data.websiteClicks}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5f6368]">Messages &amp; bookings</span>
            <span className="font-medium text-[#111111] tabular-nums">
              {data.messages}
            </span>
          </div>
        </div>
      </section>

      {/* 3. CHARTS ROW (Minimal chrome, 4 faint horizontal gridlines, no y-axis line, square bars & straight lines) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[8px] border border-[#e8e8e8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Discovery impressions
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Jun – Nov · Google Search vs Maps
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#5f6368]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#009691]" />
                Search
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#d1d5db]" />
                Maps
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={data.monthlyTrend}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e5e5e5"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#5f6368" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#5f6368" }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 6,
                  borderColor: "#e5e7eb",
                  boxShadow: "none",
                }}
              />
              <Bar dataKey="searchViews" fill="#009691" name="Google Search" />
              <Bar dataKey="mapViews" fill="#d1d5db" name="Google Maps" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 rounded-[8px] border border-[#e8e8e8]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Customer calls &amp; direction requests
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Jun – Nov · Direct conversions per month
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#5f6368]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#111111]" />
                Calls
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#949494]" />
                Directions
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <LineChart
              data={data.monthlyTrend}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e5e5e5"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#5f6368" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#5f6368" }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 6,
                  borderColor: "#e5e7eb",
                  boxShadow: "none",
                }}
              />
              <Line
                type="linear"
                dataKey="calls"
                stroke="#111111"
                strokeWidth={2}
                dot={false}
                name="Phone calls"
              />
              <Line
                type="linear"
                dataKey="directions"
                stroke="#949494"
                strokeWidth={2}
                dot={false}
                name="Directions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. PHILADELPHIA SEARCH DEMAND & NEARBY COMPETITOR BENCHMARK (Balanced 4-row cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Trending Search Terms */}
        <div className="bg-white p-5 rounded-[8px] border border-[#e8e8e8] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Trending search terms in Philadelphia
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Last 14 days vs prior 14 days · University City &amp; West Philly
              </p>
            </div>
            <Link
              href="/portal/local-seo/posts"
              className="text-[13px] font-medium text-[#111111] hover:underline inline-flex items-center gap-1"
            >
              <span>Publish offer</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-[#f2f2f2] text-[14px]">
            {[
              { term: "iPhone 15 / 16 back glass repair", change: "+126%" },
              { term: "HDMI port / gaming console repair", change: "+118%" },
              { term: "Apple Watch screen replacement", change: "+78%" },
              { term: "Same-day cell phone repair", change: "+27%" },
            ].map((item) => (
              <div
                key={item.term}
                className="h-[44px] flex items-center justify-between gap-3"
              >
                <span className="text-[#111111] truncate">{item.term}</span>
                <span className="text-[13px] text-[#247b50] font-medium tabular-nums shrink-0">
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Competitors */}
        <div className="bg-white p-5 rounded-[8px] border border-[#e8e8e8] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Nearby Philadelphia competitors
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Last 30 days · Compared against {storeShortName}
              </p>
            </div>
            <Link
              href="/portal/listings"
              className="text-[13px] font-medium text-[#111111] hover:underline inline-flex items-center gap-1"
            >
              <span>Check citations</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-[#f2f2f2] text-[14px]">
            {[
              {
                name: "iPhone Repair Philly - University City",
                sub: "0.8 mi · 94 reviews",
                rating: "4.6",
              },
              {
                name: "Mr Fix Cell Phone & Computer Repair",
                sub: "1.4 mi · 68 reviews",
                rating: "4.4",
              },
              {
                name: "Apple Walnut Street",
                sub: "2.3 mi · 215 reviews (2h+ appointment wait complaints)",
                rating: "2.9",
              },
              {
                name: "GadgetSolutions Philadelphia",
                sub: "3.1 mi · 41 reviews",
                rating: "4.7",
              },
            ].map((comp) => (
              <div
                key={comp.name}
                className="h-[44px] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="text-[#111111] font-medium truncate block leading-tight">
                    {comp.name}
                  </span>
                  <span className="text-[12px] text-[#5f6368] truncate block leading-tight">
                    {comp.sub}
                  </span>
                </div>
                <span className="text-[13px] text-[#111111] tabular-nums shrink-0">
                  {comp.rating}
                  <span className="text-[12px] text-[#6b6b6b]"> /5</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
