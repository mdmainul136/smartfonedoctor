import type {
  CMSPage,
  HeroStyle,
  PageSection,
  PageSectionStyle,
} from "@/lib/cmsData";
import type {
  PuckIconName,
  PuckPageData,
  ResponsiveDeviceOverride,
  ResponsiveOverrides,
} from "@/puck/types";

const VALID_ICONS = new Set<PuckIconName>([
  "None",
  "Shield",
  "Clock",
  "Zap",
  "Wrench",
  "Sparkles",
  "Star",
  "Check",
  "CheckCircle2",
]);

function normalizeIcon(icon?: string): PuckIconName {
  if (icon && VALID_ICONS.has(icon as PuckIconName)) {
    return icon as PuckIconName;
  }
  return "None";
}

function normalizeFlexDir(dir?: string): "row" | "column" {
  return dir === "column" || dir === "column-reverse" ? "column" : "row";
}

function normalizeFlexWrap(wrap?: string): "wrap" | "nowrap" {
  return wrap === "nowrap" ? "nowrap" : "wrap";
}

function normalizeJustify(
  j?: string
): "flex-start" | "center" | "space-between" | "flex-end" {
  if (j === "center" || j === "space-between" || j === "flex-end") return j;
  return "flex-start";
}

function normalizeAlignItems(
  a?: string
): "stretch" | "flex-start" | "center" | "flex-end" {
  if (a === "flex-start" || a === "center" || a === "flex-end") return a;
  return "stretch";
}

