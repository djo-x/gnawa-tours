"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function useScrollScene<T extends HTMLElement>(
  buildScene: (element: T) => void,
  deps: unknown[] = []
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const element = ref.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      buildScene(element);
    }, element);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

