import type { AnchorHTMLAttributes, ComponentType } from "react";
import type { Field } from "@puckeditor/core";

/**
 * What the builder needs from the app it runs in. The builder never imports
 * the app; the app calls setBuilderHost() once (on the site and in admin) and
 * the builder reads these at render time. Anything left unset falls back to a
 * plain default, so the builder also runs on its own.
 */

export type BuilderLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type MediaPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialUrl?: string;
};

export type AiProvider = "gemini" | "openai";

export type AiSettings = {
  defaultProvider: AiProvider;
  geminiApiKey: string;
  openaiApiKey: string;
};

/**
 * App components that some widgets embed (a live repair tracker, a booking
 * wizard). The widget shows a placeholder when the host does not supply one.
 */
export type HostWidgets = {
  RepairTracker?: ComponentType<{
    title?: string;
    subtitle?: string;
    demoTicketId?: string;
    demoLastName?: string;
    accentColor?: string;
    secondaryColor?: string;
    showStoreCard?: boolean;
    showPickupChecklist?: boolean;
  }>;
  BookingWizard?: ComponentType;
  /** Renders a global block (content edited once, shown wherever inserted). */
  GlobalBlock?: ComponentType<{ id?: string }>;
  /** The global blocks the editor can pick from. */
  getGlobalBlockOptions?: () => { label: string; value: string }[];
  /**
   * Ready-made sections from the app's own code (a coded hero, a store finder...),
   * offered in the "Site Section" block. Key = stable id saved in page data.
   */
  sections?: Record<string, HostSection>;
};

/**
 * One coded section. `fields` (optional) become editable inputs in the builder;
 * their values reach the component as props, starting from `defaults`.
 */
export type HostSection = {
  label: string;
  // Each section has its own props, so the registry cannot name one type.
  component: ComponentType<any>;
  fields?: Record<string, Field>;
  defaults?: Record<string, unknown>;
};

export type BuilderHost = {
  /** Link used inside widgets: the app's router link, or a plain <a>. */
  Link: ComponentType<BuilderLinkProps>;
  /** Media library dialog. Without one, image fields take a URL only. */
  MediaPicker?: ComponentType<MediaPickerProps>;
  /** AI keys the user saved in the app's settings. */
  getAiSettings: () => AiSettings;
  /** Endpoint the AI panel posts to. */
  aiEndpoint: string;
  /** Where the AI panel's Settings link goes. Hidden when unset. */
  aiSettingsHref?: string;
  widgets: HostWidgets;
};

function PlainLink(props: BuilderLinkProps) {
  return <a {...props} />;
}

let host: BuilderHost = {
  Link: PlainLink,
  getAiSettings: () => ({ defaultProvider: "gemini", geminiApiKey: "", openaiApiKey: "" }),
  aiEndpoint: "/api/admin/puck-ai",
  widgets: {},
};

export function setBuilderHost(partial: Partial<BuilderHost>) {
  host = { ...host, ...partial };
}

export function getBuilderHost(): BuilderHost {
  return host;
}

/** Placeholder for a widget whose app component the host did not supply. */
export function MissingHostWidget({ name }: { name: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
      {name} is not available in this app.
    </div>
  );
}

/** The host's link component; use this in widgets instead of next/link. */
export function BuilderLink(props: BuilderLinkProps) {
  const HostLink = host.Link;
  return <HostLink {...props} />;
}
