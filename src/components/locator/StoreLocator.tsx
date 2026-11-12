"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Navigation,
  Phone,
  Info,
  Calendar,
  Star,
} from "lucide-react";
import { InteractiveMap, MapStore } from "./InteractiveMap";

const STORES: MapStore[] = [
  {
    id: 1,
    name: "Smart Fone Doctor (Smartphone Doctor)",
    hours: "Open today 10:00 am - 7:00 pm",
    address: "33 S 52nd St",
    cityStateZip: "Philadelphia, PA 19139, United States",
    phone: "(215) 598-2090",
    lat: 39.9575,
    lng: -75.2263,
    gmbPlaceId: "ChIJ_sfd_philly_33s52nd",
    gmbRating: 4.9,
    gmbReviewsCount: 1524,
    gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
  },
  {
    id: 2,
    name: "Smart Fone Doctor",
    hours: "Open today 10:00 am - 7:00 pm",
    address: "4016 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104, United States",
    phone: "(215) 598-2090",
    lat: 39.9628,
    lng: -75.2045,
    gmbPlaceId: "ChIJ_sfd_lancaster_4016",
    gmbRating: 4.9,
    gmbReviewsCount: 880,
    gmbUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
  },
  {
    id: 3,
    name: "Smart FoneDoctor",
    hours: "Open today 10:00 am - 7:00 pm",
    address: "4060 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104, United States",
    phone: "(215) 598-2090",
    lat: 39.9634,
    lng: -75.2058,
    gmbPlaceId: "ChIJ_sfd_lancaster_4060",
    gmbRating: 4.9,
    gmbReviewsCount: 940,
    gmbUrl: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
  },
];

interface StoreLocatorProps {
  isHomePage?: boolean;
  showBreadcrumbs?: boolean;
  title?: string;
  subtitle?: string;
}

