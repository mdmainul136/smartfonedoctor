import React from "react";
import type { Metadata } from "next";
import CommonIssuesClient from "./CommonIssuesClient";

export const metadata: Metadata = {
  title: "Common Repair Issues & Troubleshooting | SmartFoneDoctor Philadelphia",
  description:
    "Diagnose cracked screens, dead batteries, charging port faults, HDMI issues, water damage, and console problems for phones, tablets, laptops, and game consoles.",
  keywords: [
    "Phone Repair Issues",
    "Cracked Screen Repair Philadelphia",
    "HDMI Port Fix",
    "Water Damaged Phone Recovery",
    "Laptop Screen Repair",
    "Console Power Issues",
    "SmartFoneDoctor Common Issues",
  ],
};

export default function CommonIssuesPage() {
  return <CommonIssuesClient />;
}

