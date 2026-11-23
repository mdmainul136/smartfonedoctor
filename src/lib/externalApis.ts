// Server-side outbound HTTP clients for Google Places API, Google Business Profile OAuth API,
// Yelp Fusion v3 API, Meta Graph API, Trustpilot API, DataForSEO API, and Twilio REST SMS API.

export interface StoreMeta {
  storeId: number;
  storeCode: string;
  name: string;
  address: string;
  streetNumber: string;
  phoneDigits: string;
}

export const PHILLY_STORES: Record<number, StoreMeta> = {
  1: {
    storeId: 1,
    storeCode: "nd_st",
    name: "Smart Fone Doctor",
    address: "33 S 52nd St, Philadelphia, PA 19139",
    streetNumber: "33",
    phoneDigits: "2155982090",
  },
  2: {
    storeId: 2,
    storeCode: "lancaster_4016",
    name: "Smart Fone Doctor",
    address: "4016 Lancaster Ave, Philadelphia, PA 19104",
    streetNumber: "4016",
    phoneDigits: "2155982090",
  },
  3: {
    storeId: 3,
    storeCode: "lancaster_4060",
    name: "Smart Fone Doctor",
    address: "4060 Lancaster Ave, Philadelphia, PA 19104",
    streetNumber: "4060",
    phoneDigits: "2155982090",
  },
};

export interface ExternalLiveReview {
  reviewer: string;
  rating: number;
  text: string;
  date: string;
  platform: "Google" | "Yelp";
  storeId: number;
  externalReviewName?: string;
}

export interface LivePlaceFetchResult {
  success: boolean;
  storeId: number;
  placeId?: string;
  rating?: number;
  reviewsCount?: number;
  mapsUrl?: string;
  napMatch: number;
  reviews: ExternalLiveReview[];
  error?: string;
}

function computeNapMatch(
  returnedAddress: string | undefined,
  returnedPhone: string | undefined,
  store: StoreMeta
): number {
  let score = 40;
  const addrLower = (returnedAddress || "").toLowerCase();
  if (addrLower.includes(store.streetNumber.toLowerCase())) {
    score += 35;
  } else if (addrLower.includes("philadelphia")) {
    score += 15;
  }
  const digits = (returnedPhone || "").replace(/\D/g, "");
  if (digits.endsWith(store.phoneDigits)) {
    score += 25;
  } else if (digits.length >= 10) {
    score += 10;
  }
  return Math.min(100, score);
}

/**
 * Fetch live Google Business metrics, Place ID, NAP consistency, and latest reviews
 * using Google Places API (New) with fallback to Legacy Places Web Service.
 */
