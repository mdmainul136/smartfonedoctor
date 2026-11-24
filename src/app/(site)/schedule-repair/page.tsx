import React, { Suspense } from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import ScheduleRepairWizard, { WizardStore } from "@/components/booking/ScheduleRepairWizard";
import ScheduleRepairPSeoContent from "@/components/booking/ScheduleRepairPSeoContent";
import { getStoreBranchesAction } from "@/actions/settings";
import { resolveDevice } from "@/lib/pSeoEngine";
import { getRepairCatalog } from "@/lib/repairCatalog";
import { buildSocialMetadata } from "@/lib/seoSocial";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = searchParams ? await searchParams : {};
  const deviceQuery = typeof resolvedParams.device === "string" ? resolvedParams.device : "";
  const modelQuery = typeof resolvedParams.model === "string" ? resolvedParams.model : "";
  const makeQuery = typeof resolvedParams.make === "string" ? resolvedParams.make : "";

  const query = deviceQuery || modelQuery || "";
  const matchedDevice = query ? resolveDevice(query, await getRepairCatalog()) : undefined;

  const deviceName = matchedDevice
    ? matchedDevice.name
    : modelQuery
    ? `${makeQuery ? makeQuery + " " : ""}${modelQuery}`
    : "";

  if (deviceName) {
    const title = `${deviceName} Repair in Philadelphia | Schedule Online | SmartFoneDoctor`;
    const description = `Fast same-day ${deviceName} repair in Philadelphia, PA. Free upfront diagnostics, 90-day warranty, OEM-grade parts, and zero data loss. Walk-ins welcome at 33 S 52nd St.`;
    const canonical = `/schedule-repair?device=${encodeURIComponent(query)}`;
    return {
      title: brandTitle(title),
      description,
      alternates: {
        canonical: `https://smartfonedoctor.com${canonical}`,
      },
      ...buildSocialMetadata({
        title,
        description,
        url: canonical,
        image: matchedDevice?.image,
        type: "website",
      }),
    };
  }

  const defaultTitle = "Schedule a Repair | SmartFoneDoctor Philadelphia";
  const defaultDesc =
    "Schedule your phone, tablet, computer, or gaming console repair online. Instant quote, certified technicians, and reserved bench time at our Philadelphia locations.";
  return {
    title: brandTitle(defaultTitle),
    description: defaultDesc,
    alternates: {
      canonical: "https://smartfonedoctor.com/schedule-repair",
    },
    ...buildSocialMetadata({
      title: defaultTitle,
      description: defaultDesc,
      url: "/schedule-repair",
      type: "website",
    }),
  };
}

export default async function ScheduleRepairPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const deviceParam = typeof resolvedParams.device === "string" ? resolvedParams.device : undefined;
  const makeParam = typeof resolvedParams.make === "string" ? resolvedParams.make : undefined;
  const modelParam = typeof resolvedParams.model === "string" ? resolvedParams.model : undefined;
  const issueParam = typeof resolvedParams.issue === "string" ? resolvedParams.issue : undefined;

  const branchesRes = await getStoreBranchesAction();
  const branches = branchesRes?.success && branchesRes.data ? branchesRes.data : [];

  const initialStores: WizardStore[] | undefined =
    branches.length > 0
      ? branches.map((b, idx) => ({
          id: typeof b.id === "number" ? b.id : idx + 1,
          name: b.name,
          address: `${b.address}, ${b.cityStateZip || "Philadelphia, PA 19139"}, United States`,
          phone: b.phone.replace(/[^0-9]/g, ""),
          displayPhone: b.phone,
        }))
      : undefined;

  return (
    <main className="bg-[#f7f8fa] min-h-screen">
      <Suspense fallback={<div className="p-10 text-center text-neutral-500 text-sm">Loading repair request...</div>}>
        <ScheduleRepairWizard initialStores={initialStores} />
      </Suspense>
      <ScheduleRepairPSeoContent
        catalog={await getRepairCatalog()}
        deviceParam={deviceParam}
        makeParam={makeParam}
        modelParam={modelParam}
        issueParam={issueParam}
      />
      <Footer />
    </main>
  );
}
