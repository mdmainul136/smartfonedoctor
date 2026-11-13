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
  ArrowUpRight,
  RefreshCw,
  Copy,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
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
  { label: "SFD Teal", color: "#00897b" },
  { label: "Crimson Red", color: "#dc2626" },
  { label: "Royal Blue", color: "#2563eb" },
  { label: "Emerald Green", color: "#059669" },
  { label: "Amber Orange", color: "#d97706" },
  { label: "Purple", color: "#7c3aed" },
  { label: "Muted Gray", color: "#6b7280" },
  { label: "Pure White", color: "#ffffff" },
];

const HIGHLIGHT_COLORS = [
  { label: "Soft Yellow", color: "#fef08a" },
  { label: "Soft Teal", color: "#ccfbf1" },
  { label: "Soft Green", color: "#dcfce7" },
  { label: "Soft Blue", color: "#dbeafe" },
  { label: "Soft Red", color: "#fee2e2" },
  { label: "Soft Purple", color: "#f3e8ff" },
  { label: "Soft Amber", color: "#ffedd5" },
  { label: "Muted Gray", color: "#f3f4f6" },
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

  // AI Content Assistant Dialog
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSelectedText, setAiSelectedText] = useState("");
  const [aiAction, setAiAction] = useState<"polish" | "grammar" | "seo" | "expand" | "shorten" | "cta" | "faq">("polish");
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiResultText, setAiResultText] = useState("");
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

  // Toolbar Block Menu
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const blockMenuRef = useRef<HTMLDivElement>(null);

  // Text & Block Color Selectors
  const [textColorMenuOpen, setTextColorMenuOpen] = useState(false);
  const [bgColorMenuOpen, setBgColorMenuOpen] = useState(false);
  const [activeColor, setActiveColor] = useState("#111827");
  const [customTextColor, setCustomTextColor] = useState("#00897b");
  const [customBgColor, setCustomBgColor] = useState("#ccfbf1");
  const textColorMenuRef = useRef<HTMLDivElement>(null);
  const bgColorMenuRef = useRef<HTMLDivElement>(null);

  // Floating Bubble Selection Toolbar
  const [bubbleToolbar, setBubbleToolbar] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

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

  const executeCommand = (command: string, val: string | undefined = undefined) => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const formatHeading = (tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p") => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    try {
      document.execCommand("formatBlock", false, `<${tag}>`);
    } catch {
      document.execCommand("formatBlock", false, tag);
    }
    handleInput();
    setBlockMenuOpen(false);
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
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        str = sel.toString().trim();
      }
    }
    const targetText = str || "SmartFone Doctor provides same-day iPhone and Samsung screen repair at 33 S 52nd St in Philadelphia.";
    setAiSelectedText(targetText);
    setAiResultText("");
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

  // Custom Callout Alert Boxes
  const insertCallout = (type: "tip" | "warning" | "note") => {
    if (mode !== "visual") return;
    editorRef.current?.focus();

    const titles = {
      tip: "💡 Technician Tip",
      warning: "⚠️ Technician Warning",
      note: "ℹ️ Important Note",
    };

    const styles = {
      tip: "background: #f0fdfa; border-left: 4px solid #00897b; color: #134e48; padding: 14px 18px; margin: 18px 0; border-radius: 6px;",
      warning: "background: #fef2f2; border-left: 4px solid #dc2626; color: #7f1d1d; padding: 14px 18px; margin: 18px 0; border-radius: 6px;",
      note: "background: #eff6ff; border-left: 4px solid #2563eb; color: #1e3a8a; padding: 14px 18px; margin: 18px 0; border-radius: 6px;",
    };

    const calloutHtml = `<div style="${styles[type]}" class="sfd-callout-${type}"><strong>${titles[type]}:</strong> Enter your advice or warning here...</div><p><br></p>`;
    document.execCommand("insertHTML", false, calloutHtml);
    handleInput();
  };

  // Structured Blocks Inserter
  const insertStructuredBlock = (type: "section" | "step" | "tools" | "comparison" | "faq" | "code") => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    setBlockMenuOpen(false);

    let html = "";
    if (type === "section") {
      html = `
        <div style="margin: 28px 0; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 10px 0;">New Diagnostic Section</h2>
          <p style="font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 14px 0;">Describe the hardware symptoms, bench diagnosis, and repair procedure steps here...</p>
          <div style="background: #f0fdfa; border-left: 4px solid #00897b; color: #134e48; padding: 12px 16px; border-radius: 6px;">
            <strong>💡 Technician Tip:</strong> Always disconnect the battery connector before removing display cables.
          </div>
        </div>
        <p><br></p>
      `;
    } else if (type === "step") {
      html = `
        <div style="display: flex; gap: 14px; margin: 18px 0; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #00897b; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0;">1</div>
          <div style="flex: 1;">
            <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0;">Step 1: Soft Prying with Anti-Static Spudger</h3>
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6;">Carefully release the perimeter adhesive seal using gentle 75°C heat and a non-conductive nylon pry tool...</p>
          </div>
        </div>
        <p><br></p>
      `;
    } else if (type === "tools") {
      html = `
        <div style="margin: 22px 0; padding: 18px 20px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px;">
          <h4 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0;">🛠️ Required Bench Tools & Materials</h4>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
            <li><strong>Driver:</strong> Precision P2 Pentalobe & Tri-point Y000</li>
            <li><strong>Thermal:</strong> Heat Mat or Hot Air Rework Station (75°C - 80°C)</li>
            <li><strong>Chemical:</strong> 99% Pure Isopropyl Alcohol (IPA)</li>
            <li><strong>Replacement:</strong> Genuine OEM Pull-Tab Battery Adhesive Strips</li>
          </ul>
        </div>
        <p><br></p>
      `;
    } else if (type === "comparison") {
      html = `
        <table style="width: 100%; margin: 22px 0; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 14px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 10px 14px; border: 1px solid #cbd5e1;">Component Metric</th>
              <th style="padding: 10px 14px; border: 1px solid #cbd5e1; color: #00897b; font-weight: 700;">OEM Grade Part</th>
              <th style="padding: 10px 14px; border: 1px solid #cbd5e1; color: #64748b;">Standard Aftermarket</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 600;">Battery Cycle Capacity</td>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1;">✅ 800 - 1000 Full Cycles</td>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1;">⚠️ 300 - 500 Cycles</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 600;">TrueTone & Sensor Pairing</td>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1;">✅ 100% Genuine Calibration</td>
              <td style="padding: 10px 14px; border: 1px solid #cbd5e1;">❌ Non-serialized Warning</td>
            </tr>
          </tbody>
        </table>
        <p><br></p>
      `;
    } else if (type === "faq") {
      html = `
        <details style="margin: 16px 0; padding: 14px 18px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer;">
          <summary style="font-weight: 700; font-size: 15px; color: #0f172a; outline: none;">Question: Will an aftermarket screen replacement disable Face ID?</summary>
          <div style="margin-top: 10px; font-size: 14px; color: #334155; line-height: 1.6;">Answer: No. As long as the original ambient light sensor and ear speaker flex are transferred safely to the new assembly, Face ID remains 100% functional.</div>
        </details>
        <p><br></p>
      `;
    } else if (type === "code") {
      html = `
        <pre style="background: #1e293b; color: #38bdf8; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 20px 0; overflow-x: auto;"><code>// Example EEPROM serialization code&#10;read_sensor_id(FPC_BUS_0);</code></pre>
        <p><br></p>
      `;
    }

    document.execCommand("insertHTML", false, html);
    handleInput();
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

  // AI Content Assistant Engine
  const handleTriggerAiGenerate = () => {
    const input = aiSelectedText.trim();
    if (!input) return;

    setIsAiLoading(true);

    setTimeout(() => {
      let output = "";
      switch (aiAction) {
        case "polish":
          output = `At SmartFone Doctor in Philadelphia, our certified technicians ensure precision repairs for your device. ${input.replace(/\bbroken\b/gi, "compromised")}. Every repair includes thorough multi-point diagnostics and is backed by our comprehensive 90-day parts and labor warranty.`;
          break;
        case "grammar": {
          const clean = input
            .replace(/\s+/g, " ")
            .replace(/([.?!])\s*([a-z])/g, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`);
          output = clean.charAt(0).toUpperCase() + clean.slice(1);
          break;
        }
        case "seo":
          output = `${input} For residents across Philadelphia—including West Philadelphia, University City, and Center City—SmartFone Doctor (located at 33 S 52nd St, Philadelphia, PA 19139) offers premium bench diagnostics and genuine OEM-grade replacement parts with fast turnaround times.`;
          break;
        case "expand":
          output = `${input}\n\nTechnical Diagnostic Checklist:\n• Pre-repair visual inspection for micro-fractures and frame misalignment\n• Precision thermal separation using controlled ESD-safe heat plates\n• Internal flex cable and touch digitizer impedance testing\n• Post-installation calibrated true-tone and biometric verification\n• Backed by SmartFone Doctor's 90-day Philadelphia technician guarantee.`;
          break;
        case "shorten":
          output = `• Fast Diagnostics: Rapid bench assessment for common device failures.\n• Quality Parts: OEM & premium-grade components tested for longevity.\n• Philadelphia Walk-Ins: Convenient repair service at 33 S 52nd St with a 90-day warranty.`;
          break;
        case "cta":
          output = `Need immediate help with your device? Visit SmartFone Doctor at 33 S 52nd St in Philadelphia for fast walk-in diagnostic service, or call us at (215) 437-0105. Most standard repairs completed in under 45 minutes with a 90-day warranty!`;
          break;
        case "faq":
          output = `<div class="sfd-faq-item" style="border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 16px 0; background: #f8fafc;">\n  <strong style="color: #0f172a; font-size: 15px; display: block; margin-bottom: 6px;">Q: How does SmartFone Doctor handle this repair in Philadelphia?</strong>\n  <p style="color: #334155; font-size: 13px; margin: 0; line-height: 1.6;">A: ${input} Walk-in service is available at 33 S 52nd St with typical turnaround under 45 minutes and a 90-day parts warranty.</p>\n</div>`;
          break;
        default:
          output = input;
      }

      if (aiCustomPrompt.trim()) {
        output += `\n\n[Custom Directive: ${aiCustomPrompt.trim()}]`;
      }

      setAiResultText(output);
      setIsAiLoading(false);
    }, 450);
  };

  const handleApplyAiResult = (mode: "replace" | "below") => {
    if (!aiResultText) return;
    editorRef.current?.focus();

    if (savedRangeRef.current && typeof window !== "undefined") {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }

    if (mode === "replace") {
      const html = aiResultText.includes("<div") || aiResultText.includes("<p")
        ? aiResultText
        : `<p>${aiResultText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p>`;
      document.execCommand("insertHTML", false, html);
    } else {
      const html = `<p><br></p><div style="background: #f0fdfa; border-left: 4px solid #00897b; padding: 14px 18px; margin: 16px 0; border-radius: 0 8px 8px 0;"><span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #00897b; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">✨ AI Optimized Insights</span>${aiResultText.replace(/\n/g, "<br/>")}</div><p><br></p>`;
      document.execCommand("insertHTML", false, html);
    }

    setAiModalOpen(false);
    setAiResultText("");
    setAiSelectedText("");
    handleInput();
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
    const issue = PSEO_ISSUES.find((i) => i.slug === selectedIssueSlug) || PSEO_ISSUES[0];
    const price = issue.basePrice + (device.releaseYear >= 2024 ? 20 : 0);
    const targetUrl = `/repairs/${device.category}/${device.slug}/${issue.slug}`;

    let html = "";

    if (linkingStrategy === "inline") {
      const anchorText = customAnchorText.trim() || `${device.name} ${issue.shortName} in Philadelphia`;
      html = `<a href="${targetUrl}" class="sfd-juicy-link" style="color: #00897b; font-weight: 700; text-decoration: underline; text-underline-offset: 3px;">${anchorText} <span style="font-size: 11px; background: #e6fffa; color: #00897b; border: 1px solid #b2f5ea; padding: 2px 7px; border-radius: 9999px; font-weight: 600; margin-left: 4px; text-decoration: none; display: inline-block;">$${price} · ${issue.turnaroundDisplay}</span></a> `;
    } else if (linkingStrategy === "card") {
      html = `
        <div class="sfd-pseo-card" style="background: linear-gradient(135deg, #1d1c1a 0%, #2e2a25 100%); color: #ffffff; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #3f3f46; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
          <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 16px;">
            <div style="max-width: 500px;">
              <span style="background: rgba(77, 208, 225, 0.15); color: #4dd0e1; border: 1px solid rgba(77, 208, 225, 0.3); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Philadelphia Bench Service</span>
              <h4 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 8px 0 4px 0;">${device.name} ${issue.name}</h4>
              <p style="font-size: 13px; color: #d4d4d8; margin: 0; line-height: 1.5;">${device.specs} · Backed by 90-day parts &amp; labor warranty · Walk-ins welcome at 33 S 52nd St.</p>
            </div>
            <div style="text-align: right; min-width: 140px;">
              <span style="font-size: 24px; font-weight: 900; color: #4dd0e1; display: block;">From $${price}</span>
              <span style="font-size: 11px; color: #a1a1aa; display: block; margin-bottom: 10px;">⏱️ ${issue.turnaroundDisplay}</span>
              <a href="${targetUrl}" style="display: inline-block; background: #00897b; color: #ffffff; padding: 9px 20px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; text-decoration: none; letter-spacing: 0.05em;">Book Repair →</a>
            </div>
          </div>
        </div>
        <p><br></p>
      `;
    } else if (linkingStrategy === "matrix") {
      const siblings = PSEO_ISSUES.filter((i) => i.category === device.category).slice(0, 3);
      html = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #00897b; letter-spacing: 0.05em; display: block; margin-bottom: 8px;">Popular Hardware Repairs for ${device.name}</span>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
            ${siblings
              .map((sib) => {
                const sPrice = sib.basePrice + (device.releaseYear >= 2024 ? 20 : 0);
                const sUrl = `/repairs/${device.category}/${device.slug}/${sib.slug}`;
                return `
                  <a href="${sUrl}" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; text-decoration: none; color: #0f172a; display: block;">
                    <strong style="font-size: 13px; display: block; color: #0f172a; margin-bottom: 4px;">${sib.shortName}</strong>
                    <span style="font-size: 11px; color: #64748b;">From $${sPrice} · ${sib.turnaroundDisplay}</span>
                  </a>
                `;
              })
              .join("")}
          </div>
        </div>
        <p><br></p>
      `;
    }

    document.execCommand("insertHTML", false, html);
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
      setBubbleToolbar({
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 46,
      });
    }
  }, [mode]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateBubblePosition);
    return () => document.removeEventListener("selectionchange", updateBubblePosition);
  }, [updateBubblePosition]);

  // 2. SLASH COMMANDS LIST
  const slashCommands: SlashCommandItem[] = [
    {
      id: "ai",
      title: "✨ AI Content Assistant",
      description: "Polish, fix grammar, inject Philadelphia SEO, or expand diagnostics",
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
      description: "Highlight professional advice in a teal alert box",
      badge: "Alert",
      icon: Lightbulb,
      action: () => insertCallout("tip"),
    },
    {
      id: "warning",
      title: "Safety Warning",
      description: "Red alert box for high-risk procedures",
      badge: "Danger",
      icon: AlertTriangle,
      action: () => insertCallout("warning"),
    },
    {
      id: "note",
      title: "Important Note",
      description: "Blue informational callout for crucial details",
      badge: "Info",
      icon: Info,
      action: () => insertCallout("note"),
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
      title: "⚡ pSEO Contextual Juicy Link",
      description: "Smart link to device/issue repair page with live price & turnaround badge",
      badge: "pSEO",
      icon: Sparkles,
      action: () => {
        setLinkingStrategy("inline");
        setPseoModalOpen(true);
      },
    },
    {
      id: "repair-card",
      title: "🛠️ Bench Service CTA Card",
      description: "High-converting dark repair card with pricing, specs & booking button",
      badge: "Convert",
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

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
        setBlockMenuOpen(false);
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
    document.execCommand("foreColor", false, color);
    setActiveColor(color);
    handleInput();
    setTextColorMenuOpen(false);
  };

  const applyHighlightColor = (color: string) => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    document.execCommand("hiliteColor", false, color);
    handleInput();
    setBgColorMenuOpen(false);
  };

  const removeHighlight = () => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    document.execCommand("hiliteColor", false, "transparent");
    handleInput();
    setBgColorMenuOpen(false);
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
      
      {/* 1. STICKY WYSIWYG TOOLBAR */}
      <div className="bg-[#f9fafb] border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-20">
        
        {/* Undo / Redo */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("undo")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("redo")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings & Block Formats */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-1">
          {/* Block Format Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBlockMenuOpen((prev) => !prev)}
              className="h-[28px] px-2 rounded-md hover:bg-gray-200 text-gray-800 text-xs font-semibold inline-flex items-center gap-1 border border-gray-300 bg-white cursor-pointer shadow-2xs"
              title="Change Block Heading / Format (H1-H6, P)"
            >
              <span>Format</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {blockMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Headings &amp; Text
                </div>
                <button
                  type="button"
                  onClick={() => formatHeading("h1")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs font-black text-gray-900 cursor-pointer"
                >
                  <span className="text-sm">Heading 1 (H1)</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">28px</span>
                </button>
                <button
                  type="button"
                  onClick={() => formatHeading("h2")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-800 cursor-pointer"
                >
                  <span className="text-sm">Heading 2 (H2)</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">22px</span>
                </button>
                <button
                  type="button"
                  onClick={() => formatHeading("h3")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-800 cursor-pointer"
                >
                  <span>Heading 3 (H3)</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">18px</span>
                </button>
                <button
                  type="button"
                  onClick={() => formatHeading("h4")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs font-medium text-gray-800 cursor-pointer"
                >
                  <span>Heading 4 (H4)</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">16px</span>
                </button>
                <button
                  type="button"
                  onClick={() => formatHeading("h5")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs font-medium text-gray-700 cursor-pointer"
                >
                  <span>Heading 5 (H5)</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">14px</span>
                </button>
                <button
                  type="button"
                  onClick={() => formatHeading("h6")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs font-medium text-gray-600 cursor-pointer"
                >
                  <span>Heading 6 (H6)</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">12px</span>
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => formatHeading("p")}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs text-gray-700 cursor-pointer"
                >
                  <span>Paragraph (P)</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">Normal</span>
                </button>
                <button
                  type="button"
                  onClick={insertBlockquote}
                  className="w-full px-3 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs text-gray-700 cursor-pointer"
                >
                  <span>Blockquote</span>
                  <Quote className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Direct Buttons */}
          <button
            type="button"
            onClick={() => formatHeading("p")}
            className="px-2 py-1 rounded text-xs font-semibold hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Convert to Normal Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => formatHeading("h1")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-900 font-black cursor-pointer text-xs"
            title="Heading 1 (H1)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatHeading("h2")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 font-bold cursor-pointer"
            title="Heading 2 (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatHeading("h3")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 font-bold cursor-pointer"
            title="Heading 3 (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatHeading("h4")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 font-bold cursor-pointer"
            title="Heading 4 (H4)"
          >
            <Heading4 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Formatting */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 font-bold cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 italic cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("underline")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 underline cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("strikeThrough")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 line-through cursor-pointer"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* 1. TEXT COLOR SELECTOR DROPDOWN */}
          <div className="relative" ref={textColorMenuRef}>
            <button
              type="button"
              onClick={() => {
                setTextColorMenuOpen(!textColorMenuOpen);
                setBgColorMenuOpen(false);
              }}
              className="px-1.5 py-1 rounded hover:bg-gray-200 text-gray-800 flex items-center gap-0.5 cursor-pointer"
              title="Text Color"
            >
              <div className="flex flex-col items-center leading-none">
                <span className="font-bold text-[13px] leading-tight">A</span>
                <span
                  className="w-3.5 h-[3px] rounded-full mt-0.5"
                  style={{ backgroundColor: activeColor }}
                />
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {textColorMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 pb-2 border-b border-gray-100 mb-2">
                  <span>Text Color</span>
                  <button
                    type="button"
                    onClick={() => applyTextColor("#111827")}
                    className="text-[11px] text-gray-400 hover:text-black font-normal"
                  >
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {TEXT_COLORS.map((col) => (
                    <button
                      key={col.color}
                      type="button"
                      onClick={() => applyTextColor(col.color)}
                      className="group flex flex-col items-center gap-1 p-1 rounded hover:bg-gray-50 cursor-pointer"
                      title={col.label}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-gray-300 shadow-2xs group-hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: col.color }}
                      >
                        {activeColor === col.color && (
                          <Check className={`w-3.5 h-3.5 ${col.color === "#ffffff" ? "text-black" : "text-white"}`} />
                        )}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate w-full text-center">
                        {col.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500 font-medium">Custom Hex:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={(e) => {
                        setCustomTextColor(e.target.value);
                        applyTextColor(e.target.value);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[11px] font-mono text-gray-600 uppercase">
                      {customTextColor}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. BLOCK & HIGHLIGHT BACKGROUND COLOR DROPDOWN */}
          <div className="relative" ref={bgColorMenuRef}>
            <button
              type="button"
              onClick={() => {
                setBgColorMenuOpen(!bgColorMenuOpen);
                setTextColorMenuOpen(false);
              }}
              className="px-1.5 py-1 rounded hover:bg-gray-200 text-gray-800 flex items-center gap-0.5 cursor-pointer"
              title="Highlight & Block Background Color"
            >
              <div className="flex flex-col items-center leading-none">
                <Palette className="w-3.5 h-3.5 text-gray-700" />
                <span className="w-3.5 h-[3px] rounded-full mt-0.5 bg-yellow-400" />
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {bgColorMenuOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-30 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
                
                {/* Section A: Text Highlight Color */}
                <div className="pb-2 border-b border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-2">
                    <span className="flex items-center gap-1">
                      <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                      <span>Text Highlight</span>
                    </span>
                    <button
                      type="button"
                      onClick={removeHighlight}
                      className="text-[11px] text-gray-400 hover:text-black font-normal"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {HIGHLIGHT_COLORS.map((col) => (
                      <button
                        key={col.color}
                        type="button"
                        onClick={() => applyHighlightColor(col.color)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-left hover:opacity-80 text-xs font-medium text-gray-800 border border-gray-200 transition cursor-pointer"
                        style={{ backgroundColor: col.color }}
                      >
                        <span className="text-[10px] truncate">{col.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-400">Custom Highlight:</span>
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => {
                        setCustomBgColor(e.target.value);
                        applyHighlightColor(e.target.value);
                      }}
                      className="w-5 h-5 rounded cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Section B: Wrap Selection in Full Block Card Background */}
                <div className="pt-3">
                  <div className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#00897b]" />
                    <span>Block Background Card</span>
                  </div>

                  <div className="space-y-1.5">
                    {BLOCK_BG_STYLES.map((block) => (
                      <button
                        key={block.label}
                        type="button"
                        onClick={() => applyBlockBackground(block.style)}
                        className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-teal-500 hover:bg-gray-50 transition cursor-pointer group"
                      >
                        <span className="text-xs font-bold text-gray-800 block group-hover:text-teal-700">
                          {block.label}
                        </span>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {block.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("justifyLeft")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyCenter")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyRight")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Quotes & Tables */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertBlockquote}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertHorizontalRule}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTableModalOpen(true)}
            className="p-1.5 rounded hover:bg-teal-50 text-teal-700 cursor-pointer"
            title="Insert Table (Rows & Columns)"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Technician Callout Alert Blocks */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-1">
          <button
            type="button"
            onClick={() => insertCallout("tip")}
            className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-[#00897b] text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Insert Technician Tip Box"
          >
            <Lightbulb className="w-3 h-3 text-[#00897b]" />
            <span>Tip</span>
          </button>
          <button
            type="button"
            onClick={() => insertCallout("warning")}
            className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Insert Technician Warning Box"
          >
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span>Warning</span>
          </button>
          <button
            type="button"
            onClick={() => insertCallout("note")}
            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            title="Insert Important Note Box"
          >
            <Info className="w-3 h-3 text-blue-600" />
            <span>Note</span>
          </button>
        </div>

        {/* Media & Embeds */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-1">
          <button
            type="button"
            onClick={openLinkModal}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Insert SEO Link (Dofollow / Nofollow) (Ctrl+K)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded hover:bg-teal-50 text-teal-700 cursor-pointer"
            title="Browse & Insert Media Library"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setVideoModalOpen(true)}
            className="p-1.5 rounded hover:bg-red-50 text-red-600 cursor-pointer"
            title="Embed YouTube Repair Video"
          >
            <Video className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 📦 STRUCTURED BLOCKS INSERTER DROPDOWN */}
        <div className="relative" ref={blockMenuRef}>
          <button
            type="button"
            onClick={() => setBlockMenuOpen(!blockMenuOpen)}
            className="h-[28px] px-2.5 rounded-md bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Insert Pre-built Content & Hardware Blocks"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Block</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {blockMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 flex items-center justify-between">
                <span>Content &amp; Hardware Blocks</span>
                <span className="text-[10px] text-teal-600">Type /</span>
              </div>

              <button
                type="button"
                onClick={() => insertStructuredBlock("section")}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00897b] shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block leading-tight">Complete Section Block</span>
                  <span className="text-[11px] text-gray-400">H2 Subheading + text + tip box</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertStructuredBlock("step")}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                  <ListChecks className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block leading-tight">Step-by-Step Procedure</span>
                  <span className="text-[11px] text-gray-400">Numbered badge with step card</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertStructuredBlock("tools")}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block leading-tight">Required Tools &amp; Parts</span>
                  <span className="text-[11px] text-gray-400">Hardware checklist &amp; chemicals</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertStructuredBlock("faq")}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <HelpCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block leading-tight">FAQ Accordion Card</span>
                  <span className="text-[11px] text-gray-400">Collapsible Question &amp; Answer</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => insertStructuredBlock("comparison")}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2.5 text-xs text-gray-700 hover:text-black cursor-pointer transition-colors border-t border-gray-100 mt-1"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                  <TableIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold block leading-tight">OEM vs Aftermarket Table</span>
                  <span className="text-[11px] text-gray-400">Component comparison matrix</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* ⚡ ADVANCE pSEO JUICY LINK INSERTER BUTTON */}
        <div className="flex items-center pl-1 gap-1">
          <button
            type="button"
            onClick={() => setPseoModalOpen(true)}
            className="h-[28px] px-2.5 rounded-md bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Insert Advance pSEO Juicy Link, Repair Card or Matrix"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>⚡ pSEO Link</span>
          </button>

          {/* ✨ AI WRITING & SEO OPTIMIZER BUTTON */}
          <button
            type="button"
            onClick={openAiModal}
            className="h-[28px] px-2.5 rounded-md bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="✨ AI Assistant: Polish, Grammar, Local SEO, Technical Expansion, FAQ generator"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>✨ AI Assist</span>
          </button>
        </div>

        {/* View Toggle Mode (Visual vs HTML Code) */}
        <div className="ml-auto flex items-center gap-1 bg-white p-0.5 rounded border border-gray-200">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              mode === "visual"
                ? "bg-[#00897b] text-white shadow-2xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              mode === "html"
                ? "bg-[#00897b] text-white shadow-2xs"
                : "text-gray-600 hover:text-black"
            }`}
          >
            HTML Code
          </button>
        </div>

      </div>

      {/* 2. FLOATING BUBBLE SELECTION TOOLBAR (Notion & Payload Style) */}
      {bubbleToolbar.visible && (
        <div
          className="absolute z-30 bg-gray-900 text-white rounded-lg px-1.5 py-1 flex items-center gap-0.5 shadow-xl border border-gray-700 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: bubbleToolbar.x, top: bubbleToolbar.y }}
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand("bold");
            }}
            className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand("italic");
            }}
            className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              executeCommand("underline");
            }}
            className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleHighlight();
            }}
            className="p-1 hover:bg-gray-800 rounded text-yellow-300"
            title="Highlight"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-gray-700 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              openAiModal();
            }}
            className="px-1.5 py-0.5 hover:bg-purple-900/60 rounded text-yellow-300 font-bold text-xs inline-flex items-center gap-1"
            title="✨ AI Assist on Selected Text"
          >
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>AI</span>
          </button>
          <div className="w-[1px] h-3.5 bg-gray-700 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              openLinkModal();
            }}
            className="p-1 hover:bg-gray-800 rounded text-gray-200 hover:text-white"
            title="Insert SEO Link (Dofollow / Nofollow)"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("p");
            }}
            className="px-1.5 py-0.5 hover:bg-gray-800 rounded text-gray-200 hover:text-white font-semibold text-xs"
            title="Normal Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h1");
            }}
            className="px-1.5 py-0.5 hover:bg-gray-800 rounded text-gray-200 hover:text-white font-black text-xs"
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
            className="px-1.5 py-0.5 hover:bg-gray-800 rounded text-gray-200 hover:text-white font-bold text-xs"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h3");
            }}
            className="px-1.5 py-0.5 hover:bg-gray-800 rounded text-gray-200 hover:text-white font-bold text-xs"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              formatHeading("h4");
            }}
            className="px-1.5 py-0.5 hover:bg-gray-800 rounded text-gray-200 hover:text-white font-bold text-xs"
            title="Heading 4"
          >
            H4
          </button>
          <div className="w-[1px] h-3.5 bg-gray-700 mx-0.5" />
          {/* Quick Color Swatches in Bubble Toolbar */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyTextColor("#00897b");
            }}
            className="w-3.5 h-3.5 rounded-full bg-[#00897b] border border-gray-500 hover:scale-125 transition-transform"
            title="SFD Teal Text"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyTextColor("#dc2626");
            }}
            className="w-3.5 h-3.5 rounded-full bg-[#dc2626] border border-gray-500 hover:scale-125 transition-transform"
            title="Crimson Red Text"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyHighlightColor("#fef08a");
            }}
            className="w-3.5 h-3.5 rounded-full bg-[#fef08a] border border-gray-500 hover:scale-125 transition-transform"
            title="Soft Yellow Highlight"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyHighlightColor("#ccfbf1");
            }}
            className="w-3.5 h-3.5 rounded-full bg-[#ccfbf1] border border-gray-500 hover:scale-125 transition-transform"
            title="Soft Teal Highlight"
          />
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

      {/* 4. WRITING WORKSPACE */}
      {mode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          onKeyDown={handleKeyDown}
          className="sfd-editor-content p-6 sm:p-8 outline-none text-[#1d1c1a] leading-relaxed text-sm font-normal focus:bg-white transition-colors overflow-y-auto selection:bg-teal-100 selection:text-teal-900"
          style={{ minHeight }}
          data-placeholder={placeholder}
        />
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
      <div className="bg-[#f9fafb] border-t border-gray-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Words: <strong className="text-gray-700">{wordCount}</strong></span>
          <span>Characters: <strong className="text-gray-700">{charCount}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-teal-700 font-semibold">
          <Sparkles className="w-3 h-3 text-[#00897b]" />
          <span>Payload Lexical Engine Active • Press / for blocks</span>
        </div>
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

      {/* MODAL: ✨ AI WRITING & SEO OPTIMIZER */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-teal-600 flex items-center justify-center text-white shadow-2xs">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight">✨ AI Writing &amp; SEO Assistant</h4>
                  <span className="text-[11px] text-gray-400">Optimize, expand, and inject local Philadelphia repair hooks</span>
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

            {/* Target Selected Text */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                Selected Text in Editor
              </label>
              <textarea
                value={aiSelectedText}
                onChange={(e) => setAiSelectedText(e.target.value)}
                rows={3}
                placeholder="Select text in editor or type here..."
                className="w-full p-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-purple-600 leading-relaxed font-sans"
              />
            </div>

            {/* 7 AI Quick Presets */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                Select AI Optimization Strategy
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "polish", label: "🌟 Polish Tone", desc: "Professional technician grade" },
                  { id: "grammar", label: "🔍 Fix Grammar", desc: "Punctuation & sentence flow" },
                  { id: "seo", label: "🎯 Philly SEO", desc: "Inject local West Philly keywords" },
                  { id: "cta", label: "⚡ Repair CTA", desc: "Walk-in & phone booking callout" },
                  { id: "expand", label: "📈 Expand Tech", desc: "Diagnostic checklist & specs" },
                  { id: "shorten", label: "✂️ Bullet Points", desc: "3 crisp key takeaways" },
                  { id: "faq", label: "❓ FAQ Card", desc: "Interactive Q&A accordion" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAiAction(item.id as any)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      aiAction === item.id
                        ? "border-purple-600 bg-purple-50/70 shadow-2xs"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900 block">{item.label}</span>
                    <span className="text-[10px] text-gray-500 block leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Custom Directive */}
            <div>
              <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                Additional Custom Instructions (Optional)
              </label>
              <input
                type="text"
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="e.g. Mention 45-minute turnaround and OEM OLED screens"
                className="w-full h-[32px] px-3 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Generate Trigger */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleTriggerAiGenerate}
                disabled={isAiLoading || !aiSelectedText.trim()}
                className="h-[34px] px-5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Optimized Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Result Preview Box */}
            {aiResultText && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-1.5 text-purple-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Generated Output:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiResultText);
                    }}
                    className="text-[11px] text-gray-500 hover:text-black inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs text-gray-800 leading-relaxed font-sans max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {aiResultText}
                </div>

                {/* Replacement Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyAiResult("below")}
                    className="h-[32px] px-3 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Insert Below as Callout
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyAiResult("replace")}
                    className="h-[32px] px-4 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Replace Selected Text</span>
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
                    Insert Advance pSEO Juicy Link &amp; Strategy
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
                      <option key={i.slug} value={i.slug}>
                        {i.name} (from ${i.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Linking Strategy Tabs */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1.5">
                  Juicy Linking Strategy
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
                    } ${(PSEO_ISSUES.find((i) => i.slug === selectedIssueSlug) || PSEO_ISSUES[0]).shortName}`}
                    className="w-full h-[32px] px-2.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
              )}

              {/* Target Destination Preview */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Link Destination (pSEO Canonical)</span>
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
