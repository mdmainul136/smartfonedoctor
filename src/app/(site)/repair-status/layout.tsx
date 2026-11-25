import type { Metadata } from "next";
import { brandTitle } from "@/lib/seoTitle";
import { buildSocialMetadata } from "@/lib/seoSocial";

const title = "Track Your Repair Status | SmartFoneDoctor";
const description =
  "Check live repair bench status for your phone, tablet, MacBook, or console at SmartFoneDoctor Philadelphia using your ticket number or phone number.";

export const metadata: Metadata = {
  title: brandTitle(title),
  description,
  alternates: { canonical: "/repair-status" },
  ...buildSocialMetadata({
    title,
    description,
    url: "/repair-status",
    type: "website",
  }),
};

export default function RepairStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
