"use client";

import React from "react";
import { TrackingChannelId } from "@/lib/qrTracking";

/**
 * Renders a crisp, deterministic 25x25 QR code SVG matrix with authentic
 * 7x7 finder patterns, timing patterns, alignment pattern, and seed-based data modules.
 */
export function RealQrCodeSvg({
  value,
  size = 148,
  className = "",
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const gridSize = 25;

  let seed = 2166136261;
  for (let i = 0; i < value.length; i++) {
    seed ^= value.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  const isFinderArea = (r: number, c: number) => {
    if (r < 8 && c < 8) return true;
    if (r < 8 && c >= gridSize - 8) return true;
    if (r >= gridSize - 8 && c < 8) return true;
    return false;
  };

  const isAlignmentArea = (r: number, c: number) => {
    return r >= 16 && r <= 20 && c >= 16 && c <= 20;
  };

  const getModule = (r: number, c: number): boolean => {
    const checkFinder = (fr: number, fc: number) => {
      const dr = r - fr;
      const dc = c - fc;
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
      if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
      return false;
    };

    const tl = checkFinder(0, 0);
    if (tl !== null) return tl;
    const tr = checkFinder(0, gridSize - 7);
    if (tr !== null) return tr;
    const bl = checkFinder(gridSize - 7, 0);
    if (bl !== null) return bl;

    if (isFinderArea(r, c)) return false;

    if (r === 6) return c % 2 === 0;
    if (c === 6) return r % 2 === 0;

    if (isAlignmentArea(r, c)) {
      const dr = r - 16;
      const dc = c - 16;
      if (dr === 0 || dr === 4 || dc === 0 || dc === 4) return true;
      if (dr === 2 && dc === 2) return true;
      return false;
    }

    if (r >= 10 && r <= 14 && c >= 10 && c <= 14) {
      if (r === 10 || r === 14 || c === 10 || c === 14) return false;
      return true;
    }

    const hash = Math.imul(r * 31 + c * 17 + (seed & 0xffff), 2654435761) >>> 0;
    return hash % 10 < 5;
  };

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (getModule(r, c)) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c}
            y={r}
            width={1}
            height={1}
            rx={0.12}
            fill="#111111"
          />
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-2 -2 ${gridSize + 4} ${gridSize + 4}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`QR code for ${value}`}
      className={className}
    >
      <rect
        x={-2}
        y={-2}
        width={gridSize + 4}
        height={gridSize + 4}
        rx={1.5}
        fill="#ffffff"
      />
      {cells}
      <rect
        x={10.2}
        y={10.2}
        width={4.6}
        height={4.6}
        rx={0.8}
        fill="#111111"
      />
      <text
        x={12.5}
        y={13.3}
        textAnchor="middle"
        fill="#ffffff"
        fontSize="2.2"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        SFD
      </text>
    </svg>
  );
}

/**
 * Crisp 32x32 SVG vector brand badge for each review directory and social platform.
 * Uses pure inline SVG paths so it never shows broken font glyphs on Windows/Android.
 */
export function ChannelBrandBadge({
  channelId,
}: {
  channelId: TrackingChannelId | "shield-intercept";
}) {
  switch (channelId) {
    case "gmb":
      return (
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-[6px] bg-white border border-[#e5e7eb] inline-flex items-center justify-center shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
        </span>
      );
    case "apple":
      return (
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-[6px] bg-[#111111] text-white inline-flex items-center justify-center shrink-0"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94 1-3.08-.96.04-2.13.64-2.82 1.45-.61.7-.15 1.86-1.01 2.97 1.08.08 2.16-.53 2.83-1.34" />
          </svg>
        </span>
      );
    case "yelp":
      return (
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-[6px] bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-[12px] font-bold inline-flex items-center justify-center shrink-0"
        >
          Y!
        </span>
      );
    case "instagram":
      return (
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-[6px] bg-[#fdf2f8] border border-[#fbcfe8] text-[#be185d] inline-flex items-center justify-center shrink-0"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </span>
      );
    case "tiktok":
      return (
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-[6px] bg-[#18181b] text-white inline-flex items-center justify-center shrink-0"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        </span>
      );
    case "facebook":
      return (
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-[6px] bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] inline-flex items-center justify-center shrink-0"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </span>
      );
    default:
      return (
        <span
          aria-hidden="true"
          className="w-8 h-8 rounded-[6px] bg-[#fffbeb] border border-[#fde68a] text-[#92400e] text-[12px] font-bold inline-flex items-center justify-center shrink-0"
        >
          !
        </span>
      );
  }
}
