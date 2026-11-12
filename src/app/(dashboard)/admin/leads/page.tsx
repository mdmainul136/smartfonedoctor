"use client";

import { useState, useMemo, useEffect } from "react";
import { useStoreContext } from "@/lib/storeContext";
import {
  Phone,
  Search,
  ExternalLink,
  Plus,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

export type LeadSource =
  | "Google Maps"
  | "Google Search"
  | "Calendly"
  | "ChatGPT / AI"
  | "Yelp"
  | "Instagram"
  | "Facebook"
  | "Walk-in";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Confirmed"
  | "Completed"
  | "Lost / No Show";

export interface Lead {
  id: number;
  name: string;
  device: string;
  issue: string;
  source: LeadSource;
  storeId: number;
  date: string;
  status: LeadStatus;
  phone: string;
  estValue: number;
}

const INITIAL_LEADS: Lead[] = [
  { id: 1, name: "Marcus Johnson", device: "iPhone 15 Pro", issue: "Cracked OLED Screen", source: "Google Maps", storeId: 1, date: "2024-11-10", status: "Confirmed", phone: "+1 (215) 555-1001", estValue: 189 },
  { id: 2, name: "Aliyah Thompson", device: "Samsung Galaxy S23", issue: "Battery Replacement", source: "ChatGPT / AI", storeId: 2, date: "2024-11-10", status: "New", phone: "+1 (215) 555-1002", estValue: 69 },
  { id: 3, name: "David Kim", device: "iPhone 13", issue: "Water Damage Ultrasonic", source: "Google Search", storeId: 3, date: "2024-11-09", status: "Contacted", phone: "+1 (610) 555-1003", estValue: 110 },
  { id: 4, name: "Priya Patel", device: "Google Pixel 8", issue: "USB-C Charging Port", source: "Calendly", storeId: 1, date: "2024-11-09", status: "Completed", phone: "+1 (215) 555-1004", estValue: 69 },
  { id: 5, name: "James Williams", device: "iPhone 15", issue: "Back Glass Laser Repair", source: "Yelp", storeId: 2, date: "2024-11-08", status: "Completed", phone: "+1 (215) 555-1005", estValue: 129 },
  { id: 6, name: "Sarah Chen", device: "Samsung Galaxy A54", issue: "Speaker & Earpiece", source: "Google Maps", storeId: 3, date: "2024-11-08", status: "Lost / No Show", phone: "+1 (610) 555-1006", estValue: 59 },
  { id: 7, name: "Robert Davis", device: "iPhone 12", issue: "Screen Replacement", source: "Facebook", storeId: 1, date: "2024-11-07", status: "Confirmed", phone: "+1 (215) 555-1007", estValue: 139 },
  { id: 8, name: "Maria Garcia", device: "OnePlus 11", issue: "Battery Replacement", source: "Google Maps", storeId: 2, date: "2024-11-07", status: "New", phone: "+1 (215) 555-1008", estValue: 65 },
  { id: 9, name: "Antoine Vance", device: "PS5 Console", issue: "HDMI Port Micro-Soldering", source: "ChatGPT / AI", storeId: 1, date: "2024-11-06", status: "New", phone: "+1 (215) 555-1009", estValue: 149 },
  { id: 10, name: "Elena Rostova", device: "Galaxy Z Fold 4", issue: "Inner Screen Assembly", source: "Walk-in", storeId: 1, date: "2024-11-06", status: "Contacted", phone: "+1 (215) 555-1010", estValue: 249 },
  { id: 11, name: "Malik Washington", device: "iPhone 14", issue: "Camera Lens Replacement", source: "Calendly", storeId: 2, date: "2024-11-05", status: "Confirmed", phone: "+1 (215) 555-1011", estValue: 79 },
  { id: 12, name: "Tariq Hasan", device: "Google Pixel 7", issue: "Battery Drain Fast", source: "Walk-in", storeId: 3, date: "2024-11-05", status: "Completed", phone: "+1 (215) 555-1012", estValue: 65 },
  { id: 13, name: "Chloe Martin", device: "iPhone 13 Pro", issue: "OLED Screen Green Line", source: "ChatGPT / AI", storeId: 1, date: "2024-11-04", status: "Confirmed", phone: "+1 (215) 555-1013", estValue: 219 },
  { id: 14, name: "Brandon Lee", device: "Samsung S22 Ultra", issue: "Cracked Front Glass", source: "Instagram", storeId: 3, date: "2024-11-04", status: "Lost / No Show", phone: "+1 (215) 555-1014", estValue: 189 },
];

const STATUS_PILL: Record<LeadStatus, string> = {
  New: "bg-[#fffbeb] text-[#92400e] border border-[#fde68a]",
  Contacted: "bg-[#eeeeee] text-[#111111]",
  Confirmed: "bg-[#dcfae5] text-[#04250e]",
  Completed: "bg-[#dcfae5] text-[#04250e]",
  "Lost / No Show": "bg-[#ffedea] text-[#831c1e]",
};

const ALL_STATUSES: (LeadStatus | "All")[] = [
  "All",
  "New",
  "Contacted",
  "Confirmed",
  "Completed",
  "Lost / No Show",
];

export default function LeadsPage() {
  const { stores, selectedStoreId, selectedStore, isAllStores } =
    useStoreContext();
  const storeShortName = selectedStore.name.replace("SmartFoneDoctor - ", "");

  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    device: "",
    issue: "",
    source: "Google Maps" as LeadSource,
    estValue: 99,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setEditingLead(null);
        setDeletingLead(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleStatusChange = (id: number, nextStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
    notify(`Status updated to ${nextStatus}.`);
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === editingLead.id ? editingLead : l))
    );
    notify(`Lead for ${editingLead.name} updated.`);
    setEditingLead(null);
  };

  const handleDeleteLead = (id: number) => {
    const target = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
    notify(`Deleted lead for ${target?.name ?? "customer"}.`);
    setDeletingLead(null);
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) return;

    const created: Lead = {
      id: Date.now(),
      name: newLead.name.trim(),
      phone: newLead.phone.trim(),
      device: newLead.device.trim() || "Smartphone",
      issue: newLead.issue.trim() || "Diagnosis / Checkup",
      source: newLead.source,
      storeId: selectedStoreId,
      date: new Date().toISOString().split("T")[0],
      status: "New",
      estValue: Number(newLead.estValue) || 89,
    };

    setLeads([created, ...leads]);
    setNewLead({
      name: "",
      phone: "",
      device: "",
      issue: "",
      source: "Google Maps",
      estValue: 99,
    });
    setShowAddModal(false);
  };

  const scopedLeads = useMemo(() => {
    if (isAllStores) return leads;
    return leads.filter((l) => l.storeId === selectedStoreId);
  }, [leads, isAllStores, selectedStoreId]);

  const filteredLeads = useMemo(() => {
    return scopedLeads.filter((lead) => {
      const matchStatus =
        filterStatus === "All" || lead.status === filterStatus;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.phone.toLowerCase().includes(query) ||
        lead.device.toLowerCase().includes(query) ||
        lead.issue.toLowerCase().includes(query) ||
        lead.source.toLowerCase().includes(query);

      return matchStatus && matchQuery;
    });
  }, [scopedLeads, filterStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = scopedLeads.length;
    const newCount = scopedLeads.filter((l) => l.status === "New").length;
    const confirmedCount = scopedLeads.filter(
      (l) => l.status === "Confirmed"
    ).length;
    const completedCount = scopedLeads.filter(
      (l) => l.status === "Completed"
    ).length;
    const pipelineVal = scopedLeads.reduce((acc, l) => acc + l.estValue, 0);

    return {
      total,
      newCount,
      confirmedCount,
      completedCount,
      pipelineVal,
    };
  }, [scopedLeads]);

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-4 overflow-x-hidden">
      {/* 1. CANVAS TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
            Leads &amp; bookings
          </h1>
          <p className="text-[14px] text-[#5f6368] mt-1">
            {stats.total} repair inquiries for{" "}
            <span className="text-[#111111] font-medium">
              {isAllStores
                ? `all ${stores.length} Philadelphia locations`
                : storeShortName}
            </span>{" "}
            · {stats.newCount} awaiting callback
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={selectedStore.calendlyUrl}
            target="_blank"
            rel="noreferrer"
            className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Open Calendly</span>
            <ExternalLink
              className="w-3 h-3 text-[#6b6b6b]"
              aria-hidden="true"
            />
          </a>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Log inbound lead</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] rounded-[6px] px-3.5 py-2 flex items-center justify-between gap-3 text-[12px]"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notice"
            className="p-0.5 hover:opacity-75 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* 2. DIVIDED KPI STRIP */}
      <section
        aria-label="Lead pipeline metrics"
        className="bg-white border border-[#e8e8e8] rounded-[8px] grid grid-cols-2 lg:grid-cols-4"
      >
        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">
            Total leads ({isAllStores ? "all 3 stores" : storeShortName})
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#111111] tabular-nums leading-none">
              {stats.total}
            </span>
            <span className="text-[12px] text-[#5f6368] tabular-nums">
              ${stats.pipelineVal.toLocaleString()} est. value
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">New inquiries</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {stats.newCount}
            </span>
            <span className="text-[12px] text-[#92400e]">needs callback</span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between border-r border-[#eaeaea]">
          <span className="text-[12px] text-[#5f6368]">Confirmed bookings</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {stats.confirmedCount}
            </span>
            <span className="text-[12px] text-[#247b50]">scheduled</span>
          </div>
        </div>

        <div className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[#5f6368]">Completed repairs</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[24px] font-normal text-[#111111] tabular-nums leading-none">
              {stats.completedCount}
            </span>
            <span className="text-[12px] text-[#5f6368]">picked up</span>
          </div>
        </div>
      </section>

      {/* 3. LEADS TABLE CONTAINER */}
      <section
        aria-label="Repair leads table"
        className="bg-white border border-[#e8e8e8] rounded-[8px] overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            className="flex items-center gap-1.5 flex-wrap"
            role="group"
            aria-label="Filter leads by status"
          >
            {ALL_STATUSES.map((statusKey) => {
              const isSelected = filterStatus === statusKey;
              return (
                <button
                  key={statusKey}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setFilterStatus(statusKey)}
                  className={`h-[28px] px-2.5 rounded-[5px] text-[13px] transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#eeeeee] text-[#111111] font-medium"
                      : "text-[#5f6368] hover:text-[#111111]"
                  }`}
                >
                  {statusKey === "Lost / No Show" ? "Lost" : statusKey}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              className="w-3.5 h-3.5 text-[#6b6b6b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search leads by name, phone, device, or source"
              placeholder="Search name, phone, device…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[32px] w-full sm:w-64 pl-8 pr-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="px-4 py-10 text-center text-[13px] text-[#5f6368]">
            No leads match your current filter.
          </div>
        ) : (
          <>
            {/* Mobile & Tablet Rows (< lg) */}
            <div className="lg:hidden divide-y divide-[#f2f2f2]">
              {filteredLeads.map((lead) => {
                const branchLabel = stores
                  .find((s) => s.id === lead.storeId)
                  ?.name.replace("SmartFoneDoctor - ", "");
                return (
                  <div
                    key={lead.id}
                    className="p-4 flex flex-col gap-2 hover:bg-[#f9f9f9]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium text-[#111111] truncate">
                          {lead.name}
                        </div>
                        <a
                          href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
                          className="text-[12px] text-[#5f6368] hover:text-[#111111] inline-flex items-center gap-1 tabular-nums"
                        >
                          <Phone className="w-3 h-3" aria-hidden="true" />
                          <span>{lead.phone}</span>
                        </a>
                      </div>
                      <span
                        className={`h-[20px] px-2 rounded-[4px] inline-flex items-center text-[12px] font-medium shrink-0 ${
                          STATUS_PILL[lead.status]
                        }`}
                      >
                        {lead.status === "Lost / No Show"
                          ? "Lost"
                          : lead.status}
                      </span>
                    </div>

                    <div className="text-[13px] text-[#111111]">
                      {lead.device} ·{" "}
                      <span className="text-[#5f6368]">{lead.issue}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[12px] text-[#5f6368]">
                      <span className="tabular-nums">
                        {lead.source} · {branchLabel} · ${lead.estValue}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <select
                          aria-label={`Change status for ${lead.name}`}
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(
                              lead.id,
                              e.target.value as LeadStatus
                            )
                          }
                          className="h-[28px] px-2 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] text-[#111111] focus:outline-none focus:border-[#111111]"
                        >
                          {ALL_STATUSES.filter((s) => s !== "All").map((s) => (
                            <option key={s} value={s}>
                              {s === "Lost / No Show" ? "Lost" : s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setEditingLead(lead)}
                          aria-label={`Edit lead for ${lead.name}`}
                          title="Edit lead"
                          className="h-[28px] w-[28px] rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] inline-flex items-center justify-center text-[#5f6368] hover:text-[#111111] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLead(lead)}
                          aria-label={`Delete lead for ${lead.name}`}
                          title="Delete lead"
                          className="h-[28px] w-[28px] rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#fee2e2] inline-flex items-center justify-center text-[#5f6368] hover:text-[#dc2626] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (lg+): 5 balanced table-fixed columns */}
            <div className="hidden lg:block w-full">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="h-[38px] border-b border-[#e5e7eb] text-[12px] font-normal text-[#5f6368]">
                    <th className="px-4 font-normal w-[22%]">Customer</th>
                    <th className="px-4 font-normal w-[24%]">
                      Device &amp; repair issue
                    </th>
                    <th className="px-4 font-normal w-[18%]">
                      Source &amp; branch
                    </th>
                    <th className="px-4 font-normal text-right w-[12%]">
                      Est. value
                    </th>
                    <th className="px-4 font-normal text-right w-[24%]">
                      Actions &amp; status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2f2f2] text-[14px]">
                  {filteredLeads.map((lead) => {
                    const branchLabel = stores
                      .find((s) => s.id === lead.storeId)
                      ?.name.replace("SmartFoneDoctor - ", "");
                    return (
                      <tr
                        key={lead.id}
                        className="h-[58px] hover:bg-[#f9f9f9] transition-colors"
                      >
                        <td className="px-4 py-2 min-w-0">
                          <div className="font-medium text-[#111111] truncate">
                            {lead.name}
                          </div>
                          <a
                            href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
                            className="text-[12px] text-[#5f6368] hover:text-[#111111] inline-flex items-center gap-1 tabular-nums"
                          >
                            <Phone className="w-3 h-3" aria-hidden="true" />
                            <span>{lead.phone}</span>
                          </a>
                        </td>

                        <td className="px-4 py-2 min-w-0">
                          <div className="font-medium text-[#111111] truncate">
                            {lead.device}
                          </div>
                          <div className="text-[12px] text-[#5f6368] truncate">
                            {lead.issue}
                          </div>
                        </td>

                        <td className="px-4 py-2 min-w-0">
                          <div className="text-[13px] text-[#111111] truncate">
                            {lead.source}
                          </div>
                          <div className="text-[12px] text-[#5f6368] truncate tabular-nums">
                            {branchLabel} · {lead.date}
                          </div>
                        </td>

                        <td className="px-4 py-2 text-right font-medium text-[#111111] tabular-nums">
                          ${lead.estValue}
                        </td>

                        <td className="px-4 py-2 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <select
                              aria-label={`Change status for ${lead.name}`}
                              value={lead.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  lead.id,
                                  e.target.value as LeadStatus
                                )
                              }
                              className="h-[28px] px-2 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
                            >
                              {ALL_STATUSES.filter((s) => s !== "All").map(
                                (s) => (
                                  <option key={s} value={s}>
                                    {s === "Lost / No Show" ? "Lost" : s}
                                  </option>
                                )
                              )}
                            </select>
                            <button
                              type="button"
                              onClick={() => setEditingLead(lead)}
                              aria-label={`Edit lead for ${lead.name}`}
                              title="Edit lead"
                              className="h-[28px] w-[28px] rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] inline-flex items-center justify-center text-[#5f6368] hover:text-[#111111] cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingLead(lead)}
                              aria-label={`Delete lead for ${lead.name}`}
                              title="Delete lead"
                              className="h-[28px] w-[28px] rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#fee2e2] inline-flex items-center justify-center text-[#5f6368] hover:text-[#dc2626] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* 4. ADD LEAD MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-lead-title"
        >
          <div className="w-full max-w-md bg-white rounded-[8px] border border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f2f2f2] flex items-center justify-between">
              <div>
                <h2
                  id="add-lead-title"
                  className="text-[16px] font-semibold text-[#111111]"
                >
                  Log inbound repair lead
                </h2>
                <p className="text-[12px] text-[#5f6368] mt-0.5">
                  Assigned to {storeShortName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close dialog"
                className="p-1 rounded-[5px] text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleAddLead}
              className="p-5 flex flex-col gap-3.5 text-[14px]"
            >
              <div>
                <label
                  htmlFor="lead-name"
                  className="block text-[13px] font-medium text-[#111111] mb-1.5"
                >
                  Customer name
                </label>
                <input
                  id="lead-name"
                  type="text"
                  placeholder="e.g., Marcus Johnson"
                  value={newLead.name}
                  onChange={(e) =>
                    setNewLead({ ...newLead, name: e.target.value })
                  }
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="lead-phone"
                  className="block text-[13px] font-medium text-[#111111] mb-1.5"
                >
                  Phone number
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  placeholder="e.g., +1 (215) 555-0199"
                  value={newLead.phone}
                  onChange={(e) =>
                    setNewLead({ ...newLead, phone: e.target.value })
                  }
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="lead-device"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Device model
                  </label>
                  <input
                    id="lead-device"
                    type="text"
                    placeholder="e.g., iPhone 15 Pro"
                    value={newLead.device}
                    onChange={(e) =>
                      setNewLead({ ...newLead, device: e.target.value })
                    }
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-source"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Discovery channel
                  </label>
                  <select
                    id="lead-source"
                    value={newLead.source}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        source: e.target.value as LeadSource,
                      })
                    }
                    className="w-full h-[38px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="Google Maps">Google Maps</option>
                    <option value="Google Search">Google Search</option>
                    <option value="ChatGPT / AI">ChatGPT / AI</option>
                    <option value="Yelp">Yelp</option>
                    <option value="Calendly">Calendly</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="lead-issue"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Repair issue
                  </label>
                  <input
                    id="lead-issue"
                    type="text"
                    placeholder="e.g., Cracked screen"
                    value={newLead.issue}
                    onChange={(e) =>
                      setNewLead({ ...newLead, issue: e.target.value })
                    }
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-val"
                    className="block text-[13px] font-medium text-[#111111] mb-1.5"
                  >
                    Est. job ($)
                  </label>
                  <input
                    id="lead-val"
                    type="number"
                    value={newLead.estValue}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        estValue: Number(e.target.value),
                      })
                    }
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f2f2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
                >
                  Save lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT LEAD MODAL */}
      {editingLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-lead-title"
        >
          <div className="w-full max-w-md bg-white rounded-[8px] border border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#f2f2f2] flex items-center justify-between">
              <div>
                <h2
                  id="edit-lead-title"
                  className="text-[16px] font-semibold text-[#111111]"
                >
                  Edit repair lead
                </h2>
                <p className="text-[12px] text-[#5f6368] mt-0.5">
                  Lead #{editingLead.id} · {editingLead.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingLead(null)}
                aria-label="Close dialog"
                className="p-1 rounded-[5px] text-[#6b6b6b] hover:text-[#111111] hover:bg-[#f2f2f2] cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateLead}
              className="p-5 flex flex-col gap-3.5 text-[14px]"
            >
              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                  Customer name
                </label>
                <input
                  type="text"
                  value={editingLead.name}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, name: e.target.value })
                  }
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={editingLead.phone}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, phone: e.target.value })
                  }
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                    Device model
                  </label>
                  <input
                    type="text"
                    value={editingLead.device}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, device: e.target.value })
                    }
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                    Discovery channel
                  </label>
                  <select
                    value={editingLead.source}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        source: e.target.value as LeadSource,
                      })
                    }
                    className="w-full h-[38px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="Google Maps">Google Maps</option>
                    <option value="Google Search">Google Search</option>
                    <option value="ChatGPT / AI">ChatGPT / AI</option>
                    <option value="Yelp">Yelp</option>
                    <option value="Calendly">Calendly</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                    Repair issue
                  </label>
                  <input
                    type="text"
                    value={editingLead.issue}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, issue: e.target.value })
                    }
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                    Est. value ($)
                  </label>
                  <input
                    type="number"
                    value={editingLead.estValue}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        estValue: Number(e.target.value),
                      })
                    }
                    className="w-full h-[38px] px-3 rounded-[6px] border border-[#e5e7eb] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                    Store location
                  </label>
                  <select
                    value={editingLead.storeId}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        storeId: Number(e.target.value),
                      })
                    }
                    className="w-full h-[38px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name.replace("SmartFoneDoctor - ", "")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#111111] mb-1.5">
                    Lead status
                  </label>
                  <select
                    value={editingLead.status}
                    onChange={(e) =>
                      setEditingLead({
                        ...editingLead,
                        status: e.target.value as LeadStatus,
                      })
                    }
                    className="w-full h-[38px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    {ALL_STATUSES.filter((s) => s !== "All").map((s) => (
                      <option key={s} value={s}>
                        {s === "Lost / No Show" ? "Lost" : s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f2f2]">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="h-[32px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111111] hover:bg-[#f9f9f9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[32px] px-3.5 rounded-[6px] bg-[#1d1f20] hover:bg-[#111111] text-white text-[13px] font-medium cursor-pointer"
                >
                  Update lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DELETE CONFIRMATION MODAL */}
      {deletingLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-lead-title"
        >
          <div className="w-full max-w-sm bg-white rounded-[8px] border border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.12)] p-5 flex flex-col gap-3">
            <h2
              id="delete-lead-title"
              className="text-[15px] font-semibold text-[#111111]"
            >
              Delete repair lead?
            </h2>
            <p className="text-[13px] text-[#5f6368] leading-relaxed">
              Are you sure you want to remove the lead for{" "}
              <strong className="text-[#111111] font-semibold">
                {deletingLead.name}
              </strong>{" "}
              ({deletingLead.device} · ${deletingLead.estValue})? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f2f2f2]">
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
                className="h-[30px] px-3 rounded-[5px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLead(deletingLead.id)}
                className="h-[30px] px-3 rounded-[5px] bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[12px] font-medium cursor-pointer"
              >
                Delete lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
