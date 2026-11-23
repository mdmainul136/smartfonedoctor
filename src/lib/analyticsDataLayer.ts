export interface AnalyticsTrackingConfig {
  gtmContainerId?: string | null;
  ga4MeasurementId?: string | null;
  metaPixelId?: string | null;
  clarityProjectId?: string | null;
  enableDataLayer?: boolean;
  enableDebugEvents?: boolean;
}

type AnalyticsWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
  __SFD_DL_ENABLED__?: boolean;
  __SFD_DL_DEBUG__?: boolean;
  __SFD_HAS_GTM__?: boolean;
  __SFD_HAS_GA4__?: boolean;
};

/** Extracts a safe GTM container ID (e.g. GTM-XXXXXXX) from raw text or snippet. */
export function cleanGtmId(raw?: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  const match = value.match(/\bGTM-[A-Z0-9]{4,12}\b/i);
  return match ? match[0].toUpperCase() : null;
}

/** Extracts a safe GA4 measurement ID (e.g. G-XXXXXXXXXX) from raw text or snippet. */
export function cleanGa4Id(raw?: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  const match = value.match(/\bG-[A-Z0-9]{6,14}\b/i);
  return match ? match[0].toUpperCase() : null;
}

/** Extracts a safe Meta (Facebook) Pixel numeric ID (8–20 digits). */
export function cleanMetaPixelId(raw?: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  const match = value.match(/\b\d{8,20}\b/);
  return match ? match[0] : null;
}

/** Extracts a safe Microsoft Clarity Project ID (alphanumeric, 6–32 chars). */
export function cleanClarityId(raw?: string | null): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  return /^[A-Za-z0-9_-]{6,32}$/.test(value) ? value : null;
}

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === "undefined") return;
  const win = window as AnalyticsWindow;
  if (win.__SFD_DL_ENABLED__ === false) return;
  if (typeof win.fbq !== "function") return;

  if (eventId) {
    win.fbq("track", eventName, params ?? {}, { eventID: eventId });
  } else {
    win.fbq("track", eventName, params ?? {});
  }

  if (win.__SFD_DL_DEBUG__) {
    console.info("[SFD Meta Pixel]", eventName, params ?? {}, eventId ?? "");
  }
}

/**
 * Pushes a structured event onto `window.dataLayer` and mirrors to direct GA4 `gtag()`
 * only when GTM is not active (avoids duplicate events when GTM dispatches to GA4).
 */
export function pushDataLayerEvent(
  event: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const win = window as AnalyticsWindow;
  if (win.__SFD_DL_ENABLED__ === false) return;

  const payload: Record<string, unknown> = { event, ...(params ?? {}) };
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(payload);

  if (win.__SFD_HAS_GA4__ && !win.__SFD_HAS_GTM__ && typeof win.gtag === "function") {
    win.gtag("event", event, params ?? {});
  }

  if (win.__SFD_DL_DEBUG__) {
    console.info("[SFD dataLayer]", event, params ?? {});
  }
}

export function trackPageView(
  pathname: string,
  options?: { sendMetaPageView?: boolean }
): void {
  if (typeof window === "undefined") return;
  pushDataLayerEvent("page_view", {
    page_path: pathname,
    page_location: window.location.href,
    page_title: typeof document !== "undefined" ? document.title : "",
  });

  if (options?.sendMetaPageView) {
    trackMetaEvent("PageView");
  }
}

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

/** Fires GA4 `view_item` and Meta Pixel `ViewContent` on repair/issue/location/blog detail routes. */
export function trackViewContent(pathname: string): void {
  if (typeof window === "undefined") return;
  const clean = pathname.replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts.length < 2) return;

  let category = "";
  let itemName = "";

  if (parts[0] === "repairs" && parts.length >= 2) {
    category = `Device Repair / ${slugToLabel(parts[1])}`;
    itemName = parts.slice(2).map(slugToLabel).join(" - ") || slugToLabel(parts[1]);
  } else if (parts[0] === "common-issues" && parts.length >= 3) {
    category = `Troubleshooting / ${slugToLabel(parts[1])}`;
    itemName = slugToLabel(parts[2]);
  } else if (parts[0] === "locations" && parts.length >= 2) {
    category = parts[1] === "areas" ? "Service Area" : "Store Location";
    itemName = slugToLabel(parts[parts.length - 1]);
  } else if (parts[0] === "blog" && parts.length >= 2) {
    category = "Repair Guide";
    itemName = slugToLabel(parts[1]);
  } else {
    return;
  }

  pushDataLayerEvent("view_item", {
    item_category: category,
    item_name: itemName,
    page_path: clean,
  });

  trackMetaEvent("ViewContent", {
    content_category: category,
    content_name: itemName,
    content_type: "service",
  });
}

