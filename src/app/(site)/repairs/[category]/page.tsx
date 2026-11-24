import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import { getCmsPage } from "@/actions/cmsPages";
import CMSSectionRenderer from "@/components/site/CMSSectionRenderer";
import { RouteDataProvider } from "@/components/site/RouteDataContext";
import { CategoryHub, type CategoryRouteData } from "@/components/repairs/CategoryHub";
import { HUB_CATEGORIES, HUB_DEFAULTS, type HubCategory } from "@/components/repairs/categoryHubContent";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { withCmsMetadata } from "@/lib/cmsMetadata";
import { buildSocialMetadata } from "@/lib/seoSocial";
import { brandTitle } from "@/lib/seoTitle";
import type { CMSPage } from "@/lib/cmsData";

const SITE = "https://smartfonedoctor.com";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const isHubCategory = (c: string): c is HubCategory => (HUB_CATEGORIES as string[]).includes(c);

export function generateStaticParams() {
  return HUB_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isHubCategory(category)) return {};
  const d = HUB_DEFAULTS[category];
  // Coded defaults; title and description can be changed in Admin > Pages > SEO.
  return withCmsMetadata(`/repairs/${category}`, {
    title: brandTitle(d.seoTitle),
    description: d.seoDescription,
    alternates: { canonical: `/repairs/${category}` },
    ...buildSocialMetadata({
      title: d.seoTitle,
      description: d.seoDescription,
      url: `/repairs/${category}`,
      image: d.heroImage,
      imageAlt: d.seoTitle,
      type: "website",
    }),
  });
}

/** A published page with a builder layout. */
function usable(page: CMSPage | null): page is CMSPage {
  const blocks = (page?.puckData as { content?: unknown[] } | undefined)?.content;
  return Boolean(page && page.status === "Published" && Array.isArray(blocks) && blocks.length > 0);
}

/**
 * CPR-style category hub: /repairs/smartphone, /tablet, /computer, /console.
 * Its layout and text are a page in Admin > Pages (path /repairs/<category>);
 * device, brand and repair lists come from the repair catalog.
 */
export default async function CategoryHubPage({ params }: CategoryPageProps) {
  const { category } = await params;
  if (!isHubCategory(category)) notFound();

  const [catalog, cmsPage] = await Promise.all([getRepairCatalog(), getCmsPage(`/repairs/${category}`)]);
  const routeData: CategoryRouteData = {
    category,
    devices: catalog.devices.filter((d) => d.category === category),
    repairs: catalog.issues.filter((i) => i.category === category),
  };
  const d = HUB_DEFAULTS[category];
  const layout = usable(cmsPage) && cmsPage.category !== "Template" ? cmsPage : null;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Repairs", item: `${SITE}/repairs` },
      { "@type": "ListItem", position: 3, name: d.name, item: `${SITE}/repairs/${category}` },
    ],
  };
  const deviceList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${d.name} in Philadelphia`,
    itemListElement: routeData.devices.map((dev, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${dev.name} Repair`,
      url: `${SITE}/repairs/${category}/${dev.slug}`,
    })),
  };

  return (
    <main className="bg-[#FAF8F5] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {routeData.devices.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(deviceList) }} />
      )}
      <RouteDataProvider value={{ type: "repair-category", data: routeData }}>
        {layout ? <CMSSectionRenderer slug={layout.slug} initialPage={layout} /> : <CategoryHub />}
      </RouteDataProvider>
      <Footer />
    </main>
  );
}
