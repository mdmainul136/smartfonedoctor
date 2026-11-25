interface RateBucket {
  timestamps: number[];
}

const BOOKING_RATE_BUCKETS = new Map<string, RateBucket>();
const MAX_BUCKETS = 2000;

export function extractClientIp(reqHeaders: { get(name: string): string | null }): string {
  const xff = reqHeaders.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = reqHeaders.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cfIp = reqHeaders.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  return "unknown";
}

/**
 * Sliding-window IP rate limiter for live booking creation endpoints.
 */
export function checkBookingRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; retryAfterSeconds?: number; remaining: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  if (BOOKING_RATE_BUCKETS.size > MAX_BUCKETS) {
    for (const [key, bucket] of BOOKING_RATE_BUCKETS.entries()) {
      const fresh = bucket.timestamps.filter((t) => t > cutoff);
      if (fresh.length === 0) BOOKING_RATE_BUCKETS.delete(key);
      else bucket.timestamps = fresh;
    }
  }

  const key = ip || "unknown";
  const existing = BOOKING_RATE_BUCKETS.get(key);
  const recent = existing ? existing.timestamps.filter((t) => t > cutoff) : [];

  if (recent.length >= maxRequests) {
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    BOOKING_RATE_BUCKETS.set(key, { timestamps: recent });
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  recent.push(now);
  BOOKING_RATE_BUCKETS.set(key, { timestamps: recent });
  return { allowed: true, remaining: Math.max(0, maxRequests - recent.length) };
}

const OBVIOUS_FAKE_PHONES = new Set([
  "1234567890",
  "0123456789",
  "9876543210",
  "5555555555",
  "0000000000",
]);

/**
 * Validates US / international callback phone numbers (10-15 digits, rejects junk/repeated numbers).
 */
export function validateCustomerPhone(raw: string): {
  valid: boolean;
  normalized?: string;
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: "Phone number is required." };
  }

  if (!/^[+\d\s().-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: "Phone number contains invalid characters. Use a valid US or international number.",
    };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return {
      valid: false,
      error: "Please provide a valid 10-digit US phone number (or 10–15 digit international number).",
    };
  }

  const core10 = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (/^(\d)\1+$/.test(core10) || OBVIOUS_FAKE_PHONES.has(core10)) {
    return { valid: false, error: "Please provide a real callback phone number." };
  }

  if (core10.length === 10 && (core10.startsWith("0") || core10.startsWith("1"))) {
    return { valid: false, error: "Invalid US area code in phone number." };
  }

  const formatted =
    core10.length === 10
      ? `+1 (${core10.slice(0, 3)}) ${core10.slice(3, 6)}-${core10.slice(6)}`
      : `+${digits}`;

  return { valid: true, normalized: formatted };
}

export function validateBookingPayload(input: {
  customerName: string;
  phone: string;
  email?: string;
  device: string;
  issue: string;
}): { valid: boolean; normalizedPhone?: string; error?: string } {
  const name = input.customerName.trim();
  const device = input.device.trim();
  const issue = input.issue.trim();
  const email = input.email?.trim() || "";

  if (name.length < 2 || name.length > 100) {
    return { valid: false, error: "customerName must be between 2 and 100 characters." };
  }
  if (device.length < 2 || device.length > 120) {
    return { valid: false, error: "device must be between 2 and 120 characters." };
  }
  if (issue.length < 3 || issue.length > 300) {
    return { valid: false, error: "issue must be between 3 and 300 characters." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: "Please provide a valid email address." };
  }

  const phoneCheck = validateCustomerPhone(input.phone);
  if (!phoneCheck.valid) {
    return { valid: false, error: phoneCheck.error };
  }

  return { valid: true, normalizedPhone: phoneCheck.normalized };
}
