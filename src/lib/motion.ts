"use client";

export const cinematicEase = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export const cinematicDuration = 1.8;

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function cinematicScrollTo(target: string | Element, duration = cinematicDuration) {
  if (typeof window === "undefined") return;

  const element = typeof target === "string" ? document.getElementById(target) : target;
  if (!element) return;

  if (prefersReducedMotion()) {
    element.scrollIntoView({ behavior: "auto", block: "start" });
    return;
  }

  if (window.__lenis) {
    window.__lenis.scrollTo(element as HTMLElement, {
      duration,
      easing: cinematicEase,
    });
    return;
  }

  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

