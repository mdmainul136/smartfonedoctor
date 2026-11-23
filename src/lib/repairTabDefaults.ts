export interface RepairTabSpec {
  label: string;
  value: string;
}

export interface RepairTabFeature {
  title: string;
  desc: string;
}

export interface RepairTabFaq {
  question: string;
  answer: string;
}

export interface RepairTabStat {
  value: string;
  label: string;
}

export interface RepairDetailTabsData {
  specifications?: RepairTabSpec[];
  keyFeatures?: RepairTabFeature[];
  whyChooseHeadline?: string;
  whyChooseText?: string;
  whyChooseStats?: RepairTabStat[];
  faqs?: RepairTabFaq[];
}

export const DEFAULT_WHY_CHOOSE_HEADLINE =
  "Why Choose SmartFoneDoctor in Philadelphia?";

export const DEFAULT_WHY_CHOOSE_TEXT =
  "Located at 33 S 52nd St in West Philadelphia (with branches at 4016 & 4060 Lancaster Ave), SmartFoneDoctor has been the trusted hardware repair bench for University City students, local families, and city businesses for years. We perform all repairs on-site at our own ESD-safe benches using OEM-grade components, providing fast same-day turnaround with zero data loss.";

export const DEFAULT_WHY_CHOOSE_STATS: RepairTabStat[] = [
  { value: "5,000+", label: "Local Philly Repairs" },
  { value: "4.9 ★", label: "Customer Rating" },
  { value: "3 Stores", label: "Walk-In Locations" },
];

export function getDefaultIssueSpecs(
  title: string,
  categoryName: string
): RepairTabSpec[] {
  return [
    { label: "Hardware Issue", value: title },
    { label: "Category", value: categoryName },
    { label: "Typical repair time", value: "20–45 minutes, same day" },
    { label: "Diagnosis", value: "Free" },
    { label: "Parts", value: "Original (OEM) or high-quality replacement parts" },
    { label: "Warranty", value: "90 days on parts and labor" },
    { label: "Your data", value: "We don't erase your data" },
    { label: "Technicians", value: "WISE Level 2 and IPC-A-610 certified" },
    { label: "Main store", value: "33 S 52nd St, Philadelphia, PA 19139" },
    { label: "Walk-in Policy", value: "Walk-ins welcome, no appointment needed" },
  ];
}

export function getDefaultIssueFeatures(): RepairTabFeature[] {
  return [
    {
      title: "Rapid 30-Minute Turnaround",
      desc: "Most hardware issues are evaluated and repaired same-day within 30 to 45 minutes while you wait.",
    },
    {
      title: "Zero Data Loss Guarantee",
      desc: "We perform hardware surgery without formatting your device. Your photos, messages, apps, and credentials stay safe.",
    },
    {
      title: "In-House Micro-Soldering Bench",
      desc: "Advanced stereo microscopes and soldering stations to repair broken traces, blown diodes, and torn pads.",
    },
    {
      title: "Comprehensive 90-Day Warranty",
      desc: "All installed replacement parts and technician labor are backed by our 90-day peace-of-mind warranty.",
    },
    {
      title: "Honest Upfront Estimates",
      desc: "Free comprehensive diagnosis before you spend a penny. No surprise bench fees or diagnostic charges.",
    },
    {
      title: "Certified Philadelphia Lab",
      desc: "Clean ESD-safe bench with specialized calibration tools right in West Philadelphia.",
    },
  ];
}

export function getDefaultIssueFaqs(title: string): RepairTabFaq[] {
  const lower = title.toLowerCase();
  return [
    {
      question: `How much does ${lower} cost in Philadelphia?`,
      answer: `Diagnostic inspection for ${lower} is always free at SmartFoneDoctor. Depending on your exact device model, repair costs typically start from $69 with all parts and labor included.`,
    },
    {
      question: "Can I walk in to have my device repaired for this issue?",
      answer:
        "Yes! Walk-ins are welcome daily Mon–Sat 10 AM – 7 PM at our 33 S 52nd St flagship location in West Philadelphia and our Lancaster Ave stores. No prior appointment is required.",
    },
    {
      question: "Will my data or photos be erased during this repair?",
      answer:
        "No. We never reset or wipe devices during standard hardware repairs. All your personal data, apps, and photos remain completely intact.",
    },
    {
      question: "How long does this repair take?",
      answer:
        "Most repairs for this issue take between 20 and 45 minutes. You can relax in our waiting lounge or pick up your device later the same day.",
    },
  ];
}

export function getDefaultServiceSpecs(
  serviceName: string,
  categoryName: string,
  modelNames: string[]
): RepairTabSpec[] {
  return [
    { label: "Service Name", value: serviceName },
    { label: "Hardware Category", value: categoryName },
    {
      label: "Models Supported",
      value:
        modelNames.length > 0
          ? `${modelNames.slice(0, 4).join(", ")} & all models`
          : "All Generations & Variants Supported",
    },
    { label: "Typical repair time", value: "20–45 minutes, same day" },
    { label: "Diagnosis", value: "Free" },
    { label: "Parts", value: "Original (OEM) or high-quality replacement parts" },
    { label: "Warranty", value: "90 days on parts and labor" },
    { label: "Your data", value: "We don't erase your data" },
    { label: "Technicians", value: "WISE Level 2 certified, ESD-safe benches" },
    { label: "Main store", value: "33 S 52nd St, Philadelphia, PA 19139" },
    { label: "Walk-in Policy", value: "Walk-ins welcome, no appointment needed" },
  ];
}

