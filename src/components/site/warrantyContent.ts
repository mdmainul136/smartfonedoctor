// Warranty page text: kept apart from the component so the builder can load the
// defaults without the component (site sections load on demand).
/** Editable content of the Warranty page (Admin > Pages > Warranty, "Warranty page" section). */
export type WarrantyContent = {
  badge: string;
  title: string;
  intro: string;
  coveredHeading: string;
  covered: { text: string }[];
  notCoveredHeading: string;
  notCovered: { text: string }[];
  claimHeading: string;
  steps: { title: string; body: string }[];
  helpHeading: string;
  /** "{phone}" is replaced by the main store's phone number. */
  helpText: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export const WARRANTY_DEFAULTS: WarrantyContent = {
  badge: "Our Warranty",
  title: "90-day warranty on every repair",
  intro:
    "Every repair at SmartFoneDoctor is covered for 90 days on both parts and labor. If a part we installed fails because of a defect, or our work doesn't hold up, we'll inspect it and repair or replace it at no cost to you.",
  coveredHeading: "What's covered",
  covered: [
    { text: "Replacement parts we installed that fail because of a defect" },
    { text: "Our technician's workmanship on the repair" },
    { text: "Screens, batteries, charging ports, cameras and other parts we replaced" },
    { text: "HDMI port repairs on game consoles (6-month coverage)" },
  ],
  notCoveredHeading: "What's not covered",
  // Standard exclusions: the owner still has to confirm this wording (see docs/CMS_PLAN.md).
  notCovered: [
    { text: "New physical damage after the repair, such as drops or cracked glass" },
    { text: "Liquid damage that happens after the repair" },
    { text: "Parts or problems we did not repair" },
    { text: "Devices opened or repaired by someone else after our repair" },
  ],
  claimHeading: "How to make a warranty claim",
  steps: [
    { title: "Keep your receipt", body: "Your repair receipt or ticket ID shows the repair date and the part we replaced." },
    { title: "Bring the device in", body: "Visit any of our Philadelphia stores within the warranty period. No appointment needed." },
    { title: "We inspect and fix it", body: "If the part or our work is at fault, we repair or replace it at no charge." },
  ],
  helpHeading: "Questions about your warranty?",
  helpText: "Call us at {phone} or check the status of a repair online.",
  primaryLabel: "Check repair status",
  primaryHref: "/repair-status",
  secondaryLabel: "Find a store",
  secondaryHref: "/locations/i/book-repair",
};
