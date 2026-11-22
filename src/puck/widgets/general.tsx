"use client";

/**
 * "General" widgets: the common Elementor widgets the builder lacked (Icon Box,
 * Image Box, Icon List, Star Rating, Gallery, Progress Bars, Social Icons,
 * Alert, Before/After, Table of Contents, Countdown, Price List, Menu Anchor).
 * Each has Content / Style / Advanced tabs, lock, device visibility and scoped
 * custom CSS like the other widgets. The public site gets a copy without the
 * editor fields (scripts/gen-puck-render-config.ts).
 */
import React, { type ReactNode } from "react";
import { FieldTab } from "@puckeditor/core";
import { BuilderLink as Link } from "../host";
import { scopeCustomCss } from "../core/customCss";
import { RenderItemIcon, buildVisibilityCss, sanitizeSectionId } from "@/puck/components/shared";
import { createColorField } from "@/puck/fields/ColorPickerField";
import { createIconPickerField } from "@/puck/fields/IconPickerField";
import { createImagePickerField } from "@/puck/fields/ImagePickerField";
import { createCustomCssField } from "@/puck/fields/CustomCssField";
import { createVisibilityField } from "@/puck/fields/VisibilityField";
import type { BlockVisibility } from "@/puck/types";
import { BeforeAfterView, CountdownView, GalleryView, TableOfContentsView } from "./views";

type Common = { customCss?: string; visibility?: BlockVisibility; locked?: boolean };

export type GeneralComponents = {
  IconBoxBlock: Common & {
    icon: string; title: string; text: string; link: string; linkText: string;
    position: "top" | "left"; align: "left" | "center"; iconColor: string; iconBg: string; titleColor: string; textColor: string;
  };
  ImageBoxBlock: Common & {
    image: string; alt: string; title: string; text: string; link: string; linkText: string;
    position: "top" | "left"; align: "left" | "center"; radius: number; titleColor: string; textColor: string;
  };
  IconListBlock: Common & {
    items: { icon: string; text: string; link: string }[];
    layout: "vertical" | "inline"; iconColor: string; textColor: string; divider: boolean;
  };
  StarRatingBlock: Common & { rating: number; scale: number; size: number; color: string; label: string; align: "left" | "center" | "right" };
  ImageGalleryBlock: Common & {
    images: { src: string; alt: string; caption: string }[];
    columns: number; gap: number; radius: number; aspect: string; lightbox: boolean;
  };
  ProgressBarBlock: Common & { items: { label: string; percent: number }[]; color: string; trackColor: string; height: number; showPercent: boolean };
  SocialIconsBlock: Common & {
    items: { network: string; url: string }[];
    size: number; shape: "circle" | "rounded" | "none"; color: string; bgColor: string; align: "left" | "center" | "right";
  };
  AlertBlock: Common & { tone: "info" | "success" | "warning" | "danger"; title: string; text: string };
  BeforeAfterBlock: Common & {
    before: string; after: string; beforeAlt: string; afterAlt: string; beforeLabel: string; afterLabel: string; start: number; radius: number;
  };
  TableOfContentsBlock: Common & { title: string; includeH3: boolean; accent: string };
  CountdownBlock: Common & { heading: string; until: string; endedText: string; color: string; boxColor: string };
  PriceListBlock: Common & {
    items: { title: string; description: string; price: string; link: string }[];
    titleColor: string; priceColor: string; leader: boolean;
  };
  MenuAnchorBlock: { anchor: string; locked?: boolean };
};

const LOCK = {
  type: "radio" as const,
  label: "Lock (prevent delete/drag)",
  options: [
    { label: "Unlocked", value: false },
    { label: "Locked", value: true },
  ],
};
const lockPermissions = (data: { props: { locked?: boolean } }, { permissions }: { permissions: Partial<Record<string, boolean>> }) =>
  data.props.locked ? { ...permissions, delete: false, drag: false } : permissions;
const ALIGN3 = {
  type: "radio" as const,
  label: "Alignment",
  options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ],
};
const ALIGN2 = { type: "radio" as const, label: "Alignment", options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }] };
const POSITION = { type: "radio" as const, label: "Media position", options: [{ label: "Top", value: "top" }, { label: "Left", value: "left" }] };
const YESNO = (label: string) => ({ type: "radio" as const, label, options: [{ label: "Yes", value: true }, { label: "No", value: false }] });
const ADVANCED = { customCss: createCustomCssField(), visibility: createVisibilityField(), locked: LOCK };

