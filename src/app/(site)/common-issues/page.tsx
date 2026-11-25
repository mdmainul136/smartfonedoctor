import React from "react";
import { brandTitle } from "@/lib/seoTitle";
import type { Metadata } from "next";
import { buildSocialMetadata } from "@/lib/seoSocial";
import CommonIssuesClient from "./CommonIssuesClient";
import { getCommonIssues } from "@/lib/commonIssuesStore";

const issuesTitle = "Common Repair Issues & Fixes | SmartFoneDoctor";
const issuesDesc =
  "Diagnose cracked screens, dead batteries, charging ports, HDMI issues & water damage for phones, tablets, laptops & consoles in Philadelphia.";

export const metadata: Metadata = {
  title: brandTitle(issuesTitle),
  description: issuesDesc,
  alternates: { canonical: "/common-issues" },
  keywords: [
    "Phone Repair Issues",
    "Cracked Screen Repair Philadelphia",
    "HDMI Port Fix",
    "Water Damaged Phone Recovery",
    "Laptop Screen Repair",
    "Console Power Issues",
    "SmartFoneDoctor Common Issues",
  ],
  ...buildSocialMetadata({
    title: issuesTitle,
    description: issuesDesc,
    url: "/common-issues",
    type: "website",
  }),
};

export default async function CommonIssuesPage() {
  // Articles from Admin > Common Issues.
  return <CommonIssuesClient issues={await getCommonIssues()} />;
}