export function getDefaultServiceFeatures(
  serviceName: string
): RepairTabFeature[] {
  return [
    {
      title: "Express 30-Minute Turnaround",
      desc: `Most ${serviceName} screen, battery, and charging port replacements are completed within 30 to 45 minutes while you wait in our comfortable lounge.`,
    },
    {
      title: "Factory TrueTone & Biometric Calibration",
      desc: "We transfer EEPROM serial numbers and calibrate ambient sensors to maintain factory biometric security, auto-brightness, and touch sensitivity.",
    },
    {
      title: "Zero Data Loss Guarantee",
      desc: "Unlike manufacturer mail-in service centers that wipe your storage clean, your personal photos, files, and apps stay safe and untouched.",
    },
    {
      title: "Component-Level Micro-Soldering",
      desc: "In-house soldering station for HDMI ports, USB-C charging ports, audio ICs, and liquid-damaged motherboard restoration.",
    },
    {
      title: "Transparent Upfront Pricing",
      desc: "You receive an exact written quote before any technician starts work. Zero hidden bench fees or surprise charges.",
    },
    {
      title: "90-day warranty",
      desc: "Every installed component is backed by our comprehensive 90-day warranty against manufacturer defects and touch unresponsiveness.",
    },
  ];
}

export function getDefaultServiceFaqs(serviceName: string): RepairTabFaq[] {
  return [
    {
      question: `How much does ${serviceName} cost in Philadelphia?`,
      answer: `Diagnostic testing for your ${serviceName} is always free at SmartFoneDoctor. Basic battery and port repairs start from $69, and screen replacements start from $89 depending on your exact model and component grade (Premium Aftermarket vs Factory OEM).`,
    },
    {
      question: `How long does ${serviceName} take?`,
      answer: `Most screen and battery replacements for ${serviceName} take between 20 and 45 minutes. More extensive micro-soldering or liquid-damage decontamination is typically ready for pickup same-day or within 24 hours.`,
    },
    {
      question: "Do I need to make an appointment or can I walk in?",
      answer:
        "Walk-ins are always welcome at all 3 of our Philadelphia stores (Mon–Sat 10 AM – 7 PM)! Booking online simply reserves your replacement part and secures priority bench placement.",
    },
    {
      question: "Will my photos and personal data be wiped during the repair?",
      answer:
        "No. Our certified technicians repair the hardware directly without resetting the device. Your photos, contacts, and personal data stay untouched.",
    },
    {
      question: "Where are your Philadelphia repair stores located?",
      answer:
        "Our flagship store is at 33 S 52nd St, Philadelphia, PA 19139 (right by the 52nd St Market-Frankford Line station). We also have locations at 4016 Lancaster Ave and 4060 Lancaster Ave in West Philadelphia / University City.",
    },
    {
      question: "What does the 90-day warranty cover?",
      answer:
        "Our 90-day warranty covers any defect in the replacement part (touch responsiveness, screen flickering, battery cycle health) and technician craftsmanship. Physical damage or water exposure after pickup is excluded.",
    },
  ];
}

/**
 * Cleans and normalizes optional custom tab fields before persisting to PostgreSQL.
 * Drops blank rows and returns undefined when empty so built-in dynamic defaults apply cleanly.
 */
export function sanitizeRepairTabsData(
  raw: RepairDetailTabsData
): RepairDetailTabsData {
  const specifications = (raw.specifications ?? [])
    .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    .filter((s) => s.label && s.value);

  const keyFeatures = (raw.keyFeatures ?? [])
    .map((f) => ({ title: f.title.trim(), desc: f.desc.trim() }))
    .filter((f) => f.title && f.desc);

  const whyChooseStats = (raw.whyChooseStats ?? [])
    .map((st) => ({ value: st.value.trim(), label: st.label.trim() }))
    .filter((st) => st.value && st.label);

  const faqs = (raw.faqs ?? [])
    .map((q) => ({ question: q.question.trim(), answer: q.answer.trim() }))
    .filter((q) => q.question && q.answer);

  const whyChooseHeadline = raw.whyChooseHeadline?.trim() || undefined;
  const whyChooseText = raw.whyChooseText?.trim() || undefined;

  return {
    ...(specifications.length > 0 ? { specifications } : {}),
    ...(keyFeatures.length > 0 ? { keyFeatures } : {}),
    ...(whyChooseHeadline ? { whyChooseHeadline } : {}),
    ...(whyChooseText ? { whyChooseText } : {}),
    ...(whyChooseStats.length > 0 ? { whyChooseStats } : {}),
    ...(faqs.length > 0 ? { faqs } : {}),
  };
}
