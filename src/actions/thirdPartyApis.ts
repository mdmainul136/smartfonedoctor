"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminGuard";
import { Prisma, enum_reviews_source, enum_reviews_store } from "@prisma/client";
import {
  INITIAL_API_CONNECTORS,
  INITIAL_DIRECTORIES,
  createUnverifiedStores,
  type ApiConnector,
  type DirectoryListing,
  type DirectoryTier,
  type ListingStatus,
  type StoreListingEntry,
  type SyncMode,
} from "@/lib/listingsData";
import {
  fetchGooglePlaceLive,
  fetchYelpStoreLive,
  fetchMetaPagesLive,
  fetchTrustpilotLive,
  fetchDataForSeoListingsLive,
  resolveValidGbpAccessToken,
  verifyGbpOAuthLive,
  verifyAppleConnectLive,
  verifyBingPlacesKeyLive,
  checkUrlReachableLive,
  PHILLY_STORES,
  type ExternalLiveReview,
} from "@/lib/externalApis";

export interface ApiConnectorUpdateInput {
  id: string;
  connected?: boolean;
  apiKey?: string;
  accountLabel?: string;
  autoSync?: boolean;
}

const KNOWN_AUTHORITY = new Map(
  INITIAL_DIRECTORIES.map((d) => [d.id, d.authority])
);

const KNOWN_API_PROVIDER = new Map(
  INITIAL_DIRECTORIES.filter((d) => d.apiProviderId).map((d) => [d.id, d.apiProviderId!])
);

const STORE_CODE_TO_ID: Record<string, number> = {
  nd_st: 1,
  lancaster_4016: 2,
  lancaster_4060: 3,
};

const STORE_ID_TO_REVIEW_ENUM: Record<number, enum_reviews_store> = {
  1: enum_reviews_store.nd_st,
  2: enum_reviews_store.lancaster_4016,
  3: enum_reviews_store.lancaster_4060,
};

const VALID_LISTING_STATUSES = new Set<ListingStatus>(["Synced", "Mismatch", "Missing"]);

function cleanSecret(val: string | null | undefined): string | undefined {
  const s = val?.trim();
  if (!s || s.includes("••")) return undefined;
  return s;
}

function formatSyncTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resolveConnectorCredentials(c: {
  id: string;
  apiKeyEncrypted?: string | null;
  apiSecretEncrypted?: string | null;
}): {
  hasCredentials: boolean;
  source: "database" | "env" | "none";
  primaryKey?: string;
  secondarySecret?: string;
  googleApiKey?: string;
} {
  const dbKey = cleanSecret(c.apiKeyEncrypted);
  const dbSecret = cleanSecret(c.apiSecretEncrypted);

  if (c.id === "google-gbp") {
    const envMapsKey = cleanSecret(
      process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY
    );
    const envAccess = cleanSecret(process.env.GOOGLE_GBP_ACCESS_TOKEN);
    const envRefresh = cleanSecret(process.env.GOOGLE_GBP_REFRESH_TOKEN);
    const googleApiKey =
      (dbKey && !dbKey.startsWith("ya29.") && !dbKey.startsWith("1//") ? dbKey : undefined) ||
      envMapsKey;
    const hasOauth =
      Boolean(dbKey && (dbKey.startsWith("ya29.") || dbKey.startsWith("1//"))) ||
      Boolean(dbSecret) ||
      Boolean(envAccess || envRefresh);

    if (dbKey || dbSecret) {
      return {
        hasCredentials: true,
        source: "database",
        primaryKey: dbKey || envMapsKey,
        secondarySecret: dbSecret || envRefresh,
        googleApiKey,
      };
    }
    if (envMapsKey || hasOauth) {
      return {
        hasCredentials: true,
        source: "env",
        primaryKey: envMapsKey || envAccess || envRefresh,
        secondarySecret: envRefresh,
        googleApiKey: envMapsKey,
      };
    }
    return { hasCredentials: false, source: "none" };
  }

  let envKey: string | undefined;
  if (c.id === "yelp-fusion") envKey = cleanSecret(process.env.YELP_API_KEY);
  else if (c.id === "facebook-graph") {
    envKey = cleanSecret(process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN);
  } else if (c.id === "trustpilot-api") {
    envKey = cleanSecret(process.env.TRUSTPILOT_API_KEY);
  } else if (c.id === "dataforseo-scanner") {
    const login = cleanSecret(process.env.DATAFORSEO_LOGIN);
    const pass = cleanSecret(process.env.DATAFORSEO_PASSWORD);
    envKey =
      login && pass ? `${login}:${pass}` : cleanSecret(process.env.DATAFORSEO_API_KEY);
  } else if (c.id === "apple-connect") {
    envKey = cleanSecret(process.env.APPLE_BUSINESS_CONNECT_TOKEN);
  } else if (c.id === "bing-sync") {
    envKey = cleanSecret(process.env.BING_PLACES_API_KEY);
  }

  if (dbKey) {
    return { hasCredentials: true, source: "database", primaryKey: dbKey, secondarySecret: dbSecret };
  }
  if (envKey) {
    return { hasCredentials: true, source: "env", primaryKey: envKey };
  }
  return { hasCredentials: false, source: "none" };
}

