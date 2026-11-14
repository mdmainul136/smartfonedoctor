"use client";

import { useEffect } from "react";
import type { PbMotion } from "./types";

/** Where an element starts from before it animates to its normal state. */
export const ENTRANCES: Record<string, { label: string; from: string }> = {
  fade: { label: "Fade in", from: "opacity:0" },
  "slide-up": { label: "Slide up", from: "opacity:0;transform:translateY(32px)" },
  "slide-down": { label: "Slide down", from: "opacity:0;transform:translateY(-32px)" },
  "slide-left": { label: "Slide from right", from: "opacity:0;transform:translateX(32px)" },
  "slide-right": { label: "Slide from left", from: "opacity:0;transform:translateX(-32px)" },
  zoom: { label: "Zoom in", from: "opacity:0;transform:scale(.92)" },
  blur: { label: "Blur in", from: "opacity:0;filter:blur(12px)" },
};

const READY_CLASS = "pb-motion-on";
const IN_CLASS = "pb-in";

/**
 * CSS for an entrance animation.
 * Editor: plays as soon as the setting changes, so the user sees it.
 * Published page: the element waits hidden until it scrolls into view
 * (MotionRuntime adds `pb-in`). Without JavaScript, or with reduced motion
 * turned on, nothing is hidden and nothing moves.
 */
export function compileMotion(self: string, id: string, motion: PbMotion | undefined, editing?: boolean): string {
  const preset = motion?.enter && ENTRANCES[motion.enter];
  if (!motion || !preset) return "";
  const duration = Math.max(0, Number(motion.duration) || 600);
  const delay = Math.max(0, Number(motion.delay) || 0);
  // The settings are part of the name, so changing one restarts the animation.
  const name = `pbm-${id.replace(/[^a-zA-Z0-9_-]/g, "")}-${motion.enter}-${duration}-${delay}`;
  const play = `animation:${name} ${duration}ms cubic-bezier(.22,1,.36,1) ${delay}ms backwards`;
  const keyframes = `@keyframes ${name}{from{${preset.from}}}`;
  if (editing) return `${keyframes}\n${self}{${play}}`;
  return [
    keyframes,
    `.${READY_CLASS} ${self}[data-pb-motion]:not(.${IN_CLASS}){opacity:0}`,
    `${self}.${IN_CLASS}{${play}}`,
  ].join("\n");
}

let observer: IntersectionObserver | null = null;
const seen = new WeakSet<Element>();

function scan() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target;
          if (entry.isIntersecting) {
            el.classList.add(IN_CLASS);
            if (el.getAttribute("data-pb-motion") !== "repeat") observer?.unobserve(el);
          } else if (el.getAttribute("data-pb-motion") === "repeat") {
            el.classList.remove(IN_CLASS);
          }
        }
      },
      { threshold: 0.15 },
    );
    document.documentElement.classList.add(READY_CLASS);
  }
  document.querySelectorAll("[data-pb-motion]").forEach((el) => {
    if (seen.has(el)) return;
    seen.add(el);
    observer?.observe(el);
  });
}

/** Rendered next to every animated element on the published page. Draws nothing. */
export function MotionRuntime() {
  useEffect(scan);
  return null;
}
