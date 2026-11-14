import type { ComponentType, ReactNode } from "react";
import { useGetPuck, type Config } from "@puckeditor/core";
import {
  Activity,
  Award,
  Box,
  CalendarCheck,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  Code,
  Columns3,
  CreditCard,
  FileText,
  Grid3x3,
  Hash,
  Heading1,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  ListOrdered,
  MapPin,
  Megaphone,
  Milestone,
  Minus,
  MousePointerClick,
  Newspaper,
  PanelLeft,
  PanelTop,
  Pilcrow,
  Quote,
  RectangleVertical,
  Square,
  Star,
  Store,
  TrendingUp,
  Video,
} from "lucide-react";

type IconType = ComponentType<{ className?: string }>;

/**
 * Icons for the built-in widgets. A host can override or extend this per
 * widget through `widgetIcons` on <BuilderEditor>; unknown widgets fall back
 * to a neutral box.
 */
const DEFAULT_WIDGET_ICONS: Record<string, IconType> = {
  FlexBlock: Columns3,
  GridBlock: Grid3x3,
  ContainerBlock: Square,
  ColumnBlock: RectangleVertical,
  HeadingBlock: Heading1,
  ParagraphBlock: Pilcrow,
  ButtonBlock: MousePointerClick,
  ImageBlock: ImageIcon,
  VideoBlock: Video,
  IconBlock: Star,
  GoogleMapBlock: MapPin,
  SpacerDividerBlock: Minus,
  HtmlBlock: Code,
  CounterBlock: Hash,
  BreadcrumbBlock: ChevronRight,
  HeroBlock: LayoutTemplate,
  RepairTrackerBlock: Activity,
  StatsCounterRowBlock: TrendingUp,
  StepProcessBlock: ListOrdered,
  TestimonialBlock: Quote,
  PricingTableBlock: CreditCard,
  StoreCardBlock: Store,
  BookingFormBlock: CalendarCheck,
  BlogPostGridBlock: Newspaper,
  TabsBlock: PanelTop,
  AccordionBlock: ChevronsUpDown,
  TimelineBlock: Milestone,
  LogoStripBlock: Award,
  SplitBannerBlock: PanelLeft,
  FaqBlock: CircleHelp,
  ServicesGridBlock: LayoutGrid,
  CtaBannerBlock: Megaphone,
  FeatureCard: Star,
  RichTextBlock: FileText,
};

export type WidgetIconMap = Record<string, IconType>;

const ROOT_ZONE = "root:default-zone";

/**
 * Click-to-add, like Elementor: a click on a widget places it
 * - inside the selected container (at the end of its slot),
 * - else right after the selected widget,
 * - else at the end of the page,
 * and selects it so its settings open.
 */
function useAddWidget() {
  // useGetPuck reads the state only on click; usePuck would re-render all
  // ~66 tiles on every editor change (including every pointer move in a drag).
  const getPuck = useGetPuck();
  return (componentType: string) => {
    const { appState, dispatch, selectedItem, config } = getPuck();
    let zone = ROOT_ZONE;
    let index = ((appState.data.content || []) as unknown[]).length;
    const selector = appState.ui.itemSelector;

    if (selectedItem && selector) {
      const props = (selectedItem.props || {}) as Record<string, unknown>;
      const fields = ((config.components as Record<string, { fields?: Record<string, { type?: string }> }>)[
        selectedItem.type
      ]?.fields || {}) as Record<string, { type?: string }>;
      const slot = Object.keys(fields).find((name) => fields[name]?.type === "slot");
      if (slot && typeof props.id === "string") {
        zone = `${props.id}:${slot}`;
        index = Array.isArray(props[slot]) ? (props[slot] as unknown[]).length : 0;
      } else if (selector.zone) {
        zone = selector.zone;
        index = selector.index + 1;
      }
    }

    const id = `${componentType}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    dispatch({ type: "insert", componentType, destinationIndex: index, destinationZone: zone, id });
    dispatch({ type: "setUi", ui: { itemSelector: { index, zone } } });

    // Bring the new widget into view on the canvas once it has rendered.
    window.setTimeout(() => {
      const frame = document.querySelector<HTMLIFrameElement>("[data-puck-preview] iframe, iframe#preview-frame");
      const doc = frame?.contentDocument || document;
      doc
        .querySelector(`[data-puck-component="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  };
}

/**
 * Builds the `drawerItem` override: each widget in the left panel is drawn as
 * an icon tile (Elementor-style) instead of a plain text row.
 */
export function createWidgetTile(config: Config, extraIcons?: WidgetIconMap) {
  const icons = { ...DEFAULT_WIDGET_ICONS, ...(extraIcons || {}) };
  const components = (config.components || {}) as Record<string, { label?: string }>;

  return function WidgetTile({ name }: { name: string; children?: ReactNode }) {
    const Icon = icons[name] || Box;
    const label = components[name]?.label || name;
    const addWidget = useAddWidget();
    return (
      <div
        title={`${label}: click to add, or drag onto the page`}
        role="button"
        tabIndex={0}
        onClick={() => addWidget(name)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            addWidget(name);
          }
        }}
        className="pb-widget-tile flex h-[82px] w-full cursor-grab select-none flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-1.5 text-center text-gray-600 transition hover:border-[#009691] hover:text-[#007f7b] hover:shadow-sm active:cursor-grabbing"
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="line-clamp-2 text-[11px] font-semibold leading-tight">{label}</span>
      </div>
    );
  };
}
