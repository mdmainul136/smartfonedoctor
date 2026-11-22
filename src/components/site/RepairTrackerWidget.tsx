"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { lookupRepairTicketAction } from "@/actions/leads";
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
  ExternalLink,
  Star,
  Calendar,
  MessageSquare,
} from "lucide-react";

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

export interface RepairTrackerWidgetProps {
  title?: string;
  subtitle?: string;
  demoTicketId?: string;
  demoLastName?: string;
  accentColor?: string;
  secondaryColor?: string;
  showStoreCard?: boolean;
  showPickupChecklist?: boolean;
  customCss?: string;
}

export default function RepairTrackerWidget({
  title = "Check your repair status",
  subtitle = "Checking the live status of your repair is quick and easy at SmartFoneDoctor. Simply enter your Ticket ID and Last Name below.",
  demoTicketId = "SFD-84920",
  demoLastName = "Smith",
  accentColor = "#00807A",
  secondaryColor = "#009691",
  showStoreCard = true,
  showPickupChecklist = true,
}: RepairTrackerWidgetProps) {
  const [ticketId, setTicketId] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawTicket = ticketId.trim();
    const rawLastName = lastName.trim();

    if (!rawTicket) {
      setError("Please enter your Ticket ID (e.g. SFD-10001) or phone number.");
      return;
    }

    const demoMatch = rawTicket.toUpperCase() === (demoTicketId || "SFD-84920").toUpperCase();
    if (demoMatch) {
      setLoading(false);
      setResult({
        ticketId: rawTicket.toUpperCase(),
        lastName: rawLastName || demoLastName || "Smith",
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
            technicianNote:
              "Technician confirmed cracked outer glass and diminished battery cycle health (79%).",
          },
          {
            title: "Repair in Progress",
            subtitle: "Component replacement and precision re-sealing",
            timestamp: "Today, 1:45 PM",
            status: "current",
            technicianNote:
              "OEM OLED panel installed; genuine water-resistant gasket and fresh battery cell replacement underway.",
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
      return;
    }

    setLoading(true);
    try {
      const res = await lookupRepairTicketAction(rawTicket, rawLastName || undefined);
      setLoading(false);

      if (!res.success || !res.ticket) {
        setError(
          res.error ||
            "No matching repair ticket found. Check your Ticket ID (e.g. SFD-10001) or phone number."
        );
        setResult(null);
        return;
      }

      const t = res.ticket;
      const isCompleted = t.status === "Completed";
      const isConfirmed = t.status === "Confirmed";
      const isContacted = t.status === "Contacted";

      const mappedStore = t.store.includes("4016")
        ? {
            name: "SmartFoneDoctor (University City)",
            badge: "Philadelphia Store #2",
            address: "4016 Lancaster Ave, Philadelphia, PA 19104",
            phone: "(215) 598-2090",
            gmbUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
          }
        : t.store.includes("4060")
        ? {
            name: "SmartFoneDoctor (Lancaster Express)",
            badge: "Philadelphia Store #3",
            address: "4060 Lancaster Ave, Philadelphia, PA 19104",
            phone: "(215) 598-2090",
            gmbUrl: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
          }
        : {
            name: "SmartFoneDoctor (Flagship)",
            badge: "Philadelphia Store #1",
            address: "33 S 52nd St, Philadelphia, PA 19139",
            phone: "(215) 598-2090",
            gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
          };

      const progressPercent = isCompleted ? 100 : isConfirmed ? 60 : isContacted ? 40 : 20;
      const statusLabel: TrackingResult["status"] = isCompleted
        ? "Ready for Pickup"
        : isConfirmed
        ? "In Progress"
        : "Diagnostic Inspection";

      setResult({
        ticketId: t.ticketNumber,
        lastName: rawLastName || t.customerName,
        device: t.device,
        service: t.issue,
        checkInDate: t.createdAt,
        estimatedReady: isCompleted ? "Ready for Pickup Now" : "Same-Day Bench Turnaround",
        status: statusLabel,
        progressPercent,
        store: mappedStore,
        timeline: [
          {
            title: "Device Checked In",
            subtitle: "Intake registration & ticket logged",
            timestamp: t.createdAt,
            status: "completed",
            technicianNote: `Logged into bench queue at ${mappedStore.address} for ${t.customerName}.`,
          },
          {
            title: "Diagnostic Inspection",
            subtitle: "Multi-point hardware and circuit verification",
            timestamp: isCompleted || isConfirmed ? "Completed" : isContacted ? "In Progress" : "Queued",
            status: isCompleted || isConfirmed ? "completed" : isContacted ? "current" : "current",
            technicianNote: `Technician inspection scheduled for: ${t.issue}. Call ${mappedStore.phone} for live bench updates.`,
          },
          {
            title: "Repair in Progress",
            subtitle: "Component replacement and precision re-sealing",
            timestamp: isCompleted ? "Completed" : isConfirmed ? "Active on Bench" : "Pending Diagnostic",
            status: isCompleted ? "completed" : isConfirmed ? "current" : "upcoming",
            technicianNote: isCompleted
              ? `Replacement components installed and verified ($${t.estValue} est.).`
              : "Certified parts staged at our ESD bench.",
          },
          {
            title: "Quality Control & Calibration",
            subtitle: "Sensor, touch, charging & audio verification",
            timestamp: isCompleted ? "Passed" : "Pending Repair",
            status: isCompleted ? "completed" : "upcoming",
            technicianNote: "90-day parts and labor warranty active upon QC sign-off.",
          },
          {
            title: "Ready for Customer Pickup",
            subtitle: "Cleaned, sanitized, and ready for collection",
            timestamp: isCompleted ? "Ready Now" : "Same-Day Target",
            status: isCompleted ? "completed" : "upcoming",
            technicianNote: isCompleted
              ? `Ready at ${mappedStore.address}. Bring photo ID and Ticket #${t.ticketNumber}.`
              : `We will text or call when ready at ${mappedStore.address}.`,
          },
        ],
      });
    } catch {
      setLoading(false);
      setError("Could not reach the repair ticket database. Please try again.");
    }
  };

  const handleFillDemo = () => {
    setTicketId(demoTicketId || "SFD-84920");
    setLastName(demoLastName || "Smith");
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

  return (
    <div className="w-full max-w-[1180px] mx-auto py-6 sm:py-8 px-4 sm:px-6">
      {!result ? (
        /* INITIAL SEARCH FORM */
        <div className="w-full rounded-[28px] bg-[#f5f6f8] border border-neutral-200/80 py-12 sm:py-16 px-4 sm:px-8 lg:px-12 mb-10 flex flex-col items-center justify-center transition-all">
          <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">
            {/* Brand Plus Icon */}
            <div className="flex items-center justify-center gap-1 mb-3 select-none">
              <span style={{ color: accentColor }} className="text-2xl font-bold leading-none">
                +
              </span>
              <span style={{ color: secondaryColor }} className="text-lg font-bold leading-none -mt-2">
                +
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1d1c1a] text-center mb-3 tracking-tight">
              {title}
            </h2>

            <p className="text-neutral-600 text-[13px] sm:text-[14px] text-center max-w-lg mb-8 leading-relaxed">
              {subtitle}
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4 text-left">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sfd-tracker-ticket" className="text-[12.5px] font-semibold text-neutral-700">
                  * Ticket ID
                </label>
                <input
                  id="sfd-tracker-ticket"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder={`e.g. ${demoTicketId || "SFD-84920"}`}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm text-[#1d1c1a] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sfd-teal/20 transition shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="sfd-tracker-name" className="text-[12.5px] font-semibold text-neutral-700">
                  * Last Name
                </label>
                <input
                  id="sfd-tracker-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={`e.g. ${demoLastName || "Smith"}`}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-neutral-300 text-sm text-[#1d1c1a] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sfd-teal/20 transition shadow-xs"
                />
              </div>

              <div className="flex flex-col items-center mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: accentColor }}
                  className="w-full sm:w-auto px-10 py-3 rounded-full text-white font-semibold text-[14px] tracking-wide transition-all duration-200 shadow-md hover:brightness-110 active:scale-98 cursor-pointer disabled:opacity-60"
                >
                  {loading ? "Searching Repair Ticket..." : "Check Repair Status"}
                </button>

                <button
                  type="button"
                  onClick={handleFillDemo}
                  style={{ color: secondaryColor }}
                  className="mt-3.5 text-xs hover:underline font-semibold cursor-pointer"
                >
                  Click to try sample demo ticket ({demoTicketId} / {demoLastName})
                </button>
              </div>

              <p className="text-[11px] text-neutral-500 text-center mt-3 leading-relaxed">
                Your Ticket ID is printed on your drop-off receipt and in your booking confirmation text.
              </p>
            </form>
          </div>
        </div>
      ) : (
        /* LIVE STATUS RESULTS VIEW */
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Top Overview Card */}
          <div className="bg-white rounded-[24px] border border-neutral-200/90 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-800 font-mono text-[12px] font-bold">
                    <span>TICKET #{result.ticketId}</span>
                    <button
                      type="button"
                      onClick={handleCopyTicket}
                      title="Copy Ticket ID"
                      className="text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[12px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{result.status}</span>
                  </span>

                  <span className="text-[11.5px] font-semibold text-neutral-500">
                    {result.progressPercent}% Complete
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#1d1c1a] tracking-tight">
                  {result.device}
                </h3>

                <p className="text-[13px] text-neutral-600">
                  <span className="font-semibold text-neutral-800">Customer:</span> {result.lastName}
                  <span className="mx-2 text-neutral-300">•</span>
                  <span className="font-semibold text-neutral-800">Service:</span> {result.service}
                </p>
              </div>

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

            {/* Stepper Bar */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-5 gap-2 sm:gap-4 relative">
                <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-neutral-200 z-0">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${result.progressPercent}%`, backgroundColor: secondaryColor }}
                  />
                </div>

                {result.timeline.map((step, idx) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "current";

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                      <div
                        style={{
                          backgroundColor: isDone ? secondaryColor : undefined,
                          borderColor: isCurrent ? secondaryColor : undefined,
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? "text-white shadow-xs"
                            : isCurrent
                            ? "bg-white border-2 text-neutral-900 shadow-xs"
                            : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                      </div>

                      <div className="mt-2 text-[11px] sm:text-[12px] font-bold text-neutral-900 leading-snug">
                        {step.title}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5 hidden sm:block">
                        {step.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Grid: Timeline vs Store Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Timeline Column */}
            <div className={showStoreCard ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
              <div className="bg-white rounded-[24px] border border-neutral-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <h4 className="text-base font-bold text-[#1d1c1a] border-b border-neutral-100 pb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sfd-teal" />
                  <span>Bench Inspection & Service Timeline</span>
                </h4>

                <div className="space-y-4">
                  {result.timeline.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        step.status === "current"
                          ? "bg-teal-50/50 border-teal-200 shadow-xs"
                          : step.status === "completed"
                          ? "bg-neutral-50/70 border-neutral-200/80"
                          : "bg-white border-dashed border-neutral-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-neutral-900">{step.title}</span>
                        <span className="text-[11px] font-medium text-neutral-500">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-neutral-600 mb-2">{step.subtitle}</p>
                      {step.technicianNote && (
                        <div className="text-[11.5px] text-neutral-700 bg-white p-2.5 rounded-lg border border-neutral-200/80 leading-relaxed">
                          <span className="font-semibold text-neutral-900">Tech Note: </span>
                          {step.technicianNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Store Information Sidebar */}
            {showStoreCard && (
              <div className="lg:col-span-4 space-y-4">
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
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sfd-teal uppercase tracking-wide">
                        {result.store.badge}
                      </span>
                      <h4 className="text-[14px] font-bold text-neutral-900 leading-snug">
                        {result.store.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3 text-[12.5px] text-neutral-600 pt-3 border-t border-neutral-100">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{result.store.address}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                      <a href="tel:+12155982090" className="text-sfd-teal font-bold hover:underline">
                        {result.store.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-5">
                    <a
                      href="tel:+12155982090"
                      style={{ backgroundColor: secondaryColor }}
                      className="w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs text-center transition shadow-xs flex items-center justify-center gap-2 hover:brightness-110"
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

                {showPickupChecklist && (
                  <div className="bg-[#f5fbfb] rounded-[24px] border border-sfd-teal/20 p-5 text-xs text-neutral-700 space-y-2">
                    <div className="flex items-center gap-2 text-sfd-teal font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pickup Checklist</span>
                    </div>
                    <p className="leading-relaxed text-neutral-600">
                      When collecting your repaired device, please bring a valid photo ID and this Ticket Number (
                      <strong>#{result.ticketId}</strong>).
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      All repairs are covered by our 90-day parts and labor warranty.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