export async function fetchGooglePlaceLive(
  apiKey: string,
  storeId: number,
  existingPlaceId?: string | null
): Promise<LivePlaceFetchResult> {
  const store = PHILLY_STORES[storeId] || PHILLY_STORES[1];
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, storeId, napMatch: 0, reviews: [], error: "Missing Google API key" };
  }

  try {
    // 1. Try Google Places API (New) Text Search
    const searchUrl = "https://places.googleapis.com/v1/places:searchText";
    const fieldMask =
      "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.googleMapsUri,places.reviews";

    type GooglePlaceNew = {
      id?: string;
      formattedAddress?: string;
      nationalPhoneNumber?: string;
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      reviews?: Array<{
        name?: string;
        rating?: number;
        publishTime?: string;
        text?: { text?: string };
        originalText?: { text?: string };
        authorAttribution?: { displayName?: string };
      }>;
    };

    let matchedPlace: GooglePlaceNew | null = null;

    if (existingPlaceId && existingPlaceId.length > 20 && !existingPlaceId.includes("TGxokR")) {
      const detailRes = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(existingPlaceId)}`,
        {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": cleanKey,
            "X-Goog-FieldMask": fieldMask.replace(/places\./g, ""),
          },
          cache: "no-store",
        }
      );
      if (detailRes.ok) {
        matchedPlace = (await detailRes.json()) as GooglePlaceNew;
      }
    }

    let newApiError: string | undefined;
    if (!matchedPlace) {
      const res = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": cleanKey,
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify({
          textQuery: `${store.name} ${store.address}`,
          maxResultCount: 3,
        }),
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as { places?: GooglePlaceNew[] };
        const places = data.places || [];
        matchedPlace =
          places.find((p) =>
            (p.formattedAddress || "").toLowerCase().includes(store.streetNumber)
          ) ||
          places[0] ||
          null;
      } else {
        const errBody = await res.text().catch(() => "");
        newApiError = `Places New API HTTP ${res.status}: ${errBody.slice(0, 160)}`;
      }
    }

    if (matchedPlace) {
      const reviews: ExternalLiveReview[] = (matchedPlace.reviews || [])
        .filter((r) => (r.text?.text || r.originalText?.text) && r.authorAttribution?.displayName)
        .map((r) => ({
          reviewer: r.authorAttribution!.displayName!,
          rating: Math.max(1, Math.min(5, Math.round(r.rating || 5))),
          text: r.text?.text || r.originalText?.text || "",
          date: (r.publishTime || new Date().toISOString()).slice(0, 10),
          platform: "Google",
          storeId,
          externalReviewName: r.name,
        }));

      return {
        success: true,
        storeId,
        placeId: matchedPlace.id,
        rating: matchedPlace.rating,
        reviewsCount: matchedPlace.userRatingCount,
        mapsUrl: matchedPlace.googleMapsUri,
        napMatch: computeNapMatch(
          matchedPlace.formattedAddress,
          matchedPlace.nationalPhoneNumber,
          store
        ),
        reviews,
      };
    }

    // 2. Fallback to Legacy Google Places Web Service API
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      `${store.name} ${store.address}`
    )}&inputtype=textquery&fields=place_id,name,formatted_address&key=${encodeURIComponent(cleanKey)}`;

    const findRes = await fetch(findUrl, { cache: "no-store" });
    const findJson = (await findRes.json()) as {
      status?: string;
      error_message?: string;
      candidates?: Array<{ place_id?: string; formatted_address?: string }>;
    };

    const pid =
      findJson.candidates?.find((c) =>
        (c.formatted_address || "").toLowerCase().includes(store.streetNumber)
      )?.place_id || findJson.candidates?.[0]?.place_id;

    if (!pid) {
      return {
        success: false,
        storeId,
        napMatch: 0,
        reviews: [],
        error:
          findJson.error_message ||
          newApiError ||
          `Google Places returned status ${findJson.status || "NO_RESULTS"}`,
      };
    }

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      pid
    )}&fields=place_id,name,formatted_address,formatted_phone_number,rating,user_ratings_total,url,reviews&key=${encodeURIComponent(
      cleanKey
    )}`;
    const detRes = await fetch(detailsUrl, { cache: "no-store" });
    const detJson = (await detRes.json()) as {
      status?: string;
      error_message?: string;
      result?: {
        place_id?: string;
        formatted_address?: string;
        formatted_phone_number?: string;
        rating?: number;
        user_ratings_total?: number;
        url?: string;
        reviews?: Array<{
          author_name?: string;
          rating?: number;
          text?: string;
          time?: number;
        }>;
      };
    };

    if (!detJson.result) {
      return {
        success: false,
        storeId,
        napMatch: 0,
        reviews: [],
        error: detJson.error_message || `Place details status ${detJson.status || "ERROR"}`,
      };
    }

    const resData = detJson.result;
    const reviews: ExternalLiveReview[] = (resData.reviews || [])
      .filter((r) => r.text && r.author_name)
      .map((r) => ({
        reviewer: r.author_name!,
        rating: Math.max(1, Math.min(5, Math.round(r.rating || 5))),
        text: r.text!,
        date: r.time
          ? new Date(r.time * 1000).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        platform: "Google",
        storeId,
      }));

    return {
      success: true,
      storeId,
      placeId: resData.place_id,
      rating: resData.rating,
      reviewsCount: resData.user_ratings_total,
      mapsUrl: resData.url,
      napMatch: computeNapMatch(
        resData.formatted_address,
        resData.formatted_phone_number,
        store
      ),
      reviews,
    };
  } catch (err) {
    return {
      success: false,
      storeId,
      napMatch: 0,
      reviews: [],
      error: err instanceof Error ? err.message : "Google Places network error",
    };
  }
}

/**
 * Exchange a Google OAuth 2.0 refresh_token for a fresh short-lived access_token
 */
export async function refreshGoogleAccessToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<{ ok: boolean; accessToken?: string; expiresIn?: number; error?: string }> {
  try {
    const form = new URLSearchParams({
      client_id: params.clientId.trim(),
      client_secret: params.clientSecret.trim(),
      refresh_token: params.refreshToken.trim(),
      grant_type: "refresh_token",
    });

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };

    if (!res.ok || !json.access_token) {
      return {
        ok: false,
        error: json.error_description || json.error || `OAuth refresh HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      accessToken: json.access_token,
      expiresIn: json.expires_in,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "OAuth refresh network error",
    };
  }
}

