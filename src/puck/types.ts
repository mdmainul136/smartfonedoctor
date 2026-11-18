import type { Data, RichText, Slot } from "@puckeditor/core";

export type BlockVisibility = {
  hideOnDesktop?: boolean;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
};

export type ResponsiveDeviceOverride = {
  padding?: string;
  align?: "left" | "center";
  bgColor?: string;
  textColor?: string;
  gridColumns?: number;
  gap?: string;
  flexDirection?: "row" | "column";
};

export type ResponsiveOverrides = {
  tablet?: ResponsiveDeviceOverride;
  mobile?: ResponsiveDeviceOverride;
};

export type PuckIconName =
  | "None"
  // Trust & Badges
  | "Shield"
  | "ShieldCheck"
  | "Award"
  | "Star"
  | "Sparkles"
  | "ThumbsUp"
  | "Check"
  | "CheckCircle2"
  | "Heart"
  | "Trophy"
  | "BadgePercent"
  | "Lock"
  // Devices & Tech
  | "Smartphone"
  | "Tablet"
  | "Laptop"
  | "Monitor"
  | "Tv"
  | "Gamepad2"
  | "Headphones"
  | "Battery"
  | "BatteryCharging"
  | "Cpu"
  | "HardDrive"
  | "Wifi"
  | "Bluetooth"
  | "Camera"
  | "Mic"
  | "Volume2"
  | "Speaker"
  | "Usb"
  // Repair, Diagnostics & Tools
  | "Wrench"
  | "Hammer"
  | "Zap"
  | "Clock"
  | "Settings"
  | "Sliders"
  | "Activity"
  | "FileText"
  | "Layers"
  | "LayoutGrid"
  | "Recycle"
  | "Leaf"
  // Business, Store & Contact
  | "Phone"
  | "PhoneCall"
  | "Mail"
  | "MapPin"
  | "Navigation"
  | "Calendar"
  | "CalendarCheck"
  | "Store"
  | "Building"
  | "ShoppingBag"
  | "ShoppingCart"
  | "Truck"
  | "CreditCard"
  | "DollarSign"
  | "Globe"
  | "Search"
  | "HelpCircle"
  | "Info"
  | "AlertCircle"
  // Arrows, User & Actions
  | "ArrowRight"
  | "ArrowLeft"
  | "ArrowUp"
  | "ArrowDown"
  | "ChevronRight"
  | "ChevronLeft"
  | "ChevronDown"
  | "ExternalLink"
  | "Share2"
  | "Copy"
  | "Download"
  | "Upload"
  | "RefreshCw"
  | "User"
  | "Users"
  | string;

export type PuckGridItem = {
  title: string;
  description: string;
  badge: string;
  price: string;
  icon: PuckIconName;
  link: string;
  linkText: string;
  highlight: boolean;
  colSpan: "1" | "2" | "3" | "full";
  rowSpan: "1" | "2";
};

export type PuckFaqItem = {
  title: string;
  description: string;
  colSpan: "1" | "2" | "full";
};

export type PuckSplitItem = {
  badge: string;
  title: string;
  description: string;
  icon: PuckIconName;
};