/** Every widget's outer box: stable id for scoped CSS + device visibility. */
function Box({ id, prefix, customCss, visibility, children }: { id: string; prefix: string; customCss?: string; visibility?: BlockVisibility; children: ReactNode }) {
  const safeId = sanitizeSectionId(id, prefix);
  const css = (customCss ? scopeCustomCss(customCss, safeId) : "") + buildVisibilityCss(safeId, visibility);
  return (
    <div id={safeId} className="w-full">
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {children}
    </div>
  );
}

function MaybeLink({ href, children, className }: { href?: string; children: ReactNode; className?: string }) {
  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}

// Simple line icons for social networks (this lucide version has no brand icons).
const SOCIAL: Record<string, { label: string; svg: ReactNode }> = {
  facebook: { label: "Facebook", svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> },
  instagram: {
    label: "Instagram",
    svg: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  x: { label: "X (Twitter)", svg: <path d="M4 4l16 16M20 4L4 20" /> },
  youtube: {
    label: "YouTube",
    svg: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9l5 3-5 3z" />
      </>
    ),
  },
  tiktok: {
    label: "TikTok",
    svg: (
      <>
        <circle cx="8" cy="17" r="3" />
        <path d="M11 17V3c1 3 3.5 4.5 6 4.5" />
      </>
    ),
  },
  linkedin: {
    label: "LinkedIn",
    svg: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
  },
  google: { label: "Google", svg: <path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5a4.4 4.4 0 0 1-1.9 2.8v2.3h3A9 9 0 0 0 21 12.2zM12 21a9 9 0 1 1 6.1-15.6" /> },
  yelp: { label: "Yelp", svg: <path d="M12 3v9M12 12l7-2M12 12l5 6M12 12l-5 6M12 12l-7-2" /> },
  email: {
    label: "Email",
    svg: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 6L2 7" />
      </>
    ),
  },
  phone: { label: "Phone", svg: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /> },
  website: {
    label: "Website",
    svg: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
      </>
    ),
  },
};

const ALERT_TONES = {
  info: { bg: "#eef4fb", border: "#c8dcf2", text: "#1a3d66", icon: "Info" },
  success: { bg: "#ecf7f0", border: "#c3e6cf", text: "#1e5a35", icon: "CheckCircle2" },
  warning: { bg: "#fff8e6", border: "#f2d59b", text: "#5c4300", icon: "AlertTriangle" },
  danger: { bg: "#fdeeee", border: "#f3c5c5", text: "#7a1f1f", icon: "AlertCircle" },
};

function Stars({ rating, scale, size, color }: { rating: number; scale: number; size: number; color: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {Array.from({ length: scale }, (_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`sr-${i}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor={color} />
                <stop offset={`${fill * 100}%`} stopColor="#d9d9d9" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"
              fill={`url(#sr-${i}-${Math.round(fill * 100)})`}
            />
          </svg>
        );
      })}
    </span>
  );
}

const justify = (a?: string) => (a === "center" ? "center" : a === "right" ? "flex-end" : "flex-start");

