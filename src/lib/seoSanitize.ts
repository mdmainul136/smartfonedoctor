/**
 * Utility functions for sanitizing SEO verification tokens and meta tags.
 * Discards dummy/placeholder tokens so they never leak into production.
 */
export function cleanVerificationToken(val?: string | null): string | null {
  if (!val) return null;
  let token = val.trim();
  if (!token) return null;

  // Discard mock seed tokens
  if (
    token.includes("sfd-philly") ||
    token.includes("search-console-token") ||
    token.includes("webmaster-sfd")
  ) {
    return null;
  }

  // Extract content attribute if user pasted full <meta ... content="..." />
  const contentMatch = token.match(/content=["']([^"']+)["']/i);
  if (contentMatch) {
    token = contentMatch[1].trim();
  }

  // Strip common prefixes
  token = token.replace(/^(google-site-verification|msvalidate\.01|p:domain_verify)=/i, "").trim();
  token = token.replace(/^["']|["']$/g, "").trim();

  return token || null;
}
