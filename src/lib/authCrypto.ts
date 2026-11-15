import crypto from "crypto";

export const SESSION_COOKIE_NAME = "sfd_admin_session";
export const DEFAULT_SESSION_EXPIRY_DAYS = 7;
export const REMEMBER_ME_EXPIRY_DAYS = 30;

/**
 * Hash a plain password using scrypt with a unique random salt
 * Format: <salt>:<derivedKeyHex>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a password against the stored scrypt hash using constant-time comparison
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, keyHex] = storedHash.split(":");
  if (!salt || !keyHex) {
    return false;
  }

  try {
    const keyBuffer = Buffer.from(keyHex, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedKey.length) {
      return false;
    }
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (error) {
    console.error("Error verifying password hash:", error);
    return false;
  }
}

/**
 * Generates a cryptographically strong 256-bit session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
