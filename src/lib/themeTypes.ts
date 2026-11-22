// Server-side only. The site's dynamic page types (WordPress "post types"):
// which URLs each one has, which type a URL belongs to, and the record data a
// page of that type is rendered with. Used by the Theme Builder admin screen,
// the page editor and /preview.

import { getBlogPostsAction } from "@/actions/blog";
import { getAllServicesCMS, getServiceCMS } from "@/data/servicesData";
import { getCommonIssueBySlug, getRelatedIssues } from "@/data/commonIssuesData";
import { buildDeviceModelCMS, buildPSeoPageData } from "@/lib/pSeoEngine";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { getCommonIssues } from "@/lib/commonIssuesStore";
import type { RouteData } from "@/components/site/RouteDataContext";
import { LOCATIONS_PATH, getLocationStores } from "@/lib/locationStores";

export type ThemeType = "blog-post" | "repair-device" | "repair-issue" | "common-issue";

export const THEME_TYPES: { type: ThemeType; label: string; description: string; pattern: string }[] = [
  { type: "blog-post", label: "Blog post", description: "Every repair guide in Admin > Guides & Blog.", pattern: "/blog/<post>" },
  {
    type: "repair-device",
    label: "Device page",
    description: "One page per device (Admin > Device Models) and per service page.",
    pattern: "/repairs/<category>/<device>",
  },
  {
    type: "repair-issue",
    label: "Repair page",
    description: "One page per device × repair type (Admin > Repair Types & Prices).",
    pattern: "/repairs/<category>/<device>/<repair>",
  },
  {
    type: "common-issue",
    label: "Common issue",
    description: "Troubleshooting articles in Admin > Common Issues.",
    pattern: "/common-issues/<category>/<article>",
  },
];

/** Every live URL of a page type. */
export async function listTypeUrls(type: ThemeType): Promise<string[]> {
  if (type === "blog-post") {
    const res = await getBlogPostsAction();
    return (res.articles ?? []).filter((a) => a.status === "Published").map((a) => `/blog/${a.slug}`);
  }
  if (type === "common-issue") {
    return (await getCommonIssues()).map((i) => `/common-issues/${i.category}/${i.slug}`);
  }
  const catalog = await getRepairCatalog();
  if (type === "repair-device") {
    const services = getAllServicesCMS().map((s) => `/repairs/${s.categoryId}/${s.serviceId}`);
    return [...services, ...catalog.devices.map((d) => `/repairs/${d.category}/${d.slug}`)];
  }
  const urls: string[] = [];
  for (const d of catalog.devices) {
    for (const i of catalog.issues) if (i.category === d.category) urls.push(`/repairs/${d.category}/${d.slug}/${i.slug}`);
  }
  return urls;
}

/** Which page type a URL belongs to (by its shape), or null. */
export function typeOfPath(path: string): ThemeType | null {
  const parts = path.replace(/^\/+|\/+$/g, "").split("/");
  if (parts[0] === "blog" && parts.length === 2) return "blog-post";
  if (parts[0] === "common-issues" && parts.length === 3) return "common-issue";
  if (parts[0] === "repairs" && parts.length === 3) return "repair-device";
  if (parts[0] === "repairs" && parts.length === 4) return "repair-issue";
  return null;
}

/** The record data the page at `path` is rendered with (what its route passes), or null. */
export async function routeDataForPath(path: string): Promise<RouteData | null> {
  if (path === LOCATIONS_PATH) return { type: "locations", data: { stores: (await getLocationStores()).mapStores } };
  const type = typeOfPath(path);
  const parts = path.replace(/^\/+|\/+$/g, "").split("/");
  if (type === "blog-post") {
    const res = await getBlogPostsAction();
    const article = res.articles?.find((a) => a.slug === parts[1]);
    return article ? { type, data: { article, allArticles: res.articles } } : null;
  }
  if (type === "common-issue") {
    const list = await getCommonIssues();
    const issue = getCommonIssueBySlug(parts[2], parts[1], list);
    return issue ? { type, data: { issue, related: getRelatedIssues(issue.slug, list) } } : null;
  }
  if (type === "repair-device") {
    const service = getServiceCMS(parts[1], parts[2]) || buildDeviceModelCMS(parts[1], parts[2], await getRepairCatalog());
    return service ? { type, data: { service } } : null;
  }
  if (type === "repair-issue") {
    const page = buildPSeoPageData(parts[1], parts[2], parts[3], await getRepairCatalog());
    return page ? { type, data: { page } } : null;
  }
  return null;
}