export type HeroBlockProps = {
  badgeText: string;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  badgeBg: string;
  badgeColor: string;
  padding: string;
  align: "left" | "center";
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type ServicesGridBlockProps = {
  variant: "services_grid" | "benefits";
  heading: string;
  subheading: string;
  displayLayout: "grid" | "flex";
  gridColumns: number;
  flexDirection: "row" | "column";
  flexWrap: "wrap" | "nowrap";
  justifyContent: "flex-start" | "center" | "space-between" | "flex-end";
  alignItems: "stretch" | "flex-start" | "center" | "flex-end";
  gap: string;
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  padding: string;
  align: "left" | "center";
  borderRadius: string;
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
  items: PuckGridItem[];
};

export type SplitBannerBlockProps = {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  padding: string;
  borderRadius: string;
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
  items: PuckSplitItem[];
};

export type FaqBlockProps = {
  heading: string;
  subheading: string;
  displayLayout: "grid" | "flex";
  gridColumns: number;
  gap: string;
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  accentColor: string;
  padding: string;
  align: "left" | "center";
  borderRadius: string;
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
  items: PuckFaqItem[];
};

export type CtaBannerBlockProps = {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  padding: string;
  align: "left" | "center";
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type RichTextBlockProps = {
  heading: string;
  subheading: string;
  bodyHtml: RichText;
  bgColor: string;
  textColor: string;
  padding: string;
  align: "left" | "center";
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type ContainerBlockProps = {
  label: string;
  display: "grid" | "flex";
  columns: number;
  direction: "row" | "column";
  wrap: "wrap" | "nowrap";
  justify: "flex-start" | "center" | "space-between" | "flex-end";
  align: "stretch" | "flex-start" | "center" | "flex-end";
  gap: number;
  paddingY: number;
  paddingX: number;
  backgroundColor: string;
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
  children: Slot;
};

export type FeatureCardProps = {
  title: string;
  description: string;
  accentColor: string;
};

export type GridBlockProps = {
  label: string;
  columns: number;
  templateColumns?: string;
  gap: number;
  rowGap?: number;
  align: "stretch" | "flex-start" | "center" | "flex-end";
  justifyItems?: "stretch" | "start" | "center" | "end";
  margin?: string;
  padding?: string;
  paddingY: number;
  paddingX: number;
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  position?: "static" | "relative" | "absolute" | "sticky";
  zIndex?: number;
  backgroundColor: string;
  borderWidth?: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: "none" | "sm" | "md" | "lg" | "xl";
  opacity?: number;
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
  children: Slot;
};

export type FlexBlockProps = {
  label: string;
  displayLayout?: "flex" | "grid" | "block";
  direction: "row" | "row-reverse" | "column" | "column-reverse";
  wrap: "wrap" | "nowrap" | "wrap-reverse";
  justify: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
  align: "stretch" | "flex-start" | "center" | "flex-end";
  gap: number;
  rowGap?: number;
  margin?: string;
  padding?: string;
  paddingY: number;
  paddingX: number;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  position?: "static" | "relative" | "absolute" | "sticky";
  zIndex?: number;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  textColor?: string;
  backgroundColor: string;
  borderWidth?: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: "none" | "sm" | "md" | "lg" | "xl";
  opacity?: number;
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
  children: Slot;
};

export type ColumnBlockProps = {
  label: string;
  flexRatio?: string;
  colRatio?: string;
  columnWidth?: string;
  minHeight?: string;
  paddingY: number;
  paddingX: number;
  backgroundColor: string;
  borderWidth?: number;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderColor?: string;
  borderRadius?: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
  children: Slot;
};

export type HeadingBlockProps = {
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  text: string;
  link?: string;
  align: "left" | "center" | "right";
  color: string;
  fontSize: string;
  fontWeight: "600" | "700" | "800";
  marginBottom: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type ParagraphBlockProps = {
  text: string;
  align: "left" | "center" | "right";
  color: string;
  fontSize: string;
  lineHeight: string;
  maxWidth: string;
  marginBottom: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type ButtonBlockProps = {
  text: string;
  href: string;
  variant: "primary" | "outline" | "dark";
  accentColor: string;
  textColor: string;
  align: "left" | "center" | "right";
  borderRadius: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type ImageBlockProps = {
  src: string;
  alt: string;
  caption: string;
  width: string;
  borderRadius: string;
  align: "left" | "center" | "right";
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type SpacerDividerBlockProps = {
  mode: "spacer" | "divider";
  height: number;
  lineColor: string;
};

export type HtmlBlockProps = {
  label: string;
  html: string;
  padding: string;
  backgroundColor: string;
  borderRadius: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type GoogleMapBlockProps = {
  address: string;
  height: number;
  borderRadius: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type VideoBlockProps = {
  url: string;
  poster: string;
  aspectRatio: "16/9" | "4/3" | "1/1" | "9/16";
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  borderRadius: string;
  maxWidth: string;
  align: "left" | "center" | "right";
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type IconBlockProps = {
  icon: PuckIconName;
  size: number;
  color: string;
  bgColor: string;
  shape: "none" | "circle" | "square" | "rounded";
  align: "left" | "center" | "right";
  borderStyle?: "none" | "subtle" | "brand" | "dashed";
  shadow?: "none" | "sm" | "md" | "glow";
  hoverEffect?: "none" | "scale" | "bounce" | "rotate";
  link?: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type CounterBlockProps = {
  endValue: number;
  startValue?: number;
  prefix?: string;
  suffix?: string;
  title: string;
  color: string;
  titleColor: string;
  fontSize: string;
  align: "left" | "center" | "right";
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type RepairTrackerBlockProps = {
  title: string;
  subtitle: string;
  demoTicketId: string;
  demoLastName: string;
  accentColor: string;
  secondaryColor: string;
  showStoreCard: boolean;
  showPickupChecklist: boolean;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type StatsCounterItem = {
  value: string;
  suffix: string;
  label: string;
  subtext: string;
};

export type StatsCounterRowBlockProps = {
  heading: string;
  subheading: string;
  columns: number;
  items: StatsCounterItem[];
  bgColor: string;
  textColor: string;
  accentColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type StepItem = {
  stepNumber: string;
  title: string;
  description: string;
  badge: string;
};

export type StepProcessBlockProps = {
  heading: string;
  subheading: string;
  layout: "horizontal" | "vertical";
  steps: StepItem[];
  bgColor: string;
  textColor: string;
  accentColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type TestimonialItem = {
  name: string;
  role: string;
  rating: number;
  text: string;
  date: string;
  source: "Google" | "Yelp" | "Direct";
};

export type TestimonialBlockProps = {
  heading: string;
  subheading: string;
  columns: number;
  items: TestimonialItem[];
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  accentColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type PricingRow = {
  service: string;
  device: string;
  price: string;
  turnaround: string;
  warranty: string;
  badge: string;
  popular: boolean;
  ctaText: string;
  ctaLink: string;
};

export type PricingTableBlockProps = {
  heading: string;
  subheading: string;
  items: PricingRow[];
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  accentColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type StoreCardBlockProps = {
  storeName: string;
  badge: string;
  address: string;
  phone: string;
  hoursText: string;
  gmbUrl: string;
  appointmentUrl: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type BookingFormBlockProps = {
  mode?: "interactive" | "teaser";
  heading: string;
  subheading: string;
  badge: string;
  buttonText: string;
  redirectUrl: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type BlogPostItem = {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  link: string;
  image: string;
};

export type BlogPostGridBlockProps = {
  heading: string;
  subheading: string;
  columns: number;
  items: BlogPostItem[];
  cardBgColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type TabItem = {
  label: string;
  badge: string;
  title: string;
  description: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  ctaText: string;
  ctaLink: string;
};

export type TabsBlockProps = {
  heading: string;
  subheading: string;
  items: TabItem[];
  accentColor: string;
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type AccordionItem = {
  title: string;
  badge: string;
  content: string;
};

export type AccordionBlockProps = {
  heading: string;
  subheading: string;
  items: AccordionItem[];
  accentColor: string;
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type TimelineItem = {
  step: string;
  dateOrTime: string;
  title: string;
  description: string;
  badge: string;
};

export type TimelineBlockProps = {
  heading: string;
  subheading: string;
  items: TimelineItem[];
  accentColor: string;
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type LogoItem = {
  name: string;
  badge: string;
  description: string;
  link: string;
};

export type LogoStripBlockProps = {
  heading: string;
  subheading: string;
  items: LogoItem[];
  accentColor: string;
  bgColor: string;
  textColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type PopularRepairItem = {
  name: string;
  price?: string;
  url: string;
  actionText?: string;
};

export type PopularRepairsBlockProps = {
  heading: string;
  subheading: string;
  viewAllText: string;
  viewAllUrl: string;
  columns: number;
  containerMode: "clean" | "borderless" | "card";
  bgColor: string;
  textColor: string;
  accentColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  padding: string;
  borderRadius: string;
  customCss: string;
  responsive?: ResponsiveOverrides;
  locked?: boolean;
  visibility?: BlockVisibility;
  items: PopularRepairItem[];
};

export type BreadcrumbItem = {
  label: string;
  url: string;
};

export type BreadcrumbBlockProps = {
  items: BreadcrumbItem[];
  separator: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  padding: string;
  customCss: string;
  locked?: boolean;
  visibility?: BlockVisibility;
};

export type PuckComponents = {
  HeroBlock: HeroBlockProps;
  PopularRepairsBlock: PopularRepairsBlockProps;
  ServicesGridBlock: ServicesGridBlockProps;
  SplitBannerBlock: SplitBannerBlockProps;
  FaqBlock: FaqBlockProps;
  CtaBannerBlock: CtaBannerBlockProps;
  RepairTrackerBlock: RepairTrackerBlockProps;
  StatsCounterRowBlock: StatsCounterRowBlockProps;
  StepProcessBlock: StepProcessBlockProps;
  TestimonialBlock: TestimonialBlockProps;
  PricingTableBlock: PricingTableBlockProps;
  StoreCardBlock: StoreCardBlockProps;
  BookingFormBlock: BookingFormBlockProps;
  BlogPostGridBlock: BlogPostGridBlockProps;
  TabsBlock: TabsBlockProps;
  AccordionBlock: AccordionBlockProps;
  TimelineBlock: TimelineBlockProps;
  LogoStripBlock: LogoStripBlockProps;
  BreadcrumbBlock: BreadcrumbBlockProps;
  RichTextBlock: RichTextBlockProps;
  ContainerBlock: ContainerBlockProps;
  GridBlock: GridBlockProps;
  FlexBlock: FlexBlockProps;
  ColumnBlock: ColumnBlockProps;
  FeatureCard: FeatureCardProps;
  HeadingBlock: HeadingBlockProps;
  ParagraphBlock: ParagraphBlockProps;
  ButtonBlock: ButtonBlockProps;
  ImageBlock: ImageBlockProps;
  VideoBlock: VideoBlockProps;
  IconBlock: IconBlockProps;
  CounterBlock: CounterBlockProps;
  SpacerDividerBlock: SpacerDividerBlockProps;
  HtmlBlock: HtmlBlockProps;
  GoogleMapBlock: GoogleMapBlockProps;
};

export type PuckPageData = Data<PuckComponents>;

