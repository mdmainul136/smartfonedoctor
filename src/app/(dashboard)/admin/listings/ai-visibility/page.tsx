"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import { useListings, CATALOG_DIRECTORIES } from "@/lib/listingsContext";
import {
  getGeoNeighborhoodsAction,
  upsertGeoNeighborhoodAction,
  deleteGeoNeighborhoodAction,
  getAeoBrandGuardrailsAction,
  upsertAeoBrandGuardrailAction,
  deleteAeoBrandGuardrailAction,
  getAeoSimulatedPromptsAction,
  upsertAeoSimulatedPromptAction,
  deleteAeoSimulatedPromptAction,
  getKnowledgeGraphEntityAction,
  updateKnowledgeGraphEntityAction,
  probeLiveAiVisibilityAction,
  runLiveVisibilityAuditAction,
  type LiveAiProbeResult,
  type LiveVisibilityAuditResult,
} from "@/actions/geoAeo";
import { getGmbPostsAction, type GmbPostItem } from "@/actions/localSeo";
import {
  RefreshCw,
  Check,
  Copy,
  X,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

type AiTab = "overview" | "neighborhoods" | "schema-crawlers" | "guardrails";
type StudioArtifact = "jsonld" | "llms" | "robots";

interface GeoNeighborhood {
  id: string;
  storeId: number;
  name: string;
  type: "Campus" | "Commercial Corridor" | "Transit Hub" | "Neighborhood";
  radius: string;
  zipCodes: string[];
  keyLandmarks: string[];
  status: string;
}

interface BrandTruthGuardrail {
  id: string;
  topic: string;
  claim: string;
  canonicalAnswer: string;
  sourcesVerified: string[];
  status: string;
}

interface TrackedPrompt {
  id: string;
  queryTemplate: string;
  intent: string;
  category: string;
  expectedCitation: string;
  verifiedStatus: string;
  storeId?: number | null;
}

const STORE_GEO_CONTEXT: Record<
  number,
  { landmark: string; neighborhood: string; street: string; zip: string }
> = {
  1: {
    landmark: "52nd St Station",
    neighborhood: "West Philadelphia",
    street: "33 S 52nd St",
    zip: "19139",
  },
  2: {
    landmark: "Drexel & UPenn",
    neighborhood: "University City Philly",
    street: "4016 Lancaster Ave",
    zip: "19104",
  },
  3: {
    landmark: "Lancaster Ave Trolley",
    neighborhood: "West Powelton / University City",
    street: "4060 Lancaster Ave",
    zip: "19104",
  },
};

const CORE_AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "PerplexityBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function AiVisibilityPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } = useStoreContext();
  const { directories, connectors, isLoading: listingsLoading } = useListings();
  const storeShortName = selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [activeTab, setActiveTab] = useState<AiTab>("overview");
  const [activeArtifact, setActiveArtifact] = useState<StudioArtifact>("jsonld");
  const [promptCategory, setPromptCategory] = useState<string>("All");
  const [isScanning, setIsScanning] = useState(false);
  const [noticeBanner, setNoticeBanner] = useState<{
    tone: "success" | "warning" | "error";
    text: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live audited site & DB telemetry
  const [audit, setAudit] = useState<LiveVisibilityAuditResult | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(true);

  // Real PostgreSQL GEO & AEO state
  const [neighborhoods, setNeighborhoods] = useState<GeoNeighborhood[]>([]);
  const [guardrails, setGuardrails] = useState<BrandTruthGuardrail[]>([]);
  const [prompts, setPrompts] = useState<TrackedPrompt[]>([]);
  const [gmbPosts, setGmbPosts] = useState<GmbPostItem[]>([]);
  const [newPromptText, setNewPromptText] = useState("");
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);

  // Live AI Probe state
  const [probeQuery, setProbeQuery] = useState(
    "Best same-day iPhone 15 Pro screen repair near 52nd St Philadelphia"
  );
  const [probeResult, setProbeResult] = useState<LiveAiProbeResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  // Knowledge Graph Editor state
  const [kgWikidata, setKgWikidata] = useState("");
  const [kgGoogleId, setKgGoogleId] = useState("");
  const [kgSameAsText, setKgSameAsText] = useState("");
  const [isSavingKg, setIsSavingKg] = useState(false);

  // Neighborhood Add Form
  const [showNeighborForm, setShowNeighborForm] = useState(false);
  const [newNeighborName, setNewNeighborName] = useState("");
  const [newNeighborType, setNewNeighborType] =
    useState<GeoNeighborhood["type"]>("Neighborhood");
  const [newNeighborRadius, setNewNeighborRadius] = useState("2.0 mi");
  const [newNeighborZips, setNewNeighborZips] = useState("");
  const [newNeighborLandmarks, setNewNeighborLandmarks] = useState("");

  // Guardrail Add Form
  const [showGuardForm, setShowGuardForm] = useState(false);
  const [newGuardTopic, setNewGuardTopic] = useState("");
  const [newGuardClaim, setNewGuardClaim] = useState("");
  const [newGuardAnswer, setNewGuardAnswer] = useState("");
  const [newGuardSources, setNewGuardSources] = useState("Website, llms.txt");

  const runLiveAudit = useCallback(async (showBanner: boolean) => {
    setIsScanning(true);
    const res = await runLiveVisibilityAuditAction();
    setAudit(res);
    setIsScanning(false);

    if (showBanner) {
      if (!res.success) {
        setNoticeBanner({
          tone: "error",
          text: res.error || "Live site audit failed.",
        });
      } else {
        const techPassed = [
          res.robots.ok && res.robots.allowedBots.length >= 4,
          res.sitemap.ok && res.sitemap.urlCount > 0,
          res.llmsTxt.ok,
          res.llmsFullTxt.ok,
          res.schema.ok,
        ].filter(Boolean).length;
        setNoticeBanner({
          tone: techPassed >= 4 ? "success" : "warning",
          text: `Live audit complete (${new Date(res.checkedAt).toLocaleTimeString()}): ${techPassed}/5 site crawler & schema checks passed · ${res.sitemap.urlCount} sitemap URLs detected.`,
        });
      }
    }
  }, []);

  useEffect(() => {
    async function loadAllData() {
      const [neighRes, guardRes, promptRes, gmbRes, kgRes] = await Promise.all([
        getGeoNeighborhoodsAction(),
        getAeoBrandGuardrailsAction(),
        getAeoSimulatedPromptsAction(),
        getGmbPostsAction(),
        getKnowledgeGraphEntityAction(),
      ]);

      if (neighRes.success && neighRes.neighborhoods) {
        setNeighborhoods(neighRes.neighborhoods as GeoNeighborhood[]);
      }
      if (guardRes.success && guardRes.guardrails) {
        setGuardrails(guardRes.guardrails as BrandTruthGuardrail[]);
      }
      if (promptRes.success && promptRes.prompts) {
        setPrompts(promptRes.prompts as TrackedPrompt[]);
      }
      if (gmbRes.success && gmbRes.posts) {
        setGmbPosts(gmbRes.posts);
      }
      if (kgRes.success && kgRes.entity) {
        setKgWikidata(kgRes.entity.wikidataId || "");
        setKgGoogleId(kgRes.entity.googleKnowledgeGraphId || "");
        setKgSameAsText((kgRes.entity.sameAsUrls || []).join("\n"));
      }
      setIsLoadingDb(false);
    }

    void loadAllData();
    void runLiveAudit(false);
  }, [runLiveAudit]);

  const connectedApiCount = useMemo(
    () => connectors.filter((c) => c.connected).length,
    [connectors]
  );

  const gbpConnected = useMemo(
    () => Boolean(connectors.find((c) => c.id === "google-gbp")?.connected),
    [connectors]
  );

  const listingMetrics = useMemo(() => {
    const entries = isAllStores
      ? directories.flatMap((d) => stores.map((st) => d.stores[st.id]))
      : directories.map((d) => d.stores[selectedStoreId]);

    const total = entries.length;
    const synced = entries.filter((e) => e?.status === "Synced").length;
    const mismatch = entries.filter((e) => e?.status === "Mismatch").length;
    const missing = entries.filter((e) => !e || e.status === "Missing").length;
    return { total, synced, mismatch, missing };
  }, [directories, stores, isAllStores, selectedStoreId]);

  const getDirScore = useCallback(
    (dirId: string, storeId?: number) => {
      const dir = directories.find((d) => d.id === dirId);
      if (!dir) return { score: 0, status: "Missing" as const };
      if (storeId) {
        const entry = dir.stores[storeId];
        return { score: entry?.napMatch ?? 0, status: entry?.status ?? ("Missing" as const) };
      }
      const vals = stores.map((st) => dir.stores[st.id]?.napMatch ?? 0);
      const avg = vals.length
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : 0;
      const anySynced = stores.some((st) => dir.stores[st.id]?.status === "Synced");
      return {
        score: avg,
        status: anySynced ? ("Synced" as const) : ("Missing" as const),
      };
    },
    [directories, stores]
  );

  const techChecks = useMemo(() => {
    const robotsOk = Boolean(audit?.robots.ok && audit.robots.allowedBots.length >= 4);
    const sitemapOk = Boolean(audit?.sitemap.ok && audit.sitemap.urlCount > 10);
    const llmsOk = Boolean(audit?.llmsTxt.ok && audit?.llmsFullTxt.ok);
    const schemaOk = Boolean(
      audit?.schema.ok &&
        (audit.schema.types.includes("LocalBusiness") ||
          audit.schema.types.includes("ElectronicsStore"))
    );
    const hasAiKey = Boolean(
      audit?.aiProviders.geminiConfigured || audit?.aiProviders.openaiConfigured
    );

    const passedTechCount = [robotsOk, sitemapOk, llmsOk, audit?.llmsFullTxt.ok ?? false, schemaOk].filter(
      Boolean
    ).length;

    return {
      robotsOk,
      sitemapOk,
      llmsOk,
      schemaOk,
      hasAiKey,
      passedTechCount,
      totalTechCount: 5,
    };
  }, [audit]);

  const checklistItems = useMemo(() => {
    return [
      {
        id: "robots",
        title: "AI crawler permissions in /robots.txt",
        detail: audit
          ? audit.robots.ok
            ? `HTTP ${audit.robots.status} · ${audit.robots.allowedBots.length}/${CORE_AI_BOTS.length} bots allowed`
            : `HTTP ${audit.robots.status || "Failed"} fetching /robots.txt`
          : "Checking live /robots.txt…",
        engine: "All AI Crawlers",
        badge: audit?.robots.ok ? `HTTP ${audit.robots.status}` : "Unverified",
        passed: techChecks.robotsOk,
        actionLabel: "View robots.txt",
        onClick: () => {
          setActiveArtifact("robots");
          setActiveTab("schema-crawlers");
        },
      },
      {
        id: "llms",
        title: "Markdown AI manifests (/llms.txt & /llms-full.txt)",
        detail: audit
          ? audit.llmsTxt.ok
            ? `/llms.txt ${audit.llmsTxt.bytes.toLocaleString()} B · /llms-full.txt ${audit.llmsFullTxt.bytes.toLocaleString()} B`
            : "Failed to fetch live /llms.txt"
          : "Checking live /llms.txt…",
        engine: "LLMs & Agents",
        badge: audit?.llmsTxt.ok ? `HTTP ${audit.llmsTxt.status}` : "Unverified",
        passed: techChecks.llmsOk,
        actionLabel: "View /llms.txt",
        onClick: () => {
          setActiveArtifact("llms");
          setActiveTab("schema-crawlers");
        },
      },
      {
        id: "sitemap",
        title: "Dynamic XML sitemap coverage (/sitemap.xml)",
        detail: audit
          ? audit.sitemap.ok
            ? `${audit.sitemap.urlCount} live URLs indexed from PostgreSQL`
            : `HTTP ${audit.sitemap.status || "Error"} fetching sitemap`
          : "Checking live /sitemap.xml…",
        engine: "Search & RAG",
        badge: audit ? `${audit.sitemap.urlCount} URLs` : "Checking…",
        passed: techChecks.sitemapOk,
        href: "/sitemap.xml",
        actionLabel: "Open sitemap",
      },
      {
        id: "schema",
        title: "Structured JSON-LD LocalBusiness / ElectronicsStore",
        detail: audit
          ? audit.schema.ok
            ? `Detected ${audit.schema.types.join(", ")}`
            : "No structured JSON-LD detected on live pages"
          : "Inspecting live JSON-LD…",
        engine: "Google & Rich Results",
        badge: `${audit?.schema.types.length ?? 0} types`,
        passed: techChecks.schemaOk,
        actionLabel: "Inspect JSON-LD",
        onClick: () => {
          setActiveArtifact("jsonld");
          setActiveTab("schema-crawlers");
        },
      },
      {
        id: "apis",
        title: "External directory API credentials & citation sync",
        detail: `${connectedApiCount}/${connectors.length} providers configured · ${listingMetrics.synced}/${listingMetrics.total} store citations synced`,
        engine: "Directories",
        badge:
          connectedApiCount > 0
            ? `${connectedApiCount} connected`
            : "0 configured",
        passed: connectedApiCount > 0 && listingMetrics.synced > 0,
        href: "/admin/listings/api-sync",
        actionLabel: connectedApiCount > 0 ? "Manage APIs" : "Connect APIs",
      },
      {
        id: "ai-key",
        title: "Live AI citation probe API key (Gemini or OpenAI)",
        detail: techChecks.hasAiKey
          ? `Configured (${
              audit?.aiProviders.geminiConfigured ? "Gemini " : ""
            }${audit?.aiProviders.openaiConfigured ? "OpenAI" : ""})`
          : "Add GEMINI_API_KEY or OPENAI_API_KEY in Settings for live prompt testing",
        engine: "Gemini / ChatGPT",
        badge: techChecks.hasAiKey ? "API Ready" : "Key Needed",
        passed: techChecks.hasAiKey,
        href: "/admin/settings",
        actionLabel: techChecks.hasAiKey ? "Settings" : "Add API Key",
      },
    ];
  }, [audit, techChecks, connectedApiCount, connectors.length, listingMetrics]);

  const passedChecklistCount = checklistItems.filter((c) => c.passed).length;

  const handleRunLiveProbe = async (customQ?: string, promptRecordId?: string) => {
    const q = customQ || probeQuery;
    if (!q.trim()) return;
    setIsProbing(true);
    const targetStoreId = isAllStores ? 1 : selectedStoreId;
    const res = await probeLiveAiVisibilityAction(q.trim(), targetStoreId, promptRecordId);
    setProbeResult(res);

    if (res.success && promptRecordId) {
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptRecordId
            ? {
                ...p,
                verifiedStatus: res.cited ? "Cited" : "Not Cited",
                expectedCitation: `Live API (${res.engine})`,
              }
            : p
        )
      );
    }

    if (res.success) {
      setNoticeBanner({
        tone: res.cited ? "success" : "warning",
        text: `Live probe (${res.engine}): SmartFoneDoctor ${
          res.cited ? "was CITED in response." : "was NOT cited in this unprimed query."
        }`,
      });
    } else {
      setNoticeBanner({
        tone: res.needsApiKey ? "warning" : "error",
        text: res.error || "Live AI probe failed.",
      });
    }
    setIsProbing(false);
  };

  const handleSaveKgEntity = async () => {
    setIsSavingKg(true);
    const urls = kgSameAsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await updateKnowledgeGraphEntityAction({
      wikidataId: kgWikidata.trim(),
      googleKnowledgeGraphId: kgGoogleId.trim(),
      sameAsUrls: urls,
    });
    if (res.success) {
      setNoticeBanner({
        tone: "success",
        text: "Updated Knowledge Graph identifiers & sameAs links in PostgreSQL.",
      });
      void runLiveAudit(false);
    } else {
      setNoticeBanner({
        tone: "error",
        text: res.error || "Failed to update Knowledge Graph entity.",
      });
    }
    setIsSavingKg(false);
  };

  const handleAddNeighborhood = async () => {
    if (!newNeighborName.trim()) return;
    const storeTargetId = isAllStores ? 1 : selectedStoreId;
    const zips = newNeighborZips
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const landmarks = newNeighborLandmarks
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await upsertGeoNeighborhoodAction({
      storeId: storeTargetId,
      name: newNeighborName.trim(),
      type: newNeighborType,
      radius: newNeighborRadius,
      zipCodes: zips,
      keyLandmarks: landmarks,
      status: "Active",
    });

    if (res.success && res.neighborhood) {
      setNeighborhoods((prev) => [...prev, res.neighborhood as GeoNeighborhood]);
      setNewNeighborName("");
      setNewNeighborZips("");
      setNewNeighborLandmarks("");
      setShowNeighborForm(false);
      setNoticeBanner({
        tone: "success",
        text: `Saved "${res.neighborhood.name}" to PostgreSQL geo-targets.`,
      });
    }
  };

  const handleDeleteNeighborhood = async (id: string) => {
    const target = neighborhoods.find((n) => n.id === id);
    setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
    await deleteGeoNeighborhoodAction(id);
    setNoticeBanner({
      tone: "warning",
      text: `Removed "${target?.name ?? "geo-target"}" from active targets.`,
    });
  };

  const handleAddGuardrail = async () => {
    if (!newGuardTopic.trim() || !newGuardClaim.trim() || !newGuardAnswer.trim()) return;
    const sources = newGuardSources
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await upsertAeoBrandGuardrailAction({
      topic: newGuardTopic.trim(),
      claim: newGuardClaim.trim(),
      canonicalAnswer: newGuardAnswer.trim(),
      sourcesVerified: sources,
      status: "Published to llms.txt",
    });

    if (res.success && res.guardrail) {
      setGuardrails((prev) => [...prev, res.guardrail as BrandTruthGuardrail]);
      setNewGuardTopic("");
      setNewGuardClaim("");
      setNewGuardAnswer("");
      setShowGuardForm(false);
      setNoticeBanner({
        tone: "success",
        text: `Published truth guardrail "${res.guardrail.topic}" to PostgreSQL & /llms.txt.`,
      });
    }
  };

  const handleDeleteGuardrail = async (id: string) => {
    const target = guardrails.find((g) => g.id === id);
    setGuardrails((prev) => prev.filter((g) => g.id !== id));
    await deleteAeoBrandGuardrailAction(id);
    setNoticeBanner({
      tone: "warning",
      text: `Removed guardrail "${target?.topic ?? "fact"}".`,
    });
  };

  const handleSaveCustomPrompt = async () => {
    if (!newPromptText.trim()) return;
    setIsAddingPrompt(true);
    const res = await upsertAeoSimulatedPromptAction({
      queryTemplate: newPromptText.trim(),
      intent: "Custom buyer query",
      category: promptCategory === "All" ? "Screen repair" : promptCategory,
      verifiedStatus: "Not Probed",
      storeId: isAllStores ? 1 : selectedStoreId,
    });
    if (res.success && res.prompt) {
      setPrompts((prev) => [res.prompt as TrackedPrompt, ...prev]);
      setNewPromptText("");
      setNoticeBanner({
        tone: "success",
        text: "Saved search prompt to PostgreSQL for live citation tracking.",
      });
    }
    setIsAddingPrompt(false);
  };

  const handleDeletePrompt = async (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    await deleteAeoSimulatedPromptAction(id);
  };

  const resolvedPrompts = useMemo(() => {
    return prompts.map((p, index) => {
      const effectiveStoreId = isAllStores
        ? p.storeId ?? ((index % 3) + 1)
        : p.storeId ?? selectedStoreId;
      const geo = STORE_GEO_CONTEXT[effectiveStoreId] ?? STORE_GEO_CONTEXT[1];
      const storeObj = stores.find((s) => s.id === effectiveStoreId) ?? stores[0];
      const query = p.queryTemplate
        .replace("{landmark}", geo.landmark)
        .replace("{neighborhood}", geo.neighborhood)
        .replace("{street}", geo.street)
        .replace("{zip}", geo.zip);

      return {
        ...p,
        effectiveStoreId,
        storeObj,
        query,
      };
    });
  }, [prompts, isAllStores, selectedStoreId, stores]);

  const filteredPrompts = useMemo(() => {
    if (promptCategory === "All") return resolvedPrompts;
    return resolvedPrompts.filter((p) => p.category === promptCategory);
  }, [resolvedPrompts, promptCategory]);

  const unclaimedCatalogTargets = useMemo(() => {
    return CATALOG_DIRECTORIES.filter(
      (cat) => !directories.some((d) => d.id === cat.id)
    ).slice(0, 3);
  }, [directories]);

  const fallbackJsonLd = useMemo(() => {
    const sameAsUrls = [
      ...directories.map((d) => d.stores[selectedStoreId]?.url).filter(Boolean),
      ...kgSameAsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    ];
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": ["LocalBusiness", "ElectronicsStore"],
        "@id": `https://smartfonedoctor.com/#store-${selectedStore.id}`,
        name: "Smart Fone Doctor",
        branchCode: `PHL-0${selectedStore.id}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: selectedStore.address,
          addressLocality: "Philadelphia",
          addressRegion: "PA",
          postalCode: selectedStore.cityStateZip.split(" ").pop(),
          addressCountry: "US",
        },
        telephone: selectedStore.phone,
        sameAs: Array.from(new Set(sameAsUrls)),
      },
      null,
      2
    );
  }, [directories, selectedStore, selectedStoreId, kgSameAsText]);

  const displayedJsonLd = audit?.schema.sampleJsonLd || fallbackJsonLd;
  const displayedLlmsTxt =
    audit?.llmsTxt.content || "Click 'Re-verify Live Site' to inspect live /llms.txt content.";
  const displayedRobotsTxt =
    audit?.robots.content || "Click 'Re-verify Live Site' to inspect live /robots.txt directives.";

  const copyCode = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 flex flex-col gap-6 overflow-x-hidden antialiased">
      {/* 1. HERO HEADER */}
      <div className="rounded-3xl bg-white p-5 sm:p-7 border border-teal-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#009691] text-white flex items-center justify-center shadow-md shadow-[#009691]/25 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Search &amp; AI visibility
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/80 text-[#009691] text-[11px] font-semibold px-2.5 py-0.5">
                {isAllStores ? "All 3 Philly stores" : storeShortName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Live HTTP crawler checks, PostgreSQL GEO/AEO telemetry, and real LLM citation probing.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link
            href="/admin/listings"
            className="h-9 px-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Directory listings</span>
          </Link>

          <button
            type="button"
            onClick={() => void runLiveAudit(true)}
            disabled={isScanning}
            className="h-9 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm shadow-[#009691]/25 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{isScanning ? "Auditing live site…" : "Run Live Audit"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          {
            key: "overview" as AiTab,
            label: "Live Audit & Probes",
            count: checklistItems.length - passedChecklistCount,
          },
          {
            key: "neighborhoods" as AiTab,
            label: "Neighborhoods & Geo-Fences",
            count: (isAllStores
              ? neighborhoods
              : neighborhoods.filter((n) => n.storeId === selectedStoreId)
            ).length,
          },
          {
            key: "schema-crawlers" as AiTab,
            label: "Schema & AI Crawlers",
          },
          {
            key: "guardrails" as AiTab,
            label: "Truth Guardrails",
            count: guardrails.length,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-white text-[#009691] shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-teal-50 text-[#009691] border border-teal-200/60 font-semibold"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {noticeBanner && (
        <div
          role="status"
          aria-live="polite"
          className={`font-medium rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-xs border ${
            noticeBanner.tone === "success"
              ? "bg-teal-50 border-teal-200 text-[#009691]"
              : noticeBanner.tone === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span>{noticeBanner.text}</span>
          <button
            type="button"
            onClick={() => setNoticeBanner(null)}
            aria-label="Dismiss notice"
            className="p-1 rounded-md cursor-pointer shrink-0 hover:opacity-75"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 2. REAL METRIC SURFACES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Live Crawler Readiness</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {audit ? `${techChecks.passedTechCount}/${techChecks.totalTechCount}` : "—"}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                techChecks.passedTechCount === techChecks.totalTechCount
                  ? "text-[#009691] bg-teal-50 border-teal-200/60"
                  : "text-amber-800 bg-amber-50 border-amber-200"
              }`}
            >
              {audit
                ? techChecks.passedTechCount === techChecks.totalTechCount
                  ? "HTTP Verified"
                  : "Needs Check"
                : "Auditing…"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Sitemap &amp; /llms.txt</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {audit ? `${audit.sitemap.urlCount}` : "—"}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                audit?.llmsTxt.ok
                  ? "text-[#009691] bg-teal-50 border-teal-200/60"
                  : "text-amber-800 bg-amber-50 border-amber-200"
              }`}
            >
              {audit
                ? audit.llmsTxt.ok
                  ? "URLs · llms.txt OK"
                  : `llms HTTP ${audit.llmsTxt.status || 0}`
                : "Auditing…"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Directory API Sync</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {listingsLoading ? "—" : `${connectedApiCount}/${connectors.length}`}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                connectedApiCount > 0
                  ? "text-[#009691] bg-teal-50 border-teal-200/60"
                  : "text-amber-800 bg-amber-50 border-amber-200"
              }`}
            >
              {listingsLoading
                ? "Loading…"
                : `${listingMetrics.synced}/${listingMetrics.total} synced`}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Schema &amp; Live AI Probe</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-[#009691] leading-none tabular-nums">
              {audit ? `${audit.schema.types.length} JSON-LD` : "Checking…"}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                techChecks.hasAiKey
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                  : "text-amber-800 bg-amber-50 border-amber-200"
              }`}
            >
              {techChecks.hasAiKey ? "Probe API Ready" : "API Key Needed"}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: LIVE AUDIT & PROBES
      =================================================================== */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* A. LIVE TECHNICAL & API READINESS CHECKLIST */}
          <section
            aria-label="Live technical and API readiness checklist"
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-slate-900">
                  Live Visibility &amp; Readiness Checklist
                </h2>
                <span className="text-xs text-slate-500 tabular-nums font-medium">
                  · {passedChecklistCount} of {checklistItems.length} verified
                </span>
              </div>

              <button
                type="button"
                onClick={() => void runLiveAudit(true)}
                disabled={isScanning}
                className="h-7 px-3.5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs shadow-[#009691]/20 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin" : ""}`} />
                <span>Re-verify Live</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {item.passed ? (
                      <CheckCircle2
                        className="w-4 h-4 text-[#009691] shrink-0 mt-0.5 sm:mt-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0"
                        aria-hidden="true"
                      />
                    )}

                    <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                      <span
                        className={`text-sm font-medium truncate ${
                          item.passed ? "text-slate-700" : "text-slate-900 font-semibold"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="hidden sm:inline text-slate-300">·</span>
                      <span className="text-xs text-slate-500 truncate">{item.detail}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 pl-7 sm:pl-0">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                      {item.engine}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
                        item.passed
                          ? "bg-teal-50 text-[#009691] border border-teal-200/60"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {item.badge}
                    </span>

                    {item.href ? (
                      <Link
                        href={item.href}
                        target={item.href.endsWith(".xml") ? "_blank" : undefined}
                        className="h-7 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>{item.actionLabel}</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className="h-7 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{item.actionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* B. 2-COLUMN LIVE SITE TELEMETRY + REAL DIRECTORY FEEDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Live Site Crawler & Schema Telemetry */}
            <section
              aria-label="Live site crawler and schema telemetry"
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Live Site Crawler &amp; Schema Telemetry
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Real HTTP checks against {audit?.siteUrl || "smartfonedoctor.com"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("schema-crawlers")}
                    className="text-xs font-semibold text-[#009691] hover:underline cursor-pointer shrink-0"
                  >
                    Inspect files →
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  {/* Live Endpoints Status Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-500 font-medium">/robots.txt</div>
                      <div className="mt-1 font-bold text-slate-900 tabular-nums">
                        {audit ? `HTTP ${audit.robots.status || "Err"}` : "Checking…"} ·{" "}
                        {audit?.robots.allowedBots.length ?? 0} AI bots
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-500 font-medium">/sitemap.xml</div>
                      <div className="mt-1 font-bold text-slate-900 tabular-nums">
                        {audit ? `HTTP ${audit.sitemap.status || "Err"}` : "Checking…"} ·{" "}
                        {audit?.sitemap.urlCount ?? 0} URLs
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-500 font-medium">/llms.txt</div>
                      <div className="mt-1 font-bold text-slate-900 tabular-nums">
                        {audit ? `HTTP ${audit.llmsTxt.status || "Err"}` : "Checking…"} ·{" "}
                        {audit?.llmsTxt.bytes.toLocaleString() ?? 0} B
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-500 font-medium">/llms-full.txt</div>
                      <div className="mt-1 font-bold text-slate-900 tabular-nums">
                        {audit ? `HTTP ${audit.llmsFullTxt.status || "Err"}` : "Checking…"} ·{" "}
                        {audit?.llmsFullTxt.bytes.toLocaleString() ?? 0} B
                      </div>
                    </div>
                  </div>

                  {/* Allowed AI Bots */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-2">
                      Permitted AI Crawlers in /robots.txt
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {CORE_AI_BOTS.map((bot) => {
                        const allowed = audit?.robots.allowedBots.includes(bot);
                        return (
                          <span
                            key={bot}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              allowed
                                ? "bg-teal-50 text-[#009691] border-teal-200/60"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}
                          >
                            {bot} {allowed ? "✓" : "—"}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live JSON-LD Types */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-2">
                      Live JSON-LD @type Schemas Detected
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {audit?.schema.types.length ? (
                        audit.schema.types.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-mono font-semibold"
                          >
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">
                          {audit ? "No JSON-LD parsed from live response" : "Inspecting live HTML…"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  DB Ground Truth: {neighborhoods.length} geo-targets · {guardrails.length} guardrails
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  {audit ? new Date(audit.checkedAt).toLocaleTimeString() : "Pending"}
                </span>
              </div>
            </section>

            {/* Right: Real Directory Citation Feeds */}
            <section
              aria-label="Directory citation feeds from PostgreSQL"
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Directory feeds powering AI
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Real PostgreSQL NAP accuracy ({isAllStores ? "3-store avg" : storeShortName})
                    </p>
                  </div>
                  <Link
                    href="/admin/listings"
                    className="text-xs font-semibold text-[#009691] hover:underline shrink-0"
                  >
                    All {directories.length} directories →
                  </Link>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  {[
                    {
                      id: "gmb",
                      label: "Google Business Profile",
                      feeds: ["Gemini", "Perplexity"],
                    },
                    {
                      id: "bing",
                      label: "Bing Places",
                      feeds: ["ChatGPT Search", "Copilot"],
                    },
                    {
                      id: "yelp",
                      label: "Yelp for Business",
                      feeds: ["ChatGPT", "Perplexity", "Siri"],
                    },
                    {
                      id: "apple",
                      label: "Apple Business Connect",
                      feeds: ["Apple Siri", "Spotlight"],
                    },
                    {
                      id: "facebook",
                      label: "Facebook Business Page",
                      feeds: ["Meta AI"],
                    },
                  ].map((item) => {
                    const { score, status } = getDirScore(
                      item.id,
                      isAllStores ? undefined : selectedStoreId
                    );
                    return (
                      <div key={item.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs sm:text-[13px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-slate-800 truncate">
                              {item.label}
                            </span>
                            {item.feeds.map((f) => (
                              <span
                                key={f}
                                className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                          <span
                            className={`text-xs font-bold tabular-nums shrink-0 ${
                              score >= 95
                                ? "text-[#009691]"
                                : score >= 70
                                ? "text-amber-700"
                                : "text-slate-500"
                            }`}
                          >
                            {score > 0 ? `${score}% (${status})` : "Not synced (0%)"}
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              score >= 95
                                ? "bg-[#009691]"
                                : score >= 70
                                ? "bg-amber-500"
                                : "bg-slate-300"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  {connectedApiCount} of {connectors.length} directory APIs configured
                </span>
                <Link
                  href="/admin/listings/api-sync"
                  className="font-semibold text-[#009691] hover:underline"
                >
                  API connections →
                </Link>
              </div>
            </section>
          </div>

          {/* C. GMB AI FEED + CATALOG CITATION TARGETS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <section
              aria-label="Google Business Profile AI signals"
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#009691] flex items-center justify-center font-bold text-xs border border-teal-200/60">
                      GMB
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Google Business Profile (GMB) Posts
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {gbpConnected
                          ? "Connected to Google Business Profile OAuth"
                          : "Stored in PostgreSQL (connect GBP API for live push)"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/local-seo/posts"
                    className="h-7 px-3 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1 shadow-xs shadow-[#009691]/20 transition-all shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Post</span>
                  </Link>
                </div>

                <div className="p-5 flex flex-col gap-3.5">
                  {isLoadingDb ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 font-medium">
                      Loading GMB posts from PostgreSQL…
                    </div>
                  ) : gmbPosts.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 font-medium">
                      No GMB posts found in PostgreSQL.
                    </div>
                  ) : (
                    gmbPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#009691] border border-teal-200/60 uppercase tracking-wide shrink-0">
                              {post.type}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {post.title}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                              gbpConnected
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                                : "text-slate-600 bg-white border-slate-200"
                            }`}
                          >
                            {gbpConnected ? "GBP Synced ✓" : "DB Stored"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {post.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>PostgreSQL gmb_posts ({gmbPosts.length} records)</span>
                <Link
                  href="/admin/local-seo/posts"
                  className="font-semibold text-[#009691] hover:underline"
                >
                  View all {gmbPosts.length} posts →
                </Link>
              </div>
            </section>

            {/* Real Catalog Citation Coverage */}
            <section
              aria-label="Directory Catalog Citation Coverage"
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#009691] flex items-center justify-center font-bold text-xs border border-teal-200/60">
                      DIR
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Directory Catalog Coverage
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Verified citations vs remaining catalog
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/admin/listings/catalog"
                    className="h-7 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1 shadow-xs transition-colors shrink-0"
                  >
                    <span>Browse Catalog</span>
                  </Link>
                </div>

                <div className="p-5 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50/70 border border-teal-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-[#009691] tabular-nums">
                        {listingMetrics.synced}
                      </span>
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">
                          Verified Store Citations Synced
                        </p>
                        <p className="text-slate-500 font-medium">
                          Out of {listingMetrics.total} tracked entries ({directories.length} directories)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#009691] bg-white px-2.5 py-1 rounded-full border border-teal-200/60">
                      {CATALOG_DIRECTORIES.length} in Catalog
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Unadded High-Authority Catalog Directories
                    </span>
                    {unclaimedCatalogTargets.map((c) => (
                      <div
                        key={c.id}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-slate-800 truncate">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            DA {c.authority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {c.syncMode}
                          </span>
                          <Link
                            href="/admin/listings/catalog"
                            className="text-[#009691] hover:underline font-semibold text-xs"
                          >
                            Add →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Live citation status reflects actual DB &amp; API sync</span>
                <Link
                  href="/admin/listings/catalog"
                  className="font-semibold text-[#009691] hover:underline"
                >
                  Open catalog directory →
                </Link>
              </div>
            </section>
          </div>

          {/* D. LIVE AI SEARCH PROBE (REAL GEMINI / OPENAI API ONLY) */}
          <section
            aria-label="Live AI Search Visibility Probe"
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fafafa]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Sparkles className="w-4 h-4 text-[#009691]" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Live AI Search Visibility Probe
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      techChecks.hasAiKey
                        ? "bg-teal-50 text-[#009691] border-teal-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {techChecks.hasAiKey
                      ? `Live API Ready (${
                          audit?.aiProviders.geminiConfigured ? "Gemini" : "OpenAI"
                        })`
                      : "API Key Required"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Sends real unprimed buyer queries to Google Gemini or OpenAI to verify organic SmartFoneDoctor citations.
                </p>
              </div>

              <Link
                href="/admin/settings"
                className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
              >
                <span>Configure AI API Key</span>
              </Link>
            </div>

            {audit && !techChecks.hasAiKey && (
              <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-200/70 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    No Gemini or OpenAI API key is configured. Add one in Settings (or `.env`) to run real probes — simulated fallback answers are disabled.
                  </span>
                </div>
                <Link href="/admin/settings" className="font-bold underline shrink-0">
                  Open AI Settings →
                </Link>
              </div>
            )}

            {/* Probe Input & Trigger Bar */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <input
                  type="text"
                  value={probeQuery}
                  onChange={(e) => setProbeQuery(e.target.value)}
                  placeholder="Enter a Philadelphia buyer query, e.g. Best same-day iPhone 15 Pro screen repair near 52nd St"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691] shadow-2xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => void handleRunLiveProbe()}
                  disabled={isProbing}
                  className="h-10 px-5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-xs shadow-[#009691]/25 transition-all cursor-pointer disabled:opacity-60 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? "animate-spin" : ""}`} />
                  <span>{isProbing ? "Querying Live AI…" : "Run Live Probe"}</span>
                </button>
              </div>

              {/* Add Tracked Prompt Form + Category Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {["All", "Screen repair", "Console HDMI", "Battery & port", "Open hours"].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPromptCategory(cat)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                          promptCategory === cat
                            ? "bg-[#009691] text-white border-[#009691]"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPromptText}
                    onChange={(e) => setNewPromptText(e.target.value)}
                    placeholder="Track new prompt in DB…"
                    className="h-8 px-3 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#009691]"
                  />
                  <button
                    type="button"
                    disabled={isAddingPrompt || !newPromptText.trim()}
                    onClick={() => void handleSaveCustomPrompt()}
                    className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    + Save Prompt
                  </button>
                </div>
              </div>
            </div>

            {/* Live Probe Result Box */}
            {probeResult && (
              <div className="p-5 border-b border-slate-100 bg-white flex flex-col gap-3">
                {probeResult.success ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs ${
                            probeResult.cited
                              ? "bg-[#009691] text-white"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {probeResult.citationRank}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          Engine: <strong className="text-slate-900">{probeResult.engine}</strong>
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                        Verified at {probeResult.verifiedAt}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 block mb-1">
                        Unprimed Live AI Response:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                        {probeResult.generatedAnswer}
                      </p>
                    </div>

                    {probeResult.sourcesReferenced.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Grounding Sources:</span>
                        {probeResult.sourcesReferenced.map((src) => (
                          <span
                            key={src}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                    <div>
                      <strong className="block font-bold">{probeResult.citationRank}</strong>
                      <span>{probeResult.error}</span>
                    </div>
                    {probeResult.needsApiKey && (
                      <Link
                        href="/admin/settings"
                        className="h-8 px-3 rounded-lg bg-amber-900 text-white font-semibold inline-flex items-center shrink-0"
                      >
                        Configure Key
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tracked Prompts Grid (PostgreSQL) */}
            {filteredPrompts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                {isLoadingDb
                  ? "Loading tracked AI prompts from PostgreSQL…"
                  : "No tracked prompts found for this filter."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {filteredPrompts.slice(0, 6).map((p) => {
                  const statusTone =
                    p.verifiedStatus === "Cited"
                      ? "bg-teal-50 text-[#009691] border-teal-200/60"
                      : p.verifiedStatus === "Not Cited"
                      ? "bg-rose-50 text-rose-700 border-rose-200/60"
                      : "bg-slate-100 text-slate-600 border-slate-200";
                  return (
                    <div
                      key={p.id}
                      className="p-5 flex flex-col justify-between gap-3.5 hover:bg-slate-50/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#009691] text-[11px] font-semibold border border-teal-200/60">
                            {p.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setProbeQuery(p.query);
                                void handleRunLiveProbe(p.query, p.id);
                              }}
                              className="text-[11px] font-bold text-[#009691] hover:underline cursor-pointer"
                            >
                              Probe live →
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeletePrompt(p.id)}
                              aria-label="Delete tracked prompt"
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 mt-2.5 leading-snug">
                          &ldquo;{p.query}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] border ${statusTone}`}
                        >
                          {p.verifiedStatus}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {p.verifiedStatus === "Not Probed"
                            ? p.intent
                            : p.expectedCitation}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ===================================================================
          TAB 2: MICRO-NEIGHBORHOODS & GEO-FENCES
      =================================================================== */}
      {activeTab === "neighborhoods" && (
        <section
          aria-label="Micro-neighborhoods and campus geo-targets"
          className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col gap-0"
        >
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Philadelphia Micro-Neighborhoods &amp; Campus Geo-Fences
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Stored in PostgreSQL (`geo_neighborhoods`) and served dynamically in `/llms.txt`
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNeighborForm(!showNeighborForm)}
              className="h-8 px-3.5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs shadow-[#009691]/20 shrink-0"
            >
              <span>{showNeighborForm ? "Cancel" : "+ Add Geo-Target"}</span>
            </button>
          </div>

          {showNeighborForm && (
            <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex flex-col gap-3.5">
              <span className="text-xs font-bold text-slate-800">
                Target new Philadelphia neighborhood or campus
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Target Name (e.g. Spruce Hill)"
                  value={newNeighborName}
                  onChange={(e) => setNewNeighborName(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
                <select
                  value={newNeighborType}
                  onChange={(e) =>
                    setNewNeighborType(e.target.value as GeoNeighborhood["type"])
                  }
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                >
                  <option value="Neighborhood">Neighborhood</option>
                  <option value="Campus">Campus</option>
                  <option value="Commercial Corridor">Commercial Corridor</option>
                  <option value="Transit Hub">Transit Hub</option>
                </select>
                <input
                  type="text"
                  placeholder="Radius (e.g. 2.5 mi)"
                  value={newNeighborRadius}
                  onChange={(e) => setNewNeighborRadius(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
                <input
                  type="text"
                  placeholder="Zip Codes (comma separated, e.g. 19104, 19139)"
                  value={newNeighborZips}
                  onChange={(e) => setNewNeighborZips(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key Landmarks (e.g. Clark Park, 40th St Station)"
                  value={newNeighborLandmarks}
                  onChange={(e) => setNewNeighborLandmarks(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
                <button
                  type="button"
                  onClick={() => void handleAddNeighborhood()}
                  className="h-9 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold cursor-pointer shadow-xs shadow-[#009691]/20 shrink-0 transition-all"
                >
                  Save target
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs text-slate-600 font-semibold">
                  <th className="py-3 px-5">Geo-Target</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Serviced Store</th>
                  <th className="py-3 px-3">Radius</th>
                  <th className="py-3 px-3">Zip Codes</th>
                  <th className="py-3 px-3">Key Landmarks</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(isAllStores
                  ? neighborhoods
                  : neighborhoods.filter((n) => n.storeId === selectedStoreId)
                ).map((n) => {
                  const stName =
                    stores
                      .find((s) => s.id === n.storeId)
                      ?.name.replace("SmartFoneDoctor - ", "") || storeShortName;
                  return (
                    <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">{n.name}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                          {n.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 text-xs font-medium">{stName}</td>
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-800 font-medium">
                        {n.radius}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {n.zipCodes.map((z) => (
                            <span
                              key={z}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-700 shadow-2xs"
                            >
                              {z}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-500 max-w-[240px] truncate font-medium">
                        {n.keyLandmarks.join(" · ")}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#009691] bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
                            <Check className="w-3 h-3" aria-hidden="true" />
                            <span>{n.status}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleDeleteNeighborhood(n.id)}
                            aria-label={`Delete ${n.name}`}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===================================================================
          TAB 3: SCHEMA & LIVE AI CRAWLER FILES
      =================================================================== */}
      {activeTab === "schema-crawlers" && (
        <section
          aria-label="Schema and crawler directives"
          className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
        >
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "jsonld" as StudioArtifact, label: "1. Live JSON-LD Schema" },
                { id: "llms" as StudioArtifact, label: "2. Live /llms.txt" },
                { id: "robots" as StudioArtifact, label: "3. Live /robots.txt" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveArtifact(item.id)}
                  className={`h-8 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    activeArtifact === item.id
                      ? "bg-[#009691] text-white shadow-xs shadow-[#009691]/20"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void runLiveAudit(true)}
                disabled={isScanning}
                className="h-8 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shadow-[#009691]/20 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
                <span>{isScanning ? "Checking…" : "Re-verify Live Site"}</span>
              </button>
            </div>
          </div>

          {activeArtifact === "jsonld" && (
            <div className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {audit?.schema.sampleJsonLd
                      ? "Live JSON-LD Extracted from smartfonedoctor.com"
                      : `Generated Store JSON-LD (${storeShortName})`}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Detected @types: {audit?.schema.types.join(", ") || "Pending live check"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode("jsonld", displayedJsonLd)}
                  className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
                >
                  {copiedKey === "jsonld" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#009691]" aria-hidden="true" />
                      <span className="text-[#009691]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span>Copy JSON-LD</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed max-h-[420px]">
                {displayedJsonLd}
              </pre>
            </div>
          )}

          {activeArtifact === "llms" && (
            <div className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live /llms.txt (HTTP {audit?.llmsTxt.status || "—"} ·{" "}
                    {audit?.llmsTxt.bytes.toLocaleString() ?? 0} bytes)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Fetched live from {audit?.siteUrl || "https://smartfonedoctor.com"}/llms.txt
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href="/llms.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5"
                  >
                    <span>Open live</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyCode("llms", displayedLlmsTxt)}
                    className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    {copiedKey === "llms" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#009691]" aria-hidden="true" />
                        <span className="text-[#009691]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>Copy /llms.txt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[420px]">
                {displayedLlmsTxt}
              </pre>
            </div>
          )}

          {activeArtifact === "robots" && (
            <div className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live /robots.txt (HTTP {audit?.robots.status || "—"})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Fetched live from {audit?.siteUrl || "https://smartfonedoctor.com"}/robots.txt
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href="/robots.txt"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5"
                  >
                    <span>Open live</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyCode("robots", displayedRobotsTxt)}
                    className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    {copiedKey === "robots" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#009691]" aria-hidden="true" />
                        <span className="text-[#009691]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>Copy robots.txt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[420px]">
                {displayedRobotsTxt}
              </pre>
            </div>
          )}

          {/* Knowledge Graph Entity Identifiers */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/40 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Knowledge Graph Entity Identifiers &amp; Canonical sameAs URLs
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Real verified Wikidata / Google Knowledge Graph IDs &amp; canonical business links served in /llms.txt and schema.org
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveKgEntity()}
                disabled={isSavingKg}
                className="h-8 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold cursor-pointer shadow-xs shadow-[#009691]/20 transition-all disabled:opacity-60 shrink-0 self-start sm:self-auto"
              >
                {isSavingKg ? "Saving…" : "Save Knowledge Graph"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wikidata Entity ID (optional)
                </label>
                <input
                  type="text"
                  value={kgWikidata}
                  onChange={(e) => setKgWikidata(e.target.value)}
                  placeholder="Leave blank if no real Wikidata Q-ID exists yet"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Knowledge Graph ID (optional)
                </label>
                <input
                  type="text"
                  value={kgGoogleId}
                  onChange={(e) => setKgGoogleId(e.target.value)}
                  placeholder="Leave blank unless verified in Knowledge Graph Search API"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canonical SameAs URLs (One verified URL per line)
              </label>
              <textarea
                rows={3}
                value={kgSameAsText}
                onChange={(e) => setKgSameAsText(e.target.value)}
                placeholder="https://maps.google.com/?cid=...&#10;https://www.yelp.com/biz/..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
              />
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================
          TAB 4: BRAND TRUTH & ANTI-HALLUCINATION GUARDRAILS
      =================================================================== */}
      {activeTab === "guardrails" && (
        <section
          aria-label="Brand truth and anti-hallucination guardrails"
          className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
        >
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Brand Truth &amp; Anti-Hallucination Guardrails
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Canonical facts stored in PostgreSQL (`aeo_brand_guardrails`) and published dynamically to /llms.txt
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                {guardrails.length} canonical facts
              </span>
              <button
                type="button"
                onClick={() => setShowGuardForm(!showGuardForm)}
                className="h-8 px-3.5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs shadow-[#009691]/20 shrink-0"
              >
                <span>{showGuardForm ? "Cancel" : "+ Add Guardrail"}</span>
              </button>
            </div>
          </div>

          {showGuardForm && (
            <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex flex-col gap-3.5">
              <span className="text-xs font-bold text-slate-800">
                Add new canonical truth fact
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Topic / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Water Damage Diagnostics"
                    value={newGuardTopic}
                    onChange={(e) => setNewGuardTopic(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Verified Sources (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Website, GBP, Service Menu"
                    value={newGuardSources}
                    onChange={(e) => setNewGuardSources(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Customer Query / Claim
                </label>
                <input
                  type="text"
                  placeholder="e.g. Does Smart Fone Doctor repair liquid damaged iPhones or laptops?"
                  value={newGuardClaim}
                  onChange={(e) => setNewGuardClaim(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Canonical Ground Truth Answer (Fed to LLMs)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Yes, all 3 Philadelphia stores perform ultrasonic motherboard cleaning and diagnostics with same-day turnaround."
                  value={newGuardAnswer}
                  onChange={(e) => setNewGuardAnswer(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#009691]/20 focus:border-[#009691]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuardForm(false)}
                  className="h-8 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleAddGuardrail()}
                  className="h-8 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold cursor-pointer shadow-xs shadow-[#009691]/20 transition-all"
                >
                  Save guardrail
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {guardrails.map((g) => (
              <div
                key={g.id}
                className="p-5 flex flex-col gap-2 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{g.topic}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#009691] text-[11px] font-semibold border border-teal-200/60">
                      {g.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5">
                      {g.sourcesVerified.map((src) => (
                        <span
                          key={src}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-600 shadow-2xs"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteGuardrail(g.id)}
                      aria-label={`Delete ${g.topic}`}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-[13px]">
                  <p className="text-slate-500 italic font-medium">
                    &ldquo;{g.claim}&rdquo;
                  </p>
                  <p className="text-slate-900 font-medium mt-1 leading-relaxed">
                    {g.canonicalAnswer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
