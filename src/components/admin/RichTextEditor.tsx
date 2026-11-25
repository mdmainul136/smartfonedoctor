"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import MediaModal, { SelectedMediaPayload } from "./MediaModal";
import { PSEO_DEVICES, PSEO_ISSUES } from "@/lib/pSeoEngine";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Lightbulb,
  AlertTriangle,
  Info,
  Code2,
  Eye,
  Check,
  X,
  PlusCircle,
  ChevronDown,
  Layers,
  Wrench,
  ListChecks,
  Table as TableIcon,
  Sparkles,
  Video,
  HelpCircle,
  Highlighter,
  Eraser,
  RemoveFormatting,
  Command,
  FileCode2,
  Maximize2,
  Minimize2,
  Palette,
  Paintbrush,
  Baseline,
  Bot,
  Wand2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Trash2,
  Plus,
  Sliders,
} from "lucide-react";

export type RichTextAiMode =
  | "full_article"
  | "aeo_capsule"
  | "geo_local"
  | "pseo_links"
  | "comparison_table"
  | "faq_block"
  | "seo_optimize"
  | "expand"
  | "polish"
  | "grammar"
  | "shorten"
  | "cta"
  | "custom";

export interface RichTextArticleContext {
  title?: string;
  slug?: string;
  category?: string;
  focusKeyword?: string;
  excerpt?: string;
}

export interface RichTextAiMetaSuggestion {
  excerpt?: string;
  focusKeyword?: string;
  tags?: string[];
  readTime?: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  articleContext?: RichTextArticleContext;
  onAiMetaSuggestion?: (meta: RichTextAiMetaSuggestion) => void;
}

interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  action: () => void;
}