export function trackBookingCheckout(input: {
  step: number;
  stepName: string;
  device?: string;
  issue?: string;
  value?: number;
}): void {
  if (typeof window === "undefined") return;
  const value = input.value ?? 99;
  const label = [input.device, input.issue].filter(Boolean).join(" - ") || "Repair Intake";

  pushDataLayerEvent("begin_checkout", {
    step: input.step,
    step_name: input.stepName,
    device_model: input.device || "",
    repair_issue: input.issue || "",
    value,
    currency: "USD",
  });

  trackMetaEvent("InitiateCheckout", {
    content_name: label,
    content_category: "Device Repair",
    num_items: 1,
    value,
    currency: "USD",
  });
}

export function trackBookingLead(input: {
  eventId?: string;
  ticketNumber: string;
  device: string;
  issue: string;
  storeId?: number | null;
  value?: number;
  currency?: string;
}): void {
  if (typeof window === "undefined") return;
  const value = input.value ?? 99;
  const currency = input.currency || "USD";
  const eventId = input.eventId || `lead-${input.ticketNumber}`;

  pushDataLayerEvent("generate_lead", {
    event_id: eventId,
    transaction_id: input.ticketNumber,
    lead_type: "repair_booking",
    ticket_number: input.ticketNumber,
    device_model: input.device,
    repair_issue: input.issue,
    store_id: input.storeId ?? null,
    value,
    currency,
  });

  trackMetaEvent(
    "Lead",
    {
      content_name: `${input.device} - ${input.issue}`,
      content_category: "Device Repair",
      value,
      currency,
    },
    eventId
  );

  trackMetaEvent("Schedule", {
    content_name: `${input.device} - ${input.issue}`,
    content_category: "Device Repair",
  });
}

export function trackClickAction(
  event: "phone_click" | "email_click" | "directions_click" | "booking_cta_click",
  params: { link_url: string; link_text?: string; page_path?: string }
): void {
  pushDataLayerEvent(event, params);

  if (event === "phone_click" || event === "email_click") {
    trackMetaEvent("Contact", {
      content_name: event,
      link_text: params.link_text || event,
    });
  } else if (event === "directions_click") {
    trackMetaEvent("FindLocation", {
      content_name: params.link_text || "Store Directions",
    });
  } else if (event === "booking_cta_click") {
    trackMetaEvent("Schedule", {
      content_name: params.link_text || "Book Repair CTA",
    });
  }
}

export function trackBookingStep(input: {
  step: 1 | 2;
  eventName: "select_device" | "select_model";
  deviceCategory: string;
  deviceLabel?: string;
  make?: string;
  model?: string;
}): void {
  pushDataLayerEvent(input.eventName, {
    step: input.step,
    device_category: input.deviceCategory,
    ...(input.deviceLabel ? { device_label: input.deviceLabel } : {}),
    ...(input.make ? { device_brand: input.make } : {}),
    ...(input.model ? { device_model: input.model } : {}),
  });
}

export function trackBookingIssueSelect(input: {
  device: string;
  issues: string;
  issueCount: number;
  value?: number;
}): void {
  const value = input.value ?? 99;
  pushDataLayerEvent("add_to_cart", {
    step: 3,
    device_model: input.device,
    repair_issue: input.issues,
    item_count: input.issueCount,
    value,
    currency: "USD",
  });

  trackMetaEvent("AddToCart", {
    content_name: `${input.device} - ${input.issues}`,
    content_category: "Device Repair",
    num_items: input.issueCount,
    value,
    currency: "USD",
  });
}

export function trackRepairStatusLookup(input: {
  found: boolean;
  status?: string;
}): void {
  pushDataLayerEvent("track_repair_status", {
    ticket_found: input.found,
    repair_status: input.status || (input.found ? "Active" : "Not Found"),
  });
}

export function trackRepairTierSelect(input: {
  device: string;
  issue: string;
  tier: "aftermarket" | "oem";
  price: number;
}): void {
  pushDataLayerEvent("select_repair_tier", {
    item_name: `${input.device} ${input.issue}`,
    device_model: input.device,
    repair_issue: input.issue,
    part_tier: input.tier,
    value: input.price,
    currency: "USD",
  });
}

export function trackSiteSearch(searchTerm: string, pagePath: string): void {
  const term = searchTerm.trim().slice(0, 100);
  if (term.length < 3) return;

  pushDataLayerEvent("search", {
    search_term: term,
    page_path: pagePath,
  });

  trackMetaEvent("Search", {
    search_string: term,
    content_category: "Site Search",
  });
}

export function trackScrollDepth(percent: 50 | 90, pagePath: string): void {
  pushDataLayerEvent("scroll_depth", {
    percent_scrolled: percent,
    page_path: pagePath,
  });
}

export function trackFaqExpand(question: string, pagePath: string): void {
  const q = question.trim().slice(0, 140);
  if (!q) return;

  pushDataLayerEvent("faq_expand", {
    question: q,
    page_path: pagePath,
  });
}
