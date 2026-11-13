"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Check,
  Trash2,
  FileText,
  AlertCircle,
  ExternalLink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
} from "lucide-react";
import {
  MediaItem,
  INITIAL_MEDIA_LIBRARY,
  getClientMediaLibrary,
  saveClientMediaLibrary,
  formatBytes,
} from "@/lib/mediaData";

export interface SelectedMediaPayload {
  url: string;
  alt: string;
  caption?: string;
  alignment: "left" | "center" | "right" | "full";
  size: "small" | "medium" | "full";
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (payload: SelectedMediaPayload) => void;
  title?: string;
  selectButtonText?: string;
  initialSelectedUrl?: string;
}

export default function MediaModal({
  isOpen,
  onClose,
  onSelect,
  title = "Media Management Library",
  selectButtonText = "Insert into post",
  initialSelectedUrl = "",
}: MediaModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">("library");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Attachment details
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "full">("center");
  const [size, setSize] = useState<"small" | "medium" | "full">("medium");

  // Direct URL tab state
  const [directUrl, setDirectUrl] = useState("");
  const [directAlt, setDirectAlt] = useState("");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media items from server and fallback to client localStorage
  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          saveClientMediaLibrary(data.items);
          return;
        }
      }
    } catch {
      // Fallback to local
    } finally {
      setLoading(false);
    }
    const local = getClientMediaLibrary();
    setItems(local);
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  // Set initial selected item if URL matches
  useEffect(() => {
    if (initialSelectedUrl && items.length > 0) {
      const matched = items.find((it) => it.url === initialSelectedUrl);
      if (matched) {
        setSelectedItem(matched);
        setAltText(matched.alt || "");
        setCaption(matched.caption || "");
      }
    }
  }, [initialSelectedUrl, items]);

  if (!isOpen) return null;

  // Handle image item click in grid
  const handleSelectLibraryItem = (item: MediaItem) => {
    setSelectedItem(item);
    setAltText(item.alt || "");
    setCaption(item.caption || "");
  };

  // Upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (PNG, JPG, WEBP, GIF, SVG).");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          const updated = [data.item, ...items];
          setItems(updated);
          saveClientMediaLibrary(updated);
          setSelectedItem(data.item);
          setAltText(data.item.alt);
          setActiveTab("library");
        }
      } else {
        throw new Error("Server rejected file upload");
      }
    } catch (err: unknown) {
      console.warn("Upload fallback to base64 data URL", err);
      // Fallback client-side reader
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const fallbackItem: MediaItem = {
          id: `local-${Date.now()}`,
          filename: file.name,
          url: base64,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          filesize: file.size,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
        };
        const updated = [fallbackItem, ...items];
        setItems(updated);
        saveClientMediaLibrary(updated);
        setSelectedItem(fallbackItem);
        setAltText(fallbackItem.alt);
        setActiveTab("library");
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  // Delete media item
  const handleDeleteItem = async (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation();
    if (!confirm(`Delete "${item.filename}" from media library?`)) return;

    try {
      await fetch(`/api/admin/media?id=${item.id}&filename=${item.filename}`, {
        method: "DELETE",
      });
    } catch {
      // Ignored
    }

    const filtered = items.filter((it) => it.id !== item.id);
    setItems(filtered);
    saveClientMediaLibrary(filtered);
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }
  };

  // Submit selection to parent editor
  const handleConfirmSelect = () => {
    if (activeTab === "url") {
      if (!directUrl.trim()) return;
      onSelect({
        url: directUrl.trim(),
        alt: directAlt.trim() || "Hardware repair image",
        caption: caption.trim() || undefined,
        alignment,
        size,
      });
      onClose();
      return;
    }

    if (!selectedItem) return;

    onSelect({
      url: selectedItem.url,
      alt: altText.trim() || selectedItem.alt || selectedItem.filename,
      caption: caption.trim() || undefined,
      alignment,
      size,
    });
    onClose();
  };

  // Filter items by search query
  const filteredItems = items.filter((it) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.filename.toLowerCase().includes(q) ||
      (it.alt && it.alt.toLowerCase().includes(q)) ||
      (it.caption && it.caption.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl h-[88vh] max-h-[820px] flex flex-col overflow-hidden">
        
        {/* 1. MODAL HEADER & TABS */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-gray-500">
                Upload, manage, and attach media assets to your content.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. SUB-BAR: TABS + SEARCH */}
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "library"
                  ? "bg-white text-teal-700 shadow-2xs border border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Media Library ({items.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "upload"
                  ? "bg-white text-teal-700 shadow-2xs border border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "url"
                  ? "bg-white text-teal-700 shadow-2xs border border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Insert via URL</span>
            </button>
          </div>

          {/* Search box for Library */}
          {activeTab === "library" && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search images & alt text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          )}
        </div>

        {/* 3. MAIN BODY CONTAINER */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* TAB 1: MEDIA LIBRARY (GRID + INSPECTOR) */}
          {activeTab === "library" && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Media Thumbnails Grid */}
              <div className="flex-1 p-5 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                    Loading media assets...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 space-y-3">
                    <ImageIcon className="w-10 h-10 mx-auto text-gray-300" />
                    <p className="text-sm">No media files found matching your search.</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
                    >
                      Upload New Image
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {filteredItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectLibraryItem(item)}
                          className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square bg-gray-100 flex items-center justify-center ${
                            isSelected
                              ? "border-teal-600 ring-2 ring-teal-500/30 shadow-md"
                              : "border-gray-200 hover:border-gray-400 hover:shadow-xs"
                          }`}
                        >
                          {/* Image preview */}
                          {item.url.startsWith("http") || item.url.startsWith("/") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.url}
                              alt={item.alt || item.filename}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="text-gray-400 text-xs text-center p-2">
                              {item.filename}
                            </div>
                          )}

                          {/* Selected Checkmark Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md animate-in zoom-in-75">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Filename Overlay on hover */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white text-[11px] font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.filename}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Attachment Details Inspector */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50/70 p-5 overflow-y-auto shrink-0 flex flex-col justify-between">
                {selectedItem ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Attachment Details
                    </h4>

                    {/* Preview Thumbnail */}
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white aspect-video relative flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedItem.url}
                        alt={selectedItem.alt}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Meta info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="font-semibold text-gray-800 break-all">
                        {selectedItem.filename}
                      </p>
                      <p>
                        {formatBytes(selectedItem.filesize)} • {selectedItem.mimeType}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-3 space-y-3">
                      {/* Alt text input */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Alt Text <span className="text-teal-600 font-normal">(SEO &amp; Accessibility)</span>
                        </label>
                        <input
                          type="text"
                          value={altText}
                          onChange={(e) => setAltText(e.target.value)}
                          placeholder="Describe the image for screen readers"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      {/* Caption */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Caption / Figure Subtitle
                        </label>
                        <input
                          type="text"
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          placeholder="Optional visible caption below image"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      {/* Alignment Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Alignment
                        </label>
                        <div className="grid grid-cols-4 gap-1 bg-gray-200/70 p-1 rounded-lg">
                          {[
                            { key: "left", icon: AlignLeft, label: "Left" },
                            { key: "center", icon: AlignCenter, label: "Center" },
                            { key: "right", icon: AlignRight, label: "Right" },
                            { key: "full", icon: Maximize, label: "Full" },
                          ].map((al) => {
                            const Icon = al.icon;
                            const isActive = alignment === al.key;
                            return (
                              <button
                                key={al.key}
                                type="button"
                                onClick={() => setAlignment(al.key as any)}
                                className={`py-1 text-[11px] font-medium rounded flex flex-col items-center justify-center gap-0.5 transition-colors ${
                                  isActive
                                    ? "bg-white text-teal-700 shadow-2xs font-bold"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{al.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Size Display
                        </label>
                        <div className="grid grid-cols-3 gap-1 bg-gray-200/70 p-1 rounded-lg">
                          {[
                            { key: "small", label: "Small (320px)" },
                            { key: "medium", label: "Medium (640px)" },
                            { key: "full", label: "Full Width" },
                          ].map((sz) => {
                            const isActive = size === sz.key;
                            return (
                              <button
                                key={sz.key}
                                type="button"
                                onClick={() => setSize(sz.key as any)}
                                className={`py-1 px-1 text-[11px] font-medium rounded text-center transition-colors truncate ${
                                  isActive
                                    ? "bg-white text-teal-700 shadow-2xs font-bold"
                                    : "text-gray-600 hover:text-gray-900"
                                }`}
                              >
                                {sz.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Delete from library */}
                      {selectedItem.id.startsWith("media-upload-") && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(e, selectedItem)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete permanently</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-xs">
                      Click any image in the grid to view details, configure alt text, and insert.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: UPLOAD NEW */}
          {activeTab === "upload" && (
            <div className="flex-1 p-8 flex flex-col items-center justify-center">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                className={`w-full max-w-xl p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                  dragActive
                    ? "border-teal-500 bg-teal-50/50 scale-[1.01]"
                    : "border-gray-300 hover:border-gray-400 bg-gray-50/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7" />
                </div>

                <h4 className="text-base font-bold text-gray-900 mb-1">
                  Drop files to upload
                </h4>
                <p className="text-xs text-gray-500 max-w-sm mb-5">
                  or choose a high-resolution photo from your computer. PNG, JPG, WEBP, or SVG up to 10MB.
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
                >
                  {uploading ? "Uploading file..." : "Select Files from Computer"}
                </button>

                {uploadError && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: INSERT VIA URL */}
          {activeTab === "url" && (
            <div className="flex-1 p-8 max-w-2xl mx-auto w-full space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Direct Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="Describe the image content"
                  value={directAlt}
                  onChange={(e) => setDirectAlt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Preview */}
              {directUrl && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Image Preview</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-64 flex items-center justify-center p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={directUrl}
                      alt={directAlt || "Preview"}
                      className="max-h-60 max-w-full object-contain rounded"
                      onError={() => {}}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* 4. BOTTOM ACTION FOOTER */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500">
            {activeTab === "library" && selectedItem ? (
              <span className="font-medium text-gray-700">
                Selected: <span className="text-teal-700 font-bold">{selectedItem.filename}</span>
              </span>
            ) : activeTab === "url" && directUrl ? (
              <span className="font-medium text-gray-700">Ready to insert external URL</span>
            ) : (
              <span>Select an image or upload one to continue</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmSelect}
              disabled={
                (activeTab === "library" && !selectedItem) ||
                (activeTab === "url" && !directUrl.trim()) ||
                activeTab === "upload"
              }
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {selectButtonText}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

