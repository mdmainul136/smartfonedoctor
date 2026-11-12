"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useStoreContext } from "@/lib/storeContext";
import {
  Search,
  ChevronDown,
  Check,
  Settings,
  MapPin,
  Layers,
} from "lucide-react";

const Navbar = () => {
  const {
    stores,
    selectedStoreId,
    selectedStore,
    isAllStores,
    setSelectedStoreId,
    setIsAllStores,
  } = useStoreContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  }, []);

  const activeStoreShortName = isAllStores
    ? `All ${stores.length} locations`
    : selectedStore?.name.replace("SmartFoneDoctor - ", "") || "Select location";

  return (
    <header className="h-[48px] shrink-0 flex items-center justify-between px-4 sm:px-6 bg-[#f9fafb] border-b border-[#e8e8e8] sticky top-0 z-30">
      {/* Left: Search control (32px height, 6px radius, white surface with #d1d5db border) */}
      <div className="flex items-center">
        <label htmlFor="topbar-search" className="sr-only">
          Search leads, repair services, or directory listings
        </label>
        <div className="h-[32px] flex items-center gap-2 rounded-[6px] border border-[#d1d5db] bg-white px-2.5 focus-within:border-[#111111] transition-colors">
          <Search
            className="w-3.5 h-3.5 text-[#6b6b6b] shrink-0"
            strokeWidth={1.6}
            aria-hidden="true"
          />
          <input
            id="topbar-search"
            name="search"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="Search leads, services, listings…"
            className="w-36 sm:w-56 lg:w-64 bg-transparent outline-none text-[13px] text-[#111111] placeholder:text-[#6b6b6b]"
          />
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono text-[#6b6b6b] bg-[#f9fafb] border border-[#e5e7eb] rounded-[4px]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Unified Global Location Switcher + Operator Identity */}
      <div className="flex items-center gap-2.5">
        <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={`Location scope: ${activeStoreShortName}. Switch location.`}
            className="h-[32px] inline-flex items-center gap-2 px-2.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f9f9f9] text-[13px] text-[#111111] transition-colors cursor-pointer"
          >
            {isAllStores ? (
              <Layers
                className="w-3.5 h-3.5 text-[#111111] shrink-0"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            ) : (
              <MapPin
                className="w-3.5 h-3.5 text-[#5f6368] shrink-0"
                strokeWidth={1.6}
                aria-hidden="true"
              />
            )}
            <span className="font-medium max-w-[140px] sm:max-w-[210px] truncate">
              {activeStoreShortName}
            </span>
            {!isAllStores && (
              <span className="hidden sm:inline text-[12px] text-[#6b6b6b] tabular-nums">
                ({stores.length})
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#6b6b6b] transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isOpen && (
            <div
              role="menu"
              aria-label="Store locations"
              className="fixed left-16 right-3 top-12 sm:absolute sm:inset-auto sm:right-0 sm:top-10 sm:w-80 bg-white rounded-[8px] border border-[#e5e7eb] shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-1.5 z-50"
            >
              <div className="px-2.5 py-1.5 border-b border-[#f2f2f2] flex items-center justify-between text-[12px] text-[#5f6368]">
                <span>Location scope</span>
                <span className="tabular-nums">Philadelphia ({stores.length})</span>
              </div>

              <div className="py-1 flex flex-col gap-0.5">
                {/* Option 0: All 3 locations (Matrix / Combined view) */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsAllStores(true);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-[6px] flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                    isAllStores
                      ? "bg-[#eeeeee] text-[#111111]"
                      : "hover:bg-[#f9f9f9] text-[#111111]"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">
                      All {stores.length} locations (Matrix view)
                    </div>
                    <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                      Compare 52nd St, 4016 &amp; 4060 Lancaster Ave side by side
                    </div>
                  </div>
                  {isAllStores && (
                    <Check
                      className="w-4 h-4 text-[#111111] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                  )}
                </button>

                <div className="my-0.5 border-t border-[#f2f2f2]" />

                {/* Individual Philadelphia Store Locations */}
                {stores.map((store) => {
                  const isSelected = !isAllStores && store.id === selectedStoreId;
                  const shortName = store.name.replace("SmartFoneDoctor - ", "");
                  return (
                    <button
                      key={store.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setSelectedStoreId(store.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-[6px] flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#eeeeee] text-[#111111]"
                          : "hover:bg-[#f9f9f9] text-[#111111]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium truncate">
                          {shortName}
                        </div>
                        <div className="text-[12px] text-[#5f6368] truncate mt-0.5">
                          {store.address}, {store.cityStateZip}
                        </div>
                      </div>
                      {isSelected && (
                        <Check
                          className="w-4 h-4 text-[#111111] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 border-t border-[#f2f2f2]">
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="h-[30px] px-2.5 rounded-[5px] flex items-center justify-between text-[12px] text-[#5f6368] hover:text-[#111111] hover:bg-[#f9f9f9]"
                >
                  <span>Manage store addresses &amp; hours</span>
                  <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Link to Customer Website (/) */}
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-[30px] px-2.5 rounded-[6px] border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#5f6368] hover:text-[#111111] items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          title="Open Customer Website in a new tab"
        >
          <span>Live site</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#e8e8e8]">
          <span className="w-6 h-6 rounded-full bg-[#e8e8e8] text-[#111111] text-[11px] font-medium flex items-center justify-center">
            DM
          </span>
          <span className="text-[13px] text-[#5f6368]">Dr. Mike</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
