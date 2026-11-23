import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  cleanGa4Id,
  cleanMetaPixelId,
} from "@/lib/analyticsDataLayer";

export interface ServerLeadConversionInput {
  eventId: string;
  ticketNumber: string;
  device: string;
  issue: string;
  value: number;
  email?: string;
  phone?: string;
  customerName?: string;
  sourceUrl?: string;
}

export type B2bLeadLifecycleEvent =
  | "qualify_lead"
  | "working_lead"
  | "close_convert_lead"
  | "close_unconvert_lead"
  | "disqualify_lead";

export interface ServerLeadLifecycleInput {
  eventName: B2bLeadLifecycleEvent;
  ticketNumber: string;
  leadStatus: string;
  device: string;
  issue: string;
  value: number;
  email?: string;
  phone?: string;
  customerName?: string;
  reason?: string;
  gaClientId?: string;
  fbp?: string;
  fbc?: string;
}

export async function extractAttributionCookies(): Promise<{
  gaClientId?: string;
  fbp?: string;
  fbc?: string;
}> {
  try {
    const reqCookies = await cookies();
    const gaClientId = parseGaClientId(reqCookies.get("_ga")?.value) || undefined;
    const fbp = reqCookies.get("_fbp")?.value || undefined;
    const fbc = reqCookies.get("_fbc")?.value || undefined;
    return { gaClientId, fbp, fbc };
  } catch {
    return {};
  }
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePhoneDigits(phone?: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? `1${digits}` : digits;
}

function parseGaClientId(gaCookie?: string): string | null {
  if (!gaCookie) return null;
  // Standard _ga cookie: GA1.1.123456789.1700000000
  const parts = gaCookie.split(".");
  if (parts.length >= 4) {
    return `${parts[2]}.${parts[3]}`;
  }
  return null;
}

async function getServerAnalyticsConfig() {
  const settings = await prisma.appSystemSettings
    .findUnique({
      where: { id: "global_config" },
      select: {
        metaPixelId: true,
        metaCapiAccessToken: true,
        metaTestEventCode: true,
        ga4MeasurementId: true,
        ga4ApiSecret: true,
        enableDataLayer: true,
      },
    })
    .catch(() => null);

  if (settings?.enableDataLayer === false) {
    return null;
  }

  const pixelId =
    cleanMetaPixelId(settings?.metaPixelId) ||
    cleanMetaPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  const capiToken =
    settings?.metaCapiAccessToken?.trim() ||
    process.env.META_CAPI_ACCESS_TOKEN?.trim() ||
    "";
  const testEventCode = settings?.metaTestEventCode?.trim() || "";

  const ga4Id =
    cleanGa4Id(settings?.ga4MeasurementId) ||
    cleanGa4Id(process.env.NEXT_PUBLIC_GA4_ID);
  const ga4ApiSecret =
    settings?.ga4ApiSecret?.trim() ||
    process.env.GA4_API_SECRET?.trim() ||
    "";

  if (!((pixelId && capiToken) || (ga4Id && ga4ApiSecret))) {
    return null;
  }

  return { pixelId, capiToken, testEventCode, ga4Id, ga4ApiSecret };
}

function buildHashedCustomerUserData(input: {
  email?: string;
  phone?: string;
  customerName?: string;
}): Record<string, unknown> {
  const cleanEmail = input.email?.trim().toLowerCase() || "";
  const cleanPhone = normalizePhoneDigits(input.phone);
  const nameParts = (input.customerName ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0]?.toLowerCase() || "";
  const lastName =
    nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "";

  return {
    ...(cleanEmail ? { em: [sha256(cleanEmail)] } : {}),
    ...(cleanPhone ? { ph: [sha256(cleanPhone)] } : {}),
    ...(firstName ? { fn: [sha256(firstName)] } : {}),
    ...(lastName ? { ln: [sha256(lastName)] } : {}),
  };
}

function dispatchMetaCapiEvent(
  pixelId: string,
  capiToken: string,
  testEventCode: string,
  eventPayload: Record<string, unknown>
): Promise<unknown> {
  const body = {
    data: [eventPayload],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };
  return fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(capiToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3500),
    }
  ).catch((err) => console.error("[Meta CAPI] error:", err));
}

function dispatchGa4MpEvent(
  ga4Id: string,
  ga4ApiSecret: string,
  clientId: string,
  eventName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const body = {
    client_id: clientId,
    events: [{ name: eventName, params }],
  };
  return fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(ga4Id)}&api_secret=${encodeURIComponent(ga4ApiSecret)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3500),
    }
  ).catch((err) => console.error("[GA4 MP] error:", err));
}

/**
 * Server-side conversion dispatcher (Meta Conversions API + GA4 Measurement Protocol).
 * Deduplicates Meta leads with browser Pixel using matching `eventId`.
 * Never throws so customer booking confirmation is never blocked by ad-network latency.
 */
