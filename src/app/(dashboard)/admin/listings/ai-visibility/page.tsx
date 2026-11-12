"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import { useListings } from "@/lib/listingsContext";
import {
  RefreshCw,
  Check,
  Copy,
  X,
  Plus,
  Sparkles,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trash2,
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
  status: "Active" | "Indexed";
}

const INITIAL_NEIGHBORHOODS: GeoNeighborhood[] = [
  {
    id: "geo-1",
    storeId: 1,
    name: "52nd St Commercial Corridor",
    type: "Commercial Corridor",
    radius: "2.5 mi",
    zipCodes: ["19139", "19143"],
    keyLandmarks: ["52nd St Market-Frankford El Station", "Malcolm X Park", "Cobbs Creek Parkway"],
    status: "Indexed",
  },
  {
    id: "geo-2",
    storeId: 1,
    name: "Cobbs Creek & Cedar Park",
    type: "Neighborhood",
    radius: "2.0 mi",
    zipCodes: ["19139", "19143"],
    keyLandmarks: ["Baltimore Ave", "Cedar Park Commercials"],
    status: "Active",
  },
  {
    id: "geo-3",
    storeId: 2,
    name: "University City & Drexel University",
    type: "Campus",
    radius: "2.0 mi",
    zipCodes: ["19104"],
    keyLandmarks: ["Drexel Main Building", "Drexel Rec Center", "30th St Station Corridor"],
    status: "Indexed",
  },
  {
    id: "geo-4",
    storeId: 2,
    name: "University of Pennsylvania (UPenn)",
    type: "Campus",
    radius: "2.0 mi",
    zipCodes: ["19104"],
    keyLandmarks: ["Franklin Field", "Penn Bookstore", "Locust Walk"],
    status: "Indexed",
  },
  {
    id: "geo-5",
    storeId: 3,
    name: "West Powelton & Lancaster Ave",
    type: "Transit Hub",
    radius: "2.0 mi",
    zipCodes: ["19104", "19131"],
    keyLandmarks: ["SEPTA Route 10 Trolley", "Lancaster Ave Commercial Strip"],
    status: "Indexed",
  },
  {
    id: "geo-6",
    storeId: 3,
    name: "Penn Presbyterian Medical Center",
    type: "Neighborhood",
    radius: "1.5 mi",
    zipCodes: ["19104"],
    keyLandmarks: ["Penn Presbyterian Hospital", "Market St West"],
    status: "Active",
  },
];

interface BrandTruthGuardrail {
  id: string;
  topic: string;
  claim: string;
  canonicalAnswer: string;
  sourcesVerified: string[];
  status: "Verified on Site" | "Published to llms.txt";
}

const INITIAL_GUARDRAILS: BrandTruthGuardrail[] = [
  {
    id: "g1",
    topic: "Walk-in Turnaround",
    claim: "Are repairs walk-in or is appointment required?",
    canonicalAnswer: "All 3 locations accept walk-ins with no appointment required. iPhone & Samsung screen repairs take 25–30 minutes.",
    sourcesVerified: ["Google Business Profile", "Website Header", "llms.txt"],
    status: "Published to llms.txt",
  },
  {
    id: "g2",
    topic: "Repair Warranty",
    claim: "What warranty covers repairs?",
    canonicalAnswer: "All repairs include a standard 90-day parts and labor warranty valid across all 3 Philadelphia stores.",
    sourcesVerified: ["Service Agreement", "Customer Receipt QR", "llms.txt"],
    status: "Published to llms.txt",
  },
  {
    id: "g3",
    topic: "Parts Quality",
    claim: "Are replacement screens OEM-grade?",
    canonicalAnswer: "Smart Fone Doctor uses OEM-spec OLED and premium LCD displays with TrueTone and multi-touch calibration.",
    sourcesVerified: ["Inventory Specs", "Website Service Pages"],
    status: "Verified on Site",
  },
  {
    id: "g4",
    topic: "Console HDMI Micro-soldering",
    claim: "Can PS5 & Xbox HDMI ports be fixed same-day?",
    canonicalAnswer: "Yes, in-house micro-soldering bench technicians repair PS5, Xbox Series X, and Switch HDMI ports same-day.",
    sourcesVerified: ["Service Catalog", "Yelp Services", "llms.txt"],
    status: "Published to llms.txt",
  },
  {
    id: "g5",
    topic: "Operating Hours & Saturday",
    claim: "Is the repair shop open on weekends?",
    canonicalAnswer: "Open Monday through Saturday from 10:00 AM to 7:00 PM. Closed Sunday.",
    sourcesVerified: ["GBP", "Apple Business", "Bing Places"],
    status: "Published to llms.txt",
  },
];

interface SimulatedPrompt {
  id: string;
  queryTemplate: string;
  intent: string;
  category: "Screen repair" | "Console HDMI" | "Battery & port" | "Open hours";
  storeId?: number;
}

