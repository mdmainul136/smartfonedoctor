import type { MetadataRoute } from "next";

export const AI_SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-Web",
  "Applebot-Extended",
] as const;

export const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Amazonbot",
  "CCBot",
  "anthropic-ai",
] as const;

export const PROTECTED_DISALLOW_PATHS = ["/admin/", "/api/admin/"] as const;

export const DEFAULT_PUBLIC_AI_ALLOW_PATHS = [
  "/",
  "/blog",
  "/repairs",
  "/common-issues",
  "/locations",
  "/schedule-repair",
  "/repair-status",
  "/review",
  "/warranty",
  "/faq",
  "/about",
  "/llms.txt",
  "/llms-full.txt",
] as const;

export interface RobotsCrawlerConfigInput {
  enableRobotsTxt: boolean;
  enableAiBots: boolean;
  enableAiTrainingBots?: boolean;
  enableSitemap: boolean;
  robotsAllowPaths?: string[];
  robotsDisallowPaths?: string[];
  robotsCustomRules?: string | null;
}

/**
 * Normalizes newline/comma-separated paths or same-origin URLs into clean leading-slash rules.
 */
export function parsePathList(input: string[] | string | null | undefined): string[] {
  const rawItems = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? input.split(/\r?\n|,/)
    : [];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const item of rawItems) {
    let clean = item.trim();
    if (!clean || clean.startsWith("#")) continue;

    // Strip domain if admin pasted a full URL
    if (/^https?:\/\//i.test(clean)) {
      try {
        const parsed = new URL(clean);
        clean = `${parsed.pathname}${parsed.search}`;
      } catch {
        continue;
      }
    }

    if (!clean.startsWith("/")) {
      clean = `/${clean}`;
    }

    // Collapse double slashes safely
    clean = clean.replace(/\/{2,}/g, "/");

    if (!seen.has(clean)) {
      seen.add(clean);
      out.push(clean);
    }
  }

  return out;
}

/**
 * Checks whether a normalized path matches any user-configured exclusion rule
 * (supports exact path, trailing wildcard `/foo/*`, or directory prefix `/foo/`).
 */
export function matchesExcludedPath(path: string, excludePatterns: string[]): boolean {
  if (!excludePatterns || excludePatterns.length === 0) return false;

  let cleanPath = path.trim();
  if (/^https?:\/\//i.test(cleanPath)) {
    try {
      cleanPath = new URL(cleanPath).pathname;
    } catch {
      // Keep original
    }
  }
  if (!cleanPath.startsWith("/")) cleanPath = `/${cleanPath}`;
  const lowerPath = cleanPath.toLowerCase();

  for (const rawRule of excludePatterns) {
    const rule = rawRule.trim().toLowerCase();
    if (!rule) continue;

    if (rule.endsWith("*")) {
      const prefix = rule.slice(0, -1);
      if (lowerPath.startsWith(prefix)) return true;
    } else if (rule.endsWith("/")) {
      if (lowerPath === rule.slice(0, -1) || lowerPath.startsWith(rule)) return true;
    } else if (lowerPath === rule || lowerPath.startsWith(`${rule}/`) || lowerPath === `${rule}.md`) {
      return true;
    }
  }

  return false;
}

type RobotsRuleBlock = {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

/**
 * Safely parses custom `User-agent:` directive blocks entered by admin.
 * Protected admin routes are always stripped from Allow lists.
 */
export function parseCustomRobotsBlocks(raw: string | null | undefined): RobotsRuleBlock[] {
  if (!raw?.trim()) return [];

  const blocks: RobotsRuleBlock[] = [];
  let current: {
    agents: string[];
    allow: string[];
    disallow: string[];
    crawlDelay?: number;
  } | null = null;

  const flush = () => {
    if (!current || current.agents.length === 0) return;
    if (current.allow.length === 0 && current.disallow.length === 0 && current.crawlDelay === undefined) {
      return;
    }
    const safeDisallow = Array.from(
      new Set([...current.disallow, ...PROTECTED_DISALLOW_PATHS])
    );
    blocks.push({
      userAgent: current.agents.length === 1 ? current.agents[0] : current.agents,
      ...(current.allow.length > 0 ? { allow: current.allow } : {}),
      ...(safeDisallow.length > 0 ? { disallow: safeDisallow } : {}),
      ...(current.crawlDelay !== undefined ? { crawlDelay: current.crawlDelay } : {}),
    });
  };

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const directive = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();
    if (!val) continue;

    if (directive === "user-agent") {
      if (
        current &&
        (current.allow.length > 0 || current.disallow.length > 0 || current.crawlDelay !== undefined)
      ) {
        flush();
        current = { agents: [val], allow: [], disallow: [] };
      } else {
        if (!current) current = { agents: [], allow: [], disallow: [] };
        current.agents.push(val);
      }
    } else if (current) {
      if (directive === "allow") {
        const lowerVal = val.toLowerCase();
        if (!PROTECTED_DISALLOW_PATHS.some((p) => lowerVal.startsWith(p))) {
          current.allow.push(val);
        }
      } else if (directive === "disallow") {
        current.disallow.push(val);
      } else if (directive === "crawl-delay") {
        const num = Number(val);
        if (!Number.isNaN(num) && num >= 0 && num <= 120) {
          current.crawlDelay = num;
        }
      }
    }
  }

  flush();
  return blocks;
}

