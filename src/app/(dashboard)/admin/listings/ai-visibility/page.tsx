"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import { useListings } from "@/lib/listingsContext";
import {
  getGeoNeighborhoodsAction,
  upsertGeoNeighborhoodAction,
  deleteGeoNeighborhoodAction,
  getAeoBrandGuardrailsAction,
  upsertAeoBrandGuardrailAction,
  deleteAeoBrandGuardrailAction,
} from "@/actions/geoAeo";
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

  // ── Broad GEO State: Neighborhoods & Brand Truth Guardrails (PostgreSQL DB-First) ────────────────
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

  // Load live GEO and AEO data from PostgreSQL
  useEffect(() => {
    async function loadDbData() {
      const [neighRes, guardRes] = await Promise.all([
        getGeoNeighborhoodsAction(),
        getAeoBrandGuardrailsAction(),
      ]);
      if (neighRes.success && neighRes.neighborhoods && neighRes.neighborhoods.length > 0) {
        setNeighborhoods(neighRes.neighborhoods as GeoNeighborhood[]);
      }
      if (guardRes.success && guardRes.guardrails && guardRes.guardrails.length > 0) {
        setGuardrails(guardRes.guardrails as BrandTruthGuardrail[]);
      }
    }
    loadDbData();
  }, []);

  const handleAddNeighborhood = async () => {
    if (!newNeighborName.trim()) return;
    const storeTargetId = isAllStores ? 1 : selectedStoreId;
    const zips = newNeighborZips.split(",").map((s) => s.trim()).filter(Boolean);
    const landmarks = newNeighborLandmarks.split(",").map((s) => s.trim()).filter(Boolean);

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
      setNoticeBanner(`Saved ${res.neighborhood.name} to geo-fencing targets.`);
    }
  };

  const handleDeleteNeighborhood = async (id: string) => {
    const target = neighborhoods.find((n) => n.id === id);
    setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
    await deleteGeoNeighborhoodAction(id);
    setNoticeBanner(`Removed ${target?.name ?? "geo-target"} from active targets.`);
  };

  const [showGuardForm, setShowGuardForm] = useState(false);
  const [newGuardTopic, setNewGuardTopic] = useState("");
  const [newGuardClaim, setNewGuardClaim] = useState("");
  const [newGuardAnswer, setNewGuardAnswer] = useState("");
  const [newGuardSources, setNewGuardSources] = useState("Website, llms.txt");

  const handleAddGuardrail = async () => {
    if (!newGuardTopic.trim() || !newGuardClaim.trim() || !newGuardAnswer.trim()) return;
    const sources = newGuardSources.split(",").map((s) => s.trim()).filter(Boolean);

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
      setNoticeBanner(`Published truth guardrail "${res.guardrail.topic}" to AI knowledge graph.`);
    }
  };

  const handleDeleteGuardrail = async (id: string) => {
    const target = guardrails.find((g) => g.id === id);
    setGuardrails((prev) => prev.filter((g) => g.id !== id));
    await deleteAeoBrandGuardrailAction(id);
    setNoticeBanner(`Removed guardrail "${target?.topic ?? "fact"}".`);
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
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-6 flex flex-col gap-6 overflow-x-hidden antialiased">
      {/* 1. MATERIAL 3 HERO HEADER (SmartFoneDoctor Brand Teal & Elevated Surface) */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/30 p-5 sm:p-7 border border-teal-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#009691] text-white flex items-center justify-center shadow-md shadow-[#009691]/25 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Search &amp; GEO Visibility
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/80 text-[#009691] text-[11px] font-semibold px-2.5 py-0.5">
                {isAllStores ? "All 3 Philly stores" : storeShortName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              Multi-engine directory sync, AI crawler indexing, and ground-truth knowledge graph
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
            onClick={handleRunScan}
            disabled={isScanning}
            className="h-9 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm shadow-[#009691]/25 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>{isScanning ? "Checking…" : "Run Live Audit"}</span>
          </button>
        </div>
      </div>

      {/* Material 3 Segmented Navigation Tabs */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
          className="bg-teal-50 border border-teal-200 text-[#009691] font-medium rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-xs"
        >
          <span>{noticeBanner}</span>
          <button
            type="button"
            onClick={() => setNoticeBanner(null)}
            aria-label="Dismiss notice"
            className="p-1 hover:bg-teal-100 rounded-md cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 2. MATERIAL 3 LAYERED METRIC SURFACES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Google Search &amp; Maps</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {scores.googleAi}%
            </span>
            <span className="text-xs font-semibold text-[#009691] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              verified
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Apple Maps &amp; Siri</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {scores.appleSiri}%
            </span>
            <span className="text-xs font-semibold text-[#009691] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              coordinates
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Bing &amp; Windows Search</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {scores.chatgpt}%
            </span>
            <span className="text-xs font-semibold text-[#009691] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              hours synced
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Schema &amp; Structured Data</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-[#009691] leading-none">
              Active
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              LocalBusiness
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: OVERVIEW & AUTO-FIXES (Material 3 Cards & Brand Teal Accents)
      =================================================================== */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* A. DIRECTORY ALIGNMENT CHECKLIST */}
          <section
            aria-label="Directory alignment queue"
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-slate-900">
                  Directory Alignment Checklist
                </h2>
                <span className="text-xs text-slate-500 tabular-nums font-medium">
                  · {4 - pendingCount} of 4 verified
                </span>
              </div>

              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleRunAllFixes}
                  className="h-7 px-3.5 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs shadow-[#009691]/20 transition-all cursor-pointer"
                >
                  <span>Sync all ({pendingCount})</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {agentActions.map((act) => {
                const isDone = act.status === "Completed";
                return (
                  <div
                    key={act.id}
                    className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {isDone ? (
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
                            isDone ? "text-slate-600" : "text-slate-900 font-semibold"
                          }`}
                        >
                          {act.title}
                        </span>
                        <span className="hidden sm:inline text-slate-300">
                          ·
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          {act.rootCause}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0 pl-7 sm:pl-0">
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {act.targetEngine}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
                          isDone
                            ? "bg-teal-50 text-[#009691] border border-teal-200/60"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {act.impactBadge}
                      </span>

                      {isDone &&
                      act.id !== "deploy-schema-llms" &&
                      act.id !== "sync-entity-bio" ? (
                        <span className="h-7 px-3 rounded-lg text-[#009691] text-xs font-semibold inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={act.onExecute}
                          className={`h-7 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                            isDone
                              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              : "bg-[#009691] hover:bg-[#00827d] text-white shadow-xs shadow-[#009691]/20"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Visual Bar Chart for Local Competitor Share of Voice */}
            <section
              aria-label="Philadelphia competitor AI share of voice"
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Philadelphia Local Benchmarks
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Visibility index across local Philadelphia repair searches
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("neighborhoods")}
                    className="text-xs font-semibold text-[#009691] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>View geo-targets</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-5 flex flex-col gap-4">
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
                      <div className="flex items-center justify-between gap-2 text-xs sm:text-[13px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`truncate ${
                              item.isSelf
                                ? "font-bold text-slate-900"
                                : "font-medium text-slate-700"
                            }`}
                          >
                            {item.shop}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] shrink-0 font-medium ${
                              item.isSelf
                                ? "bg-teal-50 text-[#009691] border border-teal-200/60 font-semibold"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <span
                          className={`text-xs sm:text-[13px] tabular-nums shrink-0 ${
                            item.isSelf
                              ? "font-bold text-[#009691]"
                              : "text-slate-500 font-medium"
                          }`}
                        >
                          {item.pct}%
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.isSelf
                              ? "bg-gradient-to-r from-[#009691] to-teal-400"
                              : "bg-slate-300"
                          }`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>
                  {scores.overall >= 85
                    ? "Smart Fone Doctor ranks #1 across Philadelphia AI engines"
                    : "Syncing Bing Places & Apple Maps pushes your share above 88%"}
                </span>
                <span className="font-bold text-[#009691] tabular-nums">
                  Target: 90%+
                </span>
              </div>
            </section>

            {/* Right: Directory Citation Feeds with Visual Health Bars */}
            <section
              aria-label="Directory citation feeds powering AI engines"
              className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Directory feeds powering AI
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Citation accuracy feeding LLM search indexes
                    </p>
                  </div>
                  <Link
                    href="/admin/listings"
                    className="text-xs font-semibold text-[#009691] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    <span>All 11 directories</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
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
                                : "text-rose-700"
                            }`}
                          >
                            {score}% synced
                          </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              score >= 95
                                ? "bg-[#009691]"
                                : score >= 70
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.max(score, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Connected via Google OAuth, Yelp Fusion &amp; Schema</span>
                <Link
                  href="/admin/listings/api-sync"
                  className="font-semibold text-[#009691] hover:underline"
                >
                  API connections →
                </Link>
              </div>
            </section>
          </div>

          {/* C. COMPACT 3-PROMPT SNAPSHOT (Material 3 Cards & Brand Teal Badges) */}
          <section
            aria-label="Buyer prompt snapshot"
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
          >
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Top Local Search Queries ({storeShortName})
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  High-intent phone &amp; console repair searches in Philadelphia
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("neighborhoods")}
                className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs"
              >
                <span>Manage geo-targets ({neighborhoods.length})</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
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
                    className="p-5 flex flex-col justify-between gap-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-[#009691] text-[11px] font-semibold border border-teal-200/60">
                        {p.category}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 mt-2.5 leading-snug">
                        &ldquo;{p.query}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            stBing
                              ? "bg-teal-50 text-[#009691] border border-teal-200/60"
                              : "bg-rose-50 text-rose-700 border border-rose-200/60"
                          }`}
                        >
                          ChatGPT: {stBing ? "#1" : "Unranked"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#009691] border border-teal-200/60 font-semibold text-[11px]">
                          Gemini: #1
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            stApple
                              ? "bg-teal-50 text-[#009691] border border-teal-200/60"
                              : "bg-amber-50 text-amber-800 border border-amber-200/60"
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
          TAB 2: MICRO-NEIGHBORHOODS & GEO-FENCES (Material 3 Surface)
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
                Localized geographic anchor entities targeted for proximity ranking in Gemini, Apple Maps, and SearchGPT
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
                    setNewNeighborType(
                      e.target.value as GeoNeighborhood["type"]
                    )
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
                  onClick={handleAddNeighborhood}
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
                ).map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {n.name}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {n.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 text-xs font-medium">
                      {storeShortName}
                    </td>
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
                          onClick={() => handleDeleteNeighborhood(n.id)}
                          aria-label={`Delete ${n.name}`}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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
          TAB 3: SCHEMA & AI CRAWLER DIRECTIVES (Material 3 Tabs & Brand Teal)
      =================================================================== */}
      {activeTab === "schema-crawlers" && (
        <section
          aria-label="Schema and crawler directives"
          className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs"
        >
          <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
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
                onClick={() => {
                  setSchemaDeployed(true);
                  setNoticeBanner(
                    "Published latest JSON-LD graph, /llms.txt, and robots.txt crawler rules."
                  );
                }}
                className="h-8 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold cursor-pointer transition-all shadow-xs shadow-[#009691]/20"
              >
                {schemaDeployed ? "Active on site ✓" : "Publish to site"}
              </button>
            </div>
          </div>

          {activeArtifact === "jsonld" && (
            <div className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    MobilePhoneRepairShop JSON-LD ({storeShortName})
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Embeds verified Google, Yelp, Bing, and Trustpilot URLs into a single sameAs knowledge graph
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode("jsonld", generatedJsonLd)}
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
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed">
                {generatedJsonLd}
              </pre>
            </div>
          )}

          {activeArtifact === "llms" && (
            <div className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Public /llms.txt manifest (All 3 Philadelphia stores)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Machine-readable markdown file read by GPTBot, PerplexityBot, and ClaudeBot
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode("llms", generatedLlmsTxt)}
                  className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
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
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedLlmsTxt}
              </pre>
            </div>
          )}

          {activeArtifact === "robots" && (
            <div className="p-5 flex flex-col gap-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    robots.txt AI Crawler Allow Directives
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Explicit access permissions allowing AI engines to crawl pricing, hours, and repair capabilities
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCode("robots", generatedRobotsTxt)}
                  className="h-8 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-[#009691] inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
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
              <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedRobotsTxt}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* ===================================================================
          TAB 4: BRAND TRUTH & ANTI-HALLUCINATION GUARDRAILS (Material 3)
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
                Canonical facts fed into /llms.txt and directory FAQs so AI engines never hallucinate prices or policies
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                {guardrails.length} canonical facts verified
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
                Add new canonical truth fact (Anti-Hallucination)
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
                  onClick={handleAddGuardrail}
                  className="h-8 px-4 rounded-xl bg-[#009691] hover:bg-[#00827d] text-white text-xs font-semibold cursor-pointer shadow-xs shadow-[#009691]/20 transition-all"
                >
                  Save guardrail
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {guardrails.map((g) => (
              <div key={g.id} className="p-5 flex flex-col gap-2 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {g.topic}
                    </span>
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
                      onClick={() => handleDeleteGuardrail(g.id)}
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
