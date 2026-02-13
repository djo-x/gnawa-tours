"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  desktopBreakpoint?: number;
  contentClassName?: string;
}

export function HorizontalScroll({
  children,
  className,
  desktopBreakpoint = 1024,
  contentClassName,
}: HorizontalScrollProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const trigger = triggerRef.current;

    if (!section || !trigger) return;

    const isDesktop = window.matchMedia(`(min-width: ${desktopBreakpoint}px)`).matches;
    if (!isDesktop) return;

    const getDistance = () => Math.max(0, section.scrollWidth - trigger.clientWidth);
    if (getDistance() <= 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        { x: 0 },
        {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top top",
            end: () => `+=${getDistance() * 1.16}`,
            scrub: 1.35,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            fastScrollEnd: true,
          },
        }
      );
    }, trigger);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [desktopBreakpoint]);

  return (
    <section className={`relative overflow-hidden ${className ?? ""}`} ref={triggerRef}>
      <div
        ref={sectionRef}
        className={`relative flex w-full flex-col gap-10 px-6 py-16 lg:h-screen lg:w-max lg:flex-row lg:flex-nowrap lg:items-center lg:gap-0 lg:px-0 lg:py-0 ${contentClassName ?? ""}`}
      >
        {children}
      </div>
    </section>
  );
}
