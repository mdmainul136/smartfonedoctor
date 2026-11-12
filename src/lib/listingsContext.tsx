"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ListingStatus = "Synced" | "Mismatch" | "Missing";
export type SyncMode =
  | "Official API"
  | "Google Auto-Sync"
  | "DataForSEO Audit"
  | "Manual Claim";

export type DirectoryTier = "Tier 1 (Core Maps & Reviews)" | "Tier 2 (Major Citations)" | "Tier 3 (Local & Niche)";

export interface StoreListingEntry {
  status: ListingStatus;
  napMatch: number;
  rating: number | null;
  reviewsCount?: number;
  url: string;
  lastSynced?: string;
  issue?: string;
}

export interface DirectoryListing {
  id: string;
  name: string;
  domain: string;
  category: string;
  tier: DirectoryTier;
  authority: number; // Domain authority 1-100
  syncMode: SyncMode;
  claimPortalUrl: string;
  apiProviderId?: string;
  stores: Record<number, StoreListingEntry>;
}

export interface CatalogDirectoryItem {
  id: string;
  name: string;
  domain: string;
  category: string;
  tier: DirectoryTier;
  authority: number;
  syncMode: SyncMode;
  claimPortalUrl: string;
  description: string;
}

export interface ApiConnector {
  id: string;
  name: string;
  provider: string;
  capability: "Read & Write (Bi-directional)" | "Read-Only (Pull Stats & NAP)" | "Auto-Import from Google" | "Automated Citation Audit";
  authType: "OAuth 2.0" | "API Key" | "Google Sync";
  connected: boolean;
  accountLabel: string;
  lastPulled: string;
  directoriesCovered: string[];
  locationsMatched: number;
  endpointDoc: string;
}

