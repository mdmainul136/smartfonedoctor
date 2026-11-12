"use client";

import React, { useState, Suspense, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Check,
  Search,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import Footer from "@/components/layout/Footer";

// Store Data
const STORES = [
  {
    id: 1,
    name: "Smart Fone Doctor (Smartphone Doctor)",
    address: "33 S 52nd St, Philadelphia, PA 19139, United States",
    phone: "2155982090",
    displayPhone: "(215) 598-2090",
  },
  {
    id: 2,
    name: "Smart Fone Doctor",
    address: "4016 Lancaster Ave, Philadelphia, PA 19104, United States",
    phone: "2155982090",
    displayPhone: "(215) 598-2090",
  },
  {
    id: 3,
    name: "Smart FoneDoctor",
    address: "4060 Lancaster Ave, Philadelphia, PA 19104, United States",
    phone: "2155982090",
    displayPhone: "(215) 598-2090",
  },
];

// Step 1 Devices
const DEVICES = [
  {
    id: "smartphone",
    name: "Smartphone Repair",
    imageUrl:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "tablet",
    name: "Tablet Repair",
    imageUrl:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "console",
    name: "Game Console Repair",
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "computer",
    name: "Computer Repair",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "other",
    name: "Other",
    imageUrl:
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&auto=format&fit=crop&q=80",
  },
];

// Step 2 Makes and Models
const MAKES_AND_MODELS: Record<string, Record<string, string[]>> = {
  smartphone: {
    Apple: [
      "iPhone 17e",
      "iPhone 17 Pro Max",
      "iPhone 17 Pro",
      "iPhone 17",
      "iPhone 16e",
      "iPhone 16 Pro Max",
      "iPhone 16 Pro",
      "iPhone 16 Plus",
      "iPhone 16",
      "iPhone 15 Pro Max",
      "iPhone 15 Pro",
      "iPhone 15 Plus",
      "iPhone 15",
      "iPhone 14 Pro Max",
      "iPhone 14 Pro",
      "iPhone 14",
      "iPhone 13 Pro Max",
      "iPhone 13 Pro",
      "iPhone 13",
      "iPhone 12 / 12 Pro",
      "iPhone 11",
    ],
    Samsung: [
      "Galaxy S25 Ultra",
      "Galaxy S25+ / S25",
      "Galaxy S24 Ultra",
      "Galaxy S24+ / S24",
      "Galaxy S23 Series",
      "Galaxy Z Fold 6 / 5",
      "Galaxy Z Flip 6 / 5",
      "Galaxy A Series",
    ],
    Google: [
      "Pixel 9 Pro XL",
      "Pixel 9 Pro / 9",
      "Pixel 8 Pro / 8",
      "Pixel 7 Pro / 7",
      "Pixel 6 Series",
      "Pixel 7a / 8a",
    ],
    Motorola: ["Moto G Stylus", "Moto G Power", "Motorola Edge", "Razr+"],
  },
  tablet: {
    Apple: [
      "iPad Pro 13 (M4)",
      "iPad Pro 11 (M4)",
      "iPad Air 13 / 11 (M2)",
      "iPad 10th Gen",
      "iPad Mini 6 / 7",
    ],
    Samsung: ["Galaxy Tab S9 Ultra", "Galaxy Tab S9 / S9+", "Galaxy Tab S8", "Galaxy Tab A9"],
    Microsoft: ["Surface Pro 10", "Surface Pro 9", "Surface Go 4"],
  },
  console: {
    Sony: ["PlayStation 5 Slim", "PlayStation 5", "PlayStation 4 Pro", "PlayStation 4"],
    Microsoft: ["Xbox Series X", "Xbox Series S", "Xbox One X"],
    Nintendo: ["Nintendo Switch OLED", "Nintendo Switch", "Nintendo Switch Lite"],
  },
  computer: {
    Apple: ["MacBook Pro 16 (M3)", "MacBook Pro 14 (M3)", "MacBook Air 15 / 13", "iMac 24"],
    Dell: ["XPS 15 / 13", "Inspiron Series", "Alienware Gaming"],
    HP: ["Spectre x360", "Envy Series", "Pavilion Series"],
    Lenovo: ["ThinkPad X1 Carbon", "Legion Gaming", "IdeaPad Series"],
  },
  other: {
    Apple: ["Apple Watch Ultra 2", "Apple Watch Series 10", "Apple Watch Series 9"],
    Samsung: ["Galaxy Watch Ultra", "Galaxy Watch 7", "Galaxy Watch 6"],
  },
};

// Step 3 Issues (Matching CPR Screenshot 2)
interface IssueItem {
  id: string;
  name: string;
  imageUrl?: string;
  isCustomIcon?: boolean;
}

const ISSUES_LIST: IssueItem[] = [
  {
    id: "screen",
    name: "Screen Damage",
    imageUrl:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=160&auto=format&fit=crop&q=80",
  },
  {
    id: "charging",
    name: "Charging Issues",
    imageUrl:
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=160&auto=format&fit=crop&q=80",
  },
  {
    id: "power_button",
    name: "Power Button Replacement",
    imageUrl:
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=160&auto=format&fit=crop&q=80",
  },
  {
    id: "camera",
    name: "Rear Camera Lens Damage",
    imageUrl:
      "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=160&auto=format&fit=crop&q=80",
  },
  {
    id: "back_glass",
    name: "Back Housing / Glass Damage",
    imageUrl:
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=160&auto=format&fit=crop&q=80",
  },
  {
    id: "battery",
    name: "Battery Issue",
    imageUrl:
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=160&auto=format&fit=crop&q=80",
  },
  {
    id: "other_issue",
    name: "Other",
  },
];

function ScheduleRepairWizard() {
  const searchParams = useSearchParams();
  const storeIdParam = Number(searchParams.get("store")) || 1;
  const store = STORES.find((s) => s.id === storeIdParam) || STORES[0];

  // Wizard Step: 1 = Device, 2 = Make & Model, 3 = Issues, 4 = Contact, 5 = Thank You
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selections
  const [selectedDevice, setSelectedDevice] = useState<string>("smartphone");
  const [selectedMake, setSelectedMake] = useState<string>("Apple");
  const [selectedModel, setSelectedModel] = useState<string>("iPhone 17e");
  const [modelDropdownOpen, setModelDropdownOpen] = useState<boolean>(false);
  const [modelSearch, setModelSearch] = useState<string>("");

  // Step 3 Selections (Multi-select)
  const [selectedIssues, setSelectedIssues] = useState<string[]>(["screen"]);

  // Step 4 Contact form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPref, setContactPref] = useState<"Call" | "Text" | "Email">("Call");
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  // Sidebar toggle
  const [summaryOpen, setSummaryOpen] = useState(true);

  // Available makes & models for active device
  const availableMakes = useMemo(() => {
    const devMakes = MAKES_AND_MODELS[selectedDevice] || MAKES_AND_MODELS.smartphone;
    return Object.keys(devMakes);
  }, [selectedDevice]);

  const availableModels = useMemo(() => {
    const devMakes = MAKES_AND_MODELS[selectedDevice] || MAKES_AND_MODELS.smartphone;
    return devMakes[selectedMake] || Object.values(devMakes)[0] || [];
  }, [selectedDevice, selectedMake]);

  const filteredModels = useMemo(() => {
    if (!modelSearch) return availableModels;
    return availableModels.filter((m) =>
      m.toLowerCase().includes(modelSearch.toLowerCase())
    );
  }, [availableModels, modelSearch]);

  const toggleIssue = (issueId: string) => {
    if (selectedIssues.includes(issueId)) {
      setSelectedIssues(selectedIssues.filter((id) => id !== issueId));
    } else {
      setSelectedIssues([...selectedIssues, issueId]);
    }
  };

  const getDeviceName = (id: string) => {
    return DEVICES.find((d) => d.id === id)?.name || "Smartphone Repair";
  };

  return (
    <div className="bg-[#f7f8fa] min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto">

        {/* 1. Back to Store link */}
        <div className="mb-4">
          <Link
            href="/locations/i/book-repair"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-neutral-600 hover:text-sfd-teal transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to the Store
          </Link>
        </div>

        {/* 2. Page Title */}
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1d1c1a] tracking-tight mb-6">
          Request a Repair
        </h1>

        {/* 3. Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Store Details + Repair Service Summary */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Store Information Card */}
            <div className="bg-white border border-neutral-200/90 rounded-[14px] p-5 shadow-xs">
              <h3 className="text-[15px] font-bold text-[#1d1c1a] mb-2.5">
                {store.name}
              </h3>

              <div className="flex items-start gap-2.5 text-[12px] text-neutral-600 leading-relaxed mb-2.5">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[12px] text-neutral-700 font-medium">
                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                <a href={`tel:${store.phone}`} className="hover:text-sfd-teal transition-colors">
                  {store.displayPhone}
                </a>
              </div>
            </div>

            {/* Repair Service Summary Card */}
            <div className="bg-white border border-neutral-200/90 rounded-[14px] p-5 shadow-xs">
              <button
                type="button"
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="text-[14px] font-bold text-[#1d1c1a]">
                  Repair service summary
                </h4>
                {summaryOpen ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {summaryOpen && (
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-neutral-500 font-normal">Device Type</span>
                    <span className="font-semibold text-neutral-900">
                      {getDeviceName(selectedDevice)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-neutral-500 font-normal">Make and Model</span>
                    <span className="font-semibold text-neutral-900">
                      {currentStep >= 2 ? `${selectedMake} ${selectedModel}` : "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="text-neutral-500 font-normal">Repair services</span>
                    <span className="font-semibold text-neutral-900">
                      {currentStep >= 3 && selectedIssues.length > 0
                        ? `${selectedIssues.length} Issue Selected ⌵`
                        : "-"}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed pt-2 border-t border-neutral-100">
                    The issue you select gives us a starting point. A technician will complete a full assessment of your device to verify the problem and confirm the repair work required.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Multi-Step Interactive Form Panels */}
          <div className="lg:col-span-8 bg-white border border-neutral-200/90 rounded-[20px] p-6 sm:p-8 shadow-xs min-h-[500px] flex flex-col justify-between">

            {/* ================= STEP 1: SELECT DEVICE ================= */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight mb-1">
                  Please select a device
                </h2>
                <p className="text-[13px] text-neutral-500 mb-8 font-normal">
                  You&apos;ll be guided through the device repair process shortly!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {DEVICES.slice(0, 4).map((device) => (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => {
                        setSelectedDevice(device.id);
                        setCurrentStep(2);
                      }}
                      className="group flex flex-col items-center justify-between p-5 rounded-[16px] border border-neutral-200 bg-white hover:border-sfd-teal hover:shadow-md transition-all duration-200 cursor-pointer h-[190px]"
                    >
                      <div className="w-24 h-24 relative flex items-center justify-center my-auto">
                        <Image
                          src={device.imageUrl}
                          alt={device.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                          sizes="96px"
                        />
                      </div>
                      <span className="text-[13.5px] font-medium text-neutral-800 group-hover:text-sfd-teal transition-colors text-center mt-2">
                        {device.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {DEVICES.slice(4).map((device) => (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => {
                        setSelectedDevice(device.id);
                        setCurrentStep(2);
                      }}
                      className="group flex flex-col items-center justify-between p-5 rounded-[16px] border border-neutral-200 bg-white hover:border-sfd-teal hover:shadow-md transition-all duration-200 cursor-pointer h-[190px]"
                    >
                      <div className="w-24 h-24 relative flex items-center justify-center my-auto">
                        <Image
                          src={device.imageUrl}
                          alt={device.name}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-200"
                          sizes="96px"
                        />
                      </div>
                      <span className="text-[13.5px] font-medium text-neutral-800 group-hover:text-sfd-teal transition-colors text-center mt-2">
                        {device.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= STEP 2: MAKE AND MODEL (Image 1) ================= */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight mb-1">
                  Select your device&apos;s make and model
                </h2>
                <p className="text-[13px] text-neutral-500 mb-8 font-normal leading-relaxed">
                  Pick your device from the list below. If you&apos;re unsure of the exact model, choose the closest match. We&apos;ll confirm details when you arrive.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start mb-12">

                  {/* Make Dropdown */}
                  <div>
                    <label className="block text-[12px] text-neutral-600 mb-1.5 font-normal">
                      * Choose your make
                    </label>
                    <div className="relative">
                      <select
                        value={selectedMake}
                        onChange={(e) => {
                          setSelectedMake(e.target.value);
                          const firstModel =
                            MAKES_AND_MODELS[selectedDevice]?.[e.target.value]?.[0] || "";
                          setSelectedModel(firstModel);
                        }}
                        className="w-full appearance-none bg-white border border-neutral-300 rounded-full h-[46px] px-5 pr-10 text-[14px] text-neutral-800 focus:outline-none focus:border-neutral-500 shadow-xs cursor-pointer"
                      >
                        {availableMakes.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Model Dropdown with Search */}
                  <div>
                    <label className="block text-[12px] text-neutral-600 mb-1.5 font-normal">
                      * Model
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                        className="w-full flex items-center justify-between bg-white border border-neutral-300 rounded-full h-[46px] px-5 text-[14px] text-neutral-800 shadow-xs text-left"
                      >
                        <span>{selectedModel || "Select Model"}</span>
                        {modelDropdownOpen ? (
                          <ChevronUp className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>

                      {/* Dropdown Menu matching Image 1 */}
                      {modelDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-[12px] shadow-xl z-50 overflow-hidden">
                          {/* Search bar inside dropdown */}
                          <div className="p-2.5 border-b border-neutral-100 flex items-center gap-2">
                            <Search className="w-4 h-4 text-neutral-400" />
                            <input
                              type="text"
                              value={modelSearch}
                              onChange={(e) => setModelSearch(e.target.value)}
                              placeholder="Search..."
                              className="w-full text-xs text-neutral-800 focus:outline-none placeholder-neutral-400"
                              autoFocus
                            />
                          </div>

                          {/* List of Models */}
                          <div className="max-h-[220px] overflow-y-auto py-1">
                            {filteredModels.map((m) => {
                              const isChecked = m === selectedModel;
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    setSelectedModel(m);
                                    setModelDropdownOpen(false);
                                    setModelSearch("");
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors ${
                                    isChecked
                                      ? "bg-neutral-100 font-semibold text-neutral-900"
                                      : "text-neutral-700 font-normal"
                                  }`}
                                >
                                  <span>{m}</span>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-neutral-700" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Bottom Navigation Buttons: Back and Continue (CPR Style) */}
                <div className="flex items-center justify-end gap-3 pt-6 sm:pt-8 mt-8 border-t border-neutral-200/80">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-7 py-2.5 rounded-full border border-neutral-300 bg-white text-neutral-800 text-[13.5px] font-medium hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-2.5 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white text-[13.5px] font-medium shadow-xs hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Continue</span>
                    <span className="text-sm font-semibold select-none leading-none">↗</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: ISSUES SELECTION (Image 2) ================= */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight mb-1">
                  Please select the issues you&apos;re experiencing
                </h2>
                <p className="text-[13px] text-neutral-500 mb-8 font-normal leading-relaxed">
                  Select the issue(s) that apply to your device. If you don&apos;t see your exact problem, choose &apos;Other&apos; and describe it briefly
                </p>

                {/* Issues Grid matching Image 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {ISSUES_LIST.map((issue) => {
                    const isChecked = selectedIssues.includes(issue.id);
                    return (
                      <div
                        key={issue.id}
                        onClick={() => toggleIssue(issue.id)}
                        className={`relative p-4 rounded-[16px] border bg-white flex flex-col items-center justify-between h-[180px] cursor-pointer transition-all duration-200 ${
                          isChecked
                            ? "border-amber-400 shadow-sm ring-1 ring-amber-400"
                            : "border-neutral-200/90 hover:border-neutral-300"
                        }`}
                      >
                        {/* Checkbox in top-right */}
                        <div className="w-full flex justify-end">
                          <div
                            className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-amber-400 border-amber-500 text-white"
                                : "border-neutral-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Centered Graphic / Image */}
                        <div className="my-auto flex items-center justify-center">
                          {issue.imageUrl ? (
                            <div className="w-16 h-16 relative">
                              <Image
                                src={issue.imageUrl}
                                alt={issue.name}
                                fill
                                className="object-contain"
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 bg-neutral-900 rounded-[10px] text-white flex items-center justify-center text-xl font-bold">
                              ?
                            </div>
                          )}
                        </div>

                        {/* Label */}
                        <div className="text-[12.5px] font-medium text-neutral-800 text-center leading-snug">
                          {issue.name}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons: Back and Continue (CPR Style) */}
                <div className="flex items-center justify-end gap-3 pt-6 sm:pt-8 mt-8 border-t border-neutral-200/80">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-7 py-2.5 rounded-full border border-neutral-300 bg-white text-neutral-800 text-[13.5px] font-medium hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={selectedIssues.length === 0}
                    onClick={() => setCurrentStep(4)}
                    className="px-8 py-2.5 rounded-full bg-[#c8102e] hover:bg-[#a60d26] disabled:opacity-50 text-white text-[13.5px] font-medium shadow-xs hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <span>Continue</span>
                    <span className="text-sm font-semibold select-none leading-none">↗</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: CONTACT INFORMATION (Image 3) ================= */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-bold text-[#1d1c1a] tracking-tight mb-1">
                  Contact Information
                </h2>
                <p className="text-[13px] text-neutral-500 mb-8 font-normal leading-relaxed">
                  Please enter your contact information. We&apos;ll use this to follow up and help coordinate your repair.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (firstName && lastName && email && phone) {
                      setCurrentStep(5);
                    }
                  }}
                  className="space-y-5"
                >
                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] text-neutral-600 mb-1.5">
                        * First name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="w-full h-[46px] px-4 rounded-full border border-neutral-300 text-[13.5px] text-neutral-800 focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-neutral-600 mb-1.5">
                        * Last name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="w-full h-[46px] px-4 rounded-full border border-neutral-300 text-[13.5px] text-neutral-800 focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] text-neutral-600 mb-1.5">
                        * Email address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full h-[46px] px-4 rounded-full border border-neutral-300 text-[13.5px] text-neutral-800 focus:outline-none focus:border-neutral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] text-neutral-600 mb-1.5">
                        * Mobile number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 123 124 423"
                        className="w-full h-[46px] px-4 rounded-full border border-neutral-300 text-[13.5px] text-neutral-800 focus:outline-none focus:border-neutral-500"
                      />
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div className="pt-2">
                    <label className="block text-[12.5px] font-medium text-neutral-800 mb-2">
                      How would you prefer we contact you?
                    </label>
                    <div className="flex items-center gap-6 text-[13px] text-neutral-700">
                      {(["Call", "Text", "Email"] as const).map((method) => (
                        <label key={method} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="contactPref"
                            checked={contactPref === method}
                            onChange={() => setContactPref(method)}
                            className="text-[#c8102e] focus:ring-[#c8102e]"
                          />
                          <span>{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Opt-in Marketing Checkbox */}
                  <div className="pt-2 border-t border-neutral-100">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketingOptIn}
                        onChange={(e) => setMarketingOptIn(e.target.checked)}
                        className="mt-0.5 rounded text-[#c8102e] focus:ring-[#c8102e]"
                      />
                      <span className="text-[12.5px] text-neutral-800 font-medium">
                        Yes, email me coupons and special offers from SmartFoneDoctor.
                      </span>
                    </label>

                    <p className="text-[11px] text-neutral-400 leading-relaxed mt-2 pl-6">
                      By opting in, you agree to receive marketing emails from SmartFoneDoctor, including promotions, offers, and updates. You can unsubscribe at any time using the link in our emails.
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed mt-1 pl-6">
                      If you select text (SMS), you agree to receive messages related to your repair request. Message frequency will vary. Message and data rates may apply. Reply STOP to opt out or HELP for help.
                    </p>
                  </div>

                  {/* Bottom Navigation Buttons: Back and Continue (CPR Style) */}
                  <div className="flex items-center justify-end gap-3 pt-6 sm:pt-8 mt-8 border-t border-neutral-200/80">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-7 py-2.5 rounded-full border border-neutral-300 bg-white text-neutral-800 text-[13.5px] font-medium hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-2.5 rounded-full bg-[#c8102e] hover:bg-[#a60d26] text-white text-[13.5px] font-medium shadow-xs hover:shadow transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>Continue</span>
                      <span className="text-sm font-semibold select-none leading-none">↗</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= STEP 5: SUCCESS RECAP (Image 4) ================= */}
            {currentStep === 5 && (
              <div className="py-6 flex flex-col justify-between h-full">
                <div className="text-center max-w-xl mx-auto">

                  {/* Decorative Red & Teal Cross / Star Icon */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <span className="text-[#c8102e] font-black text-xl leading-none">+</span>
                    <span className="text-sfd-teal font-black text-xs leading-none">*</span>
                  </div>

                  <h2 className="text-[26px] sm:text-[30px] font-bold text-[#1d1c1a] tracking-tight mb-4">
                    Thank you for submitting your information
                  </h2>

                  <p className="text-[13.5px] text-neutral-600 leading-relaxed mb-6 font-normal">
                    A store associate will contact you to gather any additional details and share your price quote, then walk you through next steps. You can also call or stop by your local store if you have questions or prefer in-person assistance.
                  </p>

                  <p className="text-[14px] font-bold text-neutral-900 mb-6">
                    Want your repair done sooner? Book your appointment now to skip the wait.
                  </p>

                  {/* Gray Customer Recap Box matching Image 4 */}
                  <div className="bg-[#f4f5f7] rounded-[14px] p-5 mb-8 text-left grid grid-cols-1 sm:grid-cols-3 gap-4 border border-neutral-200/80">
                    <div>
                      <div className="text-[11.5px] font-bold text-neutral-800 mb-1">Name</div>
                      <div className="text-[12.5px] text-neutral-600 font-medium">
                        {firstName} {lastName}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11.5px] font-bold text-neutral-800 mb-1">Email Address</div>
                      <div className="text-[12.5px] text-neutral-600 break-all font-medium">
                        {email}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11.5px] font-bold text-neutral-800 mb-1">Mobile Number</div>
                      <div className="text-[12.5px] text-neutral-600 font-medium">
                        {phone}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Red CTA Button matching Image 4 */}
                <div className="flex justify-end pt-6 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => {
                      alert("Appointment successfully registered! See you at SmartFoneDoctor.");
                      setCurrentStep(1);
                    }}
                    className="px-8 py-3 rounded-full bg-[#c8102e] hover:bg-[#b31924] text-white text-[13px] font-bold shadow-md transition-colors"
                  >
                    Schedule my Repair
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ScheduleRepairPage() {
  return (
    <main>
      <Suspense fallback={<div className="p-10 text-center">Loading repair request...</div>}>
        <ScheduleRepairWizard />
      </Suspense>
      <Footer />
    </main>
  );
}
