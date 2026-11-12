"use client";

import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import { ArrowRight, Plus, ExternalLink } from "lucide-react";
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

const STORE_METRICS: Record<
  number,
  {
    inquiries: number;
    onBench: number;
    completed: number;
    rating: string;
    reviews: number;
    napAccuracy: string;
    weeklyVolume: { day: string; screens: number; batteriesAndPorts: number }[];
    monthlyRevenue: { month: string; revenue: number; partsCost: number }[];
    appointments: {
      id: number;
      customer: string;
      device: string;
      time: string;
      branch: string;
      status: "On bench" | "Ready" | "Scheduled";
    }[];
  }
> = {
  1: {
    inquiries: 24,
    onBench: 7,
    completed: 148,
    rating: "4.8",
    reviews: 50,
    napAccuracy: "89%",
    weeklyVolume: [
      { day: "Mon", screens: 14, batteriesAndPorts: 8 },
      { day: "Tue", screens: 18, batteriesAndPorts: 11 },
      { day: "Wed", screens: 21, batteriesAndPorts: 14 },
      { day: "Thu", screens: 19, batteriesAndPorts: 13 },
      { day: "Fri", screens: 25, batteriesAndPorts: 17 },
      { day: "Sat", screens: 29, batteriesAndPorts: 20 },
    ],
    monthlyRevenue: [
      { month: "Jun", revenue: 8400, partsCost: 3100 },
      { month: "Jul", revenue: 9200, partsCost: 3400 },
      { month: "Aug", revenue: 10400, partsCost: 3800 },
      { month: "Sep", revenue: 11100, partsCost: 4050 },
      { month: "Oct", revenue: 11800, partsCost: 4200 },
      { month: "Nov", revenue: 12450, partsCost: 4400 },
    ],
    appointments: [
      {
        id: 1,
        customer: "Marcus Johnson",
        device: "iPhone 15 Pro — OEM OLED Screen",
        time: "10:30 AM",
        branch: "33 S 52nd St",
        status: "On bench",
      },
      {
        id: 2,
        customer: "Priya Patel",
        device: "Google Pixel 8 — USB-C Port",
        time: "12:15 PM",
        branch: "33 S 52nd St",
        status: "Ready",
      },
      {
        id: 3,
        customer: "Antoine Vance",
        device: "PS5 Console — HDMI Micro-Soldering",
        time: "02:30 PM",
        branch: "33 S 52nd St",
        status: "Scheduled",
      },
    ],
  },
  2: {
    inquiries: 15,
    onBench: 5,
    completed: 112,
    rating: "4.6",
    reviews: 89,
    napAccuracy: "71%",
    weeklyVolume: [
      { day: "Mon", screens: 10, batteriesAndPorts: 6 },
      { day: "Tue", screens: 12, batteriesAndPorts: 9 },
      { day: "Wed", screens: 15, batteriesAndPorts: 11 },
      { day: "Thu", screens: 14, batteriesAndPorts: 10 },
      { day: "Fri", screens: 18, batteriesAndPorts: 13 },
      { day: "Sat", screens: 22, batteriesAndPorts: 15 },
    ],
    monthlyRevenue: [
      { month: "Jun", revenue: 6200, partsCost: 2300 },
      { month: "Jul", revenue: 6800, partsCost: 2500 },
      { month: "Aug", revenue: 7500, partsCost: 2800 },
      { month: "Sep", revenue: 8100, partsCost: 3000 },
      { month: "Oct", revenue: 8600, partsCost: 3150 },
      { month: "Nov", revenue: 9100, partsCost: 3300 },
    ],
    appointments: [
      {
        id: 4,
        customer: "Aliyah Thompson",
        device: "Samsung Galaxy S23 — Battery Swap",
        time: "11:00 AM",
        branch: "4016 Lancaster Ave",
        status: "On bench",
      },
      {
        id: 5,
        customer: "James Williams",
        device: "MacBook Air M2 — Screen Assembly",
        time: "01:45 PM",
        branch: "4016 Lancaster Ave",
        status: "Scheduled",
      },
      {
        id: 6,
        customer: "Maria Garcia",
        device: "iPhone 14 — Back Glass Laser",
        time: "04:00 PM",
        branch: "4016 Lancaster Ave",
        status: "Ready",
      },
    ],
  },
  3: {
    inquiries: 11,
    onBench: 4,
    completed: 82,
    rating: "4.5",
    reviews: 61,
    napAccuracy: "79%",
    weeklyVolume: [
      { day: "Mon", screens: 8, batteriesAndPorts: 5 },
      { day: "Tue", screens: 9, batteriesAndPorts: 7 },
      { day: "Wed", screens: 11, batteriesAndPorts: 8 },
      { day: "Thu", screens: 11, batteriesAndPorts: 9 },
      { day: "Fri", screens: 14, batteriesAndPorts: 10 },
      { day: "Sat", screens: 17, batteriesAndPorts: 12 },
    ],
    monthlyRevenue: [
      { month: "Jun", revenue: 4900, partsCost: 1850 },
      { month: "Jul", revenue: 5300, partsCost: 1950 },
      { month: "Aug", revenue: 5900, partsCost: 2150 },
      { month: "Sep", revenue: 6300, partsCost: 2300 },
      { month: "Oct", revenue: 6750, partsCost: 2450 },
      { month: "Nov", revenue: 7200, partsCost: 2600 },
    ],
    appointments: [
      {
        id: 7,
        customer: "David Kim",
        device: "iPhone 13 — Water Damage Ultrasonic",
        time: "11:30 AM",
        branch: "4060 Lancaster Ave",
        status: "On bench",
      },
      {
        id: 8,
        customer: "Sarah Chen",
        device: "iPad Pro 11 — Charging Port",
        time: "03:15 PM",
        branch: "4060 Lancaster Ave",
        status: "Scheduled",
      },
    ],
  },
};