/**
 * Resolve a usable Google Business Profile OAuth Bearer token (`ya29....`),
 * refreshing from a stored refresh token (`1//...`) if configured with GOOGLE_CLIENT_ID/SECRET.
 */
export async function resolveValidGbpAccessToken(
  apiKeyStored: string | null | undefined,
  apiSecretStored: string | null | undefined
): Promise<{ accessToken?: string; refreshed?: boolean; error?: string }> {
  const envAccess = process.env.GOOGLE_GBP_ACCESS_TOKEN?.trim();
  const envRefresh = process.env.GOOGLE_GBP_REFRESH_TOKEN?.trim();
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  const storedKey = apiKeyStored && !apiKeyStored.includes("••") ? apiKeyStored.trim() : undefined;
  const storedSecret =
    apiSecretStored && !apiSecretStored.includes("••") ? apiSecretStored.trim() : undefined;

  const refreshToken =
    (storedKey?.startsWith("1//") ? storedKey : undefined) ||
    (storedSecret?.startsWith("1//") ? storedSecret : undefined) ||
    envRefresh;

  const directAccess =
    (storedKey?.startsWith("ya29.") ? storedKey : undefined) || envAccess;

  if (directAccess) {
    return { accessToken: directAccess, refreshed: false };
  }

  if (refreshToken && clientId && clientSecret) {
    const refreshed = await refreshGoogleAccessToken({ clientId, clientSecret, refreshToken });
    if (refreshed.ok && refreshed.accessToken) {
      return { accessToken: refreshed.accessToken, refreshed: true };
    }
    return { error: refreshed.error };
  }

  return {};
}

/**
 * Push a review reply directly to Google Business Profile OAuth API
 * (auto-retries once with a refreshed token if HTTP 401 and refresh credentials are present)
 */
export async function publishGbpReviewReplyLive(params: {
  accessToken: string;
  externalReviewName: string;
  comment: string;
  refreshToken?: string | null;
}): Promise<{ pushedLive: boolean; status: number; rotatedAccessToken?: string; error?: string }> {
  const sendPut = async (token: string) => {
    const cleanName = params.externalReviewName.replace(/^\/+/, "");
    return fetch(`https://mybusiness.googleapis.com/v4/${cleanName}/reply`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: params.comment }),
      cache: "no-store",
    });
  };

  try {
    let token = params.accessToken;
    let rotatedAccessToken: string | undefined;
    let res = await sendPut(token);

    if (res.status === 401) {
      const refreshTok =
        params.refreshToken?.trim() || process.env.GOOGLE_GBP_REFRESH_TOKEN?.trim();
      const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
      if (refreshTok && clientId && clientSecret) {
        const refreshed = await refreshGoogleAccessToken({
          clientId,
          clientSecret,
          refreshToken: refreshTok,
        });
        if (refreshed.ok && refreshed.accessToken) {
          token = refreshed.accessToken;
          rotatedAccessToken = refreshed.accessToken;
          res = await sendPut(token);
        }
      }
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        pushedLive: false,
        status: res.status,
        rotatedAccessToken,
        error: errText || `GBP reply HTTP ${res.status}`,
      };
    }
    return { pushedLive: true, status: res.status, rotatedAccessToken };
  } catch (err) {
    return {
      pushedLive: false,
      status: 0,
      error: err instanceof Error ? err.message : "GBP network error",
    };
  }
}

/**
 * Publish a Local Post / Offer directly to Google Business Profile OAuth API
 * (auto-retries once with a refreshed token if HTTP 401 and refresh credentials are present)
 */
