"use client";

import { useState } from "react";
import Link from "next/link";
import { INITIAL_CMS_PAGES, CMSPage } from "@/lib/cmsData";
import {
  FileText,
  Search,
  Plus,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Pencil,
  ArrowUpDown,
} from "lucide-react";

export default function PagesListPage() {
  const [pages, setPages] = useState<CMSPage[]>(INITIAL_CMS_PAGES);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPages = pages.filter((page) => {
    const matchCategory = filterCategory === "all" || page.category === filterCategory;
    const matchSearch =
      page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">
              Pages
            </h1>
            <span className="text-[12px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
              {pages.length} total
            </span>
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Manage, edit content, and optimize SEO for all public customer website pages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          <Link
            href="/admin/pages/home"
            className="h-[34px] px-3.5 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Open Page Editor</span>
          </Link>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "All Pages" },
            { id: "Core", label: "Core Site" },
            { id: "Repairs", label: "Repair Services" },
            { id: "Utility", label: "Utility & Booking" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`h-[30px] px-3 rounded-[5px] text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterCategory === cat.id
                  ? "bg-[#111111] text-white font-semibold"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter pages by title or /path..."
            className="w-full h-[32px] pl-8 pr-3 rounded-[6px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
          />
        </div>
      </div>

      {/* 3. SHOPIFY / STRAPI STYLE DATA TABLE */}
      <div className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e8e8e8] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Page Title &amp; Path</th>
              <th className="py-3 px-4 hidden md:table-cell">Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 hidden lg:table-cell">Last Modified</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2f2f2] text-[13px]">
            {filteredPages.map((page) => (
              <tr
                key={page.id}
                className="hover:bg-[#f9fafb] transition-colors group"
              >
                {/* Title & Route */}
                <td className="py-3 px-4">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0 group-hover:text-[#009691] transition-colors" />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/pages/${page.slug}`}
                        className="font-semibold text-[#111111] hover:text-[#009691] transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>{page.name}</span>
                      </Link>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                        {page.path}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-4 hidden md:table-cell">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      page.category === "Repairs"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : page.category === "Core"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {page.category}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{page.status}</span>
                  </span>
                </td>

                {/* Last Modified */}
                <td className="py-3 px-4 hidden lg:table-cell text-[12px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{page.lastEdited}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">by {page.author}</span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={page.path}
                      target="_blank"
                      className="p-1.5 rounded-[4px] hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
                      title="View live page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="h-[28px] px-2.5 rounded-[5px] bg-white border border-[#d1d5db] hover:border-[#111111] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <Pencil className="w-3 h-3 text-gray-500" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPages.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-[13px]">
            No pages match your search or filter.
          </div>
        )}
      </div>
    </div>
  );
}

