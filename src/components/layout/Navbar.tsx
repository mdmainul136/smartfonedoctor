"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Tablet,
  Gamepad2,
  Laptop,
  MapPin,
  PhoneCall,
} from 'lucide-react';

type CategoryKey = 'smartphones' | 'tablet' | 'consoles' | 'computers';

const MEGA_MENU_DATA: Record<
  CategoryKey,
  {
    label: string;
    icon: React.ReactNode;
    popularDevices: string[];
    commonIssues: string[];
    brands: { title: string; subtitle: string }[];
    allLinkText: string;
    href: string;
  }
> = {
  smartphones: {
    label: 'Smartphones',
    icon: <Smartphone className="w-6 h-6 text-sfd-teal" />,
    popularDevices: [
      'iPhone 16 Pro Repair',
      'iPhone 15 Repair',
      'iPhone 14 Repair',
      'iPhone 13 Repair',
      'Galaxy S25 Repair',
      'Google Pixel 9 Repair',
    ],
    commonIssues: [
      'Cracked Screen Repair',
      'Phone Battery Replacement',
      'Charging Port Repair',
      'Water Damage Repair',
      'Back Glass Repair',
      'Camera Repair',
      'Speaker & Mic Repair',
    ],
    brands: [
      { title: 'Apple Repair', subtitle: 'All Apple Models' },
      { title: 'Samsung Repair', subtitle: 'All Samsung Models' },
      { title: 'Google Repair', subtitle: 'All Google Models' },
      { title: 'Motorola Repair', subtitle: 'All Motorola Models' },
    ],
    allLinkText: 'All Smartphone Repairs',
    href: '/repairs/smartphone',
  },
  tablet: {
    label: 'Tablets',
    icon: <Tablet className="w-6 h-6 text-sfd-teal" />,
    popularDevices: [
      'iPad Pro 12.9" Repair',
      'iPad Air 5 Repair',
      'iPad 10th Gen Repair',
      'iPad Mini 6 Repair',
      'Galaxy Tab S9 Repair',
      'Surface Pro 9 Repair',
    ],
    commonIssues: [
      'Cracked Digitizer / Glass',
      'Tablet Battery Replacement',
      'Charging Port Repair',
      'LCD Display Replacement',
      'Water Damage Diagnostics',
      'Power & Volume Button Fix',
      'Headphone Jack / Audio Repair',
    ],
    brands: [
      { title: 'Apple iPad Repair', subtitle: 'All iPad Models' },
      { title: 'Samsung Tab Repair', subtitle: 'All Galaxy Tab Models' },
      { title: 'Microsoft Surface', subtitle: 'All Surface Models' },
      { title: 'Amazon Fire Tablet', subtitle: 'All Kindle Fire Models' },
    ],
    allLinkText: 'All Tablet Repairs',
    href: '/repairs/tablet',
  },
  consoles: {
    label: 'Game Console',
    icon: <Gamepad2 className="w-6 h-6 text-sfd-teal" />,
    popularDevices: [
      'PlayStation 5 Repair',
      'PlayStation 4 Pro Repair',
      'Xbox Series X Repair',
      'Xbox Series S Repair',
      'Nintendo Switch OLED',
      'Steam Deck Repair',
    ],
    commonIssues: [
      'HDMI Port Replacement',
      'Overheating & Fan Cleaning',
      'Disc Drive Repair',
      'No Power / Power Supply',
      'Joy-Con Drift Repair',
      'Software & OS Recovery',
      'Controller Port / Jack Repair',
    ],
    brands: [
      { title: 'Sony PlayStation', subtitle: 'PS5 & PS4 Models' },
      { title: 'Microsoft Xbox', subtitle: 'Series X/S & One' },
      { title: 'Nintendo Repair', subtitle: 'Switch, OLED & Lite' },
      { title: 'Valve & Handhelds', subtitle: 'Steam Deck & ROG Ally' },
    ],
    allLinkText: 'All Game Console Repairs',
    href: '/repairs/console/playstation-repair',
  },
  computers: {
    label: 'Computers',
    icon: <Laptop className="w-6 h-6 text-sfd-teal" />,
    popularDevices: [
      'MacBook Pro 14"/16" Repair',
      'MacBook Air M2/M3',
      'Dell XPS & Inspiron',
      'HP Pavilion & Envy',
      'Lenovo ThinkPad Repair',
      'Asus ROG & ZenBook',
    ],
    commonIssues: [
      'Laptop Screen Replacement',
      'Battery Replacement',
      'Keyboard & Trackpad Fix',
      'SSD Upgrade & Data Recovery',
      'Liquid Spill Cleanup',
      'Fan Cleaning & Thermal Paste',
      'Virus Removal & OS Reinstall',
    ],
    brands: [
      { title: 'Apple Mac Repair', subtitle: 'MacBook & iMac Models' },
      { title: 'Windows Laptop Repair', subtitle: 'Dell, HP, Lenovo, Asus' },
      { title: 'Desktop & PC Custom', subtitle: 'Gaming & Workstation PCs' },
      { title: 'Chromebook Repair', subtitle: 'All Chromebook Models' },
    ],
    allLinkText: 'All Computer Repairs',
    href: '/repairs/computer',
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('smartphones');

  const isDashboard =
    pathname?.startsWith('/portal') ||
    pathname?.startsWith('/review') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/list');

  if (isDashboard) return null;

  const isAbout = pathname === '/about' || pathname?.startsWith('/about/');
  const isLocations = pathname?.startsWith('/locations');
  const isTrack = pathname?.startsWith('/track') || pathname?.startsWith('/repair-status');
  const isRepairs = pathname?.startsWith('/repairs') || pathname?.startsWith('/common-issues');

  const closeMegaMenu = () => {
    setMegaMenuOpen(false);
    setActiveCategory('smartphones');
  };

  const currentData = MEGA_MENU_DATA[activeCategory];

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 shadow-xs relative"
      onMouseLeave={closeMegaMenu}
    >
      {/* Container: Max width 1350px, dynamic height */}
      <div className="max-w-[1350px] mx-auto px-3 sm:px-6 flex items-center justify-between h-16 min-h-20">

        {/* 1. Brand Logo */}
        <Link
          href="/"
          onMouseEnter={closeMegaMenu}
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0"
        >
          <Image
            src="/logo-png.jpg"
            alt="SmartFone Doctor Logo"
            width={180}
            height={60}
            priority
            className="h-11 sm:h-14 w-auto object-contain"
          />
        </Link>

        {/* 2. Desktop Navigation Menu */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8 text-[15px] font-medium text-sfd-dark">

          {/* Mega Menu Trigger Button ("Repair") */}
          <div
            className="h-20 flex items-center"
            onMouseEnter={() => setMegaMenuOpen(true)}
          >
            <button
              type="button"
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className={`px-3.5 py-2 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap border ${
                megaMenuOpen
                  ? 'border-sfd-dark bg-white text-sfd-dark'
                  : 'border-transparent hover:text-sfd-teal'
              }`}
            >
              <span>Repair</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  megaMenuOpen ? 'rotate-180 text-sfd-teal' : 'text-neutral-500'
                }`}
              />
            </button>
          </div>

          {/* Dropdown Menu ("Repairs & Services") */}
          <div
            onMouseEnter={closeMegaMenu}
            className="relative group cursor-pointer flex items-center gap-1 hover:text-sfd-teal transition-colors py-2 whitespace-nowrap"
          >
            <Link href="/repairs/iphone">Repairs & Services</Link>
            <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-sfd-teal transition-transform group-hover:rotate-180" />

            {/* Standard Dropdown Box */}
            <div className="absolute top-full left-0 w-56 bg-white text-sfd-dark border border-neutral-200 shadow-lg rounded-md py-2 hidden group-hover:block transition-all z-50">
              <Link href="/repairs/smartphone/iphone-repair" className="block px-4 py-2 hover:bg-neutral-50 hover:text-sfd-teal text-sm">
                iPhone Repair
              </Link>
              <Link href="/repairs/tablet/ipad-repair" className="block px-4 py-2 hover:bg-neutral-50 hover:text-sfd-teal text-sm">
                iPad & Tablet Repair
              </Link>
              <Link href="/repairs/computer/imac-repair" className="block px-4 py-2 hover:bg-neutral-50 hover:text-sfd-teal text-sm">
                iMac & Computer Repair
              </Link>
              <Link href="/repairs/console/playstation-repair" className="block px-4 py-2 hover:bg-neutral-50 hover:text-sfd-teal text-sm">
                Game Console Repair
              </Link>
              <div className="border-t border-neutral-100 my-1"></div>
              <Link href="/common-issues" className="block px-4 py-2 hover:bg-neutral-50 hover:text-[#c8102e] font-semibold text-sm">
                All Common Issues →
              </Link>
            </div>
          </div>

          <Link
            href="/schedule-repair"
            onMouseEnter={closeMegaMenu}
            className="px-3.5 py-1.5 rounded-full bg-sfd-teal/10 text-sfd-teal font-semibold hover:bg-sfd-teal hover:text-white transition-all duration-300 flex items-center gap-2 whitespace-nowrap group cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sfd-teal group-hover:bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sfd-teal group-hover:bg-white"></span>
            </span>
            <span>Free Estimate</span>
          </Link>

          <Link
            href="/locations/i/book-repair"
            onMouseEnter={closeMegaMenu}
            className={`relative py-1 transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-sfd-teal after:transition-all after:duration-300 ${
              isLocations
                ? 'text-sfd-teal font-bold after:w-full'
                : 'hover:text-sfd-teal after:w-0 hover:after:w-full text-sfd-dark'
            }`}
          >
            Locations
          </Link>

          <Link
            href="/track"
            onMouseEnter={closeMegaMenu}
            className={`px-3 py-1 rounded-full border border-sfd-teal font-semibold transition-all duration-300 flex items-center whitespace-nowrap ${
              isTrack
                ? 'bg-sfd-teal text-white shadow-md'
                : 'text-sfd-dark bg-sfd-teal/20 shadow-md shadow-sfd-teal/30 animate-pulse hover:animate-none hover:-translate-y-0.5 hover:scale-105 hover:bg-sfd-teal hover:text-white'
            }`}
          >
            <span>Track Status</span>
          </Link>

          <Link
            href="/about"
            onMouseEnter={closeMegaMenu}
            className={`relative py-1 transition-colors whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-sfd-teal after:transition-all after:duration-300 ${
              isAbout
                ? 'text-sfd-teal font-bold after:w-full'
                : 'hover:text-sfd-teal after:w-0 hover:after:w-full text-sfd-dark'
            }`}
          >
            About Us
          </Link>
        </nav>

        {/* 3. Action Right Area: Phone + CTA Button */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0">
          <Link
            href="/locations/i/book-repair"
            onMouseEnter={closeMegaMenu}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded bg-sfd-teal hover:bg-sfd-dark text-white font-bold text-sm tracking-wide uppercase transition whitespace-nowrap shadow-xs active:scale-95"
          >
            Start Repair
          </Link>
        </div>

        {/* 4. Mobile & Tablet Menu Toggle Button (< xl screens) */}
        <div className="flex xl:hidden items-center gap-2 shrink-0 ml-2">
          <Link
            href="/schedule-repair"
            className="inline-flex sm:hidden px-2.5 py-1.5 rounded bg-sfd-teal text-white font-bold text-[11px] uppercase tracking-wide whitespace-nowrap"
          >
            Start Repair
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-md text-neutral-800 hover:bg-neutral-100 transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* =========================================================
          CPR STYLE FULL-WIDTH MEGA MENU (Desktop)
      ========================================================= */}
      <div
        onMouseEnter={() => setMegaMenuOpen(true)}
        onMouseLeave={closeMegaMenu}
        className={`hidden xl:block w-full bg-[#f5f5f5] absolute left-0 top-full z-50 border-t border-neutral-200 shadow-2xl transition-[opacity,transform] duration-200 ease-in-out origin-top ${
          megaMenuOpen
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-[1350px] mx-auto px-6 py-8 grid grid-cols-12 gap-8 items-stretch">

          {/* LEFT 8 COLUMNS: Categories + 3 Repair Columns */}
          <div className="col-span-8 flex flex-col">

            {/* Top Category Selector Row */}
            <div className="flex items-center gap-4 pb-6 border-b border-neutral-200">
              {(Object.keys(MEGA_MENU_DATA) as CategoryKey[]).map((key) => {
                const item = MEGA_MENU_DATA[key];
                const isActive = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onMouseEnter={() => setActiveCategory(key)}
                    onClick={() => setActiveCategory(key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white text-sfd-dark shadow-xs font-semibold'
                        : 'text-neutral-600 hover:bg-white/60 hover:text-sfd-dark'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                );
              })}
            </div>

            {/* 3 Columns Below: Fixed min-height to guarantee zero layout shift */}
            <div className="grid grid-cols-3 pt-6 min-h-[350px]">

              {/* Col 1: Popular Devices */}
              <div className="pr-6 border-r border-neutral-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-[15px] font-bold text-sfd-dark mb-4">
                    Popular Devices
                  </h4>
                  <ul className="space-y-3.5 text-[14px] text-neutral-600">
                    {currentData.popularDevices.map((device) => (
                      <li key={device}>
                        <Link
                          href={currentData.href}
                          className="hover:text-sfd-teal transition-colors block"
                        >
                          {device}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={currentData.href}
                  className="inline-flex items-center gap-1 mt-5 text-[14px] font-bold text-sfd-dark underline hover:text-sfd-teal"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Col 2: Common Issues */}
              <div className="px-6 border-r border-neutral-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-[15px] font-bold text-sfd-dark mb-4">
                    Common Issues
                  </h4>
                  <ul className="space-y-3.5 text-[14px] text-neutral-600">
                    {currentData.commonIssues.map((issue) => (
                      <li key={issue}>
                        <Link
                          href="/common-issues"
                          className="hover:text-sfd-teal transition-colors block"
                        >
                          {issue}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/common-issues"
                  className="inline-flex items-center gap-1 mt-5 text-[14px] font-bold text-sfd-dark underline hover:text-sfd-teal"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Col 3: By Brand */}
              <div className="pl-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-[15px] font-bold text-sfd-dark mb-4">
                    By Brand
                  </h4>
                  <ul className="space-y-4">
                    {currentData.brands.map((brand) => (
                      <li key={brand.title}>
                        <Link
                          href={currentData.href}
                          className="flex items-center justify-between group"
                        >
                          <div>
                            <p className="text-[14px] font-medium text-neutral-700 group-hover:text-sfd-teal transition-colors">
                              {brand.title}
                            </p>
                            <p className="text-[13px] text-neutral-500">
                              {brand.subtitle}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-sfd-teal group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={currentData.href}
                  className="inline-flex items-center justify-between w-full mt-5 text-[14px] font-bold text-sfd-dark underline hover:text-sfd-teal"
                >
                  <span>{currentData.allLinkText}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>

          {/* RIGHT 4 COLUMNS: "Need your device fixed?" CTA Card */}
          <div className="col-span-4 flex flex-col">
            <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-neutral-100 flex flex-col items-center justify-center flex-1">

              {/* Circular Pin Icon */}
              <div className="w-12 h-12 rounded-full border-2 border-sfd-teal/40 flex items-center justify-center text-sfd-teal mb-4">
                <MapPin className="w-6 h-6" />
              </div>

              <h3 className="text-3xl font-normal text-sfd-dark leading-tight mb-3">
                Need your <br /> device fixed?
              </h3>

              <p className="text-sm text-neutral-600 max-w-xs mb-6 leading-relaxed">
                Find your device, see repair options and book your nearest SmartFone Doctor location.
              </p>

              <div className="w-full space-y-3">
                <Link
                  href="/schedule-repair"
                  className="block w-full py-3.5 px-6 rounded-full bg-sfd-teal hover:opacity-90 text-white font-bold text-sm transition shadow-sm"
                >
                  Book a Repair
                </Link>

                <Link
                  href="/locations/i/book-repair"
                  className="block w-full py-3.5 px-6 rounded-full border border-neutral-400 hover:border-sfd-dark text-sfd-dark font-bold text-sm bg-white hover:bg-neutral-50 transition"
                >
                  Find a Store Near You
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-neutral-200 px-6 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/repairs/smartphone"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-sfd-dark hover:text-sfd-teal"
          >
            Repairs & Services
          </Link>
          <Link
            href="/schedule-repair"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-semibold text-sfd-teal hover:text-sfd-dark flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-sfd-teal inline-block animate-ping" />
            <span>Free Estimate / Book Repair</span>
          </Link>
          <Link
            href="/locations/i/book-repair"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-base transition-colors ${
              isLocations
                ? 'font-bold text-sfd-teal bg-sfd-teal/10 pl-3 py-1.5 rounded-r-md border-l-4 border-sfd-teal'
                : 'font-semibold text-sfd-dark hover:text-sfd-teal'
            }`}
          >
            Locations
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-base transition-colors ${
              isTrack
                ? 'font-bold text-sfd-teal bg-sfd-teal/10 pl-3 py-1.5 rounded-r-md border-l-4 border-sfd-teal'
                : 'font-semibold text-sfd-dark hover:text-sfd-teal'
            }`}
          >
            Track Status
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-base transition-colors ${
              isAbout
                ? 'font-bold text-sfd-teal bg-sfd-teal/10 pl-3 py-1.5 rounded-r-md border-l-4 border-sfd-teal'
                : 'font-semibold text-sfd-dark hover:text-sfd-teal'
            }`}
          >
            About Us
          </Link>

          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-3">
            <a
              href="tel:+12155982090"
              className="flex items-center gap-2 text-base font-bold text-sfd-teal"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call: (215) 598-2090</span>
            </a>

            <Link
              href="/locations/i/book-repair"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 rounded bg-sfd-teal text-white font-bold uppercase tracking-wider"
            >
              Start Repair
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
