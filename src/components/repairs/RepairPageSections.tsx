"use client";

import ServiceDetailClient from "@/app/(site)/repairs/[category]/[serviceId]/ServiceDetailClient";
import DeviceIssueClient from "@/app/(site)/repairs/[category]/[serviceId]/[issue]/DeviceIssueClient";
import { useRouteData } from "@/components/site/RouteDataContext";
import type { ServiceCMSData } from "@/data/servicesData";
import type { PSeoPageData } from "@/lib/pSeoEngine";

export type DeviceRouteData = { service: ServiceCMSData };
export type RepairRouteData = { page: PSeoPageData };

function Placeholder({ text }: { text: string }) {
  return (
    <div className="mx-auto my-10 max-w-xl rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

/** Data block: the device page (models, common repairs, prices) for the device being viewed. */
export function DevicePageSection() {
  const data = useRouteData<DeviceRouteData>("repair-device");
  if (!data) return <Placeholder text="The device page appears here. It shows the device being viewed." />;
  return <ServiceDetailClient service={data.service} withFooter={false} />;
}

/** Data block: the repair page (price, symptoms, bench steps, FAQs) for the device + repair being viewed. */
export function RepairPageSection() {
  const data = useRouteData<RepairRouteData>("repair-issue");
  if (!data) return <Placeholder text="The repair page appears here. It shows the device and repair being viewed." />;
  return <DeviceIssueClient data={data.page} />;
}
