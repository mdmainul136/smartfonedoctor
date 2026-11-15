import CustomPage from "@/components/site/CustomPage";

/**
 * Pages created in Admin > Pages. Built-in pages have their own route folders,
 * which Next.js always prefers over this catch-all.
 */
export default async function CustomPageRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <CustomPage path={`/${slug.join("/")}`} />;
}
