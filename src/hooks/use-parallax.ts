"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Axis = "x" | "y";

export interface ParallaxOptions {
  speed?: number;
  scrub?: boolean | number;
  axis?: Axis;
  start?: string;
  end?: string;
  disableBelow?: number;
  clamp?: [number, number];
  tabletMultiplier?: number;
}

export function useParallax<T extends HTMLElement>(
  speedOrOptions: number | ParallaxOptions = 0.5,
  scrub: boolean | number = true
) {
  const ref = useRef<T>(null);
  const options =
    typeof speedOrOptions === "number"
      ? { speed: speedOrOptions, scrub }
      : { ...speedOrOptions };
  const {
    speed = 0.5,
    axis = "y",
    start = "top bottom",
    end = "bottom top",
    disableBelow = 768,
    clamp = [-60, 60],
    tabletMultiplier = 0.8,
  } = options;
  const resolvedScrub = options.scrub ?? scrub;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isBelowThreshold = window.matchMedia(`(max-width: ${disableBelow}px)`).matches;
    if (isBelowThreshold) return;

    const el = ref.current;
    if (!el) return;

    const isTablet = window.matchMedia("(max-width: 1280px)").matches;
    const velocity = gsap.utils.clamp(clamp[0], clamp[1], speed * 100);
    const amount = isTablet ? velocity * tabletMultiplier : velocity;
    const movement = axis === "x" ? { xPercent: amount } : { yPercent: amount };

    const ctx = gsap.context(() => {
      gsap.to(el, {
        ...movement,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub: resolvedScrub,
        },
      });
    });

    return () => ctx.revert();
  }, [axis, clamp, disableBelow, end, resolvedScrub, speed, start, tabletMultiplier]);

  return ref;
}