export async function sendServerLeadConversion(
  input: ServerLeadConversionInput
): Promise<void> {
  try {
    const cfg = await getServerAnalyticsConfig();
    if (!cfg) return;

    const reqHeaders = await headers();
    const reqCookies = await cookies();

    const forwardedFor = reqHeaders.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      reqHeaders.get("x-real-ip")?.trim() ||
      undefined;
    const userAgent = reqHeaders.get("user-agent") || undefined;
    const referer =
      input.sourceUrl ||
      reqHeaders.get("referer") ||
      "https://smartfonedoctor.com/schedule-repair";

    const tasks: Promise<unknown>[] = [];

    if (cfg.pixelId && cfg.capiToken) {
      const fbp = reqCookies.get("_fbp")?.value;
      const fbc = reqCookies.get("_fbc")?.value;

      const userData: Record<string, unknown> = {
        ...buildHashedCustomerUserData(input),
        ...(clientIp ? { client_ip_address: clientIp } : {}),
        ...(userAgent ? { client_user_agent: userAgent } : {}),
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
      };

      tasks.push(
        dispatchMetaCapiEvent(cfg.pixelId, cfg.capiToken, cfg.testEventCode, {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId,
          event_source_url: referer,
          action_source: "website",
          user_data: userData,
          custom_data: {
            content_name: `${input.device} - ${input.issue}`,
            content_category: "Device Repair",
            value: input.value,
            currency: "USD",
            order_id: input.ticketNumber,
          },
        })
      );
    }

    if (cfg.ga4Id && cfg.ga4ApiSecret) {
      const clientId =
        parseGaClientId(reqCookies.get("_ga")?.value) || `sfd.${input.ticketNumber}`;

      tasks.push(
        dispatchGa4MpEvent(cfg.ga4Id, cfg.ga4ApiSecret, clientId, "generate_lead", {
          event_id: input.eventId,
          transaction_id: input.ticketNumber,
          lead_type: "repair_booking",
          device_model: input.device,
          repair_issue: input.issue,
          value: input.value,
          currency: "USD",
        })
      );
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error("[sendServerLeadConversion] unexpected error:", err);
  }
}

const META_CRM_EVENT_MAP: Partial<Record<B2bLeadLifecycleEvent, string>> = {
  qualify_lead: "QualifiedLead",
  working_lead: "WorkingLead",
  close_convert_lead: "Purchase",
};

/**
 * Server-side B2B / Lead Lifecycle dispatcher triggered by Admin CRM status changes.
 * Sends official GA4 Measurement Protocol lifecycle events and Meta CAPI `system_generated` CRM events
 * using only customer-derived identifiers (never admin cookies/IP/UA).
 */
export async function sendServerLeadLifecycleEvent(
  input: ServerLeadLifecycleInput
): Promise<void> {
  try {
    const cfg = await getServerAnalyticsConfig();
    if (!cfg) return;

    const tasks: Promise<unknown>[] = [];

    if (cfg.ga4Id && cfg.ga4ApiSecret) {
      const params: Record<string, unknown> = {
        transaction_id: input.ticketNumber,
        lead_status: input.leadStatus,
        device_model: input.device,
        repair_issue: input.issue,
        value: input.value,
        currency: "USD",
        ...(input.eventName === "close_unconvert_lead"
          ? { unconvert_lead_reason: input.reason || "lost_or_no_show" }
          : {}),
        ...(input.eventName === "disqualify_lead"
          ? { disqualified_lead_reason: input.reason || "disqualified" }
          : {}),
      };

      tasks.push(
        dispatchGa4MpEvent(
          cfg.ga4Id,
          cfg.ga4ApiSecret,
          input.gaClientId || `sfd.${input.ticketNumber}`,
          input.eventName,
          params
        )
      );
    }

    const metaEventName = META_CRM_EVENT_MAP[input.eventName];
    const hasMatchKey = Boolean(
      input.email?.trim() ||
        normalizePhoneDigits(input.phone) ||
        input.fbp ||
        input.fbc
    );

    if (cfg.pixelId && cfg.capiToken && metaEventName && hasMatchKey) {
      tasks.push(
        dispatchMetaCapiEvent(cfg.pixelId, cfg.capiToken, cfg.testEventCode, {
          event_name: metaEventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: `${input.eventName}-${input.ticketNumber}`,
          action_source: "system_generated",
          user_data: {
            ...buildHashedCustomerUserData(input),
            ...(input.fbp ? { fbp: input.fbp } : {}),
            ...(input.fbc ? { fbc: input.fbc } : {}),
          },
          custom_data: {
            content_name: `${input.device} - ${input.issue}`,
            content_category: "Device Repair",
            value: input.value,
            currency: "USD",
            order_id: input.ticketNumber,
          },
        })
      );
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error("[sendServerLeadLifecycleEvent] unexpected error:", err);
  }
}
