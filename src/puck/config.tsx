"use client";

import React from "react";
import { BuilderLink as Link, MissingHostWidget, getBuilderHost } from "./host";
import { FieldGroup, FieldTab, type Config } from "@puckeditor/core";
import {
  ArrowRight,
  ExternalLink,
  Star,
  MapPin,
  Phone,
  Clock,
  Check,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { scopeCustomCss } from "./core/customCss";
import type { PuckComponents } from "@/puck/types";
import {
  RenderItemIcon,
  SectionWrapper,
  buildContainerLayoutStyle,
  buildResponsiveMediaCss,
  buildVisibilityCss,
  FaqAccordionCard,
  sanitizeSectionId,
} from "@/puck/components/shared";
import { createColorField } from "@/puck/fields/ColorPickerField";
import { createSpacingField } from "@/puck/fields/SpacingField";
import { createIconPickerField } from "@/puck/fields/IconPickerField";
import { createCustomCssField } from "@/puck/fields/CustomCssField";
import { createResponsiveField } from "@/puck/fields/ResponsiveField";
import { createImagePickerField } from "@/puck/fields/ImagePickerField";
import { createVisibilityField } from "@/puck/fields/VisibilityField";
import { ColumnBlock } from "@/puck/layout/ElementorColumn";

const ALIGN_FIELD = {
  type: "radio" as const,
  label: "Alignment",
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
  ],
};

const LOCK_FIELD = {
  type: "radio" as const,
  label: "Lock Section (Prevent Delete/Drag)",
  options: [
    { label: "Unlocked", value: false },
    { label: "Locked", value: true },
  ],
};