function mapDeviceOverride(
  o?: Partial<PageSectionStyle & HeroStyle>
): ResponsiveDeviceOverride | undefined {
  if (!o) return undefined;
  const out: ResponsiveDeviceOverride = {};
  if (o.padding) out.padding = o.padding;
  if (o.align) out.align = o.align;
  if (o.bgColor) out.bgColor = o.bgColor;
  if (o.textColor) out.textColor = o.textColor;
  if (o.gridColumns) out.gridColumns = o.gridColumns;
  if (o.gap) out.gap = o.gap;
  if (o.flexDirection === "row" || o.flexDirection === "column") {
    out.flexDirection = o.flexDirection;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function mapResponsive(
  resp?: PageSectionStyle["responsive"] | HeroStyle["responsive"]
): ResponsiveOverrides | undefined {
  if (!resp) return undefined;
  const tablet = mapDeviceOverride(resp.tablet);
  const mobile = mapDeviceOverride(resp.mobile);
  if (!tablet && !mobile) return undefined;
  return { tablet, mobile };
}

function mapSectionToPuckBlock(
  sec: PageSection
): PuckPageData["content"][number] {
  const st = sec.style || {};
  const customCss = st.customCss || sec.customCss || "";

  switch (sec.type) {
    case "services_grid":
    case "benefits":
      return {
        type: "ServicesGridBlock",
        props: {
          id: `ServicesGridBlock-${sec.id}`,
          variant: sec.type,
          heading: sec.heading || "",
          subheading: sec.subheading || "",
          displayLayout: st.displayLayout === "flex" ? "flex" : "grid",
          gridColumns: st.gridColumns || sec.columns || 3,
          flexDirection: normalizeFlexDir(st.flexDirection),
          flexWrap: normalizeFlexWrap(st.flexWrap),
          justifyContent: normalizeJustify(st.justifyContent),
          alignItems: normalizeAlignItems(st.alignItems),
          gap: st.gap || "16px",
          bgColor: st.bgColor || "#ffffff",
          textColor: st.textColor || "#111827",
          cardBgColor: st.cardBgColor || "#f9fafb",
          cardBorderColor: st.cardBorderColor || "#e5e7eb",
          accentColor: st.accentColor || "#00807A",
          padding: st.padding || "48px 32px",
          align: st.align === "center" ? "center" : "left",
          borderRadius: st.borderRadius || "10px",
          customCss,
          responsive: mapResponsive(st.responsive),
          items: (sec.items || []).map((item) => ({
            title: item.title || "",
            description: item.description || "",
            badge: item.badge || "",
            price: item.price || "",
            icon: normalizeIcon(item.icon),
            link: item.link || "",
            linkText: item.linkText || "",
            highlight: Boolean(item.highlight),
            colSpan:
              item.colSpan === "full" || item.colSpan === 2 || item.colSpan === 3
                ? String(item.colSpan) as "2" | "3" | "full"
                : "1",
            rowSpan: item.rowSpan === 2 ? "2" : "1",
          })),
        },
      };

    case "split_banner":
      return {
        type: "SplitBannerBlock",
        props: {
          id: `SplitBannerBlock-${sec.id}`,
          heading: sec.heading || "",
          subheading: sec.subheading || "",
          ctaText: sec.ctaText || "",
          ctaLink: sec.ctaLink || "/schedule-repair",
          bgColor: st.bgColor || "#ffffff",
          textColor: st.textColor || "#111827",
          cardBgColor: st.cardBgColor || "#f8fafc",
          cardBorderColor: st.cardBorderColor || "#e2e8f0",
          accentColor: st.accentColor || "#00807A",
          padding: st.padding || "48px 32px",
          borderRadius: st.borderRadius || "12px",
          customCss,
          items: (sec.items || []).map((item) => ({
            badge: item.badge || "",
            title: item.title || "",
            description: item.description || "",
            icon: normalizeIcon(item.icon),
          })),
        },
      };

    case "faq":
      return {
        type: "FaqBlock",
        props: {
          id: `FaqBlock-${sec.id}`,
          heading: sec.heading || "",
          subheading: sec.subheading || "",
          displayLayout: st.displayLayout === "flex" ? "flex" : "grid",
          gridColumns: st.gridColumns || 1,
          gap: st.gap || "12px",
          bgColor: st.bgColor || "#f8fafc",
          textColor: st.textColor || "#111827",
          cardBgColor: st.cardBgColor || "#ffffff",
          cardBorderColor: st.cardBorderColor || "#e5e7eb",
          accentColor: st.accentColor || "#00807A",
          padding: st.padding || "48px 32px",
          align: st.align === "center" ? "center" : "left",
          borderRadius: st.borderRadius || "10px",
          customCss,
          responsive: mapResponsive(st.responsive),
          items: (sec.items || []).map((item) => ({
            title: item.title || "",
            description: item.description || "",
            colSpan:
              item.colSpan === "full" || item.colSpan === 2
                ? (String(item.colSpan) as "2" | "full")
                : "1",
          })),
        },
      };

    case "cta_banner":
      return {
        type: "CtaBannerBlock",
        props: {
          id: `CtaBannerBlock-${sec.id}`,
          heading: sec.heading || "",
          subheading: sec.subheading || "",
          ctaText: sec.ctaText || "Schedule Repair Now",
          ctaLink: sec.ctaLink || "/schedule-repair",
          bgColor: st.bgColor || "#0f172a",
          textColor: st.textColor || "#ffffff",
          accentColor: st.accentColor || "#00807A",
          padding: st.padding || "56px 32px",
          align: st.align === "left" ? "left" : "center",
          customCss,
        },
      };

    case "richtext":
    default:
      return {
        type: "RichTextBlock",
        props: {
          id: `RichTextBlock-${sec.id}`,
          heading: sec.heading || "",
          subheading: sec.subheading || "",
          bodyHtml: sec.bodyHtml || "",
          bgColor: st.bgColor || "#ffffff",
          textColor: st.textColor || "#111827",
          padding: st.padding || "48px 32px",
          align: st.align === "center" ? "center" : "left",
          customCss,
        },
      };
  }
}

export function cmsPageToPuckData(page: CMSPage): PuckPageData {
  if (
    page.puckData &&
    typeof page.puckData === "object" &&
    Array.isArray((page.puckData as { content?: unknown[] }).content)
  ) {
    return page.puckData as unknown as PuckPageData;
  }

  const content: PuckPageData["content"] = [];

  if (page.heroHeadline || page.heroSubtitle || page.primaryCtaText) {
    const hs = page.heroStyle || {};
    content.push({
      type: "HeroBlock",
      props: {
        id: `HeroBlock-${page.slug}`,
        badgeText: page.heroBadge || "",
        heading: page.heroHeadline || page.title || page.name,
        subheading: page.heroSubtitle || "",
        ctaText: page.primaryCtaText || "Book your repair",
        ctaLink: page.primaryCtaLink || "/schedule-repair",
        bgColor: hs.bgColor || "#0f172a",
        textColor: hs.textColor || "#ffffff",
        accentColor: hs.accentColor || "#00807A",
        badgeBg: hs.badgeBg || "rgba(0, 150, 145, 0.18)",
        badgeColor: hs.badgeColor || "#5eead4",
        padding: hs.padding || "56px 36px",
        align: hs.align === "center" ? "center" : "left",
        customCss: hs.customCss || "",
        responsive: mapResponsive(hs.responsive),
      },
    });
  }

  for (const sec of page.sections || []) {
    content.push(mapSectionToPuckBlock(sec));
  }

  return {
    root: { props: {} },
    content,
  };
}

