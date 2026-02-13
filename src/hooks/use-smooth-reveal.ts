"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type RevealMode =
  | "fade"
  | "clip-reveal"
  | "scale"
  | "fadeSlide"
  | "maskReveal"
  | "scaleFade";

interface SmoothRevealOptions {
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  scrub?: number | boolean;
  start?: string;
  end?: string;
  mode?: RevealMode;
  stagedChildren?: string;
  stagger?: number;
}

export function useSmoothReveal<T extends HTMLElement>(
  options: SmoothRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    direction = "up",
    distance = 50,
    scrub = 1,
    start = "top 85%",
    end = "top 50%",
    mode = "fade",
    stagedChildren,
    stagger = 0.12,
  } = options;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    let x = 0;
    let y = 0;

    switch (direction) {
      case "up":
        y = distance;
        break;
      case "down":
        y = -distance;
        break;
      case "left":
        x = distance;
        break;
      case "right":
        x = -distance;
        break;
    }

    const ctx = gsap.context(() => {
      const normalizedMode =
        mode === "fadeSlide"
          ? "fade"
          : mode === "maskReveal"
            ? "clip-reveal"
            : mode === "scaleFade"
              ? "scale"
              : mode;

      if (stagedChildren) {
        const children = Array.from(el.querySelectorAll(stagedChildren));
        if (children.length > 0) {
          gsap.set(children, { autoAlpha: 0, y });
          gsap.to(children, {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            stagger,
            scrollTrigger: {
              trigger: el,
              start,
              end,
              scrub,
            },
          });
          return;
        }
      }

      if (normalizedMode === "fade") {
        gsap.fromTo(
          el,
          { autoAlpha: 0, x, y },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scrollTrigger: {
              trigger: el,
              start,
              end,
              scrub,
            },
          }
        );
      } else if (normalizedMode === "clip-reveal") {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start,
              end,
              scrub,
            },
          }
        );
      } else if (normalizedMode === "scale") {
        gsap.fromTo(
          el,
          { autoAlpha: 0, scale: 0.9 },
          {
            autoAlpha: 1,
            scale: 1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: el,
              start,
              end,
              scrub,
            },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [direction, distance, scrub, start, end, mode, stagedChildren, stagger]);

  return ref;
}