function normalizeCssUnit(val?: string, fallback?: string): string | undefined {
  const trimmed = (val || "").trim();
  if (!trimmed) return fallback;
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

function resolveLockPermissions<T extends { locked?: boolean }>(
  data: { props: T },
  { permissions }: { permissions: Partial<Record<string, boolean>> }
) {
  if (data.props.locked) {
    return {
      ...permissions,
      delete: false,
      drag: false,
    };
  }
  return permissions;
}

export const puckConfig: Config<PuckComponents> = {
  categories: {
    layout: {
      title: "Layout (Flexbox & Grid)",
      components: ["FlexBlock", "GridBlock", "ContainerBlock", "ColumnBlock"],
    },
    basic: {
      title: "Basic Elements",
      components: [
        "HeadingBlock",
        "ParagraphBlock",
        "ButtonBlock",
        "ImageBlock",
        "VideoBlock",
        "IconBlock",
        "GoogleMapBlock",
        "SpacerDividerBlock",
        "HtmlBlock",
        "CounterBlock",
        "BreadcrumbBlock",
      ],
    },
    sections: {
      title: "Site Sections & Live Portals",
      components: [
        "HeroBlock",
        "RepairTrackerBlock",
        "StatsCounterRowBlock",
        "StepProcessBlock",
        "TestimonialBlock",
        "PricingTableBlock",
        "StoreCardBlock",
        "BookingFormBlock",
        "BlogPostGridBlock",
        "TabsBlock",
        "AccordionBlock",
        "TimelineBlock",
        "LogoStripBlock",
        "SplitBannerBlock",
        "FaqBlock",
        "ServicesGridBlock",
        "PopularRepairsBlock",
        "CtaBannerBlock",
        "FeatureCard",
        "RichTextBlock",
      ],
    },
  },
  components: {
    HeroBlock: {
      label: "Hero Banner",
      defaultProps: {
        badgeText: "Philadelphia's Trusted Leader",
        heading: "Fast, reliable repairs that keep your tech working.",
        subheading:
          "Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day warranty.",
        ctaText: "Book your repair",
        ctaLink: "/schedule-repair",
        bgColor: "#0f172a",
        textColor: "#ffffff",
        accentColor: "#009691",
        badgeBg: "rgba(0, 150, 145, 0.18)",
        badgeColor: "#5eead4",
        padding: "56px 36px",
        align: "left",
        customCss: "",
      },
      fields: {
        badgeText: { type: "text", label: "Badge Text" },
        heading: { type: "text", label: "Headline" },
        subheading: { type: "textarea", label: "Subtitle" },
        ctaText: { type: "text", label: "Primary CTA Text" },
        ctaLink: { type: "text", label: "Primary CTA Link" },
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        accentColor: createColorField("Accent / Button Color"),
        badgeBg: createColorField("Badge Background"),
        badgeColor: createColorField("Badge Text Color"),
        padding: createSpacingField("Section Padding"),
        align: ALIGN_FIELD,
        customCss: createCustomCssField(),
        responsive: createResponsiveField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.badgeText}
            {fields.heading}
            {fields.subheading}
            <FieldGroup label="Call to Action" defaultExpanded={true}>
              {fields.ctaText}
              {fields.ctaLink}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Colors" defaultExpanded={true}>
              {fields.bgColor}
              {fields.textColor}
              {fields.accentColor}
              {fields.badgeBg}
              {fields.badgeColor}
            </FieldGroup>
            <FieldGroup label="Spacing & Alignment" defaultExpanded={true}>
              {fields.padding}
              {fields.align}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.visibility}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        badgeText,
        heading,
        subheading,
        ctaText,
        ctaLink,
        bgColor,
        textColor,
        accentColor,
        badgeBg,
        badgeColor,
        padding,
        align,
        customCss,
        responsive,
        visibility,
      }) => {
        const safeId = sanitizeSectionId(id, "hero");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const responsiveCss = buildResponsiveMediaCss(safeId, responsive);
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor || "#0f172a",
              color: textColor || "#ffffff",
              padding: padding || "56px 36px",
              textAlign: align || "left",
            }}
            className="relative transition-all w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {responsiveCss && (
              <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
            )}
            {visibilityCss && (
              <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {badgeText && (
                <div className="inline-block mb-3">
                  <span
                    style={{
                      backgroundColor: badgeBg || "rgba(0, 150, 145, 0.18)",
                      color: badgeColor || "#5eead4",
                    }}
                    className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block"
                  >
                    {badgeText}
                  </span>
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
                {heading}
              </h1>
              {subheading && (
                <p
                  className="text-sm sm:text-base opacity-90 max-w-2xl mb-8 leading-relaxed"
                  style={{
                    marginLeft: align === "center" ? "auto" : undefined,
                    marginRight: align === "center" ? "auto" : undefined,
                  }}
                >
                  {subheading}
                </p>
              )}
              {ctaText && (
                <div>
                  <Link
                    href={ctaLink || "/schedule-repair"}
                    style={{ backgroundColor: accentColor || "#009691" }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-white font-bold text-sm shadow-lg hover:brightness-110 transition active:scale-95"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      },
    },

    ServicesGridBlock: {
      label: "Services / Benefits Grid",
      defaultProps: {
        variant: "services_grid",
        heading: "Our Repair Services",
        subheading: "Fast turnaround with genuine OEM-grade parts.",
        displayLayout: "grid",
        gridColumns: 3,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        alignItems: "stretch",
        gap: "16px",
        bgColor: "#ffffff",
        textColor: "#111827",
        cardBgColor: "#f9fafb",
        cardBorderColor: "#e5e7eb",
        accentColor: "#009691",
        padding: "48px 32px",
        align: "left",
        borderRadius: "10px",
        customCss: "",
        items: [
          {
            title: "Screen Replacement",
            description: "Cracked or unresponsive OLED/LCD replaced in 30 minutes.",
            badge: "Popular",
            price: "From $89",
            icon: "Wrench",
            link: "/schedule-repair",
            linkText: "Book Now",
            highlight: false,
            colSpan: "1",
            rowSpan: "1",
          },
          {
            title: "Battery Renewal",
            description: "Restore all-day battery health with zero data loss.",
            badge: "Same Day",
            price: "From $59",
            icon: "Zap",
            link: "/schedule-repair",
            linkText: "Book Now",
            highlight: false,
            colSpan: "1",
            rowSpan: "1",
          },
          {
            title: "90-Day Warranty",
            description: "All parts and labor covered by our shop warranty.",
            badge: "Included",
            price: "Free",
            icon: "Shield",
            link: "/warranty",
            linkText: "Learn More",
            highlight: true,
            colSpan: "1",
            rowSpan: "1",
          },
        ],
      },
      fields: {
        variant: {
          type: "radio",
          label: "Section Type",
          options: [
            { label: "Services Grid", value: "services_grid" },
            { label: "Benefits Grid", value: "benefits" },
          ],
        },
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        displayLayout: {
          type: "radio",
          label: "Layout Mode",
          options: [
            { label: "CSS Grid", value: "grid" },
            { label: "Flexbox", value: "flex" },
          ],
        },
        gridColumns: { type: "number", label: "Grid Columns (1-6)", min: 1, max: 6 },
        flexDirection: {
          type: "select",
          label: "Flex Direction",
          options: [
            { label: "Row", value: "row" },
            { label: "Column", value: "column" },
          ],
        },
        flexWrap: {
          type: "radio",
          label: "Flex Wrap",
          options: [
            { label: "Wrap", value: "wrap" },
            { label: "No Wrap", value: "nowrap" },
          ],
        },
        justifyContent: {
          type: "select",
          label: "Justify Content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "Space Between", value: "space-between" },
            { label: "End", value: "flex-end" },
          ],
        },
        alignItems: {
          type: "select",
          label: "Align Items",
          options: [
            { label: "Stretch", value: "stretch" },
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
          ],
        },
        gap: { type: "text", label: "Gap (e.g. 16px)" },
        bgColor: createColorField("Section Background"),
        textColor: createColorField("Section Text Color"),
        cardBgColor: createColorField("Card Background"),
        cardBorderColor: createColorField("Card Border Color"),
        accentColor: createColorField("Accent Color"),
        padding: createSpacingField("Section Padding"),
        borderRadius: { type: "text", label: "Card Radius (e.g. 10px)" },
        align: ALIGN_FIELD,
        customCss: createCustomCssField(),
        responsive: createResponsiveField({ includeLayout: true }),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
        items: {
          type: "array",
          label: "Cards",
          getItemSummary: (item) => item.title || "Card",
          arrayFields: {
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Description" },
            badge: { type: "text", label: "Badge" },
            price: { type: "text", label: "Price" },
            icon: createIconPickerField("Icon"),
            link: { type: "text", label: "Link URL" },
            linkText: { type: "text", label: "Link Text" },
            highlight: {
              type: "radio",
              label: "Highlight Ring",
              options: [
                { label: "No", value: false },
                { label: "Yes", value: true },
              ],
            },
            colSpan: {
              type: "select",
              label: "Grid Col Span",
              options: [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "Full Row", value: "full" },
              ],
            },
            rowSpan: {
              type: "select",
              label: "Grid Row Span",
              options: [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
              ],
            },
          },
        },
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.variant}
            {fields.heading}
            {fields.subheading}
            {fields.items}
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Grid & Flexbox Layout" defaultExpanded={true}>
              {fields.displayLayout}
              {fields.gridColumns}
              {fields.flexDirection}
              {fields.flexWrap}
              {fields.justifyContent}
              {fields.alignItems}
              {fields.gap}
            </FieldGroup>
            <FieldGroup label="Colors">
              {fields.bgColor}
              {fields.textColor}
              {fields.cardBgColor}
              {fields.cardBorderColor}
              {fields.accentColor}
            </FieldGroup>
            <FieldGroup label="Spacing & Radius">
              {fields.padding}
              {fields.borderRadius}
              {fields.align}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        heading,
        subheading,
        displayLayout,
        gridColumns,
        flexDirection,
        flexWrap,
        justifyContent,
        alignItems,
        gap,
        bgColor,
        textColor,
        cardBgColor,
        cardBorderColor,
        accentColor,
        padding,
        align,
        borderRadius,
        customCss,
        responsive,
        visibility,
        items,
      }) => {
        const containerStyle = buildContainerLayoutStyle({
          displayLayout,
          gridColumns,
          flexDirection,
          flexWrap,
          justifyContent,
          alignItems,
          gap,
        });
        const isFlex = displayLayout === "flex";

        return (
          <SectionWrapper
            id={id}
            bgColor={bgColor}
            textColor={textColor}
            padding={padding}
            align={align}
            customCss={customCss}
            responsive={responsive}
            responsiveGridCols={gridColumns}
            visibility={visibility}
          >
            {heading && (
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                {heading}
              </h2>
            )}
            {subheading && (
              <p
                className="text-sm opacity-75 mb-8 max-w-2xl leading-relaxed"
                style={{
                  marginLeft: align === "center" ? "auto" : undefined,
                  marginRight: align === "center" ? "auto" : undefined,
                }}
              >
                {subheading}
              </p>
            )}
            <div
              style={containerStyle}
              className={`w-full text-left ${
                isFlex ? "sfd-dynamic-flex" : "sfd-dynamic-grid"
              }`}
            >
              {(items || []).map((item, idx) => {
                const cardStyle: React.CSSProperties = {
                  backgroundColor: cardBgColor || "#f9fafb",
                  borderColor: cardBorderColor || "#e5e7eb",
                  borderRadius: borderRadius || "10px",
                };
                if (isFlex) {
                  cardStyle.flex = "1 1 240px";
                } else {
                  if (item.colSpan === "full") cardStyle.gridColumn = "1 / -1";
                  else if (item.colSpan === "2") cardStyle.gridColumn = "span 2";
                  else if (item.colSpan === "3") cardStyle.gridColumn = "span 3";
                  if (item.rowSpan === "2") cardStyle.gridRow = "span 2";
                }

                return (
                  <div
                    key={idx}
                    style={cardStyle}
                    className={`p-5 border relative transition-all duration-200 hover:shadow-md ${
                      item.highlight ? "ring-2 ring-[#009691] shadow-md" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {item.icon && item.icon !== "None" && (
                          <div
                            style={{
                              backgroundColor: `${accentColor || "#009691"}15`,
                              color: accentColor || "#009691",
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          >
                            <RenderItemIcon name={item.icon} className="w-4 h-4" />
                          </div>
                        )}
                        {item.badge && (
                          <span
                            style={{
                              backgroundColor: `${accentColor || "#009691"}15`,
                              color: accentColor || "#009691",
                            }}
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.price && (
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                          {item.price}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold mb-1.5 text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                    {(item.link || item.linkText) && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          href={item.link || "/schedule-repair"}
                          style={{ color: accentColor || "#009691" }}
                          className="text-xs font-bold hover:underline inline-flex items-center gap-1 group"
                        >
                          <span>{item.linkText || "Learn More"}</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionWrapper>
        );
      },
    },

    PopularRepairsBlock: {
      label: "Popular / Hardware Repairs Grid",
      defaultProps: {
        heading: "Check More Philadelphia Hardware Repairs",
        subheading: "All device models and hardware issues supported with express walk-in service in Philadelphia:",
        viewAllText: "View All Repairs",
        viewAllUrl: "/repairs",
        columns: 4,
        containerMode: "borderless",
        bgColor: "transparent",
        textColor: "#111827",
        accentColor: "#009691",
        cardBgColor: "#ffffff",
        cardBorderColor: "#e5e7eb",
        padding: "32px 0px",
        borderRadius: "8px",
        customCss: "",
        items: [
          { name: "iPhone 16 Pro Screen Repair", price: "From $119", url: "/repairs/smartphone/iphone-16-pro/screen-repair", actionText: "View →" },
          { name: "iPhone Battery Replacement", price: "From $69", url: "/repairs/smartphone/iphone-16-pro/battery-replacement", actionText: "View →" },
          { name: 'iPad Pro 12.9" Glass Fix', price: "From $149", url: "/repairs/tablet/ipad-pro-12-9/screen-repair", actionText: "View →" },
          { name: "Samsung Galaxy S25 Screen", price: "From $139", url: "/repairs/smartphone/galaxy-s25/screen-repair", actionText: "View →" },
          { name: "MacBook Pro Retina & Battery", price: "From $169", url: "/repairs/computer/macbook-pro", actionText: "View →" },
          { name: "PS5 HDMI Port Micro-Solder", price: "From $119", url: "/repairs/console/playstation-5/hdmi-port-replacement", actionText: "View →" },
          { name: "Water Damage Ultrasonic Bath", price: "Free Diagnostic", url: "/blog/what-to-do-water-damaged-phone", actionText: "View →" },
          { name: "Charging Port Replacement", price: "From $69", url: "/common-issues/smartphone/charging-port-replacement", actionText: "View →" },
        ],
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading / Description" },
        viewAllText: { type: "text", label: "View All Button Text" },
        viewAllUrl: { type: "text", label: "View All Link URL" },
        columns: {
          type: "number",
          label: "Columns (2-4)",
          min: 2,
          max: 4,
        },
        containerMode: {
          type: "radio",
          label: "Container Mode",
          options: [
            { label: "Borderless / Open (Top Border)", value: "borderless" as const },
            { label: "Clean Bordered Box", value: "clean" as const },
            { label: "White Card Box", value: "card" as const },
          ],
        },
        bgColor: createColorField("Section Background"),
        textColor: createColorField("Text Color"),
        accentColor: createColorField("Accent / Link Color"),
        cardBgColor: createColorField("Item Card Background"),
        cardBorderColor: createColorField("Item Card Border"),
        padding: createSpacingField("Section Padding"),
        borderRadius: { type: "text", label: "Card Border Radius (e.g. 8px)" },
        customCss: createCustomCssField(),
        responsive: createResponsiveField({ includeLayout: true }),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
        items: {
          type: "array",
          label: "Repair Items",
          getItemSummary: (item) => item.name || "Repair Item",
          arrayFields: {
            name: { type: "text", label: "Device / Repair Name" },
            price: { type: "text", label: "Price (e.g. From $119)" },
            url: { type: "text", label: "Target URL" },
            actionText: { type: "text", label: "Action Text (e.g. View →)" },
          },
        },
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.heading}
            {fields.subheading}
            {fields.viewAllText}
            {fields.viewAllUrl}
            {fields.items}
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Layout & Container" defaultExpanded={true}>
              {fields.containerMode}
              {fields.columns}
              {fields.padding}
              {fields.borderRadius}
            </FieldGroup>
            <FieldGroup label="Colors">
              {fields.bgColor}
              {fields.textColor}
              {fields.accentColor}
              {fields.cardBgColor}
              {fields.cardBorderColor}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        heading = "Check More Philadelphia Hardware Repairs",
        subheading = "All device models and hardware issues supported with express walk-in service in Philadelphia:",
        viewAllText = "View All Repairs",
        viewAllUrl = "/repairs",
        columns = 4,
        containerMode = "borderless",
        bgColor = "transparent",
        textColor = "#111827",
        accentColor = "#009691",
        cardBgColor = "#ffffff",
        cardBorderColor = "#e5e7eb",
        padding = "32px 0px",
        borderRadius = "8px",
        customCss,
        responsive,
        visibility,
        items = [],
      }) => {
        const cleanSectionId = sanitizeSectionId(id, "popular-repairs");
        const responsiveCss = buildResponsiveMediaCss(cleanSectionId, responsive);
        const visibilityCss = buildVisibilityCss(cleanSectionId, visibility);
        const scopedCustomCss = scopeCustomCss(customCss, cleanSectionId);

        const colClass =
          Number(columns) === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : Number(columns) === 3
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

        const containerClasses =
          containerMode === "clean"
            ? "rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-6 sm:p-7"
            : containerMode === "card"
            ? "rounded-xl border border-neutral-200 bg-white shadow-xs p-6 sm:p-7"
            : "pt-8 border-t border-neutral-200";

        return (
          <SectionWrapper
            id={cleanSectionId}
            bgColor={bgColor !== "transparent" ? bgColor : undefined}
            textColor={textColor}
            padding={padding}
            align="left"
            customCss={customCss}
            responsive={responsive}
            visibility={visibility}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className={containerClasses}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div>
                    {heading && (
                      <h3
                        className="text-base sm:text-lg font-bold tracking-tight"
                        style={{ color: textColor }}
                      >
                        {heading}
                      </h3>
                    )}
                    {subheading && (
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        {subheading}
                      </p>
                    )}
                  </div>
                  {viewAllText && viewAllUrl && (
                    <Link
                      href={viewAllUrl}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold hover:underline shrink-0"
                      style={{ color: accentColor }}
                    >
                      <span>{viewAllText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {items && items.length > 0 && (
                  <div className={`grid ${colClass} gap-3 mt-5`}>
                    {items.map((item, idx) => (
                      <Link
                        key={`${item.name}-${idx}`}
                        href={item.url || "/repairs"}
                        className="group block p-3.5 rounded-lg border transition-all shadow-2xs hover:shadow-xs"
                        style={{
                          backgroundColor: cardBgColor,
                          borderColor: cardBorderColor,
                          borderRadius: normalizeCssUnit(borderRadius, "8px"),
                        }}
                      >
                        <span
                          className="text-xs sm:text-sm font-semibold block truncate group-hover:opacity-80 transition-opacity"
                          style={{ color: textColor }}
                        >
                          {item.name}
                        </span>
                        <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                          <span className="font-semibold text-neutral-600">
                            {item.price || "Available"}
                          </span>
                          <span
                            className="font-medium transition-colors flex items-center gap-0.5"
                            style={{ color: accentColor }}
                          >
                            {item.actionText || "View →"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionWrapper>
        );
      },
    },

    SplitBannerBlock: {
      label: "Split Feature Banner",
      defaultProps: {
        heading: "Why Philadelphia Trusts SmartFone Doctor",
        subheading:
          "Walk in without an appointment or book online for priority bench service.",
        ctaText: "Schedule Repair",
        ctaLink: "/schedule-repair",
        bgColor: "#ffffff",
        textColor: "#111827",
        cardBgColor: "#f8fafc",
        cardBorderColor: "#e2e8f0",
        accentColor: "#009691",
        padding: "48px 32px",
        borderRadius: "12px",
        customCss: "",
        items: [
          {
            badge: "Quality",
            title: "OEM-Grade Replacement Parts",
            description: "Tested before and after installation for full brightness and touch accuracy.",
            icon: "CheckCircle2",
          },
          {
            badge: "Speed",
            title: "Same-Day Turnaround",
            description: "Most screen and battery jobs are completed in 30 to 45 minutes.",
            icon: "Clock",
          },
        ],
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        ctaText: { type: "text", label: "CTA Text" },
        ctaLink: { type: "text", label: "CTA Link" },
        bgColor: createColorField("Section Background"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background"),
        cardBorderColor: createColorField("Card Border Color"),
        accentColor: createColorField("Accent Color"),
        padding: createSpacingField("Section Padding"),
        borderRadius: { type: "text", label: "Card Radius" },
        customCss: createCustomCssField(),
        responsive: createResponsiveField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
        items: {
          type: "array",
          label: "Side Highlights",
          getItemSummary: (item) => item.title || "Highlight",
          arrayFields: {
            badge: { type: "text", label: "Badge" },
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Description" },
            icon: createIconPickerField("Icon"),
          },
        },
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.heading}
            {fields.subheading}
            <FieldGroup label="Call to Action" defaultExpanded={true}>
              {fields.ctaText}
              {fields.ctaLink}
            </FieldGroup>
            {fields.items}
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Colors" defaultExpanded={true}>
              {fields.bgColor}
              {fields.textColor}
              {fields.cardBgColor}
              {fields.cardBorderColor}
              {fields.accentColor}
            </FieldGroup>
            <FieldGroup label="Spacing & Radius">
              {fields.padding}
              {fields.borderRadius}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        heading,
        subheading,
        ctaText,
        ctaLink,
        bgColor,
        textColor,
        cardBgColor,
        cardBorderColor,
        accentColor,
        padding,
        borderRadius,
        customCss,
        responsive,
        items,
      }) => (
        <SectionWrapper
          id={id}
          bgColor={bgColor}
          textColor={textColor}
          padding={padding}
          align="left"
          customCss={customCss}
          responsive={responsive}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {heading}
              </h3>
              {subheading && (
                <p className="text-sm opacity-80 leading-relaxed max-w-lg">
                  {subheading}
                </p>
              )}
              {ctaText && (
                <div>
                  <Link
                    href={ctaLink || "/schedule-repair"}
                    style={{ backgroundColor: accentColor || "#009691" }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-xs sm:text-sm font-bold shadow hover:brightness-110 transition active:scale-95"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {(items || []).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: cardBgColor || "#f8fafc",
                    borderColor: cardBorderColor || "#e2e8f0",
                    borderRadius: borderRadius || "12px",
                  }}
                  className="p-5 border shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {item.icon && item.icon !== "None" && (
                      <div style={{ color: accentColor || "#009691" }} className="shrink-0">
                        <RenderItemIcon name={item.icon} className="w-4 h-4" />
                      </div>
                    )}
                    {item.badge && (
                      <span
                        style={{ color: accentColor || "#009691" }}
                        className="text-[10px] font-bold uppercase tracking-wider block"
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold mb-1 text-gray-900">{item.title}</h4>
                  <p className="text-xs opacity-75 leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      ),
    },

    FaqBlock: {
      label: "FAQ Accordion",
      defaultProps: {
        heading: "Frequently Asked Questions",
        subheading: "Clear answers about turnaround time, parts quality, and warranty.",
        displayLayout: "grid",
        gridColumns: 1,
        gap: "12px",
        bgColor: "#f8fafc",
        textColor: "#111827",
        cardBgColor: "#ffffff",
        cardBorderColor: "#e5e7eb",
        accentColor: "#009691",
        padding: "48px 32px",
        align: "left",
        borderRadius: "10px",
        customCss: "",
        items: [
          {
            title: "How long does a typical screen repair take?",
            description: "Most iPhone and Samsung screen replacements take 30–45 minutes.",
            colSpan: "1",
          },
          {
            title: "Will my data be erased during repair?",
            description: "No, standard hardware repairs do not touch your data.",
            colSpan: "1",
          },
        ],
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        displayLayout: {
          type: "radio",
          label: "Layout Mode",
          options: [
            { label: "CSS Grid", value: "grid" },
            { label: "Flexbox", value: "flex" },
          ],
        },
        gridColumns: { type: "number", label: "Grid Columns (1-3)", min: 1, max: 3 },
        gap: { type: "text", label: "Gap (e.g. 12px)" },
        bgColor: createColorField("Section Background"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background"),
        cardBorderColor: createColorField("Card Border Color"),
        accentColor: createColorField("Accent Color"),
        padding: createSpacingField("Section Padding"),
        borderRadius: { type: "text", label: "Card Radius" },
        align: ALIGN_FIELD,
        customCss: createCustomCssField(),
        responsive: createResponsiveField({ includeLayout: true }),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
        items: {
          type: "array",
          label: "FAQ Items",
          getItemSummary: (item) => item.title || "Question",
          arrayFields: {
            title: { type: "text", label: "Question" },
            description: { type: "textarea", label: "Answer" },
            colSpan: {
              type: "select",
              label: "Grid Col Span",
              options: [
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "Full", value: "full" },
              ],
            },
          },
        },
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.heading}
            {fields.subheading}
            {fields.items}
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Grid & Flexbox Layout" defaultExpanded={true}>
              {fields.displayLayout}
              {fields.gridColumns}
              {fields.gap}
            </FieldGroup>
            <FieldGroup label="Colors">
              {fields.bgColor}
              {fields.textColor}
              {fields.cardBgColor}
              {fields.cardBorderColor}
              {fields.accentColor}
            </FieldGroup>
            <FieldGroup label="Spacing & Radius">
              {fields.padding}
              {fields.borderRadius}
              {fields.align}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        heading,
        subheading,
        displayLayout,
        gridColumns,
        gap,
        bgColor,
        textColor,
        cardBgColor,
        cardBorderColor,
        accentColor,
        padding,
        align,
        borderRadius,
        customCss,
        responsive,
        items,
      }) => {
        const isCenter = align === "center";
        const containerStyle = buildContainerLayoutStyle({
          displayLayout,
          gridColumns,
          gap,
          justifyContent: isCenter ? "center" : undefined,
        });
        const isFlex = displayLayout === "flex";

        return (
          <SectionWrapper
            id={id}
            bgColor={bgColor}
            textColor={textColor}
            padding={padding}
            align={align}
            customCss={customCss}
            responsive={responsive}
            responsiveGridCols={gridColumns}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {heading && (
                <h2
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${
                    isCenter ? "text-center" : "text-left"
                  }`}
                >
                  {heading}
                </h2>
              )}
              {subheading && (
                <p
                  className={`text-sm opacity-75 mb-8 max-w-2xl leading-relaxed ${
                    isCenter ? "mx-auto text-center" : "text-left"
                  }`}
                  style={{
                    marginLeft: isCenter ? "auto" : undefined,
                    marginRight: isCenter ? "auto" : undefined,
                  }}
                >
                  {subheading}
                </p>
              )}
              <div
                style={{
                  ...containerStyle,
                  marginLeft: isCenter ? "auto" : undefined,
                  marginRight: isCenter ? "auto" : undefined,
                }}
                className={`w-full max-w-3xl text-left ${
                  isCenter ? "mx-auto" : ""
                } ${isFlex ? "sfd-dynamic-flex" : "sfd-dynamic-grid"}`}
              >
                {(items || []).map((faq, idx) => (
                  <FaqAccordionCard
                    key={idx}
                    item={faq}
                    displayLayout={displayLayout}
                    cardBgColor={cardBgColor}
                    cardBorderColor={cardBorderColor}
                    borderRadius={borderRadius}
                    accentColor={accentColor}
                  />
                ))}
              </div>
            </div>
          </SectionWrapper>
        );
      },
    },

    CtaBannerBlock: {
      label: "CTA Banner",
      defaultProps: {
        heading: "Ready to Fix Your Device Today?",
        subheading: "Book online in 60 seconds or visit one of our Philadelphia locations.",
        ctaText: "Schedule Repair Now",
        ctaLink: "/schedule-repair",
        bgColor: "#0f172a",
        textColor: "#ffffff",
        accentColor: "#009691",
        padding: "56px 32px",
        align: "center",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        ctaText: { type: "text", label: "Button Text" },
        ctaLink: { type: "text", label: "Button Link" },
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        accentColor: createColorField("Button Color"),
        padding: createSpacingField("Section Padding"),
        align: ALIGN_FIELD,
        customCss: createCustomCssField(),
        responsive: createResponsiveField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.heading}
            {fields.subheading}
            <FieldGroup label="Call to Action" defaultExpanded={true}>
              {fields.ctaText}
              {fields.ctaLink}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Colors" defaultExpanded={true}>
              {fields.bgColor}
              {fields.textColor}
              {fields.accentColor}
            </FieldGroup>
            <FieldGroup label="Spacing & Alignment" defaultExpanded={true}>
              {fields.padding}
              {fields.align}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        heading,
        subheading,
        ctaText,
        ctaLink,
        bgColor,
        textColor,
        accentColor,
        padding,
        align = "center",
        customCss,
        responsive,
        ...rest
      }: any) => {
        const finalHeading = heading || rest?.headline || "Ready to Fix Your Device Today?";
        const finalCtaText = ctaText || rest?.buttonText || "Schedule Repair Now";
        const finalCtaLink = ctaLink || rest?.buttonLink || "/schedule-repair";
        const isCenter = (align || "center") === "center";

        return (
          <SectionWrapper
            id={id}
            bgColor={bgColor}
            textColor={textColor}
            padding={padding}
            align={align || "center"}
            customCss={customCss}
            responsive={responsive}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {finalHeading && (
                <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${isCenter ? "text-center" : "text-left"}`}>
                  {finalHeading}
                </h2>
              )}
              {subheading && (
                <p
                  className={`text-sm opacity-80 mb-6 max-w-2xl leading-relaxed ${isCenter ? "mx-auto text-center" : "text-left"}`}
                  style={{
                    marginLeft: isCenter ? "auto" : undefined,
                    marginRight: isCenter ? "auto" : undefined,
                  }}
                >
                  {subheading}
                </p>
              )}
              <div className={`mt-4 flex ${isCenter ? "justify-center" : "justify-start"}`}>
                <Link
                  href={finalCtaLink}
                  style={{ backgroundColor: accentColor || "#009691" }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-white text-sm font-bold shadow-md hover:brightness-110 transition active:scale-95"
                >
                  <span>{finalCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </SectionWrapper>
        );
      },
    },

    RepairTrackerBlock: {
      label: "Repair Live Tracker",
      defaultProps: {
        title: "Check your repair status",
        subtitle:
          "Checking the live status of your repair is quick and easy at SmartFoneDoctor. Simply enter your Ticket ID and Last Name below.",
        demoTicketId: "SFD-84920",
        demoLastName: "Smith",
        accentColor: "#c8102e",
        secondaryColor: "#009691",
        showStoreCard: true,
        showPickupChecklist: true,
        customCss: "",
      },
      fields: {
        title: { type: "text", label: "Form Title" },
        subtitle: { type: "textarea", label: "Form Subtitle" },
        demoTicketId: { type: "text", label: "Demo Ticket ID" },
        demoLastName: { type: "text", label: "Demo Last Name" },
        accentColor: createColorField("Primary Accent (Button)"),
        secondaryColor: createColorField("Secondary Color (Status/Timeline)"),
        showStoreCard: {
          type: "radio",
          label: "Show Store Details Card",
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false },
          ],
        },
        showPickupChecklist: {
          type: "radio",
          label: "Show Pickup Checklist Notice",
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false },
          ],
        },
        customCss: createCustomCssField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.title}
            {fields.subtitle}
            <FieldGroup label="Demo Helpers" defaultExpanded={true}>
              {fields.demoTicketId}
              {fields.demoLastName}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Colors" defaultExpanded={true}>
              {fields.accentColor}
              {fields.secondaryColor}
            </FieldGroup>
            <FieldGroup label="Sidebar Cards" defaultExpanded={true}>
              {fields.showStoreCard}
              {fields.showPickupChecklist}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.visibility}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        title,
        subtitle,
        demoTicketId,
        demoLastName,
        accentColor,
        secondaryColor,
        showStoreCard,
        showPickupChecklist,
        customCss,
        visibility,
      }) => {
        const safeId = sanitizeSectionId(id, "tracker");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section id={`sfd-section-${safeId}`} className="w-full">
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            {(() => {
              const RepairTrackerWidget = getBuilderHost().widgets.RepairTracker;
              if (!RepairTrackerWidget) return <MissingHostWidget name="Repair tracker" />;
              return (
            <RepairTrackerWidget
              title={title}
              subtitle={subtitle}
              demoTicketId={demoTicketId}
              demoLastName={demoLastName}
              accentColor={accentColor}
              secondaryColor={secondaryColor}
              showStoreCard={showStoreCard}
              showPickupChecklist={showPickupChecklist}
            />
              );
            })()}
          </section>
        );
      },
    },

    StatsCounterRowBlock: {
      label: "Stats Counter Row",
      defaultProps: {
        heading: "Philadelphia's Trusted Leader in Fast Device Repairs",
        subheading: "Every repair backed by WISE certification, OEM parts, and a 90-day warranty.",
        columns: 4,
        items: [
          { value: "5,000+", suffix: "", label: "Devices Repaired", subtext: "across Philadelphia" },
          { value: "45", suffix: " min", label: "Average Turnaround", subtext: "for screen & battery" },
          { value: "4.9", suffix: " ★", label: "Google Rating", subtext: "500+ verified reviews" },
          { value: "90", suffix: " days", label: "Warranty Coverage", subtext: "parts & craftsmanship" },
        ],
        bgColor: "#0f172a",
        textColor: "#ffffff",
        accentColor: "#009691",
        padding: "48px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Section Heading" },
        subheading: { type: "textarea", label: "Section Subheading" },
        columns: {
          type: "number",
          label: "Columns (2-4)",
          min: 2,
          max: 4,
        },
        items: {
          type: "array",
          label: "Stat Items",
          arrayFields: {
            value: { type: "text", label: "Stat Number (e.g. 5,000+)" },
            suffix: { type: "text", label: "Suffix (e.g. min, days, %)" },
            label: { type: "text", label: "Stat Label" },
            subtext: { type: "text", label: "Subtext / Description" },
          },
          getItemSummary: (item) => `${item.value || ""}${item.suffix || ""} - ${item.label || "Stat"}`,
        },
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        accentColor: createColorField("Accent Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading,
        subheading,
        columns = 4,
        items = [],
        bgColor = "#0f172a",
        textColor = "#ffffff",
        accentColor = "#009691",
        padding = "48px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "stats-row");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        const colClass =
          columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : columns === 3
            ? "grid-cols-1 sm:grid-cols-3"
            : "grid-cols-2 lg:grid-cols-4";

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "48px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-10">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}
              <div className={`grid ${colClass} gap-6`}>
                {items.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col items-center text-center transition hover:border-white/25"
                  >
                    <div
                      style={{ color: accentColor }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-2"
                    >
                      {it.value}
                      {it.suffix && <span className="text-xl sm:text-2xl font-bold ml-0.5">{it.suffix}</span>}
                    </div>
                    <div className="text-sm font-bold mb-1">{it.label}</div>
                    {it.subtext && (
                      <div className="text-xs opacity-70 leading-relaxed">{it.subtext}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      },
    },

    StepProcessBlock: {
      label: "Step-by-Step Process",
      defaultProps: {
        heading: "How SmartFoneDoctor Works",
        subheading: "Fast, simple, hassle-free repair process from intake to pickup.",
        layout: "horizontal",
        steps: [
          { stepNumber: "01", title: "Walk In or Book Online", description: "Visit any of our 3 Philadelphia repair centers or reserve a slot online.", badge: "Step 1" },
          { stepNumber: "02", title: "Free 10-Min Diagnostic", description: "Our certified technician audits device damage and provides a fixed quote.", badge: "Step 2" },
          { stepNumber: "03", title: "Precision Bench Repair", description: "Most screen and battery replacements completed in 30-45 minutes.", badge: "Step 3" },
          { stepNumber: "04", title: "Quality Check & Pickup", description: "Comprehensive 18-point functional test and warranty handover.", badge: "Step 4" },
        ],
        bgColor: "#f8fafc",
        textColor: "#0f172a",
        accentColor: "#009691",
        padding: "56px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        layout: {
          type: "radio",
          label: "Layout",
          options: [
            { label: "Horizontal Grid", value: "horizontal" },
            { label: "Vertical Timeline", value: "vertical" },
          ],
        },
        steps: {
          type: "array",
          label: "Process Steps",
          arrayFields: {
            stepNumber: { type: "text", label: "Step Number (e.g. 01)" },
            title: { type: "text", label: "Step Title" },
            description: { type: "textarea", label: "Step Description" },
            badge: { type: "text", label: "Badge Tag (optional)" },
          },
          getItemSummary: (item) => `${item.stepNumber || "Step"}: ${item.title || ""}`,
        },
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        accentColor: createColorField("Accent Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading,
        subheading,
        layout = "horizontal",
        steps = [],
        bgColor = "#f8fafc",
        textColor = "#0f172a",
        accentColor = "#009691",
        padding = "56px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "step-process");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "56px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-12">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}
              {layout === "horizontal" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                  {steps.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span
                            style={{
                              backgroundColor: `${accentColor}15`,
                              color: accentColor,
                            }}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm"
                          >
                            {st.stepNumber || `0${idx + 1}`}
                          </span>
                          {st.badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {st.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold mb-2 text-gray-900">{st.title}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">{st.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-4">
                  {steps.map((st: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-white border border-gray-200/80 flex items-start gap-4 shadow-xs"
                    >
                      <span
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                        }}
                        className="inline-flex shrink-0 items-center justify-center w-10 h-10 rounded-xl font-black text-sm"
                      >
                        {st.stepNumber || `0${idx + 1}`}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900">{st.title}</h3>
                          {st.badge && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {st.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{st.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      },
    },

    TestimonialBlock: {
      label: "Customer Testimonials",
      defaultProps: {
        heading: "What Our Philadelphia Customers Say",
        subheading: "Over 500+ five-star Google reviews from happy smartphone and laptop owners.",
        columns: 3,
        items: [
          {
            name: "Marcus Jenkins",
            role: "University City",
            rating: 5,
            text: "Fixed my iPhone 14 Pro shattered screen in 35 minutes flat while I waited. Screen looks OEM perfect and touch is super responsive. Highly recommended!",
            date: "Verified Google Review",
            source: "Google",
          },
          {
            name: "Sarah Lin",
            role: "West Philadelphia",
            rating: 5,
            text: "My MacBook wouldn't turn on after a coffee spill. The Apple Store said I needed a $900 board replacement. SmartFoneDoctor repaired it same day for a fraction of that!",
            date: "Verified Google Review",
            source: "Google",
          },
          {
            name: "David Thompson",
            role: "Center City",
            rating: 5,
            text: "Fastest repair service in the city. Clear pricing, no surprise fees, and they gave me a 90-day warranty on my Samsung battery replacement.",
            date: "Verified Google Review",
            source: "Google",
          },
        ],
        bgColor: "#ffffff",
        textColor: "#0f172a",
        cardBgColor: "#f8fafc",
        accentColor: "#009691",
        padding: "56px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        columns: {
          type: "number",
          label: "Columns (1-3)",
          min: 1,
          max: 3,
        },
        items: {
          type: "array",
          label: "Reviews",
          arrayFields: {
            name: { type: "text", label: "Customer Name" },
            role: { type: "text", label: "Customer City / Location" },
            rating: { type: "number", label: "Stars (1-5)", min: 1, max: 5 },
            text: { type: "textarea", label: "Review Content" },
            date: { type: "text", label: "Date / Badge" },
            source: {
              type: "select",
              label: "Source",
              options: [
                { label: "Google", value: "Google" },
                { label: "Yelp", value: "Yelp" },
                { label: "Direct Feedback", value: "Direct" },
              ],
            },
          },
          getItemSummary: (item) => `${item.name || "Customer"} (${item.rating || 5}★)`,
        },
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background"),
        accentColor: createColorField("Accent Color (Stars/Highlights)"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading,
        subheading,
        columns = 3,
        items = [],
        bgColor = "#ffffff",
        textColor = "#0f172a",
        cardBgColor = "#f8fafc",
        accentColor = "#009691",
        padding = "56px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "testimonials");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        const colClass =
          columns === 1
            ? "grid-cols-1 max-w-2xl mx-auto"
            : columns === 2
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "56px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-12">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}
              <div className={`grid ${colClass} gap-6`}>
                {items.map((rev: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: cardBgColor }}
                    className="p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (rev.rating || 5)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {rev.source && (
                          <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200/80">
                            {rev.source}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4 italic">
                        &ldquo;{rev.text}&rdquo;
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{rev.name}</div>
                        {rev.role && <div className="text-gray-500 text-[11px]">{rev.role}</div>}
                      </div>
                      {rev.date && <div className="text-gray-400 text-[10px]">{rev.date}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      },
    },

    PricingTableBlock: {
      label: "Pricing & Services Table",
      defaultProps: {
        heading: "Transparent, Upfront Repair Pricing",
        subheading: "No hidden diagnostic fees. Free inspection with every quote.",
        items: [
          {
            service: "OLED Screen Replacement",
            device: "iPhone 13 / 14 / 15",
            price: "$119",
            turnaround: "30 Mins",
            warranty: "Lifetime Limited",
            popular: true,
            badge: "Most Popular",
            ctaText: "Book Repair",
            ctaLink: "/schedule-repair",
          },
          {
            service: "OEM Battery Replacement",
            device: "All Smartphone Models",
            price: "$59",
            turnaround: "25 Mins",
            warranty: "90-Day Free",
            popular: false,
            badge: "",
            ctaText: "Book Repair",
            ctaLink: "/schedule-repair",
          },
          {
            service: "Charging Port Micro-Solder",
            device: "iPhone / Android",
            price: "$69",
            turnaround: "45 Mins",
            warranty: "90-Day Free",
            popular: false,
            badge: "",
            ctaText: "Book Repair",
            ctaLink: "/schedule-repair",
          },
          {
            service: "Liquid Damage Ultrasonic Clean",
            device: "Laptops & Phones",
            price: "$89",
            turnaround: "Same Day",
            warranty: "Diagnostic Certified",
            popular: false,
            badge: "",
            ctaText: "Book Repair",
            ctaLink: "/schedule-repair",
          },
        ],
        bgColor: "#f8fafc",
        textColor: "#0f172a",
        cardBgColor: "#ffffff",
        accentColor: "#009691",
        padding: "56px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        items: {
          type: "array",
          label: "Pricing Cards",
          arrayFields: {
            service: { type: "text", label: "Service Name" },
            device: { type: "text", label: "Device Models / Category" },
            price: { type: "text", label: "Price (e.g. $119)" },
            turnaround: { type: "text", label: "Turnaround (e.g. 30 Mins)" },
            warranty: { type: "text", label: "Warranty (e.g. 90-Day Free)" },
            popular: {
              type: "radio",
              label: "Highlight / Popular",
              options: [
                { label: "Normal", value: false },
                { label: "Popular / Featured", value: true },
              ],
            },
            badge: { type: "text", label: "Badge Tag" },
            ctaText: { type: "text", label: "CTA Button Text" },
            ctaLink: { type: "text", label: "CTA Button Link" },
          },
          getItemSummary: (item) => `${item.service || "Service"} (${item.price || "$0"})`,
        },
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background"),
        accentColor: createColorField("Accent Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading,
        subheading,
        items = [],
        bgColor = "#f8fafc",
        textColor = "#0f172a",
        cardBgColor = "#ffffff",
        accentColor = "#009691",
        padding = "56px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "pricing-table");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "56px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-12">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: cardBgColor }}
                    className={`relative p-6 rounded-2xl flex flex-col justify-between transition ${
                      it.popular
                        ? "border-2 border-[#009691] shadow-lg scale-[1.02]"
                        : "border border-gray-200/80 shadow-xs hover:shadow-md"
                    }`}
                  >
                    {it.badge && (
                      <span
                        style={{
                          backgroundColor: it.popular ? accentColor : "#e2e8f0",
                          color: it.popular ? "#ffffff" : "#334155",
                        }}
                        className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs"
                      >
                        {it.badge}
                      </span>
                    )}
                    <div>
                      {it.device && (
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                          {it.device}
                        </div>
                      )}
                      <h3 className="text-base font-bold text-gray-900 mb-3">{it.service}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span
                          style={{ color: accentColor }}
                          className="text-3xl font-black tracking-tight"
                        >
                          {it.price}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">starting</span>
                      </div>
                      <div className="space-y-2 py-3 border-t border-gray-100 text-xs text-gray-600 mb-6">
                        {it.turnaround && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>{it.turnaround} average turnaround</span>
                          </div>
                        )}
                        {it.warranty && (
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{it.warranty} warranty</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      href={it.ctaLink || "/schedule-repair"}
                      style={{
                        backgroundColor: it.popular ? accentColor : "#0f172a",
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold text-white shadow-xs hover:brightness-110 transition active:scale-95 block"
                    >
                      {it.ctaText || "Book Repair"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      },
    },

    StoreCardBlock: {
      label: "Store Location Card",
      defaultProps: {
        storeName: "SmartFoneDoctor Flagship Store #1",
        badge: "Walk-ins Welcome • Open Today",
        address: "33 S 52nd St, Philadelphia, PA 19139",
        phone: "(215) 598-2090",
        hoursText: "Mon–Sat: 10:00 AM – 7:30 PM | Sun: 11:00 AM – 5:00 PM",
        gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
        appointmentUrl: "/schedule-repair",
        accentColor: "#009691",
        bgColor: "#ffffff",
        textColor: "#0f172a",
        padding: "32px 24px",
        customCss: "",
      },
      fields: {
        storeName: { type: "text", label: "Store Name" },
        badge: { type: "text", label: "Badge Tag" },
        address: { type: "text", label: "Full Address" },
        phone: { type: "text", label: "Phone Number" },
        hoursText: { type: "textarea", label: "Operating Hours Text" },
        gmbUrl: { type: "text", label: "Google Maps / Directions URL" },
        appointmentUrl: { type: "text", label: "Book Appointment URL" },
        accentColor: createColorField("Accent Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        padding: createSpacingField("Card Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        storeName,
        badge,
        address,
        phone,
        hoursText,
        gmbUrl = "https://share.google/gTlyWLewR88ToAdJQ",
        appointmentUrl = "/schedule-repair",
        accentColor = "#009691",
        bgColor = "#ffffff",
        textColor = "#0f172a",
        padding = "32px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "store-card");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section className="w-full py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                id={`sfd-section-${safeId}`}
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  padding: normalizeCssUnit(padding, "32px 24px"),
                }}
                className="w-full rounded-2xl border border-gray-200/80 shadow-xs"
              >
                {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
                {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    {badge && (
                      <span
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                        }}
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5"
                      >
                        {badge}
                      </span>
                    )}
                    <h3 className="text-lg font-bold">{storeName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${phone.replace(/\D/g, "")}`}
                      style={{ backgroundColor: accentColor }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold hover:brightness-110 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Store</span>
                    </a>
                    <a
                      href={gmbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gray-600" />
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{hoursText}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      },
    },

    BookingFormBlock: {
      label: "Interactive Booking Form",
      defaultProps: {
        mode: "interactive",
        heading: "Schedule Your Same-Day Repair",
        subheading:
          "Select your device, describe the issue, and pick your preferred Philadelphia store for express bench check-in.",
        badge: "Priority Bench Check-In",
        buttonText: "Schedule Repair Now",
        redirectUrl: "/schedule-repair",
        accentColor: "#009691",
        bgColor: "#ffffff",
        textColor: "#0f172a",
        cardBgColor: "#1e293b",
        padding: "32px 16px",
        customCss: "",
      },
      fields: {
        mode: {
          type: "radio",
          label: "Display Mode",
          options: [
            { label: "Interactive Multi-Step Wizard", value: "interactive" },
            { label: "Compact Banner / Teaser", value: "teaser" },
          ],
        },
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        badge: { type: "text", label: "Badge Tag" },
        buttonText: { type: "text", label: "Button Text (Teaser Mode)" },
        redirectUrl: { type: "text", label: "Booking Redirect URL (Teaser Mode)" },
        accentColor: createColorField("Accent Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background Color (Teaser Mode)"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        mode = "interactive",
        heading = "Schedule Your Same-Day Repair",
        subheading,
        badge = "Priority Bench Check-In",
        buttonText = "Schedule Repair Now",
        redirectUrl = "/schedule-repair",
        accentColor = "#009691",
        bgColor = "#ffffff",
        textColor = "#0f172a",
        cardBgColor = "#1e293b",
        padding = "32px 16px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "form");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        if (mode !== "teaser") {
          return (
            <section
              id="form"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                padding: normalizeCssUnit(padding, "32px 16px"),
              }}
              className="w-full relative"
            >
              {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
              {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {(heading || subheading) && (
                  <div className="text-center max-w-2xl mx-auto mb-8">
                    {badge && (
                      <span
                        style={{
                          backgroundColor: `${accentColor}18`,
                          color: accentColor,
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{badge}</span>
                      </span>
                    )}
                    {heading && (
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">
                        {heading}
                      </h2>
                    )}
                    {subheading && (
                      <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                        {subheading}
                      </p>
                    )}
                  </div>
                )}
                <React.Suspense
                  fallback={
                    <div className="p-12 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">
                      Loading repair booking wizard...
                    </div>
                  }
                >
                  {(() => {
                    const ScheduleRepairWizard = getBuilderHost().widgets.BookingWizard;
                    return ScheduleRepairWizard ? (
                      <ScheduleRepairWizard />
                    ) : (
                      <MissingHostWidget name="Booking wizard" />
                    );
                  })()}
                </React.Suspense>
              </div>
            </section>
          );
        }

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "56px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-4xl mx-auto">
              <div
                style={{ backgroundColor: cardBgColor }}
                className="rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden"
              >
                <div className="text-center max-w-2xl mx-auto mb-8">
                  {badge && (
                    <span
                      style={{
                        backgroundColor: `${accentColor}25`,
                        color: accentColor,
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{badge}</span>
                    </span>
                  )}
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-sm opacity-80 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Step 1", title: "Select Device", desc: "iPhone, Samsung, Mac, iPad" },
                    { label: "Step 2", title: "Choose Branch", desc: "52nd St or Lancaster Ave" },
                    { label: "Step 3", title: "Get Fixed", desc: "30-min express turnaround" },
                  ].map((s: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                        {s.label}
                      </span>
                      <h4 className="text-sm font-bold text-white mb-0.5">{s.title}</h4>
                      <p className="text-xs text-gray-400">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href={redirectUrl || "/schedule-repair"}
                    style={{ backgroundColor: accentColor }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg hover:brightness-110 transition flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="tel:2155982090"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition flex items-center justify-center gap-2 border border-white/15"
                  >
                    <Phone className="w-4 h-4 text-teal-400" />
                    <span>Call (215) 598-2090</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      },
    },

    BlogPostGridBlock: {
      label: "Blog Post Grid",
      defaultProps: {
        heading: "Expert Repair Guides & Tech News",
        subheading:
          "Latest maintenance guides, device teardowns, and troubleshooting tips from our master technicians.",
        columns: 3,
        items: [
          {
            title: "Dropped Your Phone in Water? 4 Critical Steps Before Bringing It to the Shop",
            excerpt:
              "What to do immediately after liquid exposure to prevent logic board short circuits and galvanic corrosion.",
            category: "Emergency Guide",
            readTime: "4 min read",
            date: "Oct 24, 2026",
            link: "/blog/water-damage-emergency-steps",
            image:
              "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
          },
          {
            title: "OEM vs Aftermarket Screens: Why Original Quality Displays Matter",
            excerpt:
              "Understanding the difference between 120Hz TrueTone OLED panels and cheap aftermarket LCD replacements.",
            category: "Screen Repair",
            readTime: "5 min read",
            date: "Oct 18, 2026",
            link: "/blog/oem-vs-aftermarket-screens",
            image:
              "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
          },
          {
            title: "When Should You Replace Your Phone Battery? 5 Warning Signs",
            excerpt:
              "From sudden shutdowns at 30% to screen swelling: how to know when your lithium-ion cell has reached end-of-life.",
            category: "Battery Care",
            readTime: "3 min read",
            date: "Oct 10, 2026",
            link: "/blog/when-to-replace-phone-battery",
            image:
              "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80",
          },
        ],
        cardBgColor: "#ffffff",
        accentColor: "#009691",
        bgColor: "#f8fafc",
        textColor: "#0f172a",
        padding: "56px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        columns: {
          type: "number",
          label: "Columns (2-4)",
          min: 2,
          max: 4,
        },
        items: {
          type: "array",
          label: "Blog Articles",
          arrayFields: {
            title: { type: "text", label: "Title" },
            excerpt: { type: "textarea", label: "Excerpt" },
            category: { type: "text", label: "Category" },
            readTime: { type: "text", label: "Read Time" },
            date: { type: "text", label: "Date" },
            link: { type: "text", label: "Article Link" },
            image: { type: "text", label: "Image URL" },
          },
          getItemSummary: (it) => it.title || "Blog Article",
        },
        cardBgColor: createColorField("Card Background Color"),
        accentColor: createColorField("Accent Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading = "Expert Repair Guides & Tech News",
        subheading,
        columns = 3,
        items = [],
        cardBgColor = "#ffffff",
        accentColor = "#009691",
        bgColor = "#f8fafc",
        textColor = "#0f172a",
        padding = "56px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "blog-grid");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        const colClass =
          columns === 2
            ? "grid-cols-1 md:grid-cols-2"
            : columns === 4
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-3";

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "56px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-10">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}

              <div className={`grid ${colClass} gap-6`}>
                {items.map((it: any, idx: number) => (
                  <Link
                    key={idx}
                    href={it.link || "/blog"}
                    style={{ backgroundColor: cardBgColor }}
                    className="group rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col"
                  >
                    {it.image && (
                      <div className="h-44 w-full overflow-hidden bg-gray-100 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.image}
                          alt={it.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {it.category && (
                          <span
                            style={{ backgroundColor: accentColor }}
                            className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
                          >
                            {it.category}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-2">
                          {it.date && <span>{it.date}</span>}
                          {it.date && it.readTime && <span>•</span>}
                          {it.readTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {it.readTime}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug mb-2">
                          {it.title}
                        </h3>
                        {it.excerpt && (
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {it.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-teal-600">
                        <span>Read Full Guide</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      },
    },

    TabsBlock: {
      label: "Interactive Tabs",
      defaultProps: {
        heading: "Specialized Repair Categories",
        subheading: "Explore certified repairs and OEM parts warranties for your specific device family.",
        items: [
          {
            label: "Smartphones",
            badge: "Same-Day • 30 Mins",
            title: "iPhone, Samsung Galaxy & Google Pixel Repairs",
            description: "Certified screen replacements, OEM-grade batteries, charging port micro-soldering, and water damage remediation.",
            bullet1: "30-minute express screen & battery swap",
            bullet2: "Original OLED and 120Hz high-refresh displays",
            bullet3: "90-day comprehensive parts & craftsmanship warranty",
            ctaText: "Explore Smartphone Repairs",
            ctaLink: "/repairs/smartphone",
          },
          {
            label: "Mac & Laptops",
            badge: "Certified Technicians",
            title: "MacBook Pro, MacBook Air & Windows Laptop Care",
            description: "Component-level logic board micro-soldering, liquid spill cleanups, trackpad & keyboard replacements, and thermal repasting.",
            bullet1: "Retina display assembly replacement",
            bullet2: "Logic board power-rail & backlight diagnostic",
            bullet3: "Same-day battery replacements for all Mac models",
            ctaText: "Explore Laptop Repairs",
            ctaLink: "/repairs/mac",
          },
          {
            label: "iPads & Tablets",
            badge: "Express Glass",
            title: "iPad Pro, iPad Air & Tablet Screen Restorations",
            description: "Precision separation of broken glass digitizers, charge port repairs, and high-capacity battery replacements.",
            bullet1: "Zero-dust cleanroom screen laminations",
            bullet2: "Apple Pencil digitizer calibration included",
            bullet3: "Express same-day turnaround available",
            ctaText: "Explore iPad Repairs",
            ctaLink: "/repairs/ipad",
          },
          {
            label: "Gaming Consoles",
            badge: "Micro-soldering",
            title: "PS5, Xbox Series X & Nintendo Switch Repairs",
            description: "HDMI 2.1 port replacements, liquid metal oxidation cleaning, power supply swaps, and joy-con drift repairs.",
            bullet1: "Original OEM 2.1 HDMI ports soldered with leaded alloy",
            bullet2: "Thermal paste renewal and fan de-dusting",
            bullet3: "Full 4K 120Hz stress testing before return",
            ctaText: "Explore Console Repairs",
            ctaLink: "/repairs/computer",
          },
        ],
        accentColor: "#009691",
        bgColor: "#ffffff",
        textColor: "#0f172a",
        cardBgColor: "#f8fafc",
        padding: "56px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        items: {
          type: "array",
          label: "Tabs",
          arrayFields: {
            label: { type: "text", label: "Tab Label" },
            badge: { type: "text", label: "Badge Tag" },
            title: { type: "text", label: "Panel Title" },
            description: { type: "textarea", label: "Panel Description" },
            bullet1: { type: "text", label: "Key Feature 1" },
            bullet2: { type: "text", label: "Key Feature 2" },
            bullet3: { type: "text", label: "Key Feature 3" },
            ctaText: { type: "text", label: "CTA Button Text" },
            ctaLink: { type: "text", label: "CTA Button Link" },
          },
          getItemSummary: (it) => it.label || "Tab",
        },
        accentColor: createColorField("Accent Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading = "Specialized Repair Categories",
        subheading,
        items = [],
        accentColor = "#009691",
        bgColor = "#ffffff",
        textColor = "#0f172a",
        cardBgColor = "#f8fafc",
        padding = "56px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "tabs");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "56px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-8">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {items.map((tab: any, idx: number) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: idx === 0 ? accentColor : "#f1f5f9",
                        color: idx === 0 ? "#ffffff" : "#475569",
                      }}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition hover:opacity-90"
                    >
                      {tab.label}
                    </span>
                  ))}
                </div>

                {items[0] && (
                  <div
                    style={{ backgroundColor: cardBgColor }}
                    className="p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                  >
                    <div className="lg:col-span-8">
                      {items[0].badge && (
                        <span
                          style={{
                            backgroundColor: `${accentColor}18`,
                            color: accentColor,
                          }}
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                        >
                          {items[0].badge}
                        </span>
                      )}
                      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3">
                        {items[0].title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        {items[0].description}
                      </p>

                      <div className="space-y-2.5 mb-6">
                        {[items[0].bullet1, items[0].bullet2, items[0].bullet3]
                          .filter(Boolean)
                          .map((bullet: string, bIdx: number) => (
                            <div key={bIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{bullet}</span>
                            </div>
                          ))}
                      </div>

                      {items[0].ctaText && (
                        <Link
                          href={items[0].ctaLink || "/repairs"}
                          style={{ backgroundColor: accentColor }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md hover:brightness-110 transition"
                        >
                          <span>{items[0].ctaText}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>

                    <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Quality Guarantee</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        All repairs are conducted by certified technicians using OEM-standard components and backed by our unconditional 90-day warranty.
                      </p>
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-700">
                        <span>Turnaround</span>
                        <span className="text-teal-600 font-bold">Same-Day</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      },
    },

    AccordionBlock: {
      label: "Accordion / Expandable Cards",
      defaultProps: {
        heading: "Frequently Asked Questions & Policies",
        subheading: "Everything you need to know about our repair processes, warranties, and turnaround times.",
        items: [
          {
            title: "Do I need to make an appointment before visiting?",
            badge: "Walk-ins Welcome",
            content:
              "No appointment is necessary! We welcome walk-in customers during all operating hours at all 3 of our Philadelphia locations. Appointments simply ensure your replacement part is reserved in advance.",
          },
          {
            title: "What is covered under the 90-day SmartFoneDoctor warranty?",
            badge: "90-Day Coverage",
            content:
              "Our warranty covers any defect in parts or craftsmanship. If your new screen has touch defects, dead pixels, or your battery fails to hold charge, we replace it completely free of charge.",
          },
          {
            title: "Will my phone data be erased during repair?",
            badge: "Data Safe",
            content:
              "For 99% of hardware repairs (screens, batteries, charging ports, cameras), your personal data, photos, and apps remain 100% untouched. We never wipe your device without your explicit permission.",
          },
          {
            title: "How long does a typical screen or battery repair take?",
            badge: "30-45 Mins",
            content:
              "Most smartphone screen and battery replacements are completed within 30 to 45 minutes while you wait in our comfortable reception lounge.",
          },
        ],
        accentColor: "#009691",
        bgColor: "#ffffff",
        textColor: "#0f172a",
        cardBgColor: "#f8fafc",
        padding: "56px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        items: {
          type: "array",
          label: "Accordion Items",
          arrayFields: {
            title: { type: "text", label: "Question / Title" },
            badge: { type: "text", label: "Badge Tag" },
            content: { type: "textarea", label: "Answer / Content" },
          },
          getItemSummary: (it) => it.title || "Accordion Item",
        },
        accentColor: createColorField("Accent Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading = "Frequently Asked Questions & Policies",
        subheading,
        items = [],
        accentColor = "#009691",
        bgColor = "#ffffff",
        textColor = "#0f172a",
        cardBgColor = "#f8fafc",
        padding = "56px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "accordion");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "56px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-8">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {items.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: cardBgColor }}
                    className="p-5 rounded-2xl border border-gray-200/80 shadow-2xs transition hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          {it.badge && (
                            <span
                              style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
                              }}
                              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                            >
                              {it.badge}
                            </span>
                          )}
                          <h4 className="text-sm sm:text-base font-bold text-gray-900">
                            {it.title}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-2">
                          {it.content}
                        </p>
                      </div>
                      <span className="p-1 rounded-full bg-gray-100 text-gray-500 shrink-0 mt-0.5">
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      },
    },

    TimelineBlock: {
      label: "Milestone & Process Timeline",
      defaultProps: {
        heading: "Our 4-Step Express Repair Journey",
        subheading: "From the moment you walk through our doors to picking up your pristine device.",
        items: [
          {
            step: "01",
            dateOrTime: "Minute 0–5",
            title: "Free Visual & Digital Diagnostic",
            description:
              "Our certified technician runs a full 24-point hardware check to identify all damaged components and quotes an exact price with zero hidden fees.",
            badge: "Free Diagnostic",
          },
          {
            step: "02",
            dateOrTime: "Minute 5–15",
            title: "Precision Disassembly & Cleanroom Prep",
            description:
              "Your device is carefully opened using ESD-safe thermal equipment. Internal dust and adhesive debris are ultrasonically cleared.",
            badge: "Cleanroom Safe",
          },
          {
            step: "03",
            dateOrTime: "Minute 15–35",
            title: "OEM Part Installation & Micro-Calibration",
            description:
              "New display, battery, or component is installed with laser alignment and water-resistant perimeter seals.",
            badge: "OEM Grade",
          },
          {
            step: "04",
            dateOrTime: "Minute 35–45",
            title: "Quality Control & Handover",
            description:
              "Multi-point post-repair testing verifies TrueTone, biometric sensors, charging speed, and touch response. Handed over with 90-day warranty card.",
            badge: "Ready for Pickup",
          },
        ],
        accentColor: "#009691",
        bgColor: "#0f172a",
        textColor: "#ffffff",
        cardBgColor: "rgba(255, 255, 255, 0.05)",
        padding: "60px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        items: {
          type: "array",
          label: "Timeline Steps",
          arrayFields: {
            step: { type: "text", label: "Step Number (e.g. 01)" },
            dateOrTime: { type: "text", label: "Timeframe (e.g. Minute 0-5)" },
            title: { type: "text", label: "Title" },
            description: { type: "textarea", label: "Description" },
            badge: { type: "text", label: "Badge Tag" },
          },
          getItemSummary: (it) => `${it.step || ""} - ${it.title || "Step"}`,
        },
        accentColor: createColorField("Accent Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        cardBgColor: createColorField("Card Background Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading = "Our 4-Step Express Repair Journey",
        subheading,
        items = [],
        accentColor = "#009691",
        bgColor = "#0f172a",
        textColor = "#ffffff",
        cardBgColor = "rgba(255, 255, 255, 0.05)",
        padding = "60px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "timeline");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "60px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-12">
                  {heading && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}

              <div className="relative border-l-2 border-white/15 pl-6 sm:pl-8 ml-4 sm:ml-6 space-y-10">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="relative group">
                    <div
                      style={{ backgroundColor: accentColor }}
                      className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-md"
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>

                    <div
                      style={{ backgroundColor: cardBgColor }}
                      className="p-5 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-xs transition hover:border-white/25"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            style={{ color: accentColor }}
                            className="text-xs font-black tracking-wider uppercase"
                          >
                            Step {it.step || idx + 1}
                          </span>
                          {it.dateOrTime && (
                            <span className="text-[11px] text-gray-400 font-medium">
                              • {it.dateOrTime}
                            </span>
                          )}
                        </div>
                        {it.badge && (
                          <span
                            style={{
                              backgroundColor: `${accentColor}20`,
                              color: accentColor,
                            }}
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          >
                            {it.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
                        {it.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        {it.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      },
    },

    LogoStripBlock: {
      label: "Partner & Certification Logo Strip",
      defaultProps: {
        heading: "Certified by the Industry's Highest Standards",
        subheading: "Our technicians hold master-level credentials and use factory-grade repair stations.",
        items: [
          {
            name: "WISE Level 2 Certified",
            badge: "Master Techs",
            description: "Wireless Industry Service Excellence Master Technicians",
            link: "https://www.wisecertification.com",
          },
          {
            name: "iFixit Pro Network",
            badge: "Official Tools",
            description: "Official repair guide & precision diagnostic tools partner",
            link: "https://www.ifixit.com",
          },
          {
            name: "Apple Independent Repair",
            badge: "Genuine Tools",
            description: "OEM Apple diagnostics, tools, and genuine part access",
            link: "https://support.apple.com",
          },
          {
            name: "Samsung Certified Parts",
            badge: "Dynamic AMOLED",
            description: "Dynamic AMOLED 2X and Super Fast Charging OEM certified",
            link: "https://www.samsung.com",
          },
        ],
        accentColor: "#009691",
        bgColor: "#f8fafc",
        textColor: "#0f172a",
        padding: "48px 24px",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        items: {
          type: "array",
          label: "Certifications & Partners",
          arrayFields: {
            name: { type: "text", label: "Partner / Cert Name" },
            badge: { type: "text", label: "Badge Tag" },
            description: { type: "text", label: "Short Description" },
            link: { type: "text", label: "Website Link" },
          },
          getItemSummary: (it) => it.name || "Partner",
        },
        accentColor: createColorField("Accent Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        padding: createSpacingField("Section Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        heading = "Certified by the Industry's Highest Standards",
        subheading,
        items = [],
        accentColor = "#009691",
        bgColor = "#f8fafc",
        textColor = "#0f172a",
        padding = "48px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "logo-strip");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "48px 24px"),
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {(heading || subheading) && (
                <div className="text-center max-w-2xl mx-auto mb-8">
                  {heading && (
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">
                      {heading}
                    </h2>
                  )}
                  {subheading && (
                    <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                      {subheading}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((it: any, idx: number) => {
                  const cardContent = (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between h-full group">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <ShieldCheck
                            style={{ color: accentColor }}
                            className="w-5 h-5 shrink-0"
                          />
                          {it.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider">
                              {it.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                          {it.name}
                        </h4>
                        {it.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {it.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );

                  return it.link ? (
                    <a
                      key={idx}
                      href={it.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer block"
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <div key={idx}>{cardContent}</div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      },
    },

    RichTextBlock: {
      label: "Rich Text / HTML",
      defaultProps: {
        heading: "About Our Repair Process",
        subheading: "",
        bodyHtml:
          "<p>We use industry-standard ESD-safe benches, OEM-grade components, and multi-point diagnostics on every device.</p>",
        bgColor: "#ffffff",
        textColor: "#111827",
        padding: "48px 32px",
        align: "left",
        customCss: "",
      },
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "text", label: "Subheading" },
        bodyHtml: { type: "richtext", label: "Rich Content" },
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        padding: createSpacingField("Section Padding"),
        align: ALIGN_FIELD,
        customCss: createCustomCssField(),
        responsive: createResponsiveField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.heading}
            {fields.subheading}
            {fields.bodyHtml}
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Colors" defaultExpanded={true}>
              {fields.bgColor}
              {fields.textColor}
            </FieldGroup>
            <FieldGroup label="Spacing & Alignment" defaultExpanded={true}>
              {fields.padding}
              {fields.align}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        heading,
        subheading,
        bodyHtml,
        bgColor,
        textColor,
        padding,
        align,
        customCss,
        responsive,
      }) => (
        <SectionWrapper
          id={id}
          bgColor={bgColor}
          textColor={textColor}
          padding={padding}
          align={align}
          customCss={customCss}
          responsive={responsive}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {heading && (
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${align === "center" ? "text-center" : "text-left"}`}>
                {heading}
              </h2>
            )}
            {subheading && (
              <p
                className={`text-sm opacity-75 mb-6 max-w-2xl leading-relaxed ${align === "center" ? "mx-auto text-center" : "text-left"}`}
                style={{
                  marginLeft: align === "center" ? "auto" : undefined,
                  marginRight: align === "center" ? "auto" : undefined,
                }}
              >
                {subheading}
              </p>
            )}
            {typeof bodyHtml === "string" ? (
              <div
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
                className={`sfd-content prose max-w-none text-sm leading-relaxed ${align === "center" ? "text-center" : "text-left"}`}
              />
            ) : (
              <div className={`sfd-content prose max-w-none text-sm leading-relaxed ${align === "center" ? "text-center" : "text-left"}`}>
                {bodyHtml}
              </div>
            )}
          </div>
        </SectionWrapper>
      ),
    },

    ContainerBlock: {
      label: "Flex / Grid Container",
      defaultProps: {
        label: "Layout Container",
        display: "grid",
        columns: 3,
        direction: "row",
        wrap: "wrap",
        justify: "flex-start",
        align: "stretch",
        gap: 16,
        paddingY: 40,
        paddingX: 24,
        backgroundColor: "#f8fafc",
        customCss: "",
        children: [],
      },
      fields: {
        label: { type: "text", label: "Section Label" },
        display: {
          type: "radio",
          label: "Layout Mode",
          options: [
            { label: "CSS Grid", value: "grid" },
            { label: "Flexbox", value: "flex" },
          ],
        },
        columns: { type: "number", label: "Grid Columns (1-6)", min: 1, max: 6 },
        direction: {
          type: "select",
          label: "Flex Direction",
          options: [
            { label: "Row", value: "row" },
            { label: "Column", value: "column" },
          ],
        },
        wrap: {
          type: "radio",
          label: "Flex Wrap",
          options: [
            { label: "Wrap", value: "wrap" },
            { label: "No Wrap", value: "nowrap" },
          ],
        },
        justify: {
          type: "select",
          label: "Justify Content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "Space Between", value: "space-between" },
            { label: "End", value: "flex-end" },
          ],
        },
        align: {
          type: "select",
          label: "Align Items",
          options: [
            { label: "Stretch", value: "stretch" },
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
          ],
        },
        gap: { type: "number", label: "Gap (px)", min: 0, max: 96 },
        paddingY: { type: "number", label: "Padding Y (px)", min: 0, max: 160 },
        paddingX: { type: "number", label: "Padding X (px)", min: 0, max: 160 },
        backgroundColor: createColorField("Background Color"),
        customCss: createCustomCssField(),
        responsive: createResponsiveField({ includeLayout: true }),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
        children: { type: "slot", label: "Nested Blocks" },
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.label}
            {fields.children}
          </FieldTab>
          <FieldTab label="Layout">
            <FieldGroup label="Grid & Flexbox" defaultExpanded={true}>
              {fields.display}
              {fields.columns}
              {fields.direction}
              {fields.wrap}
              {fields.justify}
              {fields.align}
              {fields.gap}
            </FieldGroup>
            <FieldGroup label="Spacing & Background">
              {fields.paddingY}
              {fields.paddingX}
              {fields.backgroundColor}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        display,
        columns,
        direction,
        wrap,
        justify,
        align,
        gap,
        paddingY,
        paddingX,
        backgroundColor,
        customCss,
        responsive,
        children: ContentSlot,
      }) => {
        const safeId = sanitizeSectionId(id, "container");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const responsiveCss = buildResponsiveMediaCss(
          safeId,
          responsive,
          `#sfd-section-${safeId} .sfd-container-slot > div`
        );
        const clampedCols = Math.min(6, Math.max(1, Number(columns) || 1));

        const slotStyle: React.CSSProperties =
          display === "grid"
            ? {
                display: "grid",
                gridTemplateColumns: `repeat(${clampedCols}, minmax(0, 1fr))`,
                gap: `${gap ?? 16}px`,
                alignItems: align,
              }
            : {
                display: "flex",
                flexDirection: direction,
                flexWrap: wrap,
                justifyContent: justify,
                alignItems: align,
                gap: `${gap ?? 16}px`,
              };

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: backgroundColor || "transparent",
              paddingTop: `${paddingY ?? 40}px`,
              paddingBottom: `${paddingY ?? 40}px`,
              paddingLeft: `${paddingX ?? 24}px`,
              paddingRight: `${paddingX ?? 24}px`,
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {responsiveCss && (
              <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 sfd-container-slot">
              <ContentSlot style={slotStyle} />
            </div>
          </section>
        );
      },
    },

    FeatureCard: {
      label: "Feature Card",
      defaultProps: {
        title: "90-Day Warranty",
        description:
          "Every screen, battery, and board-level repair is backed by our hassle-free warranty.",
        accentColor: "#009691",
      },
      fields: {
        title: { type: "text", label: "Title" },
        description: { type: "textarea", label: "Description" },
        accentColor: createColorField("Accent Color"),
      },
      render: ({ title, description, accentColor }) => (
        <div
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          style={{ borderTop: `4px solid ${accentColor || "#009691"}` }}
        >
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      ),
    },

    GridBlock: {
      label: "CSS Grid",
      defaultProps: {
        label: "CSS Grid",
        columns: 3,
        templateColumns: "",
        gap: 16,
        rowGap: 16,
        align: "stretch",
        justifyItems: "stretch",
        margin: "0px",
        padding: "32px 24px",
        paddingY: 32,
        paddingX: 24,
        width: "100%",
        height: "auto",
        minHeight: "",
        maxWidth: "100%",
        overflow: "visible",
        position: "relative",
        zIndex: 1,
        backgroundColor: "transparent",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "#e2e8f0",
        borderRadius: "0px",
        boxShadow: "none",
        opacity: 1,
        customCss: "",
        children: [],
      },
      fields: {
        label: { type: "text", label: "Label" },
        columns: { type: "number", label: "Columns (1-6)", min: 1, max: 6 },
        templateColumns: { type: "text", label: "Custom Columns (e.g. 1fr 2fr or 30% 70%)" },
        gap: { type: "number", label: "Column Gap (px)", min: 0, max: 96 },
        rowGap: { type: "number", label: "Row Gap (px)", min: 0, max: 96 },
        align: {
          type: "select",
          label: "Align Items",
          options: [
            { label: "Stretch", value: "stretch" },
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
          ],
        },
        justifyItems: {
          type: "select",
          label: "Justify Items",
          options: [
            { label: "Stretch", value: "stretch" },
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
          ],
        },
        margin: createSpacingField("Margin"),
        padding: createSpacingField("Padding"),
        paddingY: { type: "number", label: "Padding Y (px)", min: 0, max: 160 },
        paddingX: { type: "number", label: "Padding X (px)", min: 0, max: 160 },
        width: { type: "text", label: "Width (e.g. 100%, 720px)" },
        height: { type: "text", label: "Height (e.g. auto, 400px)" },
        minHeight: { type: "text", label: "Min Height (e.g. 200px)" },
        maxWidth: { type: "text", label: "Max Width (e.g. 1200px)" },
        overflow: {
          type: "select",
          label: "Overflow",
          options: [
            { label: "Visible", value: "visible" },
            { label: "Hidden", value: "hidden" },
            { label: "Scroll", value: "scroll" },
            { label: "Auto", value: "auto" },
          ],
        },
        position: {
          type: "select",
          label: "Position",
          options: [
            { label: "Static", value: "static" },
            { label: "Relative", value: "relative" },
            { label: "Absolute", value: "absolute" },
            { label: "Sticky", value: "sticky" },
          ],
        },
        zIndex: { type: "number", label: "Z-Index" },
        backgroundColor: createColorField("Background Color"),
        borderWidth: { type: "number", label: "Border Width (px)", min: 0, max: 20 },
        borderStyle: {
          type: "select",
          label: "Border Style",
          options: [
            { label: "None", value: "none" },
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
          ],
        },
        borderColor: createColorField("Border Color"),
        borderRadius: { type: "text", label: "Border Radius (e.g. 12px)" },
        boxShadow: {
          type: "select",
          label: "Box Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
          ],
        },
        opacity: { type: "number", label: "Opacity (0.1 to 1)", min: 0.1, max: 1, step: 0.05 },
        customCss: createCustomCssField(),
        responsive: createResponsiveField({ includeLayout: true }),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
        children: { type: "slot", label: "Grid Items" },
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="General">
            {fields.label}
            {fields.children}
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Layout" defaultExpanded={true}>
              {fields.columns}
              {fields.templateColumns}
              {fields.gap}
              {fields.rowGap}
              {fields.align}
              {fields.justifyItems}
            </FieldGroup>
            <FieldGroup label="Spacing" defaultExpanded={true}>
              {fields.margin}
              {fields.padding}
            </FieldGroup>
            <FieldGroup label="Size & Dimensions">
              {fields.width}
              {fields.height}
              {fields.minHeight}
              {fields.maxWidth}
              {fields.overflow}
            </FieldGroup>
            <FieldGroup label="Background & Border">
              {fields.backgroundColor}
              {fields.borderWidth}
              {fields.borderStyle}
              {fields.borderColor}
              {fields.borderRadius}
              {fields.boxShadow}
              {fields.opacity}
            </FieldGroup>
            <FieldGroup label="Position">
              {fields.position}
              {fields.zIndex}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.visibility}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        columns,
        templateColumns,
        gap,
        rowGap,
        align,
        justifyItems,
        margin,
        padding,
        paddingY,
        paddingX,
        width,
        height,
        minHeight,
        maxWidth,
        overflow,
        position,
        zIndex,
        backgroundColor,
        borderWidth,
        borderStyle,
        borderColor,
        borderRadius,
        boxShadow,
        opacity,
        customCss,
        responsive,
        visibility,
        children: GridSlot,
      }) => {
        const safeId = sanitizeSectionId(id, "grid");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const responsiveCss = buildResponsiveMediaCss(
          safeId,
          responsive,
          `#sfd-section-${safeId} .sfd-container-slot > div`
        );
        const visibilityCss = buildVisibilityCss(safeId, visibility);
        const clampedCols = Math.min(6, Math.max(1, Number(columns) || 3));
        const resolvedCols = templateColumns?.trim()
          ? templateColumns.trim()
          : `repeat(${clampedCols}, minmax(0, 1fr))`;

        const shadowMap: Record<string, string> = {
          none: "none",
          sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        };
        const resolvedPadding = padding?.trim() || `${paddingY ?? 32}px ${paddingX ?? 24}px`;

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              backgroundColor: backgroundColor || "transparent",
              width: width?.trim() || "100%",
              height: height?.trim() || undefined,
              minHeight: minHeight?.trim() || undefined,
              maxWidth: maxWidth?.trim() || undefined,
              margin: margin?.trim() || undefined,
              padding: resolvedPadding,
              overflow: overflow || "visible",
              position: (position as React.CSSProperties["position"]) || "relative",
              zIndex: typeof zIndex === "number" ? zIndex : undefined,
              borderWidth: borderWidth ? `${borderWidth}px` : undefined,
              borderStyle: borderStyle || undefined,
              borderColor: borderColor || undefined,
              borderRadius: borderRadius?.trim() || undefined,
              boxShadow: boxShadow && boxShadow !== "none" ? shadowMap[boxShadow] : undefined,
              opacity: typeof opacity === "number" ? opacity : undefined,
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {responsiveCss && <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="w-full sfd-container-slot sfd-grid-container sfd-elementor-grid">
              <GridSlot
                style={{
                  display: "grid",
                  gridTemplateColumns: resolvedCols,
                  columnGap: `${gap ?? 16}px`,
                  rowGap: `${rowGap ?? gap ?? 16}px`,
                  alignItems: align || "stretch",
                  justifyItems: justifyItems || "stretch",
                  width: "100%",
                }}
              />
            </div>
          </section>
        );
      },
    },

    FlexBlock: {
      label: "Flexbox Row / Col",
      defaultProps: {
        label: "Flexbox",
        displayLayout: "flex",
        direction: "row",
        wrap: "wrap",
        justify: "flex-start",
        align: "stretch",
        gap: 16,
        rowGap: 16,
        margin: "0px",
        padding: "24px 24px",
        paddingY: 24,
        paddingX: 24,
        width: "100%",
        height: "auto",
        minWidth: "",
        minHeight: "",
        maxWidth: "100%",
        maxHeight: "",
        overflow: "visible",
        position: "relative",
        zIndex: 1,
        fontSize: "",
        fontWeight: "400",
        textAlign: "left",
        textColor: "",
        backgroundColor: "transparent",
        borderWidth: 0,
        borderStyle: "none",
        borderColor: "#e2e8f0",
        borderRadius: "0px",
        boxShadow: "none",
        opacity: 1,
        customCss: "",
        children: [],
      },
      fields: {
        label: { type: "text", label: "Label" },
        displayLayout: {
          type: "radio",
          label: "Display",
          options: [
            { label: "Flex", value: "flex" },
            { label: "Grid", value: "grid" },
            { label: "Block", value: "block" },
          ],
        },
        direction: {
          type: "select",
          label: "Direction",
          options: [
            { label: "Row →", value: "row" },
            { label: "Row Reverse ←", value: "row-reverse" },
            { label: "Column ↓", value: "column" },
            { label: "Column Reverse ↑", value: "column-reverse" },
          ],
        },
        wrap: {
          type: "select",
          label: "Wrap",
          options: [
            { label: "No Wrap", value: "nowrap" },
            { label: "Wrap", value: "wrap" },
            { label: "Wrap Reverse", value: "wrap-reverse" },
          ],
        },
        justify: {
          type: "select",
          label: "Justify Content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Space Between", value: "space-between" },
            { label: "Space Around", value: "space-around" },
            { label: "Space Evenly", value: "space-evenly" },
          ],
        },
        align: {
          type: "select",
          label: "Align Items",
          options: [
            { label: "Stretch", value: "stretch" },
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
          ],
        },
        gap: { type: "number", label: "Column Gap (px)", min: 0, max: 96 },
        rowGap: { type: "number", label: "Row Gap (px)", min: 0, max: 96 },
        margin: createSpacingField("Margin"),
        padding: createSpacingField("Padding"),
        paddingY: { type: "number", label: "Padding Y (px)", min: 0, max: 160 },
        paddingX: { type: "number", label: "Padding X (px)", min: 0, max: 160 },
        width: { type: "text", label: "Width (e.g. 100%, 50%, 300px)" },
        height: { type: "text", label: "Height (e.g. auto, 400px)" },
        minWidth: { type: "text", label: "Min Width (e.g. 200px)" },
        minHeight: { type: "text", label: "Min Height (e.g. 120px)" },
        maxWidth: { type: "text", label: "Max Width (e.g. 1200px)" },
        maxHeight: { type: "text", label: "Max Height (e.g. 600px)" },
        overflow: {
          type: "select",
          label: "Overflow",
          options: [
            { label: "Visible", value: "visible" },
            { label: "Hidden", value: "hidden" },
            { label: "Scroll", value: "scroll" },
            { label: "Auto", value: "auto" },
          ],
        },
        position: {
          type: "select",
          label: "Position",
          options: [
            { label: "Static", value: "static" },
            { label: "Relative", value: "relative" },
            { label: "Absolute", value: "absolute" },
            { label: "Sticky", value: "sticky" },
          ],
        },
        zIndex: { type: "number", label: "Z-Index" },
        fontSize: { type: "text", label: "Font Size (e.g. 16px)" },
        fontWeight: {
          type: "select",
          label: "Font Weight",
          options: [
            { label: "Normal (400)", value: "400" },
            { label: "Medium (500)", value: "500" },
            { label: "Semi Bold (600)", value: "600" },
            { label: "Bold (700)", value: "700" },
            { label: "Extra Bold (800)", value: "800" },
          ],
        },
        textAlign: {
          type: "radio",
          label: "Text Align",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
            { label: "Justify", value: "justify" },
          ],
        },
        textColor: createColorField("Text Color"),
        backgroundColor: createColorField("Background Color"),
        borderWidth: { type: "number", label: "Border Width (px)", min: 0, max: 20 },
        borderStyle: {
          type: "select",
          label: "Border Style",
          options: [
            { label: "None", value: "none" },
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
          ],
        },
        borderColor: createColorField("Border Color"),
        borderRadius: { type: "text", label: "Border Radius (e.g. 12px)" },
        boxShadow: {
          type: "select",
          label: "Box Shadow",
          options: [
            { label: "None", value: "none" },
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
            { label: "Extra Large", value: "xl" },
          ],
        },
        opacity: { type: "number", label: "Opacity (0.1 to 1)", min: 0.1, max: 1, step: 0.05 },
        customCss: createCustomCssField(),
        responsive: createResponsiveField({ includeLayout: true }),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
        children: { type: "slot", label: "Flex Items" },
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="General">
            {fields.label}
            {fields.children}
          </FieldTab>
          <FieldTab label="Style">
            <FieldGroup label="Layout" defaultExpanded={true}>
              {fields.displayLayout}
              {fields.direction}
              {fields.wrap}
              {fields.justify}
              {fields.align}
              {fields.gap}
              {fields.rowGap}
            </FieldGroup>
            <FieldGroup label="Spacing" defaultExpanded={true}>
              {fields.margin}
              {fields.padding}
            </FieldGroup>
            <FieldGroup label="Size & Dimensions">
              {fields.width}
              {fields.height}
              {fields.minWidth}
              {fields.minHeight}
              {fields.maxWidth}
              {fields.maxHeight}
              {fields.overflow}
            </FieldGroup>
            <FieldGroup label="Background & Border">
              {fields.backgroundColor}
              {fields.borderWidth}
              {fields.borderStyle}
              {fields.borderColor}
              {fields.borderRadius}
              {fields.boxShadow}
              {fields.opacity}
            </FieldGroup>
            <FieldGroup label="Position">
              {fields.position}
              {fields.zIndex}
            </FieldGroup>
            <FieldGroup label="Typography">
              {fields.fontSize}
              {fields.fontWeight}
              {fields.textAlign}
              {fields.textColor}
            </FieldGroup>
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.visibility}
            {fields.responsive}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        displayLayout,
        direction,
        wrap,
        justify,
        align,
        gap,
        rowGap,
        margin,
        padding,
        paddingY,
        paddingX,
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        overflow,
        position,
        zIndex,
        fontSize,
        fontWeight,
        textAlign,
        textColor,
        backgroundColor,
        borderWidth,
        borderStyle,
        borderColor,
        borderRadius,
        boxShadow,
        opacity,
        customCss,
        responsive,
        visibility,
        children: FlexSlot,
      }) => {
        const safeId = sanitizeSectionId(id, "flex");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const responsiveCss = buildResponsiveMediaCss(
          safeId,
          responsive,
          `#sfd-section-${safeId} .sfd-container-slot > div`
        );
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        const shadowMap: Record<string, string> = {
          none: "none",
          sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        };
        const resolvedPadding = padding?.trim() || `${paddingY ?? 24}px ${paddingX ?? 24}px`;

        return (
          <section
            id={`sfd-section-${safeId}`}
            style={{
              display: displayLayout || "flex",
              backgroundColor: backgroundColor || "transparent",
              width: width?.trim() || "100%",
              height: height?.trim() || undefined,
              minWidth: minWidth?.trim() || undefined,
              minHeight: minHeight?.trim() || undefined,
              maxWidth: maxWidth?.trim() || undefined,
              maxHeight: maxHeight?.trim() || undefined,
              margin: margin?.trim() || undefined,
              padding: resolvedPadding,
              overflow: overflow || "visible",
              position: (position as React.CSSProperties["position"]) || "relative",
              zIndex: typeof zIndex === "number" ? zIndex : undefined,
              borderWidth: borderWidth ? `${borderWidth}px` : undefined,
              borderStyle: borderStyle || undefined,
              borderColor: borderColor || undefined,
              borderRadius: borderRadius?.trim() || undefined,
              boxShadow: boxShadow && boxShadow !== "none" ? shadowMap[boxShadow] : undefined,
              opacity: typeof opacity === "number" ? opacity : undefined,
              fontSize: fontSize?.trim() || undefined,
              fontWeight: fontWeight || undefined,
              textAlign: textAlign || undefined,
              color: textColor?.trim() || undefined,
            }}
            className="min-w-0"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {responsiveCss && <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div
              className={`w-full sfd-container-slot ${
                (direction || "row") === "row"
                  ? "sfd-flex-row sfd-elementor-row"
                  : "sfd-flex-col sfd-elementor-col"
              }`}
            >
              <FlexSlot
                style={{
                  display: "flex",
                  flexDirection: direction || "row",
                  flexWrap: wrap || "nowrap",
                  justifyContent: justify || "flex-start",
                  alignItems: align || "stretch",
                  columnGap: `${gap ?? 16}px`,
                  rowGap: `${rowGap ?? gap ?? 16}px`,
                  width: "100%",
                }}
              />
            </div>
          </section>
        );
      },
    },

    ColumnBlock,

    HeadingBlock: {
      label: "Heading (H1–H6)",
      defaultProps: {
        tag: "h2",
        text: "Section Heading",
        link: "",
        align: "left",
        color: "#0f172a",
        fontSize: "",
        fontWeight: "700",
        marginBottom: "12px",
        customCss: "",
      },
      fields: {
        tag: {
          type: "select",
          label: "HTML Tag",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
            { label: "H5", value: "h5" },
            { label: "H6", value: "h6" },
          ],
        },
        text: { type: "text", label: "Heading Text" },
        link: { type: "text", label: "Link URL (Optional)" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: createColorField("Text Color"),
        fontSize: { type: "text", label: "Custom Size (e.g. 32px)" },
        fontWeight: {
          type: "select",
          label: "Weight",
          options: [
            { label: "Semibold (600)", value: "600" },
            { label: "Bold (700)", value: "700" },
            { label: "Extrabold (800)", value: "800" },
          ],
        },
        marginBottom: { type: "text", label: "Bottom Spacing (e.g. 12px)" },
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.tag}
            {fields.text}
            {fields.link}
          </FieldTab>
          <FieldTab label="Style">
            {fields.align}
            {fields.color}
            {fields.fontSize}
            {fields.fontWeight}
            {fields.marginBottom}
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({ id, tag, text, link, align, color, fontSize, fontWeight, marginBottom, customCss }) => {
        const safeId = sanitizeSectionId(id, "heading");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const Tag = tag || "h2";
        const defaultSizeClass =
          Tag === "h1"
            ? "text-3xl sm:text-4xl"
            : Tag === "h2"
            ? "text-2xl sm:text-3xl"
            : Tag === "h3"
            ? "text-xl sm:text-2xl"
            : Tag === "h4"
            ? "text-lg sm:text-xl"
            : Tag === "h5"
            ? "text-base sm:text-lg"
            : "text-sm sm:text-base";

        return (
          <div
            id={`sfd-section-${safeId}`}
            style={{
              textAlign: align,
              marginBottom: normalizeCssUnit(marginBottom, "12px"),
            }}
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            <Tag
              className={`${defaultSizeClass} tracking-tight leading-tight`}
              style={{
                color: color || "#0f172a",
                fontSize: normalizeCssUnit(fontSize),
                fontWeight: fontWeight || "700",
              }}
            >
              {link ? (
                <Link href={link} className="hover:underline">
                  {text}
                </Link>
              ) : (
                text
              )}
            </Tag>
          </div>
        );
      },
    },

    ParagraphBlock: {
      label: "Paragraph (<p>)",
      defaultProps: {
        text: "Write your paragraph copy here. Customize font size, alignment, line height, and color in the inspector.",
        align: "left",
        color: "#475569",
        fontSize: "15px",
        lineHeight: "1.65",
        maxWidth: "100%",
        marginBottom: "16px",
        customCss: "",
      },
      fields: {
        text: { type: "textarea", label: "Paragraph Text" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: createColorField("Text Color"),
        fontSize: { type: "text", label: "Font Size (e.g. 15px)" },
        lineHeight: { type: "text", label: "Line Height (e.g. 1.65)" },
        maxWidth: { type: "text", label: "Max Width (e.g. 680px or 100%)" },
        marginBottom: { type: "text", label: "Bottom Spacing (e.g. 16px)" },
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.text}
          </FieldTab>
          <FieldTab label="Style">
            {fields.align}
            {fields.color}
            {fields.fontSize}
            {fields.lineHeight}
            {fields.maxWidth}
            {fields.marginBottom}
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({ id, text, align, color, fontSize, lineHeight, maxWidth, marginBottom, customCss }) => {
        const safeId = sanitizeSectionId(id, "paragraph");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        return (
          <div
            id={`sfd-section-${safeId}`}
            style={{
              textAlign: align,
              marginBottom: normalizeCssUnit(marginBottom, "16px"),
            }}
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            <p
              style={{
                color: color || "#475569",
                fontSize: normalizeCssUnit(fontSize, "15px"),
                lineHeight: lineHeight || "1.65",
                maxWidth: normalizeCssUnit(maxWidth, "100%"),
                marginLeft: align === "center" ? "auto" : align === "right" ? "auto" : undefined,
                marginRight: align === "center" ? "auto" : undefined,
              }}
              className="whitespace-pre-line"
            >
              {text}
            </p>
          </div>
        );
      },
    },

    ButtonBlock: {
      label: "Button / Link",
      defaultProps: {
        text: "Schedule Repair",
        href: "/schedule-repair",
        variant: "primary",
        accentColor: "#009691",
        textColor: "#ffffff",
        align: "left",
        borderRadius: "8px",
        customCss: "",
      },
      fields: {
        text: { type: "text", label: "Button Label" },
        href: { type: "text", label: "Link URL" },
        variant: {
          type: "radio",
          label: "Style",
          options: [
            { label: "Solid", value: "primary" },
            { label: "Outline", value: "outline" },
            { label: "Dark", value: "dark" },
          ],
        },
        accentColor: createColorField("Accent Color"),
        textColor: createColorField("Text Color"),
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        borderRadius: { type: "text", label: "Radius (e.g. 8px)" },
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      render: ({ id, text, href, variant, accentColor, textColor, align, borderRadius, customCss }) => {
        const safeId = sanitizeSectionId(id, "button");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const style: React.CSSProperties =
          variant === "outline"
            ? {
                border: `2px solid ${accentColor || "#009691"}`,
                color: accentColor || "#009691",
                backgroundColor: "transparent",
                borderRadius: borderRadius || "8px",
              }
            : variant === "dark"
            ? {
                backgroundColor: "#0f172a",
                color: textColor || "#ffffff",
                borderRadius: borderRadius || "8px",
              }
            : {
                backgroundColor: accentColor || "#009691",
                color: textColor || "#ffffff",
                borderRadius: borderRadius || "8px",
              };

        return (
          <div id={`sfd-section-${safeId}`} style={{ textAlign: align }}>
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            <Link
              href={href || "#"}
              style={style}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
            >
              <span>{text}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        );
      },
    },

    ImageBlock: {
      label: "Image",
      defaultProps: {
        src: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&auto=format&fit=crop&q=80",
        alt: "Technician repairing a smartphone",
        caption: "",
        width: "100%",
        borderRadius: "12px",
        align: "center",
        customCss: "",
      },
      fields: {
        src: createImagePickerField("Image Source"),
        alt: { type: "text", label: "Alt Text (SEO)" },
        caption: { type: "text", label: "Caption (Optional)" },
        width: { type: "text", label: "Max Width (e.g. 100% or 600px)" },
        borderRadius: { type: "text", label: "Radius (e.g. 12px)" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      render: ({ id, src, alt, caption, width, borderRadius, align, customCss }) => {
        const safeId = sanitizeSectionId(id, "image");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        return (
          <figure
            id={`sfd-section-${safeId}`}
            style={{ textAlign: align }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt || ""}
              style={{
                maxWidth: width || "100%",
                borderRadius: borderRadius || "12px",
                marginLeft: align === "center" || align === "right" ? "auto" : undefined,
                marginRight: align === "center" ? "auto" : undefined,
              }}
              className="inline-block h-auto object-cover"
            />
            {caption && (
              <figcaption className="mt-2 text-xs text-slate-500">{caption}</figcaption>
            )}
          </figure>
        );
      },
    },

    SpacerDividerBlock: {
      label: "Spacer / Divider",
      defaultProps: {
        mode: "divider",
        height: 24,
        lineColor: "#e2e8f0",
      },
      fields: {
        mode: {
          type: "radio",
          label: "Type",
          options: [
            { label: "Divider Line", value: "divider" },
            { label: "Empty Spacer", value: "spacer" },
          ],
        },
        height: { type: "number", label: "Vertical Space (px)", min: 4, max: 160 },
        lineColor: createColorField("Line Color"),
      },
      render: ({ mode, height, lineColor }) => (
        <div
          style={{ paddingTop: `${(height ?? 24) / 2}px`, paddingBottom: `${(height ?? 24) / 2}px` }}
          className="w-full"
        >
          {mode === "divider" && (
            <hr style={{ borderColor: lineColor || "#e2e8f0" }} className="border-t" />
          )}
        </div>
      ),
    },

    HtmlBlock: {
      label: "Custom HTML",
      defaultProps: {
        label: "Custom HTML",
        html: '<div class="p-4 rounded-lg border border-slate-200 bg-white">\n  <h3 class="text-lg font-bold text-slate-900">Custom HTML Block</h3>\n  <p class="text-sm text-slate-600 mt-1">Write any HTML tags, tables, lists, or embeds here.</p>\n</div>',
        padding: "0px",
        backgroundColor: "transparent",
        borderRadius: "0px",
        customCss: "",
      },
      fields: {
        label: { type: "text", label: "Block Label" },
        html: { type: "textarea", label: "HTML Markup" },
        padding: createSpacingField("Padding"),
        backgroundColor: createColorField("Background Color"),
        borderRadius: { type: "text", label: "Border Radius" },
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.label}
            {fields.html}
          </FieldTab>
          <FieldTab label="Style">
            {fields.padding}
            {fields.backgroundColor}
            {fields.borderRadius}
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({ id, html, padding, backgroundColor, borderRadius, customCss }) => {
        const safeId = sanitizeSectionId(id, "html");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        return (
          <div
            id={`sfd-section-${safeId}`}
            style={{
              padding: padding || "0px",
              backgroundColor: backgroundColor || "transparent",
              borderRadius: borderRadius || "0px",
            }}
            className="w-full"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            <div dangerouslySetInnerHTML={{ __html: html || "" }} />
          </div>
        );
      },
    },

    GoogleMapBlock: {
      label: "Google Maps",
      defaultProps: {
        address: "33 S 52nd St, Philadelphia, PA 19139",
        height: 320,
        borderRadius: "12px",
        customCss: "",
      },
      fields: {
        address: { type: "text", label: "Location / Address" },
        height: { type: "number", label: "Height (px)", min: 180, max: 720 },
        borderRadius: { type: "text", label: "Border Radius (e.g. 12px)" },
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.address}
          </FieldTab>
          <FieldTab label="Style">
            {fields.height}
            {fields.borderRadius}
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({ id, address, height, borderRadius, customCss }) => {
        const safeId = sanitizeSectionId(id, "map");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const q = encodeURIComponent(address || "33 S 52nd St, Philadelphia, PA 19139");
        return (
          <div id={`sfd-section-${safeId}`} className="w-full">
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            <iframe
              title={`Map: ${address}`}
              src={`https://maps.google.com/maps?q=${q}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              style={{
                width: "100%",
                height: `${height ?? 320}px`,
                borderRadius: borderRadius || "12px",
                border: 0,
              }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        );
      },
    },

    VideoBlock: {
      label: "Video (YouTube / MP4)",
      defaultProps: {
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        poster: "",
        aspectRatio: "16/9",
        autoplay: false,
        loop: false,
        muted: true,
        controls: true,
        borderRadius: "12px",
        maxWidth: "100%",
        align: "center",
        customCss: "",
      },
      fields: {
        url: { type: "text", label: "Video URL (YouTube, Vimeo, or direct .mp4)" },
        poster: createImagePickerField("Poster Image (Optional)"),
        aspectRatio: {
          type: "select",
          label: "Aspect Ratio",
          options: [
            { label: "16:9 (Standard Widescreen)", value: "16/9" },
            { label: "4:3 (Classic Video)", value: "4/3" },
            { label: "1:1 (Square)", value: "1/1" },
            { label: "9:16 (Vertical / Reels / TikTok)", value: "9/16" },
          ],
        },
        controls: {
          type: "radio",
          label: "Player Controls",
          options: [
            { label: "Show", value: true },
            { label: "Hide", value: false },
          ],
        },
        autoplay: {
          type: "radio",
          label: "Autoplay (Starts Muted)",
          options: [
            { label: "Off", value: false },
            { label: "On", value: true },
          ],
        },
        loop: {
          type: "radio",
          label: "Loop Video",
          options: [
            { label: "Off", value: false },
            { label: "On", value: true },
          ],
        },
        muted: {
          type: "radio",
          label: "Mute Audio",
          options: [
            { label: "Muted", value: true },
            { label: "Unmuted", value: false },
          ],
        },
        borderRadius: { type: "text", label: "Border Radius (e.g. 12px)" },
        maxWidth: { type: "text", label: "Max Width (e.g. 100%, 720px)" },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        customCss: createCustomCssField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.url}
            {fields.poster}
          </FieldTab>
          <FieldTab label="Playback & Style">
            {fields.aspectRatio}
            {fields.controls}
            {fields.autoplay}
            {fields.loop}
            {fields.muted}
            {fields.maxWidth}
            {fields.align}
            {fields.borderRadius}
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.visibility}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        url,
        poster,
        aspectRatio,
        autoplay,
        loop,
        muted,
        controls,
        borderRadius,
        maxWidth,
        align,
        customCss,
        visibility,
      }) => {
        const safeId = sanitizeSectionId(id, "video");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        const raw = (url || "").trim();
        const ytMatch = raw.match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
        );
        const vimeoMatch = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);

        const justifyClass =
          align === "left"
            ? "justify-start"
            : align === "right"
            ? "justify-end"
            : "justify-center";

        const aspectValue =
          aspectRatio === "4/3"
            ? "4 / 3"
            : aspectRatio === "1/1"
            ? "1 / 1"
            : aspectRatio === "9/16"
            ? "9 / 16"
            : "16 / 9";

        let embedSrc = "";
        let isDirect = false;

        if (ytMatch) {
          const params = new URLSearchParams();
          if (autoplay) params.set("autoplay", "1");
          if (muted) params.set("mute", "1");
          if (loop) {
            params.set("loop", "1");
            params.set("playlist", ytMatch[1]);
          }
          if (controls === false) params.set("controls", "0");
          const query = params.toString();
          embedSrc = `https://www.youtube.com/embed/${ytMatch[1]}${query ? `?${query}` : ""}`;
        } else if (vimeoMatch) {
          const params = new URLSearchParams();
          if (autoplay) params.set("autoplay", "1");
          if (muted) params.set("muted", "1");
          if (loop) params.set("loop", "1");
          const query = params.toString();
          embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}${query ? `?${query}` : ""}`;
        } else {
          isDirect = true;
          embedSrc = raw;
        }

        return (
          <div
            id={`sfd-section-${safeId}`}
            className={`w-full flex ${justifyClass}`}
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div
              style={{
                width: "100%",
                maxWidth: maxWidth?.trim() || "100%",
                aspectRatio: aspectValue,
                borderRadius: borderRadius || "12px",
                overflow: "hidden",
                backgroundColor: "#000000",
              }}
              className="relative shadow-md"
            >
              {isDirect ? (
                <video
                  src={embedSrc}
                  poster={poster || undefined}
                  autoPlay={Boolean(autoplay)}
                  loop={Boolean(loop)}
                  muted={Boolean(muted || autoplay)}
                  controls={controls !== false}
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <iframe
                  title="Embedded Video"
                  src={embedSrc}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                />
              )}
            </div>
          </div>
        );
      },
    },

    IconBlock: {
      label: "Icon Widget",
      defaultProps: {
        icon: "Sparkles",
        size: 32,
        color: "#009691",
        bgColor: "rgba(0, 150, 145, 0.12)",
        shape: "circle",
        borderStyle: "none",
        shadow: "none",
        hoverEffect: "scale",
        align: "center",
        link: "",
        customCss: "",
      },
      fields: {
        icon: createIconPickerField("Icon"),
        size: { type: "number", label: "Icon Size (px)", min: 16, max: 96 },
        color: createColorField("Icon Color"),
        bgColor: createColorField("Background Color"),
        shape: {
          type: "select",
          label: "Badge Shape",
          options: [
            { label: "None (Bare Icon)", value: "none" },
            { label: "Circle", value: "circle" },
            { label: "Rounded Box", value: "rounded" },
            { label: "Square Box", value: "square" },
          ],
        },
        borderStyle: {
          type: "select",
          label: "Border Style",
          options: [
            { label: "None", value: "none" },
            { label: "Subtle (1px solid)", value: "subtle" },
            { label: "Brand Accent (2px solid)", value: "brand" },
            { label: "Dashed Accent", value: "dashed" },
          ],
        },
        shadow: {
          type: "select",
          label: "Shadow & Glow",
          options: [
            { label: "None", value: "none" },
            { label: "Subtle Shadow (sm)", value: "sm" },
            { label: "Medium Shadow (md)", value: "md" },
            { label: "Brand Neon Glow", value: "glow" },
          ],
        },
        hoverEffect: {
          type: "select",
          label: "Hover Animation",
          options: [
            { label: "None", value: "none" },
            { label: "Scale Up (110%)", value: "scale" },
            { label: "Lift Up (-4px)", value: "bounce" },
            { label: "Slight Rotation", value: "rotate" },
          ],
        },
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        link: { type: "text", label: "Link URL (Optional)" },
        customCss: createCustomCssField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.icon}
            {fields.link}
          </FieldTab>
          <FieldTab label="Style">
            {fields.size}
            {fields.color}
            {fields.bgColor}
            {fields.shape}
            {fields.borderStyle}
            {fields.shadow}
            {fields.hoverEffect}
            {fields.align}
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.visibility}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        icon,
        size,
        color,
        bgColor,
        shape,
        borderStyle,
        shadow,
        hoverEffect,
        align,
        link,
        customCss,
        visibility,
      }) => {
        const safeId = sanitizeSectionId(id, "icon");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        const iconPx = Number(size) || 32;
        const padPx = shape === "none" ? 0 : Math.round(iconPx * 0.45);
        const totalSize = iconPx + padPx * 2;
        const radius =
          shape === "circle"
            ? "9999px"
            : shape === "rounded"
            ? `${Math.max(8, Math.round(iconPx * 0.35))}px`
            : "0px";

        const justifyClass =
          align === "left"
            ? "justify-start"
            : align === "right"
            ? "justify-end"
            : "justify-center";

        const borderCss =
          borderStyle === "subtle"
            ? "1px solid rgba(0, 0, 0, 0.08)"
            : borderStyle === "brand"
            ? `2px solid ${color || "#009691"}`
            : borderStyle === "dashed"
            ? `2px dashed ${color || "#009691"}`
            : undefined;

        const shadowCss =
          shadow === "sm"
            ? "0 1px 3px rgba(0,0,0,0.08)"
            : shadow === "md"
            ? "0 4px 12px rgba(0,0,0,0.12)"
            : shadow === "glow"
            ? `0 0 20px ${color ? `${color}55` : "rgba(0,150,145,0.4)"}`
            : undefined;

        const hoverClass =
          hoverEffect === "scale"
            ? "hover:scale-110"
            : hoverEffect === "bounce"
            ? "hover:-translate-y-1"
            : hoverEffect === "rotate"
            ? "hover:rotate-6 hover:scale-105"
            : hoverEffect === "none"
            ? ""
            : "hover:scale-105";

        const iconNode = (
          <div
            style={{
              width: shape === "none" ? undefined : `${totalSize}px`,
              height: shape === "none" ? undefined : `${totalSize}px`,
              backgroundColor: shape === "none" ? "transparent" : bgColor || "transparent",
              color: color || "#009691",
              borderRadius: radius,
              border: borderCss,
              boxShadow: shadowCss,
            }}
            className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer ${hoverClass}`}
          >
            <RenderItemIcon
              name={icon}
              size={iconPx}
              style={{ width: `${iconPx}px`, height: `${iconPx}px` }}
            />
          </div>
        );

        return (
          <div
            id={`sfd-section-${safeId}`}
            className={`w-full flex ${justifyClass} py-1`}
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <style
              dangerouslySetInnerHTML={{
                __html: `#sfd-section-${safeId} svg { width: ${iconPx}px !important; height: ${iconPx}px !important; }`,
              }}
            />
            {link?.trim() ? (
              <Link href={link.trim()} className="inline-block cursor-pointer">
                {iconNode}
              </Link>
            ) : (
              iconNode
            )}
          </div>
        );
      },
    },

    CounterBlock: {
      label: "Number Counter",
      defaultProps: {
        endValue: 15000,
        startValue: 0,
        prefix: "",
        suffix: "+",
        title: "Devices Repaired & Running",
        color: "#009691",
        titleColor: "#475569",
        fontSize: "44px",
        align: "center",
        customCss: "",
      },
      fields: {
        endValue: { type: "number", label: "Final Number (e.g. 15000)" },
        startValue: { type: "number", label: "Start Number (e.g. 0)" },
        prefix: { type: "text", label: "Prefix (e.g. $, #)" },
        suffix: { type: "text", label: "Suffix (e.g. +, %, k)" },
        title: { type: "text", label: "Counter Label / Title" },
        fontSize: { type: "text", label: "Number Font Size (e.g. 44px)" },
        color: createColorField("Number Color"),
        titleColor: createColorField("Label Color"),
        align: {
          type: "radio",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        customCss: createCustomCssField(),
        visibility: createVisibilityField(),
        locked: LOCK_FIELD,
      },
      resolvePermissions: resolveLockPermissions,
      renderFields: ({ fields }) => (
        <>
          <FieldTab label="Content">
            {fields.endValue}
            {fields.prefix}
            {fields.suffix}
            {fields.title}
          </FieldTab>
          <FieldTab label="Style">
            {fields.fontSize}
            {fields.color}
            {fields.titleColor}
            {fields.align}
          </FieldTab>
          <FieldTab label="Advanced">
            {fields.locked}
            {fields.visibility}
            {fields.customCss}
          </FieldTab>
        </>
      ),
      render: ({
        id,
        endValue,
        prefix,
        suffix,
        title,
        fontSize,
        color,
        titleColor,
        align,
        customCss,
        visibility,
      }) => {
        const safeId = sanitizeSectionId(id, "counter");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        const alignClass =
          align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";

        const formattedNumber =
          typeof endValue === "number"
            ? endValue.toLocaleString()
            : String(endValue || "0");

        return (
          <div
            id={`sfd-section-${safeId}`}
            className={`w-full py-2 px-1 ${alignClass}`}
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div
              style={{
                fontSize: normalizeCssUnit(fontSize, "44px"),
                color: color || "#009691",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
              className="tabular-nums"
            >
              <span>{prefix || ""}</span>
              <span>{formattedNumber}</span>
              <span>{suffix || ""}</span>
            </div>
            {title?.trim() && (
              <div
                style={{ color: titleColor || "#475569" }}
                className="mt-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider"
              >
                {title.trim()}
              </div>
            )}
          </div>
        );
      },
    },


    BreadcrumbBlock: {
      label: "Breadcrumb Navigation",
      defaultProps: {
        items: [
          { label: "Home", url: "/" },
          { label: "Repairs", url: "/repairs" },
          { label: "iPhone Repair", url: "/repairs/iphone" },
        ],
        separator: "/",
        accentColor: "#009691",
        bgColor: "#ffffff",
        textColor: "#64748b",
        padding: "16px 24px",
        customCss: "",
      },
      fields: {
        items: {
          type: "array",
          label: "Breadcrumb Trail",
          arrayFields: {
            label: { type: "text", label: "Label" },
            url: { type: "text", label: "URL Link" },
          },
          getItemSummary: (it) => it.label || "Link",
        },
        separator: {
          type: "radio",
          label: "Separator",
          options: [
            { label: "/", value: "/" },
            { label: ">", value: ">" },
            { label: "•", value: "•" },
          ],
        },
        accentColor: createColorField("Active Item Color"),
        bgColor: createColorField("Background Color"),
        textColor: createColorField("Text Color"),
        padding: createSpacingField("Padding"),
        customCss: createCustomCssField(),
        locked: LOCK_FIELD,
        visibility: createVisibilityField(),
      },
      render: ({
        id,
        items = [],
        separator = "/",
        accentColor = "#009691",
        bgColor = "#ffffff",
        textColor = "#64748b",
        padding = "16px 24px",
        customCss,
        visibility,
      }: any) => {
        const safeId = sanitizeSectionId(id, "breadcrumb");
        const scopedCss = customCss ? scopeCustomCss(customCss, safeId) : "";
        const visibilityCss = buildVisibilityCss(safeId, visibility);

        return (
          <nav
            id={`sfd-section-${safeId}`}
            aria-label="Breadcrumb"
            style={{
              backgroundColor: bgColor,
              color: textColor,
              padding: normalizeCssUnit(padding, "16px 24px"),
            }}
            className="w-full border-b border-gray-100"
          >
            {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
            {visibilityCss && <style dangerouslySetInnerHTML={{ __html: visibilityCss }} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ol className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
                {items.map((it: any, idx: number) => {
                  const isLast = idx === items.length - 1;
                  return (
                    <li key={idx} className="inline-flex items-center gap-2">
                      {idx > 0 && (
                        <span className="opacity-40 text-xs">{separator}</span>
                      )}
                      {isLast ? (
                        <span
                          style={{ color: accentColor }}
                          className="font-bold tracking-tight"
                          aria-current="page"
                        >
                          {it.label}
                        </span>
                      ) : (
                        <Link
                          href={it.url || "#"}
                          className="hover:underline transition-colors opacity-90 hover:opacity-100"
                        >
                          {it.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>
        );
      },
    },


  },
};