export const generalWidgets = {
  IconBoxBlock: {
    label: "Icon Box",
    defaultProps: {
      icon: "Wrench",
      title: "Same-day repairs",
      text: "Most screen and battery repairs are done while you wait.",
      link: "",
      linkText: "",
      position: "top" as const,
      align: "left" as const,
      iconColor: "#00807A",
      iconBg: "#e6f2f1",
      titleColor: "#111827",
      textColor: "#4b5563",
      customCss: "",
    },
    fields: {
      icon: createIconPickerField("Icon"),
      title: { type: "text" as const, label: "Title" },
      text: { type: "textarea" as const, label: "Text" },
      link: { type: "text" as const, label: "Link URL (optional)" },
      linkText: { type: "text" as const, label: "Link text (optional)" },
      position: POSITION,
      align: ALIGN2,
      iconColor: createColorField("Icon color"),
      iconBg: createColorField("Icon background"),
      titleColor: createColorField("Title color"),
      textColor: createColorField("Text color"),
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.icon}{fields.title}{fields.text}{fields.link}{fields.linkText}</FieldTab>
        <FieldTab label="Style">{fields.position}{fields.align}{fields.iconColor}{fields.iconBg}{fields.titleColor}{fields.textColor}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["IconBoxBlock"] & { id: string }) => (
      <Box id={p.id} prefix="icon-box" customCss={p.customCss} visibility={p.visibility}>
        <div
          className={`flex gap-4 ${p.position === "left" ? "flex-row items-start" : "flex-col"}`}
          style={{ textAlign: p.align, alignItems: p.position === "top" && p.align === "center" ? "center" : undefined }}
        >
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: p.iconBg, color: p.iconColor }}>
            <RenderItemIcon name={p.icon} className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-snug" style={{ color: p.titleColor }}>{p.title}</h3>
            {p.text ? <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: p.textColor }}>{p.text}</p> : null}
            {p.link && p.linkText ? (
              <Link href={p.link} className="mt-2 inline-block text-sm font-semibold hover:underline" style={{ color: p.iconColor }}>
                {p.linkText} →
              </Link>
            ) : null}
          </div>
        </div>
      </Box>
    ),
  },

  ImageBoxBlock: {
    label: "Image Box",
    defaultProps: {
      image: "",
      alt: "",
      title: "Screen replacement",
      text: "Cracked or unresponsive screens replaced with quality parts.",
      link: "",
      linkText: "",
      position: "top" as const,
      align: "left" as const,
      radius: 12,
      titleColor: "#111827",
      textColor: "#4b5563",
      customCss: "",
    },
    fields: {
      image: createImagePickerField("Image"),
      alt: { type: "text" as const, label: "Image alt text (describe the photo)" },
      title: { type: "text" as const, label: "Title" },
      text: { type: "textarea" as const, label: "Text" },
      link: { type: "text" as const, label: "Link URL (optional)" },
      linkText: { type: "text" as const, label: "Link text (optional)" },
      position: POSITION,
      align: ALIGN2,
      radius: { type: "number" as const, label: "Image corner radius (px)", min: 0, max: 40 },
      titleColor: createColorField("Title color"),
      textColor: createColorField("Text color"),
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.image}{fields.alt}{fields.title}{fields.text}{fields.link}{fields.linkText}</FieldTab>
        <FieldTab label="Style">{fields.position}{fields.align}{fields.radius}{fields.titleColor}{fields.textColor}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["ImageBoxBlock"] & { id: string }) => (
      <Box id={p.id} prefix="image-box" customCss={p.customCss} visibility={p.visibility}>
        <div className={`flex gap-4 ${p.position === "left" ? "flex-col sm:flex-row sm:items-start" : "flex-col"}`} style={{ textAlign: p.align }}>
          {p.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.image}
              alt={p.alt}
              loading="lazy"
              className={`object-cover ${p.position === "left" ? "w-full sm:w-40 aspect-[4/3]" : "w-full aspect-[16/10]"}`}
              style={{ borderRadius: p.radius }}
            />
          ) : (
            <div className="w-full aspect-[16/10] rounded-lg border border-dashed border-gray-300 bg-gray-50" />
          )}
          <div className="min-w-0">
            <h3 className="text-lg font-semibold leading-snug" style={{ color: p.titleColor }}>
              <MaybeLink href={p.link}>{p.title}</MaybeLink>
            </h3>
            {p.text ? <p className="mt-1.5 text-[15px] leading-relaxed" style={{ color: p.textColor }}>{p.text}</p> : null}
            {p.link && p.linkText ? (
              <Link href={p.link} className="mt-2 inline-block text-sm font-semibold text-sfd-teal hover:underline">
                {p.linkText} →
              </Link>
            ) : null}
          </div>
        </div>
      </Box>
    ),
  },

  IconListBlock: {
    label: "Icon List",
    defaultProps: {
      items: [
        { icon: "Check", text: "Free diagnosis", link: "" },
        { icon: "Check", text: "90-day warranty on parts and labor", link: "" },
        { icon: "Check", text: "Walk-ins welcome", link: "" },
      ],
      layout: "vertical" as const,
      iconColor: "#00807A",
      textColor: "#1f2937",
      divider: false,
      customCss: "",
    },
    fields: {
      items: {
        type: "array" as const,
        label: "Items",
        getItemSummary: (it: { text?: string }) => it.text || "Item",
        defaultItemProps: { icon: "Check", text: "New item", link: "" },
        arrayFields: {
          icon: createIconPickerField("Icon"),
          text: { type: "text" as const, label: "Text" },
          link: { type: "text" as const, label: "Link URL (optional)" },
        },
      },
      layout: { type: "radio" as const, label: "Layout", options: [{ label: "List", value: "vertical" }, { label: "In a row", value: "inline" }] },
      iconColor: createColorField("Icon color"),
      textColor: createColorField("Text color"),
      divider: YESNO("Lines between items"),
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.items}</FieldTab>
        <FieldTab label="Style">{fields.layout}{fields.iconColor}{fields.textColor}{fields.divider}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["IconListBlock"] & { id: string }) => (
      <Box id={p.id} prefix="icon-list" customCss={p.customCss} visibility={p.visibility}>
        <ul className={p.layout === "inline" ? "flex flex-wrap gap-x-6 gap-y-2" : "flex flex-col"}>
          {(p.items ?? []).map((it, i) => (
            <li
              key={i}
              className={`flex items-center gap-2.5 text-[15px] ${p.layout === "vertical" ? "py-1.5" : ""} ${
                p.divider && p.layout === "vertical" && i > 0 ? "border-t border-gray-200" : ""
              }`}
              style={{ color: p.textColor }}
            >
              <span style={{ color: p.iconColor }} className="inline-flex shrink-0">
                <RenderItemIcon name={it.icon} className="h-4 w-4" />
              </span>
              <MaybeLink href={it.link} className={it.link ? "hover:underline" : undefined}>
                {it.text}
              </MaybeLink>
            </li>
          ))}
        </ul>
      </Box>
    ),
  },

  StarRatingBlock: {
    label: "Star Rating",
    defaultProps: { rating: 5, scale: 5, size: 20, color: "#f5a623", label: "", align: "left" as const, customCss: "" },
    fields: {
      rating: { type: "number" as const, label: "Rating (e.g. 4.8)", min: 0, max: 10, step: 0.1 },
      scale: { type: "number" as const, label: "Out of (stars)", min: 1, max: 10 },
      label: { type: "text" as const, label: "Text next to the stars (keep it accurate, e.g. '4.8 on Google')" },
      size: { type: "number" as const, label: "Star size (px)", min: 10, max: 48 },
      color: createColorField("Star color"),
      align: ALIGN3,
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.rating}{fields.scale}{fields.label}</FieldTab>
        <FieldTab label="Style">{fields.size}{fields.color}{fields.align}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["StarRatingBlock"] & { id: string }) => {
      const scale = Math.max(1, Math.round(p.scale || 5));
      const rating = Math.max(0, Math.min(scale, Number(p.rating) || 0));
      return (
        <Box id={p.id} prefix="star-rating" customCss={p.customCss} visibility={p.visibility}>
          <div className="flex items-center gap-2" style={{ justifyContent: justify(p.align) }}>
            <span role="img" aria-label={`Rated ${rating} out of ${scale}`}>
              <Stars rating={rating} scale={scale} size={p.size || 20} color={p.color} />
            </span>
            {p.label ? <span className="text-sm font-medium text-gray-700">{p.label}</span> : null}
          </div>
        </Box>
      );
    },
  },

  ImageGalleryBlock: {
    label: "Image Gallery",
    defaultProps: { images: [], columns: 3, gap: 12, radius: 8, aspect: "4/3", lightbox: true, customCss: "" },
    fields: {
      images: {
        type: "array" as const,
        label: "Photos",
        getItemSummary: (it: { alt?: string }) => it.alt || "Photo",
        defaultItemProps: { src: "", alt: "", caption: "" },
        arrayFields: {
          src: createImagePickerField("Photo"),
          alt: { type: "text" as const, label: "Alt text (describe the photo)" },
          caption: { type: "text" as const, label: "Caption (optional)" },
        },
      },
      lightbox: YESNO("Open larger on click"),
      columns: { type: "number" as const, label: "Columns (desktop)", min: 1, max: 6 },
      gap: { type: "number" as const, label: "Gap (px)", min: 0, max: 48 },
      radius: { type: "number" as const, label: "Corner radius (px)", min: 0, max: 32 },
      aspect: {
        type: "select" as const,
        label: "Photo shape",
        options: [
          { label: "4:3", value: "4/3" },
          { label: "Square", value: "1/1" },
          { label: "16:9", value: "16/9" },
          { label: "3:4 (portrait)", value: "3/4" },
          { label: "Original", value: "auto" },
        ],
      },
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.images}{fields.lightbox}</FieldTab>
        <FieldTab label="Style">{fields.columns}{fields.gap}{fields.radius}{fields.aspect}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["ImageGalleryBlock"] & { id: string }) => (
      <Box id={p.id} prefix="gallery" customCss={p.customCss} visibility={p.visibility}>
        <GalleryView images={p.images ?? []} columns={p.columns} gap={p.gap} radius={p.radius} aspect={p.aspect} lightbox={p.lightbox} />
      </Box>
    ),
  },

  ProgressBarBlock: {
    label: "Progress Bars",
    defaultProps: {
      items: [
        { label: "Screen repairs", percent: 90 },
        { label: "Battery replacements", percent: 75 },
      ],
      color: "#00807A",
      trackColor: "#e5e7eb",
      height: 10,
      showPercent: true,
      customCss: "",
    },
    fields: {
      items: {
        type: "array" as const,
        label: "Bars",
        getItemSummary: (it: { label?: string }) => it.label || "Bar",
        defaultItemProps: { label: "New bar", percent: 50 },
        arrayFields: {
          label: { type: "text" as const, label: "Label" },
          percent: { type: "number" as const, label: "Percent (0-100)", min: 0, max: 100 },
        },
      },
      showPercent: YESNO("Show the number"),
      color: createColorField("Bar color"),
      trackColor: createColorField("Track color"),
      height: { type: "number" as const, label: "Bar height (px)", min: 4, max: 32 },
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.items}{fields.showPercent}</FieldTab>
        <FieldTab label="Style">{fields.color}{fields.trackColor}{fields.height}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["ProgressBarBlock"] & { id: string }) => (
      <Box id={p.id} prefix="progress" customCss={p.customCss} visibility={p.visibility}>
        <div className="flex flex-col gap-4">
          {(p.items ?? []).map((it, i) => {
            const pct = Math.max(0, Math.min(100, Number(it.percent) || 0));
            return (
              <div key={i}>
                <div className="mb-1.5 flex justify-between text-sm font-medium text-gray-800">
                  <span>{it.label}</span>
                  {p.showPercent ? <span className="tabular-nums text-gray-600">{pct}%</span> : null}
                </div>
                <div
                  role="progressbar"
                  aria-label={it.label}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="w-full overflow-hidden rounded-full"
                  style={{ background: p.trackColor, height: p.height }}
                >
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </Box>
    ),
  },

  SocialIconsBlock: {
    label: "Social Icons",
    defaultProps: {
      items: [
        { network: "facebook", url: "" },
        { network: "instagram", url: "" },
        { network: "google", url: "" },
      ],
      size: 40,
      shape: "circle" as const,
      color: "#ffffff",
      bgColor: "#00807A",
      align: "left" as const,
      customCss: "",
    },
    fields: {
      items: {
        type: "array" as const,
        label: "Profiles",
        getItemSummary: (it: { network?: string }) => SOCIAL[it.network ?? ""]?.label ?? "Profile",
        defaultItemProps: { network: "website", url: "" },
        arrayFields: {
          network: {
            type: "select" as const,
            label: "Network",
            options: Object.entries(SOCIAL).map(([value, s]) => ({ label: s.label, value })),
          },
          url: { type: "text" as const, label: "Profile URL (https://… , mailto: or tel:)" },
        },
      },
      size: { type: "number" as const, label: "Button size (px)", min: 24, max: 72 },
      shape: {
        type: "radio" as const,
        label: "Shape",
        options: [
          { label: "Circle", value: "circle" },
          { label: "Rounded", value: "rounded" },
          { label: "Icon only", value: "none" },
        ],
      },
      color: createColorField("Icon color"),
      bgColor: createColorField("Background"),
      align: ALIGN3,
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.items}</FieldTab>
        <FieldTab label="Style">{fields.size}{fields.shape}{fields.color}{fields.bgColor}{fields.align}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["SocialIconsBlock"] & { id: string }) => {
      const size = p.size || 40;
      const radius = p.shape === "circle" ? "9999px" : p.shape === "rounded" ? "10px" : "0";
      return (
        <Box id={p.id} prefix="social" customCss={p.customCss} visibility={p.visibility}>
          <ul className="flex flex-wrap gap-2.5" style={{ justifyContent: justify(p.align) }}>
            {(p.items ?? []).map((it, i) => {
              const s = SOCIAL[it.network] ?? SOCIAL.website;
              const icon = (
                <svg width={Math.round(size * 0.48)} height={Math.round(size * 0.48)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {s.svg}
                </svg>
              );
              const style = {
                width: size,
                height: size,
                borderRadius: radius,
                background: p.shape === "none" ? "transparent" : p.bgColor,
                color: p.shape === "none" ? p.bgColor : p.color,
              };
              return (
                <li key={i}>
                  {it.url ? (
                    <a
                      href={it.url}
                      target={it.url.startsWith("http") ? "_blank" : undefined}
                      rel={it.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      aria-label={s.label}
                      className="inline-flex items-center justify-center transition-opacity hover:opacity-85"
                      style={style}
                    >
                      {icon}
                    </a>
                  ) : (
                    <span aria-label={s.label} className="inline-flex items-center justify-center opacity-60" style={style}>
                      {icon}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </Box>
      );
    },
  },

  AlertBlock: {
    label: "Alert / Notice",
    defaultProps: { tone: "info" as const, title: "Holiday hours", text: "All stores close at 4 PM on December 24.", customCss: "" },
    fields: {
      tone: {
        type: "radio" as const,
        label: "Type",
        options: [
          { label: "Info", value: "info" },
          { label: "Success", value: "success" },
          { label: "Warning", value: "warning" },
          { label: "Important", value: "danger" },
        ],
      },
      title: { type: "text" as const, label: "Title (optional)" },
      text: { type: "textarea" as const, label: "Message" },
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.tone}{fields.title}{fields.text}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["AlertBlock"] & { id: string }) => {
      const t = ALERT_TONES[p.tone] ?? ALERT_TONES.info;
      return (
        <Box id={p.id} prefix="alert" customCss={p.customCss} visibility={p.visibility}>
          <div role={p.tone === "danger" || p.tone === "warning" ? "alert" : "note"} className="flex gap-3 rounded-lg border px-4 py-3" style={{ background: t.bg, borderColor: t.border, color: t.text }}>
            <RenderItemIcon name={t.icon} className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="text-[15px] leading-relaxed">
              {p.title ? <p className="font-semibold">{p.title}</p> : null}
              {p.text ? <p>{p.text}</p> : null}
            </div>
          </div>
        </Box>
      );
    },
  },

  BeforeAfterBlock: {
    label: "Before / After",
    defaultProps: {
      before: "",
      after: "",
      beforeAlt: "Device before the repair",
      afterAlt: "Device after the repair",
      beforeLabel: "Before",
      afterLabel: "After",
      start: 50,
      radius: 12,
      customCss: "",
    },
    fields: {
      before: createImagePickerField("Before photo"),
      beforeAlt: { type: "text" as const, label: "Before photo alt text" },
      after: createImagePickerField("After photo (same size)"),
      afterAlt: { type: "text" as const, label: "After photo alt text" },
      beforeLabel: { type: "text" as const, label: "Before label" },
      afterLabel: { type: "text" as const, label: "After label" },
      start: { type: "number" as const, label: "Divider start (%)", min: 5, max: 95 },
      radius: { type: "number" as const, label: "Corner radius (px)", min: 0, max: 40 },
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.before}{fields.beforeAlt}{fields.after}{fields.afterAlt}{fields.beforeLabel}{fields.afterLabel}</FieldTab>
        <FieldTab label="Style">{fields.start}{fields.radius}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["BeforeAfterBlock"] & { id: string }) => (
      <Box id={p.id} prefix="before-after" customCss={p.customCss} visibility={p.visibility}>
        <BeforeAfterView
          before={p.before}
          after={p.after}
          beforeAlt={p.beforeAlt}
          afterAlt={p.afterAlt}
          beforeLabel={p.beforeLabel}
          afterLabel={p.afterLabel}
          start={p.start}
          radius={p.radius}
        />
      </Box>
    ),
  },

  TableOfContentsBlock: {
    label: "Table of Contents",
    defaultProps: { title: "On this page", includeH3: false, accent: "#00807A", customCss: "" },
    fields: {
      title: { type: "text" as const, label: "Title" },
      includeH3: YESNO("Include sub-headings (H3)"),
      accent: createColorField("Link color"),
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.title}{fields.includeH3}</FieldTab>
        <FieldTab label="Style">{fields.accent}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["TableOfContentsBlock"] & { id: string }) => (
      <Box id={p.id} prefix="toc" customCss={p.customCss} visibility={p.visibility}>
        <TableOfContentsView title={p.title} includeH3={p.includeH3} accent={p.accent} />
      </Box>
    ),
  },

  CountdownBlock: {
    label: "Countdown",
    defaultProps: { heading: "", until: "", endedText: "This offer has ended.", color: "#111827", boxColor: "#f3f4f6", customCss: "" },
    fields: {
      heading: { type: "text" as const, label: "Heading (optional)" },
      until: { type: "text" as const, label: "Ends at (YYYY-MM-DD HH:MM, local time)" },
      endedText: { type: "text" as const, label: "Text after it ends" },
      color: createColorField("Number color"),
      boxColor: createColorField("Box color"),
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.heading}{fields.until}{fields.endedText}</FieldTab>
        <FieldTab label="Style">{fields.color}{fields.boxColor}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["CountdownBlock"] & { id: string }) => (
      <Box id={p.id} prefix="countdown" customCss={p.customCss} visibility={p.visibility}>
        {p.heading ? <p className="mb-3 text-center text-lg font-semibold text-gray-900">{p.heading}</p> : null}
        <CountdownView until={(p.until || "").trim().replace(" ", "T")} endedText={p.endedText} color={p.color} boxColor={p.boxColor} />
      </Box>
    ),
  },

  PriceListBlock: {
    label: "Price List",
    defaultProps: {
      items: [
        { title: "Screen replacement", description: "Most iPhone and Samsung models", price: "from $89", link: "" },
        { title: "Battery replacement", description: "Done in about 30 minutes", price: "from $69", link: "" },
      ],
      titleColor: "#111827",
      priceColor: "#00807A",
      leader: true,
      customCss: "",
    },
    fields: {
      items: {
        type: "array" as const,
        label: "Items",
        getItemSummary: (it: { title?: string }) => it.title || "Item",
        defaultItemProps: { title: "New item", description: "", price: "", link: "" },
        arrayFields: {
          title: { type: "text" as const, label: "Title" },
          description: { type: "text" as const, label: "Description (optional)" },
          price: { type: "text" as const, label: "Price (as shown, e.g. 'from $89')" },
          link: { type: "text" as const, label: "Link URL (optional)" },
        },
      },
      leader: YESNO("Dotted line to the price"),
      titleColor: createColorField("Title color"),
      priceColor: createColorField("Price color"),
      ...ADVANCED,
    },
    resolvePermissions: lockPermissions,
    renderFields: ({ fields }: { fields: Record<string, ReactNode> }) => (
      <>
        <FieldTab label="Content">{fields.items}</FieldTab>
        <FieldTab label="Style">{fields.leader}{fields.titleColor}{fields.priceColor}</FieldTab>
        <FieldTab label="Advanced">{fields.locked}{fields.visibility}{fields.customCss}</FieldTab>
      </>
    ),
    render: (p: GeneralComponents["PriceListBlock"] & { id: string }) => (
      <Box id={p.id} prefix="price-list" customCss={p.customCss} visibility={p.visibility}>
        <ul className="flex flex-col gap-4">
          {(p.items ?? []).map((it, i) => (
            <li key={i}>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-[15px]" style={{ color: p.titleColor }}>
                  <MaybeLink href={it.link} className={it.link ? "hover:underline" : undefined}>
                    {it.title}
                  </MaybeLink>
                </span>
                <span className={`flex-1 ${p.leader ? "border-b border-dotted border-gray-300" : ""}`} aria-hidden="true" />
                <span className="font-semibold tabular-nums text-[15px]" style={{ color: p.priceColor }}>{it.price}</span>
              </div>
              {it.description ? <p className="mt-0.5 text-sm text-gray-600">{it.description}</p> : null}
            </li>
          ))}
        </ul>
      </Box>
    ),
  },

  MenuAnchorBlock: {
    label: "Menu Anchor",
    defaultProps: { anchor: "section" },
    fields: {
      anchor: { type: "text" as const, label: "Anchor ID (link to it with #id, e.g. /about#team)" },
      locked: LOCK,
    },
    resolvePermissions: lockPermissions,
    render: (p: GeneralComponents["MenuAnchorBlock"] & { id: string; puck?: { isEditing?: boolean } }) => {
      const anchor = (p.anchor || "").trim().replace(/[^a-zA-Z0-9_-]/g, "-");
      return p.puck?.isEditing ? (
        <div id={anchor} className="rounded border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500">
          Anchor: #{anchor}
        </div>
      ) : (
        <div id={anchor} aria-hidden="true" style={{ scrollMarginTop: 96 }} />
      );
    },
  },
};