export async function publishGbpLocalPostLive(params: {
  accessToken: string;
  locationName: string;
  title: string;
  body: string;
  ctaUrl?: string;
  couponCode?: string | null;
  type: "Offer" | "Update";
  refreshToken?: string | null;
}): Promise<{ pushedLive: boolean; status: number; rotatedAccessToken?: string; error?: string }> {
  try {
    const cleanLoc = params.locationName.replace(/^\/+/, "");
    const payload: Record<string, unknown> = {
      languageCode: "en-US",
      summary: `${params.title}\n\n${params.body}`,
      topicType: params.type === "Offer" ? "OFFER" : "STANDARD",
    };
    if (params.ctaUrl) {
      payload.callToAction = {
        actionType: "BOOK",
        url: params.ctaUrl,
      };
    }
    if (params.type === "Offer" && params.couponCode) {
      payload.offer = {
        couponCode: params.couponCode,
      };
    }

    const sendPost = async (token: string) =>
      fetch(`https://mybusiness.googleapis.com/v4/${cleanLoc}/localPosts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

    let token = params.accessToken;
    let rotatedAccessToken: string | undefined;
    let res = await sendPost(token);

    if (res.status === 401) {
      const refreshTok =
        params.refreshToken?.trim() || process.env.GOOGLE_GBP_REFRESH_TOKEN?.trim();
      const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
      if (refreshTok && clientId && clientSecret) {
        const refreshed = await refreshGoogleAccessToken({
          clientId,
          clientSecret,
          refreshToken: refreshTok,
        });
        if (refreshed.ok && refreshed.accessToken) {
          token = refreshed.accessToken;
          rotatedAccessToken = refreshed.accessToken;
          res = await sendPost(token);
        }
      }
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        pushedLive: false,
        status: res.status,
        rotatedAccessToken,
        error: errText || `GBP localPost HTTP ${res.status}`,
      };
    }
    return { pushedLive: true, status: res.status, rotatedAccessToken };
  } catch (err) {
    return {
      pushedLive: false,
      status: 0,
      error: err instanceof Error ? err.message : "GBP post network error",
    };
  }
}

export interface LiveYelpFetchResult {
  success: boolean;
  storeId: number;
  rating?: number;
  reviewsCount?: number;
  url?: string;
  napMatch: number;
  reviews: ExternalLiveReview[];
  error?: string;
}

/**
 * Fetch live business stats, NAP consistency, and latest reviews from Yelp Fusion v3 API
 */
export async function fetchYelpStoreLive(
  apiKey: string,
  storeId: number
): Promise<LiveYelpFetchResult> {
  const store = PHILLY_STORES[storeId] || PHILLY_STORES[1];
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, storeId, napMatch: 0, reviews: [], error: "Missing Yelp API key" };
  }

  try {
    const searchUrl = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(
      store.name
    )}&location=${encodeURIComponent(store.address)}&limit=3`;

    const res = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${cleanKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      return {
        success: false,
        storeId,
        napMatch: 0,
        reviews: [],
        error: `Yelp HTTP ${res.status}: ${errBody.slice(0, 160)}`,
      };
    }

    const data = (await res.json()) as {
      businesses?: Array<{
        id: string;
        name: string;
        url: string;
        rating: number;
        review_count: number;
        phone?: string;
        display_phone?: string;
        location?: { display_address?: string[]; address1?: string };
      }>;
    };

    const businesses = data.businesses || [];
    const biz =
      businesses.find((b) =>
        (b.location?.address1 || b.location?.display_address?.join(" ") || "")
          .toLowerCase()
          .includes(store.streetNumber)
      ) || businesses[0];

    if (!biz) {
      return {
        success: false,
        storeId,
        napMatch: 0,
        reviews: [],
        error: `No Yelp listing matched for ${store.address}`,
      };
    }

    const returnedAddr =
      biz.location?.display_address?.join(", ") || biz.location?.address1 || "";
    const napMatch = computeNapMatch(returnedAddr, biz.phone || biz.display_phone, store);

    const reviews: ExternalLiveReview[] = [];
    const revRes = await fetch(
      `https://api.yelp.com/v3/businesses/${encodeURIComponent(
        biz.id
      )}/reviews?limit=3&sort_by=yelp_sort`,
      {
        headers: {
          Authorization: `Bearer ${cleanKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    ).catch(() => null);

    if (revRes && revRes.ok) {
      const revData = (await revRes.json()) as {
        reviews?: Array<{
          rating?: number;
          text?: string;
          time_created?: string;
          user?: { name?: string };
        }>;
      };
      for (const r of revData.reviews || []) {
        if (r.text && r.user?.name) {
          reviews.push({
            reviewer: r.user.name,
            rating: Math.max(1, Math.min(5, Math.round(r.rating || 5))),
            text: r.text,
            date: (r.time_created || new Date().toISOString()).slice(0, 10),
            platform: "Yelp",
            storeId,
          });
        }
      }
    }

    return {
      success: true,
      storeId,
      rating: biz.rating,
      reviewsCount: biz.review_count,
      url: biz.url,
      napMatch,
      reviews,
    };
  } catch (err) {
    return {
      success: false,
      storeId,
      napMatch: 0,
      reviews: [],
      error: err instanceof Error ? err.message : "Yelp network error",
    };
  }
}

/**
 * Send live SMS review invitation via Twilio REST API
 */
export async function sendTwilioSmsLive(params: {
  to: string;
  body: string;
  accountSid: string;
  authToken: string;
  fromNumber: string;
}): Promise<{ sentLive: boolean; sid?: string; error?: string }> {
  try {
    const digits = params.to.replace(/\D/g, "");
    const e164 =
      digits.length === 10
        ? `+1${digits}`
        : digits.length === 11 && digits.startsWith("1")
        ? `+${digits}`
        : `+${digits}`;

    const creds = Buffer.from(`${params.accountSid}:${params.authToken}`).toString("base64");
    const form = new URLSearchParams({
      To: e164,
      From: params.fromNumber,
      Body: params.body,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
        params.accountSid
      )}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${creds}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
        cache: "no-store",
      }
    );

    const json = (await res.json().catch(() => ({}))) as {
      sid?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        sentLive: false,
        error: json.message || `Twilio HTTP ${res.status}`,
      };
    }

    return { sentLive: true, sid: json.sid };
  } catch (err) {
    return {
      sentLive: false,
      error: err instanceof Error ? err.message : "Twilio network error",
    };
  }
}

export interface LiveMetaPageResult {
  success: boolean;
  accountName?: string;
  pagesMatched: number;
  byStore: Record<
    number,
    {
      napMatch: number;
      rating: number | null;
      reviewsCount?: number;
      url: string;
    }
  >;
  error?: string;
}

/**
 * Fetch live Facebook Page / Business Portfolio details via Meta Graph API v20.0.
 */
export async function fetchMetaPagesLive(accessToken: string): Promise<LiveMetaPageResult> {
  const token = accessToken.trim();
  if (!token) {
    return { success: false, pagesMatched: 0, byStore: {}, error: "Missing Meta Graph access token" };
  }

  type GraphPageNode = {
    id?: string;
    name?: string;
    phone?: string;
    single_line_address?: string;
    overall_star_rating?: number;
    rating_count?: number;
    link?: string;
    website?: string;
  };

  try {
    const fields = "id,name,phone,single_line_address,overall_star_rating,rating_count,link,website";
    const meRes = await fetch(
      `https://graph.facebook.com/v20.0/me?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    const meJson = (await meRes.json().catch(() => ({}))) as GraphPageNode & {
      error?: { message?: string };
    };

    if (!meRes.ok || meJson.error) {
      return {
        success: false,
        pagesMatched: 0,
        byStore: {},
        error: meJson.error?.message || `Meta Graph HTTP ${meRes.status}`,
      };
    }

    let pages: GraphPageNode[] = [];
    if (meJson.single_line_address || meJson.phone || meJson.overall_star_rating != null) {
      pages = [meJson];
    } else {
      const acctRes = await fetch(
        `https://graph.facebook.com/v20.0/me/accounts?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(token)}`,
        { cache: "no-store", signal: AbortSignal.timeout(8000) }
      );
      const acctJson = (await acctRes.json().catch(() => ({}))) as {
        data?: GraphPageNode[];
        error?: { message?: string };
      };
      if (!acctRes.ok || acctJson.error) {
        return {
          success: false,
          pagesMatched: 0,
          byStore: {},
          error: acctJson.error?.message || `Meta Pages lookup HTTP ${acctRes.status}`,
        };
      }
      pages = acctJson.data || [];
    }

    if (pages.length === 0) {
      return {
        success: false,
        accountName: meJson.name,
        pagesMatched: 0,
        byStore: {},
        error: "Token is valid but returned 0 managed Facebook Pages.",
      };
    }

    const byStore: LiveMetaPageResult["byStore"] = {};
    for (const [sidStr, store] of Object.entries(PHILLY_STORES)) {
      const sid = Number(sidStr);
      const matched = pages.find((p) =>
        `${p.single_line_address || ""} ${p.name || ""}`
          .toLowerCase()
          .includes(store.streetNumber)
      );
      if (matched) {
        byStore[sid] = {
          napMatch: computeNapMatch(matched.single_line_address, matched.phone, store),
          rating: matched.overall_star_rating ?? null,
          reviewsCount: matched.rating_count,
          url: matched.link || (matched.id ? `https://www.facebook.com/${matched.id}` : "https://www.facebook.com"),
        };
      }
    }

    // Single brand Facebook Page fallback -> attach to Store 1 only if street match was absent
    if (Object.keys(byStore).length === 0 && pages.length === 1) {
      const primary = pages[0];
      byStore[1] = {
        napMatch: computeNapMatch(primary.single_line_address, primary.phone, PHILLY_STORES[1]),
        rating: primary.overall_star_rating ?? null,
        reviewsCount: primary.rating_count,
        url: primary.link || (primary.id ? `https://www.facebook.com/${primary.id}` : "https://www.facebook.com"),
      };
    }

    return {
      success: Object.keys(byStore).length > 0,
      accountName: meJson.name || pages[0]?.name,
      pagesMatched: Object.keys(byStore).length,
      byStore,
      ...(Object.keys(byStore).length === 0
        ? { error: `Fetched ${pages.length} Page(s), but none matched Philadelphia store addresses.` }
        : {}),
    };
  } catch (err) {
    return {
      success: false,
      pagesMatched: 0,
      byStore: {},
      error: err instanceof Error ? err.message : "Meta Graph network error",
    };
  }
}

export interface LiveTrustpilotResult {
  success: boolean;
  displayName?: string;
  rating?: number;
  reviewsCount?: number;
  url?: string;
  error?: string;
}

/**
 * Fetch live Trustpilot Business Unit summary for smartfonedoctor.com via Trustpilot API.
 */
export async function fetchTrustpilotLive(
  apiKey: string,
  domain: string = "smartfonedoctor.com"
): Promise<LiveTrustpilotResult> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, error: "Missing Trustpilot API key" };
  }

  try {
    const res = await fetch(
      `https://api.trustpilot.com/v1/business-units/find?name=${encodeURIComponent(domain)}&apikey=${encodeURIComponent(cleanKey)}`,
      { cache: "no-store", signal: AbortSignal.timeout(8000) }
    );
    const json = (await res.json().catch(() => ({}))) as {
      id?: string;
      displayName?: string;
      identifyingName?: string;
      score?: { trustScore?: number };
      numberOfReviews?: { total?: number };
      fault?: { faultstring?: string };
      message?: string;
    };

    if (!res.ok || !json.id) {
      return {
        success: false,
        error:
          json.fault?.faultstring ||
          json.message ||
          `Trustpilot HTTP ${res.status}`,
      };
    }

    const slug = json.identifyingName || domain;
    return {
      success: true,
      displayName: json.displayName || domain,
      rating: json.score?.trustScore,
      reviewsCount: json.numberOfReviews?.total,
      url: `https://www.trustpilot.com/review/${slug}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Trustpilot network error",
    };
  }
}

export interface LiveDataForSeoResult {
  success: boolean;
  totalFound: number;
  byStore: Record<
    number,
    {
      napMatch: number;
      rating: number | null;
      reviewsCount?: number;
      url: string;
    }
  >;
  error?: string;
}

/**
 * Query DataForSEO Business Listings API using `login:password` (or base64 Basic token).
 */
export async function fetchDataForSeoListingsLive(
  credentials: string
): Promise<LiveDataForSeoResult> {
  const clean = credentials.trim();
  if (!clean) {
    return { success: false, totalFound: 0, byStore: {}, error: "Missing DataForSEO credentials" };
  }

  const basicToken = clean.includes(":")
    ? Buffer.from(clean).toString("base64")
    : clean;

  try {
    const res = await fetch(
      "https://api.dataforseo.com/v3/business_data/business_listings/search/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            title: "Smart Fone Doctor",
            location_coordinate: "39.9596,-75.2255,20",
            limit: 15,
          },
        ]),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    const json = (await res.json().catch(() => ({}))) as {
      status_code?: number;
      status_message?: string;
      tasks?: Array<{
        status_code?: number;
        status_message?: string;
        result?: Array<{
          total_count?: number;
          items?: Array<{
            title?: string;
            address?: string;
            phone?: string;
            url?: string;
            check_url?: string;
            rating?: { value?: number; votes_count?: number };
          }>;
        }>;
      }>;
    };

    if (!res.ok || (json.status_code && json.status_code >= 40000)) {
      return {
        success: false,
        totalFound: 0,
        byStore: {},
        error: json.status_message || `DataForSEO HTTP ${res.status}`,
      };
    }

    const task = json.tasks?.[0];
    if (task?.status_code && task.status_code >= 40000) {
      return {
        success: false,
        totalFound: 0,
        byStore: {},
        error: task.status_message || `DataForSEO task error ${task.status_code}`,
      };
    }

    const items = task?.result?.[0]?.items || [];
    const byStore: LiveDataForSeoResult["byStore"] = {};
    for (const [sidStr, store] of Object.entries(PHILLY_STORES)) {
      const sid = Number(sidStr);
      const hit = items.find((item) =>
        (item.address || "").toLowerCase().includes(store.streetNumber)
      );
      if (hit) {
        byStore[sid] = {
          napMatch: computeNapMatch(hit.address, hit.phone, store),
          rating: hit.rating?.value ?? null,
          reviewsCount: hit.rating?.votes_count,
          url: hit.url || hit.check_url || "",
        };
      }
    }

    return {
      success: true,
      totalFound: items.length,
      byStore,
      ...(items.length === 0
        ? { error: "DataForSEO returned 0 matching Smart Fone Doctor listings in Philadelphia." }
        : {}),
    };
  } catch (err) {
    return {
      success: false,
      totalFound: 0,
      byStore: {},
      error: err instanceof Error ? err.message : "DataForSEO network error",
    };
  }
}

/**
 * Verify Google Business Profile OAuth Access Token against My Business Account Management API.
 */
export async function verifyGbpOAuthLive(accessToken: string): Promise<{
  ok: boolean;
  accountCount: number;
  locationsMatched: number;
  byStore: Record<number, { napMatch: number; url: string; mapsUri?: string }>;
  error?: string;
}> {
  try {
    const acctRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }
    );

    const acctJson = (await acctRes.json().catch(() => ({}))) as {
      accounts?: Array<{ name?: string; accountName?: string }>;
      error?: { message?: string };
    };

    if (!acctRes.ok || acctJson.error) {
      return {
        ok: false,
        accountCount: 0,
        locationsMatched: 0,
        byStore: {},
        error: acctJson.error?.message || `GBP OAuth HTTP ${acctRes.status}`,
      };
    }

    const accounts = acctJson.accounts || [];
    const byStore: Record<number, { napMatch: number; url: string; mapsUri?: string }> = {};

    for (const acct of accounts.slice(0, 3)) {
      if (!acct.name) continue;
      const locRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${acct.name}/locations?readMask=name,title,storefrontAddress,phoneNumbers,metadata`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        }
      ).catch(() => null);

      if (!locRes?.ok) continue;
      const locJson = (await locRes.json().catch(() => ({}))) as {
        locations?: Array<{
          title?: string;
          storefrontAddress?: { addressLines?: string[]; locality?: string };
          phoneNumbers?: { primaryPhone?: string };
          metadata?: { mapsUri?: string };
        }>;
      };

      for (const loc of locJson.locations || []) {
        const addr = loc.storefrontAddress?.addressLines?.join(", ") || "";
        for (const [sidStr, store] of Object.entries(PHILLY_STORES)) {
          const sid = Number(sidStr);
          if (addr.toLowerCase().includes(store.streetNumber)) {
            byStore[sid] = {
              napMatch: computeNapMatch(
                `${addr}, ${loc.storefrontAddress?.locality || "Philadelphia"}`,
                loc.phoneNumbers?.primaryPhone,
                store
              ),
              url: loc.metadata?.mapsUri || "https://business.google.com",
              mapsUri: loc.metadata?.mapsUri,
            };
          }
        }
      }
    }

    return {
      ok: true,
      accountCount: accounts.length,
      locationsMatched: Object.keys(byStore).length,
      byStore,
    };
  } catch (err) {
    return {
      ok: false,
      accountCount: 0,
      locationsMatched: 0,
      byStore: {},
      error: err instanceof Error ? err.message : "GBP OAuth network error",
    };
  }
}