const TEXT_COLORS = [
  { label: "Default Dark", color: "#111827" },
  { label: "Slate Gray", color: "#475569" },
  { label: "SmartFone Teal", color: "#00897b" },
  { label: "Royal Blue", color: "#2563eb" },
  { label: "Vivid Indigo", color: "#4f46e5" },
  { label: "Vibrant Purple", color: "#9333ea" },
  { label: "Crimson Red", color: "#dc2626" },
  { label: "Amber Orange", color: "#ea580c" },
  { label: "Emerald Green", color: "#16a34a" },
  { label: "Pure White", color: "#ffffff" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", color: "#fef08a" },
  { label: "Teal", color: "#ccfbf1" },
  { label: "Green", color: "#dcfce7" },
  { label: "Blue", color: "#dbeafe" },
  { label: "Purple", color: "#f3e8ff" },
  { label: "Pink", color: "#ffe4e6" },
  { label: "Orange", color: "#ffedd5" },
  { label: "Slate", color: "#f1f5f9" },
];

const BLOCK_BG_STYLES = [
  {
    label: "Soft Teal Bench Box",
    desc: "Light teal background with green-teal border",
    style: "background: #f0fdfa; border: 1px solid #99f6e4; color: #134e48; padding: 16px 20px; border-radius: 8px; margin: 18px 0;",
  },
  {
    label: "Light Gray Card",
    desc: "Clean bordered container card",
    style: "background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b; padding: 16px 20px; border-radius: 8px; margin: 18px 0;",
  },
  {
    label: "Warm Amber Callout",
    desc: "Warning/Attention amber container",
    style: "background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 16px 20px; border-radius: 8px; margin: 18px 0;",
  },
  {
    label: "Soft Blue Notice",
    desc: "Informational sky blue container",
    style: "background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; padding: 16px 20px; border-radius: 8px; margin: 18px 0;",
  },
  {
    label: "Soft Red Danger Card",
    desc: "High priority warning container",
    style: "background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 16px 20px; border-radius: 8px; margin: 18px 0;",
  },
  {
    label: "Dark Sleek Terminal Box",
    desc: "Dark charcoal background with light text",
    style: "background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 16px 20px; border-radius: 8px; margin: 18px 0;",
  },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your guide content here... (Type '/' for Payload slash commands)",
  minHeight = "460px",
  articleContext,
  onAiMetaSuggestion,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Link Dialog with Advance Dofollow/Nofollow/Sponsored/UGC
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");
  const [linkRel, setLinkRel] = useState<"dofollow" | "nofollow" | "sponsored" | "ugc">("dofollow");
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");

  // AI Content Writer Dialog (SEO + AEO + GEO + pSEO)
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSelectedText, setAiSelectedText] = useState("");
  const [aiAction, setAiAction] = useState<RichTextAiMode>("full_article");
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiResultText, setAiResultText] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);
  const [aiMetaSuggestion, setAiMetaSuggestion] = useState<RichTextAiMetaSuggestion | null>(null);
  const [aiPreviewTab, setAiPreviewTab] = useState<"preview" | "html">("preview");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Media Library Dialog
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Table Generator Dialog
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [includeHeader, setIncludeHeader] = useState(true);

  // YouTube Embed Dialog
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Advance pSEO Juicy Linking Dialog
  const [pseoModalOpen, setPseoModalOpen] = useState(false);
  const [selectedDeviceSlug, setSelectedDeviceSlug] = useState(PSEO_DEVICES[0]?.slug || "iphone-16-pro");
  const [selectedIssueSlug, setSelectedIssueSlug] = useState(PSEO_ISSUES[0]?.slug || "screen-repair");
  const [linkingStrategy, setLinkingStrategy] = useState<"inline" | "card" | "matrix">("inline");
  const [customAnchorText, setCustomAnchorText] = useState("");

  // Separate Heading & Insert Dropdown Menus (Independent states)
  const [headingMenuOpen, setHeadingMenuOpen] = useState(false);
  const headingMenuRef = useRef<HTMLDivElement>(null);

  const [insertMenuOpen, setInsertMenuOpen] = useState(false);
  const insertMenuRef = useRef<HTMLDivElement>(null);

  const bubbleRef = useRef<HTMLDivElement>(null);

  // Text & Block Color Selectors
  const [textColorMenuOpen, setTextColorMenuOpen] = useState(false);
  const [bgColorMenuOpen, setBgColorMenuOpen] = useState(false);
  const [activeColor, setActiveColor] = useState("#111827");
  const [customTextColor, setCustomTextColor] = useState("#00897b");
  const [customBgColor, setCustomBgColor] = useState("#ccfbf1");
  const textColorMenuRef = useRef<HTMLDivElement>(null);
  const bgColorMenuRef = useRef<HTMLDivElement>(null);

  // Active Formatting & Detected Block Detection
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });
  const [currentBlock, setCurrentBlock] = useState<{
    tag: string;
    label: string;
  }>({
    tag: "p",
    label: "Paragraph",
  });

  // Floating Bubble Selection Toolbar
  const [bubbleToolbar, setBubbleToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  // Elementor-style Floating Block Customizer / Inspector State
  const [activeBlockInfo, setActiveBlockInfo] = useState<{
    visible: boolean;
    element: HTMLElement | null;
    type: "callout" | "tools" | "step" | "comparison" | "faq" | "pseo" | "section" | null;
    calloutVariant?: "tip" | "warning" | "note" | "danger" | "pro";
    calloutStyle?: "accent" | "pill" | "glass";
    isFullWidth: boolean;
    x: number;
    y: number;
  }>({
    visible: false,
    element: null,
    type: null,
    isFullWidth: false,
    x: 0,
    y: 0,
  });

  // Elementor Side Style Inspector State
  const [sideInspectorOpen, setSideInspectorOpen] = useState(true);
  const [selectedBlockNode, setSelectedBlockNode] = useState<HTMLElement | null>(null);
  const [blockStyleProps, setBlockStyleProps] = useState({
    tag: "",
    type: "block",
    bg: "",
    textColor: "",
    borderColor: "",
    borderWidth: "",
    borderRadius: "",
    padding: "",
    isFullWidth: false,
    customCss: "",
    customClass: "",
    tableHeaderBg: "",
    tableStriped: false,
    stepNumber: "1",
    toolCols: 2,
  });

  // Slash Command Menu State
  const [slashMenu, setSlashMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    query: string;
    selectedIndex: number;
  }>({
    open: false,
    x: 0,
    y: 0,
    query: "",
    selectedIndex: 0,
  });

  // Keep editor content in sync when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (mode === "visual") {
        editorRef.current.innerHTML = value || "";
        updateCounts();
      }
    }
  }, [value, mode]);

  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setCharCount(text.length);
    const words = text.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    updateCounts();
  };

  const saveCurrentSelection = useCallback(() => {
    if (typeof window === "undefined" || mode !== "visual") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const anchor = sel.anchorNode;
      if (editorRef.current.contains(anchor)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  }, [mode]);

  const restoreSelection = useCallback(() => {
    if (savedRangeRef.current && typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  }, []);

  const updateActiveFormats = useCallback(() => {
    if (typeof window === "undefined" || mode !== "visual") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current?.contains(sel.anchorNode)) {
      return;
    }

    try {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
      });
    } catch {
      // Ignore if document query is unavailable
    }

    // Detect block element
    let node: Node | null = sel.anchorNode;
    if (node && node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    let detectedTag = "p";
    let detectedLabel = "Paragraph";

    while (node && node !== editorRef.current) {
      const tag = (node as HTMLElement).tagName?.toLowerCase();
      if (tag === "h1") {
        detectedTag = "h1";
        detectedLabel = "Heading 1";
        break;
      } else if (tag === "h2") {
        detectedTag = "h2";
        detectedLabel = "Heading 2";
        break;
      } else if (tag === "h3") {
        detectedTag = "h3";
        detectedLabel = "Heading 3";
        break;
      } else if (tag === "h4") {
        detectedTag = "h4";
        detectedLabel = "Heading 4";
        break;
      } else if (tag === "h5") {
        detectedTag = "h5";
        detectedLabel = "Heading 5";
        break;
      } else if (tag === "h6") {
        detectedTag = "h6";
        detectedLabel = "Heading 6";
        break;
      } else if (tag === "blockquote") {
        detectedTag = "blockquote";
        detectedLabel = "Blockquote";
        break;
      } else if (tag === "pre") {
        detectedTag = "pre";
        detectedLabel = "Code Block";
        break;
      } else if (tag === "p") {
        detectedTag = "p";
        detectedLabel = "Paragraph";
        break;
      }
      node = node.parentNode;
    }

    setCurrentBlock({ tag: detectedTag, label: detectedLabel });
  }, [mode]);

  const executeCommand = (command: string, val: string | undefined = undefined) => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, val);
    saveCurrentSelection();
    handleInput();
    updateActiveFormats();
  };

  const formatHeading = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p") => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    restoreSelection();

    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;

    const range = sel.getRangeAt(0);

    // 1. Locate the nearest enclosing block node
    let block: HTMLElement | null = null;
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }

    while (node && node !== editorRef.current) {
      const tagName = (node as HTMLElement).tagName?.toLowerCase();
      if (
        [
          "p",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "blockquote",
          "pre",
          "div",
          "li",
        ].includes(tagName)
      ) {
        block = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }

    if (block && block !== editorRef.current) {
      if (block.tagName.toLowerCase() === "li") {
        document.execCommand("formatBlock", false, `<${tag}>`);
      } else {
        const newEl = document.createElement(tag);
        newEl.innerHTML = block.innerHTML;
        block.parentNode?.replaceChild(newEl, block);

        const newRange = document.createRange();
        newRange.selectNodeContents(newEl);
        if (sel.isCollapsed) {
          newRange.collapse(false);
        }
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      }
    } else {
      if (!sel.isCollapsed) {
        const newEl = document.createElement(tag);
        newEl.innerHTML = range.toString() || range.cloneContents().textContent || "";
        range.deleteContents();
        range.insertNode(newEl);
        const newRange = document.createRange();
        newRange.selectNodeContents(newEl);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      } else {
        document.execCommand("formatBlock", false, `<${tag}>`);
      }
    }

    saveCurrentSelection();
    handleInput();
    updateActiveFormats();
    setHeadingMenuOpen(false);
  };

  const clearFormatting = () => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    restoreSelection();

    // 1. Remove standard formatting
    document.execCommand("removeFormat", false, undefined);
    // 2. Clear background/highlight
    document.execCommand("hiliteColor", false, "transparent");
    // 3. Reset text color
    document.execCommand("foreColor", false, "#111827");

    // 4. Strip inline style background-color or color on any container span
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let container: Node | null = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode;
      }
      if (container && container !== editorRef.current && editorRef.current?.contains(container)) {
        if ((container as HTMLElement).tagName?.toLowerCase() === "span") {
          (container as HTMLElement).style.backgroundColor = "";
          (container as HTMLElement).style.color = "";
        }
      }
    }

    saveCurrentSelection();
    handleInput();
    updateActiveFormats();
    setBgColorMenuOpen(false);
    setTextColorMenuOpen(false);
  };

  const insertHeading = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p") => {
    formatHeading(tag);
  };

  const openLinkModal = () => {
    if (typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        const str = sel.toString().trim();
        if (str) {
          setLinkText(str);
        }
      }
    }
    setLinkModalOpen(true);
  };

  const openAiModal = () => {
    let str = "";
    if (typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        str = sel.toString().trim();
      }
    }
    setAiSelectedText(str);
    setAiAction(str ? "seo_optimize" : "full_article");
    setAiResultText("");
    setAiError(null);
    setAiModelUsed(null);
    setAiMetaSuggestion(null);
    setAiPreviewTab("preview");
    setAiModalOpen(true);
  };

  const insertBlockquote = () => {
    executeCommand("formatBlock", "<blockquote>");
  };

  const insertHorizontalRule = () => {
    executeCommand("insertHorizontalRule");
  };

  const toggleHighlight = () => {
    executeCommand("hiliteColor", "#fef08a");
  };

  // Payload CMS Lexical / Notion Block Insertion Engine
  const insertCustomBlockNode = (htmlString: string) => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    restoreSelection();

    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (!sel || !editorRef.current) return;

    // 1. Clean DOM parser for the block
    const temp = document.createElement("div");
    temp.innerHTML = htmlString.trim();
    const newBlock = temp.firstElementChild as HTMLElement | null;
    if (!newBlock) return;

    // 2. Trailing paragraph for subsequent typing (Ensures you can always type on the line below!)
    const trailingP = document.createElement("p");
    trailingP.innerHTML = "<br>";

    // 3. Locate current block container
    let currentBlockEl: HTMLElement | null = null;
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as HTMLElement).tagName.toLowerCase();
          if (["p", "h1", "h2", "h3", "h4", "h5", "h6", "div", "blockquote", "ul", "ol", "table", "details"].includes(tag)) {
            currentBlockEl = node as HTMLElement;
            break;
          }
        }
        node = node.parentNode;
      }
    }

    if (currentBlockEl && currentBlockEl.parentNode && currentBlockEl !== editorRef.current) {
      const isEmpty = !currentBlockEl.textContent?.trim() && currentBlockEl.tagName.toLowerCase() === "p";
      if (isEmpty) {
        currentBlockEl.parentNode.insertBefore(newBlock, currentBlockEl);
        currentBlockEl.parentNode.insertBefore(trailingP, currentBlockEl);
        currentBlockEl.parentNode.removeChild(currentBlockEl);
      } else {
        if (currentBlockEl.nextSibling) {
          currentBlockEl.parentNode.insertBefore(newBlock, currentBlockEl.nextSibling);
          currentBlockEl.parentNode.insertBefore(trailingP, newBlock.nextSibling);
        } else {
          currentBlockEl.parentNode.appendChild(newBlock);
          currentBlockEl.parentNode.appendChild(trailingP);
        }
      }
    } else {
      editorRef.current.appendChild(newBlock);
      editorRef.current.appendChild(trailingP);
    }

    // 4. Place caret inside the new block's editable area
    const editableTarget = newBlock.querySelector(".sfd-callout-content") || newBlock;
    const range = document.createRange();
    range.selectNodeContents(editableTarget);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    savedRangeRef.current = range.cloneRange();

    handleInput();
    saveCurrentSelection();
  };

  // Custom Callout Alert Boxes (Editable Templates like MS Word + Customizable via Elementor Inspector)
  const insertCallout = (type: "tip" | "warning" | "note" | "danger" | "pro") => {
    if (mode !== "visual") return;
    setInsertMenuOpen(false);

    const titles = {
      tip: "Tip",
      warning: "Warning",
      note: "Note",
      danger: "Caution",
      pro: "Pro Tip",
    };

    const svgs = {
      tip: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
      warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      note: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      danger: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      pro: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    };

    const calloutHtml = `
      <div class="sfd-callout sfd-callout-${type}">
        <div class="sfd-callout-icon" contenteditable="false">
          ${svgs[type]}
        </div>
        <div class="sfd-callout-body">
          <span class="sfd-callout-title">${titles[type]}:</span>
          <span class="sfd-callout-content">Enter advice or technical notes here...</span>
        </div>
      </div>
    `;

    insertCustomBlockNode(calloutHtml);
  };

  // Structured Blocks Inserter (Payload CMS & Notion Minimalist Standard)
  const insertStructuredBlock = (type: "section" | "step" | "tools" | "comparison" | "faq" | "code") => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    setInsertMenuOpen(false);

    let html = "";
    if (type === "section") {
      html = `
        <div class="sfd-section-block">
          <h2 class="sfd-section-title">New Diagnostic Section</h2>
          <p class="sfd-section-desc">Describe the hardware symptoms, bench diagnosis, and repair procedure steps here...</p>
          <div class="sfd-callout sfd-callout-tip">
            <div class="sfd-callout-icon" contenteditable="false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
            </div>
            <div class="sfd-callout-body">
              <span class="sfd-callout-title">Tip:</span>
              <span class="sfd-callout-content">Always disconnect the battery connector before removing display cables.</span>
            </div>
          </div>
        </div>
      `;
    } else if (type === "step") {
      html = `
        <div class="sfd-step-card">
          <div class="sfd-step-badge">1</div>
          <div class="sfd-step-body">
            <h3 class="sfd-step-title">Step 1: Soft Prying with Anti-Static Spudger</h3>
            <p class="sfd-step-desc">Carefully release perimeter adhesive seal using gentle heat and nylon pry tool...</p>
          </div>
        </div>
      `;
    } else if (type === "tools") {
      html = `
        <div class="sfd-tools-card">
          <div class="sfd-tools-header">
            <div class="sfd-tools-icon" contenteditable="false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            </div>
            <h4 class="sfd-tools-title">Required Bench Tools &amp; Materials</h4>
          </div>
          <ul class="sfd-tools-list">
            <li><strong>Driver:</strong> Precision P2 Pentalobe &amp; Tri-point Y000</li>
            <li><strong>Thermal:</strong> Heat Mat or Hot Air Station (75°C - 80°C)</li>
            <li><strong>Chemical:</strong> 99% Pure Isopropyl Alcohol (IPA)</li>
            <li><strong>Adhesive:</strong> Genuine OEM Pull-Tab Battery Adhesive</li>
          </ul>
        </div>
      `;
    } else if (type === "comparison") {
      html = `
        <div class="sfd-comparison-wrapper">
          <table class="sfd-comparison-table">
            <thead>
              <tr>
                <th>Component Metric</th>
                <th>OEM Grade Part</th>
                <th>Standard Aftermarket</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Battery Cycle Capacity</td>
                <td class="sfd-comp-highlight">800 – 1000 Full Cycles</td>
                <td class="sfd-comp-muted">300 – 500 Cycles</td>
              </tr>
              <tr>
                <td>TrueTone &amp; Sensor Pairing</td>
                <td class="sfd-comp-highlight">100% Genuine Calibration</td>
                <td class="sfd-comp-warning">Non-serialized Warning</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    } else if (type === "faq") {
      html = `
        <details class="sfd-faq-accordion">
          <summary class="sfd-faq-summary">Will an aftermarket screen replacement disable Face ID?</summary>
          <div class="sfd-faq-answer">No. As long as the original ambient light sensor and ear speaker flex are transferred safely to the new assembly, Face ID remains 100% functional.</div>
        </details>
      `;
    } else if (type === "code") {
      html = `
        <pre class="sfd-code-block"><code>// Example EEPROM serialization code&#10;read_sensor_id(FPC_BUS_0);</code></pre>
      `;
    }

    insertCustomBlockNode(html);
  };

  // Advance SEO Link Insertion (Dofollow, Nofollow, Sponsored, UGC)
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    editorRef.current?.focus();

    if (savedRangeRef.current && typeof window !== "undefined") {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }

    const text = linkText.trim() || linkUrl;
    
    // Build rel attribute
    const relParts: string[] = [];
    if (linkRel === "nofollow") relParts.push("nofollow");
    else if (linkRel === "sponsored") relParts.push("sponsored");
    else if (linkRel === "ugc") relParts.push("ugc");

    if (linkOpenNewTab) {
      relParts.push("noopener", "noreferrer");
    }

    const relAttr = relParts.length > 0 ? ` rel="${relParts.join(" ")}"` : "";
    const targetAttr = linkOpenNewTab ? ` target="_blank"` : "";
    const titleAttr = linkTitle.trim() ? ` title="${linkTitle.trim().replace(/"/g, '&quot;')}"` : "";

    const linkHtml = `<a href="${linkUrl}"${targetAttr}${relAttr}${titleAttr} class="sfd-link" style="color: #00897b; text-decoration: underline; font-weight: 600;">${text}</a>`;

    document.execCommand("insertHTML", false, linkHtml);
    setLinkModalOpen(false);
    setLinkUrl("https://");
    setLinkText("");
    setLinkTitle("");
    setLinkRel("dofollow");
    setLinkOpenNewTab(false);
    handleInput();
  };

  // Real AI Content Writer Engine (SEO + AEO + GEO + pSEO)
  const handleTriggerAiGenerate = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAiError(null);
    setAiResultText("");
    setAiModelUsed(null);
    setAiMetaSuggestion(null);

    try {
      const res = await fetch("/api/admin/content-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: aiAction,
          selectedText: aiSelectedText.trim() || undefined,
          customPrompt: aiCustomPrompt.trim() || undefined,
          context: {
            ...articleContext,
            existingHtml: editorRef.current?.innerHTML || value || undefined,
          },
        }),
      });

      const json = (await res.json()) as {
        success?: boolean;
        html?: string;
        meta?: RichTextAiMetaSuggestion;
        model?: string;
        error?: string;
      };

      if (!res.ok || !json.html) {
        setAiError(json.error || "AI content generation failed.");
        return;
      }

      setAiResultText(json.html);
      setAiModelUsed(json.model || "AI");
      if (json.meta) setAiMetaSuggestion(json.meta);
    } catch {
      setAiError("Network error contacting AI Content Writer endpoint.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyAiResult = (applyMode: "replace_all" | "insert_cursor" | "append") => {
    if (!aiResultText) return;

    if (applyMode === "replace_all") {
      if (editorRef.current && mode === "visual") {
        editorRef.current.innerHTML = aiResultText;
        updateCounts();
      }
      onChange(aiResultText);
    } else if (applyMode === "append") {
      const nextHtml = `${(editorRef.current?.innerHTML || value || "").trim()}${aiResultText}`;
      if (editorRef.current && mode === "visual") {
        editorRef.current.innerHTML = nextHtml;
        updateCounts();
      }
      onChange(nextHtml);
    } else {
      // Insert at saved cursor position (fallback to append if no editor selection exists)
      if (mode === "visual" && editorRef.current) {
        editorRef.current.focus();
        const sel = typeof window !== "undefined" ? window.getSelection() : null;
        if (
          sel &&
          savedRangeRef.current &&
          editorRef.current.contains(savedRangeRef.current.commonAncestorContainer)
        ) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
          document.execCommand("insertHTML", false, aiResultText);
          handleInput();
        } else {
          const nextHtml = `${(editorRef.current.innerHTML || "").trim()}${aiResultText}`;
          editorRef.current.innerHTML = nextHtml;
          updateCounts();
          onChange(nextHtml);
        }
      } else {
        onChange(`${(value || "").trim()}${aiResultText}`);
      }
    }

    if (aiMetaSuggestion && onAiMetaSuggestion) {
      onAiMetaSuggestion(aiMetaSuggestion);
    }

    setAiModalOpen(false);
    setAiResultText("");
    setAiSelectedText("");
    setAiError(null);
  };

  // Custom Table Insertion
  const handleInsertTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== "visual") return;
    editorRef.current?.focus();

    const rowsCount = Math.max(1, Math.min(Number(tableRows) || 3, 15));
    const colsCount = Math.max(1, Math.min(Number(tableCols) || 3, 8));

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #cbd5e1; font-size: 14px;">`;

    if (includeHeader) {
      tableHtml += `<thead><tr style="background: #f1f5f9;">`;
      for (let c = 1; c <= colsCount; c++) {
        tableHtml += `<th style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 700; text-align: left; color: #0f172a;">Header ${c}</th>`;
      }
      tableHtml += `</tr></thead>`;
    }

    tableHtml += `<tbody>`;
    for (let r = 1; r <= rowsCount; r++) {
      const bg = r % 2 === 0 ? "background: #f8fafc;" : "background: #ffffff;";
      tableHtml += `<tr style="${bg}">`;
      for (let c = 1; c <= colsCount; c++) {
        tableHtml += `<td style="padding: 10px 14px; border: 1px solid #cbd5e1; color: #334155;">Data ${r},${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    document.execCommand("insertHTML", false, tableHtml);
    handleInput();
    setTableModalOpen(false);
  };

  // YouTube Video Embed Insertion
  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;
    editorRef.current?.focus();

    // Extract YouTube ID
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoUrl.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      videoId = videoUrl.trim();
    }

    const embedHtml = `
      <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
        <iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen title="Hardware teardown guide"></iframe>
      </div>
      <p><br></p>
    `;

    document.execCommand("insertHTML", false, embedHtml);
    handleInput();
    setVideoModalOpen(false);
    setVideoUrl("");
  };

  // Advance pSEO Juicy Linking Insertion
  const handleInsertPseoLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode !== "visual") return;
    editorRef.current?.focus();

    const device = PSEO_DEVICES.find((d) => d.slug === selectedDeviceSlug) || PSEO_DEVICES[0];
    const issue =
      PSEO_ISSUES.find((i) => i.slug === selectedIssueSlug && i.category === device.category) ||
      PSEO_ISSUES.find((i) => i.slug === selectedIssueSlug) ||
      PSEO_ISSUES[0];
    const price = issue.basePrice + (device.releaseYear >= 2024 ? 20 : 0);
    const targetUrl = `/repairs/${device.category}/${device.slug}/${issue.slug}`;

    let html = "";

    if (linkingStrategy === "inline") {
      const anchorText = customAnchorText.trim() || `${device.name} ${issue.shortName} in Philadelphia`;
      html = `<a href="${targetUrl}" class="sfd-juicy-link">${anchorText} <span class="sfd-juicy-badge">$${price} · ${issue.turnaroundDisplay}</span></a> `;
      document.execCommand("insertHTML", false, html);
    } else if (linkingStrategy === "card") {
      html = `
        <div class="sfd-pseo-card">
          <div class="sfd-pseo-card-main">
            <span class="sfd-pseo-badge">Philadelphia Bench Service</span>
            <h4 class="sfd-pseo-title">${device.name} ${issue.name}</h4>
            <p class="sfd-pseo-desc">${device.specs} · Backed by 90-day parts &amp; labor warranty · Walk-ins welcome at 33 S 52nd St.</p>
          </div>
          <div class="sfd-pseo-card-side">
            <span class="sfd-pseo-price">From $${price}</span>
            <span class="sfd-pseo-turnaround">⏱️ ${issue.turnaroundDisplay}</span>
            <a href="${targetUrl}" class="sfd-pseo-btn">Book Repair →</a>
          </div>
        </div>
      `;
      insertCustomBlockNode(html);
    } else if (linkingStrategy === "matrix") {
      const siblings = PSEO_ISSUES.filter((i) => i.category === device.category).slice(0, 3);
      html = `
        <div class="sfd-pseo-matrix">
          <span class="sfd-pseo-matrix-title">Popular Hardware Repairs for ${device.name}</span>
          <div class="sfd-pseo-matrix-grid">
            ${siblings
              .map((sib) => {
                const sPrice = sib.basePrice + (device.releaseYear >= 2024 ? 20 : 0);
                const sUrl = `/repairs/${device.category}/${device.slug}/${sib.slug}`;
                return `
                  <a href="${sUrl}" class="sfd-pseo-matrix-item">
                    <strong class="sfd-pseo-matrix-item-name">${sib.shortName}</strong>
                    <span class="sfd-pseo-matrix-item-meta">From $${sPrice} · ${sib.turnaroundDisplay}</span>
                  </a>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
      insertCustomBlockNode(html);
    }

    handleInput();
    setPseoModalOpen(false);
    setCustomAnchorText("");
  };

  // Media Library Integration
  const handleSelectMedia = (payload: SelectedMediaPayload) => {
    if (!payload.url) return;
    editorRef.current?.focus();

    let imgStyle = "max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); display: block;";
    let figureStyle = "margin: 24px 0;";

    if (payload.size === "small") {
      imgStyle += " width: 320px;";
    } else if (payload.size === "medium") {
      imgStyle += " width: 640px;";
    } else {
      imgStyle += " width: 100%;";
    }

    if (payload.alignment === "center") {
      figureStyle += " text-align: center; margin-left: auto; margin-right: auto;";
      imgStyle += " margin-left: auto; margin-right: auto;";
    } else if (payload.alignment === "left") {
      figureStyle += " text-align: left;";
    } else if (payload.alignment === "right") {
      figureStyle += " text-align: right;";
      imgStyle += " margin-left: auto;";
    } else if (payload.alignment === "full") {
      imgStyle += " width: 100%;";
    }

    const captionHtml = payload.caption
      ? `<figcaption style="font-size: 13px; color: #6b7280; margin-top: 8px; font-style: italic; text-align: inherit;">${payload.caption}</figcaption>`
      : "";

    const figureHtml = `<figure style="${figureStyle}" class="sfd-article-figure"><img src="${payload.url}" alt="${payload.alt || 'Hardware repair photo'}" style="${imgStyle}" />${captionHtml}</figure><p><br></p>`;

    document.execCommand("insertHTML", false, figureHtml);
    handleInput();
    setImageModalOpen(false);
  };

  // 1. FLOATING BUBBLE TOOLBAR SELECTION DETECTOR
  const updateBubblePosition = useCallback(() => {
    if (typeof window === "undefined" || mode !== "visual") return;
    const sel = window.getSelection();

    if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
      setBubbleToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect && rect.width > 0) {
      // Measured or fallback width of floating bubble toolbar
      const bubbleWidth = bubbleRef.current?.offsetWidth || 390;

      // Ideal center position relative to selection
      const idealLeft = (rect.left - containerRect.left) + (rect.width / 2) - (bubbleWidth / 2);

      // Strict clamping: never allow toolbar to leak past left (min 12px) or right (max containerWidth - bubbleWidth - 12px)
      const minLeft = 12;
      const maxLeft = Math.max(minLeft, containerRect.width - bubbleWidth - 12);
      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, idealLeft));

      // Vertical position: if too close to editor top, display below selection instead of getting hidden behind toolbar
      const isNearTop = (rect.top - containerRect.top) < 55;
      const posY = isNearTop
        ? rect.bottom - containerRect.top + 8
        : rect.top - containerRect.top - 46;

      setBubbleToolbar({
        visible: true,
        x: clampedLeft,
        y: posY,
      });
    }
  }, [mode]);

  // Elementor Side Style Inspector Helpers
  const refreshBlockStyleProps = useCallback((el: HTMLElement | null) => {
    if (!el) {
      setSelectedBlockNode(null);
      return;
    }
    setSelectedBlockNode(el);

    let type = "block";
    if (el.classList.contains("sfd-callout")) type = "callout";
    else if (el.classList.contains("sfd-tools-card")) type = "tools";
    else if (el.classList.contains("sfd-step-card")) type = "step";
    else if (el.classList.contains("sfd-comparison-wrapper") || el.tagName.toLowerCase() === "table") type = "table";
    else if (el.classList.contains("sfd-faq-accordion") || el.tagName.toLowerCase() === "details") type = "faq";
    else if (el.classList.contains("sfd-section-block")) type = "section";
    else if (el.classList.contains("sfd-pseo-card")) type = "card";

    const bg = el.style.backgroundColor || "";
    const textColor = el.style.color || "";
    const borderColor = el.style.borderColor || "";
    const borderWidth = el.style.borderWidth || "";
    const borderRadius = el.style.borderRadius || "";
    const padding = el.style.padding || "";
    const isFullWidth = el.classList.contains("sfd-full") || el.style.width === "100%";
    const customCss = el.getAttribute("style") || "";
    const customClass = el.className || "";

    let tableHeaderBg = "";
    const th = el.querySelector("th");
    if (th) tableHeaderBg = th.style.backgroundColor || "";

    let stepNumber = "1";
    const badge = el.querySelector(".sfd-step-badge");
    if (badge) stepNumber = badge.textContent?.trim() || "1";

    setBlockStyleProps({
      tag: el.tagName.toLowerCase(),
      type,
      bg,
      textColor,
      borderColor,
      borderWidth,
      borderRadius,
      padding,
      isFullWidth,
      customCss,
      customClass,
      tableHeaderBg,
      tableStriped: el.classList.contains("sfd-table-striped"),
      stepNumber,
      toolCols: el.classList.contains("sfd-tools-1col") ? 1 : 2,
    });
  }, []);

  const updateSelectedBlockFromSelection = useCallback(() => {
    if (typeof window === "undefined" || mode !== "visual") return;
    const sel = window.getSelection();
    if (!sel || !editorRef.current?.contains(sel.anchorNode)) return;
    const anchorEl = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement;
    const blockEl = anchorEl?.closest<HTMLElement>(
      ".sfd-callout, .sfd-tools-card, .sfd-step-card, .sfd-comparison-wrapper, table, .sfd-faq-accordion, .sfd-pseo-card, .sfd-section-block, pre, blockquote"
    );
    if (blockEl) {
      refreshBlockStyleProps(blockEl);
    }
  }, [mode, refreshBlockStyleProps]);

  const handleEditorBlockClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const blockEl = target.closest<HTMLElement>(
      ".sfd-callout, .sfd-tools-card, .sfd-step-card, .sfd-comparison-wrapper, table, .sfd-faq-accordion, .sfd-pseo-card, .sfd-section-block, pre, blockquote"
    );
    if (blockEl) {
      refreshBlockStyleProps(blockEl);
    } else if (e.target === editorRef.current) {
      setSelectedBlockNode(null);
    }
  };

  const handleUpdateBg = (color: string) => {
    if (!selectedBlockNode) return;
    selectedBlockNode.style.backgroundColor = color;
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleUpdateTextColor = (color: string) => {
    if (!selectedBlockNode) return;
    selectedBlockNode.style.color = color;
    const content = selectedBlockNode.querySelectorAll<HTMLElement>(".sfd-callout-content, .sfd-callout-title, p, h2, h3, h4, li, td, summary, .sfd-faq-answer");
    content.forEach((el) => {
      el.style.color = color;
    });
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleUpdateBorderColor = (color: string) => {
    if (!selectedBlockNode) return;
    selectedBlockNode.style.borderColor = color;
    if (!selectedBlockNode.style.borderWidth || selectedBlockNode.style.borderWidth === "0px") {
      selectedBlockNode.style.borderWidth = "1px";
      selectedBlockNode.style.borderStyle = "solid";
    }
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleUpdateBorderWidth = (width: string) => {
    if (!selectedBlockNode) return;
    selectedBlockNode.style.borderWidth = width;
    if (width !== "0px") selectedBlockNode.style.borderStyle = "solid";
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleUpdateBorderRadius = (radius: string) => {
    if (!selectedBlockNode) return;
    selectedBlockNode.style.borderRadius = radius;
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleUpdatePadding = (pad: string) => {
    if (!selectedBlockNode) return;
    selectedBlockNode.style.padding = pad;
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleToggleWidth = (wMode: "snug" | "full") => {
    if (!selectedBlockNode) return;
    if (wMode === "snug") {
      selectedBlockNode.classList.remove("sfd-full");
      selectedBlockNode.classList.add("sfd-snug");
      selectedBlockNode.style.width = "fit-content";
      selectedBlockNode.style.maxWidth = "100%";
      if (selectedBlockNode.classList.contains("sfd-callout")) {
        selectedBlockNode.style.display = "inline-flex";
      }
    } else {
      selectedBlockNode.classList.remove("sfd-snug");
      selectedBlockNode.classList.add("sfd-full");
      selectedBlockNode.style.width = "100%";
      if (selectedBlockNode.classList.contains("sfd-callout")) {
        selectedBlockNode.style.display = "flex";
      }
    }
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleUpdateCustomCss = (cssString: string) => {
    if (!selectedBlockNode) return;
    selectedBlockNode.setAttribute("style", cssString);
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleUpdateTableHeaderBg = (color: string) => {
    if (!selectedBlockNode) return;
    const ths = selectedBlockNode.querySelectorAll<HTMLElement>("th");
    ths.forEach((th) => {
      th.style.backgroundColor = color;
    });
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleAddTableRow = () => {
    if (!selectedBlockNode) return;
    const tbody = selectedBlockNode.querySelector("tbody") || selectedBlockNode.querySelector("table");
    if (tbody) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>New Spec Metric</td><td class="sfd-comp-highlight">OEM Spec</td><td class="sfd-comp-muted">Aftermarket</td>`;
      tbody.appendChild(tr);
      handleInput();
    }
  };

  const handleDeleteTableRow = () => {
    if (!selectedBlockNode) return;
    const rows = selectedBlockNode.querySelectorAll("tbody tr");
    if (rows.length > 1) {
      rows[rows.length - 1].remove();
      handleInput();
    }
  };

  const handleToggleToolCols = () => {
    if (!selectedBlockNode) return;
    const ul = selectedBlockNode.querySelector<HTMLElement>("ul");
    if (ul) {
      if (selectedBlockNode.classList.contains("sfd-tools-1col")) {
        selectedBlockNode.classList.remove("sfd-tools-1col");
        ul.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
      } else {
        selectedBlockNode.classList.add("sfd-tools-1col");
        ul.style.gridTemplateColumns = "1fr";
      }
      handleInput();
      refreshBlockStyleProps(selectedBlockNode);
    }
  };

  const handleAddToolItem = () => {
    if (!selectedBlockNode) return;
    const ul = selectedBlockNode.querySelector("ul");
    if (ul) {
      const newLi = document.createElement("li");
      newLi.innerHTML = `<strong>Tool:</strong> Specify tool or part...`;
      ul.appendChild(newLi);
      handleInput();
      refreshBlockStyleProps(selectedBlockNode);
    }
  };

  const handleUpdateStepNumber = (newNum: string) => {
    if (!selectedBlockNode) return;
    const badge = selectedBlockNode.querySelector(".sfd-step-badge");
    if (badge) badge.textContent = newNum;
    const title = selectedBlockNode.querySelector(".sfd-step-title");
    if (title && title.textContent?.startsWith("Step ")) {
      title.textContent = `Step ${newNum}: ` + title.textContent.replace(/^Step \d+:\s*/, "");
    }
    handleInput();
    refreshBlockStyleProps(selectedBlockNode);
  };

  const handleAddNextStep = () => {
    if (!selectedBlockNode) return;
    const badge = selectedBlockNode.querySelector(".sfd-step-badge");
    const currentNum = parseInt(badge?.textContent?.trim() || "1", 10) || 1;
    const nextNum = currentNum + 1;
    const nextStepHtml = `
      <div class="sfd-step-card">
        <div class="sfd-step-badge">${nextNum}</div>
        <div class="sfd-step-body">
          <h3 class="sfd-step-title">Step ${nextNum}: Enter procedure step</h3>
          <p class="sfd-step-desc">Describe hardware disassembly or bench testing step...</p>
        </div>
      </div>
    `;
    const temp = document.createElement("div");
    temp.innerHTML = nextStepHtml.trim();
    const newStepCard = temp.firstElementChild as HTMLElement | null;
    if (newStepCard) {
      selectedBlockNode.insertAdjacentElement("afterend", newStepCard);
      handleInput();
      refreshBlockStyleProps(newStepCard);
    }
  };

  const handleDuplicateBlock = () => {
    if (!selectedBlockNode) return;
    const clone = selectedBlockNode.cloneNode(true) as HTMLElement;
    selectedBlockNode.insertAdjacentElement("afterend", clone);
    handleInput();
    refreshBlockStyleProps(clone);
  };

  const handleDeleteBlock = () => {
    if (!selectedBlockNode) return;
    selectedBlockNode.remove();
    setSelectedBlockNode(null);
    handleInput();
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      updateBubblePosition();
      updateActiveFormats();
      updateSelectedBlockFromSelection();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateBubblePosition, updateActiveFormats, updateSelectedBlockFromSelection]);

  // 2. SLASH COMMANDS LIST
  const slashCommands: SlashCommandItem[] = [
    {
      id: "ai",
      title: "AI Content Writer (SEO/AEO/GEO)",
      description: "Generate full SEO/AEO/GEO/pSEO guides, FAQs, or rewrite text",
      badge: "AI",
      icon: Sparkles,
      action: openAiModal,
    },
    {
      id: "h1",
      title: "Heading 1",
      description: "Top-level page heading for primary titles",
      badge: "H1",
      icon: Heading1,
      action: () => formatHeading("h1"),
    },
    {
      id: "h2",
      title: "Heading 2",
      description: "Major section heading for diagnostic steps",
      badge: "H2",
      icon: Heading2,
      action: () => formatHeading("h2"),
    },
    {
      id: "h3",
      title: "Heading 3",
      description: "Sub-section for specific components",
      badge: "H3",
      icon: Heading3,
      action: () => formatHeading("h3"),
    },
    {
      id: "h4",
      title: "Heading 4",
      description: "Component subgroup or minor section",
      badge: "H4",
      icon: Heading4,
      action: () => formatHeading("h4"),
    },
    {
      id: "h5",
      title: "Heading 5",
      description: "Fine technical specification heading",
      badge: "H5",
      icon: Heading5,
      action: () => formatHeading("h5"),
    },
    {
      id: "h6",
      title: "Heading 6",
      description: "Smallest section label / micro heading",
      badge: "H6",
      icon: Heading6,
      action: () => formatHeading("h6"),
    },
    {
      id: "p",
      title: "Paragraph (Normal Text)",
      description: "Standard body text paragraph",
      badge: "P",
      icon: AlignLeft,
      action: () => formatHeading("p"),
    },
    {
      id: "link",
      title: "SEO Link (Dofollow / Nofollow)",
      description: "Insert link with custom rel attributes, title & target",
      badge: "Link",
      icon: LinkIcon,
      action: openLinkModal,
    },
    {
      id: "bullet",
      title: "Bulleted List",
      description: "Create an unordered list with clean bullet points",
      badge: "• List",
      icon: List,
      action: () => executeCommand("insertUnorderedList"),
    },
    {
      id: "number",
      title: "Numbered List",
      description: "Create an ordered sequence of instructions",
      badge: "1. 2. 3.",
      icon: ListOrdered,
      action: () => executeCommand("insertOrderedList"),
    },
    {
      id: "media",
      title: "Media Library",
      description: "Browse uploaded photos or upload high-res images",
      badge: "Upload",
      icon: ImageIcon,
      action: () => setImageModalOpen(true),
    },
    {
      id: "table",
      title: "Custom Table",
      description: "Insert customizable grid table with headers",
      badge: "Grid",
      icon: TableIcon,
      action: () => setTableModalOpen(true),
    },
    {
      id: "tip",
      title: "Technician Tip",
      description: "Emerald callout box for expert advice & recommendations",
      badge: "Tip",
      icon: Lightbulb,
      action: () => insertCallout("tip"),
    },
    {
      id: "warning",
      title: "Pre-Repair Warning",
      description: "Amber callout box for hardware safety & thermal precautions",
      badge: "Caution",
      icon: AlertTriangle,
      action: () => insertCallout("warning"),
    },
    {
      id: "note",
      title: "Important Note",
      description: "Slate callout box for serial pairing & compatibility details",
      badge: "Note",
      icon: Info,
      action: () => insertCallout("note"),
    },
    {
      id: "danger",
      title: "Critical Hazard",
      description: "Rose callout box for lithium battery puncture & shock risks",
      badge: "Hazard",
      icon: ShieldAlert,
      action: () => insertCallout("danger"),
    },
    {
      id: "step",
      title: "Step Procedure Card",
      description: "Numbered badge card with title & instructions",
      badge: "Block",
      icon: ListChecks,
      action: () => insertStructuredBlock("step"),
    },
    {
      id: "tools",
      title: "Tools & Parts Checklist",
      description: "Hardware tool list & chemical requirements",
      badge: "Bench",
      icon: Wrench,
      action: () => insertStructuredBlock("tools"),
    },
    {
      id: "youtube",
      title: "YouTube Video Embed",
      description: "Embed hardware teardown or repair video tutorial",
      badge: "Video",
      icon: Video,
      action: () => setVideoModalOpen(true),
    },
    {
      id: "faq",
      title: "FAQ Accordion",
      description: "Collapsible question & answer card",
      badge: "Interactive",
      icon: HelpCircle,
      action: () => insertStructuredBlock("faq"),
    },
    {
      id: "comparison",
      title: "OEM vs Aftermarket Table",
      description: "Side-by-side component quality comparison table",
      badge: "Table",
      icon: TableIcon,
      action: () => insertStructuredBlock("comparison"),
    },
    {
      id: "code",
      title: "Code Snippet",
      description: "Dark syntax block for firmware/scripts",
      badge: "Code",
      icon: Code2,
      action: () => insertStructuredBlock("code"),
    },
    {
      id: "quote",
      title: "Blockquote",
      description: "Quote block with stylized teal border",
      badge: "Quote",
      icon: Quote,
      action: insertBlockquote,
    },
    {
      id: "divider",
      title: "Horizontal Divider",
      description: "Clean visual separation line",
      badge: "HR",
      icon: Minus,
      action: insertHorizontalRule,
    },
    {
      id: "pseo-link",
      title: "Repair Service Link",
      description: "Direct link to device/issue repair page with live pricing",
      badge: "Link",
      icon: LinkIcon,
      action: () => {
        setLinkingStrategy("inline");
        setPseoModalOpen(true);
      },
    },
    {
      id: "repair-card",
      title: "Repair Service CTA Card",
      description: "Service card with device pricing, specs & booking action",
      badge: "Card",
      icon: Wrench,
      action: () => {
        setLinkingStrategy("card");
        setPseoModalOpen(true);
      },
    },
    {
      id: "sibling-matrix",
      title: "🗺️ Sibling Repairs Matrix",
      description: "Cross-link Screen, Battery, Port, Back Glass for this device",
      badge: "Matrix",
      icon: Layers,
      action: () => {
        setLinkingStrategy("matrix");
        setPseoModalOpen(true);
      },
    },
  ];

  const filteredSlashCommands = slashCommands.filter((cmd) => {
    if (!slashMenu.query) return true;
    const q = slashMenu.query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.id.includes(q)
    );
  });

  // Execute Slash Command
  const handleExecuteSlashCommand = (cmd: SlashCommandItem) => {
    // Delete the slash trigger text in editor
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const textNode = range.startContainer;
      if (textNode && textNode.nodeType === Node.TEXT_NODE && textNode.textContent) {
        const text = textNode.textContent;
        const lastSlash = text.lastIndexOf("/");
        if (lastSlash !== -1) {
          textNode.textContent = text.slice(0, lastSlash);
        }
      }
    }

    setSlashMenu({ open: false, x: 0, y: 0, query: "", selectedIndex: 0 });
    cmd.action();
  };

  // 3. KEYBOARD SHORTCUTS & SLASH COMMAND TRIGGER HANDLER
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Slash Menu Navigation
    if (slashMenu.open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashMenu((prev) => ({
          ...prev,
          selectedIndex: (prev.selectedIndex + 1) % filteredSlashCommands.length,
        }));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashMenu((prev) => ({
          ...prev,
          selectedIndex:
            (prev.selectedIndex - 1 + filteredSlashCommands.length) %
            filteredSlashCommands.length,
        }));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredSlashCommands[slashMenu.selectedIndex];
        if (selected) {
          handleExecuteSlashCommand(selected);
        }
        return;
      }
      if (e.key === "Escape") {
        setSlashMenu({ open: false, x: 0, y: 0, query: "", selectedIndex: 0 });
        return;
      }
    }

    // Break out of Callout Box, Details, or Blockquote on Enter (Payload Lexical & Notion standard)
    if (e.key === "Enter" && !e.shiftKey) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current) {
        const range = sel.getRangeAt(0);
        let node: Node | null = range.commonAncestorContainer;
        let calloutBlock: HTMLElement | null = null;

        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (
              el.classList?.contains("sfd-callout") ||
              el.classList?.contains("sfd-callout-content") ||
              el.classList?.contains("sfd-step-card") ||
              el.tagName.toLowerCase() === "details" ||
              el.tagName.toLowerCase() === "blockquote"
            ) {
              calloutBlock = el.classList?.contains("sfd-callout")
                ? el
                : (el.closest?.(".sfd-callout") as HTMLElement) || el;
              break;
            }
          }
          node = node.parentNode;
        }

        if (calloutBlock && calloutBlock.parentNode) {
          e.preventDefault();
          // Create a new normal paragraph directly after the callout block
          const newP = document.createElement("p");
          newP.innerHTML = "<br>";

          if (calloutBlock.nextSibling) {
            calloutBlock.parentNode.insertBefore(newP, calloutBlock.nextSibling);
          } else {
            calloutBlock.parentNode.appendChild(newP);
          }

          // Move cursor directly into the new paragraph
          const newRange = document.createRange();
          newRange.setStart(newP, 0);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();

          handleInput();
          saveCurrentSelection();
          return;
        }
      }
    }

    // Ctrl+K -> Link Modal
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setLinkModalOpen(true);
      return;
    }

    // Markdown Shortcut on Spacebar
    if (e.key === " ") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        if (node && node.nodeType === Node.TEXT_NODE && node.textContent) {
          const text = node.textContent;
          if (text === "#") {
            e.preventDefault();
            node.textContent = "";
            insertHeading("h2");
            return;
          }
          if (text === "##") {
            e.preventDefault();
            node.textContent = "";
            insertHeading("h2");
            return;
          }
          if (text === "###") {
            e.preventDefault();
            node.textContent = "";
            insertHeading("h3");
            return;
          }
          if (text === "-" || text === "*") {
            e.preventDefault();
            node.textContent = "";
            executeCommand("insertUnorderedList");
            return;
          }
          if (text === "1.") {
            e.preventDefault();
            node.textContent = "";
            executeCommand("insertOrderedList");
            return;
          }
          if (text === ">") {
            e.preventDefault();
            node.textContent = "";
            insertBlockquote();
            return;
          }
        }
      }
    }

    // Detect Slash `/` trigger
    if (e.key === "/") {
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            setSlashMenu({
              open: true,
              x: Math.max(10, rect.left - containerRect.left),
              y: rect.bottom - containerRect.top + 8,
              query: "",
              selectedIndex: 0,
            });
          }
        }
      }, 10);
    }
  };

  // Clicking empty whitespace in the editor ensures there is a paragraph to type in
  const handleEditorAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === editorRef.current && editorRef.current) {
      const lastChild = editorRef.current.lastElementChild;
      if (
        !lastChild ||
        lastChild.classList?.contains("sfd-callout") ||
        lastChild.tagName.toLowerCase() !== "p" ||
        lastChild.textContent?.trim() !== ""
      ) {
        const newP = document.createElement("p");
        newP.innerHTML = "<br>";
        editorRef.current.appendChild(newP);
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.setStart(newP, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          savedRangeRef.current = range.cloneRange();
        }
        handleInput();
      }
    }
  };

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headingMenuRef.current && !headingMenuRef.current.contains(event.target as Node)) {
        setHeadingMenuOpen(false);
      }
      if (insertMenuRef.current && !insertMenuRef.current.contains(event.target as Node)) {
        setInsertMenuOpen(false);
      }
      if (textColorMenuRef.current && !textColorMenuRef.current.contains(event.target as Node)) {
        setTextColorMenuOpen(false);
      }
      if (bgColorMenuRef.current && !bgColorMenuRef.current.contains(event.target as Node)) {
        setBgColorMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyTextColor = (color: string) => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("foreColor", false, color);
    setActiveColor(color);
    saveCurrentSelection();
    handleInput();
    updateActiveFormats();
    setTextColorMenuOpen(false);
  };

  const applyHighlightColor = (color: string) => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("hiliteColor", false, color);
    saveCurrentSelection();
    handleInput();
    updateActiveFormats();
    setBgColorMenuOpen(false);
  };

  const removeHighlight = () => {
    clearFormatting();
  };

  const applyBlockBackground = (cardStyle: string) => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : "";
    const inner = selectedText.trim() ? selectedText : "Enter highlighted block text here...";
    const html = `<div style="${cardStyle}">${inner}</div><p><br></p>`;
    document.execCommand("insertHTML", false, html);
    handleInput();
    setBgColorMenuOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col relative"
    >
      
      {/* 1. MINIMALIST UNIFIED TOOLBAR (Notion / Ghost / Medium Style) */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-1 sticky top-0 z-20">
        
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-gray-200">
          <button
            type="button"
            onClick={() => executeCommand("undo")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("redo")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Block Selector (Dropdown) */}
        <div className="relative border-r border-gray-200 pr-1.5" ref={headingMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              saveCurrentSelection();
            }}
            onClick={() => {
              setHeadingMenuOpen((prev) => !prev);
              setInsertMenuOpen(false);
            }}
            className="h-[28px] px-2 rounded-md hover:bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center gap-1.5 border border-gray-200 bg-white cursor-pointer shadow-2xs transition"
            title="Change Text Style"
          >
            <span className="min-w-[65px] text-left">{currentBlock.label}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {headingMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatHeading("p")}
                className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs cursor-pointer ${
                  currentBlock.tag === "p" ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-700"
                }`}
              >
                <span>Paragraph (Normal)</span>
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatHeading("h1")}
                className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs cursor-pointer ${
                  currentBlock.tag === "h1" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-900 font-bold"
                }`}
              >
                <span className="text-sm font-bold">Heading 1</span>
                <span className="text-[10px] text-gray-400 font-mono">34px</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatHeading("h2")}
                className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs cursor-pointer ${
                  currentBlock.tag === "h2" ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-800 font-semibold"
                }`}
              >
                <span className="text-xs font-semibold">Heading 2</span>
                <span className="text-[10px] text-gray-400 font-mono">25px</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatHeading("h3")}
                className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs cursor-pointer ${
                  currentBlock.tag === "h3" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-800"
                }`}
              >
                <span className="text-xs font-medium">Heading 3</span>
                <span className="text-[10px] text-gray-400 font-mono">20px</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => formatHeading("h4")}
                className={`w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs cursor-pointer ${
                  currentBlock.tag === "h4" ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700"
                }`}
              >
                <span className="text-xs">Heading 4</span>
                <span className="text-[10px] text-gray-400 font-mono">18px</span>
              </button>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={insertBlockquote}
                className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs text-gray-700 cursor-pointer"
              >
                <span>Quote Block</span>
                <Quote className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Inline Formatting (B, I, U, S, Code) */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("bold")}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              activeFormats.bold
                ? "bg-gray-200 text-gray-900 font-bold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("italic")}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              activeFormats.italic
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("underline")}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              activeFormats.underline
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("strikeThrough")}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              activeFormats.strikeThrough
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => executeCommand("formatBlock", "<pre>")}
            className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title="Code Block"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Color & Highlight */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5">
          {/* Text Color Selector */}
          <div className="relative" ref={textColorMenuRef}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
              }}
              onClick={() => {
                setTextColorMenuOpen(!textColorMenuOpen);
                setBgColorMenuOpen(false);
              }}
              className="px-1.5 py-1 rounded-md hover:bg-gray-100 text-gray-800 flex items-center gap-1 cursor-pointer"
              title="Text Color"
            >
              <div className="flex flex-col items-center leading-none">
                <span className="font-bold text-[12px] leading-tight">A</span>
                <span
                  className="w-3.5 h-[2px] rounded-full mt-0.5"
                  style={{ backgroundColor: activeColor }}
                />
              </div>
              <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
            </button>

            {textColorMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-2.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pb-1.5 border-b border-gray-100 mb-2">
                  <span>Text Color</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyTextColor("#111827")}
                    className="text-[10px] text-gray-500 hover:text-black cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {TEXT_COLORS.map((col) => (
                    <button
                      key={col.color}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyTextColor(col.color)}
                      className="flex items-center justify-center p-1 rounded hover:bg-gray-100 cursor-pointer transition"
                      title={col.label}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-2xs flex items-center justify-center"
                        style={{ backgroundColor: col.color }}
                      >
                        {activeColor.toLowerCase() === col.color.toLowerCase() && (
                          <Check className={`w-3 h-3 ${col.color === "#ffffff" ? "text-black" : "text-white"}`} />
                        )}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-gray-500">Custom:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={(e) => {
                        setCustomTextColor(e.target.value);
                        applyTextColor(e.target.value);
                      }}
                      className="w-6 h-6 rounded cursor-pointer p-0 bg-transparent border border-gray-300"
                    />
                    <span className="text-[10px] font-mono text-gray-600 uppercase">
                      {customTextColor}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text Highlight Selector */}
          <div className="relative" ref={bgColorMenuRef}>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveCurrentSelection();
              }}
              onClick={() => {
                setBgColorMenuOpen(!bgColorMenuOpen);
                setTextColorMenuOpen(false);
              }}
              className="px-1.5 py-1 rounded-md hover:bg-gray-100 text-gray-800 flex items-center gap-1 cursor-pointer"
              title="Highlight Color"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-500" />
              <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
            </button>

            {bgColorMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-2.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pb-1.5 border-b border-gray-100 mb-2">
                  <span>Highlight</span>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={clearFormatting}
                    className="text-[10px] text-red-600 hover:text-red-700 cursor-pointer inline-flex items-center gap-1"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {HIGHLIGHT_COLORS.map((col) => (
                    <button
                      key={col.color}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyHighlightColor(col.color)}
                      className="h-6 rounded text-[11px] font-medium text-gray-800 border border-gray-200 hover:scale-105 transition cursor-pointer flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: col.color }}
                      title={col.label}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[11px] text-gray-500">Custom:</span>
                  <input
                    type="color"
                    value={customBgColor}
                    onChange={(e) => {
                      setCustomBgColor(e.target.value);
                      applyHighlightColor(e.target.value);
                    }}
                    className="w-6 h-6 rounded cursor-pointer p-0 bg-transparent border border-gray-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Clear Formatting Eraser */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearFormatting}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-600 transition cursor-pointer"
            title="Clear All Formatting (Tx)"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5">
          <button
            type="button"
            onClick={() => executeCommand("justifyLeft")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyCenter")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyRight")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Dividers */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5">
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertBlockquote}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertHorizontalRule}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition cursor-pointer"
            title="Divider Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inserts: Link, Media, Table, Blocks */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-1.5">
          <button
            type="button"
            onClick={openLinkModal}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition cursor-pointer"
            title="Insert Link (Ctrl+K)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition cursor-pointer"
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTableModalOpen(true)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-700 hover:text-black transition cursor-pointer"
            title="Insert Table"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>

          {/* Clean Insert Menu */}
          <div className="relative" ref={insertMenuRef}>
            <button
              type="button"
              onClick={() => {
                setInsertMenuOpen((prev) => !prev);
                setHeadingMenuOpen(false);
              }}
              className="h-[28px] px-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-black text-xs font-medium inline-flex items-center gap-1 border border-gray-200 bg-white cursor-pointer shadow-2xs transition"
              title="Insert Component"
            >
              <span>Insert</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {insertMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 select-none">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 select-none pointer-events-none">
                  Callouts
                </div>
                <button
                  type="button"
                  onClick={() => insertCallout("tip")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-gray-500" />
                  <span>Tip Callout</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertCallout("warning")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                  <span>Warning Callout</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertCallout("note")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <Info className="w-3.5 h-3.5 text-gray-500" />
                  <span>Note Callout</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertCallout("danger")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
                  <span>Danger Callout</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertCallout("pro")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Pro Tip Callout</span>
                </button>

                <div className="my-1 border-t border-gray-100" />
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 select-none pointer-events-none">
                  Blocks
                </div>
                <button
                  type="button"
                  onClick={() => insertStructuredBlock("step")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <ListChecks className="w-3.5 h-3.5 text-gray-500" />
                  <span>Step Procedure</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertStructuredBlock("tools")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <Wrench className="w-3.5 h-3.5 text-gray-500" />
                  <span>Tools Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertStructuredBlock("faq")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                  <span>FAQ Accordion</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(true)}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <Video className="w-3.5 h-3.5 text-gray-500" />
                  <span>YouTube Video</span>
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => setPseoModalOpen(true)}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-100 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>Repair Service Link</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Content Writer (SEO + AEO + GEO + pSEO) */}
        <button
          type="button"
          onClick={openAiModal}
          className="h-[28px] px-2.5 rounded-md border border-teal-200 bg-teal-50/70 hover:bg-teal-100 hover:border-teal-300 text-teal-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
          title="AI Content Writer (SEO, AEO, GEO & pSEO)"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00897b]" />
          <span>AI Writer</span>
        </button>

        {/* View Toggle & Elementor Block Styler */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSideInspectorOpen((prev) => !prev)}
            className={`h-[28px] px-2.5 rounded-md border text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition ${
              sideInspectorOpen
                ? "bg-teal-600 text-white border-teal-700 shadow-2xs"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
            title="Toggle Elementor-style Block CSS & Design Inspector"
          >
            <Sliders className="w-3 h-3" />
            <span>Block Styler</span>
            {selectedBlockNode && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>

          <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-md border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setMode("visual")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                mode === "visual"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Visual
            </button>
            <button
              type="button"
              onClick={() => setMode("html")}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                mode === "html"
                  ? "bg-white text-gray-900 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              HTML
            </button>
          </div>
        </div>

      </div>

      {/* 2. MINIMAL FLOATING SELECTION BUBBLE (Notion / Medium Style) */}
      {bubbleToolbar.visible && (
        <div
          ref={bubbleRef}
          className="absolute z-30 bg-neutral-900 text-white rounded-lg px-2 py-1 flex items-center gap-1 shadow-xl border border-neutral-800 animate-in fade-in zoom-in-95 duration-100 select-none text-xs whitespace-nowrap"
          style={{ left: `${bubbleToolbar.x}px`, top: `${bubbleToolbar.y}px` }}
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand("bold");
            }}
            className={`p-1.5 rounded hover:bg-neutral-800 transition ${
              activeFormats.bold ? "bg-neutral-700 text-white font-bold" : "text-neutral-300 hover:text-white"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand("italic");
            }}
            className={`p-1.5 rounded hover:bg-neutral-800 transition ${
              activeFormats.italic ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand("underline");
            }}
            className={`p-1.5 rounded hover:bg-neutral-800 transition ${
              activeFormats.underline ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white"
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand("strikeThrough");
            }}
            className={`p-1.5 rounded hover:bg-neutral-800 transition ${
              activeFormats.strikeThrough ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-neutral-700 mx-0.5" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h1");
            }}
            className={`px-1.5 py-0.5 rounded text-xs font-bold transition ${
              currentBlock.tag === "h1" ? "bg-neutral-700 text-white" : "hover:bg-neutral-800 text-neutral-300 hover:text-white"
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h2");
            }}
            className={`px-1.5 py-0.5 rounded text-xs font-bold transition ${
              currentBlock.tag === "h2" ? "bg-neutral-700 text-white" : "hover:bg-neutral-800 text-neutral-300 hover:text-white"
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("p");
            }}
            className={`px-1.5 py-0.5 rounded text-xs transition ${
              currentBlock.tag === "p" ? "bg-neutral-700 text-white" : "hover:bg-neutral-800 text-neutral-300 hover:text-white"
            }`}
            title="Paragraph"
          >
            P
          </button>

          <div className="w-px h-3.5 bg-neutral-700 mx-0.5" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              openLinkModal();
            }}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            title="Link (Ctrl+K)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              clearFormatting();
            }}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition"
            title="Clear Formatting"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-neutral-700 mx-0.5" />

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              openAiModal();
            }}
            className="px-2 py-0.5 rounded hover:bg-neutral-800 text-teal-300 hover:text-white inline-flex items-center gap-1 transition"
            title="AI Content Writer (SEO, AEO, GEO & pSEO)"
          >
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>AI Writer</span>
          </button>
        </div>
      )}

      {/* 3. INLINE SLASH COMMANDS POPUP (Notion / Payload Lexical Superpower) */}
      {slashMenu.open && (
        <div
          className="absolute z-40 bg-white rounded-xl shadow-2xl border border-gray-200 w-72 max-h-80 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: slashMenu.x, top: slashMenu.y }}
        >
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3 text-[#00897b]" />
              <span>Slash Commands</span>
            </span>
            <span className="text-[10px] text-gray-400">↑↓ to navigate</span>
          </div>

          {filteredSlashCommands.map((cmd, idx) => {
            const Icon = cmd.icon;
            const isSelected = idx === slashMenu.selectedIndex;
            return (
              <div
                key={cmd.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleExecuteSlashCommand(cmd);
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-teal-50 text-teal-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold leading-tight truncate">
                    {cmd.title}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {cmd.description}
                  </div>
                </div>
                {cmd.badge && (
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded shrink-0">
                    {cmd.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. WRITING WORKSPACE + ELEMENTOR SIDE INSPECTOR */}
      {mode === "visual" ? (
        <div className="flex flex-col lg:flex-row relative items-stretch">
          <div
            ref={editorRef}
            contentEditable
            onClick={(e) => {
              handleEditorAreaClick(e);
              handleEditorBlockClick(e);
            }}
            onInput={handleInput}
            onBlur={() => {
              saveCurrentSelection();
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={() => {
              saveCurrentSelection();
              updateActiveFormats();
              updateSelectedBlockFromSelection();
            }}
            onMouseUp={() => {
              saveCurrentSelection();
              updateActiveFormats();
              updateSelectedBlockFromSelection();
            }}
            onSelect={() => {
              saveCurrentSelection();
              updateActiveFormats();
              updateSelectedBlockFromSelection();
            }}
            className="flex-1 min-w-0 sfd-editor-content p-6 sm:p-8 outline-none text-[#1d1c1a] leading-relaxed text-sm font-normal focus:bg-white transition-colors overflow-y-auto selection:bg-teal-100 selection:text-teal-900"
            style={{ minHeight }}
            data-placeholder={placeholder}
          />

          {/* Elementor Side Style Inspector */}
          {sideInspectorOpen && (
            <aside
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full lg:w-72 xl:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 bg-[#fdfdfd] p-4 shrink-0 flex flex-col gap-4 text-xs select-none max-h-[850px] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-teal-600 text-white flex items-center justify-center">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight text-xs">Block Style Inspector</h4>
                    <span className="text-[10px] text-gray-400">Style &amp; layout</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSideInspectorOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {selectedBlockNode ? (
                <div className="space-y-4">
                  {/* Active Element Badge */}
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Active Block</span>
                      <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="capitalize">{blockStyleProps.type}</span>
                        <code className="text-[10px] text-gray-400 font-mono">&lt;{blockStyleProps.tag}&gt;</code>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDuplicateBlock}
                      className="px-2 py-1 rounded bg-white hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Clone / Duplicate this block"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Clone</span>
                    </button>
                  </div>

                  {/* 1. LAYOUT & GEOMETRY */}
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">Layout &amp; Width</span>

                    <div>
                      <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => handleToggleWidth("snug")}
                          className={`py-1 rounded text-center text-[11px] font-semibold transition cursor-pointer ${
                            !blockStyleProps.isFullWidth ? "bg-white text-teal-700 shadow-2xs" : "text-gray-600 hover:text-black"
                          }`}
                          title="Hugs content snugly (eliminates empty right space)"
                        >
                          Snug (Fit)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleWidth("full")}
                          className={`py-1 rounded text-center text-[11px] font-semibold transition cursor-pointer ${
                            blockStyleProps.isFullWidth ? "bg-white text-teal-700 shadow-2xs" : "text-gray-600 hover:text-black"
                          }`}
                        >
                          Full Width
                        </button>
                      </div>
                    </div>

                    {/* Corner Radius */}
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Corner Radius</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: "Sharp", val: "0px" },
                          { label: "6px", val: "6px" },
                          { label: "12px", val: "12px" },
                          { label: "Pill", val: "9999px" },
                        ].map((r) => (
                          <button
                            key={r.val}
                            type="button"
                            onClick={() => handleUpdateBorderRadius(r.val)}
                            className="py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-medium text-gray-700 text-center transition cursor-pointer"
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Padding */}
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Inner Padding</label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { label: "Compact", val: "8px 12px" },
                          { label: "Normal", val: "12px 18px" },
                          { label: "Spacious", val: "20px 24px" },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => handleUpdatePadding(p.val)}
                            className="py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-medium text-gray-700 text-center transition cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. COLORS & BORDER */}
                  <div className="space-y-2.5 pt-2 border-t border-gray-200">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">Background, Text &amp; Border</span>

                    {/* Background Color */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-gray-500">Background Color (bg)</label>
                        <input
                          type="color"
                          value={blockStyleProps.bg && blockStyleProps.bg.startsWith("#") ? blockStyleProps.bg : "#ffffff"}
                          onChange={(e) => handleUpdateBg(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-gray-200 p-0"
                          title="Pick custom background color"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { name: "White", val: "#ffffff" },
                          { name: "Off White", val: "#fafafa" },
                          { name: "Mint", val: "#f0fdf4" },
                          { name: "Amber", val: "#fffbeb" },
                          { name: "Sky", val: "#eff6ff" },
                          { name: "Rose", val: "#fff1f2" },
                          { name: "Purple", val: "#faf5ff" },
                          { name: "Dark", val: "#0f172a" },
                        ].map((c) => (
                          <button
                            key={c.val}
                            type="button"
                            onClick={() => handleUpdateBg(c.val)}
                            className="w-6 h-6 rounded-md border border-gray-300 shadow-2xs hover:scale-110 transition shrink-0 cursor-pointer"
                            style={{ backgroundColor: c.val }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Text Color */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-gray-500">Text Color</label>
                        <input
                          type="color"
                          value={blockStyleProps.textColor && blockStyleProps.textColor.startsWith("#") ? blockStyleProps.textColor : "#1f2937"}
                          onChange={(e) => handleUpdateTextColor(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-gray-200 p-0"
                          title="Pick custom text color"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { name: "Charcoal", val: "#1f2937" },
                          { name: "Black", val: "#000000" },
                          { name: "Emerald", val: "#15803d" },
                          { name: "Amber", val: "#b45309" },
                          { name: "Blue", val: "#1d4ed8" },
                          { name: "Red", val: "#b91c1c" },
                          { name: "Purple", val: "#7e22ce" },
                          { name: "White", val: "#ffffff" },
                        ].map((c) => (
                          <button
                            key={c.val}
                            type="button"
                            onClick={() => handleUpdateTextColor(c.val)}
                            className="w-6 h-6 rounded-md border border-gray-300 shadow-2xs hover:scale-110 transition shrink-0 cursor-pointer"
                            style={{ backgroundColor: c.val }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Border */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-gray-500">Border Color &amp; Thickness</label>
                        <input
                          type="color"
                          value={blockStyleProps.borderColor && blockStyleProps.borderColor.startsWith("#") ? blockStyleProps.borderColor : "#e5e7eb"}
                          onChange={(e) => handleUpdateBorderColor(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-gray-200 p-0"
                          title="Pick border color"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { label: "None", val: "0px" },
                          { label: "1px", val: "1px" },
                          { label: "2px", val: "2px" },
                          { label: "4px", val: "4px" },
                        ].map((b) => (
                          <button
                            key={b.val}
                            type="button"
                            onClick={() => handleUpdateBorderWidth(b.val)}
                            className="py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-medium text-gray-700 text-center transition cursor-pointer"
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. CONTEXTUAL CONTROLS (Table / Tools / Step) */}
                  {blockStyleProps.type === "table" && (
                    <div className="space-y-2.5 pt-2 border-t border-gray-200">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">Table Controls</span>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gray-500">Header Background</label>
                        <input
                          type="color"
                          value={blockStyleProps.tableHeaderBg && blockStyleProps.tableHeaderBg.startsWith("#") ? blockStyleProps.tableHeaderBg : "#f9fafb"}
                          onChange={(e) => handleUpdateTableHeaderBg(e.target.value)}
                          className="w-5 h-5 rounded cursor-pointer border border-gray-200 p-0"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddTableRow}
                          className="flex-1 py-1 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-semibold transition cursor-pointer"
                        >
                          + Add Row
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteTableRow}
                          className="py-1 px-2.5 rounded bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-[10px] font-semibold transition cursor-pointer"
                        >
                          - Row
                        </button>
                      </div>
                    </div>
                  )}

                  {blockStyleProps.type === "tools" && (
                    <div className="space-y-2.5 pt-2 border-t border-gray-200">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">Tools Grid Controls</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddToolItem}
                          className="flex-1 py-1 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-semibold transition cursor-pointer"
                        >
                          + Add Tool
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleToolCols}
                          className="py-1 px-2.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-semibold transition cursor-pointer"
                        >
                          {blockStyleProps.toolCols === 1 ? "2-Col Grid" : "1-Col List"}
                        </button>
                      </div>
                    </div>
                  )}

                  {blockStyleProps.type === "step" && (
                    <div className="space-y-2.5 pt-2 border-t border-gray-200">
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">Step Controls</span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-gray-500 whitespace-nowrap">Step #:</label>
                        <input
                          type="number"
                          value={blockStyleProps.stepNumber}
                          onChange={(e) => handleUpdateStepNumber(e.target.value)}
                          className="w-16 h-6 px-2 rounded border border-gray-300 text-xs font-bold"
                          min="1"
                        />
                        <button
                          type="button"
                          onClick={handleAddNextStep}
                          className="flex-1 py-1 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-semibold transition cursor-pointer"
                        >
                          + Next Step
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. ONE-CLICK DESIGN PRESETS */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">Design presets</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateBg("#f0fdf4");
                          handleUpdateBorderColor("#16a34a");
                          handleUpdateTextColor("#15803d");
                          handleUpdateBorderRadius("8px");
                        }}
                        className="p-1.5 rounded border border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100 text-left transition cursor-pointer"
                      >
                        Soft tip
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateBg("#fffbeb");
                          handleUpdateBorderColor("#d97706");
                          handleUpdateTextColor("#b45309");
                          handleUpdateBorderRadius("8px");
                        }}
                        className="p-1.5 rounded border border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-800 hover:bg-amber-100 text-left transition cursor-pointer"
                      >
                        ⚠️ Soft Warning
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateBg("#eff6ff");
                          handleUpdateBorderColor("#2563eb");
                          handleUpdateTextColor("#1d4ed8");
                          handleUpdateBorderRadius("8px");
                        }}
                        className="p-1.5 rounded border border-blue-200 bg-blue-50 text-[10px] font-semibold text-blue-800 hover:bg-blue-100 text-left transition cursor-pointer"
                      >
                        ℹ️ Soft Note
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateBg("#fff1f2");
                          handleUpdateBorderColor("#dc2626");
                          handleUpdateTextColor("#b91c1c");
                          handleUpdateBorderRadius("8px");
                        }}
                        className="p-1.5 rounded border border-red-200 bg-red-50 text-[10px] font-semibold text-red-800 hover:bg-red-100 text-left transition cursor-pointer"
                      >
                        🛑 Caution
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateBg("#faf5ff");
                          handleUpdateBorderColor("#9333ea");
                          handleUpdateTextColor("#7e22ce");
                          handleUpdateBorderRadius("8px");
                        }}
                        className="p-1.5 rounded border border-purple-200 bg-purple-50 text-[10px] font-semibold text-purple-800 hover:bg-purple-100 text-left transition cursor-pointer"
                      >
                        Pro tip
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateBg("#0f172a");
                          handleUpdateBorderColor("#334155");
                          handleUpdateTextColor("#f8fafc");
                          handleUpdateBorderRadius("10px");
                        }}
                        className="p-1.5 rounded border border-slate-700 bg-slate-900 text-[10px] font-semibold text-white hover:bg-slate-800 text-left transition cursor-pointer"
                      >
                        🧰 Dark Bench
                      </button>
                    </div>
                  </div>

                  {/* 5. CUSTOM CSS / INLINE STYLE */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                      Custom CSS (Inline Style)
                    </label>
                    <textarea
                      rows={3}
                      value={blockStyleProps.customCss}
                      onChange={(e) => handleUpdateCustomCss(e.target.value)}
                      placeholder="e.g. box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-left: 5px solid teal;"
                      className="w-full p-2 font-mono text-[10px] text-gray-800 bg-white border border-gray-300 rounded focus:outline-none focus:border-teal-500 leading-tight"
                    />
                  </div>

                  {/* Delete Block */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDeleteBlock}
                      className="w-full py-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete This Block</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Selection State */
                <div className="py-10 px-2 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Paintbrush className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800 text-xs">No Block Selected</h5>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-[210px] mx-auto leading-relaxed">
                      Click on any Callout, Tools Grid, Step, or Table in the editor to customize its background, text, borders &amp; CSS like Elementor.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-2">Or Insert Template:</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => insertCallout("tip")}
                        className="w-full py-1.5 px-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 text-[11px] font-medium text-gray-700 text-left flex items-center gap-2 transition cursor-pointer"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Insert Callout Box</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertStructuredBlock("tools")}
                        className="w-full py-1.5 px-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 text-[11px] font-medium text-gray-700 text-left flex items-center gap-2 transition cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5 text-slate-700" />
                        <span>Insert Tools Bento Grid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertStructuredBlock("step")}
                        className="w-full py-1.5 px-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 text-[11px] font-medium text-gray-700 text-left flex items-center gap-2 transition cursor-pointer"
                      >
                        <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Insert Repair Step</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertStructuredBlock("comparison")}
                        className="w-full py-1.5 px-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 text-[11px] font-medium text-gray-700 text-left flex items-center gap-2 transition cursor-pointer"
                      >
                        <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Insert Comparison Table</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            updateCounts();
          }}
          className="p-5 w-full font-mono text-xs text-green-400 bg-[#1e1e1e] outline-none resize-y leading-relaxed"
          style={{ minHeight }}
        />
      )}

      {/* 5. BOTTOM STATUS & WORD COUNT BAR */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500 font-sans">
        <div className="flex items-center gap-3">
          <span><strong className="text-gray-800 font-medium">{wordCount}</strong> words</span>
          <span className="text-gray-300">·</span>
          <span><strong className="text-gray-800 font-medium">{charCount}</strong> characters</span>
        </div>
        <span className="text-gray-400 text-[11px]">
          Type <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded font-mono text-[10px] text-gray-600">/</kbd> on an empty line for quick menu
        </span>
      </div>

      {/* MODAL: ADVANCE SEO LINK INSERTER (Dofollow / Nofollow / Sponsored / UGC) */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00897b]">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight">Advance SEO Link Inserter</h4>
                  <span className="text-[11px] text-gray-400">Dofollow, Nofollow &amp; Target Controls</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3.5">
              {/* Destination URL */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://... or /repairs/iphone/screen-repair"
                  className="w-full h-[34px] px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
                
                {/* Quick Internal Links Presets */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-gray-400 font-semibold mr-0.5">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setLinkUrl("/repairs")}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 cursor-pointer"
                  >
                    /repairs
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkUrl("/schedule-repair")}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 cursor-pointer"
                  >
                    /schedule-repair
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkUrl("/track")}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 cursor-pointer"
                  >
                    /track
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkUrl("/locations")}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 cursor-pointer"
                  >
                    /locations
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkUrl("/blog")}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 cursor-pointer"
                  >
                    /blog
                  </button>
                </div>
              </div>

              {/* Anchor Text */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                  Anchor Text (Text to display)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Schedule Philadelphia Bench Repair"
                  className="w-full h-[34px] px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              {/* Link Relationship (Rel) */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Search Engine Relationship (rel)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkRel("dofollow")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      linkRel === "dofollow"
                        ? "border-[#00897b] bg-teal-50/60 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block">Dofollow (Default)</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">Passes link equity (Internal &amp; Hub links)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkRel("nofollow")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      linkRel === "nofollow"
                        ? "border-[#00897b] bg-teal-50/60 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block">Nofollow (rel=&quot;nofollow&quot;)</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">External / unverified partner links</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkRel("sponsored")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      linkRel === "sponsored"
                        ? "border-[#00897b] bg-teal-50/60 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block">Sponsored (rel=&quot;sponsored&quot;)</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">Paid promotions &amp; affiliate links</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkRel("ugc")}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      linkRel === "ugc"
                        ? "border-[#00897b] bg-teal-50/60 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block">UGC (rel=&quot;ugc&quot;)</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">User comments &amp; customer mentions</span>
                  </button>
                </div>
              </div>

              {/* Target & Title Attribute */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={linkOpenNewTab}
                    onChange={(e) => setLinkOpenNewTab(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs text-gray-700 font-medium">
                    Open link in a new window/tab (<code className="text-[11px] font-mono text-gray-600">target=&quot;_blank&quot;</code>)
                  </span>
                </label>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                    Link Title / Accessibility Tooltip (Optional)
                  </label>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="e.g. SmartFone Doctor Philadelphia 52nd St Repair Facility"
                    className="w-full h-[30px] px-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
              </div>

              {/* Code Preview */}
              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700 space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-gray-400 block font-sans">Generated HTML Link</span>
                <span className="text-[11px] block truncate text-teal-800">
                  &lt;a href=&quot;{linkUrl}&quot;{linkOpenNewTab ? ' target="_blank"' : ''}{linkRel !== "dofollow" ? ` rel="${linkRel}${linkOpenNewTab ? ' noopener noreferrer' : ''}"` : linkOpenNewTab ? ' rel="noopener noreferrer"' : ''}&gt;{linkText || linkUrl}&lt;/a&gt;
                </span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="h-[32px] px-4 rounded-lg border text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-5 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI CONTENT WRITER (SEO + AEO + GEO + pSEO) */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3 gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#00897b] shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight">
                    AI Content Writer — SEO · AEO · GEO · pSEO
                  </h4>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Generate search-ranked articles, Answer Engine capsules, Philadelphia local GEO sections &amp; verified internal links
                  </span>
                  {(articleContext?.title || articleContext?.focusKeyword) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {articleContext.title && (
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200 max-w-[260px] truncate">
                          Topic: {articleContext.title}
                        </span>
                      )}
                      {articleContext.focusKeyword && (
                        <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-200">
                          KW: {articleContext.focusKeyword}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Group 1: Full & Modular SEO / AEO / GEO / pSEO Generators */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                Generate SEO / AEO / GEO / pSEO Blocks
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: "full_article", label: "Full SEO+AEO+GEO Guide", desc: "950–1,300w complete article" },
                    { id: "aeo_capsule", label: "AEO Quick Answer", desc: "AI Overview snippet + takeaways" },
                    { id: "geo_local", label: "GEO Philly Trust", desc: "33 S 52nd St & Lancaster Ave" },
                    { id: "pseo_links", label: "pSEO Internal Links", desc: "Verified service & repair URLs" },
                    { id: "comparison_table", label: "Comparison Table", desc: "Topic-specific tier matrix" },
                    { id: "faq_block", label: "AEO FAQ Accordion", desc: "4–5 schema-ready Q&A items" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAiAction(item.id)}
                    className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                      aiAction === item.id
                        ? "border-[#00897b] bg-teal-50/70 shadow-2xs font-semibold text-teal-950"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="text-xs block font-semibold">{item.label}</span>
                    <span className="text-[10px] text-gray-500 block leading-tight mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group 2: Rewrite & Polish Actions */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                Rewrite &amp; Refine Selection
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "seo_optimize", label: "SEO+AEO Optimize" },
                    { id: "expand", label: "Expand Technical Depth" },
                    { id: "polish", label: "Polish Tone" },
                    { id: "grammar", label: "Fix Grammar" },
                    { id: "shorten", label: "Key Takeaways" },
                    { id: "cta", label: "Walk-In CTA" },
                    { id: "custom", label: "Custom Prompt" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAiAction(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                      aiAction === item.id
                        ? "border-gray-900 bg-gray-900 text-white font-semibold"
                        : "border-gray-200 bg-gray-50/70 hover:border-gray-300 text-gray-700 font-medium"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Selected Text (optional for generators) */}
            <div>
              <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                Selected Text / Draft Notes{" "}
                <span className="font-normal text-gray-400">
                  (optional for Full Article, AEO, GEO, Comparison &amp; FAQ generators)
                </span>
              </label>
              <textarea
                value={aiSelectedText}
                onChange={(e) => setAiSelectedText(e.target.value)}
                rows={3}
                placeholder="Highlight text in the editor to rewrite, or leave empty to generate from your article title & focus keyword..."
                className="w-full p-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#00897b] leading-relaxed font-sans"
              />
            </div>

            {/* Optional Custom Directive */}
            <div>
              <label className="text-[11px] font-medium text-gray-600 block mb-1">
                Custom SEO / Technical Instructions (Optional)
              </label>
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="e.g. Mention retimer IC testing, $149 starting price, or University City same-day walk-ins"
                className="w-full h-[34px] px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
              />
            </div>

            {aiError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 font-medium">
                {aiError}
              </div>
            )}

            {/* Generate Trigger */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-gray-400">
                Uses your saved Gemini / OpenAI key from Settings with automatic model failover.
              </span>
              <button
                type="button"
                onClick={handleTriggerAiGenerate}
                disabled={
                  isAiLoading ||
                  (!["full_article", "aeo_capsule", "geo_local", "pseo_links", "comparison_table", "faq_block", "cta"].includes(aiAction) &&
                    !aiSelectedText.trim() &&
                    !(value && value.trim()) &&
                    !articleContext?.title?.trim() &&
                    !aiCustomPrompt.trim())
                }
                className="h-[34px] px-4 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold shadow-2xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 transition shrink-0"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            </div>

            {/* Result Preview Box */}
            {aiResultText && (
              <div className="space-y-2.5 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">Generated Output</span>
                    {aiModelUsed && (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {aiModelUsed}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 p-0.5 rounded-md border border-gray-200 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAiPreviewTab("preview")}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                          aiPreviewTab === "preview" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                        }`}
                      >
                        Visual Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiPreviewTab("html")}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                          aiPreviewTab === "html" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                        }`}
                      >
                        Raw HTML
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(aiResultText);
                      }}
                      className="text-[11px] text-gray-500 hover:text-black inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy HTML</span>
                    </button>
                  </div>
                </div>

                {aiPreviewTab === "preview" ? (
                  <div
                    className="sfd-article-prose p-4 rounded-lg bg-gray-50/50 border border-gray-200 max-h-72 overflow-y-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: aiResultText }}
                  />
                ) : (
                  <pre className="p-3.5 rounded-lg bg-gray-900 text-emerald-300 text-[11px] font-mono max-h-72 overflow-y-auto whitespace-pre-wrap break-all">
                    {aiResultText}
                  </pre>
                )}

                {/* Apply Actions */}
                <div className="flex items-center justify-end flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyAiResult("insert_cursor")}
                    className={`h-[32px] px-3 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
                      aiAction !== "full_article"
                        ? "bg-[#00897b] hover:bg-[#00796b] text-white shadow-2xs"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Insert at Cursor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyAiResult("append")}
                    className="h-[32px] px-3 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Append to End
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyAiResult("replace_all")}
                    className={`h-[32px] px-3.5 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition ${
                      aiAction === "full_article"
                        ? "bg-[#00897b] hover:bg-[#00796b] text-white shadow-2xs"
                        : "border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Replace Full Article</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: INSERT TABLE */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                <TableIcon className="w-4 h-4 text-[#00897b]" />
                <span>Insert Custom Table</span>
              </div>
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertTable} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Columns (Vertical)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                    className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Data Rows (Horizontal)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="includeHeaderCheck"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="includeHeaderCheck" className="text-xs text-gray-700 select-none cursor-pointer">
                  Include styled Header row (Recommended)
                </label>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 block mb-1.5 font-semibold">Quick Presets:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTableCols(3);
                      setTableRows(3);
                      setIncludeHeader(true);
                    }}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[11px] text-gray-700 cursor-pointer"
                  >
                    3 x 3 Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTableCols(2);
                      setTableRows(4);
                      setIncludeHeader(true);
                    }}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[11px] text-gray-700 cursor-pointer"
                  >
                    2 x 4 Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTableCols(4);
                      setTableRows(3);
                      setIncludeHeader(true);
                    }}
                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[11px] text-gray-700 cursor-pointer"
                  >
                    4 x 3 Matrix
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                  className="h-[30px] px-3 rounded border text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[30px] px-3.5 rounded bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Insert Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EMBED YOUTUBE VIDEO */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800">
                <Video className="w-4 h-4 text-red-600" />
                <span>Embed YouTube Video</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertVideo} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  YouTube Video URL or ID *
                </label>
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Accepts standard YouTube links, shortlinks (youtu.be), or embed URLs.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="h-[30px] px-3 rounded border text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[30px] px-3.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Embed Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL MEDIA MANAGEMENT MODAL INTEGRATION */}
      <MediaModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={handleSelectMedia}
        title="Insert In-Article Media"
        selectButtonText="Insert into Article"
      />

      {/* MODAL: ADVANCE pSEO JUICY LINKING INSERTER */}
      {pseoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#00897b]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-tight">
                    Insert an internal link
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    High-authority internal links connecting devices, issues &amp; prices
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPseoModalOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertPseoLink} className="space-y-4">
              {/* Select Device & Issue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                    Target Device Model
                  </label>
                  <select
                    value={selectedDeviceSlug}
                    onChange={(e) => setSelectedDeviceSlug(e.target.value)}
                    className="w-full h-[34px] px-2.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white focus:outline-none focus:border-[#00897b]"
                  >
                    {PSEO_DEVICES.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.brand}: {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                    Hardware Issue
                  </label>
                  <select
                    value={selectedIssueSlug}
                    onChange={(e) => setSelectedIssueSlug(e.target.value)}
                    className="w-full h-[34px] px-2.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white focus:outline-none focus:border-[#00897b]"
                  >
                    {PSEO_ISSUES.map((i) => (
                      <option key={`${i.category}:${i.slug}`} value={i.slug}>
                        [{i.category}] {i.name} (from ${i.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linking Strategy Tabs */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Link type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkingStrategy("inline")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      linkingStrategy === "inline"
                        ? "border-[#00897b] bg-teal-50/50 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block mb-0.5">Inline Badge</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">In-text link + price pill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkingStrategy("card")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      linkingStrategy === "card"
                        ? "border-[#00897b] bg-teal-50/50 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block mb-0.5">Service CTA Card</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">Dark high-conversion card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLinkingStrategy("matrix")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      linkingStrategy === "matrix"
                        ? "border-[#00897b] bg-teal-50/50 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block mb-0.5">Sibling Matrix</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">3-box cross repair grid</span>
                  </button>
                </div>
              </div>

              {/* Optional Custom Anchor Text (for inline) */}
              {linkingStrategy === "inline" && (
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                    Custom Anchor Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={customAnchorText}
                    onChange={(e) => setCustomAnchorText(e.target.value)}
                    placeholder={`e.g. ${
                      (PSEO_DEVICES.find((d) => d.slug === selectedDeviceSlug) || PSEO_DEVICES[0]).name
                    } ${(PSEO_ISSUES.find((i) => i.slug === selectedIssueSlug && i.category === (PSEO_DEVICES.find((d) => d.slug === selectedDeviceSlug) || PSEO_DEVICES[0]).category) || PSEO_ISSUES.find((i) => i.slug === selectedIssueSlug) || PSEO_ISSUES[0]).shortName}`}
                    className="w-full h-[32px] px-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
              )}

              {/* Target Destination Preview */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Link destination</span>
                <span className="font-mono text-gray-800 text-[11px] font-semibold block truncate">
                  /repairs/
                  {(PSEO_DEVICES.find((d) => d.slug === selectedDeviceSlug) || PSEO_DEVICES[0]).category}/
                  {selectedDeviceSlug}/{selectedIssueSlug}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPseoModalOpen(false)}
                  className="h-[32px] px-4 rounded-lg border text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-4 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Insert pSEO Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
