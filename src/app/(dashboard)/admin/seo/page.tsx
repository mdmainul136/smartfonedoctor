"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import { StoreLocation } from "@/lib/stores";
import {
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
  Edit2,
  Pencil,
  X,
  CheckCheck,
  Building2,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import MediaModal, { type SelectedMediaPayload } from "@/components/admin/MediaModal";
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
import { cleanVerificationToken } from "@/lib/seoSanitize";
import {
  buildRobotsOutput,
  parsePathList,
  AI_SEARCH_BOTS,
  AI_TRAINING_BOTS,
  PROTECTED_DISALLOW_PATHS,
} from "@/lib/seoCrawlerConfig";

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
  const { stores, updateStore } = useStoreContext();
  const [activeTab, setActiveTab] = useState<SeoTab>("general");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Schema Tab Interactive State (Switch, Edit, Improve)
  const [schemaScope, setSchemaScope] = useState<"all" | number>("all");
  const [schemaType, setSchemaType] = useState<string>("LocalBusiness");
  const [isEnhanced, setIsEnhanced] = useState<boolean>(true);
  const [editingStore, setEditingStore] = useState<StoreLocation | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StoreLocation>>({});
  const [isSavingStore, setIsSavingStore] = useState<boolean>(false);
  const [mediaFieldTarget, setMediaFieldTarget] = useState<
    "logoUrl" | "logoDarkUrl" | "faviconUrl" | "appleTouchIcon" | "defaultOgImage" | null
  >(null);

  // Settings state
  const [settings, setSettings] = useState<SiteSeoSettingsInput>({
    siteName: "SmartFoneDoctor",
    titleSeparator: "|",
    defaultMetaTitle: "SmartFoneDoctor | Fast & Reliable Phone & Electronics Repair in Philadelphia",
    defaultMetaDescription:
      "Expert cell phone, iPhone, iPad, MacBook, computer, and gaming console repair in Philadelphia, PA. Fast 30-minute screen and battery replacement with warranty.",
    defaultOgImage: "/logo-png.jpg",
    logoUrl: "/logo-png.jpg",
    logoDarkUrl: "/logo-transparent.png",
    faviconUrl: "/favicon.ico",
    appleTouchIcon: "/logo-png.jpg",
    contactPhone: "+1 (215) 598-2090",
    contactEmail: "contact@smartfonedoctor.com",
    streetAddress: "33 S 52nd St",
    cityStateZip: "Philadelphia, PA 19139",
    businessHours: "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM",
    facebookUrl: "https://facebook.com/smartfonedoctor",
    instagramUrl: "https://instagram.com/smartfonedoctor",
    youtubeUrl: "",
    linkedinUrl: "",
    gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
    googleSiteVerification: "",
    bingSiteVerification: "",
    pinterestVerification: "",
    facebookAppId: "",
    twitterHandle: "@smartfonedoctor",
    enableSitemap: true,
    enableRobotsTxt: true,
    enableLlmsTxt: true,
    enableAiBots: true,
    enableAiTrainingBots: true,
    robotsAllowPaths: [],
    robotsDisallowPaths: ["/list/", "/profile/"],
    robotsCustomRules: "",
    sitemapIncludeUrls: [],
    sitemapExcludePaths: [],
    llmsCustomSummary: "",
    llmsCustomSections: "",
    llmsExcludePaths: [],
  });

  // Textarea string buffers so newline typing feels natural while live preview updates cleanly
  const [robotsAllowText, setRobotsAllowText] = useState("");
  const [robotsDisallowText, setRobotsDisallowText] = useState("/list/\n/profile/");
  const [sitemapIncludeText, setSitemapIncludeText] = useState("");
  const [sitemapExcludeText, setSitemapExcludeText] = useState("");
  const [llmsExcludeText, setLlmsExcludeText] = useState("");

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
          logoUrl: settingsRes.settings.logoUrl || "/logo-png.jpg",
          logoDarkUrl: settingsRes.settings.logoDarkUrl || "/logo-transparent.png",
          faviconUrl: settingsRes.settings.faviconUrl || "/favicon.ico",
          appleTouchIcon: settingsRes.settings.appleTouchIcon || "/logo-png.jpg",
          contactPhone: settingsRes.settings.contactPhone || "+1 (215) 598-2090",
          contactEmail: settingsRes.settings.contactEmail || "contact@smartfonedoctor.com",
          streetAddress: settingsRes.settings.streetAddress || "33 S 52nd St",
          cityStateZip: settingsRes.settings.cityStateZip || "Philadelphia, PA 19139",
          businessHours: settingsRes.settings.businessHours || "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM",
          facebookUrl: settingsRes.settings.facebookUrl || "https://facebook.com/smartfonedoctor",
          instagramUrl: settingsRes.settings.instagramUrl || "https://instagram.com/smartfonedoctor",
          youtubeUrl: settingsRes.settings.youtubeUrl || "",
          linkedinUrl: settingsRes.settings.linkedinUrl || "",
          gmbUrl: settingsRes.settings.gmbUrl || "https://share.google/gTlyWLewR88ToAdJQ",
          googleSiteVerification: cleanVerificationToken(settingsRes.settings.googleSiteVerification) || "",
          bingSiteVerification: cleanVerificationToken(settingsRes.settings.bingSiteVerification) || "",
          pinterestVerification: cleanVerificationToken(settingsRes.settings.pinterestVerification) || "",
          facebookAppId: cleanVerificationToken(settingsRes.settings.facebookAppId) || "",
          twitterHandle: settingsRes.settings.twitterHandle || "@smartfonedoctor",
          enableSitemap: settingsRes.settings.enableSitemap,
          enableRobotsTxt: settingsRes.settings.enableRobotsTxt,
          enableLlmsTxt: settingsRes.settings.enableLlmsTxt,
          enableAiBots: settingsRes.settings.enableAiBots,
          enableAiTrainingBots: settingsRes.settings.enableAiTrainingBots ?? true,
          robotsAllowPaths: settingsRes.settings.robotsAllowPaths ?? [],
          robotsDisallowPaths: settingsRes.settings.robotsDisallowPaths ?? ["/list/", "/profile/"],
          robotsCustomRules: settingsRes.settings.robotsCustomRules ?? "",
          sitemapIncludeUrls: settingsRes.settings.sitemapIncludeUrls ?? [],
          sitemapExcludePaths: settingsRes.settings.sitemapExcludePaths ?? [],
          llmsCustomSummary: settingsRes.settings.llmsCustomSummary ?? "",
          llmsCustomSections: settingsRes.settings.llmsCustomSections ?? "",
          llmsExcludePaths: settingsRes.settings.llmsExcludePaths ?? [],
        });
        setRobotsAllowText((settingsRes.settings.robotsAllowPaths ?? []).join("\n"));
        setRobotsDisallowText((settingsRes.settings.robotsDisallowPaths ?? ["/list/", "/profile/"]).join("\n"));
        setSitemapIncludeText((settingsRes.settings.sitemapIncludeUrls ?? []).join("\n"));
        setSitemapExcludeText((settingsRes.settings.sitemapExcludePaths ?? []).join("\n"));
        setLlmsExcludeText((settingsRes.settings.llmsExcludePaths ?? []).join("\n"));
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

  // Dynamically synchronize the actual browser tab favicon in real time
  useEffect(() => {
    if (typeof document === "undefined") return;
    const faviconHref = settings.faviconUrl || "/favicon.ico";
    const existingIcons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (existingIcons.length > 0) {
      existingIcons.forEach((el) => {
        el.href = faviconHref;
      });
    } else {
      const link = document.createElement("link");
      link.rel = "shortcut icon";
      link.href = faviconHref;
      document.head.appendChild(link);
    }
  }, [settings.faviconUrl]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const payload: SiteSeoSettingsInput = {
      ...settings,
      robotsAllowPaths: parsePathList(robotsAllowText),
      robotsDisallowPaths: parsePathList(robotsDisallowText),
      sitemapIncludeUrls: parsePathList(sitemapIncludeText),
      sitemapExcludePaths: parsePathList(sitemapExcludeText),
      llmsExcludePaths: parsePathList(llmsExcludeText),
    };
    const res = await updateSiteSeoSettingsAction(payload);
    setIsSaving(false);
    if (res.success) {
      if (res.settings) {
        setSettings((prev) => ({
          ...prev,
          googleSiteVerification: res.settings.googleSiteVerification || "",
          bingSiteVerification: res.settings.bingSiteVerification || "",
          pinterestVerification: res.settings.pinterestVerification || "",
          facebookAppId: res.settings.facebookAppId || "",
          robotsAllowPaths: res.settings.robotsAllowPaths ?? [],
          robotsDisallowPaths: res.settings.robotsDisallowPaths ?? [],
          robotsCustomRules: res.settings.robotsCustomRules ?? "",
          sitemapIncludeUrls: res.settings.sitemapIncludeUrls ?? [],
          sitemapExcludePaths: res.settings.sitemapExcludePaths ?? [],
          llmsCustomSummary: res.settings.llmsCustomSummary ?? "",
          llmsCustomSections: res.settings.llmsCustomSections ?? "",
          llmsExcludePaths: res.settings.llmsExcludePaths ?? [],
        }));
        setRobotsAllowText((res.settings.robotsAllowPaths ?? []).join("\n"));
        setRobotsDisallowText((res.settings.robotsDisallowPaths ?? []).join("\n"));
        setSitemapIncludeText((res.settings.sitemapIncludeUrls ?? []).join("\n"));
        setSitemapExcludeText((res.settings.sitemapExcludePaths ?? []).join("\n"));
        setLlmsExcludeText((res.settings.llmsExcludePaths ?? []).join("\n"));
      }
      setSavedToast("Global SEO settings, crawler rules, sitemap overrides & llms.txt saved!");
      setTimeout(() => setSavedToast(null), 4000);
    } else {
      alert("Error saving settings: " + (res.error || "Please check server logs"));
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

  // Open Edit Store Modal
  const handleOpenEditStore = (store: StoreLocation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingStore(store);
    setEditFormData({
      name: store.name,
      address: store.address,
      cityStateZip: store.cityStateZip,
      phone: store.phone,
      businessHours: store.businessHours,
      gmbUrl: store.gmbUrl,
    });
  };

  // Save Store Edit to Database
  const handleSaveStore = async () => {
    if (!editingStore) return;
    setIsSavingStore(true);
    const updated: StoreLocation = {
      ...editingStore,
      name: editFormData.name || editingStore.name,
      address: editFormData.address || editingStore.address,
      cityStateZip: editFormData.cityStateZip || editingStore.cityStateZip,
      phone: editFormData.phone || editingStore.phone,
      businessHours: editFormData.businessHours || editingStore.businessHours,
      gmbUrl: editFormData.gmbUrl || editingStore.gmbUrl,
    };

    const ok = await updateStore(updated);
    setIsSavingStore(false);
    if (ok) {
      setSavedToast(`Store #${updated.id} coordinates & schema details updated!`);
      setEditingStore(null);
      setTimeout(() => setSavedToast(null), 3000);
    }
  };

  // One-click Auto-Enhance Schema
  const handleToggleEnhance = () => {
    setIsEnhanced((prev) => !prev);
    setSavedToast(
      !isEnhanced
        ? "Schema enhanced: Added PaymentAccepted, Currencies, AreaServed & Service catalog!"
        : "Schema reset to standard minimal specification."
    );
    setTimeout(() => setSavedToast(null), 3000);
  };

  // Active Store Object if single store selected
  const activeStoreObj = typeof schemaScope === "number" ? stores.find((s) => s.id === schemaScope) : null;

  // Dynamic JSON-LD structured data generator
  const getJsonLdData = () => {
    if (schemaType === "FAQPage") {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How fast is iPhone screen repair at SmartFoneDoctor?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Most iPhone, iPad, and Samsung screen replacements are completed in 30 minutes or less with a 90-day warranty.",
            },
          },
          {
            "@type": "Question",
            name: "Do you repair gaming consoles like PS5 and Xbox?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, our certified micro-soldering technicians repair damaged HDMI ports, disc drives, and power issues on PS5, Xbox Series X, and Nintendo Switch.",
            },
          },
          {
            "@type": "Question",
            name: "Where are your Philadelphia store locations?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We have 3 Philadelphia branches: 33 S 52nd St (West Philly Flagship), 4016 Lancaster Ave (University City), and 4060 Lancaster Ave (Lancaster Express).",
            },
          },
        ],
      };
    }

    if (schemaType === "Service") {
      return {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Electronics & Mobile Device Repair",
        provider: {
          "@type": "LocalBusiness",
          name: settings.siteName || "SmartFoneDoctor",
          telephone: "+1-215-598-2090",
          url: "https://smartfonedoctor.com",
        },
        areaServed: {
          "@type": "City",
          name: "Philadelphia",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Device Repair Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "iPhone 15 / 16 Screen Repair (30 min)" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Samsung Galaxy Screen & Battery Swap" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "PS5 HDMI Port Micro-Soldering" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "MacBook Logic Board & Liquid Recovery" } },
          ],
        },
      };
    }

    const rawLogo = (settings.logoUrl || "/logo-png.jpg").trim();
    const logoAbsUrl =
      rawLogo.startsWith("http://") || rawLogo.startsWith("https://")
        ? rawLogo
        : `https://smartfonedoctor.com${rawLogo.startsWith("/") ? rawLogo : `/${rawLogo}`}`;

    // Single Store Standalone Schema
    if (activeStoreObj) {
      return {
        "@context": "https://schema.org",
        "@type": schemaType,
        "@id": `https://smartfonedoctor.com/#store-${activeStoreObj.id}`,
        name: activeStoreObj.name,
        image: logoAbsUrl,
        telephone: activeStoreObj.phone,
        email: activeStoreObj.email,
        url: "https://smartfonedoctor.com",
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: activeStoreObj.address,
          addressLocality: "Philadelphia",
          addressRegion: "PA",
          postalCode: activeStoreObj.cityStateZip.match(/\d{5}/)?.[0] || "19139",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: activeStoreObj.id === 1 ? 39.9572 : 39.9634,
          longitude: activeStoreObj.id === 1 ? -75.2267 : -75.2036,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "10:00",
            closes: "19:00",
          },
        ],
        sameAs: [
          activeStoreObj.gmbUrl,
          "https://www.yelp.com/biz/smart-fone-doctor-philadelphia",
          "https://www.facebook.com/SmartFoneDoctorPhilly",
        ],
        ...(isEnhanced
          ? {
            currenciesAccepted: "USD",
            paymentAccepted: "Cash, Credit Card, Apple Pay, Google Pay",
            areaServed: ["Philadelphia", "West Philadelphia", "University City"],
          }
          : {}),
      };
    }

    // All Stores: Consolidated Parent-Department Graph
    return {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: settings.siteName || "SmartFoneDoctor",
      logo: logoAbsUrl,
      image: logoAbsUrl,
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
        "@type": schemaType,
        "@id": `https://smartfonedoctor.com/#store-${s.id}`,
        name: s.name,
        image: logoAbsUrl,
        telephone: s.phone,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: s.address,
          addressLocality: "Philadelphia",
          addressRegion: "PA",
          postalCode: s.cityStateZip.match(/\d{5}/)?.[0] || "19104",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: s.id === 1 ? 39.9572 : 39.9634,
          longitude: s.id === 1 ? -75.2267 : -75.2036,
        },
        openingHours: "Mo-Sa 10:00-19:00",
        sameAs: s.gmbUrl,
      })),
      sameAs: [
        "https://www.yelp.com/biz/smart-fone-doctor-philadelphia",
        "https://www.facebook.com/SmartFoneDoctorPhilly",
      ],
      ...(isEnhanced
        ? {
          currenciesAccepted: "USD",
          paymentAccepted: "Cash, Credit Card, Apple Pay, Google Pay",
          areaServed: ["Philadelphia", "West Philadelphia", "University City"],
        }
        : {}),
    };
  };

  const jsonLdData = getJsonLdData();

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
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            SEO settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Site-wide titles, redirects, search console verification and structured data.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="h-9 px-3.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="h-9 px-4 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* TOAST ALERT */}
      {savedToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedToast}</span>
          </div>
        </div>
      )}

      {/* ── 2. SIMPLE STATS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block">Average SEO Score</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-gray-900">{stats.avgRankMathScore}</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">16 core pages checked</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block">Indexed Pages</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-gray-900">{stats.indexedPages}</span>
            <span className="text-xs text-gray-400">pages</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Index &amp; Follow active</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block">Active 301 Redirects</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-gray-900">{redirects.filter((r) => r.isActive).length}</span>
            <span className="text-xs text-gray-400">rules</span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">Forwarding old URLs</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <span className="text-xs font-medium text-gray-500 block">Sitemap &amp; Crawlers</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-bold ${settings.enableSitemap && settings.enableRobotsTxt ? "text-[#009691]" : "text-amber-600"
                }`}
            >
              {settings.enableSitemap && settings.enableRobotsTxt ? "Active" : "Configured"}
            </span>
          </div>
          <span className="text-xs text-gray-500 mt-1 block">
            {settings.enableSitemap ? "/sitemap.xml enabled" : "Sitemap paused"}
          </span>
        </div>
      </div>

      {/* ── 3. CLEAN TABS NAVIGATION ── */}
      <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${activeTab === "general"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
        >
          General Defaults
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("redirects")}
          className={`py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${activeTab === "redirects"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
        >
          Redirects ({redirects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verification")}
          className={`py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${activeTab === "verification"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
        >
          Webmaster Verification
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("crawlers")}
          className={`py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${activeTab === "crawlers"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
        >
          Robots &amp; Sitemap
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schema")}
          className={`py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer ${activeTab === "schema"
              ? "border-[#009691] text-[#009691]"
              : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
        >
          Schema.org JSON-LD
        </button>
      </div>

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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={settings.defaultOgImage || ""}
                    onChange={(e) => setSettings({ ...settings, defaultOgImage: e.target.value })}
                    placeholder="/logo-png.jpg"
                    className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaFieldTarget("defaultOgImage")}
                    className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Choose from Media Library"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                    <span className="hidden sm:inline">Media Library</span>
                  </button>
                  {settings.defaultOgImage && (
                    <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.defaultOgImage} alt="OG Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
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

            {/* BRAND ASSETS & IDENTITY (LOGO, FAVICON, TOUCH ICONS) */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#009691]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Logo &amp; sharing image
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Primary Website Logo URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.logoUrl || ""}
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      placeholder="/logo-png.jpg"
                      className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaFieldTarget("logoUrl")}
                      className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                      title="Choose from Media Library"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                      <span className="hidden sm:inline">Media Library</span>
                    </button>
                    {settings.logoUrl && (
                      <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={settings.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Dark / Transparent Logo URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.logoDarkUrl || ""}
                      onChange={(e) => setSettings({ ...settings, logoDarkUrl: e.target.value })}
                      placeholder="/logo-transparent.png"
                      className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaFieldTarget("logoDarkUrl")}
                      className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                      title="Choose from Media Library"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                      <span className="hidden sm:inline">Media Library</span>
                    </button>
                    {settings.logoDarkUrl && (
                      <div className="w-9 h-9 rounded-lg border border-gray-700 bg-gray-900 flex items-center justify-center overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={settings.logoDarkUrl} alt="Dark Logo Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Browser Favicon URL (.ico / .png)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.faviconUrl || ""}
                      onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                      placeholder="/favicon.ico"
                      className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaFieldTarget("faviconUrl")}
                      className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                      title="Choose from Media Library"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                      <span className="hidden sm:inline">Media Library</span>
                    </button>
                    {settings.faviconUrl && (
                      <div className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={settings.faviconUrl} alt="Favicon" className="w-5 h-5 object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Apple Touch Icon URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.appleTouchIcon || ""}
                      onChange={(e) => setSettings({ ...settings, appleTouchIcon: e.target.value })}
                      placeholder="/logo-png.jpg"
                      className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaFieldTarget("appleTouchIcon")}
                      className="h-9 px-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                      title="Choose from Media Library"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#009691]" />
                      <span className="hidden sm:inline">Media Library</span>
                    </button>
                    {settings.appleTouchIcon && (
                      <div className="w-9 h-9 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={settings.appleTouchIcon} alt="Touch Icon" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BUSINESS CONTACT & HEADQUARTERS */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#009691]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Contact &amp; Headquarters Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Central Support Phone</label>
                  <input
                    type="tel"
                    value={settings.contactPhone || ""}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                    placeholder="+1 (215) 598-2090"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Primary Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail || ""}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="contact@smartfonedoctor.com"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={settings.streetAddress || ""}
                    onChange={(e) => setSettings({ ...settings, streetAddress: e.target.value })}
                    placeholder="33 S 52nd St"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">City, State, ZIP</label>
                  <input
                    type="text"
                    value={settings.cityStateZip || ""}
                    onChange={(e) => setSettings({ ...settings, cityStateZip: e.target.value })}
                    placeholder="Philadelphia, PA 19139"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">Business Hours</label>
                  <input
                    type="text"
                    value={settings.businessHours || ""}
                    onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                    placeholder="Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>
            </div>

            {/* SOCIAL MEDIA & DIRECTORY PROFILES */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#009691]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Social Profiles &amp; Maps Links
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Facebook Page URL</label>
                  <input
                    type="url"
                    value={settings.facebookUrl || ""}
                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/smartfonedoctor"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Instagram Profile URL</label>
                  <input
                    type="url"
                    value={settings.instagramUrl || ""}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/smartfonedoctor"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">YouTube Channel URL</label>
                  <input
                    type="url"
                    value={settings.youtubeUrl || ""}
                    onChange={(e) => setSettings({ ...settings, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/@smartfonedoctor"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Google Maps / GMB URL</label>
                  <input
                    type="url"
                    value={settings.gmbUrl || ""}
                    onChange={(e) => setSettings({ ...settings, gmbUrl: e.target.value })}
                    placeholder="https://share.google/gTlyWLewR88ToAdJQ"
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW CARD */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Google Snippet Preview</h3>
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white border border-gray-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.faviconUrl || "/logo-png.jpg"}
                    alt="Favicon"
                    className="w-3.5 h-3.5 object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[12px] font-bold text-gray-900 truncate">
                    {settings.siteName || "SmartFoneDoctor"}
                  </span>
                  <span className="text-[11px] text-gray-500 truncate">https://smartfonedoctor.com</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer pt-0.5">
                {settings.defaultMetaTitle}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {settings.defaultMetaDescription}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 leading-snug">
              These settings apply as global fallbacks whenever an individual page or blog post has empty SEO fields.
            </div>

            {/* LIVE BRAND ASSET PREVIEW */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Live Brand Assets Preview</h3>

              {/* Browser Tab Simulation */}
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-2 text-xs">
                <span className="text-[10px] text-gray-400 block mb-1 font-medium">Browser Tab Preview:</span>
                <div className="inline-flex items-center gap-2 bg-white rounded-t-lg px-3 py-1.5 border-t border-x border-gray-200 shadow-2xs max-w-full">
                  <div className="w-3.5 h-3.5 rounded-xs flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.faviconUrl || "/logo-png.jpg"} alt="Favicon" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-800 truncate max-w-[180px]">
                    {settings.siteName} · {settings.defaultMetaTitle.split("|")[0].trim()}
                  </span>
                </div>
              </div>

              {/* Logo Card Preview */}
              <div className="rounded-xl border border-gray-200 p-3 bg-white flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Header Logo</span>
                  <span className="text-xs font-semibold text-gray-900">{settings.siteName}</span>
                </div>
                <div className="h-10 px-3 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logoUrl || "/logo-png.jpg"} alt="Logo Preview" className="max-h-8 max-w-[110px] object-contain" />
                </div>
              </div>
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${r.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
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

      {/* TAB 4: ROBOTS, SITEMAP & LLMS.TXT HYBRID CONTROLS */}
      {activeTab === "crawlers" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Robots.txt, Sitemap &amp; AI Crawler Controls (Auto + Include/Exclude)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Auto-generated from live PostgreSQL routes with persistent manual Include/Exclude overrides and protected admin rules.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/robots.txt"
                target="_blank"
                className="h-8 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Live robots.txt</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/sitemap.xml"
                target="_blank"
                className="h-8 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Live sitemap.xml</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/llms.txt"
                target="_blank"
                className="h-8 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Live llms.txt</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
              <Link
                href="/llms-full.txt"
                target="_blank"
                className="h-8 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Live llms-full.txt</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* 4 Feature Toggles aligned with Prisma SiteSeoSettings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Standard Search Engine Web Crawlers */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-[#009691]" />
                    <h4 className="text-xs font-bold text-gray-900">Standard Search Crawlers</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Allow Googlebot, Bingbot, and search crawlers to index your public repair pages and blogs.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableRobotsTxt}
                  onChange={(e) => setSettings({ ...settings, enableRobotsTxt: e.target.checked })}
                  className="w-4 h-4 text-[#009691] rounded accent-[#009691] mt-0.5 cursor-pointer"
                />
              </div>
              <div className="text-[11px] text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 font-mono">
                {settings.enableRobotsTxt
                  ? "User-agent: * | Protected: /admin/, /api/admin/"
                  : "User-agent: * | Disallow: / (ALL CRAWLERS BLOCKED)"}
              </div>
            </div>

            {/* 2. AI Search vs AI Training Split Controls */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
              <div className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-gray-900">AI Search vs Model Training Crawlers</h4>
              </div>
              <div className="space-y-2.5 text-xs">
                <label className="flex items-start justify-between gap-3 p-2 rounded-lg bg-white border border-gray-200 cursor-pointer">
                  <div>
                    <div className="font-semibold text-gray-800">AI Search &amp; Citations</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {AI_SEARCH_BOTS.join(", ")}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAiBots}
                    onChange={(e) => setSettings({ ...settings, enableAiBots: e.target.checked })}
                    className="w-4 h-4 text-[#009691] rounded accent-[#009691] mt-0.5 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-2 rounded-lg bg-white border border-gray-200 cursor-pointer">
                  <div>
                    <div className="font-semibold text-gray-800">AI Model Training Scrapers</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {AI_TRAINING_BOTS.join(", ")}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAiTrainingBots ?? true}
                    onChange={(e) =>
                      setSettings({ ...settings, enableAiTrainingBots: e.target.checked })
                    }
                    className="w-4 h-4 text-[#009691] rounded accent-[#009691] mt-0.5 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* 3. Dynamic XML Sitemap */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-gray-900">Dynamic XML Sitemap</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Auto-includes Published CMS pages, blogs, catalog devices, repairs, neighborhoods + your custom Include/Exclude overrides below.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableSitemap}
                  onChange={(e) => setSettings({ ...settings, enableSitemap: e.target.checked })}
                  className="w-4 h-4 text-[#009691] rounded accent-[#009691] mt-0.5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <span className="font-mono text-[11px]">URL: /sitemap.xml</span>
                <Link href="/sitemap.xml" target="_blank" className="font-semibold underline flex items-center gap-1">
                  <span>Open Sitemap</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 4. LLMs.txt & Agent Knowledge Graph */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-gray-900">llms.txt &amp; llms-full.txt (AI Knowledge Files)</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Auto-synced from stores, AEO guardrails, repair prices &amp; guides, plus your custom summary/sections below.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableLlmsTxt}
                  onChange={(e) => setSettings({ ...settings, enableLlmsTxt: e.target.checked })}
                  className="w-4 h-4 text-[#009691] rounded accent-[#009691] mt-0.5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <span className="font-mono text-[11px]">URL: /llms.txt &amp; /llms-full.txt</span>
                <Link href="/llms.txt" target="_blank" className="font-semibold underline flex items-center gap-1">
                  <span>Open llms.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* PANEL 1: ROBOTS.TXT INCLUDE / EXCLUDE & CUSTOM DIRECTIVES */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  robots.txt Include (Allow) / Exclude (Disallow) Paths
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  One path per line (e.g. <code>/private-offer/</code>). Changes apply live to <code>/robots.txt</code> without redeploying.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-gray-500">Locked Disallow:</span>
                {PROTECTED_DISALLOW_PATHS.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Extra Allow Paths (Include)
                </label>
                <textarea
                  rows={3}
                  value={robotsAllowText}
                  onChange={(e) => {
                    setRobotsAllowText(e.target.value);
                    setSettings((prev) => ({
                      ...prev,
                      robotsAllowPaths: parsePathList(e.target.value),
                    }));
                  }}
                  placeholder={"/special-landing\n/api/public-catalog"}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Custom Disallow Paths (Exclude)
                </label>
                <textarea
                  rows={3}
                  value={robotsDisallowText}
                  onChange={(e) => {
                    setRobotsDisallowText(e.target.value);
                    setSettings((prev) => ({
                      ...prev,
                      robotsDisallowPaths: parsePathList(e.target.value),
                    }));
                  }}
                  placeholder={"/list/\n/profile/\n/thank-you"}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Extra Custom Directives (Advanced — optional User-agent blocks)
              </label>
              <textarea
                rows={3}
                value={settings.robotsCustomRules || ""}
                onChange={(e) => setSettings({ ...settings, robotsCustomRules: e.target.value })}
                placeholder={"User-agent: Bingbot\nCrawl-delay: 2\nDisallow: /temp-promo/"}
                className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#009691]"
              />
            </div>
          </div>

          {/* PANEL 2: SITEMAP INCLUDE / EXCLUDE OVERRIDES */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                sitemap.xml Manual Include &amp; Exclude Overrides
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                CMS pages, blog posts, catalog models/repairs &amp; neighborhoods are included automatically. Use these boxes for custom Next.js feature routes or exclusions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Custom Include URLs / Paths (Add new feature routes)
                </label>
                <textarea
                  rows={3}
                  value={sitemapIncludeText}
                  onChange={(e) => {
                    setSitemapIncludeText(e.target.value);
                    setSettings((prev) => ({
                      ...prev,
                      sitemapIncludeUrls: parsePathList(e.target.value),
                    }));
                  }}
                  placeholder={"/trade-in\n/corporate-repair"}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Exclude Paths from Sitemap (supports <code>*</code> prefix e.g. <code>/promo/*</code>)
                </label>
                <textarea
                  rows={3}
                  value={sitemapExcludeText}
                  onChange={(e) => {
                    setSitemapExcludeText(e.target.value);
                    setSettings((prev) => ({
                      ...prev,
                      sitemapExcludePaths: parsePathList(e.target.value),
                    }));
                  }}
                  placeholder={"/thank-you\n/test-page"}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>
          </div>

          {/* PANEL 3: LLMS.TXT & LLMS-FULL.TXT CUSTOMIZATION */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                llms.txt &amp; llms-full.txt Content Controls &amp; Exclusions
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Customize the top AI summary, append new feature sections in Markdown, or exclude paths from both LLM knowledge files.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Brand Intro / AI Summary (leave blank to use default intro)
              </label>
              <textarea
                rows={2}
                value={settings.llmsCustomSummary || ""}
                onChange={(e) => setSettings({ ...settings, llmsCustomSummary: e.target.value })}
                placeholder="SmartFoneDoctor provides fast, walk-in smartphone, laptop, and gaming console repairs across 3 West Philadelphia locations with a 90-day warranty."
                className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs focus:outline-none focus:border-[#009691]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Extra Custom Markdown Sections / Feature Links (Include)
                </label>
                <textarea
                  rows={4}
                  value={settings.llmsCustomSections || ""}
                  onChange={(e) => setSettings({ ...settings, llmsCustomSections: e.target.value })}
                  placeholder={"## Trade-In & Business Accounts\n- [Device Buyback Program](https://smartfonedoctor.com/trade-in): Instant quotes for iPhones and MacBooks."}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Exclude Paths from llms.txt &amp; llms-full.txt
                </label>
                <textarea
                  rows={4}
                  value={llmsExcludeText}
                  onChange={(e) => {
                    setLlmsExcludeText(e.target.value);
                    setSettings((prev) => ({
                      ...prev,
                      llmsExcludePaths: parsePathList(e.target.value),
                    }));
                  }}
                  placeholder={"/california-supply-chain-act\n/blog/old-draft"}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-xs font-mono focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>
          </div>

          {/* Live Robots.txt Preview (100% synced with src/app/robots.ts) */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Live Robots.txt Output Preview
              </span>
              <span className="text-[11px] text-gray-400">
                Generated using the exact shared engine powering /robots.txt
              </span>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre border border-gray-800 max-h-[380px]">
              {
                buildRobotsOutput(
                  {
                    enableRobotsTxt: settings.enableRobotsTxt,
                    enableAiBots: settings.enableAiBots,
                    enableAiTrainingBots: settings.enableAiTrainingBots ?? true,
                    enableSitemap: settings.enableSitemap,
                    robotsAllowPaths: settings.robotsAllowPaths,
                    robotsDisallowPaths: settings.robotsDisallowPaths,
                    robotsCustomRules: settings.robotsCustomRules,
                  },
                  "https://smartfonedoctor.com"
                ).previewText
              }
            </pre>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="h-9 px-4 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Crawler & Sitemap Rules"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-STORE SCHEMA.ORG STUDIO */}
      {activeTab === "schema" && (
        <div className="space-y-4">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Schema.org Structured Data Studio
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Multi-location JSON-LD markup for Google Search Rich Snippets &amp; Maps synchronization.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Google Rich Results Test</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="h-8 px-3.5 rounded-lg bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy JSON-LD"}</span>
              </button>
            </div>
          </div>

          {/* 2-COLUMN STUDIO LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: Controls, Active Entity, & Enhancements (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Location Scope Switcher Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Location Scope
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {schemaScope === "all" ? "Consolidated Multi-Store" : `Store #${schemaScope}`}
                  </span>
                </div>

                {/* Scope segmented buttons */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setSchemaScope("all")}
                    className={`py-1.5 px-2 rounded-md font-medium text-center transition-all cursor-pointer ${schemaScope === "all"
                        ? "bg-white text-[#009691] shadow-2xs font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    All Locations
                  </button>
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSchemaScope(s.id)}
                      className={`py-1.5 px-2 rounded-md font-medium text-center transition-all cursor-pointer ${schemaScope === s.id
                          ? "bg-white text-[#009691] shadow-2xs font-semibold"
                          : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      Store #{s.id}
                    </button>
                  ))}
                </div>

                {/* Schema @type selector */}
                <div className="pt-2 border-t border-gray-100">
                  <label htmlFor="schemaTypeSelector" className="text-xs font-medium text-gray-700 block mb-1">
                    Primary Schema @type
                  </label>
                  <select
                    id="schemaTypeSelector"
                    value={schemaType}
                    onChange={(e) => setSchemaType(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:border-[#009691]"
                  >
                    <option value="LocalBusiness">LocalBusiness (Store & Repair - Recommended)</option>
                    <option value="ElectronicsStore">ElectronicsStore</option>
                    <option value="LocalBusiness">LocalBusiness</option>
                    <option value="FAQPage">FAQPage (Q&amp;A Rich Snippets)</option>
                    <option value="Service">Service (Repair Offer Catalog)</option>
                  </select>
                </div>
              </div>

              {/* Active Entity Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#009691]" />
                    <span className="text-xs font-semibold text-gray-900">
                      {activeStoreObj ? activeStoreObj.name : "All 3 Philadelphia Locations"}
                    </span>
                  </div>
                  {activeStoreObj && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditStore(activeStoreObj, e)}
                      className="text-xs text-[#009691] hover:text-[#007f7b] font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <span>
                      {activeStoreObj
                        ? `${activeStoreObj.address}, ${activeStoreObj.cityStateZip}`
                        : "3 Stores across West Philadelphia & University City"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{activeStoreObj ? activeStoreObj.businessHours : "Mon - Sat: 10:00 AM - 7:00 PM"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-gray-500">
                    <span>Phone: {activeStoreObj ? activeStoreObj.phone : "+1 (215) 598-2090"}</span>
                    <span className="text-amber-600 font-medium">★ 4.9 (1,500+ reviews)</span>
                  </div>
                </div>

                {/* Store Quick Switchers (Cards) if in all view */}
                {schemaScope === "all" && (
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <span className="text-[11px] font-medium text-gray-400 block uppercase tracking-wider">
                      Included Branches ({stores.length})
                    </span>
                    <div className="space-y-1">
                      {stores.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-gray-800 block truncate">{s.name}</span>
                            <span className="text-[11px] text-gray-500 block truncate">{s.address}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditStore(s, e)}
                            className="text-[11px] text-[#009691] hover:underline shrink-0 font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Schema Enhancements & Rich Results Checklist */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-900 block">Rich Results Enhancements</span>
                    <span className="text-[11px] text-gray-500 block">Inject payment methods, service catalog &amp; geofence</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isEnhanced}
                    onChange={handleToggleEnhance}
                    className="w-4 h-4 text-[#009691] rounded accent-[#009691] cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Valid Schema.org syntax &amp; context</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Google Star Rating snippet eligible (4.9★)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Accurate GPS Coordinates &amp; PostalAddress</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>GMB &amp; Yelp Authority Verification links</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Code Inspector & Output Window (7 cols) */}
            <div className="lg:col-span-7 bg-gray-950 rounded-xl border border-gray-800 overflow-hidden shadow-sm flex flex-col">
              <div className="px-4 py-3 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-gray-300">
                    application/ld+json
                  </span>
                  <span className="text-gray-500 text-[11px]">
                    ({schemaScope === "all" ? "Multi-Location" : `Store #${schemaScope}`})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="h-7 px-2.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy Code"}</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto max-h-[520px] select-all">
                {JSON.stringify(jsonLdData, null, 2)}
              </pre>

              <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-800 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Dynamically generated &amp; injected into HTML head</span>
                <span className="text-emerald-500 font-medium">Ready for Google Search Console</span>
              </div>
            </div>
          </div>

          {/* ── EDIT STORE MODAL ── */}
          {editingStore && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#009691]" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Edit Store #{editingStore.id} Schema Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingStore(null)}
                    className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Store / Branch Name</label>
                    <input
                      type="text"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Street Address</label>
                      <input
                        type="text"
                        value={editFormData.address || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">City, State &amp; ZIP</label>
                      <input
                        type="text"
                        value={editFormData.cityStateZip || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, cityStateZip: e.target.value })}
                        className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Telephone Number</label>
                      <input
                        type="text"
                        value={editFormData.phone || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Operating Hours</label>
                      <input
                        type="text"
                        value={editFormData.businessHours || ""}
                        onChange={(e) => setEditFormData({ ...editFormData, businessHours: e.target.value })}
                        className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Google Business Profile (GMB) URL</label>
                    <input
                      type="text"
                      value={editFormData.gmbUrl || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, gmbUrl: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="w-full h-8 px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#009691]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStore(null)}
                    className="h-8 px-3 rounded border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStore}
                    disabled={isSavingStore}
                    className="h-8 px-4 rounded bg-[#009691] hover:bg-[#007f7b] text-white text-xs font-medium cursor-pointer transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingStore ? "Saving..." : "Save to Database"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Media Management Library Picker Modal */}
      <MediaModal
        isOpen={mediaFieldTarget !== null}
        onClose={() => setMediaFieldTarget(null)}
        onSelect={(payload: SelectedMediaPayload) => {
          if (mediaFieldTarget) {
            setSettings((prev) => ({ ...prev, [mediaFieldTarget]: payload.url }));
          }
          setMediaFieldTarget(null);
        }}
        title={`Select ${mediaFieldTarget === "logoUrl"
            ? "Primary Website Logo"
            : mediaFieldTarget === "logoDarkUrl"
              ? "Dark Logo Asset"
              : mediaFieldTarget === "faviconUrl"
                ? "Browser Favicon (.ico / .png)"
                : mediaFieldTarget === "appleTouchIcon"
                  ? "Apple Touch Icon"
                  : "Social Share (OG) Image"
          }`}
        selectButtonText="Use This Image"
        initialSelectedUrl={mediaFieldTarget ? (settings[mediaFieldTarget] as string) || "" : ""}
      />
    </div>
  );
}