async function mergeExternalReviewsToHub(liveReviews: ExternalLiveReview[]): Promise<number> {
  if (liveReviews.length === 0) return 0;

  const row = await prisma.taxonomyStore.findUnique({ where: { id: "reviews-hub" } });
  type HubReview = {
    id: number;
    reviewer: string;
    deviceService: string;
    topicTag: string;
    rating: number;
    date: string;
    text: string;
    storeId: number;
    platform: "Google" | "Yelp" | "Trustpilot" | "Facebook";
    featuredOnSite?: boolean;
    externalReviewName?: string;
    reply?: { text: string; date: string };
  };

  let reviews: HubReview[] = [];
  let sentSmsLeadIds: string[] = [];
  if (row && row.data && typeof row.data === "object") {
    const raw = row.data as unknown as { reviews?: HubReview[]; sentSmsLeadIds?: string[] };
    if (Array.isArray(raw.reviews)) reviews = raw.reviews;
    if (Array.isArray(raw.sentSmsLeadIds)) sentSmsLeadIds = raw.sentSmsLeadIds;
  }

  let addedCount = 0;
  for (const ext of liveReviews) {
    const exists = reviews.some(
      (r) =>
        r.storeId === ext.storeId &&
        r.platform === ext.platform &&
        r.reviewer.trim().toLowerCase() === ext.reviewer.trim().toLowerCase()
    );
    if (exists) continue;

    const created = await prisma.reviews
      .create({
        data: {
          customer_name: ext.reviewer,
          rating: new Prisma.Decimal(ext.rating),
          review_text: ext.text,
          store: STORE_ID_TO_REVIEW_ENUM[ext.storeId] || enum_reviews_store.nd_st,
          source:
            ext.platform === "Yelp" ? enum_reviews_source.yelp : enum_reviews_source.google,
          published: ext.rating >= 4,
        },
      })
      .catch(() => null);

    const maxId = reviews.reduce((m, r) => Math.max(m, r.id), 0);
    const nextId =
      created && !reviews.some((r) => r.id === created.id) ? created.id : maxId + 1;

    reviews = [
      {
        id: nextId,
        reviewer: ext.reviewer,
        deviceService: `${ext.platform} Live Review`,
        topicTag: "Live API Sync",
        rating: ext.rating,
        date: ext.date,
        text: ext.text,
        storeId: ext.storeId,
        platform: ext.platform,
        featuredOnSite: ext.rating >= 4,
        externalReviewName: ext.externalReviewName,
      },
      ...reviews,
    ];
    addedCount += 1;
  }

  if (addedCount > 0) {
    await prisma.taxonomyStore.upsert({
      where: { id: "reviews-hub" },
      update: { data: { reviews, sentSmsLeadIds } as unknown as Prisma.InputJsonValue },
      create: {
        id: "reviews-hub",
        data: { reviews, sentSmsLeadIds } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  return addedCount;
}

function mapConnectorRow(c: {
  id: string;
  name: string;
  provider: string;
  capability: string;
  authType: string;
  connected: boolean;
  accountLabel: string | null;
  lastPulled: string | null;
  directoriesCovered: string[];
  locationsMatched: number;
  endpointDoc: string;
  apiKeyEncrypted?: string | null;
  apiSecretEncrypted?: string | null;
}): ApiConnector {
  const cred = resolveConnectorCredentials(c);
  const isActuallyConnected = Boolean(
    cred.hasCredentials && (c.connected || cred.source === "env")
  );
  const cleanLabel =
    isActuallyConnected
      ? c.accountLabel && c.accountLabel !== "Not configured"
        ? c.accountLabel
        : cred.source === "env"
        ? "Configured via environment variable"
        : "Connected via saved API credentials"
      : "Not configured";

  return {
    id: c.id,
    name: c.name,
    provider: c.provider,
    capability: c.capability as ApiConnector["capability"],
    authType: c.authType as ApiConnector["authType"],
    connected: isActuallyConnected,
    hasCredentials: cred.hasCredentials,
    credentialSource: cred.source,
    accountLabel: cleanLabel,
    lastPulled: isActuallyConnected ? c.lastPulled || "Never" : "Never",
    directoriesCovered: c.directoriesCovered || [],
    locationsMatched: isActuallyConnected ? c.locationsMatched : 0,
    endpointDoc: c.endpointDoc,
  };
}

function normalizeDirectoryStores(rawStores: Prisma.JsonValue): Record<number, StoreListingEntry> {
  const fallback = createUnverifiedStores();
  if (!rawStores || typeof rawStores !== "object" || Array.isArray(rawStores)) {
    return fallback;
  }
  const source = rawStores as Record<string, unknown>;
  const result: Record<number, StoreListingEntry> = {};

  for (const sid of [1, 2, 3]) {
    const rawEntry = source[String(sid)];
    if (!rawEntry || typeof rawEntry !== "object") {
      result[sid] = fallback[sid];
      continue;
    }
    const e = rawEntry as Omit<Partial<StoreListingEntry>, "status"> & {
      status?: string;
      note?: string;
    };
    const status = e.status && VALID_LISTING_STATUSES.has(e.status as ListingStatus)
      ? (e.status as ListingStatus)
      : "Missing";

    if (e.status === "unchecked") {
      result[sid] = fallback[sid];
      continue;
    }

    result[sid] = {
      status,
      napMatch: typeof e.napMatch === "number" ? e.napMatch : status === "Synced" ? 100 : 0,
      rating: typeof e.rating === "number" ? e.rating : null,
      reviewsCount: typeof e.reviewsCount === "number" ? e.reviewsCount : undefined,
      url: typeof e.url === "string" ? e.url : "",
      lastSynced: e.lastSynced || "Never",
      issue: e.issue || (status === "Missing" ? "Not yet synced — connect API or verify manually" : undefined),
    };
  }

  return result;
}

function mapDirectoryRow(d: {
  id: string;
  name: string;
  domain: string;
  tier: string;
  category: string;
  syncMode: string;
  apiProviderId: string | null;
  portalUrl: string | null;
  stores: Prisma.JsonValue;
  overallNapMatch: number;
}): DirectoryListing {
  return {
    id: d.id,
    name: d.name,
    domain: d.domain,
    category: d.category,
    tier: d.tier as DirectoryTier,
    authority: KNOWN_AUTHORITY.get(d.id) ?? 75,
    syncMode: d.syncMode as SyncMode,
    claimPortalUrl: d.portalUrl || `https://${d.domain}`,
    apiProviderId: d.apiProviderId || KNOWN_API_PROVIDER.get(d.id),
    stores: normalizeDirectoryStores(d.stores),
  };
}

async function ensureThirdPartySeeded(): Promise<void> {
  const [connCount, dirCount] = await Promise.all([
    prisma.apiConnector.count(),
    prisma.directoryListing.count(),
  ]);

  if (connCount === 0) {
    for (const conn of INITIAL_API_CONNECTORS) {
      await prisma.apiConnector.upsert({
        where: { id: conn.id },
        update: {},
        create: {
          id: conn.id,
          name: conn.name,
          provider: conn.provider,
          capability: conn.capability,
          authType: conn.authType,
          connected: false,
          accountLabel: "Not configured",
          lastPulled: "Never",
          endpointDoc: conn.endpointDoc,
          locationsMatched: 0,
          directoriesCovered: conn.directoriesCovered,
        },
      });
    }
  }

  if (dirCount === 0) {
    for (const dir of INITIAL_DIRECTORIES) {
      await prisma.directoryListing.upsert({
        where: { id: dir.id },
        update: {},
        create: {
          id: dir.id,
          name: dir.name,
          domain: dir.domain,
          tier: dir.tier,
          category: dir.category,
          syncMode: dir.syncMode,
          apiProviderId: dir.apiProviderId || null,
          portalUrl: dir.claimPortalUrl,
          stores: createUnverifiedStores() as unknown as Prisma.InputJsonValue,
          overallNapMatch: 0,
        },
      });
    }
  }
}

/**
 * Fetch all third-party API connectors with truthful credential detection.
 */
export async function getApiConnectorsAction(): Promise<{
  success: boolean;
  connectors: ApiConnector[];
  error?: string;
}> {
  try {
    await requireAdmin();
    await ensureThirdPartySeeded();
    const rows = await prisma.apiConnector.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { success: true, connectors: rows.map(mapConnectorRow) };
  } catch (err: unknown) {
    console.error("Failed to fetch API connectors:", err);
    return {
      success: false,
      connectors: [],
      error: err instanceof Error ? err.message : "Database error",
    };
  }
}

/**
 * Save real credentials or disconnect a third-party API connector.
 */
export async function toggleConnectorStatusAction(input: ApiConnectorUpdateInput) {
  try {
    await requireAdmin();
    await ensureThirdPartySeeded();
    const connector = await prisma.apiConnector.findUnique({ where: { id: input.id } });
    if (!connector) return { success: false, error: "Connector not found" };

    const nextConnected =
      input.connected !== undefined ? input.connected : !connector.connected;

    if (!nextConnected) {
      const updated = await prisma.apiConnector.update({
        where: { id: input.id },
        data: {
          connected: false,
          accountLabel: "Not configured",
          apiKeyEncrypted: null,
          apiSecretEncrypted: null,
          lastPulled: "Never",
          locationsMatched: 0,
        },
      });

      await prisma.apiSyncLog.create({
        data: {
          connectorId: input.id,
          action: "API_DISCONNECTED",
          status: "Warning",
          itemsSynced: 0,
          message: `Cleared saved credentials and disconnected ${updated.name}`,
        },
      });

      revalidatePath("/admin/listings");
      revalidatePath("/admin/listings/api-sync");
      revalidatePath("/admin/listings/ai-visibility");
      return { success: true, connector: mapConnectorRow(updated) };
    }

    const incomingKey = cleanSecret(input.apiKey);
    const existingCred = resolveConnectorCredentials(connector);
    const hasAnyKey = Boolean(incomingKey || existingCred.hasCredentials);

    if (!hasAnyKey) {
      return {
        success: false,
        needsApiKey: true,
        error: `Cannot connect ${connector.name} without a valid API key or OAuth token.`,
      };
    }

    const cleanLabel =
      input.accountLabel?.trim() &&
      input.accountLabel.trim() !== "Not configured"
        ? input.accountLabel.trim()
        : existingCred.source === "env" && !incomingKey
        ? "Configured via environment variable"
        : "API Key Configured";

    const updated = await prisma.apiConnector.update({
      where: { id: input.id },
      data: {
        connected: true,
        accountLabel: cleanLabel,
        ...(incomingKey ? { apiKeyEncrypted: incomingKey } : {}),
        lastPulled: connector.lastPulled || "Saved — click Pull to verify",
      },
    });

    await prisma.apiSyncLog.create({
      data: {
        connectorId: input.id,
        action: "API_CONFIGURED",
        status: "Success",
        itemsSynced: updated.locationsMatched,
        message: `Saved credentials for ${updated.name}`,
      },
    });

    revalidatePath("/admin/listings");
    revalidatePath("/admin/listings/api-sync");
    revalidatePath("/admin/listings/ai-visibility");
    return { success: true, connector: mapConnectorRow(updated) };
  } catch (err: unknown) {
    console.error("Failed to toggle connector:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

async function updateDirectoryStoresFromLivePull(
  dirId: string,
  entriesByStore: Map<
    number,
    {
      napMatch: number;
      rating?: number | null;
      reviewsCount?: number;
      url?: string;
      issue?: string;
    }
  >,
  syncLabel: string,
  fallbackUrl: string
) {
  const dir = await prisma.directoryListing.findUnique({ where: { id: dirId } });
  if (!dir) return;

  const cur = normalizeDirectoryStores(dir.stores);
  const nextStores: Record<number, StoreListingEntry> = { ...cur };

  for (const [sid, r] of entriesByStore.entries()) {
    const prev = cur[sid] ?? { status: "Missing", napMatch: 0, rating: null, url: "" };
    nextStores[sid] = {
      ...prev,
      status: r.napMatch >= 90 ? "Synced" : "Mismatch",
      napMatch: r.napMatch,
      rating: r.rating !== undefined ? r.rating : prev.rating,
      reviewsCount: r.reviewsCount !== undefined ? r.reviewsCount : prev.reviewsCount,
      url: r.url || prev.url || dir.portalUrl || fallbackUrl,
      lastSynced: syncLabel,
      issue: r.issue ?? (r.napMatch < 90 ? `NAP address or phone mismatch on ${dir.name}` : undefined),
    };
  }

  const vals = Object.values(nextStores);
  const avgNap = vals.length
    ? Math.round(vals.reduce((a, b) => a + (b.napMatch ?? 0), 0) / vals.length)
    : 0;

  await prisma.directoryListing.update({
    where: { id: dirId },
    data: {
      stores: nextStores as unknown as Prisma.InputJsonValue,
      overallNapMatch: avgNap,
    },
  });
}

/**
 * Trigger a real live HTTP pull for a connector. Never fakes Synced / 100% when credentials are missing or invalid.
 */
export async function triggerApiPullAction(connectorId: string): Promise<{
  success: boolean;
  needsApiKey?: boolean;
  liveSynced?: boolean;
  newReviewsAdded?: number;
  warningMessage?: string;
  error?: string;
  connector?: ApiConnector;
  log?: unknown;
}> {
  try {
    await requireAdmin();
    await ensureThirdPartySeeded();
    const connector = await prisma.apiConnector.findUnique({ where: { id: connectorId } });
    if (!connector) return { success: false, error: "Connector not found" };

    const cred = resolveConnectorCredentials(connector);
    if (!cred.hasCredentials) {
      const normalizedConn = await prisma.apiConnector.update({
        where: { id: connectorId },
        data: {
          connected: false,
          accountLabel: "Not configured",
          locationsMatched: 0,
        },
      });

      const log = await prisma.apiSyncLog.create({
        data: {
          connectorId,
          action: "PULL_SKIPPED",
          status: "Warning",
          itemsSynced: 0,
          message: `Skipped pull: No API key or OAuth token configured for ${connector.name}.`,
        },
      });

      revalidatePath("/admin/listings/api-sync");
      return {
        success: false,
        needsApiKey: true,
        liveSynced: false,
        connector: mapConnectorRow(normalizedConn),
        log,
        error: `No API key or OAuth token configured for ${connector.name}. Click Configure to add real credentials.`,
      };
    }

    const syncTimeLabel = formatSyncTimestamp();
    let liveSynced = false;
    let locationsMatched = 0;
    let newReviewsAdded = 0;
    let errorMsg: string | undefined;
    let successMsg = "";

    if (connectorId === "google-gbp") {
      const existingProfiles = await prisma.gmbProfile.findMany();
      const existingPlaceIdByStore = new Map<number, string | null>();
      for (const p of existingProfiles) {
        const sid = STORE_CODE_TO_ID[p.storeCode];
        if (sid) existingPlaceIdByStore.set(sid, p.googlePlaceId);
      }

      if (cred.googleApiKey) {
        const results = await Promise.all(
          [1, 2, 3].map((sid) =>
            fetchGooglePlaceLive(cred.googleApiKey!, sid, existingPlaceIdByStore.get(sid))
          )
        );
        const liveByStore = new Map(
          results.filter((r) => r.success).map((r) => [r.storeId, r])
        );
        const allLiveReviews = results.flatMap((r) => (r.success ? r.reviews : []));
        newReviewsAdded = await mergeExternalReviewsToHub(allLiveReviews);

        if (liveByStore.size > 0) {
          liveSynced = true;
          locationsMatched = liveByStore.size;
          for (const [sid, r] of liveByStore.entries()) {
            const storeCode = PHILLY_STORES[sid]?.storeCode || "nd_st";
            await prisma.gmbProfile
              .updateMany({
                where: { storeCode },
                data: {
                  ...(r.placeId ? { googlePlaceId: r.placeId } : {}),
                  ...(r.rating != null ? { rating: r.rating } : {}),
                  ...(r.reviewsCount != null ? { reviewsCount: r.reviewsCount } : {}),
                },
              })
              .catch(() => {});

            await prisma.locations
              .updateMany({
                where: { store_code: storeCode },
                data: {
                  ...(r.rating != null ? { google_rating: r.rating } : {}),
                  ...(r.reviewsCount != null ? { total_reviews: r.reviewsCount } : {}),
                  ...(r.mapsUrl ? { google_maps_url: r.mapsUrl } : {}),
                },
              })
              .catch(() => {});
          }

          await updateDirectoryStoresFromLivePull(
            "gmb",
            liveByStore,
            `Live Google API (${syncTimeLabel})`,
            "https://business.google.com"
          );
          successMsg = `Pulled ${locationsMatched} Philadelphia location(s) & ${newReviewsAdded} new review(s) from Google Places API.`;
        } else {
          errorMsg =
            results.map((r) => r.error).find(Boolean) ||
            "Google Places API returned 0 matching locations.";
        }
      }

      // If no Places key succeeded, attempt real GBP OAuth API check
      if (!liveSynced) {
        const oauthRes = await resolveValidGbpAccessToken(
          connector.apiKeyEncrypted,
          connector.apiSecretEncrypted
        );
        if (oauthRes.accessToken) {
          const verified = await verifyGbpOAuthLive(oauthRes.accessToken);
          if (verified.ok) {
            liveSynced = true;
            locationsMatched = verified.locationsMatched;
            const byStoreMap = new Map(
              Object.entries(verified.byStore).map(([sid, v]) => [Number(sid), v])
            );
            if (byStoreMap.size > 0) {
              await updateDirectoryStoresFromLivePull(
                "gmb",
                byStoreMap,
                `Live GBP OAuth (${syncTimeLabel})`,
                "https://business.google.com"
              );
            }
            successMsg = `Verified Google OAuth (${verified.accountCount} account(s), ${verified.locationsMatched} matched location(s)).`;
            errorMsg = undefined;
          } else {
            errorMsg = verified.error || errorMsg;
          }
        } else if (!errorMsg) {
          errorMsg = oauthRes.error || "Missing Google Places API key or valid GBP OAuth token.";
        }
      }
    } else if (connectorId === "yelp-fusion" && cred.primaryKey) {
      const results = await Promise.all(
        [1, 2, 3].map((sid) => fetchYelpStoreLive(cred.primaryKey!, sid))
      );
      const liveByStore = new Map(
        results.filter((r) => r.success).map((r) => [r.storeId, r])
      );
      const allLiveReviews = results.flatMap((r) => (r.success ? r.reviews : []));
      newReviewsAdded = await mergeExternalReviewsToHub(allLiveReviews);

      if (liveByStore.size > 0) {
        liveSynced = true;
        locationsMatched = liveByStore.size;
        await updateDirectoryStoresFromLivePull(
          "yelp",
          liveByStore,
          `Live Yelp Fusion API (${syncTimeLabel})`,
          "https://www.yelp.com"
        );
        successMsg = `Pulled ${locationsMatched} store listing(s) & ${newReviewsAdded} new review(s) from Yelp Fusion API.`;
      } else {
        errorMsg =
          results.map((r) => r.error).find(Boolean) ||
          "Yelp Fusion API returned 0 matching listings.";
      }
    } else if (connectorId === "facebook-graph" && cred.primaryKey) {
      const metaRes = await fetchMetaPagesLive(cred.primaryKey);
      if (metaRes.success && metaRes.pagesMatched > 0) {
        liveSynced = true;
        locationsMatched = metaRes.pagesMatched;
        const byStoreMap = new Map(
          Object.entries(metaRes.byStore).map(([sid, v]) => [Number(sid), v])
        );
        await updateDirectoryStoresFromLivePull(
          "facebook",
          byStoreMap,
          `Live Meta Graph API (${syncTimeLabel})`,
          "https://www.facebook.com"
        );
        successMsg = `Synced ${locationsMatched} Facebook Page(s) (${metaRes.accountName || "Meta Graph"}).`;
      } else {
        errorMsg = metaRes.error || "Meta Graph API pull failed.";
      }
    } else if (connectorId === "trustpilot-api" && cred.primaryKey) {
      const tpRes = await fetchTrustpilotLive(cred.primaryKey, "smartfonedoctor.com");
      if (tpRes.success) {
        liveSynced = true;
        locationsMatched = 3;
        const domainMap = new Map([
          [
            1,
            {
              napMatch: 100,
              rating: tpRes.rating ?? null,
              reviewsCount: tpRes.reviewsCount,
              url: tpRes.url,
            },
          ],
          [
            2,
            {
              napMatch: 100,
              rating: tpRes.rating ?? null,
              reviewsCount: tpRes.reviewsCount,
              url: tpRes.url,
            },
          ],
          [
            3,
            {
              napMatch: 100,
              rating: tpRes.rating ?? null,
              reviewsCount: tpRes.reviewsCount,
              url: tpRes.url,
            },
          ],
        ]);
        await updateDirectoryStoresFromLivePull(
          "trustpilot",
          domainMap,
          `Live Trustpilot API (${syncTimeLabel})`,
          "https://www.trustpilot.com"
        );
        successMsg = `Pulled Trustpilot rating (${tpRes.rating ?? "N/A"} / ${tpRes.reviewsCount ?? 0} reviews) for ${tpRes.displayName}.`;
      } else {
        errorMsg = tpRes.error || "Trustpilot Business API lookup failed.";
      }
    } else if (connectorId === "dataforseo-scanner" && cred.primaryKey) {
      const dfsRes = await fetchDataForSeoListingsLive(cred.primaryKey);
      if (dfsRes.success && Object.keys(dfsRes.byStore).length > 0) {
        liveSynced = true;
        locationsMatched = Object.keys(dfsRes.byStore).length;
        const byStoreMap = new Map(
          Object.entries(dfsRes.byStore).map(([sid, v]) => [Number(sid), v])
        );
        for (const dirId of ["ezlocal", "yellowpages"]) {
          await updateDirectoryStoresFromLivePull(
            dirId,
            byStoreMap,
            `Live DataForSEO API (${syncTimeLabel})`,
            `https://${dirId}.com`
          );
        }
        successMsg = `Scanned ${dfsRes.totalFound} DataForSEO listings; matched ${locationsMatched} Philadelphia branch(es).`;
      } else {
        errorMsg = dfsRes.error || "DataForSEO scan returned 0 matched locations.";
      }
    } else if (connectorId === "apple-connect" && cred.primaryKey) {
      const appleRes = await verifyAppleConnectLive(cred.primaryKey);
      if (appleRes.ok) {
        liveSynced = true;
        locationsMatched = appleRes.locationsCount;
        successMsg = `Verified Apple Business Connect token (${appleRes.locationsCount} company record(s)).`;
      } else {
        errorMsg = appleRes.error || "Apple Business Connect API verification failed.";
      }
    } else if (connectorId === "bing-sync" && cred.primaryKey) {
      const bingRes = await verifyBingPlacesKeyLive(cred.primaryKey);
      if (bingRes.ok) {
        liveSynced = true;
        locationsMatched = bingRes.locationsMatched;
        successMsg = `Verified Bing Maps/Places API across ${locationsMatched} Philadelphia address(es).`;
      } else {
        errorMsg = bingRes.error || "Bing Places API verification failed.";
      }
    }

    const updated = await prisma.apiConnector.update({
      where: { id: connectorId },
      data: {
        connected: liveSynced || connector.connected,
        locationsMatched: liveSynced ? locationsMatched : connector.locationsMatched,
        lastPulled: liveSynced ? `Live (${syncTimeLabel})` : connector.lastPulled || "Never",
      },
    });

    const log = await prisma.apiSyncLog.create({
      data: {
        connectorId,
        action: "LIVE_HTTP_API_PULL",
        status: liveSynced ? "Success" : "Failed",
        itemsSynced: liveSynced ? locationsMatched : 0,
        message: liveSynced ? successMsg : errorMsg || `Pull failed for ${connector.name}`,
      },
    });

    revalidatePath("/admin/listings");
    revalidatePath("/admin/listings/api-sync");
    revalidatePath("/admin/listings/ai-visibility");
    revalidatePath("/admin/reviews");
    revalidatePath("/admin/local-seo");

    return {
      success: liveSynced,
      liveSynced,
      newReviewsAdded,
      connector: mapConnectorRow(updated),
      log,
      ...(liveSynced ? {} : { error: errorMsg || `Live pull failed for ${connector.name}` }),
    };
  } catch (err: unknown) {
    console.error("Failed to trigger API pull:", err);
    return { success: false, error: err instanceof Error ? err.message : "API pull failed" };
  }
}

/**
 * Fetch all directory listings from PostgreSQL
 */
export async function getDirectoryListingsAction(): Promise<{
  success: boolean;
  directories: DirectoryListing[];
  error?: string;
}> {
  try {
    await ensureThirdPartySeeded();
    const rows = await prisma.directoryListing.findMany({
      orderBy: { overallNapMatch: "desc" },
    });
    return { success: true, directories: rows.map(mapDirectoryRow) };
  } catch (err: unknown) {
    console.error("Failed to fetch directory listings:", err);
    return {
      success: false,
      directories: [],
      error: err instanceof Error ? err.message : "Database error",
    };
  }
}

/**
 * Create or update a directory listing and its per-store NAP status in PostgreSQL
 */
export async function upsertDirectoryListingAction(dir: DirectoryListing): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireAdmin();
    const entries = Object.values(dir.stores || {});
    const avgNap = entries.length
      ? Math.round(entries.reduce((acc, e) => acc + (e?.napMatch ?? 0), 0) / entries.length)
      : 0;

    await prisma.directoryListing.upsert({
      where: { id: dir.id },
      update: {
        name: dir.name,
        domain: dir.domain,
        tier: dir.tier,
        category: dir.category,
        syncMode: dir.syncMode,
        apiProviderId: dir.apiProviderId || null,
        portalUrl: dir.claimPortalUrl,
        stores: dir.stores as unknown as Prisma.InputJsonValue,
        overallNapMatch: avgNap,
      },
      create: {
        id: dir.id,
        name: dir.name,
        domain: dir.domain,
        tier: dir.tier,
        category: dir.category,
        syncMode: dir.syncMode,
        apiProviderId: dir.apiProviderId || null,
        portalUrl: dir.claimPortalUrl,
        stores: dir.stores as unknown as Prisma.InputJsonValue,
        overallNapMatch: avgNap,
      },
    });

    revalidatePath("/admin/listings");
    revalidatePath("/admin/listings/catalog");
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to upsert directory listing:", err);
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}

/**
 * Run a real NAP audit: pulls any connected APIs and HTTP-verifies claimed listing URLs.
 */
export async function auditAllDirectoriesNapAction(storeId?: number): Promise<{
  success: boolean;
  connectorsPulled: number;
  urlsChecked: number;
  reachableCount: number;
  unreachableCount: number;
  message: string;
  error?: string;
}> {
  try {
    await requireAdmin();
    await ensureThirdPartySeeded();

    // 1. Pull any connectors that actually have real credentials configured
    const allConns = await prisma.apiConnector.findMany();
    let connectorsPulled = 0;
    for (const c of allConns) {
      const cred = resolveConnectorCredentials(c);
      if (cred.hasCredentials) {
        const res = await triggerApiPullAction(c.id);
        if (res.success) connectorsPulled += 1;
      }
    }

    // 2. HTTP-verify any claimed non-empty listing URLs without faking unverified rows
    const dirs = await prisma.directoryListing.findMany();
    const targetStores = storeId ? [storeId] : [1, 2, 3];
    const syncStamp = formatSyncTimestamp();
    let urlsChecked = 0;
    let reachableCount = 0;
    let unreachableCount = 0;

    for (const dir of dirs) {
      const normalized = normalizeDirectoryStores(dir.stores);
      let mutated = false;

      for (const sid of targetStores) {
        const entry = normalized[sid];
        if (!entry || !entry.url?.trim()) continue;
        urlsChecked += 1;
        const probe = await checkUrlReachableLive(entry.url);
        mutated = true;
        if (probe.reachable) {
          reachableCount += 1;
          normalized[sid] = {
            ...entry,
            lastSynced: `HTTP Verified (${syncStamp})`,
            issue: entry.status === "Mismatch" ? entry.issue : undefined,
          };
        } else {
          unreachableCount += 1;
          normalized[sid] = {
            ...entry,
            lastSynced: `HTTP Failed (${syncStamp})`,
            issue: probe.error || `Listing URL returned HTTP ${probe.status}`,
          };
        }
      }

      if (mutated) {
        await prisma.directoryListing.update({
          where: { id: dir.id },
          data: { stores: normalized as unknown as Prisma.InputJsonValue },
        });
      }
    }

    const summaryMsg = `Audited ${dirs.length} directories: pulled ${connectorsPulled} connected API(s), checked ${urlsChecked} claimed URL(s) (${reachableCount} reachable, ${unreachableCount} failed).`;

    await prisma.apiSyncLog
      .create({
        data: {
          connectorId: "dataforseo-scanner",
          action: "NAP_HTTP_AUDIT",
          status: unreachableCount > 0 ? "Warning" : "Success",
          itemsSynced: connectorsPulled + reachableCount,
          message: summaryMsg,
        },
      })
      .catch(() => {});

    revalidatePath("/admin/listings");
    revalidatePath("/admin/listings/api-sync");
    revalidatePath("/admin/listings/ai-visibility");

    return {
      success: true,
      connectorsPulled,
      urlsChecked,
      reachableCount,
      unreachableCount,
      message: summaryMsg,
    };
  } catch (err: unknown) {
    console.error("Failed to audit directories:", err);
    return {
      success: false,
      connectorsPulled: 0,
      urlsChecked: 0,
      reachableCount: 0,
      unreachableCount: 0,
      message: "Audit failed",
      error: err instanceof Error ? err.message : "Audit failed",
    };
  }
}

/**
 * Fetch recent sync logs (newest first)
 */
export async function getApiSyncLogsAction(connectorId?: string) {
  try {
    await requireAdmin();
    const where = connectorId ? { connectorId } : {};
    const rows = await prisma.apiSyncLog.findMany({
      where,
      include: { connector: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    const logs = rows.map((r) => ({
      id: r.id,
      connectorId: r.connectorId,
      connectorName: r.connector.name,
      action: r.action,
      status: r.status,
      itemsSynced: r.itemsSynced,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
    }));
    return { success: true, logs };
  } catch (err: unknown) {
    console.error("Failed to fetch sync logs:", err);
    return { success: false, logs: [] };
  }
}
