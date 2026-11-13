"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Check,
  Eye,
  Plus,
  Trash2,
  AlertTriangle,
  Lightbulb,
  Info,
  ChevronDown,
  Sparkles,
  Search,
  ExternalLink,
  Tag,
  BookOpen,
  Image as ImageIcon,
  Wrench,
  Globe,
  Sliders,
  FileCode,
  PenTool,
} from "lucide-react";
import {
  BlogArticle,
  BlogArticleSection,
  getStoredBlogArticles,
  saveStoredBlogArticles,
  getStoredBlogCategories,
} from "@/lib/blogData";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaModal from "@/components/admin/MediaModal";

interface EditorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostEditorPage({ params }: EditorPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.slug === "new";

  const [editorMode, setEditorMode] = useState<"richtext" | "blocks">("richtext");
  const [featuredMediaOpen, setFeaturedMediaOpen] = useState(false);

  const [article, setArticle] = useState<BlogArticle>({
    id: `post-${Date.now()}`,
    slug: "",
    title: "",
    excerpt: "",
    categoryId: "cat-iphone",
    categoryName: "iPhone Repair Guides",
    tags: ["iPhone", "Repair"],
    featuredImage: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&auto=format&fit=crop&q=80",
    author: {
      name: "Dr. Mike",
      role: "Lead Hardware Technician & Founder",
      avatar: "DM",
    },
    publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: "4 min read",
    status: "Published",
    contentHtml: "",
    sections: [
      {
        id: `sec-${Date.now()}-1`,
        heading: "1. Diagnosis & Common Symptoms",
        body: "Describe the hardware symptoms customers experience before coming to the repair shop...",
        calloutType: "tip",
        calloutText: "Always inspect the charging pins and cable integrity before opening the casing.",
      },
    ],
    seo: {
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      canonicalUrl: "",
    },
    connectedService: {
      title: "Express Hardware Repair",
      price: "From $79",
      bookingUrl: "/schedule-repair",
    },
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [categories, setCategories] = useState(getStoredBlogCategories());

  useEffect(() => {
    const list = getStoredBlogArticles();
    setCategories(getStoredBlogCategories());

    if (!isNew) {
      const found = list.find((a) => a.slug === resolvedParams.slug);
      if (found) {
        // If contentHtml is not present yet, compile initial HTML from sections
        if (!found.contentHtml && found.sections && found.sections.length > 0) {
          const styles = {
            tip: "background: #f0fdfa; border-left: 4px solid #00897b; color: #134e48; padding: 12px 16px; margin: 16px 0; border-radius: 6px;",
            warning: "background: #fef2f2; border-left: 4px solid #dc2626; color: #7f1d1d; padding: 12px 16px; margin: 16px 0; border-radius: 6px;",
            note: "background: #eff6ff; border-left: 4px solid #2563eb; color: #1e3a8a; padding: 12px 16px; margin: 16px 0; border-radius: 6px;",
          };
          const compiled = found.sections
            .map((s) => {
              let calloutHtml = "";
              if (s.calloutType && s.calloutText) {
                const title =
                  s.calloutType === "tip"
                    ? "💡 Technician Tip"
                    : s.calloutType === "warning"
                    ? "⚠️ Technician Warning"
                    : "ℹ️ Important Note";
                calloutHtml = `<div style="${styles[s.calloutType]}"><strong>${title}:</strong> ${s.calloutText}</div>`;
              }
              return `<h2>${s.heading}</h2><p>${s.body}</p>${calloutHtml}`;
            })
            .join("<p><br></p>");
          found.contentHtml = compiled;
        }
        setArticle(found);
      }
    } else {
      // New article default HTML
      setArticle((prev) => ({
        ...prev,
        contentHtml:
          "<h2>1. Overview & Diagnosis</h2><p>Provide clear troubleshooting guidance for customers experiencing this hardware problem...</p><div style=\"background: #f0fdfa; border-left: 4px solid #00897b; color: #134e48; padding: 12px 16px; margin: 16px 0; border-radius: 6px;\"><strong>💡 Technician Tip:</strong> Always back up your data before opening the device casing.</div><h2>2. Recommended Repair Solutions</h2><p>Detail how certified bench technicians resolve this issue with genuine parts and calibration...</p>",
      }));
    }
  }, [resolvedParams.slug, isNew]);

  // Title change with auto-slug
  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setArticle((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === "" || isNew ? generatedSlug : prev.slug,
      seo: {
        ...prev.seo,
        metaTitle: prev.seo.metaTitle || `${val} | SmartFoneDoctor Guide`,
      },
    }));
  };

  // Category select
  const handleCategoryChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    setArticle((prev) => ({
      ...prev,
      categoryId: catId,
      categoryName: cat?.name || "Hardware Guide",
    }));
  };

  // Section Management (for blocks mode)
  const handleAddSection = () => {
    const newSec: BlogArticleSection = {
      id: `sec-${Date.now()}`,
      heading: `${article.sections.length + 1}. Step or Diagnostic Focus`,
      body: "",
      calloutType: undefined,
      calloutText: "",
    };
    setArticle((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
  };

  const handleUpdateSection = (idx: number, updates: Partial<BlogArticleSection>) => {
    setArticle((prev) => {
      const updated = [...prev.sections];
      updated[idx] = { ...updated[idx], ...updates };
      return { ...prev, sections: updated };
    });
  };

  const handleRemoveSection = (idx: number) => {
    setArticle((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx),
    }));
  };

  // Save Post
  const handleSave = () => {
    if (!article.title.trim() || !article.slug.trim()) {
      alert("Please provide both an Article Title and a URL slug.");
      return;
    }

    const allArticles = getStoredBlogArticles();
    let updatedList: BlogArticle[];

    if (isNew) {
      updatedList = [article, ...allArticles];
    } else {
      updatedList = allArticles.map((a) =>
        a.id === article.id || a.slug === resolvedParams.slug ? article : a
      );
    }

    saveStoredBlogArticles(updatedList);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (isNew) {
        router.push(`/admin/blog/${article.slug}`);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      
      {/* 1. TOP STICKY CONTROL BAR (Shopify / WordPress Gutenberg Header) */}
      <header className="h-[54px] bg-white border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-40 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="text-gray-500 hover:text-black p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Back to All Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Guides &amp; Blog</span>
            <span className="text-xs text-gray-300">/</span>
            <span className="text-xs font-semibold text-gray-900 max-w-[200px] sm:max-w-xs truncate">
              {article.title || "Untitled Article"}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              article.status === "Published"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {article.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <Link
              href={`/blog/${article.slug}`}
              target="_blank"
              className="h-[32px] px-3 rounded-[5px] border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-gray-500" />
              <span>Preview Live</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="h-[32px] px-4 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved &amp; Published!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Article</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN FULL-SCREEN WORKSPACE */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: WRITING & CONTENT CANVAS (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Title & Slug Box */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wider">
                Article Headline Title *
              </label>
              <input
                type="text"
                value={article.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. When to Replace Your iPhone Battery: Signs, Cycles & Peak Performance"
                className="w-full text-xl sm:text-2xl font-bold text-[#111111] placeholder:text-gray-300 border-none outline-none focus:ring-0 p-0"
              />
            </div>

            {/* URL Slug Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs">
              <span className="font-semibold text-gray-400 font-mono">
                https://smartfonedoctor.com/blog/
              </span>
              <input
                type="text"
                value={article.slug}
                onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                placeholder="your-article-slug"
                className="h-[28px] px-2 rounded border border-gray-200 font-mono text-xs text-[#00897b] font-semibold flex-1 max-w-sm focus:outline-none focus:border-[#00897b]"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Lead Excerpt / Summary *
              </label>
              <textarea
                rows={2}
                value={article.excerpt}
                onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                placeholder="A compelling 1-2 sentence overview of this guide for readers and search engines..."
                className="w-full p-2.5 rounded-[6px] border border-gray-300 text-xs text-gray-700 focus:outline-none focus:border-[#00897b]"
              />
            </div>
          </div>

          {/* Featured Hero Cover Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#00897b]" />
                Featured Hero Image (Media Library)
              </span>
              <span className="text-[11px] text-gray-400">
                1200x630px recommended (16:9 ratio)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={article.featuredImage}
                onChange={(e) => setArticle({ ...article, featuredImage: e.target.value })}
                placeholder="https://images.unsplash.com/... or /uploads/..."
                className="flex-1 h-[34px] px-3 rounded-[5px] border border-gray-300 text-xs font-mono focus:outline-none focus:border-[#00897b]"
              />
              <button
                type="button"
                onClick={() => setFeaturedMediaOpen(true)}
                className="h-[34px] px-3.5 rounded-[5px] bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Browse Media Library</span>
              </button>
            </div>

            {article.featuredImage && (
              <div className="aspect-21/9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 max-h-48 relative group">
                <img
                  src={article.featuredImage}
                  alt="Featured preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFeaturedMediaOpen(true)}
                  className="absolute inset-0 bg-black/40 text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Change Image</span>
                </button>
              </div>
            )}
          </div>

          {/* WYSIWYG RICH TEXT WRITING CANVAS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#111111] flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-[#00897b]" />
                  Payload Rich Text Content Editor
                </h3>
                <p className="text-[11px] text-gray-400">
                  Write freely with full rich text formatting: H2/H3, quotes, technician callouts, images, and links.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-gray-200/80 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEditorMode("richtext")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    editorMode === "richtext"
                      ? "bg-white text-black shadow-2xs"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  WYSIWYG Editor
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("blocks")}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    editorMode === "blocks"
                      ? "bg-white text-black shadow-2xs"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  Section Blocks
                </button>
              </div>
            </div>

            {/* TAB 1: WYSIWYG RICH TEXT EDITOR */}
            {editorMode === "richtext" && (
              <RichTextEditor
                value={article.contentHtml || ""}
                onChange={(html) => setArticle((prev) => ({ ...prev, contentHtml: html }))}
                placeholder="Write your in-depth technician repair guide, troubleshooting steps, and advice here..."
                minHeight="420px"
              />
            )}

            {/* TAB 2: STRUCTURED SECTION BLOCKS (Alternative) */}
            {editorMode === "blocks" && (
              <div className="space-y-4">
                {article.sections.map((sec, idx) => (
                  <div
                    key={sec.id || idx}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4 relative group"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Section #{idx + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        disabled={article.sections.length === 1}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                        title="Remove section block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Subheading (H2)
                      </label>
                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => handleUpdateSection(idx, { heading: e.target.value })}
                        placeholder="e.g. 1. The Truth About the 80% Battery Health Threshold"
                        className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-[#00897b]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Detailed Content &amp; Instructions
                      </label>
                      <textarea
                        rows={5}
                        value={sec.body}
                        onChange={(e) => handleUpdateSection(idx, { body: e.target.value })}
                        placeholder="Write your technician advice, diagnostics steps, or explanation..."
                        className="w-full p-3 rounded-[6px] border border-gray-300 text-xs text-gray-700 leading-relaxed focus:outline-none focus:border-[#00897b]"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          Technician Highlight Alert (Callout Box)
                        </span>
                        <select
                          value={sec.calloutType || ""}
                          onChange={(e) =>
                            handleUpdateSection(idx, {
                              calloutType: (e.target.value as any) || undefined,
                            })
                          }
                          className="h-[28px] px-2 rounded border border-gray-300 text-xs bg-white text-gray-700"
                        >
                          <option value="">None (Standard paragraph)</option>
                          <option value="tip">💡 Technician Tip (Teal Alert)</option>
                          <option value="warning">⚠️ Warning / Danger (Red Alert)</option>
                          <option value="note">ℹ️ Important Note (Blue Alert)</option>
                        </select>
                      </div>

                      {sec.calloutType && (
                        <textarea
                          rows={2}
                          value={sec.calloutText || ""}
                          onChange={(e) => handleUpdateSection(idx, { calloutText: e.target.value })}
                          placeholder="Enter the highlighted tip or warning text..."
                          className="w-full p-2.5 rounded-[5px] border border-amber-300 bg-amber-50/40 text-xs text-gray-800 focus:outline-none focus:border-[#00897b]"
                        />
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSection}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#00897b] bg-white hover:bg-teal-50/20 text-xs font-semibold text-gray-600 hover:text-[#00897b] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Section Block</span>
                </button>
              </div>
            )}
          </div>

          {/* Connected Service Booking Box */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-[#00897b]" />
              Connected Repair Service Booking CTA
            </span>
            <p className="text-[11px] text-gray-400">
              Surfaces an instant booking widget inside the article so readers can book the repair right after reading.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Service Title
                </label>
                <input
                  type="text"
                  value={article.connectedService?.title || ""}
                  onChange={(e) =>
                    setArticle({
                      ...article,
                      connectedService: {
                        ...article.connectedService!,
                        title: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Express iPhone Battery Replacement"
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                  Starting Price Tag
                </label>
                <input
                  type="text"
                  value={article.connectedService?.price || ""}
                  onChange={(e) =>
                    setArticle({
                      ...article,
                      connectedService: {
                        ...article.connectedService!,
                        price: e.target.value,
                      },
                    })
                  }
                  placeholder="From $69"
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INSPECTOR & SEO SIDEBAR (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-5 sticky top-20">
          
          {/* Card 1: Publishing & Taxonomy Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Publishing &amp; Taxonomy
            </h3>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Post Status
              </label>
              <select
                value={article.status}
                onChange={(e) => setArticle({ ...article, status: e.target.value as any })}
                className="w-full h-[34px] px-2.5 rounded border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#00897b]"
              >
                <option value="Published">Published (Live on site)</option>
                <option value="Draft">Draft (Only visible to admin)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Category Taxonomy */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Taxonomy Category *
              </label>
              <select
                value={article.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full h-[34px] px-2.5 rounded border border-gray-300 text-xs bg-white font-semibold text-[#00897b] focus:outline-none focus:border-[#00897b]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Author
              </label>
              <input
                type="text"
                value={article.author.name}
                onChange={(e) =>
                  setArticle({
                    ...article,
                    author: { ...article.author, name: e.target.value },
                  })
                }
                className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
              />
            </div>

            {/* Read Time */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Estimated Read Time
              </label>
              <input
                type="text"
                value={article.readTime}
                onChange={(e) => setArticle({ ...article, readTime: e.target.value })}
                placeholder="4 min read"
                className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={article.tags.join(", ")}
                onChange={(e) =>
                  setArticle({
                    ...article,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="iPhone, Battery, Diagnostics"
                className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
              />
            </div>
          </div>

          {/* Card 2: Google SERP SEO Inspector (Shopify / WordPress Yoast Style) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#00897b]" />
                Google SERP SEO Preview
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live Snippet
              </span>
            </div>

            {/* Google Search Card Preview */}
            <div className="p-3.5 rounded-lg bg-[#f8f9fa] border border-gray-200 space-y-1">
              <div className="text-[11px] text-gray-500 font-mono truncate">
                https://smartfonedoctor.com &gt; blog &gt; {article.slug || "slug"}
              </div>
              <div className="text-[14px] font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 leading-snug">
                {article.seo.metaTitle || article.title || "Article SEO Title"}
              </div>
              <div className="text-[12px] text-[#4d5156] line-clamp-2 leading-relaxed">
                {article.seo.metaDescription || article.excerpt || "Meta description snippet will appear here on Google search results..."}
              </div>
            </div>

            {/* SEO Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    SEO Meta Title
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {(article.seo.metaTitle || article.title).length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={article.seo.metaTitle || ""}
                  onChange={(e) =>
                    setArticle({
                      ...article,
                      seo: { ...article.seo, metaTitle: e.target.value },
                    })
                  }
                  placeholder={article.title}
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Meta Description
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {(article.seo.metaDescription || article.excerpt).length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={article.seo.metaDescription || ""}
                  onChange={(e) =>
                    setArticle({
                      ...article,
                      seo: { ...article.seo, metaDescription: e.target.value },
                    })
                  }
                  placeholder={article.excerpt}
                  className="w-full p-2.5 rounded border border-gray-300 text-xs text-gray-700 focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={article.seo.focusKeyword || ""}
                  onChange={(e) =>
                    setArticle({
                      ...article,
                      seo: { ...article.seo, focusKeyword: e.target.value },
                    })
                  }
                  placeholder="e.g. replace iphone battery"
                  className="w-full h-[32px] px-2.5 rounded border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FEATURED MEDIA LIBRARY MODAL */}
      <MediaModal
        isOpen={featuredMediaOpen}
        onClose={() => setFeaturedMediaOpen(false)}
        onSelect={(payload) => {
          setArticle((prev) => ({
            ...prev,
            featuredImage: payload.url,
            seo: {
              ...prev.seo,
              ogImage: payload.url,
            },
          }));
        }}
        title="Select Featured Hero Image"
        selectButtonText="Set as Featured Image"
        initialSelectedUrl={article.featuredImage}
      />

    </div>
  );
}
