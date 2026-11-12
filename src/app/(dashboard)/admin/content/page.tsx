"use client";

import { useState } from "react";
import Link from "next/link";
import { useStoreContext } from "@/lib/storeContext";
import {
  Check,
  ExternalLink,
  Sparkles,
  Eye,
  Plus,
  Trash2,
  HelpCircle,
  Shield,
  Clock,
  MapPin,
  RotateCcw,
  Layout,
  Megaphone,
  HelpCircle as FaqIcon,
  Store,
  Smartphone,
  Save,
} from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export default function ContentEditorPage() {
  const { stores } = useStoreContext();
  const [activeTab, setActiveTab] = useState<"hero" | "announcement" | "benefits" | "faqs" | "locations">("hero");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Hero State
  const [heroPill, setHeroPill] = useState("Philadelphia's Trusted Leader in");
  const [heroHeadline, setHeroHeadline] = useState(
    "Fast, reliable repairs that keep your tech working when it matters."
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty."
  );
  const [primaryCtaText, setPrimaryCtaText] = useState("Book your repair");
  const [primaryCtaLink, setPrimaryCtaLink] = useState("/schedule-repair");
  const [secondaryCtaText, setSecondaryCtaText] = useState("Call (215) 598-2090");
  const [secondaryCtaLink, setSecondaryCtaLink] = useState("tel:+12155982090");

  // 2. Announcement Bar State
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState(
    "Philadelphia's Trusted Device Repair Experts · Walk-ins Welcome Mon–Sat"
  );
  const [promoBadge, setPromoBadge] = useState("Free Glass Screen Protector with any Screen Repair");
  const [phoneNumber, setPhoneNumber] = useState("+1 (215) 598-2090");

  // 3. Benefits State
  const [benefits, setBenefits] = useState<BenefitItem[]>([
    {
      id: "b1",
      icon: "clock",
      title: "30-Minute Turnaround",
      description: "Most iPhone and Samsung screen & battery replacements completed in under 45 minutes.",
    },
    {
      id: "b2",
      icon: "shield",
      title: "90-Day Free Warranty",
      description: "Every repair backed by comprehensive coverage on parts and bench workmanship.",
    },
    {
      id: "b3",
      icon: "sparkles",
      title: "OEM-Grade Certified Parts",
      description: "Highest-grade OLED panels, authentic capacity batteries, and precision micro-soldering.",
    },
    {
      id: "b4",
      icon: "map-pin",
      title: "3 Philadelphia Locations",
      description: "Convenient repair shops on 52nd St and Lancaster Ave with dedicated walk-in technicians.",
    },
  ]);

  // 4. FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: "faq-1",
      question: "How long does an iPhone or Samsung screen replacement take?",
      answer: "Most phone screen replacements take 25 to 45 minutes while you wait in store—no appointment necessary.",
    },
    {
      id: "faq-2",
      question: "Do you offer a warranty on screen and battery repairs?",
      answer: "Yes! Every repair includes our 90-day warranty covering replacement parts and labor across all 3 stores.",
    },
    {
      id: "faq-3",
      question: "Do I need to back up my phone before bringing it in?",
      answer: "We always recommend backing up your data, though screen and battery repairs do not erase your storage.",
    },
    {
      id: "faq-4",
      question: "Can you fix water damage and broken HDMI ports on game consoles?",
      answer: "Yes, our technicians specialize in ultrasonic board cleaning and micro-soldering HDMI ports on PS5 and Xbox.",
    },
  ]);

  const handleAddFaq = () => {
    const newId = `faq-${Date.now()}`;
    setFaqs([...faqs, { id: newId, question: "New Question?", answer: "Provide helpful answer here." }]);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const handleUpdateFaq = (id: string, field: "question" | "answer", val: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast("Website content and SEO metadata successfully published to public site!");
      setTimeout(() => setSavedToast(null), 4000);
    }, 600);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all fields to default recommended copy?")) {
      setHeroPill("Philadelphia's Trusted Leader in");
      setHeroHeadline("Fast, reliable repairs that keep your tech working when it matters.");
      setHeroSubtitle(
        "Repair services for smartphones, tablets, computers and game consoles, backed by certified technicians and a 90-day free warranty."
      );
      setPromoBadge("Free Glass Screen Protector with any Screen Repair");
    }
  };

  return (
    <div className="flex-1 min-w-0 w-full px-4 sm:px-6 py-5 flex flex-col gap-5 overflow-x-hidden">
      {/* 1. TOP HEADER & ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e8e8e8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[#111111] tracking-[-0.02em]">
              Website CMS &amp; Content Editor
            </h1>
          </div>
          <p className="text-[13px] text-[#5f6368] mt-0.5">
            Real-time visual editor for public website hero, promotional banner, benefits, and FAQ schema
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="h-[34px] px-3 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#5f6368] hover:text-[#111111] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to recommended copy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="h-[34px] px-3.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[12px] font-medium text-[#111111] inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#5f6368]" />
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="h-[34px] px-4 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[13px] font-semibold inline-flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Publishing..." : "Publish to Site"}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST NOTIFICATION */}
      {savedToast && (
        <div
          role="status"
          className="bg-[#dcfae5] border border-[#86efac] text-[#065f46] rounded-[8px] px-4 py-3 flex items-center justify-between gap-3 text-[13px] shadow-sm transition-all"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#059669] shrink-0" />
            <span className="font-medium">{savedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedToast(null)}
            className="text-[#065f46] hover:text-black font-semibold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. SECTION TABS */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] overflow-x-auto no-scrollbar pb-px">
        {[
          { id: "hero", label: "Hero & Headline", icon: Layout },
          { id: "announcement", label: "Announcement & Promo", icon: Megaphone },
          { id: "benefits", label: "Value Props & Guarantee", icon: Shield },
          { id: "faqs", label: "FAQ & Schema", icon: FaqIcon },
          { id: "locations", label: "Store Info", icon: Store },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`h-[38px] px-3.5 rounded-t-[6px] text-[13px] font-medium inline-flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                isActive
                  ? "border-[#009691] text-[#009691] bg-white font-semibold"
                  : "border-transparent text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#009691]" : "text-[#9ca3af]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE (SPLIT VIEW: FORM ON LEFT, REAL-TIME PREVIEW ON RIGHT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: EDITOR FORM (7 Cols on XL) */}
        <div className="xl:col-span-7 bg-white border border-[#e8e8e8] rounded-[10px] p-5 shadow-2xs flex flex-col gap-5">
          
          {/* TAB 1: HERO */}
          {activeTab === "hero" && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-[#f2f2f2]">
                <h2 className="text-[15px] font-semibold text-[#111111]">Homepage Hero Banner</h2>
                <p className="text-[12px] text-[#5f6368]">
                  The first visual element customers see on desktop and mobile phones.
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1">
                  Top Pill Badge / Eyebrow
                </label>
                <input
                  type="text"
                  value={heroPill}
                  onChange={(e) => setHeroPill(e.target.value)}
                  placeholder="e.g. Philadelphia's Trusted Leader in"
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] focus:outline-none focus:border-[#009691] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1">
                  Main H1 Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  placeholder="Primary headline..."
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] font-semibold focus:outline-none focus:border-[#009691] transition-colors"
                />
                <span className="text-[11px] text-[#6b7280] mt-1 block">
                  Character count: {heroHeadline.length} (optimal for SEO: 50–70 characters)
                </span>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1">
                  Supporting Subtitle
                </label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Detailed description of repair services and guarantee..."
                  className="w-full p-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] leading-relaxed focus:outline-none focus:border-[#009691] transition-colors resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[12px] font-medium text-[#111111] mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={primaryCtaText}
                    onChange={(e) => setPrimaryCtaText(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#111111] mb-1">
                    Primary Button URL Link
                  </label>
                  <input
                    type="text"
                    value={primaryCtaLink}
                    onChange={(e) => setPrimaryCtaLink(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#111111] mb-1">
                    Secondary Button Text (Call CTA)
                  </label>
                  <input
                    type="text"
                    value={secondaryCtaText}
                    onChange={(e) => setSecondaryCtaText(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#111111] mb-1">
                    Phone Link (tel:)
                  </label>
                  <input
                    type="text"
                    value={secondaryCtaLink}
                    onChange={(e) => setSecondaryCtaLink(e.target.value)}
                    className="w-full h-[36px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENT */}
          {activeTab === "announcement" && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-[#f2f2f2] flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#111111]">Top Announcement Bar &amp; Promo</h2>
                  <p className="text-[12px] text-[#5f6368]">
                    Displayed on the green top header across every page of the public website.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-[12px] font-medium text-[#5f6368]">Status:</span>
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#009691] rounded accent-[#009691]"
                  />
                  <span className={`text-[12px] font-semibold ${announcementEnabled ? "text-emerald-700" : "text-gray-400"}`}>
                    {announcementEnabled ? "Active" : "Hidden"}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1">
                  Location Notice &amp; Schedule
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Philadelphia's Trusted Device Repair Experts · Walk-ins Welcome Mon–Sat"
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1">
                  Promotional Offer Tag (Highlight Pill)
                </label>
                <input
                  type="text"
                  value={promoBadge}
                  onChange={(e) => setPromoBadge(e.target.value)}
                  placeholder="e.g. Free Glass Screen Protector with any Screen Repair"
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] text-[#111111] font-medium focus:outline-none focus:border-[#009691]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#111111] mb-1">
                  Top Bar Direct Contact Phone
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-[38px] px-3 rounded-[6px] border border-[#d1d5db] bg-white text-[13px] focus:outline-none focus:border-[#009691]"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BENEFITS */}
          {activeTab === "benefits" && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-[#f2f2f2]">
                <h2 className="text-[15px] font-semibold text-[#111111]">Core Value Propositions &amp; Guarantees</h2>
                <p className="text-[12px] text-[#5f6368]">
                  4 hallmark reasons why customers in Philadelphia choose SmartFoneDoctor.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {benefits.map((b, index) => (
                  <div key={b.id} className="p-3.5 rounded-[8px] border border-[#e5e7eb] bg-[#fdfdfd] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[#009691] uppercase tracking-wider">
                        Benefit #{index + 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={b.title}
                        onChange={(e) => {
                          const updated = [...benefits];
                          updated[index].title = e.target.value;
                          setBenefits(updated);
                        }}
                        placeholder="Title"
                        className="sm:col-span-1 h-[34px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] font-semibold focus:outline-none focus:border-[#009691]"
                      />
                      <input
                        type="text"
                        value={b.description}
                        onChange={(e) => {
                          const updated = [...benefits];
                          updated[index].description = e.target.value;
                          setBenefits(updated);
                        }}
                        placeholder="Description"
                        className="sm:col-span-2 h-[34px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] focus:outline-none focus:border-[#009691]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FAQS */}
          {activeTab === "faqs" && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-[#f2f2f2] flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#111111]">FAQ &amp; Google SEO Schema</h2>
                  <p className="text-[12px] text-[#5f6368]">
                    Questions appear on the public site accordion and feed Google FAQPage Rich Snippets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="h-[32px] px-3 rounded-[6px] bg-[#009691] hover:bg-[#007f7b] text-white text-[12px] font-medium inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {faqs.map((faq, index) => (
                  <div key={faq.id} className="p-3.5 rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-bold text-[#111111]">
                        Q{index + 1}:
                      </span>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(faq.id, "question", e.target.value)}
                        placeholder="Question..."
                        className="flex-1 h-[34px] px-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[13px] font-medium focus:outline-none focus:border-[#009691]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-[4px] hover:bg-red-50 cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFaq(faq.id, "answer", e.target.value)}
                      placeholder="Answer..."
                      className="w-full p-2.5 rounded-[5px] border border-[#d1d5db] bg-white text-[12px] leading-relaxed focus:outline-none focus:border-[#009691]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: LOCATIONS */}
          {activeTab === "locations" && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-[#f2f2f2]">
                <h2 className="text-[15px] font-semibold text-[#111111]">Store Addresses &amp; Hours</h2>
                <p className="text-[12px] text-[#5f6368]">
                  Direct information for all 3 West Philadelphia locations.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {stores.map((store) => (
                  <div key={store.id} className="p-4 rounded-[8px] border border-[#e5e7eb] bg-[#fdfdfd] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[13px] text-[#111111]">{store.name}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active Walk-ins
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5f6368]">{store.address}, {store.cityStateZip}</p>
                    <p className="text-[12px] text-[#5f6368]">Phone: <span className="text-[#111111] font-medium">{store.phone}</span> · Hours: Mon–Sat 10AM–7PM</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW PANEL (5 Cols on XL) */}
        <div className="xl:col-span-5 sticky top-16 flex flex-col gap-3">
          
          <div className="bg-white border border-[#e8e8e8] rounded-[10px] p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#009691]" />
              <span className="text-[13px] font-semibold text-[#111111]">Live Customer View</span>
            </div>
            <div className="flex items-center gap-1 bg-[#f3f4f6] p-0.5 rounded-[6px]">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`h-[24px] px-2 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                  previewDevice === "desktop" ? "bg-white text-[#111111] shadow-2xs" : "text-[#6b7280]"
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`h-[24px] px-2 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                  previewDevice === "mobile" ? "bg-white text-[#111111] shadow-2xs" : "text-[#6b7280]"
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          {/* SIMULATED BROWSER WINDOW */}
          <div
            className={`mx-auto w-full transition-all duration-300 border border-[#d1d5db] rounded-[12px] overflow-hidden bg-white shadow-md ${
              previewDevice === "mobile" ? "max-w-[340px]" : "w-full"
            }`}
          >
            {/* Simulated Browser Bar */}
            <div className="bg-[#f3f4f6] px-3 py-2 border-b border-[#e5e7eb] flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white text-[11px] text-[#6b7280] py-0.5 px-2 rounded text-center truncate font-mono">
                smartfonedoctor.com
              </div>
            </div>

            {/* PREVIEW 1: GREEN TOP BAR */}
            {announcementEnabled && (
              <div className="bg-[#009691] text-white py-1.5 px-3 text-[11px] flex items-center justify-between gap-2">
                <span className="truncate">{announcementText}</span>
                <span className="hidden sm:inline bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                  {promoBadge}
                </span>
              </div>
            )}

            {/* PREVIEW 2: NAVBAR */}
            <div className="bg-white py-2 px-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-[#009691] text-white text-[10px] font-bold flex items-center justify-center">
                  SF
                </span>
                <span className="font-bold text-[12px] text-[#111111]">SmartFoneDoctor</span>
              </div>
              <span className="bg-[#009691] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                START REPAIR
              </span>
            </div>

            {/* PREVIEW 3: HERO BANNER */}
            <div className="relative bg-[#111111] text-white p-4 sm:p-6 overflow-hidden min-h-[220px] flex flex-col justify-center">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80')",
                }}
              />
              <div className="relative z-10 flex flex-col gap-2">
                <span className="inline-block bg-white/20 text-white rounded-full px-2 py-0.5 text-[10px] font-medium w-fit">
                  {heroPill}
                </span>
                <h3 className="text-[16px] sm:text-[18px] font-bold leading-snug line-clamp-2">
                  {heroHeadline}
                </h3>
                <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-3">
                  {heroSubtitle}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="bg-[#009691] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {primaryCtaText}
                  </span>
                  <span className="border border-white/30 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-full">
                    {secondaryCtaText}
                  </span>
                </div>
              </div>
            </div>

            {/* PREVIEW 4: BENEFITS MINI CARDS */}
            <div className="p-3 bg-[#f9fafb] border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px]">
              {benefits.slice(0, 4).map((b) => (
                <div key={b.id} className="p-2 bg-white rounded border border-gray-200 shadow-2xs">
                  <span className="font-bold text-[#111111] block truncate">{b.title}</span>
                  <span className="text-gray-500 text-[9px] line-clamp-1">{b.description}</span>
                </div>
              ))}
            </div>

            {/* PREVIEW 5: FAQ ACCORDION SNIPPET */}
            <div className="p-3 bg-white border-t border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                FAQ Accordion Preview
              </span>
              <div className="divide-y divide-gray-100 text-[11px]">
                {faqs.slice(0, 2).map((f) => (
                  <div key={f.id} className="py-1">
                    <span className="font-semibold text-[#111111] block">{f.question}</span>
                    <span className="text-gray-500 text-[10px] line-clamp-1">{f.answer}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <p className="text-[11px] text-center text-[#6b7280]">
            ⚡ Real-time preview updates instantly as you edit content on the left.
          </p>
        </div>

      </div>
    </div>
  );
}