function formatRuleBlockForPreview(rule: RobotsRuleBlock): string {
  const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
  const lines = agents.map((a) => `User-agent: ${a}`);
  const allows = rule.allow ? (Array.isArray(rule.allow) ? rule.allow : [rule.allow]) : [];
  const disallows = rule.disallow
    ? Array.isArray(rule.disallow)
      ? rule.disallow
      : [rule.disallow]
    : [];

  for (const a of allows) lines.push(`Allow: ${a}`);
  for (const d of disallows) lines.push(`Disallow: ${d}`);
  if (rule.crawlDelay !== undefined) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
  return lines.join("\n");
}

/**
 * Generates both Next.js `MetadataRoute.Robots` AND the exact text preview shown in Admin SEO.
 */
export function buildRobotsOutput(
  config: RobotsCrawlerConfigInput,
  baseUrl: string = "https://smartfonedoctor.com"
): { metadataRobots: MetadataRoute.Robots; previewText: string } {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const extraAllows = parsePathList(config.robotsAllowPaths).filter(
    (p) => !PROTECTED_DISALLOW_PATHS.some((prot) => p.toLowerCase().startsWith(prot))
  );
  const customDisallows = parsePathList(config.robotsDisallowPaths);
  const mergedDisallows = Array.from(
    new Set([...PROTECTED_DISALLOW_PATHS, ...customDisallows])
  );

  if (!config.enableRobotsTxt) {
    const blockedRule: RobotsRuleBlock = {
      userAgent: "*",
      disallow: "/",
    };
    const metadataRobots: MetadataRoute.Robots = {
      rules: [blockedRule],
      ...(config.enableSitemap ? { sitemap: `${cleanBase}/sitemap.xml` } : {}),
    };
    const previewText = [
      "# Standard Crawlers Disabled in Admin Settings",
      formatRuleBlockForPreview(blockedRule),
      "",
      config.enableSitemap
        ? `Sitemap: ${cleanBase}/sitemap.xml`
        : "# Sitemap disabled in Admin Settings",
    ].join("\n");

    return { metadataRobots, previewText };
  }

  const standardAllow = Array.from(new Set(["/", ...extraAllows]));
  const mainRule: RobotsRuleBlock = {
    userAgent: "*",
    allow: standardAllow.length === 1 ? "/" : standardAllow,
    disallow: mergedDisallows,
  };

  const aiSearchRule: RobotsRuleBlock = config.enableAiBots
    ? {
        userAgent: [...AI_SEARCH_BOTS],
        allow: Array.from(new Set([...DEFAULT_PUBLIC_AI_ALLOW_PATHS, ...extraAllows])),
        disallow: mergedDisallows,
      }
    : {
        userAgent: [...AI_SEARCH_BOTS],
        disallow: ["/"],
      };

  const enableTraining = config.enableAiTrainingBots !== false;
  const aiTrainingRule: RobotsRuleBlock = enableTraining
    ? {
        userAgent: [...AI_TRAINING_BOTS],
        allow: standardAllow.length === 1 ? "/" : standardAllow,
        disallow: mergedDisallows,
      }
    : {
        userAgent: [...AI_TRAINING_BOTS],
        disallow: ["/"],
      };

  const customBlocks = parseCustomRobotsBlocks(config.robotsCustomRules);
  const allRules: RobotsRuleBlock[] = [mainRule, aiSearchRule, aiTrainingRule, ...customBlocks];

  const metadataRobots: MetadataRoute.Robots = {
    rules: allRules,
    ...(config.enableSitemap ? { sitemap: `${cleanBase}/sitemap.xml` } : {}),
  };

  const sections = [
    formatRuleBlockForPreview(mainRule),
    "",
    config.enableAiBots
      ? "# AI Search & Citation Crawlers (Allowed)"
      : "# AI Search & Citation Crawlers (Blocked)",
    formatRuleBlockForPreview(aiSearchRule),
    "",
    enableTraining
      ? "# AI Model Training Crawlers (Allowed)"
      : "# AI Model Training Crawlers (Blocked)",
    formatRuleBlockForPreview(aiTrainingRule),
  ];

  if (customBlocks.length > 0) {
    sections.push("", "# Custom Directives", ...customBlocks.map(formatRuleBlockForPreview));
  }

  sections.push(
    "",
    config.enableSitemap
      ? `Sitemap: ${cleanBase}/sitemap.xml`
      : "# Sitemap disabled in Admin Settings"
  );

  return {
    metadataRobots,
    previewText: sections.join("\n"),
  };
}