const INITIAL_PROMPTS: SimulatedPrompt[] = [
  {
    id: "p1",
    queryTemplate: "Best same-day iPhone 15 Pro screen repair near {landmark}",
    intent: "Walk-in screen repair",
    category: "Screen repair",
  },
  {
    id: "p2",
    queryTemplate: "Walk-in cell phone & MacBook repair near {neighborhood}",
    intent: "University & commuter repair",
    category: "Screen repair",
  },
  {
    id: "p3",
    queryTemplate: "Fast PS5 & Xbox HDMI port repair near {street}",
    intent: "Console micro-soldering",
    category: "Console HDMI",
  },
  {
    id: "p4",
    queryTemplate:
      "Affordable Samsung Galaxy S24 battery replacement in Philadelphia {zip}",
    intent: "Battery price comparison",
    category: "Battery & port",
  },
  {
    id: "p5",
    queryTemplate:
      "Phone repair shop open Saturday evening near {neighborhood}",
    intent: "Saturday 7:00 PM close check",
    category: "Open hours",
  },
  {
    id: "p6",
    queryTemplate:
      "30-minute iPad & USB-C charging port repair without appointment in {neighborhood}",
    intent: "Express walk-in turnaround",
    category: "Battery & port",
  },
];

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

export default function AiVisibilityPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } =
    useStoreContext();
  const { directories, updateStoreEntry, pullFromApi } = useListings();
  const storeShortName = selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [activeTab, setActiveTab] = useState<AiTab>("overview");
  const [activeArtifact, setActiveArtifact] =
    useState<StudioArtifact>("jsonld");
  const [promptCategory, setPromptCategory] = useState<string>("All");
  const [isScanning, setIsScanning] = useState(false);
  const [schemaDeployed, setSchemaDeployed] = useState(false);
  const [entityBioSynced, setEntityBioSynced] = useState<
    Record<number, boolean>
  >({
    1: true,
    2: false,
    3: false,
  });
  const [prompts, setPrompts] = useState<SimulatedPrompt[]>(INITIAL_PROMPTS);
  const [newPromptText, setNewPromptText] = useState("");
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>("p1");
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // ── Broad GEO State: Neighborhoods & Brand Truth Guardrails ────────────────
  const [neighborhoods, setNeighborhoods] =
    useState<GeoNeighborhood[]>(INITIAL_NEIGHBORHOODS);
  const [guardrails, setGuardrails] =
    useState<BrandTruthGuardrail[]>(INITIAL_GUARDRAILS);
  const [showNeighborForm, setShowNeighborForm] = useState(false);
  const [newNeighborName, setNewNeighborName] = useState("");
  const [newNeighborType, setNewNeighborType] =
    useState<GeoNeighborhood["type"]>("Neighborhood");
  const [newNeighborRadius, setNewNeighborRadius] = useState("2.0 mi");
  const [newNeighborZips, setNewNeighborZips] = useState("");
  const [newNeighborLandmarks, setNewNeighborLandmarks] = useState("");

  const handleAddNeighborhood = () => {
    if (!newNeighborName.trim()) return;
    const item: GeoNeighborhood = {
      id: `geo-${Date.now()}`,
      storeId: isAllStores ? 1 : selectedStoreId,
      name: newNeighborName.trim(),
      type: newNeighborType,
      radius: newNeighborRadius,
      zipCodes: newNeighborZips
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      keyLandmarks: newNeighborLandmarks
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status: "Active",
    };
    setNeighborhoods((prev) => [...prev, item]);
    setNewNeighborName("");
    setNewNeighborZips("");
    setNewNeighborLandmarks("");
    setShowNeighborForm(false);
    setNoticeBanner(`Added ${item.name} to geo-fencing targets.`);
  };

  const handleDeleteNeighborhood = (id: string) => {
    const target = neighborhoods.find((n) => n.id === id);
    setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
    setNoticeBanner(`Removed ${target?.name ?? "geo-target"} from geo-fencing.`);
  };

  const [showGuardForm, setShowGuardForm] = useState(false);
  const [newGuardTopic, setNewGuardTopic] = useState("");
  const [newGuardClaim, setNewGuardClaim] = useState("");
  const [newGuardAnswer, setNewGuardAnswer] = useState("");
  const [newGuardSources, setNewGuardSources] = useState("Website, llms.txt");

  const handleAddGuardrail = () => {
    if (!newGuardTopic.trim() || !newGuardClaim.trim() || !newGuardAnswer.trim()) return;
    const item: BrandTruthGuardrail = {
      id: `g-${Date.now()}`,
      topic: newGuardTopic.trim(),
      claim: newGuardClaim.trim(),
      canonicalAnswer: newGuardAnswer.trim(),
      sourcesVerified: newGuardSources.split(",").map((s) => s.trim()).filter(Boolean),
      status: "Published to llms.txt",
    };
    setGuardrails((prev) => [...prev, item]);
    setNewGuardTopic("");
    setNewGuardClaim("");
    setNewGuardAnswer("");
    setShowGuardForm(false);
    setNoticeBanner(`Added truth guardrail: "${item.topic}".`);
  };

  const handleDeleteGuardrail = (id: string) => {
    const target = guardrails.find((g) => g.id === id);
    setGuardrails((prev) => prev.filter((g) => g.id !== id));
    setNoticeBanner(`Removed guardrail: "${target?.topic ?? "fact"}".`);
  };

  const getDirScore = (dirId: string, storeId?: number) => {
    const dir = directories.find((d) => d.id === dirId);
    if (!dir) return 0;
    if (storeId) {
      return dir.stores[storeId]?.napMatch ?? 0;
    }
    const vals = stores.map((st) => dir.stores[st.id]?.napMatch ?? 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  const scores = useMemo(() => {
    const scopeStoreId = isAllStores ? undefined : selectedStoreId;

    const gmb = getDirScore("gmb", scopeStoreId);
    const bing = getDirScore("bing", scopeStoreId);
    const yelp = getDirScore("yelp", scopeStoreId);
    const apple = getDirScore("apple", scopeStoreId);
    const trustpilot = getDirScore("trustpilot", scopeStoreId);
    const ezlocal = getDirScore("ezlocal", scopeStoreId);
    const yp = getDirScore("yellowpages", scopeStoreId);
    const nextdoor = getDirScore("nextdoor", scopeStoreId);

    const schemaBonus = schemaDeployed ? 8 : 0;
    const bioBonus = (
      scopeStoreId
        ? entityBioSynced[scopeStoreId]
        : stores.every((s) => entityBioSynced[s.id])
    )
      ? 5
      : 0;

    const chatgpt = Math.min(
      100,
      Math.round(
        bing * 0.45 + yelp * 0.3 + ezlocal * 0.15 + trustpilot * 0.1
      ) + schemaBonus
    );

    const googleAi = Math.min(
      100,
      Math.round(gmb * 0.5 + yp * 0.2 + ezlocal * 0.15 + trustpilot * 0.15) +
        bioBonus
    );

    const perplexity = Math.min(
      100,
      Math.round(
        yelp * 0.35 + gmb * 0.3 + trustpilot * 0.2 + nextdoor * 0.15
      ) + schemaBonus
    );

    const appleSiri = Math.min(
      100,
      Math.round(apple * 0.65 + yelp * 0.35) + bioBonus
    );

    const overall = Math.round(
      (chatgpt + googleAi + perplexity + appleSiri) / 4
    );

    return { overall, chatgpt, googleAi, perplexity, appleSiri };
  }, [
    directories,
    stores,
    isAllStores,
    selectedStoreId,
    schemaDeployed,
    entityBioSynced,
  ]);

  const agentActions = useMemo(() => {
    const targetStoreIds = isAllStores ? [1, 2, 3] : [selectedStoreId];
    const list: {
      id: string;
      title: string;
      targetEngine: string;
      rootCause: string;
      impactBadge: string;
      status: "Pending" | "Completed";
      actionLabel: string;
      onExecute: () => void;
    }[] = [];

    const bingMissingStores = targetStoreIds.filter(
      (sid) =>
        directories.find((d) => d.id === "bing")?.stores[sid]?.status !==
        "Synced"
    );
    const yelpDriftStores = targetStoreIds.filter(
      (sid) =>
        directories.find((d) => d.id === "yelp")?.stores[sid]?.status !==
        "Synced"
    );

    if (bingMissingStores.length > 0 || yelpDriftStores.length > 0) {
      list.push({
        id: "fix-chatgpt-index",
        title: "Sync Bing Places & fix Yelp Saturday closing hour",
        targetEngine: "ChatGPT Search",
        rootCause: "Bing unclaimed · Yelp shows 6:00 PM instead of 7:00 PM",
        impactBadge: "+24 pts",
        status: "Pending",
        actionLabel: "Auto-fix",
        onExecute: () => {
          pullFromApi("bing-sync");
          targetStoreIds.forEach((sid) => {
            const yelpDir = directories.find((d) => d.id === "yelp");
            if (yelpDir) {
              updateStoreEntry("yelp", sid, {
                ...yelpDir.stores[sid],
                status: "Synced",
                napMatch: 100,
                lastSynced: "Fixed by AI agent",
                issue: undefined,
              });
            }
          });
          setNoticeBanner(
            "Synced Bing Places and aligned Yelp Saturday hours to 7:00 PM."
          );
        },
      });
    } else {
      list.push({
        id: "fix-chatgpt-index",
        title: "Bing Places & Yelp hours aligned",
        targetEngine: "ChatGPT Search",
        rootCause: "100% NAP & 7:00 PM Saturday closing verified",
        impactBadge: "+24 pts active",
        status: "Completed",
        actionLabel: "Synced",
        onExecute: () => {},
      });
    }

    const appleDriftStores = targetStoreIds.filter(
      (sid) =>
        directories.find((d) => d.id === "apple")?.stores[sid]?.status !==
        "Synced"
    );
    if (appleDriftStores.length > 0) {
      list.push({
        id: "fix-apple-siri",
        title: "Push store coordinates & phone to Apple Business Connect",
        targetEngine: "Apple Siri & Maps",
        rootCause: "Place card missing verified +1 (215) 598-2090 pin",
        impactBadge: "+28 pts",
        status: "Pending",
        actionLabel: "Auto-fix",
        onExecute: () => {
          pullFromApi("apple-connect");
          setNoticeBanner(
            "Pushed canonical store coordinates and phone numbers to Apple Business Connect."
          );
        },
      });
    } else {
      list.push({
        id: "fix-apple-siri",
        title: "Apple Business Connect place cards verified",
        targetEngine: "Apple Siri & Maps",
        rootCause: "iOS voice search & Apple Maps pins active",
        impactBadge: "+28 pts active",
        status: "Completed",
        actionLabel: "Synced",
        onExecute: () => {},
      });
    }

    list.push({
      id: "deploy-schema-llms",
      title: "Publish RepairShop JSON-LD & /llms.txt knowledge graph",
      targetEngine: "All AI Crawlers",
      rootCause: schemaDeployed
        ? "sameAs graph & /llms.txt active on site"
        : "Links Google, Yelp, Bing & Trustpilot URLs in sameAs schema",
      impactBadge: "+8 pts",
      status: schemaDeployed ? "Completed" : "Pending",
      actionLabel: schemaDeployed ? "View code" : "Deploy schema",
      onExecute: () => {
        setSchemaDeployed(true);
        setActiveArtifact("jsonld");
        setActiveTab("schema-crawlers");
      },
    });

    const bioDone = isAllStores
      ? stores.every((s) => entityBioSynced[s.id])
      : !!entityBioSynced[selectedStoreId];
    list.push({
      id: "sync-entity-bio",
      title: "Seed neighborhood & 30-min repair entities into bios",
      targetEngine: "Gemini & Perplexity",
      rootCause: bioDone
        ? "UPenn, Drexel, 52nd St & PS5 HDMI entities synced"
        : "Adds University City, UPenn, Drexel & 30-min OEM screen terms",
      impactBadge: "+6 pts",
      status: bioDone ? "Completed" : "Pending",
      actionLabel: bioDone ? "View guardrails" : "Sync guardrails",
      onExecute: () => {
        setActiveTab("guardrails");
      },
    });

    return list;
  }, [
    directories,
    stores,
    isAllStores,
    selectedStoreId,
    schemaDeployed,
    entityBioSynced,
    pullFromApi,
    updateStoreEntry,
  ]);

  const pendingCount = agentActions.filter(
    (a) => a.status === "Pending"
  ).length;

  const handleRunAllFixes = () => {
    pullFromApi("bing-sync");
    pullFromApi("apple-connect");
    [1, 2, 3].forEach((sid) => {
      const yelpDir = directories.find((d) => d.id === "yelp");
      if (yelpDir) {
        updateStoreEntry("yelp", sid, {
          ...yelpDir.stores[sid],
          status: "Synced",
          napMatch: 100,
          lastSynced: "Fixed by AI agent",
          issue: undefined,
        });
      }
    });
    setSchemaDeployed(true);
    setEntityBioSynced({ 1: true, 2: true, 3: true });
    setNoticeBanner(
      "All 4 autonomous GEO fixes applied. AI visibility score updated across all engines."
    );
  };

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setNoticeBanner(
        "Completed live citation check across ChatGPT Search, Google AI Overviews, Perplexity, and Apple Siri."
      );
    }, 600);
  };

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;
    const newId = `custom-${Date.now()}`;
    setPrompts((prev) => [
      {
        id: newId,
        queryTemplate: newPromptText.trim(),
        intent: "Custom prompt test",
        category: "Screen repair",
        storeId: selectedStoreId,
      },
      ...prev,
    ]);
    setExpandedPromptId(newId);
    setNewPromptText("");
  };

  const resolvedPrompts = useMemo(() => {
    return prompts.map((p, index) => {
      const effectiveStoreId = isAllStores
        ? p.storeId ?? ((index % 3) + 1)
        : p.storeId ?? selectedStoreId;
      const geo =
        STORE_GEO_CONTEXT[effectiveStoreId] ?? STORE_GEO_CONTEXT[1];
      const storeObj =
        stores.find((s) => s.id === effectiveStoreId) ?? stores[0];
      const query = p.queryTemplate
        .replace("{landmark}", geo.landmark)
        .replace("{neighborhood}", geo.neighborhood)
        .replace("{street}", geo.street)
        .replace("{zip}", geo.zip);

      return {
        ...p,
        effectiveStoreId,
        storeObj,
        storeLabel: storeObj.name.replace("SmartFoneDoctor - ", ""),
        query,
      };
    });
  }, [prompts, isAllStores, selectedStoreId, stores]);

  const filteredPrompts = useMemo(() => {
    if (promptCategory === "All") return resolvedPrompts;
    return resolvedPrompts.filter((p) => p.category === promptCategory);
  }, [resolvedPrompts, promptCategory]);

  const generatedJsonLd = useMemo(() => {
    const sameAsUrls = directories
      .map((d) => d.stores[selectedStoreId]?.url)
      .filter(Boolean);
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "MobilePhoneRepairShop",
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
        openingHours: "Mo-Sa 10:00-19:00",
        priceRange: "$$",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          reviewCount: "50",
        },
        sameAs: sameAsUrls,
      },
      null,
      2
    );
  }, [directories, selectedStore, selectedStoreId]);

  const generatedLlmsTxt = useMemo(() => {
    return `# Smart Fone Doctor — Official Philadelphia Locations & Services
> Certified same-day cell phone, iPhone, Samsung, iPad, MacBook, and gaming console (PS5/Xbox HDMI) repair shops in Philadelphia, PA.

## Verified Store Locations
${stores
  .map(
    (s) =>
      `- **${s.name.replace("SmartFoneDoctor - ", "")}**: ${s.address}, ${
        s.cityStateZip
      } | Phone: ${s.phone} | Hours: ${s.businessHours}`
  )
  .join("\n")}

## Core Turnaround & Warranty
- iPhone & Samsung screen replacement: 25–30 minutes (walk-in, no appointment required)
- Battery & charging port replacement: 30 minutes
- PS5, Xbox & Nintendo Switch HDMI micro-soldering: Same-day service
- 90-day warranty on parts and labor`;
  }, [stores]);

  const generatedRobotsTxt = useMemo(() => {
    return `# AI Crawlers & Search Engine Directives for Smart Fone Doctor Philadelphia
User-agent: GPTBot
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

User-agent: OAI-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://smartfonedoctor.com/sitemap.xml`;
  }, []);

  const copyCode = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. HEADER & CLEAN TABS */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-semibold text-[#111111] tracking-tight">
                Search &amp; GEO Visibility
              </h1>
              <span className="text-[12px] text-[#5f6368] font-normal">
                · {isAllStores ? "All 3 Philly stores" : storeShortName}
              </span>
            </div>
            <p className="text-[13px] text-[#5f6368] mt-0.5">
              Directory sync, local search presence, and structured data for search engines
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin/listings"
              className="h-[30px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Directory listings</span>
            </Link>

            <button
              type="button"
              onClick={handleRunScan}
              disabled={isScanning}
              className="h-[30px] px-3 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3 h-3 ${isScanning ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{isScanning ? "Checking…" : "Check status"}</span>
            </button>
          </div>
        </div>

        {/* Minimal Tab Navigation */}
        <nav
          aria-label="Visibility workspace views"
          className="flex items-center gap-6 border-b border-[#e5e7eb] overflow-x-auto no-scrollbar"
        >
          {[
            {
              key: "overview" as AiTab,
              label: "Multi-Engine Index",
              count: pendingCount,
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
                className={`py-2 text-[13px] border-b-2 -mb-px transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "border-[#111111] text-[#111111] font-semibold"
                    : "border-transparent text-[#5f6368] hover:text-[#111111]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[#f3f4f6] text-[#5f6368]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {noticeBanner && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-[6px] px-3.5 py-2 flex items-center justify-between gap-3 text-[12px]"
        >
          <span>{noticeBanner}</span>
          <button
            type="button"
            onClick={() => setNoticeBanner(null)}
            aria-label="Dismiss notice"
            className="p-0.5 hover:opacity-75 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 2. SIMPLE, CLEAN 4 METRIC CARDS (No fake meters, no neon badges) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Google Search &amp; Maps</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[22px] font-semibold text-[#111111] tabular-nums leading-none">
              {scores.googleAi}%
            </span>
            <span className="text-[12px] text-[#5f6368]">verified</span>
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Apple Maps &amp; Siri</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[22px] font-semibold text-[#111111] tabular-nums leading-none">
              {scores.appleSiri}%
            </span>
            <span className="text-[12px] text-[#5f6368]">coordinates</span>
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Bing &amp; Windows Search</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[22px] font-semibold text-[#111111] tabular-nums leading-none">
              {scores.chatgpt}%
            </span>
            <span className="text-[12px] text-[#5f6368]">hours synced</span>
          </div>
        </div>

        <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3.5 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Schema &amp; Structured Data</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-[18px] font-semibold text-[#15803d] leading-none">
              Active
            </span>
            <span className="text-[12px] text-[#5f6368]">LocalBusiness</span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: OVERVIEW & AUTO-FIXES (Visual, Scannable, Low Text Clutter)
      =================================================================== */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-5">
          {/* A. DIRECTORY ALIGNMENT CHECKLIST */}
          <section
            aria-label="Directory alignment queue"
            className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Directory Alignment Checklist
                </h2>
                <span className="text-[12px] text-[#5f6368] tabular-nums">
                  · {4 - pendingCount} of 4 verified
                </span>
              </div>

              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleRunAllFixes}
                  className="h-[28px] px-3 rounded-[5px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Sync all ({pendingCount})</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-[#f2f2f2]">
              {agentActions.map((act) => {
                const isDone = act.status === "Completed";
                return (
                  <div
                    key={act.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f9f9f9] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {isDone ? (
                        <CheckCircle2
                          className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5 sm:mt-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <AlertCircle
                          className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5 sm:mt-0"
                          aria-hidden="true"
                        />
                      )}

                      <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5">
                        <span
                          className={`text-[14px] font-medium truncate ${
                            isDone ? "text-[#5f6368]" : "text-[#111111]"
                          }`}
                        >
                          {act.title}
                        </span>
                        <span className="hidden sm:inline text-[#d1d5db]">
                          ·
                        </span>
                        <span className="text-[12px] text-[#5f6368] truncate">
                          {act.rootCause}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 pl-7 sm:pl-0">
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px] font-medium">
                        {act.targetEngine}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium tabular-nums ${
                          isDone
                            ? "bg-[#dcfae5] text-[#04250e]"
                            : "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]"
                        }`}
                      >
                        {act.impactBadge}
                      </span>

                      {isDone &&
                      act.id !== "deploy-schema-llms" &&
                      act.id !== "sync-entity-bio" ? (
                        <span className="h-[28px] px-2.5 rounded-[5px] text-[#04250e] text-[12px] font-medium inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={act.onExecute}
                          className={`h-[28px] px-3 rounded-[5px] text-[12px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer ${
                            isDone
                              ? "border border-[#d1d5db] bg-white text-[#111111] hover:bg-[#f9f9f9]"
                              : "bg-[#1d1f20] hover:bg-[#111111] text-white"
                          }`}
                        >
                          <span>{act.actionLabel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* B. 2-COLUMN VISUAL ANALYTICS: SHARE OF VOICE BARS + CITATION FEEDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            {/* Left: Visual Bar Chart for Local Competitor Share of Voice */}
            <section
              aria-label="Philadelphia competitor AI share of voice"
              className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                  <div>
                    <h2 className="text-[14px] font-semibold text-[#111111]">
                      Philadelphia Local Benchmarks
                    </h2>
                    <p className="text-[12px] text-[#5f6368]">
                      Visibility index across local Philadelphia repair searches
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("neighborhoods")}
                    className="text-[12px] font-medium text-[#111111] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>View geo-targets</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-4 flex flex-col gap-3.5">
                  {[
                    {
                      shop: `Smart Fone Doctor (${
                        isAllStores ? "3 Philly stores" : storeShortName
                      })`,
                      tag: "Your shop",
                      pct: scores.overall,
                      isSelf: true,
                    },
                    {
                      shop: "iPhone Repair Philly — University City",
                      tag: "0.8 mi away",
                      pct: 84,
                      isSelf: false,
                    },
                    {
                      shop: "uBreakiFix by Asurion — Center City",
                      tag: "2.1 mi away",
                      pct: 79,
                      isSelf: false,
                    },
                    {
                      shop: "Mr Fix Cell Phone & Computer Repair",
                      tag: "1.4 mi away",
                      pct: 64,
                      isSelf: false,
                    },
                    {
                      shop: "Apple Store Walnut Street",
                      tag: "2.3 mi away",
                      pct: 52,
                      isSelf: false,
                    },
                  ].map((item) => (
                    <div key={item.shop} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2 text-[13px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`truncate ${
                              item.isSelf
                                ? "font-semibold text-[#111111]"
                                : "font-normal text-[#111111]"
                            }`}
                          >
                            {item.shop}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px] shrink-0">
                            {item.tag}
                          </span>
                        </div>
                        <span
                          className={`text-[13px] tabular-nums shrink-0 ${
                            item.isSelf
                              ? "font-semibold text-[#15803d]"
                              : "text-[#5f6368]"
                          }`}
                        >
                          {item.pct}%
                        </span>
                      </div>

                      <div className="w-full h-[7px] rounded-full bg-[#f1f3f4] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.isSelf ? "bg-[#111111]" : "bg-[#cbd5e1]"
                          }`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2.5 bg-[#f9fafb] border-t border-[#eaeaea] flex items-center justify-between text-[12px] text-[#5f6368]">
                <span>
                  {scores.overall >= 85
                    ? "Smart Fone Doctor ranks #1 across Philadelphia AI engines"
                    : "Syncing Bing Places & Apple Maps pushes your share above 88%"}
                </span>
                <span className="font-medium text-[#111111] tabular-nums">
                  Target: 90%+
                </span>
              </div>
            </section>

            {/* Right: Directory Citation Feeds with Visual Health Bars */}
            <section
              aria-label="Directory citation feeds powering AI engines"
              className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#111111]">
                      Directory feeds powering AI
                    </h2>
                    <p className="text-[12px] text-[#5f6368]">
                      Citation accuracy feeding LLM search indexes
                    </p>
                  </div>
                  <Link
                    href="/admin/listings"
                    className="text-[12px] font-medium text-[#111111] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>All 11 directories</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>

                <div className="p-4 flex flex-col gap-3.5">
                  {[
                    {
                      id: "gmb",
                      label: "Google Business Profile",
                      feeds: ["Gemini", "Perplexity"],
                    },
                    {
                      id: "bing",
                      label: "Bing Places for Business",
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
                      id: "ezlocal",
                      label: "EZlocal & Yellow Pages",
                      feeds: ["Google AI", "Entity Graph"],
                    },
                  ].map((item) => {
                    const score = getDirScore(
                      item.id,
                      isAllStores ? undefined : selectedStoreId
                    );
                    return (
                      <div key={item.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-[13px]">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-medium text-[#111111] truncate">
                              {item.label}
                            </span>
                            {item.feeds.map((f) => (
                              <span
                                key={f}
                                className="hidden sm:inline-flex px-1.5 py-0.2 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                          <span
                            className={`text-[12px] font-medium tabular-nums shrink-0 ${
                              score >= 95
                                ? "text-[#15803d]"
                                : score >= 70
                                ? "text-[#92400e]"
                                : "text-[#b91c1c]"
                            }`}
                          >
                            {score}% synced
                          </span>
                        </div>

                        <div className="w-full h-[7px] rounded-full bg-[#f1f3f4] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              score >= 95
                                ? "bg-[#15803d]"
                                : score >= 70
                                ? "bg-[#d97706]"
                                : "bg-[#dc2626]"
                            }`}
                            style={{ width: `${Math.max(score, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-4 py-2.5 bg-[#f9fafb] border-t border-[#eaeaea] flex items-center justify-between text-[12px] text-[#5f6368]">
                <span>Connected via Google OAuth, Yelp Fusion &amp; Schema</span>
                <Link
                  href="/admin/listings/api-sync"
                  className="font-medium text-[#111111] hover:underline"
                >
                  API connections →
                </Link>
              </div>
            </section>
          </div>

          {/* C. COMPACT 3-PROMPT SNAPSHOT (Links cleanly to Tab 2 instead of dumping all 6 rows) */}
          <section
            aria-label="Buyer prompt snapshot"
            className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111111]">
                  Top Local Search Queries ({storeShortName})
                </h2>
                <p className="text-[12px] text-[#5f6368]">
                  High-intent phone &amp; console repair searches in Philadelphia
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("neighborhoods")}
                className="h-[28px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Manage geo-targets ({neighborhoods.length})</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#eaeaea]">
              {resolvedPrompts.slice(0, 3).map((p) => {
                const stBing =
                  directories.find((d) => d.id === "bing")?.stores[
                    p.effectiveStoreId
                  ]?.status === "Synced";
                const stApple =
                  directories.find((d) => d.id === "apple")?.stores[
                    p.effectiveStoreId
                  ]?.status === "Synced";

                return (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col justify-between gap-3 hover:bg-[#f9f9f9] transition-colors"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px] font-medium">
                        {p.category}
                      </span>
                      <p className="text-[14px] font-medium text-[#111111] mt-2 leading-snug">
                        &ldquo;{p.query}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f2f2f2] text-[12px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] font-medium ${
                            stBing
                              ? "bg-[#dcfae5] text-[#04250e]"
                              : "bg-[#ffedea] text-[#831c1e]"
                          }`}
                        >
                          ChatGPT: {stBing ? "#1" : "Unranked"}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#dcfae5] text-[#04250e] font-medium">
                          Gemini: #1
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] font-medium ${
                            stApple
                              ? "bg-[#dcfae5] text-[#04250e]"
                              : "bg-[#fffbeb] text-[#92400e]"
                          }`}
                        >
                          Siri: {stApple ? "#1" : "#2"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ===================================================================
          TAB 2: MICRO-NEIGHBORHOODS & GEO-FENCES
      =================================================================== */}
      {activeTab === "neighborhoods" && (
        <section
          aria-label="Micro-neighborhoods and campus geo-targets"
          className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden flex flex-col gap-0"
        >
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111111]">
                Philadelphia Micro-Neighborhoods &amp; Campus Geo-Fences
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Localized geographic anchor entities targeted for proximity ranking in Gemini, Apple Maps, and SearchGPT
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNeighborForm(!showNeighborForm)}
              className="h-[30px] px-3 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <span>{showNeighborForm ? "Cancel" : "+ Add Geo-Target"}</span>
            </button>
          </div>

          {showNeighborForm && (
            <div className="p-4 bg-[#f9fafb] border-b border-[#e5e7eb] flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-[#111111]">
                Target new Philadelphia neighborhood or campus
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Target Name (e.g. Spruce Hill)"
                  value={newNeighborName}
                  onChange={(e) => setNewNeighborName(e.target.value)}
                  className="h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                />
                <select
                  value={newNeighborType}
                  onChange={(e) =>
                    setNewNeighborType(
                      e.target.value as GeoNeighborhood["type"]
                    )
                  }
                  className="h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
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
                  className="h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                />
                <input
                  type="text"
                  placeholder="Zip Codes (comma separated, e.g. 19104, 19139)"
                  value={newNeighborZips}
                  onChange={(e) => setNewNeighborZips(e.target.value)}
                  className="h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key Landmarks (e.g. Clark Park, 40th St Station)"
                  value={newNeighborLandmarks}
                  onChange={(e) => setNewNeighborLandmarks(e.target.value)}
                  className="flex-1 h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddNeighborhood}
                  className="h-[32px] px-4 rounded-[5px] bg-[#111111] text-white text-[12px] font-medium cursor-pointer shrink-0"
                >
                  Save target
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f9fafb] text-[12px] text-[#5f6368] font-medium">
                  <th className="py-2.5 px-4">Geo-Target</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Serviced Store</th>
                  <th className="py-2.5 px-3">Radius</th>
                  <th className="py-2.5 px-3">Zip Codes</th>
                  <th className="py-2.5 px-3">Key Landmarks</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {(isAllStores
                  ? neighborhoods
                  : neighborhoods.filter((n) => n.storeId === selectedStoreId)
                ).map((n) => (
                  <tr key={n.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#111111]">
                      {n.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px] font-medium">
                        {n.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#5f6368] text-[12px]">
                      {storeShortName}
                    </td>
                    <td className="py-3 px-3 font-mono text-[12px] text-[#111111]">
                      {n.radius}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {n.zipCodes.map((z) => (
                          <span
                            key={z}
                            className="px-1.5 py-0.2 rounded bg-white border border-[#e5e7eb] font-mono text-[11px] text-[#111111]"
                          >
                            {z}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[12px] text-[#5f6368] max-w-[240px] truncate">
                      {n.keyLandmarks.join(" · ")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#15803d]">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{n.status}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteNeighborhood(n.id)}
                          aria-label={`Delete ${n.name}`}
                          className="p-1 hover:bg-[#fee2e2] rounded text-[#5f6368] hover:text-[#dc2626] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===================================================================
          TAB 3: SCHEMA & AI CRAWLER DIRECTIVES
      =================================================================== */}
      {activeTab === "schema-crawlers" && (
        <section
          aria-label="Schema and crawler directives"
          className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {[
                {
                  id: "jsonld" as StudioArtifact,
                  label: "1. RepairShop JSON-LD",
                },
                {
                  id: "llms" as StudioArtifact,
                  label: "2. /llms.txt Manifest",
                },
                {
                  id: "robots" as StudioArtifact,
                  label: "3. robots.txt AI Directives",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveArtifact(item.id)}
                  className={`h-[30px] px-3 rounded-[6px] text-[12px] font-medium cursor-pointer transition-colors ${
                    activeArtifact === item.id
                      ? "bg-[#111111] text-white"
                      : "bg-[#f3f4f6] text-[#5f6368] hover:text-[#111111]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSchemaDeployed(true);
                  setNoticeBanner(
                    "Published latest JSON-LD graph, /llms.txt, and robots.txt crawler rules."
                  );
                }}
                className="h-[30px] px-3 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium cursor-pointer transition-colors"
              >
                {schemaDeployed ? "Active on site ✓" : "Publish to site"}
              </button>
            </div>
          </div>

          {activeArtifact === "jsonld" && (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111111]">
                    MobilePhoneRepairShop JSON-LD ({storeShortName})
                  </h3>
                  <p className="text-[12px] text-[#5f6368]">
                    Embeds verified Google, Yelp, Bing, and Trustpilot URLs into a single sameAs knowledge graph
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode("jsonld", generatedJsonLd)}
                  className="h-[28px] px-3 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === "jsonld" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803d]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6b6b6b]" aria-hidden="true" />
                      <span>Copy JSON-LD</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-[6px] bg-[#f9fafb] border border-[#e8e8e8] text-[12px] font-mono text-[#111111] overflow-x-auto leading-relaxed">
                {generatedJsonLd}
              </pre>
            </div>
          )}

          {activeArtifact === "llms" && (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111111]">
                    Public /llms.txt manifest (All 3 Philadelphia stores)
                  </h3>
                  <p className="text-[12px] text-[#5f6368]">
                    Machine-readable markdown file read by GPTBot, PerplexityBot, and ClaudeBot
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode("llms", generatedLlmsTxt)}
                  className="h-[28px] px-3 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === "llms" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803d]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6b6b6b]" aria-hidden="true" />
                      <span>Copy /llms.txt</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-[6px] bg-[#f9fafb] border border-[#e8e8e8] text-[12px] font-mono text-[#111111] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedLlmsTxt}
              </pre>
            </div>
          )}

          {activeArtifact === "robots" && (
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111111]">
                    robots.txt AI Crawler Allow Directives
                  </h3>
                  <p className="text-[12px] text-[#5f6368]">
                    Explicit access permissions allowing AI engines to crawl pricing, hours, and repair capabilities
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode("robots", generatedRobotsTxt)}
                  className="h-[28px] px-3 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === "robots" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803d]" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6b6b6b]" aria-hidden="true" />
                      <span>Copy robots.txt</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-[6px] bg-[#f9fafb] border border-[#e8e8e8] text-[12px] font-mono text-[#111111] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedRobotsTxt}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* ===================================================================
          TAB 4: BRAND TRUTH & ANTI-HALLUCINATION GUARDRAILS
      =================================================================== */}
      {activeTab === "guardrails" && (
        <section
          aria-label="Brand truth and anti-hallucination guardrails"
          className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#111111]">
                Brand Truth &amp; Anti-Hallucination Guardrails
              </h2>
              <p className="text-[12px] text-[#5f6368]">
                Canonical facts fed into /llms.txt and directory FAQs so AI engines never hallucinate prices or policies
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] text-[#5f6368] font-medium hidden sm:inline">
                {guardrails.length} canonical facts verified
              </span>
              <button
                type="button"
                onClick={() => setShowGuardForm(!showGuardForm)}
                className="h-[30px] px-3 rounded-[6px] bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <span>{showGuardForm ? "Cancel" : "+ Add Guardrail"}</span>
              </button>
            </div>
          </div>

          {showGuardForm && (
            <div className="p-4 bg-[#f9fafb] border-b border-[#e5e7eb] flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-[#111111]">
                Add new canonical truth fact (Anti-Hallucination)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-[#5f6368] mb-1">
                    Topic / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Water Damage Diagnostics"
                    value={newGuardTopic}
                    onChange={(e) => setNewGuardTopic(e.target.value)}
                    className="w-full h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[#5f6368] mb-1">
                    Verified Sources (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Website, GBP, Service Menu"
                    value={newGuardSources}
                    onChange={(e) => setNewGuardSources(e.target.value)}
                    className="w-full h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] text-[#5f6368] mb-1">
                  Customer Query / Claim
                </label>
                <input
                  type="text"
                  placeholder="e.g. Does Smart Fone Doctor repair liquid damaged iPhones or laptops?"
                  value={newGuardClaim}
                  onChange={(e) => setNewGuardClaim(e.target.value)}
                  className="w-full h-[32px] px-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                />
              </div>
              <div>
                <label className="block text-[12px] text-[#5f6368] mb-1">
                  Canonical Ground Truth Answer (Fed to LLMs)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Yes, all 3 Philadelphia stores perform ultrasonic motherboard cleaning and diagnostics with same-day turnaround."
                  value={newGuardAnswer}
                  onChange={(e) => setNewGuardAnswer(e.target.value)}
                  className="w-full p-2.5 rounded-[5px] border border-[#d1d5db] text-[12px] text-[#111111] bg-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGuardForm(false)}
                  className="h-[30px] px-3 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddGuardrail}
                  className="h-[30px] px-4 rounded-[5px] bg-[#111111] text-white text-[12px] font-medium cursor-pointer"
                >
                  Save guardrail
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-[#eaeaea]">
            {guardrails.map((g) => (
              <div key={g.id} className="p-4 flex flex-col gap-2 hover:bg-[#fafafa] transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#111111]">
                      {g.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#f3f4f6] text-[#5f6368] text-[11px] font-medium">
                      {g.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5">
                      {g.sourcesVerified.map((src) => (
                        <span
                          key={src}
                          className="px-1.5 py-0.2 rounded bg-white border border-[#e5e7eb] text-[11px] text-[#5f6368]"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGuardrail(g.id)}
                      aria-label={`Delete ${g.topic}`}
                      className="p-1 hover:bg-[#fee2e2] rounded text-[#5f6368] hover:text-[#dc2626] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[13px]">
                  <p className="text-[#5f6368] italic font-normal">
                    &ldquo;{g.claim}&rdquo;
                  </p>
                  <p className="text-[#111111] font-medium mt-1">
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