export default function AdminOverviewPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } =
    useStoreContext();
  const storeShortName = selectedStore.name.replace("SmartFoneDoctor - ", "");

  const current = isAllStores
    ? {
        inquiries: 50,
        onBench: 16,
        completed: 342,
        rating: "4.7",
        reviews: 200,
        napAccuracy: "80%",
        weeklyVolume: STORE_METRICS[1].weeklyVolume.map((row, idx) => ({
          day: row.day,
          screens:
            row.screens +
            STORE_METRICS[2].weeklyVolume[idx].screens +
            STORE_METRICS[3].weeklyVolume[idx].screens,
          batteriesAndPorts:
            row.batteriesAndPorts +
            STORE_METRICS[2].weeklyVolume[idx].batteriesAndPorts +
            STORE_METRICS[3].weeklyVolume[idx].batteriesAndPorts,
        })),
        monthlyRevenue: STORE_METRICS[1].monthlyRevenue.map((row, idx) => ({
          month: row.month,
          revenue:
            row.revenue +
            STORE_METRICS[2].monthlyRevenue[idx].revenue +
            STORE_METRICS[3].monthlyRevenue[idx].revenue,
          partsCost:
            row.partsCost +
            STORE_METRICS[2].monthlyRevenue[idx].partsCost +
            STORE_METRICS[3].monthlyRevenue[idx].partsCost,
        })),
        appointments: [
          ...STORE_METRICS[1].appointments.slice(0, 2),
          ...STORE_METRICS[2].appointments.slice(0, 1),
          ...STORE_METRICS[3].appointments.slice(0, 1),
        ],
      }
    : STORE_METRICS[selectedStoreId] ?? STORE_METRICS[1];

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
            Operations overview
          </h1>
          <p className="text-[14px] text-[#5f6368] mt-1">
            <span className="text-[#111111] font-medium">
              {isAllStores
                ? `All ${stores.length} Philadelphia locations`
                : storeShortName}
            </span>{" "}
            · {current.onBench} devices currently on repair bench and{" "}
            {current.inquiries} new inquiries this week
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/portal/listings"
            className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Directory listings</span>
          </Link>

          <Link
            href="/portal/leads"
            className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Manage leads</span>
          </Link>
        </div>
      </div>

      {/* 2. DIVIDED KPI STRIP (1 container split by 1px hairlines, no decorative icons) */}
      <section
        aria-label="Key store metrics"
        className="bg-white border border-[#e8e8e8] rounded-[8px] grid grid-cols-2 lg:grid-cols-4"
      >
        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">
            New inquiries (7d)
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#111111] tabular-nums leading-none">
              {current.inquiries}
            </span>
            <span className="text-[12px] text-[#247b50] tabular-nums">
              +14% vs last wk
            </span>
          </div>
          <span className="text-[12px] text-[#5f6368] mt-1">
            Google Maps, ChatGPT &amp; Calendly
          </span>
        </div>

        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Active on bench</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {current.onBench}
            </span>
            <span className="text-[12px] text-[#5f6368]">in progress</span>
          </div>
          <span className="text-[12px] text-[#5f6368] mt-1">
            Avg turnaround: 32 mins
          </span>
        </div>

        <div className="p-4 flex flex-col justify-between border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">
            Repairs completed (30d)
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {current.completed}
            </span>
            <span className="text-[12px] text-[#247b50] tabular-nums">
              98% same-day
            </span>
          </div>
          <span className="text-[12px] text-[#5f6368] mt-1">
            90-day warranty active
          </span>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">
            Reputation &amp; NAP health
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {current.rating}
              <span className="text-[13px] text-[#5f6368]"> /5</span>
            </span>
            <span className="text-[12px] text-[#5f6368] tabular-nums">
              ({current.reviews} reviews)
            </span>
          </div>
          <span className="text-[12px] text-[#5f6368] mt-1">
            Citation accuracy: {current.napAccuracy}
          </span>
        </div>
      </section>

      {/* 3. CHARTS ROW (Minimal chrome, 1px #e8e8e8 borders) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section
          aria-label="Weekly repair volume"
          className="bg-white p-5 rounded-[8px] border border-[#e8e8e8]"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Weekly repair volume
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Mon – Sat · Screen replacements vs battery &amp; port repairs
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#5f6368]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#111111]" />
                Screens
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#d1d5db]" />
                Battery &amp; ports
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={current.weeklyVolume}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e5e5e5"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="day"
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
              <Bar
                dataKey="screens"
                fill="#111111"
                name="Screen repairs"
              />
              <Bar
                dataKey="batteriesAndPorts"
                fill="#d1d5db"
                name="Battery & port repairs"
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section
          aria-label="Monthly repair revenue"
          className="bg-white p-5 rounded-[8px] border border-[#e8e8e8]"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Monthly repair revenue vs parts cost
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Jun – Nov · Gross service revenue ($) and OEM parts inventory
              </p>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-[#5f6368]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#009691]" />
                Revenue
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#949494]" />
                Parts cost
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={current.monthlyRevenue}
              margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
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
                dataKey="revenue"
                stroke="#009691"
                strokeWidth={2}
                dot={false}
                name="Gross revenue ($)"
              />
              <Line
                type="linear"
                dataKey="partsCost"
                stroke="#949494"
                strokeWidth={2}
                dot={false}
                name="Parts cost ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      {/* 4. BOTTOM ROW: TODAY'S BENCH APPOINTMENTS & MULTI-STORE CITATION ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <section
          aria-label="Today's repair queue"
          className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Today&apos;s repair queue ({current.appointments.length})
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Walk-ins and Calendly drop-offs for{" "}
                {isAllStores ? "all 3 branches" : storeShortName}
              </p>
            </div>
            <Link
              href="/portal/leads"
              className="text-[13px] font-medium text-[#111111] hover:underline inline-flex items-center gap-1"
            >
              <span>All leads</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-[#f2f2f2] text-[13px]">
            {current.appointments.map((apt) => (
              <div
                key={apt.id}
                className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#f9f9f9] transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium text-[#111111] truncate">
                    {apt.customer} ·{" "}
                    <span className="font-normal text-[#5f6368]">
                      {apt.device}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#5f6368] mt-0.5 tabular-nums">
                    {apt.time} · {apt.branch}
                  </div>
                </div>
                <span
                  className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium shrink-0 ${
                    apt.status === "Ready"
                      ? "bg-[#dcfae5] text-[#04250e]"
                      : apt.status === "On bench"
                      ? "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
                      : "bg-[#eeeeee] text-[#111111]"
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-label="Local SEO and citation tasks"
          className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#111111]">
                Local SEO &amp; AI visibility tasks
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Direct priorities across Google, Yelp, Bing Places, and AI Search
              </p>
            </div>
            <Link
              href="/portal/listings/ai-visibility"
              className="text-[13px] font-medium text-[#111111] hover:underline inline-flex items-center gap-1"
            >
              <span>AI visibility</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-[#f2f2f2] text-[13px]">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-[#111111]">
                  Yelp Saturday hours mismatch (6:00 PM vs 7:00 PM)
                </div>
                <div className="text-[12px] text-[#5f6368] mt-0.5">
                  Affects ChatGPT Search and Yelp rankings on 4016 &amp; 4060 Lancaster Ave
                </div>
              </div>
              <Link
                href="/portal/listings"
                className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center shrink-0"
              >
                Fix NAP
              </Link>
            </div>

            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-[#111111]">
                  Bing Places unclaimed for 4016 Lancaster Ave
                </div>
                <div className="text-[12px] text-[#5f6368] mt-0.5">
                  1-click import from Google Business Profile boosts ChatGPT Search score by +24 pts
                </div>
              </div>
              <Link
                href="/portal/listings/ai-visibility"
                className="h-[28px] px-2.5 rounded-[5px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[12px] font-medium inline-flex items-center shrink-0"
              >
                Run agent fix
              </Link>
            </div>

            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-[#111111]">
                  6 customer reviews awaiting public reply
                </div>
                <div className="text-[12px] text-[#5f6368] mt-0.5">
                  Replying with repair keywords improves Google Local Pack &amp; Gemini AI ranking
                </div>
              </div>
              <Link
                href="/portal/reviews"
                className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center shrink-0"
              >
                Reply now
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
