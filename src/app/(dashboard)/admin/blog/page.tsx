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
  X,
  Clock,
  Calendar,
} from "lucide-react";
import {
  BlogPostTaxonomy,
  getStoredBlogs,
  saveStoredBlogs,
} from "@/lib/taxonomy";

export default function BlogGuidesCRUDPage() {
  const [posts, setPosts] = useState<BlogPostTaxonomy[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostTaxonomy | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BlogPostTaxonomy>>({
    title: "",
    slug: "",
    categorySlug: "smartphone",
    categoryName: "Hardware Diagnostics",
    url: "/blog/",
    readTime: "4 min read",
    excerpt: "",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPosts(getStoredBlogs());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenAdd = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      categorySlug: "smartphone",
      categoryName: "Hardware Diagnostics",
      url: "/blog/",
      readTime: "5 min read",
      excerpt: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPostTaxonomy) => {
    setEditingPost(post);
    setFormData({ ...post });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug,
      url: `/common-issues/${prev.categorySlug || "smartphone"}/${slug}`,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    let updated: BlogPostTaxonomy[];
    if (editingPost) {
      updated = posts.map((p) =>
        p.id === editingPost.id ? ({ ...p, ...formData } as BlogPostTaxonomy) : p
      );
      showToast(`Updated "${formData.title}"`);
    } else {
      const newPost: BlogPostTaxonomy = {
        id: `post-${Date.now()}`,
        title: formData.title || "",
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        categorySlug: formData.categorySlug || "smartphone",
        categoryName: formData.categoryName || "Hardware Guide",
        url: formData.url || `/blog/${formData.slug}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        readTime: formData.readTime || "4 min read",
        excerpt: formData.excerpt || "",
      };
      updated = [...posts, newPost];
      showToast(`Published article "${formData.title}"`);
    }

    setPosts(updated);
    saveStoredBlogs(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete article "${title}"?`)) {
      const updated = posts.filter((p) => p.id !== id);
      setPosts(updated);
      saveStoredBlogs(updated);
      showToast(`Deleted "${title}"`);
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1d1c1a] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#00897b]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (Shopify Blog / WordPress Posts Style) */}
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
            Manage educational hardware articles, emergency care tips, and diagnostic guides for customers.
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
          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-[36px] px-4 rounded-[6px] bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Post</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title, topic or excerpt..."
            className="w-full h-[34px] pl-9 pr-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-black">{filtered.length}</span> published guides
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9fafb] text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Article Title</th>
                <th className="py-3 px-4">Topic / Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Read Time</th>
                <th className="py-3 px-4">Canonical Public URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900 max-w-md">
                    <div className="space-y-0.5">
                      <span className="block">{post.title}</span>
                      <span className="text-[11px] text-gray-400 font-normal line-clamp-1">
                        {post.excerpt}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {post.categoryName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {post.date}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {post.readTime}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#00897b]">
                    <Link
                      href={post.url}
                      target="_blank"
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      <span>{post.url}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(post)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-black cursor-pointer"
                        title="Edit post"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                    No articles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT BLOG POST */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-[#111111]">
                {editingPost ? "Edit Guide / Article" : "Add New Blog Article"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. When to Replace Your iPhone Battery"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Category Topic Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoryName || ""}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    placeholder="e.g. iPhone Repair Guide"
                    className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime || ""}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Key summary or takeaway for customers before checking in their device..."
                  className="w-full p-2.5 rounded-[5px] border border-gray-300 text-xs focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Canonical URL / Target Guide Route *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url || ""}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/common-issues/smartphone/battery-depleting-quickly"
                  className="w-full h-[36px] px-3 rounded-[5px] border border-gray-300 text-xs font-mono focus:outline-none focus:border-[#00897b]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-[34px] px-3.5 rounded-[5px] border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded-[5px] bg-[#00897b] hover:bg-[#00796b] text-white text-xs font-semibold"
                >
                  {editingPost ? "Save Changes" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
