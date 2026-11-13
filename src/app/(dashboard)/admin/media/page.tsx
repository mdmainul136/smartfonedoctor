"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Grid,
  List as ListIcon,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  FolderTree,
  AlertCircle,
  HardDrive,
  FileText,
  X,
  Eye,
} from "lucide-react";
import {
  MediaItem,
  INITIAL_MEDIA_LIBRARY,
  getClientMediaLibrary,
  saveClientMediaLibrary,
  formatBytes,
} from "@/lib/mediaData";

export default function MediaManagementPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inspector modal
  const [inspectItem, setInspectItem] = useState<MediaItem | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editCaption, setEditCaption] = useState("");

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          setItems(data.items);
          saveClientMediaLibrary(data.items);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }
    const local = getClientMediaLibrary();
    setItems(local);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

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
        }
      } else {
        throw new Error("Server rejected file upload");
      }
    } catch (err: unknown) {
      console.warn("Upload fallback to base64 data URL", err);
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
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to delete "${item.filename}"?`)) return;

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
    if (inspectItem?.id === item.id) {
      setInspectItem(null);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenInspect = (item: MediaItem) => {
    setInspectItem(item);
    setEditAlt(item.alt || "");
    setEditCaption(item.caption || "");
  };

  const handleSaveInspect = () => {
    if (!inspectItem) return;
    const updated = items.map((it) =>
      it.id === inspectItem.id
        ? { ...it, alt: editAlt.trim(), caption: editCaption.trim() || undefined }
        : it
    );
    setItems(updated);
    saveClientMediaLibrary(updated);
    setInspectItem(null);
  };

  const totalSize = items.reduce((acc, it) => acc + (it.filesize || 0), 0);

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Media Library &amp; Asset Manager
              </h1>
              <p className="text-[13px] text-gray-500">
                Upload and organize hardware repair photography, bench guides, diagrams, and brand assets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadMedia}
            className="h-[36px] px-3 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-[13px] font-medium text-gray-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh library"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-[36px] px-4 rounded-[6px] bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-semibold inline-flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Media</span>
          </button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Total Media Assets</span>
            <span className="text-lg font-bold text-gray-900">{items.length} files</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Storage Allocated</span>
            <span className="text-lg font-bold text-gray-900">{formatBytes(totalSize)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block">Upload Directory</span>
            <span className="text-xs font-mono font-bold text-gray-800">public/uploads</span>
          </div>
        </div>
      </div>

      {/* 3. DRAG & DROP UPLOAD ZONE */}
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
        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all bg-white ${
          dragActive
            ? "border-teal-500 bg-teal-50/50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2">
          <Upload className="w-5 h-5" />
        </div>

        <p className="text-sm font-bold text-gray-800">
          Drop repair images here to upload immediately
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Supports PNG, JPG, WEBP, and SVG (automatically optimized for fast web delivery).
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
        >
          {uploading ? "Uploading file..." : "Browse Files"}
        </button>

        {uploadError && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* 4. SEARCH & VIEW CONTROLS */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename, description, or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-teal-700 shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded text-xs transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-teal-700 shadow-2xs font-bold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. MEDIA DISPLAY (GRID VS LIST) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition group flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div
                onClick={() => handleOpenInspect(item)}
                className="aspect-square bg-gray-50 relative overflow-hidden cursor-pointer flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-1.5 rounded-full bg-white text-gray-800 hover:text-teal-600 transition shadow">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-3 space-y-1.5 border-t border-gray-100">
                <p
                  onClick={() => handleOpenInspect(item)}
                  className="text-xs font-semibold text-gray-800 truncate cursor-pointer hover:text-teal-600"
                  title={item.filename}
                >
                  {item.filename}
                </p>
                <p className="text-[11px] text-gray-400">
                  {formatBytes(item.filesize)}
                </p>

                <div className="pt-1 flex items-center justify-between border-t border-gray-100 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="text-gray-500 hover:text-teal-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-teal-600 font-bold text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy URL</span>
                      </>
                    )}
                  </button>

                  {item.id.startsWith("media-upload-") && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List / Table View */
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Thumbnail</th>
                <th className="py-3 px-4">Filename &amp; Alt</th>
                <th className="py-3 px-4">Size &amp; Type</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-2.5 px-4 w-16">
                    <div
                      onClick={() => handleOpenInspect(item)}
                      className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 cursor-pointer flex items-center justify-center shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-4 max-w-xs">
                    <p
                      onClick={() => handleOpenInspect(item)}
                      className="font-semibold text-gray-900 truncate cursor-pointer hover:text-teal-600"
                    >
                      {item.filename}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {item.alt || "No alt text set"}
                    </p>
                  </td>
                  <td className="py-2.5 px-4 text-gray-600">
                    <p className="font-mono">{formatBytes(item.filesize)}</p>
                    <p className="text-[11px] text-gray-400">{item.mimeType}</p>
                  </td>
                  <td className="py-2.5 px-4 text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="px-2.5 py-1 rounded border border-gray-200 text-gray-700 hover:border-teal-500 hover:text-teal-700 transition"
                    >
                      {copiedId === item.id ? "Copied!" : "Copy Link"}
                    </button>
                    {item.id.startsWith("media-upload-") && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. INSPECTOR / EDIT DETAILS MODAL */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">
                Media Asset Inspector
              </h3>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inspectItem.url}
                  alt={inspectItem.alt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg font-mono">
                <div>
                  <span className="text-gray-400 block">Filename:</span>
                  <span className="text-gray-800 font-semibold break-all">{inspectItem.filename}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">File Size:</span>
                  <span className="text-gray-800 font-semibold">{formatBytes(inspectItem.filesize)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Caption / Figure Subtitle
                </label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleCopyUrl(inspectItem.url, inspectItem.id)}
                className="text-xs text-teal-700 font-semibold inline-flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Public URL</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInspect}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

