"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroSettings } from "@/types/section";
import { cinematicScrollTo } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  hero: HeroSettings;
}

export function HeroSection({ hero }: HeroSectionProps) {
  const currentYear = new Date().getFullYear();
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const strataRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const headlineWords = (hero.headline || "Atelier du désert Gnaoua")
    .split(" ")
    .filter(Boolean);
  const lineCount = headlineWords.length > 7 ? 3 : headlineWords.length > 1 ? 2 : 1;
  const wordsPerLine = Math.max(1, Math.ceil(headlineWords.length / lineCount));
  const headlineLines = Array.from({ length: lineCount }, (_, i) =>
    headlineWords.slice(i * wordsPerLine, (i + 1) * wordsPerLine).join(" ")
  ).filter(Boolean);
  const accentIndex = headlineLines.length > 1 ? 1 : 0;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const lines = contentRef.current?.querySelectorAll("[data-hero-line]") ?? [];
      const meta = contentRef.current?.querySelector("[data-hero-meta]");
      const kicker = contentRef.current?.querySelector("[data-hero-kicker]");
      const cta = contentRef.current?.querySelector("[data-hero-cta]");
      const lineRule = contentRef.current?.querySelector("[data-hero-rule]");

      gsap.set([lines, kicker, meta, cta, lineRule, haloRef.current, beamRef.current], {
        autoAlpha: 0,
      });
      gsap.set(frameRef.current, { autoAlpha: 0, clipPath: "inset(8% 0 14% 0)" });

      const introTl = gsap.timeline({ delay: 0.25 });
      introTl.fromTo(
        bgRef.current,
        { autoAlpha: 0, scale: 1.04, y: 0 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 1.5, ease: "power2.out" }
      );
      introTl.fromTo(
        haloRef.current,
        { scale: 1.06, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 1.1, ease: "power2.out" },
        "-=1.1"
      );
      introTl.fromTo(
        beamRef.current,
        { xPercent: -8, autoAlpha: 0 },
        { xPercent: 0, autoAlpha: 1, duration: 1.2, ease: "power2.out" },
        "-=1.0"
      );
      introTl.to(
        frameRef.current,
        { autoAlpha: 1, clipPath: "inset(0 0 0 0)", duration: 1.1, ease: "power3.out" },
        "-=1.0"
      );
      introTl.fromTo(
        lines,
        { yPercent: 120, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: "power4.out" },
        "-=0.9"
      );
      introTl.fromTo(
        [kicker, lineRule, meta, cta],
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: "power3.out" },
        "-=0.45"
      );

      gsap.to(scrollIndicatorRef.current, {
        y: 12,
        repeat: -1,
        yoyo: true,
        duration: 0.9,
        ease: "power1.inOut",
        delay: 1.6,
      });

      gsap.to(bgRef.current, {
        y: -110,
        scale: 1.02,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.1,
        },
      });

      gsap.to(strataRef.current, {
        yPercent: -28,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.25,
        },
      });

      gsap.to(contentRef.current, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(frameRef.current, {
        borderColor: "rgba(215,180,124,0.6)",
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(haloRef.current, {
        scale: 1.08,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(beamRef.current, {
        xPercent: 10,
        yPercent: -6,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=110%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });

      gsap.to(scrollIndicatorRef.current, {
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "100px",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="scene-section ambient-ring relative flex min-h-screen items-center overflow-hidden px-5 md:px-8"
      style={{ willChange: "clip-path" }}
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: hero.background_image
            ? `url(${hero.background_image})`
            : "linear-gradient(135deg, #141217 0%, #4b3d2f 55%, #b08a57 100%)",
          visibility: "hidden",
          willChange: "transform, opacity",
          transformOrigin: "50% 42%",
          filter: "saturate(0.9) contrast(1.05)",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,11,13,0.92),rgba(15,15,19,0.6)_46%,rgba(11,11,13,0.92))]" />
      <div className="absolute inset-0 pointer-events-none">
        <div ref={haloRef} className="hero-halo" />
        <div ref={beamRef} className="hero-beam" />
        <div className="hero-vignette" />
      </div>
      <div
        ref={strataRef}
        className="pointer-events-none absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(246,241,231,0.06) 0 1px, transparent 1px 120px), repeating-linear-gradient(0deg, rgba(246,241,231,0.04) 0 1px, transparent 1px 160px)",
          maskImage: "linear-gradient(to bottom, transparent 6%, black 30%, black 78%, transparent 96%)",
        }}
      />

      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-6xl text-ivory"
        style={{ willChange: "transform, opacity" }}
      >
        <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div
            ref={frameRef}
            className="relative border border-ivory/20 bg-ivory/[0.03] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-md md:p-10"
          >
            <div className="pointer-events-none absolute right-6 top-4 select-none text-outline font-heading text-[4.5rem] uppercase tracking-[0.12em] text-ivory/20 md:text-[6rem]">
              01
            </div>
            <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.38em] text-ivory/60 md:text-xs">
              <span data-hero-kicker>Gnaoua Tours</span>
               <span>{`Édition ${currentYear}`}</span>
            </div>

            <h1 className="hero-title font-heading text-[2.8rem] leading-[0.86] font-bold uppercase md:text-[4.8rem] lg:text-[6.6rem]">
              {headlineLines.map((line, index) => (
                <span key={line} className="block overflow-hidden">
                  <span
                    data-hero-line
                    className={`block ${index === accentIndex ? "text-gold" : ""}`}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <div data-hero-rule className="my-6 h-px w-full bg-ivory/25" />

            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
              <p data-hero-meta className="max-w-xl text-base leading-relaxed text-ivory/75 md:text-lg">
                {hero.subheadline}
              </p>
              <div className="flex flex-col items-start gap-4 md:items-end">
                <p className="text-[10px] uppercase tracking-[0.38em] text-ivory/50">
                  Djanet / Tadrart / Ihrir
                </p>
                <Button
                  data-hero-cta
                  size="lg"
                  className="h-12 rounded-full border border-ivory/40 bg-ivory/10 px-7 text-xs font-semibold uppercase tracking-[0.28em] text-ivory transition hover:bg-gold hover:text-midnight"
                  onClick={() => cinematicScrollTo("booking", 1.9)}
                >
                  {hero.cta_text}
                </Button>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col justify-end gap-6 lg:items-end">
            <div className="pointer-events-none absolute -right-6 -top-12 hidden select-none lg:block">
              <p className="text-outline font-heading text-[6.5rem] uppercase leading-none tracking-[0.08em]">
                Sahara
              </p>
            </div>
            <div className="space-y-4">
              <p className="eyebrow">Latitude 24°4&apos;17.476&quot;</p> 
              <p className="eyebrow">Longitude 9°36&apos;56.104&quot;</p>
              <div className="hairline w-32" />
              <p className="text-sm uppercase tracking-[0.32em] text-ivory/60">
                Vent, pierre, silence
              </p>
            </div>
            <div className="grid w-full max-w-xs gap-4 text-[11px] uppercase tracking-[0.28em] text-ivory/55">
              <div className="flex items-center justify-between border-b border-ivory/10 pb-2">
                <span>Altitude</span>
                <span className="text-ivory/75">1,050m</span>
              </div>
              <div className="flex items-center justify-between border-b border-ivory/10 pb-2">
                <span>Saison</span>
                <span className="text-ivory/75">Sep - Avr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ visibility: "hidden" }}
      >
        <div className="flex flex-col items-center gap-3 text-ivory/60">
          <span className="text-[10px] uppercase tracking-[0.4em]">Défilez</span>
          <div className="h-10 w-px bg-ivory/30" />
          <ChevronDown className="h-6 w-6 text-gold/80" />
        </div>
      </div>
    </section>
  );
}