export function StoreLocator({
  isHomePage = false,
  showBreadcrumbs = true,
  title,
  subtitle,
}: StoreLocatorProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<number>(1);

  const filteredStores = STORES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cityStateZip.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGeolocate = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setSelectedStoreId(1);
        },
        (err) => {
          console.warn("Geolocation prompt was dismissed or denied:", err.message);
        }
      );
    }
  };

  return (
    <section className={`bg-white ${isHomePage ? "pt-12 sm:pt-16 pb-16" : "pt-6 pb-16"} px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-[1280px] mx-auto">

        {/* 1. Breadcrumbs (Hidden on HomePage, visible on dedicated locations page) */}
        {!isHomePage && showBreadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-neutral-500 font-normal">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-sfd-teal transition-colors">
                  Home
                </Link>
              </li>
              <li>&gt;</li>
              <li>
                <Link href="/locations" className="hover:text-sfd-teal transition-colors">
                  Locations
                </Link>
              </li>
              <li>&gt;</li>
              <li className="text-neutral-700 font-medium" aria-current="page">
                Book a Repair
              </li>
            </ol>
          </nav>
        )}

        {/* 2. Section / Page Header */}
        <div className="mb-8">
          {isHomePage && (
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] font-bold text-sfd-teal uppercase tracking-wider">
                3 Convenient Philadelphia Locations
              </span>
            </div>
          )}

          <h2 className="text-[26px] sm:text-[32px] lg:text-[36px] font-bold text-[#1d1c1a] tracking-tight mb-2">
            {title || (isHomePage ? "Find Your Nearest SmartFoneDoctor Store" : "Book a Repair at SmartFoneDoctor")}
          </h2>

          <p className="text-[13.5px] sm:text-[14.5px] text-neutral-600 font-normal max-w-2xl leading-relaxed">
            {subtitle ||
              (isHomePage
                ? "Walk in anytime or book your repair online. Expert same-day smartphone, tablet, and computer repairs across Philadelphia."
                : "Choose your nearest store below and click \"Book Repair\"")}
          </p>
        </div>

        {/* 3. Main Two-Column Locator Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-neutral-200/90 rounded-[20px] overflow-hidden bg-white shadow-sm">

          {/* Left Column: Search & Cards List */}
          <div className="lg:col-span-5 flex flex-col h-[740px] bg-[#f4f5f7] border-b lg:border-b-0 lg:border-r border-neutral-200">

            {/* Header + Search bar */}
            <div className="p-5 pb-3">
              <h2 className="text-[20px] font-[550] text-[#1d1c1a] tracking-tight mb-3">
                Find a location
              </h2>

              {/* Rounded pill search input with location navigation arrow */}
              <div className="relative flex items-center bg-white rounded-full border border-neutral-300 shadow-xs h-[46px] px-3.5 focus-within:border-neutral-500 transition-colors">
                <Search className="w-4 h-4 text-neutral-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find results by searching for a city, zip code..."
                  aria-label="Search city or zip code"
                  className="w-full text-[13.5px] text-neutral-800 placeholder-neutral-400 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGeolocate}
                  aria-label="Use my current location"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors shrink-0 cursor-pointer"
                  title="Use my current location"
                >
                  <Navigation className="w-3.5 h-3.5 rotate-45" />
                </button>
              </div>

              <div className="mt-2.5 text-[12.5px] text-neutral-500 font-normal">
                {filteredStores.length} location(s) found nearby
              </div>
            </div>

            {/* Store Cards List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 pt-1 space-y-3.5">
              {filteredStores.map((store) => {
                const isSelected = store.id === selectedStoreId;

                return (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStoreId(store.id)}
                    className={`p-5 rounded-[16px] cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-[#252836] text-white shadow-md"
                        : "bg-white text-[#1d1c1a] border border-neutral-200/80 shadow-xs hover:border-neutral-300"
                    }`}
                  >
                    {/* Small Store Tag + GMB Verified */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                        STORE
                      </span>
                      {store.gmbRating && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className={isSelected ? "text-white" : "text-neutral-900"}>
                            {store.gmbRating}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            ({store.gmbReviewsCount})
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Store Title */}
                    <h3
                      className={`text-[15px] sm:text-[16px] font-bold leading-snug mb-2 ${
                        isSelected ? "text-white" : "text-[#1d1c1a]"
                      }`}
                    >
                      {store.name}
                    </h3>

                    {/* Subtle divider on selected */}
                    {isSelected && (
                      <div className="border-b border-neutral-600/60 my-2.5"></div>
                    )}

                    {/* Hours */}
                    <div
                      className={`text-[12.5px] font-semibold mb-1 ${
                        isSelected ? "text-white" : "text-neutral-800"
                      }`}
                    >
                      {store.hours}
                    </div>

                    {/* Address & Phone */}
                    <div
                      className={`text-[12px] leading-relaxed mb-3 ${
                        isSelected ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      <div>{store.address}</div>
                      <div>{store.cityStateZip}</div>
                      <div className="mt-1 font-medium">{store.phone}</div>
                    </div>

                    {/* Action Buttons Row: Call, Directions, Info */}
                    <div className="flex items-center gap-2 mb-3.5">
                      <a
                        href={`tel:${store.phone.replace(/[^0-9]/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "border border-white/60 text-white hover:bg-white/10"
                            : "border border-neutral-800 text-neutral-900 hover:bg-neutral-100"
                        }`}
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>

                      <a
                        href={
                          store.gmbUrl ||
                          `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            `${store.address}, ${store.cityStateZip}`
                          )}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "border border-white/60 text-white hover:bg-white/10"
                            : "border border-neutral-800 text-neutral-900 hover:bg-neutral-100"
                        }`}
                      >
                        <Navigation className="w-3 h-3" />
                        Directions
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStoreId(store.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "border border-white/60 text-white hover:bg-white/10"
                            : "border border-neutral-800 text-neutral-900 hover:bg-neutral-100"
                        }`}
                      >
                        <Info className="w-3 h-3" />
                        Info
                      </button>
                    </div>

                    {/* Big Red Book Repair CTA Button */}
                    <Link
                      href={`/schedule-repair?store=${store.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full py-2.5 px-4 rounded-full bg-[#c8102e] hover:bg-[#b31924] text-white text-[12.5px] font-bold tracking-tight shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Repair
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Clean Location Count Status */}
            <div className="p-3 border-t border-neutral-200/80 bg-[#f4f5f7] flex items-center justify-between text-[12px] text-neutral-500 px-5">
              <span>Showing all {filteredStores.length} stores</span>
              <span className="font-semibold text-sfd-teal">Philadelphia Area</span>
            </div>

          </div>

          {/* Right Column: Real Interactive Map (OpenStreetMap - 100% Free & No Watermark) */}
          <div className="lg:col-span-7 h-[740px] relative bg-[#f4f3f0] overflow-hidden isolate z-0">
            <InteractiveMap
              stores={STORES}
              selectedStoreId={selectedStoreId}
              onSelectStore={(id) => setSelectedStoreId(id)}
              onGeolocateRequest={handleGeolocate}
            />
          </div>

        </div>

      </div>
    </section>
  );
}