export const INITIAL_DIRECTORIES: DirectoryListing[] = [
  {
    id: "gmb",
    name: "Google Business Profile",
    domain: "google.com/maps",
    category: "Search & Maps",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 100,
    syncMode: "Official API",
    claimPortalUrl: "https://business.google.com",
    apiProviderId: "google-gbp",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.8,
        reviewsCount: 50,
        url: "https://share.google/gTlyWLewR88ToAdJQ",
        lastSynced: "10 mins ago",
      },
      2: {
        status: "Synced",
        napMatch: 100,
        rating: 4.7,
        reviewsCount: 89,
        url: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
        lastSynced: "10 mins ago",
      },
      3: {
        status: "Synced",
        napMatch: 98,
        rating: 4.6,
        reviewsCount: 61,
        url: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
        lastSynced: "10 mins ago",
      },
    },
  },
  {
    id: "yelp",
    name: "Yelp for Business",
    domain: "yelp.com",
    category: "Local Reviews",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 94,
    syncMode: "Official API",
    claimPortalUrl: "https://biz.yelp.com",
    apiProviderId: "yelp-fusion",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.5,
        reviewsCount: 38,
        url: "https://www.yelp.com",
        lastSynced: "1 hour ago",
      },
      2: {
        status: "Synced",
        napMatch: 100,
        rating: 4.4,
        reviewsCount: 24,
        url: "https://www.yelp.com",
        lastSynced: "1 hour ago",
      },
      3: {
        status: "Mismatch",
        napMatch: 75,
        rating: 4.3,
        reviewsCount: 19,
        url: "https://www.yelp.com",
        lastSynced: "1 hour ago",
        issue: "Saturday closing time shows 6:00 PM instead of 7:00 PM",
      },
    },
  },
  {
    id: "apple",
    name: "Apple Business Connect",
    domain: "maps.apple.com",
    category: "iOS Maps & Siri",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 99,
    syncMode: "Official API",
    claimPortalUrl: "https://businessconnect.apple.com",
    apiProviderId: "apple-connect",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.7,
        reviewsCount: 31,
        url: "https://maps.apple.com",
        lastSynced: "2 hours ago",
      },
      2: {
        status: "Mismatch",
        napMatch: 78,
        rating: null,
        url: "https://maps.apple.com",
        lastSynced: "2 hours ago",
        issue: "Phone number formatted without primary local area code match",
      },
      3: {
        status: "Missing",
        napMatch: 0,
        rating: null,
        url: "",
        issue: "Location not claimed on Apple Business Connect",
      },
    },
  },
  {
    id: "bing",
    name: "Bing Places",
    domain: "bingplaces.com",
    category: "Search & Maps",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 93,
    syncMode: "Google Auto-Sync",
    claimPortalUrl: "https://www.bingplaces.com",
    apiProviderId: "bing-sync",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.8,
        reviewsCount: 50,
        url: "https://www.bing.com/maps",
        lastSynced: "Today",
      },
      2: {
        status: "Synced",
        napMatch: 96,
        rating: 4.6,
        reviewsCount: 42,
        url: "https://www.bing.com/maps",
        lastSynced: "Today",
      },
      3: {
        status: "Missing",
        napMatch: 0,
        rating: null,
        url: "",
        issue: "Enable 'Import from Google Business Profile' in Bing Places",
      },
    },
  },
  {
    id: "facebook",
    name: "Facebook Business Page",
    domain: "facebook.com",
    category: "Social Directory",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 96,
    syncMode: "Official API",
    claimPortalUrl: "https://business.facebook.com",
    apiProviderId: "facebook-graph",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.9,
        reviewsCount: 64,
        url: "https://facebook.com",
        lastSynced: "30 mins ago",
      },
      2: {
        status: "Synced",
        napMatch: 100,
        rating: 4.7,
        reviewsCount: 41,
        url: "https://facebook.com",
        lastSynced: "30 mins ago",
      },
      3: {
        status: "Mismatch",
        napMatch: 80,
        rating: null,
        url: "https://facebook.com",
        lastSynced: "30 mins ago",
        issue: "Website URL points to generic root instead of location page",
      },
    },
  },
  {
    id: "ezlocal",
    name: "EZlocal",
    domain: "ezlocal.com",
    category: "Citation Aggregator",
    tier: "Tier 2 (Major Citations)",
    authority: 76,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://ezlocal.com",
    apiProviderId: "dataforseo-scanner",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.8,
        reviewsCount: 50,
        url: "https://ezlink.ai/smartfonedoctor/review",
        lastSynced: "Yesterday",
      },
      2: {
        status: "Synced",
        napMatch: 95,
        rating: 4.6,
        reviewsCount: 28,
        url: "https://ezlocal.com",
        lastSynced: "Yesterday",
      },
      3: {
        status: "Synced",
        napMatch: 95,
        rating: 4.5,
        reviewsCount: 18,
        url: "https://ezlocal.com",
        lastSynced: "Yesterday",
      },
    },
  },
  {
    id: "trustpilot",
    name: "Trustpilot",
    domain: "trustpilot.com",
    category: "Review Platform",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 93,
    syncMode: "Official API",
    claimPortalUrl: "https://business.trustpilot.com",
    apiProviderId: "trustpilot-api",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.7,
        reviewsCount: 29,
        url: "https://www.trustpilot.com",
        lastSynced: "3 hours ago",
      },
      2: {
        status: "Synced",
        napMatch: 100,
        rating: 4.7,
        reviewsCount: 29,
        url: "https://www.trustpilot.com",
        lastSynced: "3 hours ago",
      },
      3: {
        status: "Synced",
        napMatch: 100,
        rating: 4.7,
        reviewsCount: 29,
        url: "https://www.trustpilot.com",
        lastSynced: "3 hours ago",
      },
    },
  },
  {
    id: "yellowpages",
    name: "YellowPages",
    domain: "yellowpages.com",
    category: "Citation Directory",
    tier: "Tier 2 (Major Citations)",
    authority: 91,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://adsolutions.yp.com",
    apiProviderId: "dataforseo-scanner",
    stores: {
      1: {
        status: "Mismatch",
        napMatch: 72,
        rating: 4.5,
        reviewsCount: 14,
        url: "https://www.yellowpages.com",
        lastSynced: "Yesterday",
        issue: "Address missing 'Fl 2nd' floor designation",
      },
      2: {
        status: "Synced",
        napMatch: 95,
        rating: null,
        url: "https://www.yellowpages.com",
        lastSynced: "Yesterday",
      },
      3: {
        status: "Missing",
        napMatch: 0,
        rating: null,
        url: "",
        issue: "Unclaimed directory listing on YP.com",
      },
    },
  },
  {
    id: "hotfrog",
    name: "Hotfrog",
    domain: "hotfrog.com",
    category: "Business Directory",
    tier: "Tier 2 (Major Citations)",
    authority: 74,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://www.hotfrog.com",
    stores: {
      1: {
        status: "Synced",
        napMatch: 96,
        rating: null,
        url: "https://www.hotfrog.com",
        lastSynced: "3 days ago",
      },
      2: {
        status: "Missing",
        napMatch: 0,
        rating: null,
        url: "",
        issue: "Profile not submitted yet",
      },
      3: {
        status: "Missing",
        napMatch: 0,
        rating: null,
        url: "",
        issue: "Profile not submitted yet",
      },
    },
  },
  {
    id: "g2",
    name: "G2",
    domain: "g2.com",
    category: "Tech & B2B Reviews",
    tier: "Tier 3 (Local & Niche)",
    authority: 90,
    syncMode: "Official API",
    claimPortalUrl: "https://sell.g2.com",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.8,
        reviewsCount: 11,
        url: "https://www.g2.com",
        lastSynced: "2 days ago",
      },
      2: {
        status: "Missing",
        napMatch: 0,
        rating: null,
        url: "",
        issue: "Not listed for this branch",
      },
      3: {
        status: "Missing",
        napMatch: 0,
        rating: null,
        url: "",
        issue: "Not listed for this branch",
      },
    },
  },
  {
    id: "nextdoor",
    name: "Nextdoor Business",
    domain: "nextdoor.com",
    category: "Neighborhood App",
    tier: "Tier 2 (Major Citations)",
    authority: 89,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://business.nextdoor.com",
    stores: {
      1: {
        status: "Synced",
        napMatch: 100,
        rating: 4.9,
        reviewsCount: 33,
        url: "https://nextdoor.com",
        lastSynced: "5 days ago",
      },
      2: {
        status: "Mismatch",
        napMatch: 82,
        rating: 4.7,
        reviewsCount: 19,
        url: "https://nextdoor.com",
        lastSynced: "5 days ago",
        issue: "Store name written as 'Smart Fone Dr' instead of 'Smart Fone Doctor'",
      },
      3: {
        status: "Synced",
        napMatch: 100,
        rating: 4.8,
        reviewsCount: 15,
        url: "https://nextdoor.com",
        lastSynced: "5 days ago",
      },
    },
  },
];

