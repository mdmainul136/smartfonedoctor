"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Tag,
  FolderTree,
  ExternalLink,
  Layers,
  Wrench,
  FileText,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Smartphone,
  Tablet,
  Gamepad2,
  Laptop,
  BookOpen,
  Info,
} from "lucide-react";
import {
  DEVICE_CATEGORIES,
  BRANDS_TAXONOMY,
  SERVICE_ISSUES_TAXONOMY,
  DEVICE_MODELS_TAXONOMY,
  CORE_PAGES_TAXONOMY,
  BLOG_POSTS_TAXONOMY,
  resolveTaxonomyUrl,
  getAllLinkableEntities,
} from "@/lib/taxonomy";

export default function TaxonomiesRoutingPage() {
  const [activeTab, setActiveTab] = useState<
    "categories" | "brands" | "issues" | "models" | "pages" | "blogs" | "tester"
  >("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [testInput, setTestInput] = useState("iPhone 16 Pro");
  const [testCategory, setTestCategory] = useState<string>("smartphone");

  const resolvedTestUrl = resolveTaxonomyUrl("device", testInput, testCategory);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6">
      
      {/* 1. Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                Taxonomies &amp; Content Architecture
              </h1>
              <p className="text-[13px] text-[#6b6b6b]">
                Interconnect Pages, Device Categories, Hardware Brands, Repair Services, and Knowledge Base Articles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/mega-menu"
            className="h-[36px] px-3.5 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-[13px] font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-gray-500" />
            <span>Open Mega Menu Builder</span>
          </Link>

          <Link
            href="/admin/pages"
            className="h-[36px] px-3.5 rounded-[6px] bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View All Pages</span>
          </Link>
        </div>
      </div>

      {/* 2. Stat Badges Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Categories
          </span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">
            {DEVICE_CATEGORIES.length}
          </span>
          <span className="text-[11px] text-gray-400">Core hardware groups</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Brands
          </span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">
            {BRANDS_TAXONOMY.length}
          </span>
          <span className="text-[11px] text-gray-400">Apple, Samsung, etc.</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Issue Types
          </span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">
            {SERVICE_ISSUES_TAXONOMY.length}
          </span>
          <span className="text-[11px] text-gray-400">Screen, Battery, HDMI</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Device Models
          </span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">
            {DEVICE_MODELS_TAXONOMY.length}
          </span>
          <span className="text-[11px] text-gray-400">Connected to booking</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Site Pages
          </span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">
            {CORE_PAGES_TAXONOMY.length}
          </span>
          <span className="text-[11px] text-gray-400">Core &amp; Utility</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Guides &amp; Blog
          </span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">
            {BLOG_POSTS_TAXONOMY.length}
          </span>
          <span className="text-[11px] text-gray-400">Knowledge articles</span>
        </div>
      </div>

      {/* 3. Interconnection Architecture Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-neutral-900 block">
              How Menu Content Editor Auto-Resolves URLs:
            </span>
            <span className="text-neutral-600 text-[13px]">
              When you add a Device (e.g. <i>iPhone 16 Pro Repair</i>) or Issue (e.g. <i>Charging Port Repair</i>) in the Menu Content Editor, the system checks this Taxonomy Registry. If matched, it attaches the exact canonical route (e.g. <code className="bg-white/80 px-1 py-0.5 rounded text-teal-800 font-mono text-xs">/schedule-repair?device=iPhone-16-Pro</code> or <code className="bg-white/80 px-1 py-0.5 rounded text-teal-800 font-mono text-xs">/common-issues/smartphone/charging-port-replacement</code>).
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("tester")}
          className="h-[32px] px-3 rounded-md bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs inline-flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch URL Tester</span>
        </button>
      </div>

      {/* 4. Taxonomy Tabs */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden shadow-2xs">
        
        {/* Tab Strip */}
        <div className="flex items-center overflow-x-auto border-b border-gray-200 bg-[#f9fafb] px-3 pt-2">
          {[
            { id: "categories", label: `Categories (${DEVICE_CATEGORIES.length})` },
            { id: "brands", label: `Brands (${BRANDS_TAXONOMY.length})` },
            { id: "issues", label: `Service Issues (${SERVICE_ISSUES_TAXONOMY.length})` },
            { id: "models", label: `Device Models (${DEVICE_MODELS_TAXONOMY.length})` },
            { id: "pages", label: `Core Pages (${CORE_PAGES_TAXONOMY.length})` },
            { id: "blogs", label: `Guides & Blog (${BLOG_POSTS_TAXONOMY.length})` },
            { id: "tester", label: "⚡ Live URL Resolver Tester" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#00897b] text-[#00897b] bg-white rounded-t-lg"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6">
          
          {/* TAB 1: DEVICE CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">
                  Registered Device Taxonomies
                </span>
                <span className="text-xs text-gray-400">
                  Routes map to /repairs/[category]
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEVICE_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl border border-gray-200 bg-[#fbfcfd] flex items-start justify-between gap-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#111111]">
                          {cat.pluralName}
                        </span>
                        <span className="font-mono text-[11px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                          slug: {cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {cat.description}
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400">
                          Canonical Public URL:
                        </span>
                        <Link
                          href={cat.url}
                          target="_blank"
                          className="font-mono text-xs text-[#00897b] hover:underline flex items-center gap-1"
                        >
                          <span>{cat.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BRANDS */}
          {activeTab === "brands" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">
                  Supported Hardware Brands &amp; Brand Hubs
                </span>
                <span className="text-xs text-gray-400">
                  {BRANDS_TAXONOMY.length} registered manufacturers
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BRANDS_TAXONOMY.map((brand) => (
                  <div
                    key={brand.id}
                    className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-[#00897b] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111111]">
                          {brand.name}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {brand.categorySlugs.join(", ")}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 block mt-1">
                        {brand.tagline}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-400">{brand.url}</span>
                      <Link
                        href={brand.url}
                        target="_blank"
                        className="text-[#00897b] font-semibold hover:underline"
                      >
                        Visit →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SERVICE ISSUES */}
          {activeTab === "issues" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">
                  Common Hardware Issues &amp; Diagnostic Fix Pages
                </span>
                <span className="text-xs text-gray-400">
                  Connected to /common-issues/[category]/[slug]
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f4f5f7] text-gray-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Issue Title</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Starting Rate</th>
                      <th className="py-2.5 px-3">Turnaround</th>
                      <th className="py-2.5 px-3">Resolved Route</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {SERVICE_ISSUES_TAXONOMY.map((issue) => (
                      <tr key={issue.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-bold text-gray-900">
                          {issue.title}
                          {issue.badge && (
                            <span className="ml-2 text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-normal">
                              {issue.badge}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-600 uppercase text-[10px]">
                          {issue.categorySlug}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#00897b]">
                          From ${issue.startingPrice}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          {issue.turnaround}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                          {issue.url}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            href={issue.url}
                            target="_blank"
                            className="text-[#00897b] font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Preview</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DEVICE MODELS */}
          {activeTab === "models" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">
                  Popular Device Models Linked to Booking Flow
                </span>
                <span className="text-xs text-gray-400">
                  {DEVICE_MODELS_TAXONOMY.length} priority devices
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {DEVICE_MODELS_TAXONOMY.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-gray-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[13px] text-gray-900 block">
                        {m.name}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono block">
                        {m.url}
                      </span>
                    </div>
                    <Link
                      href={m.url}
                      target="_blank"
                      className="text-xs text-[#00897b] font-semibold hover:underline shrink-0"
                    >
                      Book →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CORE PAGES */}
          {activeTab === "pages" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">
                  Core &amp; Utility Frontend Pages
                </span>
                <Link
                  href="/admin/pages"
                  className="text-xs text-[#00897b] font-bold hover:underline"
                >
                  Manage in Pages Directory →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CORE_PAGES_TAXONOMY.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-lg border border-gray-200 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111111]">
                          {p.title}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-gray-400 mt-1 block">
                        {p.url}
                      </span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <Link
                        href={`/admin/pages/${p.slug}`}
                        className="text-gray-600 hover:text-black font-semibold"
                      >
                        Edit in CMS
                      </Link>
                      <Link
                        href={p.url}
                        target="_blank"
                        className="text-[#00897b] font-semibold hover:underline"
                      >
                        Live Page →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BLOGS & GUIDES */}
          {activeTab === "blogs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-sm font-bold text-gray-800 block">
                    Knowledge Base &amp; Repair Bench Guides
                  </span>
                  <span className="text-xs text-gray-400">
                    Public hub available at /blog
                  </span>
                </div>
                <Link
                  href="/blog"
                  target="_blank"
                  className="text-xs text-[#00897b] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>View Public /blog Hub</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {BLOG_POSTS_TAXONOMY.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {post.title}
                        </span>
                        <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-semibold">
                          {post.categoryName}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{post.excerpt}</p>
                      <span className="font-mono text-[11px] text-gray-400 block">
                        Direct Route: {post.url}
                      </span>
                    </div>

                    <Link
                      href={post.url}
                      target="_blank"
                      className="h-[32px] px-3 rounded bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 inline-flex items-center gap-1 shrink-0"
                    >
                      <span>Read Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: LIVE URL RESOLVER TESTER */}
          {activeTab === "tester" && (
            <div className="max-w-2xl space-y-5">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Taxonomy URL Resolver Test Bench
                </h3>
                <p className="text-xs text-gray-500">
                  Simulate entering any device name, problem, or brand to see how the system resolves its canonical URL.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Input Item Name / Search Term
                  </label>
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="e.g. iPhone 16 Pro Repair, Water Damage, PS5 HDMI"
                    className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Context Category
                  </label>
                  <select
                    value={testCategory}
                    onChange={(e) => setTestCategory(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[6px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="tablet">Tablet</option>
                    <option value="console">Game Console</option>
                    <option value="computer">Computer</option>
                  </select>
                </div>

                {/* Result Card */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 mt-4">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Resolved Canonical Public URL:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-[#00897b] bg-white px-3 py-1.5 rounded border border-gray-300 flex-1">
                      {resolvedTestUrl}
                    </span>
                    <Link
                      href={resolvedTestUrl}
                      target="_blank"
                      className="h-[34px] px-3 rounded bg-[#00897b] text-white text-xs font-semibold inline-flex items-center gap-1 hover:bg-[#00796b]"
                    >
                      <span>Test Route</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    ✅ Automatically linked into navigation flyouts and customer click paths.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

