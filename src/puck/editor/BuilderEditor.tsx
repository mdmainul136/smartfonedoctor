"use client";

import { useMemo, type ReactNode } from "react";
import { Puck, type Config, type Data, type Viewports } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "../puck-theme.css";
import StudioLayout, { type BuilderPanel } from "./StudioLayout";
import { PuckActionBar, PuckComponentOverlay } from "./CanvasOverlay";
import { createWidgetTile, type WidgetIconMap } from "./WidgetTile";

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
export default function BuilderEditor({
  config,
  data,
  editorKey,
  widgetIcons,
  ...layout
}: BuilderEditorProps) {
  const overrides = useMemo(
    () => ({
      componentOverlay: PuckComponentOverlay,
      actionBar: PuckActionBar,
      drawerItem: createWidgetTile(config, widgetIcons),
    }),
    [config, widgetIcons]
  );

  return (
    <div className="sfd-puck-theme">
      <Puck
        key={editorKey}
        config={config}
        data={data}
        viewports={VIEWPORTS}
        overrides={overrides}
        onPublish={layout.onPublish}
      >
        <StudioLayout {...layout} />
      </Puck>
    </div>
  );
}

export type { BuilderPanel };