export const CATALOG_DIRECTORIES: CatalogDirectoryItem[] = [
  {
    id: "bbb",
    name: "Better Business Bureau (BBB)",
    domain: "bbb.org",
    category: "Trust & Accreditation",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 93,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://www.bbb.org/get-listed",
    description: "High-authority trust signal for Philadelphia consumers and Google local rank.",
  },
  {
    id: "foursquare",
    name: "Foursquare",
    domain: "foursquare.com",
    category: "Location Data Aggregator",
    tier: "Tier 1 (Core Maps & Reviews)",
    authority: 92,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://foursquare.com/venue/claim",
    description: "Feeds location data to Apple Maps, Uber, Snapchat, and 100+ navigation apps.",
  },
  {
    id: "mapquest",
    name: "MapQuest",
    domain: "mapquest.com",
    category: "Navigation & Maps",
    tier: "Tier 2 (Major Citations)",
    authority: 88,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://www.mapquest.com",
    description: "Legacy navigation directory with high domain authority for local map pack SEO.",
  },
  {
    id: "yahoo-local",
    name: "Yahoo Local",
    domain: "local.yahoo.com",
    category: "Search Directory",
    tier: "Tier 2 (Major Citations)",
    authority: 91,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://smallbusiness.yahoo.com/localworks",
    description: "Major search engine local directory feeding Yahoo Search map results.",
  },
  {
    id: "thumbtack",
    name: "Thumbtack",
    domain: "thumbtack.com",
    category: "Local Service Marketplace",
    tier: "Tier 2 (Major Citations)",
    authority: 87,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://www.thumbtack.com/pro",
    description: "Captures direct repair quotes for phone, tablet, and computer repair in Philly.",
  },
  {
    id: "angi",
    name: "Angi (Angie's List)",
    domain: "angi.com",
    category: "Local Services",
    tier: "Tier 2 (Major Citations)",
    authority: 89,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://office.angi.com",
    description: "Trusted local service directory with strong backlink authority.",
  },
  {
    id: "manta",
    name: "Manta",
    domain: "manta.com",
    category: "Small Business Directory",
    tier: "Tier 2 (Major Citations)",
    authority: 84,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://www.manta.com/claim",
    description: "One of the largest US small-business citation directories.",
  },
  {
    id: "superpages",
    name: "Superpages",
    domain: "superpages.com",
    category: "Citation Directory",
    tier: "Tier 2 (Major Citations)",
    authority: 83,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://adsolutions.yp.com",
    description: "Part of the Thryv/YP network; reinforces NAP consistency with YellowPages.",
  },
  {
    id: "chamber",
    name: "ChamberofCommerce.com",
    domain: "chamberofcommerce.com",
    category: "Business Authority",
    tier: "Tier 2 (Major Citations)",
    authority: 82,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://www.chamberofcommerce.com/add-business",
    description: "Strong local business citation that ranks on page 1 for brand searches.",
  },
  {
    id: "merchantcircle",
    name: "MerchantCircle",
    domain: "merchantcircle.com",
    category: "Local Directory",
    tier: "Tier 3 (Local & Niche)",
    authority: 79,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://www.merchantcircle.com/signup",
    description: "Local merchant network for neighborhood service coupons and NAP citations.",
  },
  {
    id: "dexknows",
    name: "DexKnows",
    domain: "dexknows.com",
    category: "Local Citations",
    tier: "Tier 3 (Local & Niche)",
    authority: 78,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://www.dexknows.com",
    description: "Syndicated local directory for service businesses.",
  },
  {
    id: "showmelocal",
    name: "ShowMeLocal",
    domain: "showmelocal.com",
    category: "Citation Directory",
    tier: "Tier 3 (Local & Niche)",
    authority: 72,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://www.showmelocal.com/register.aspx",
    description: "Free local citation directory crawled by Bing and Google.",
  },
  {
    id: "brownbook",
    name: "Brownbook",
    domain: "brownbook.net",
    category: "Global Business Directory",
    tier: "Tier 3 (Local & Niche)",
    authority: 73,
    syncMode: "Manual Claim",
    claimPortalUrl: "https://www.brownbook.net/business/add/",
    description: "Instant-approval citation directory with structured schema markup.",
  },
  {
    id: "local-com",
    name: "Local.com",
    domain: "local.com",
    category: "City Search",
    tier: "Tier 3 (Local & Niche)",
    authority: 75,
    syncMode: "DataForSEO Audit",
    claimPortalUrl: "https://www.local.com",
    description: "City-specific directory indexing Philadelphia electronics repair shops.",
  },
];

