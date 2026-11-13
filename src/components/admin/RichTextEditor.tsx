"use client";

import React, { useRef, useState, useEffect } from "react";
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

  // Image Insertion
  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    editorRef.current?.focus();

    const imgHtml = `<figure style="margin: 20px 0; text-align: center;"><img src="${imageUrl}" alt="${imageAlt || 'Hardware repair photo'}" style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin: 0 auto;" />${imageAlt ? `<figcaption style="font-size: 12px; color: #6b7280; margin-top: 6px;">${imageAlt}</figcaption>` : ''}</figure><p><br></p>`;
    document.execCommand("insertHTML", false, imgHtml);

    setImageModalOpen(false);
    setImageUrl("");
    setImageAlt("");
    handleInput();
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
        <div className="flex items-center gap-1">
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
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
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
          className="p-5 sm:p-7 outline-none text-[#1d1c1a] leading-relaxed text-sm font-normal focus:bg-white transition-colors overflow-y-auto selection:bg-teal-100 selection:text-teal-900"
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

      {/* MODAL: INSERT IMAGE */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-xs text-gray-800">Insert In-Article Image</h4>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertImage} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Image Source URL *
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Caption / Alt Text
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Swollen battery bulging from iPhone chassis"
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="h-[30px] px-3 rounded border text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[30px] px-3 rounded bg-[#00897b] text-white text-xs font-semibold"
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
