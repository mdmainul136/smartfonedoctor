"use client";

import React, { useEffect, useId, useRef, useState, type CSSProperties } from "react";

/* Interactive parts of the "General" widgets (they need the browser). */

/** Drag (or use arrow keys) to compare a before and an after photo. */
export function BeforeAfterView({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  start,
  radius,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  start: number;
  radius: number;
}) {
  const [pos, setPos] = useState(Math.min(95, Math.max(5, start || 50)));
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  if (!before || !after) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
        Pick a before and an after photo.
      </div>
    );
  }

  return (
    <div
      ref={box}
      className="relative w-full select-none overflow-hidden touch-none"
      style={{ borderRadius: radius }}
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && moveTo(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt={afterAlt} className="block w-full h-auto" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={beforeAlt} className="block w-full h-full object-cover" draggable={false} />
      </div>
      {beforeLabel ? (
        <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">{beforeLabel}</span>
      ) : null}
      {afterLabel ? (
        <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">{afterLabel}</span>
      ) : null}
      <div className="absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }} aria-hidden="true" />
      <button
        type="button"
        role="slider"
        aria-label="Compare before and after"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
          if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
        }}
        className="absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/50 text-white text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        style={{ left: `${pos}%` }}
      >
        ⟷
      </button>
    </div>
  );
}

function partsUntil(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    done: ms === 0,
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

/** Counts down to a date; shows the "after" message once it has passed. */
export function CountdownView({
  until,
  endedText,
  color,
  boxColor,
}: {
  until: string;
  endedText: string;
  color: string;
  boxColor: string;
}) {
  const target = Date.parse(until);
  // Rendered on the server first: start empty so server and browser HTML match.
  const [p, setP] = useState<ReturnType<typeof partsUntil> | null>(null);
  useEffect(() => {
    if (Number.isNaN(target)) return;
    setP(partsUntil(target));
    const t = setInterval(() => setP(partsUntil(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (Number.isNaN(target)) {
    return <p className="text-sm text-gray-500">Set an end date and time.</p>;
  }
  if (p?.done) return <p className="text-center font-semibold" style={{ color }}>{endedText}</p>;
  const cells: [number | undefined, string][] = [
    [p?.days, "Days"],
    [p?.hours, "Hours"],
    [p?.minutes, "Minutes"],
    [p?.seconds, "Seconds"],
  ];
  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="timer" aria-live="off">
      {cells.map(([v, label]) => (
        <div key={label} className="min-w-[64px] rounded-lg px-3 py-2 text-center" style={{ background: boxColor, color }}>
          <div className="text-2xl sm:text-3xl font-bold tabular-nums leading-none">{v === undefined ? "–" : String(v).padStart(2, "0")}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wide opacity-80">{label}</div>
        </div>
      ))}
    </div>
  );
}

/** Lists the page's H2 (and optionally H3) headings as links. */
export function TableOfContentsView({ title, includeH3, accent }: { title: string; includeH3: boolean; accent: string }) {
  const [items, setItems] = useState<{ id: string; text: string; level: number }[]>([]);
  const self = useRef<HTMLElement>(null);
  const uid = useId().replace(/:/g, "");
  useEffect(() => {
    const root = self.current?.closest("main") ?? document.body;
    const heads = Array.from(root.querySelectorAll<HTMLElement>(includeH3 ? "h2, h3" : "h2")).filter(
      (h) => !self.current?.contains(h) && h.textContent?.trim()
    );
    setItems(
      heads.map((h, i) => {
        if (!h.id) h.id = `toc-${uid}-${i}`;
        return { id: h.id, text: h.textContent!.trim(), level: h.tagName === "H3" ? 3 : 2 };
      })
    );
  }, [includeH3, uid]);

  return (
    <nav ref={self} aria-label={title || "On this page"} className="rounded-lg border border-gray-200 bg-white p-4">
      {title ? <p className="mb-2 text-sm font-semibold text-gray-900">{title}</p> : null}
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">The page&apos;s headings appear here.</p>
      ) : (
        <ol className="space-y-1.5 text-sm">
          {items.map((it) => (
            <li key={it.id} style={{ paddingLeft: it.level === 3 ? 16 : 0 }}>
              <a href={`#${it.id}`} className="hover:underline" style={{ color: accent }}>
                {it.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

/** Image grid; a click opens the photo larger (Esc or click to close). */
export function GalleryView({
  images,
  columns,
  gap,
  radius,
  aspect,
  lightbox,
}: {
  images: { src: string; alt: string; caption?: string }[];
  columns: number;
  gap: number;
  radius: number;
  aspect: string;
  lightbox: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const shown = images.filter((im) => im.src);
  const count = shown.length;
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % count));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + count) % count));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, count]);

  if (shown.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
        Add photos to the gallery.
      </div>
    );
  }
  const grid: CSSProperties = { display: "grid", gap, gridTemplateColumns: `repeat(var(--g-cols), minmax(0, 1fr))` };
  return (
    <>
      <div className="pb-gallery" style={{ ...grid, ["--g-cols" as string]: String(columns || 3) }}>
        {shown.map((im, i) => (
          <figure key={i} className="m-0">
            <button
              type="button"
              disabled={!lightbox}
              onClick={() => setOpen(i)}
              className="block w-full overflow-hidden disabled:cursor-default"
              style={{ borderRadius: radius, aspectRatio: aspect === "auto" ? undefined : aspect }}
              aria-label={lightbox ? `Open photo: ${im.alt || `photo ${i + 1}`}` : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.src} alt={im.alt} loading="lazy" className="h-full w-full object-cover" />
            </button>
            {im.caption ? <figcaption className="mt-1.5 text-xs text-gray-600">{im.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
      <style>{`@media (max-width: 640px){.pb-gallery{--g-cols:${Math.min(2, columns || 3)} !important}}`}</style>
      {lightbox && open !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={shown[open]?.alt || "Photo"}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setOpen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown[open]?.src} alt={shown[open]?.alt} className="max-h-[90vh] max-w-full rounded" />
          <button type="button" className="absolute right-4 top-4 text-3xl leading-none text-white" aria-label="Close">
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