export const INITIAL_API_CONNECTORS: ApiConnector[] = [
  {
    id: "google-gbp",
    name: "Google Business Profile API",
    provider: "Google Cloud OAuth 2.0",
    capability: "Read & Write (Bi-directional)",
    authType: "OAuth 2.0",
    connected: true,
    accountLabel: "smartfonedoctor.philly@gmail.com (3 locations)",
    lastPulled: "10 mins ago",
    directoriesCovered: ["Google Business Profile", "Google Maps", "Google Search Local Pack"],
    locationsMatched: 3,
    endpointDoc: "mybusinessbusinessinformation.googleapis.com/v1",
  },
  {
    id: "yelp-fusion",
    name: "Yelp Fusion API",
    provider: "Yelp Developer Portal",
    capability: "Read-Only (Pull Stats & NAP)",
    authType: "API Key",
    connected: true,
    accountLabel: "Fusion Key ••••94A2 (3 Philly stores matched)",
    lastPulled: "1 hour ago",
    directoriesCovered: ["Yelp for Business"],
    locationsMatched: 3,
    endpointDoc: "api.yelp.com/v3/businesses/matches",
  },
  {
    id: "facebook-graph",
    name: "Meta / Facebook Pages Graph API",
    provider: "Meta Business Suite",
    capability: "Read & Write (Bi-directional)",
    authType: "OAuth 2.0",
    connected: true,
    accountLabel: "Smart Fone Doctor Business Portfolio",
    lastPulled: "30 mins ago",
    directoriesCovered: ["Facebook Business Page", "Instagram Map Tag"],
    locationsMatched: 3,
    endpointDoc: "graph.facebook.com/v19.0/{page-id}",
  },
  {
    id: "apple-connect",
    name: "Apple Business Connect API",
    provider: "Apple Business Register",
    capability: "Read & Write (Bi-directional)",
    authType: "OAuth 2.0",
    connected: false,
    accountLabel: "Not connected (1 of 3 locations claimed manually)",
    lastPulled: "Never",
    directoriesCovered: ["Apple Maps", "Siri Local Search", "Apple Wallet Place Card"],
    locationsMatched: 1,
    endpointDoc: "api.businessconnect.apple.com/v1/locations",
  },
  {
    id: "bing-sync",
    name: "Bing Places (Google Auto-Import)",
    provider: "Microsoft Bing Places",
    capability: "Auto-Import from Google",
    authType: "Google Sync",
    connected: true,
    accountLabel: "Linked to Google Business Profile OAuth",
    lastPulled: "Today",
    directoriesCovered: ["Bing Places", "DuckDuckGo Maps", "Yahoo Local Feed"],
    locationsMatched: 2,
    endpointDoc: "bingplaces.com/Dashboard/GoogleImport",
  },
  {
    id: "trustpilot-api",
    name: "Trustpilot Business API",
    provider: "Trustpilot Business",
    capability: "Read-Only (Pull Stats & NAP)",
    authType: "API Key",
    connected: true,
    accountLabel: "Domain: smartfonedoctor.com",
    lastPulled: "3 hours ago",
    directoriesCovered: ["Trustpilot"],
    locationsMatched: 3,
    endpointDoc: "api.trustpilot.com/v1/business-units",
  },
  {
    id: "dataforseo-scanner",
    name: "DataForSEO Citation & NAP Scanner API",
    provider: "DataForSEO Business Data API",
    capability: "Automated Citation Audit",
    authType: "API Key",
    connected: true,
    accountLabel: "Scanner Active · Audits 30+ directories weekly",
    lastPulled: "Yesterday",
    directoriesCovered: [
      "EZlocal",
      "YellowPages",
      "BBB",
      "Foursquare",
      "MapQuest",
      "Manta",
      "Superpages",
    ],
    locationsMatched: 3,
    endpointDoc: "api.dataforseo.com/v3/business_data/business_listings",
  },
];