/**
 * Verify Apple Business Connect API token against the live endpoint.
 */
export async function verifyAppleConnectLive(accessToken: string): Promise<{
  ok: boolean;
  locationsCount: number;
  error?: string;
}> {
  try {
    const res = await fetch("https://api.businessconnect.apple.com/v1/companies", {
      headers: {
        Authorization: `Bearer ${accessToken.trim()}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const json = (await res.json().catch(() => ({}))) as {
      data?: unknown[];
      errors?: Array<{ detail?: string; title?: string }>;
    };

    if (!res.ok) {
      return {
        ok: false,
        locationsCount: 0,
        error:
          json.errors?.[0]?.detail ||
          json.errors?.[0]?.title ||
          `Apple Business Connect HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      locationsCount: Array.isArray(json.data) ? json.data.length : 0,
    };
  } catch (err) {
    return {
      ok: false,
      locationsCount: 0,
      error: err instanceof Error ? err.message : "Apple Business Connect network error",
    };
  }
}

/**
 * Verify Bing / Azure Maps Places API key via live HTTP location query.
 */
export async function verifyBingPlacesKeyLive(apiKey: string): Promise<{
  ok: boolean;
  locationsMatched: number;
  error?: string;
}> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { ok: false, locationsMatched: 0, error: "Missing Bing API key" };
  }

  try {
    let matched = 0;
    let lastErr: string | undefined;

    for (const store of Object.values(PHILLY_STORES)) {
      const res = await fetch(
        `https://dev.virtualearth.net/REST/v1/Locations?query=${encodeURIComponent(
          store.address
        )}&key=${encodeURIComponent(cleanKey)}`,
        { cache: "no-store", signal: AbortSignal.timeout(6000) }
      );
      const json = (await res.json().catch(() => ({}))) as {
        statusCode?: number;
        errorDetails?: string[];
        resourceSets?: Array<{ estimatedTotal?: number }>;
      };

      if (!res.ok || (json.statusCode && json.statusCode >= 400)) {
        lastErr = json.errorDetails?.[0] || `Bing API HTTP ${res.status}`;
        continue;
      }
      if ((json.resourceSets?.[0]?.estimatedTotal ?? 0) > 0) {
        matched += 1;
      }
    }

    return {
      ok: matched > 0,
      locationsMatched: matched,
      ...(matched === 0 ? { error: lastErr || "Bing Places check returned 0 matches." } : {}),
    };
  } catch (err) {
    return {
      ok: false,
      locationsMatched: 0,
      error: err instanceof Error ? err.message : "Bing API network error",
    };
  }
}

/**
 * Check HTTP reachability of a claimed directory listing URL.
 */
export async function checkUrlReachableLive(url: string): Promise<{
  reachable: boolean;
  status: number;
  error?: string;
}> {
  const cleanUrl = url.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    return { reachable: false, status: 0, error: "Invalid URL scheme" };
  }

  try {
    let res = await fetch(cleanUrl, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "SmartFoneDoctor-Verifier/1.0" },
    });

    if (res.status === 405 || res.status === 403) {
      res = await fetch(cleanUrl, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "SmartFoneDoctor-Verifier/1.0" },
      });
    }

    return {
      reachable: res.status >= 200 && res.status < 400,
      status: res.status,
    };
  } catch (err) {
    return {
      reachable: false,
      status: 0,
      error: err instanceof Error ? err.message : "Network timeout",
    };
  }
}
