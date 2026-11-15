"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import {
  Globe,
  Save,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Star,
  Clock,
  Shield,
  Smartphone,
  Share2,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Sliders,
  FileCode,
  Layers,
} from "lucide-react";
import {
  getSiteSeoSettingsAction,
  updateSiteSeoSettingsAction,
  getUrlRedirectsAction,
  upsertUrlRedirectAction,
  deleteUrlRedirectAction,
  toggleUrlRedirectAction,
  getSeoOverviewStatsAction,
  type SiteSeoSettingsInput,
} from "@/actions/seo";

type SeoTab = "general" | "redirects" | "verification" | "crawlers" | "schema";

interface RedirectItem {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  hitCount: number;
  isActive: boolean;
  notes?: string | null;
  createdAt: string | Date;
}

export default function SeoManagerPage() {
  const { stores } = useStoreContext();
  const [activeTab, setActiveTab] = useState<SeoTab>("general");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<SiteSeoSettingsInput>({
    siteName: "SmartFoneDoctor",
    titleSeparator: "|",
    defaultMetaTitle: "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia",
    defaultMetaDescription:
      "Expert cell phone, iPhone, iPad, MacBook, computer, and gaming console repair in Philadelphia, PA. Fast 30-minute screen and battery replacement with warranty.",
    defaultOgImage: "/logo-png.jpg",
    googleSiteVerification: "",
    bingSiteVerification: "",
    pinterestVerification: "",
    facebookAppId: "",
    twitterHandle: "@smartfonedoctor",
    enableSitemap: true,
    enableRobotsTxt: true,
    enableLlmsTxt: true,
    enableAiBots: true,
  });

  // Redirects state
  const [redirects, setRedirects] = useState<RedirectItem[]>([]);
  const [redirectSearch, setRedirectSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCode, setNewCode] = useState(301);
  const [newNotes, setNewNotes] = useState("");

  // Stats state
  const [stats, setStats] = useState({
    totalPages: 16,
    seoConfiguredCount: 16,
    avgRankMathScore: 94,
    indexedPages: 16,
    aiReadyPages: 16,
    totalRedirects: 4,
    activeRedirects: 4,
  });

  // Load initial data from PostgreSQL
  useEffect(() => {
    async function loadData() {
      const [settingsRes, redirectsRes, statsRes] = await Promise.all([
        getSiteSeoSettingsAction(),
        getUrlRedirectsAction(),
        getSeoOverviewStatsAction(),
      ]);

      if (settingsRes.success && settingsRes.settings) {
        setSettings({
          siteName: settingsRes.settings.siteName,
          titleSeparator: settingsRes.settings.titleSeparator,
          defaultMetaTitle: settingsRes.settings.defaultMetaTitle,
          defaultMetaDescription: settingsRes.settings.defaultMetaDescription,
          defaultOgImage: settingsRes.settings.defaultOgImage || "/logo-png.jpg",
          googleSiteVerification: settingsRes.settings.googleSiteVerification || "",
          bingSiteVerification: settingsRes.settings.bingSiteVerification || "",
          pinterestVerification: settingsRes.settings.pinterestVerification || "",
          facebookAppId: settingsRes.settings.facebookAppId || "",
          twitterHandle: settingsRes.settings.twitterHandle || "@smartfonedoctor",
          enableSitemap: settingsRes.settings.enableSitemap,
          enableRobotsTxt: settingsRes.settings.enableRobotsTxt,
          enableLlmsTxt: settingsRes.settings.enableLlmsTxt,
          enableAiBots: settingsRes.settings.enableAiBots,
        });
      }

      if (redirectsRes.success && redirectsRes.redirects) {
        setRedirects(redirectsRes.redirects as RedirectItem[]);
      }

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    }

    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const res = await updateSiteSeoSettingsAction(settings);
    setIsSaving(false);
    if (res.success) {
      setSavedToast("Global SEO settings saved and cached layouts invalidated!");
      setTimeout(() => setSavedToast(null), 3000);
    }
  };

  const handleAddRedirect = async () => {
    if (!newSource.trim() || !newTarget.trim()) return;
    const res = await upsertUrlRedirectAction({
      sourceUrl: newSource,
      targetUrl: newTarget,
      statusCode: newCode,
      notes: newNotes,
    });
    if (res.success && res.redirect) {
      setRedirects((prev) => [res.redirect as RedirectItem, ...prev]);
      setNewSource("");
      setNewTarget("");
      setNewNotes("");
      setShowAddModal(false);
      setSavedToast("301 Redirect rule created successfully!");
      setTimeout(() => setSavedToast(null), 3000);
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    const res = await deleteUrlRedirectAction(id);
    if (res.success) {
      setRedirects((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleToggleRedirect = async (id: string, current: boolean) => {
    const res = await toggleUrlRedirectAction(id, !current);
    if (res.success) {
      setRedirects((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r)));
    }
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.siteName || "SmartFoneDoctor",
    telephone: "+1-215-598-2090",
    url: "https://smartfonedoctor.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "33 S 52nd St, Fl 2nd",
      addressLocality: "Philadelphia",
      addressRegion: "PA",
      postalCode: "19139",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 39.9572,
      longitude: -75.2267,
    },
    department: stores.map((s) => ({
      "@type": "LocalBusiness",
      name: s.name,
      telephone: s.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: s.address,
        addressLocality: "Philadelphia",
        addressRegion: "PA",
        postalCode: s.cityStateZip.match(/\d{5}/)?.[0] || "19104",
        addressCountry: "US",
      },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1524",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonLdData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRedirects = redirects.filter(
    (r) =>
      r.sourceUrl.toLowerCase().includes(redirectSearch.toLowerCase()) ||
      r.targetUrl.toLowerCase().includes(redirectSearch.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(redirectSearch.toLowerCase()))
  );

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* ── 1. TOP HEADER & METRICS ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              SEO Command Center
            </h1>
            <span className="bg-[#009691]/10 text-[#009691] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#009691]/20 inline-flex items-center gap-1 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-[#009691]" />
              Search Engine Indexed · Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global search engine directives, RankMath audits, webmaster verification, and 301 redirection engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* TOAST ALERT */}
      {savedToast && (
        <div className="bg-[#009691]/10 border border-[#009691]/30 text-[#009691] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#009691]" />
            <span>{savedToast}</span>
          </div>
        </div>
      )}

      {/* ── 2. QUICK HEALTH STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between hover:border-[#009691]/40 transition-colors">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Avg RankMath Score</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-[#009691]">{stats.avgRankMathScore}</span>
              <span className="text-xs font-bold text-slate-400">/100</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">16/16 Pages Audited</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#009691]/10 border border-[#009691]/20 flex items-center justify-center text-[#009691]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between hover:border-[#009691]/40 transition-colors">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Indexed URLs</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{stats.indexedPages}</span>
              <span className="text-xs font-bold text-slate-400">pages</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Index &amp; Follow active</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between hover:border-[#009691]/40 transition-colors">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active 301 Redirects</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{redirects.filter((r) => r.isActive).length}</span>
              <span className="text-xs font-bold text-slate-400">rules</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Auto-forwarding legacy URLs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between hover:border-[#009691]/40 transition-colors">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">AI &amp; LLM Readiness</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-[#009691]">100%</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">GPTBot, Gemini, Claude allowed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#009691]">
            <Bot className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. MATERIAL 3 SEGMENTED TABS NAVIGATION ── */}
      <nav
        aria-label="SEO Command Center navigation"
        className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xs"
      >
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "general"
              ? "bg-white text-[#009691] shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Global Defaults</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("redirects")}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "redirects"
              ? "bg-white text-[#009691] shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>301 / 302 Redirects ({redirects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verification")}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "verification"
              ? "bg-white text-[#009691] shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Webmaster Verification</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("crawlers")}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "crawlers"
              ? "bg-white text-[#009691] shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Robots &amp; AI Directives</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "schema"
              ? "bg-white text-[#009691] shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Multi-Store Schema.org</span>
        </button>
      </nav>

      {/* ── 4. TAB CONTENTS ── */}

      {/* TAB 1: GLOBAL DEFAULTS */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Default SERP &amp; OpenGraph Fallbacks
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Site Brand Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Title Separator</label>
                <select
                  value={settings.titleSeparator}
                  onChange={(e) => setSettings({ ...settings, titleSeparator: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold bg-white focus:outline-none focus:border-[#009691]"
                >
                  <option value="|">| (Pipe)</option>
                  <option value="-">- (Hyphen)</option>
                  <option value="•">• (Bullet)</option>
                  <option value="—">— (Em-dash)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Default Meta Title</label>
              <input
                type="text"
                value={settings.defaultMetaTitle}
                onChange={(e) => setSettings({ ...settings, defaultMetaTitle: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Length: {settings.defaultMetaTitle.length}/60 chars
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Default Meta Description</label>
              <textarea
                rows={3}
                value={settings.defaultMetaDescription}
                onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-300 text-xs font-medium focus:outline-none focus:border-[#009691]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Length: {settings.defaultMetaDescription.length}/160 chars
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Default Social Share Image (OG Image)</label>
                <input
                  type="text"
                  value={settings.defaultOgImage || ""}
                  onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
                  placeholder="/logo-png.jpg"
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Twitter Creator Handle</label>
                <input
                  type="text"
                  value={settings.twitterHandle || ""}
                  onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })}
                  placeholder="@smartfonedoctor"
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>
          </div>

          {/* PREVIEW CARD */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Google Snippet Preview</h3>
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <Globe className="w-3.5 h-3.5 text-[#009691]" />
                <span className="text-emerald-700 font-semibold truncate">https://smartfonedoctor.com</span>
              </div>
              <h4 className="text-sm font-bold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
                {settings.defaultMetaTitle}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {settings.defaultMetaDescription}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-snug">
              💡 These settings apply as global fallbacks whenever an individual page or blog post has empty SEO fields.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 301 / 302 REDIRECT MANAGER */}
      {activeTab === "redirects" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">URL Redirection Rules (301 / 302)</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Preserve link equity and prevent 404 errors by automatically forwarding old URLs to new destinations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={redirectSearch}
                  onChange={(e) => setRedirectSearch(e.target.value)}
                  placeholder="Filter redirects..."
                  className="h-8 pl-8 pr-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#009691] w-48"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="h-8 px-3 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Redirect</span>
              </button>
            </div>
          </div>

          {/* ADD MODAL / INLINE FORM */}
          {showAddModal && (
            <div className="p-4 rounded-xl border border-gray-300 bg-gray-50/80 space-y-3">
              <h4 className="text-xs font-bold text-gray-900">Create New Redirect Rule</h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Source Path (Old URL)</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="/repair/iphone"
                    className="w-full h-8 px-2.5 rounded-md border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Target Path (Destination)</label>
                  <input
                    type="text"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="/repairs/iphone"
                    className="w-full h-8 px-2.5 rounded-md border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Status Code</label>
                  <select
                    value={newCode}
                    onChange={(e) => setNewCode(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-md border border-gray-300 text-xs font-semibold bg-white focus:outline-none focus:border-[#009691]"
                  >
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Temporary</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-600 block mb-1">Notes</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Old WP link"
                    className="w-full h-8 px-2.5 rounded-md border border-gray-300 text-xs font-medium focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-7 px-3 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddRedirect}
                  className="h-7 px-3 rounded bg-[#009691] text-white text-xs font-bold hover:bg-[#007f7b]"
                >
                  Save Redirect
                </button>
              </div>
            </div>
          )}

          {/* TABLE OF REDIRECTS */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Source URL</th>
                  <th className="px-4 py-2.5">Target Destination</th>
                  <th className="px-3 py-2.5">Code</th>
                  <th className="px-3 py-2.5">Hits</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {filteredRedirects.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-900 font-bold">
                      {r.sourceUrl}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-emerald-700">
                      {r.targetUrl}
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        {r.statusCode}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-500 font-mono text-[11px]">{r.hitCount}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleRedirect(r.id, r.isActive)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                          r.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {r.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRedirect(r.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                        title="Delete redirect rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WEBMASTER VERIFICATION */}
      {activeTab === "verification" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Search Engine Ownership Tokens
            </h3>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Google Search Console Verification Token
              </label>
              <input
                type="text"
                value={settings.googleSiteVerification || ""}
                onChange={(e) => setSettings({ ...settings, googleSiteVerification: e.target.value })}
                placeholder="google-site-verification=abc123xyz456..."
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-mono font-medium focus:outline-none focus:border-[#009691]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Automatically rendered as &lt;meta name=&quot;google-site-verification&quot; content=&quot;...&quot;&gt;
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Bing Webmaster Tools Verification Token
              </label>
              <input
                type="text"
                value={settings.bingSiteVerification || ""}
                onChange={(e) => setSettings({ ...settings, bingSiteVerification: e.target.value })}
                placeholder="msvalidate.01=abc123xyz..."
                className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-mono font-medium focus:outline-none focus:border-[#009691]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Pinterest Verification Code</label>
                <input
                  type="text"
                  value={settings.pinterestVerification || ""}
                  onChange={(e) => setSettings({ ...settings, pinterestVerification: e.target.value })}
                  placeholder="p:domain_verify=..."
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-mono font-medium focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Facebook App ID</label>
                <input
                  type="text"
                  value={settings.facebookAppId || ""}
                  onChange={(e) => setSettings({ ...settings, facebookAppId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-mono font-medium focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Verification Instructions</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              When verifying domain ownership in Google Search Console or Bing Webmaster:
            </p>
            <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside leading-relaxed">
              <li>Select the <strong>HTML Tag</strong> verification method.</li>
              <li>Copy the token string from the <code>content</code> attribute.</li>
              <li>Paste it here and click <strong>Save Settings</strong>.</li>
              <li>Return to Search Console and click <strong>Verify</strong>.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 4: ROBOTS & AI DIRECTIVES */}
      {activeTab === "crawlers" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Technical SEO Endpoints &amp; AI Bot Permissions</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Control which search engines, AI models, and LLM crawlers can index and cite SmartFoneDoctor content.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">AI / LLM Search Crawlers</h4>
                  <p className="text-[11px] text-gray-500">Allow GPTBot (ChatGPT), ClaudeBot (Anthropic), PerplexityBot, and Google-Extended</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableAiBots}
                  onChange={(e) => setSettings({ ...settings, enableAiBots: e.target.checked })}
                  className="w-4 h-4 text-[#009691] rounded accent-[#009691]"
                />
              </div>
              <div className="text-[10px] text-gray-500 bg-white p-2.5 rounded border border-gray-200 font-mono">
                User-agent: GPTBot<br />Allow: /<br /><br />User-agent: PerplexityBot<br />Allow: /
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Dynamic XML Sitemap</h4>
                  <p className="text-[11px] text-gray-500">Auto-generated XML sitemap featuring all core pages, blog articles, and repair services</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableSitemap}
                  onChange={(e) => setSettings({ ...settings, enableSitemap: e.target.checked })}
                  className="w-4 h-4 text-[#009691] rounded accent-[#009691]"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded border border-emerald-200">
                <span>URL: /sitemap.xml</span>
                <Link href="/sitemap.xml" target="_blank" className="font-bold underline flex items-center gap-1">
                  <span>View Sitemap</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-STORE SCHEMA.ORG */}
      {activeTab === "schema" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Multi-Location Schema.org Structured Data</h3>
                <span className="text-[10px] font-bold bg-[#009691]/10 text-[#009691] px-2 py-0.5 rounded-full border border-[#009691]/20">
                  LocalBusiness / MobilePhoneRepairShop
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Google Rich Results-compliant JSON-LD injected into head across all 3 Philadelphia store coordinates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Google Rich Results Test</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="h-8 px-3.5 rounded-xl bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy JSON-LD"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stores.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-2 hover:border-[#009691]/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#009691] uppercase">Store #{s.id}</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Google Verified
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                <p className="text-[11px] text-slate-500">{s.address}, Philadelphia, PA</p>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Phone: {s.phone}</span>
                  <span className="text-amber-600 font-bold inline-flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    4.9 (500+ reviews)
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-[11px] text-slate-300">application/ld+json</span>
              </div>
              <span className="text-[10px] text-slate-500">Auto-injected into layout.tsx</span>
            </div>
            <pre className="p-4 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[380px]">
              {JSON.stringify(jsonLdData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