interface ListingsContextValue {
  directories: DirectoryListing[];
  connectors: ApiConnector[];
  updateStoreEntry: (dirId: string, storeId: number, entry: StoreListingEntry) => void;
  addFromCatalog: (item: CatalogDirectoryItem, targetStoreIds: number[], initialStatus?: ListingStatus) => void;
  addCustomDirectory: (dir: DirectoryListing) => void;
  pullFromApi: (connectorId: string) => void;
  toggleConnector: (connectorId: string, accountLabel?: string) => void;
  auditAllNap: (storeId?: number) => void;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: React.ReactNode }) {
  const [directories, setDirectories] = useState<DirectoryListing[]>(INITIAL_DIRECTORIES);
  const [connectors, setConnectors] = useState<ApiConnector[]>(INITIAL_API_CONNECTORS);

  // Load persisted changes from sessionStorage so navigating across sub-pages keeps changes
  useEffect(() => {
    try {
      const savedDirs = sessionStorage.getItem("sfd_listings_dirs_v2");
      if (savedDirs) {
        setDirectories(JSON.parse(savedDirs));
      }
      const savedConns = sessionStorage.getItem("sfd_listings_conns_v2");
      if (savedConns) {
        setConnectors(JSON.parse(savedConns));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveDirectories = (next: DirectoryListing[]) => {
    setDirectories(next);
    try {
      sessionStorage.setItem("sfd_listings_dirs_v2", JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const saveConnectors = (next: ApiConnector[]) => {
    setConnectors(next);
    try {
      sessionStorage.setItem("sfd_listings_conns_v2", JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const updateStoreEntry = (dirId: string, storeId: number, entry: StoreListingEntry) => {
    const next = directories.map((d) =>
      d.id === dirId
        ? {
            ...d,
            stores: {
              ...d.stores,
              [storeId]: entry,
            },
          }
        : d
    );
    saveDirectories(next);
  };

  const addFromCatalog = (
    item: CatalogDirectoryItem,
    targetStoreIds: number[],
    initialStatus: ListingStatus = "Missing"
  ) => {
    const existing = directories.find((d) => d.id === item.id);
    if (existing) {
      // Update any selected store entries if needed
      const updatedStores = { ...existing.stores };
      targetStoreIds.forEach((sid) => {
        if (!updatedStores[sid]) {
          updatedStores[sid] = {
            status: initialStatus,
            napMatch: initialStatus === "Synced" ? 100 : 0,
            rating: null,
            url: initialStatus === "Synced" ? item.claimPortalUrl : "",
            lastSynced: "Just added",
            issue:
              initialStatus === "Missing"
                ? `Added from catalog — ready to claim on ${item.name}`
                : undefined,
          };
        }
      });
      saveDirectories(
        directories.map((d) => (d.id === item.id ? { ...d, stores: updatedStores } : d))
      );
      return;
    }

    const storesMap: Record<number, StoreListingEntry> = {
      1: {
        status: targetStoreIds.includes(1) ? initialStatus : "Missing",
        napMatch: targetStoreIds.includes(1) && initialStatus === "Synced" ? 100 : 0,
        rating: null,
        url: targetStoreIds.includes(1) && initialStatus === "Synced" ? item.claimPortalUrl : "",
        lastSynced: "Just added",
        issue:
          initialStatus === "Missing"
            ? `Added from catalog — claim ${item.name} profile`
            : undefined,
      },
      2: {
        status: targetStoreIds.includes(2) ? initialStatus : "Missing",
        napMatch: targetStoreIds.includes(2) && initialStatus === "Synced" ? 100 : 0,
        rating: null,
        url: targetStoreIds.includes(2) && initialStatus === "Synced" ? item.claimPortalUrl : "",
        lastSynced: "Just added",
        issue:
          initialStatus === "Missing"
            ? `Added from catalog — claim ${item.name} profile`
            : undefined,
      },
      3: {
        status: targetStoreIds.includes(3) ? initialStatus : "Missing",
        napMatch: targetStoreIds.includes(3) && initialStatus === "Synced" ? 100 : 0,
        rating: null,
        url: targetStoreIds.includes(3) && initialStatus === "Synced" ? item.claimPortalUrl : "",
        lastSynced: "Just added",
        issue:
          initialStatus === "Missing"
            ? `Added from catalog — claim ${item.name} profile`
            : undefined,
      },
    };

    const newDir: DirectoryListing = {
      id: item.id,
      name: item.name,
      domain: item.domain,
      category: item.category,
      tier: item.tier,
      authority: item.authority,
      syncMode: item.syncMode,
      claimPortalUrl: item.claimPortalUrl,
      apiProviderId: item.syncMode === "DataForSEO Audit" ? "dataforseo-scanner" : undefined,
      stores: storesMap,
    };

    saveDirectories([newDir, ...directories]);
  };

  const addCustomDirectory = (dir: DirectoryListing) => {
    saveDirectories([dir, ...directories]);
  };

  const pullFromApi = (connectorId: string) => {
    // Update connector timestamp
    const nextConns = connectors.map((c) =>
      c.id === connectorId
        ? { ...c, connected: true, lastPulled: "Just now", locationsMatched: 3 }
        : c
    );
    saveConnectors(nextConns);

    // Update linked directories to reflect fresh API pull
    const nextDirs = directories.map((d) => {
      if (d.apiProviderId !== connectorId) return d;
      const updatedStores: Record<number, StoreListingEntry> = {};
      [1, 2, 3].forEach((sid) => {
        const prev = d.stores[sid];
        if (connectorId === "google-gbp" || connectorId === "facebook-graph" || connectorId === "bing-sync" || connectorId === "apple-connect") {
          // Bi-directional APIs auto-sync NAP to 100%
          updatedStores[sid] = {
            ...prev,
            status: "Synced",
            napMatch: 100,
            url: prev.url || d.claimPortalUrl,
            lastSynced: "Just now via API",
            issue: undefined,
          };
        } else {
          // Read-only / Audit APIs refresh timestamp
          updatedStores[sid] = {
            ...prev,
            lastSynced: "Just now via API",
          };
        }
      });
      return { ...d, stores: updatedStores };
    });
    saveDirectories(nextDirs);
  };

  const toggleConnector = (connectorId: string, accountLabel?: string) => {
    const nextConns = connectors.map((c) => {
      if (c.id !== connectorId) return c;
      const nextConnected = !c.connected;
      return {
        ...c,
        connected: nextConnected,
        lastPulled: nextConnected ? "Just connected" : "Disconnected",
        accountLabel: accountLabel || (nextConnected ? "Connected via API Token" : "Not connected"),
      };
    });
    saveConnectors(nextConns);
  };

  const auditAllNap = (storeId?: number) => {
    const nextDirs = directories.map((d) => {
      const updatedStores = { ...d.stores };
      [1, 2, 3].forEach((sid) => {
        if (!storeId || storeId === sid) {
          updatedStores[sid] = {
            ...updatedStores[sid],
            lastSynced: "Scanned just now",
          };
        }
      });
      return { ...d, stores: updatedStores };
    });
    saveDirectories(nextDirs);
  };

  return (
    <ListingsContext.Provider
      value={{
        directories,
        connectors,
        updateStoreEntry,
        addFromCatalog,
        addCustomDirectory,
        pullFromApi,
        toggleConnector,
        auditAllNap,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return ctx;
}

