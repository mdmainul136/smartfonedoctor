"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  Clock,
  Calendar,
  Sparkles,
  FileText,
} from "lucide-react";
import {
  BlogArticle,
  getStoredBlogArticles,
  saveStoredBlogArticles,
  getStoredBlogCategories,
} from "@/lib/blogData";

export default function BlogGuidesDirectoryPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setArticles(getStoredBlogArticles());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete article "${title}"?`)) {
      const updated = articles.filter((a) => a.id !== id);
      setArticles(updated);
      saveStoredBlogArticles(updated);
      showToast(`Deleted "${title}"`);
    }
  };

  const categories = getStoredBlogCategories();

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === "all" || a.categoryId === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1d1c1a] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#00897b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (WordPress Posts & Shopify Blog Posts Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>Website CMS</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Guides &amp; Blog</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
            Repair Bench Guides &amp; Blog Posts
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Every single article has its own dedicated page with rich writing canvas, taxonomy category, and Google SERP SEO preview.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/blog"
            target="_blank"
            className="h-[36px] px-3.5 rounded-[6px] border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
            <span>View Public /blog</span>
          </Link>
          <Link
            href="/admin/blog/new"
            className="h-[36px] px-4 rounded-[6px] bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides by title or keyword..."
              className="w-full h-[34px] pl-9 pr-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-[34px] px-3 rounded-[5px] border border-gray-300 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#00897b]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[34px] px-3 rounded-[5px] border border-gray-300 text-xs bg-white text-gray-700 focus:outline-none focus:border-[#00897b]"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-black">{filtered.length}</span> articles
        </div>
      </div>

      {/* Articles Directory Table (WordPress & Shopify Style) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">SEO Score &amp; Route</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Title & Thumbnail */}
                  <td className="py-3.5 px-4 font-bold text-gray-900 max-w-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <Link
                          href={`/admin/blog/${article.slug}`}
                          className="text-gray-900 hover:text-[#00897b] transition-colors block truncate"
                          title={article.title}
                        >
                          {article.title}
                        </Link>
                        <span className="text-[11px] text-gray-400 font-normal block truncate">
                          {article.excerpt}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {article.categoryName}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        article.status === "Published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>

                  {/* Date & Read Time */}
                  <td className="py-3.5 px-4 text-gray-500">
                    <div>{article.publishedAt}</div>
                    <div className="text-[10px] text-gray-400">{article.readTime}</div>
                  </td>

                  {/* Author */}
                  <td className="py-3.5 px-4 font-medium text-gray-700">
                    {article.author.name}
                  </td>

                  {/* Route & SERP */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#00897b]">
                    <div className="flex items-center gap-1">
                      <span>/blog/{article.slug}</span>
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-[#00897b] p-0.5"
                        title="View live article"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/blog/${article.slug}`}
                        className="h-[28px] px-2.5 rounded bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold inline-flex items-center gap-1 shadow-2xs"
                        title="Open in full-screen editor"
                      >
                        <Edit2 className="w-3 h-3 text-gray-500" />
                        <span>Edit</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(article.id, article.title)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-xs">
                    No articles found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
