"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Puck, type Config, type Data, type Viewports } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck-theme.css";
import StudioLayout, { type BuilderPanel } from "./StudioLayout";
import { PuckActionBar, PuckComponentOverlay } from "./CanvasOverlay";
import { createWidgetTile, type WidgetIconMap } from "./WidgetTile";
import { withAutoTabs } from "../core/autoTabs";
import { withStyleEngine } from "../style";
import { migrateLegacyLayout } from "../layout/migrateLegacyLayout";
import {
  BuilderStorageProvider,
  createLocalStorageBuilderStorage,
  type BuilderStorage,
} from "../storage";
import { setBuilderKit, type BuilderKit } from "../kit";

/** Browser storage, used until the host passes its own (a database adapter). */
const defaultStorage = createLocalStorageBuilderStorage();

const VIEWPORTS: Viewports = [
  { width: 375, height: "auto", label: "Mobile (375px)", icon: "Smartphone" },
  { width: 768, height: "auto", label: "Tablet (768px)", icon: "Tablet" },
  { width: 1280, height: "auto", label: "Desktop (1280px)", icon: "Monitor" },
  { width: "100%", height: "auto", label: "Full Width" },
];

export type BuilderEditorProps = {
  /** Widget config. Built-in widgets plus whatever the host registers. */
  config: Config;
  /** Page data to edit. */
  data: Data;
  /** Change this to throw away the current editing session and load `data` again. */
  editorKey: string;
  /** Stable id of the page (its slug). Drafts and revisions are kept under it. Defaults to the title. */
  documentId?: string;
  /** Brand colors offered first in every color picker. */
  kit?: BuilderKit;
  /** Where drafts, revisions and templates are kept. Defaults to the browser. */
  storage?: BuilderStorage;
  title: string;
  subtitle?: string;
  status?: string;
  onPublish: (data: Data) => void | Promise<void>;
  onExit?: () => void;
  previewHref?: string;
  headerActions?: ReactNode;
  /** Extra left-panel tabs owned by the host (SEO, page settings ...). */
  panels?: BuilderPanel[];
  widgetIcons?: WidgetIconMap;
  enableAi?: boolean;
};

/**
 * Full-screen page builder. This is the only editor entry point a host app
 * needs: it takes data in, hands data back on publish, and knows nothing about
 * where pages are stored or what the host's extra panels do.
 */
/**
 * Troubleshooting: add ?pbDebug=<flags> to the admin URL to switch parts of the
 * builder off, e.g. ?pbDebug=nooverlay,notile.
 *   stock     - plain Puck, none of our UI (layout, overlay, tiles)
 *   nolayout  - Puck's own layout instead of StudioLayout
 *   nooverlay - no canvas overlay / action bar overrides
 *   notile    - Puck's own widget list items instead of our tiles
 */
type DebugFlag = "stock" | "nolayout" | "nooverlay" | "notile";

function useDebugFlags(): Set<DebugFlag> {
  const [flags, setFlags] = useState<Set<DebugFlag>>(new Set());
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("pbDebug") || "";
    const next = new Set(raw.split(",").map((f) => f.trim()).filter(Boolean) as DebugFlag[]);
    if (next.size) {
      console.info("[builder] debug flags:", Array.from(next).join(", "));
      setFlags(next);
    }
  }, []);
  return flags;
}

export default function BuilderEditor({
  config: rawConfig,
  data: rawData,
  editorKey,
  widgetIcons,
  documentId,
  kit,
  storage = defaultStorage,
  ...layout
}: BuilderEditorProps) {
  // Set before the first render so the color pickers show the host's brand.
  useMemo(() => setBuilderKit(kit), [kit]);

  // Every widget gets Content / Style / Advanced tabs, including host widgets.
  // ...and a Design tab backed by the style engine.
  const config = useMemo(() => withAutoTabs(withStyleEngine(rawConfig)), [rawConfig]);

  // Older layout blocks open as the new Container / Grid. The stored page is
  // untouched until the user publishes.
  const data = useMemo(() => migrateLegacyLayout(rawData), [rawData]);

  const debug = useDebugFlags();
  const stock = debug.has("stock");

  const overrides = useMemo(() => {
    if (stock) return {};
    return {
      ...(debug.has("nooverlay")
        ? {}
        : { componentOverlay: PuckComponentOverlay, actionBar: PuckActionBar }),
      ...(debug.has("notile") ? {} : { drawerItem: createWidgetTile(config, widgetIcons) }),
    };
  }, [config, widgetIcons, debug, stock]);
  const useStudio = !stock && !debug.has("nolayout");

  return (
    <BuilderStorageProvider storage={storage} documentId={documentId || layout.title}>
    <div className="sfd-puck-theme">
      <Puck
        key={`${editorKey}:${Array.from(debug).join(",")}`}
        config={config}
        data={data}
        viewports={VIEWPORTS}
        overrides={overrides}
        onPublish={layout.onPublish}
      >
        {useStudio ? <StudioLayout {...layout} /> : undefined}
      </Puck>
    </div>
    </BuilderStorageProvider>
  );
}

export type { BuilderPanel };
