"use client";

import React, { useRef, useState, useEffect } from "react";
import MediaModal, { SelectedMediaPayload } from "./MediaModal";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
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
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your guide content here...",
  minHeight = "360px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Link Dialog
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkText, setLinkText] = useState("");

  // Image Dialog
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  // Table Generator Dialog
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [includeHeader, setIncludeHeader] = useState(true);

  // Block Insertion Palette
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const blockMenuRef = useRef<HTMLDivElement>(null);

  // Close block menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (blockMenuRef.current && !blockMenuRef.current.contains(event.target as Node)) {
        setBlockMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const insertHeading = (tag: "h2" | "h3" | "p") => {
    executeCommand("formatBlock", `<${tag}>`);
  };

  const insertBlockquote = () => {
    executeCommand("formatBlock", "<blockquote>");
  };

  const insertHorizontalRule = () => {
    executeCommand("insertHorizontalRule");
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
      tip: "background: #f0fdfa; border-left: 4px solid #00897b; color: #134e48; padding: 12px 16px; margin: 16px 0; border-radius: 6px;",
      warning: "background: #fef2f2; border-left: 4px solid #dc2626; color: #7f1d1d; padding: 12px 16px; margin: 16px 0; border-radius: 6px;",
      note: "background: #eff6ff; border-left: 4px solid #2563eb; color: #1e3a8a; padding: 12px 16px; margin: 16px 0; border-radius: 6px;",
    };

    const calloutHtml = `<div style="${styles[type]}" class="sfd-callout-${type}"><strong>${titles[type]}:</strong> Enter your advice here...</div><p><br></p>`;
    document.execCommand("insertHTML", false, calloutHtml);
    handleInput();
  };

  // Structured Blocks Inserter (Option 1)
  const insertStructuredBlock = (type: "section" | "step" | "tools" | "comparison") => {
    if (mode !== "visual") return;
    editorRef.current?.focus();
    setBlockMenuOpen(false);

    let html = "";
    if (type === "section") {
      html = `
        <div style="margin: 28px 0; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 10px 0;">New Diagnostic Section</h2>
          <p style="font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 14px 0;">Describe the symptom, bench diagnosis, and repair procedure steps here...</p>
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
            <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.6;">Carefully release the perimeter adhesive seal using gentle heat and a non-conductive nylon pry tool...</p>
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
        <table style="width: 100%; margin: 22px 0; border-collapse: collapse; border: 1px solid #e2e8f0; font-size: 14px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left;">
              <th style="padding: 10px 14px; border: 1px solid #e2e8f0;">Component Metric</th>
              <th style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #00897b; font-weight: 700;">OEM Grade Part</th>
              <th style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #64748b;">Standard Aftermarket</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600;">Battery Cycle Capacity</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">✅ 800 - 1000 Full Cycles</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">⚠️ 300 - 500 Cycles</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 600;">TrueTone & Sensor Pairing</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">✅ 100% Genuine Calibration</td>
              <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">❌ Non-serialized Warning</td>
            </tr>
          </tbody>
        </table>
        <p><br></p>
      `;
    }

    document.execCommand("insertHTML", false, html);
    handleInput();
  };

  // Link Insertion
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    editorRef.current?.focus();

    if (linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #00897b; text-decoration: underline; font-weight: 600;">${linkText}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
    } else {
      executeCommand("createLink", linkUrl);
    }

    setLinkModalOpen(false);
    setLinkUrl("https://");
    setLinkText("");
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

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col">
      
      {/* 1. STICKY WYSIWYG TOOLBAR */}
      <div className="bg-[#f9fafb] border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 sticky top-0 z-20">
        
        {/* Undo / Redo */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("undo")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("redo")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => insertHeading("p")}
            className="px-2 py-1 rounded text-xs font-semibold hover:bg-gray-200 text-gray-700"
            title="Paragraph Text"
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => insertHeading("h2")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 font-bold"
            title="Subheading H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertHeading("h3")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 font-bold"
            title="Mini Subheading H3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Formatting */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 font-bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 italic"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("underline")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 underline"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("strikeThrough")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-800 line-through"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("justifyLeft")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyCenter")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyRight")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lists & Quotes */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-0.5">
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertBlockquote}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={insertHorizontalRule}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            title="Horizontal Divider"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTableModalOpen(true)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
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

        {/* Media & Links */}
        <div className="flex items-center border-r border-gray-200 pr-1.5 mr-1 gap-1">
          <button
            type="button"
            onClick={() => setLinkModalOpen(true)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 cursor-pointer"
            title="Browse & Insert Media"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 📦 STRUCTURED BLOCKS INSERTER DROPDOWN (No 1 Unified Mode) */}
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
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                Insert Content Block
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

        {/* View Toggle Mode (Visual vs HTML Code) */}
        <div className="ml-auto flex items-center gap-1 bg-white p-0.5 rounded border border-gray-200">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              mode === "visual"
                ? "bg-[#00897b] text-white"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              mode === "html"
                ? "bg-[#00897b] text-white"
                : "text-gray-600 hover:text-black"
            }`}
          >
            HTML
          </button>
        </div>

      </div>

      {/* 2. WRITING WORKSPACE */}
      {mode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="sfd-editor-content p-5 sm:p-7 outline-none text-[#1d1c1a] leading-relaxed text-sm font-normal focus:bg-white transition-colors overflow-y-auto selection:bg-teal-100 selection:text-teal-900"
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
          className="p-4 w-full font-mono text-xs text-gray-800 bg-[#1e1e1e] text-green-400 outline-none resize-y"
          style={{ minHeight }}
        />
      )}

      {/* 3. BOTTOM STATUS & WORD COUNT BAR */}
      <div className="bg-[#f9fafb] border-t border-gray-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Words: <strong className="text-gray-700">{wordCount}</strong></span>
          <span>Characters: <strong className="text-gray-700">{charCount}</strong></span>
        </div>
        <div className="text-gray-400">
          ⚡ Payload Lexical WYSIWYG Engine
        </div>
      </div>

      {/* MODAL: INSERT LINK */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-xs text-gray-800">Insert Link</h4>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://... or /schedule-repair"
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Link Text (Optional if text is selected)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Schedule Philadelphia Repair"
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="h-[30px] px-3 rounded border text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[30px] px-3 rounded bg-[#00897b] text-white text-xs font-semibold"
                >
                  Insert Link
                </button>
              </div>
            </form>
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

      {/* FULL MEDIA MANAGEMENT MODAL INTEGRATION */}
      <MediaModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={handleSelectMedia}
        title="Insert In-Article Media"
        selectButtonText="Insert into Article"
      />

    </div>
  );
}

