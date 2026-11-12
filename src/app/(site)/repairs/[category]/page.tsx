import { redirect, notFound } from "next/navigation";
import { getAllServicesCMS, getServicesByCategory } from "@/data/servicesData";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const allServices = getAllServicesCMS();
  const categories = Array.from(new Set(allServices.map((s) => s.categoryId)));
  return categories.map((cat) => ({
    category: cat,
  }));
}

export default async function CategoryHubPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const services = getServicesByCategory(category);

  if (!services || services.length === 0) {
    notFound();
  }

  // Redirect to flagship service for this category
  redirect(`/repairs/${category}/${services[0].serviceId}`);
}

