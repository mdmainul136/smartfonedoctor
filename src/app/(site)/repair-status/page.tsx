"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Wrench,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Star,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import { JsonLd, buildBreadcrumbSchema } from "@/lib/schema";

interface TimelineStep {
  title: string;
  subtitle: string;
  timestamp: string;
  status: "completed" | "current" | "upcoming";
  technicianNote?: string;
}

interface TrackingResult {
  ticketId: string;
  lastName: string;
  device: string;
  service: string;
  checkInDate: string;
  estimatedReady: string;
  status: "In Progress" | "Ready for Pickup" | "Diagnostic Inspection";
  progressPercent: number;
  store: {
    name: string;
    badge: string;
    address: string;
    phone: string;
    gmbUrl: string;
  };
  timeline: TimelineStep[];
}

export default function RepairStatusPage() {
  const [ticketId, setTicketId] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ticketId.trim() || !lastName.trim()) {
      setError("Please provide both your Ticket ID and Last Name to track status.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setResult({
        ticketId: ticketId.trim().toUpperCase(),
        lastName: lastName.trim(),
        device: "Apple iPhone 15 Pro",
        service: "Screen Damage Repair & Battery Replacement",
        checkInDate: "Today, 11:30 AM",
        estimatedReady: "Today by 4:30 PM",
        status: "In Progress",
        progressPercent: 60,
        store: {
          name: "SmartFoneDoctor (Flagship)",
          badge: "Philadelphia Store #1",
          address: "33 S 52nd St, Philadelphia, PA 19139",
          phone: "(215) 598-2090",
          gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
        },
        timeline: [
          {
            title: "Device Checked In",
            subtitle: "Intake registration & physical condition audit",
            timestamp: "Today, 11:30 AM",
            status: "completed",
            technicianNote: "Device safely logged into secure store vault at 33 S 52nd St.",
          },
          {
            title: "Diagnostic Inspection",
            subtitle: "Full 21-point multi-touch and logic verification",
            timestamp: "Today, 12:15 PM",
            status: "completed",
            technicianNote: "Technician confirmed cracked outer glass and diminished battery cycle health (79%).",
          },
          {
            title: "Repair in Progress",
            subtitle: "Component replacement and precision re-sealing",
            timestamp: "Today, 1:45 PM",
            status: "current",
            technicianNote: "OEM OLED panel installed; genuine water-resistant gasket and fresh battery cell replacement underway.",
          },
          {
            title: "Quality Control & Sensor Calibration",
            subtitle: "FaceID, TrueTone, audio & charging bench tests",
            timestamp: "Estimated ~3:45 PM",
            status: "upcoming",
            technicianNote: "Standard post-assembly bench testing to verify factory performance.",
          },
          {
            title: "Ready for Customer Pickup",
            subtitle: "Cleaned, sanitized, and sealed for collection",
            timestamp: "Estimated ~4:30 PM",
            status: "upcoming",
            technicianNote: "Automated SMS notification will be dispatched when ready.",
          },
        ],
      });
    }, 500);
  };

  const handleFillDemo = () => {
    setTicketId("SFD-84920");
    setLastName("Smith");
    setError(null);
  };

  const handleReset = () => {
    setResult(null);
    setTicketId("");
    setLastName("");
    setError(null);
  };

  const handleCopyTicket = () => {
    if (result) {
      navigator.clipboard.writeText(result.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Repair Status", url: "/repair-status" },
  ]);

  return (
    <main className="bg-[#fcfcfc] min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* 1. Clean Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-[12px] text-neutral-500 font-normal">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li>
              <Link href="/" className="hover:text-sfd-teal transition-colors">
                Home
              </Link>
            </li>
            <li>&gt;</li>
            <li className="text-neutral-700 font-medium" aria-current="page">
              Repair Status
            </li>
          </ol>
        </nav>

        {/* 2. Main Container */}
        {!result ? (
          /* ========================================================
             INITIAL SEARCH FORM VIEW (CLEAN CPR STYLE)
             ======================================================== */
          <div className="w-full rounded-[28px] bg-[#f5f6f8] border border-neutral-200/80 py-12 sm:py-16 px-4 sm:px-8 lg:px-12 mb-16 flex flex-col items-center justify-center transition-all">
            <div className="w-full max-w-xl mx-auto flex flex-col items-center">
              
              {/* Brand Red/Teal Plus Symbol */}
              <div className="flex items-center justify-center gap-1 mb-3 select-none">
                <span className="text-[#c8102e] text-2xl font-bold leading-none">+</span>
                <span className="text-[#009691] text-lg font-bold leading-none -mt-2">+</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1d1c1a] text-center mb-3 tracking-tight">
                Check your repair status
              </h1>

              {/* Subtitle */}
              <p className="text-neutral-600 text-[13px] sm:text-[14px] text-center max-w-lg mb-8 leading-relaxed">
                Checking the live status of your repair is quick and easy at SmartFoneDoctor. Simply enter your Ticket ID and Last Name below.
              </p>

              {/* Form Card */}
              <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Ticket ID */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="ticketId" className="text-[12.5px] font-semibold text-neutral-700">
                    * Ticket ID
                  </label>
                  <input
                    id="ticketId"
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="e.g. SFD-84920"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm text-[#1d1c1a] placeholder:text-neutral-400 focus:outline-none focus:border-sfd-teal focus:ring-2 focus:ring-sfd-teal/20 transition shadow-xs"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="lastName" className="text-[12.5px] font-semibold text-neutral-700">
                    * Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Smith"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm text-[#1d1c1a] placeholder:text-neutral-400 focus:outline-none focus:border-sfd-teal focus:ring-2 focus:ring-sfd-teal/20 transition shadow-xs"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex flex-col items-center mt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-3 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white font-semibold text-[14px] tracking-wide transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? "Searching Repair Ticket..." : "Check Repair Status"}
                  </button>

                  {/* Demo Helper link */}
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="mt-3.5 text-xs text-sfd-teal hover:underline font-semibold cursor-pointer"
                  >
                    Click to try sample demo ticket (SFD-84920 / Smith)
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-neutral-500 text-center mt-3 leading-relaxed">
                  Your Ticket ID is printed on your drop-off receipt and in your booking confirmation text.
                </p>
              </form>
            </div>
          </div>
        ) : (
          /* ========================================================
             CLEAN ULTRA-MODERN REPAIR STATUS VIEW
             ======================================================== */
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            
            {/* Top Overview Card */}
            <div className="bg-white rounded-[24px] border border-neutral-200/90 shadow-sm p-6 sm:p-8">
              
              {/* Header Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Ticket Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-800 font-mono text-[12px] font-bold">
                      <span>TICKET #{result.ticketId}</span>
                      <button
                        type="button"
                        onClick={handleCopyTicket}
                        title="Copy Ticket ID"
                        className="text-neutral-400 hover:text-neutral-700 transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Live Status Pill with pulse dot */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[12px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>{result.status}</span>
                    </span>

                    {/* Completion rate */}
                    <span className="text-[11.5px] font-semibold text-neutral-500">
                      {result.progressPercent}% Complete
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-[#1d1c1a] tracking-tight">
                    {result.device}
                  </h1>

                  <p className="text-[13px] text-neutral-600">
                    <span className="font-semibold text-neutral-800">Customer:</span> {result.lastName}
                    <span className="mx-2 text-neutral-300">•</span>
                    <span className="font-semibold text-neutral-800">Service:</span> {result.service}
                  </p>
                </div>

                {/* Top Right Action: Check Another Ticket */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Check Another Ticket</span>
                  </button>
                </div>
              </div>

              {/* Horizontal 5-Stage Stepper Bar */}
              <div className="pt-6 pb-2">
                <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
                  {/* Connecting Progress Line */}
                  <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-neutral-200 z-0">
                    <div
                      className="h-full bg-sfd-teal transition-all duration-500"
                      style={{ width: `${result.progressPercent}%` }}
                    />
                  </div>

                  {result.timeline.map((step, idx) => {
                    const isDone = step.status === "completed";
                    const isCurrent = step.status === "current";

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isDone
                              ? "bg-sfd-teal text-white shadow-xs"
                              : isCurrent
                              ? "bg-white text-amber-600 border-2 border-amber-500 ring-4 ring-amber-100"
                              : "bg-white text-neutral-400 border border-neutral-300"
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span
                          className={`text-[11px] sm:text-[12px] font-semibold mt-2 line-clamp-1 ${
                            isDone
                              ? "text-neutral-800"
                              : isCurrent
                              ? "text-amber-800 font-bold"
                              : "text-neutral-400"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3 Metric Stat Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-4 border-t border-neutral-100">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Drop-off Time
                  </span>
                  <p className="text-sm font-bold text-neutral-900 mt-0.5">{result.checkInDate}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-sfd-teal/5 border border-sfd-teal/20">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sfd-teal">
                    Target Ready Time
                  </span>
                  <p className="text-sm font-bold text-neutral-900 mt-0.5">{result.estimatedReady}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Assigned Store
                  </span>
                  <p className="text-sm font-bold text-neutral-900 mt-0.5">33 S 52nd St (Flagship)</p>
                </div>
              </div>
            </div>

            {/* Split Section: Timeline Details (Left 7 cols) & Store Contact (Right 5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Vertical Step Activity Log */}
              <div className="lg:col-span-8 bg-white rounded-[24px] border border-neutral-200/90 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    Detailed Repair History
                  </h2>
                  <span className="text-xs text-neutral-500">Live Timestamped Log</span>
                </div>

                {/* Vertical Timeline List */}
                <div className="relative pl-7 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200">
                  {result.timeline.map((step, idx) => {
                    const isDone = step.status === "completed";
                    const isCurrent = step.status === "current";

                    return (
                      <div key={idx} className="relative group">
                        {/* Status Marker */}
                        <div
                          className={`absolute -left-7 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center ring-4 ring-white transition ${
                            isDone
                              ? "bg-sfd-teal text-white"
                              : isCurrent
                              ? "bg-amber-500 text-white ring-amber-100 ring-4"
                              : "bg-neutral-200 text-neutral-400"
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          ) : isCurrent ? (
                            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          )}
                        </div>

                        {/* Timeline Step Card */}
                        <div
                          className={`p-4 rounded-2xl border transition-all ${
                            isCurrent
                              ? "bg-amber-50/40 border-amber-200/80 shadow-xs"
                              : isDone
                              ? "bg-neutral-50/60 border-neutral-200/70"
                              : "bg-white border-neutral-200/50 opacity-60"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-[13.5px] font-bold ${
                                  isCurrent
                                    ? "text-amber-900"
                                    : isDone
                                    ? "text-neutral-900"
                                    : "text-neutral-500"
                                }`}
                              >
                                {step.title}
                              </h3>
                              {isCurrent && (
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                                  In Progress
                                </span>
                              )}
                            </div>
                            <span className="text-[11.5px] font-medium text-neutral-500">
                              {step.timestamp}
                            </span>
                          </div>

                          <p className="text-[12.5px] text-neutral-600 mb-2">
                            {step.subtitle}
                          </p>

                          {step.technicianNote && (
                            <div className="text-[12px] text-neutral-700 bg-white/90 p-2.5 rounded-lg border border-neutral-200/60 leading-relaxed font-sans">
                              <span className="font-semibold text-neutral-900">Note: </span>
                              {step.technicianNote}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Verified Store Information & Contact */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Store Card */}
                <div className="bg-white rounded-[24px] border border-neutral-200/90 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-12 h-12 rounded-xl border border-neutral-200 bg-white p-1 shrink-0 shadow-xs">
                      <Image
                        src="/logo-png.jpg"
                        alt="SmartFoneDoctor Logo"
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1a73e8] border-2 border-white text-white text-[8px] font-bold flex items-center justify-center">
                        ✓
                      </span>
                    </div>

                    <div>
                      <span className="text-[10.5px] font-bold text-sfd-teal uppercase tracking-wide">
                        {result.store.badge}
                      </span>
                      <h3 className="text-[14px] font-bold text-neutral-900 leading-snug">
                        {result.store.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3 text-[12.5px] text-neutral-600 pt-3 border-t border-neutral-100">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{result.store.address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                      <a
                        href="tel:+12155982090"
                        className="text-sfd-teal font-bold hover:underline"
                      >
                        {result.store.phone}
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-5">
                    <a
                      href="tel:+12155982090"
                      className="w-full py-2.5 px-4 rounded-xl bg-sfd-teal hover:bg-sfd-dark text-white font-semibold text-xs text-center transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Technician Directly</span>
                    </a>

                    <a
                      href={result.store.gmbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs text-center transition border border-neutral-200/80 flex items-center justify-center gap-1.5"
                    >
                      <span>Get Store Directions</span>
                      <ExternalLink className="w-3 h-3 text-neutral-500" />
                    </a>
                  </div>
                </div>

                {/* Pickup Instructions Notice */}
                <div className="bg-[#f5fbfb] rounded-[24px] border border-sfd-teal/20 p-5 text-xs text-neutral-700 space-y-2">
                  <div className="flex items-center gap-2 text-sfd-teal font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Pickup Checklist</span>
                  </div>
                  <p className="leading-relaxed text-neutral-600">
                    When collecting your repaired device, please bring a valid photo ID and this Ticket Number (<strong>#{result.ticketId}</strong>).
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    All repairs are covered by our Limited Lifetime Parts & Craftsmanship Warranty.
                  </p>
                </div>

                {/* Post-Repair Retention & Review CTAs */}
                <div className="bg-white rounded-[24px] border border-neutral-200/90 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-[#1d1c1a] font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Customer Experience &amp; Next Steps</span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Once your device is back in your hands, share your feedback or schedule maintenance for other family devices:
                  </p>

                  <div className="space-y-2 pt-1">
                    <Link
                      href="/review"
                      className="w-full py-2.5 px-4 rounded-xl bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Rate Technician &amp; Leave Review</span>
                    </Link>

                    <Link
                      href="/schedule-repair"
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs text-center transition border border-neutral-200/80 flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Book Another Device Repair</span>
                    </Link>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Global Post-Tracking Helpful Resources */}
        <div className="mt-12 rounded-[24px] bg-neutral-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sfd-teal block mb-1">
              SmartFoneDoctor Customer Care
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Have questions about your repair or warranty?
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-lg">
              Check our repair FAQs or visit our store branches across West Philadelphia and University City.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/review"
              className="px-5 py-2.5 rounded-full bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Customer Reviews
            </Link>
            <Link
              href="/faq"
              className="px-5 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition border border-neutral-700"
            >
              View Repair FAQ
            </Link>
            <Link
              href="/schedule-repair"
              className="px-5 py-2.5 rounded-full bg-[#c8102e] hover:bg-[#a00c24] text-white font-bold text-xs uppercase tracking-wider transition"
            >
              New Appointment
            </Link>
          </div>
        </div>

      </div>

      {/* Global Standard Dark Footer */}
      <Footer />
    </main>
  );
}