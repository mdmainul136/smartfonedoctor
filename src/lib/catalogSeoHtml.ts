import type { CommonIssueDetail } from "@/data/commonIssuesData";
import type { PSeoDevice, PSeoIssue } from "@/lib/pSeoEngine";
import {
  DEFAULT_WHY_CHOOSE_HEADLINE,
  DEFAULT_WHY_CHOOSE_STATS,
  DEFAULT_WHY_CHOOSE_TEXT,
  getDefaultIssueFaqs,
  getDefaultIssueFeatures,
  getDefaultIssueSpecs,
  getDefaultServiceFaqs,
  getDefaultServiceFeatures,
  getDefaultServiceSpecs,
  type RepairDetailTabsData,
} from "@/lib/repairTabDefaults";

const CATEGORY_LABEL: Record<string, string> = {
  smartphone: "Smartphone Repair",
  tablet: "Tablet Repair",
  computer: "Computer Repair",
  console: "Console Repair",
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTabsHtml(
  tabs: RepairDetailTabsData,
  defaults: Required<RepairDetailTabsData>,
  sectionHeadingPrefix: string
): string[] {
  const specs = tabs.specifications?.length ? tabs.specifications : defaults.specifications;
  const features = tabs.keyFeatures?.length ? tabs.keyFeatures : defaults.keyFeatures;
  const whyHeadline = tabs.whyChooseHeadline?.trim() || defaults.whyChooseHeadline;
  const whyText = tabs.whyChooseText?.trim() || defaults.whyChooseText;
  const stats = tabs.whyChooseStats?.length ? tabs.whyChooseStats : defaults.whyChooseStats;
  const faqs = tabs.faqs?.length ? tabs.faqs : defaults.faqs;

  const out: string[] = [];

  if (specs.length > 0) {
    out.push(`<h2>${esc(sectionHeadingPrefix)} Specifications</h2>`);
    out.push("<ul>");
    for (const s of specs) {
      if (s.label.trim() || s.value.trim()) {
        out.push(`<li><strong>${esc(s.label)}:</strong> ${esc(s.value)}</li>`);
      }
    }
    out.push("</ul>");
  }

  if (features.length > 0) {
    out.push("<h2>Key Repair Features</h2>");
    for (const f of features) {
      if (f.title.trim()) out.push(`<h3>${esc(f.title)}</h3>`);
      if (f.desc.trim()) out.push(`<p>${esc(f.desc)}</p>`);
    }
  }

  out.push(`<h2>${esc(whyHeadline)}</h2>`);
  out.push(`<p>${esc(whyText)}</p>`);
  if (stats.length > 0) {
    out.push(
      `<p>${stats.map((st) => `${esc(st.value)} ${esc(st.label)}`).join(" · ")}</p>`
    );
  }

  if (faqs.length > 0) {
    out.push("<h2>Hardware FAQs</h2>");
    for (const f of faqs) {
      if (f.question.trim()) out.push(`<h3>${esc(f.question)}</h3>`);
      if (f.answer.trim()) out.push(`<p>${esc(f.answer)}</p>`);
    }
  }

  return out;
}

/**
 * Synthesizes HTML matching the rendered Common Issue page so RankMathSeoSuite
 * scores real headings, lead copy, sections, all 4 repair tabs, images, and internal links.
 */
export function buildCommonIssueContentHtml(issue: CommonIssueDetail): string {
  const parts: string[] = [];
  const title = issue.title.trim() || "Common Hardware Issue";

  parts.push(`<h1>${esc(title)}</h1>`);
  if (issue.leadText?.trim()) {
    parts.push(`<p>${esc(issue.leadText.trim())}</p>`);
  }
  if (issue.image?.trim()) {
    parts.push(`<img src="${esc(issue.image.trim())}" alt="${esc(title)}" />`);
  }

  for (const sec of issue.sections ?? []) {
    if (sec.heading?.trim()) {
      parts.push(`<h2>${esc(sec.heading.trim())}</h2>`);
    }
    for (const p of sec.paragraphs ?? []) {
      if (p.trim()) parts.push(`<p>${esc(p.trim())}</p>`);
    }
    const items = (sec.listItems ?? []).map((x) => x.trim()).filter(Boolean);
    if (items.length > 0) {
      const tag = sec.ordered ? "ol" : "ul";
      parts.push(`<${tag}>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</${tag}>`);
    }
  }

  parts.push(
    ...renderTabsHtml(
      issue,
      {
        specifications: getDefaultIssueSpecs(title, issue.categoryName || "Smartphone"),
        keyFeatures: getDefaultIssueFeatures(),
        whyChooseHeadline: DEFAULT_WHY_CHOOSE_HEADLINE,
        whyChooseText: DEFAULT_WHY_CHOOSE_TEXT,
        whyChooseStats: DEFAULT_WHY_CHOOSE_STATS,
        faqs: getDefaultIssueFaqs(title),
      },
      title
    )
  );

  parts.push(
    `<a href="/schedule-repair?issue=${esc(issue.slug)}">Book Free Diagnosis</a>`,
    `<a href="/common-issues">View All Common Issues</a>`,
    `<a href="/locations/i/book-repair">Find a Store</a>`
  );
  for (const relSlug of issue.relatedSlugs ?? []) {
    if (relSlug.trim()) {
      parts.push(
        `<a href="/common-issues/${esc(issue.category)}/${esc(relSlug.trim())}">${esc(relSlug.trim())}</a>`
      );
    }
  }

  return parts.join("\n");
}

/**
 * Synthesizes HTML matching the rendered Device Model repair page (/repairs/<category>/<device>).
 */
export function buildDeviceModelContentHtml(
  device: PSeoDevice,
  relevantIssues: PSeoIssue[]
): string {
  const parts: string[] = [];
  const name = device.name.trim() || "Device";
  const serviceName = `${name} Repair`;

  parts.push(`<h1>${esc(name)} Repair Services in Philadelphia</h1>`);
  parts.push(
    `<p>Expert same-day repair for ${esc(name)}${
      device.specs?.trim() ? ` (${esc(device.specs.trim())})` : ""
    }. From genuine OLED displays and battery calibration to precision charging port fixes with a 90-day warranty.</p>`
  );

  if (device.image?.trim()) {
    parts.push(`<img src="${esc(device.image.trim())}" alt="${esc(serviceName)}" />`);
  }

  if (relevantIssues.length > 0) {
    parts.push(`<h2>Common ${esc(name)} Repairs</h2>`);
    for (const iss of relevantIssues) {
      parts.push(`<h3>${esc(iss.name)}</h3>`);
      const summary =
        iss.symptoms[0] ||
        `Professional ${iss.shortName.toLowerCase()} performed in ${iss.turnaroundDisplay} by certified bench technicians.`;
      parts.push(`<p>${esc(summary)}</p>`);
      if (device.slug && iss.slug) {
        parts.push(
          `<a href="/repairs/${esc(device.category)}/${esc(device.slug)}/${esc(iss.slug)}">${esc(
            `${name} ${iss.shortName}`
          )}</a>`
        );
      }
    }
  }

  parts.push(
    ...renderTabsHtml(
      device,
      {
        specifications: getDefaultServiceSpecs(
          serviceName,
          device.categoryName || CATEGORY_LABEL[device.category] || "Smartphone Repair",
          [name]
        ),
        keyFeatures: getDefaultServiceFeatures(serviceName),
        whyChooseHeadline: DEFAULT_WHY_CHOOSE_HEADLINE,
        whyChooseText: DEFAULT_WHY_CHOOSE_TEXT,
        whyChooseStats: DEFAULT_WHY_CHOOSE_STATS,
        faqs: getDefaultServiceFaqs(serviceName),
      },
      serviceName
    )
  );

  parts.push(
    `<a href="/schedule-repair?service=${encodeURIComponent(serviceName)}">Book Repair</a>`,
    `<a href="/repairs/${esc(device.category)}">${esc(device.categoryName || "Repairs")}</a>`,
    `<a href="/locations/i/book-repair">Philadelphia Benches</a>`
  );

  return parts.join("\n");
}

/**
 * Synthesizes HTML matching a sample programmatic repair-issue page (/repairs/<category>/<device>/<repair>).
 */
export function buildRepairTypeContentHtml(
  issue: PSeoIssue,
  sampleDevice?: PSeoDevice
): string {
  const fallbackCategoryName = CATEGORY_LABEL[issue.category] || "Smartphone Repair";
  const dev: PSeoDevice = sampleDevice ?? {
    slug: "device",
    name: `${fallbackCategoryName.replace(" Repair", "")} Device`,
    category: issue.category,
    categoryName: fallbackCategoryName,
    brand: "Apple",
    brandSlug: "apple",
    image: "",
    specs: "",
    releaseYear: 2024,
  };

  const aftermarketPrice = issue.basePrice + (dev.releaseYear >= 2024 ? 20 : 0);
  const oemPrice = Math.round(aftermarketPrice * issue.oemPriceMultiplier);
  const shortName = issue.shortName.trim() || issue.name.trim() || "Hardware Repair";

  const parts: string[] = [];
  parts.push(`<h1>${esc(dev.name)} ${esc(shortName)} in Philadelphia</h1>`);
  parts.push(
    `<p>Certified bench technician ${esc(shortName.toLowerCase())} for your ${esc(dev.name)} at SmartFoneDoctor in Philadelphia with a 90-day warranty and ${esc(issue.turnaroundDisplay)} turnaround.</p>`
  );
  parts.push(
    `<p>SmartFoneDoctor repairs the ${esc(dev.name)} ${esc(shortName.toLowerCase())} in Philadelphia starting at $${aftermarketPrice} ($${oemPrice} OEM tier) with a typical turnaround of ${esc(issue.turnaroundDisplay)}. Walk in at 33 S 52nd St, 4016 Lancaster Ave, or 4060 Lancaster Ave.</p>`
  );

  if (dev.image?.trim()) {
    parts.push(`<img src="${esc(dev.image.trim())}" alt="${esc(`${dev.name} ${issue.name}`)}" />`);
  }

  const symptoms = (issue.symptoms ?? []).map((s) => s.trim()).filter(Boolean);
  if (symptoms.length > 0) {
    parts.push(`<h2>Common ${esc(shortName)} Symptoms</h2>`);
    parts.push(`<ul>${symptoms.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`);
  }

  const steps = (issue.benchProcedures ?? []).filter(
    (p) => p.title.trim() || p.desc.trim()
  );
  if (steps.length > 0) {
    parts.push(`<h2>Bench Repair Procedure for ${esc(shortName)}</h2>`);
    for (const p of steps) {
      if (p.title.trim()) parts.push(`<h3>${esc(p.title.trim())}</h3>`);
      if (p.desc.trim()) parts.push(`<p>${esc(p.desc.trim())}</p>`);
    }
  }

  const tools = (issue.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean);
  if (tools.length > 0) {
    parts.push("<h2>Certified Bench Tools Used</h2>");
    parts.push(`<ul>${tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`);
  }

  const faqs = (issue.faqs ?? []).filter((f) => f.question.trim() && f.answer.trim());
  if (faqs.length > 0) {
    parts.push("<h2>Frequently Asked Questions</h2>");
    for (const f of faqs) {
      parts.push(`<h3>${esc(f.question.trim())}</h3>`);
      parts.push(`<p>${esc(f.answer.trim())}</p>`);
    }
  }

  parts.push(
    `<a href="/schedule-repair?device=${esc(dev.slug)}&amp;issue=${esc(issue.slug)}">Schedule ${esc(dev.name)} ${esc(shortName)}</a>`,
    `<a href="/repairs/${esc(issue.category)}/${esc(dev.slug)}">All ${esc(dev.name)} Repairs</a>`,
    `<a href="/locations/i/book-repair">Philadelphia Repair Locations</a>`
  );

  return parts.join("\n");
}
