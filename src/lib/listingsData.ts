// Shared types and baseline data for Directory Listings & API Connectors.
// Kept free of "use client" so both Server Actions and Client Components can import safely.

export type ListingStatus = "Synced" | "Mismatch" | "Missing";
export type SyncMode =
  | "Official API"
  | "Google Auto-Sync"
  | "DataForSEO Audit"
  | "Manual Claim";

export type DirectoryTier =
  | "Tier 1 (Core Maps & Reviews)"
  | "Tier 2 (Major Citations)"
  | "Tier 3 (Local & Niche)";

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
  capability:
    | "Read & Write (Bi-directional)"
    | "Read-Only (Pull Stats & NAP)"
    | "Auto-Import from Google"
    | "Automated Citation Audit";
  authType: "OAuth 2.0" | "API Key" | "Google Sync";
  connected: boolean;
  hasCredentials?: boolean;
  credentialSource?: "database" | "env" | "none";
  accountLabel: string;
  lastPulled: string;
  directoriesCovered: string[];
  locationsMatched: number;
  endpointDoc: string;
}

function createUnverifiedEntry(): StoreListingEntry {
  return {
    status: "Missing",
    napMatch: 0,
    rating: null,
    url: "",
    lastSynced: "Never",
    issue: "Not yet synced — connect API or verify manually",
  };
}

export function createUnverifiedStores(): Record<number, StoreListingEntry> {
  return {
    1: createUnverifiedEntry(),
    2: createUnverifiedEntry(),
    3: createUnverifiedEntry(),
  };
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    stores: createUnverifiedStores(),
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
    connected: false,
    hasCredentials: false,
    credentialSource: "none",
    accountLabel: "Not configured",
    lastPulled: "Never",
    directoriesCovered: ["Google Business Profile", "Google Maps", "Google Search Local Pack"],
    locationsMatched: 0,
    endpointDoc: "mybusinessbusinessinformation.googleapis.com/v1",
  },
  {
    id: "yelp-fusion",
    name: "Yelp Fusion API",
    provider: "Yelp Developer Portal",
    capability: "Read-Only (Pull Stats & NAP)",
    authType: "API Key",
    connected: false,
    hasCredentials: false,
    credentialSource: "none",
    accountLabel: "Not configured",
    lastPulled: "Never",
    directoriesCovered: ["Yelp for Business"],
    locationsMatched: 0,
    endpointDoc: "api.yelp.com/v3/businesses/matches",
  },
  {
    id: "facebook-graph",
    name: "Meta / Facebook Pages Graph API",
    provider: "Meta Business Suite",
    capability: "Read & Write (Bi-directional)",
    authType: "OAuth 2.0",
    connected: false,
    hasCredentials: false,
    credentialSource: "none",
    accountLabel: "Not configured",
    lastPulled: "Never",
    directoriesCovered: ["Facebook Business Page", "Instagram Map Tag"],
    locationsMatched: 0,
    endpointDoc: "graph.facebook.com/v20.0/{page-id}",
  },
  {
    id: "apple-connect",
    name: "Apple Business Connect API",
    provider: "Apple Business Register",
    capability: "Read & Write (Bi-directional)",
    authType: "OAuth 2.0",
    connected: false,
    hasCredentials: false,
    credentialSource: "none",
    accountLabel: "Not configured",
    lastPulled: "Never",
    directoriesCovered: ["Apple Maps", "Siri Local Search", "Apple Wallet Place Card"],
    locationsMatched: 0,
    endpointDoc: "api.businessconnect.apple.com/v1/locations",
  },
  {
    id: "bing-sync",
    name: "Bing Places (Google Auto-Import)",
    provider: "Microsoft Bing Places",
    capability: "Auto-Import from Google",
    authType: "Google Sync",
    connected: false,
    hasCredentials: false,
    credentialSource: "none",
    accountLabel: "Not configured",
    lastPulled: "Never",
    directoriesCovered: ["Bing Places", "DuckDuckGo Maps", "Yahoo Local Feed"],
    locationsMatched: 0,
    endpointDoc: "bingplaces.com/Dashboard/GoogleImport",
  },
  {
    id: "trustpilot-api",
    name: "Trustpilot Business API",
    provider: "Trustpilot Business",
    capability: "Read-Only (Pull Stats & NAP)",
    authType: "API Key",
    connected: false,
    hasCredentials: false,
    credentialSource: "none",
    accountLabel: "Not configured",
    lastPulled: "Never",
    directoriesCovered: ["Trustpilot"],
    locationsMatched: 0,
    endpointDoc: "api.trustpilot.com/v1/business-units",
  },
  {
    id: "dataforseo-scanner",
    name: "DataForSEO Citation & NAP Scanner API",
    provider: "DataForSEO Business Data API",
    capability: "Automated Citation Audit",
    authType: "API Key",
    connected: false,
    hasCredentials: false,
    credentialSource: "none",
    accountLabel: "Not configured",
    lastPulled: "Never",
    directoriesCovered: [
      "EZlocal",
      "YellowPages",
      "BBB",
      "Foursquare",
      "MapQuest",
      "Manta",
      "Superpages",
    ],
    locationsMatched: 0,
    endpointDoc: "api.dataforseo.com/v3/business_data/business_listings",
  },
];
