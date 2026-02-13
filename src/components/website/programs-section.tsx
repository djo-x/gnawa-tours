"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, DollarSign } from "lucide-react";
import type { Program } from "@/types/program";
import { cinematicScrollTo } from "@/lib/motion";
import { useRegionalPricing } from "@/hooks/use-regional-pricing";

gsap.registerPlugin(ScrollTrigger);

interface ProgramsSectionProps {
  programs: Program[];
  pricingRegion?: "DZ" | "INTL";
  pricingLocale?: string;
}

export function ProgramsSection({
  programs,
  pricingRegion,
  pricingLocale,
}: ProgramsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { isAlgeria } = useRegionalPricing();
  const isDz = pricingRegion ? pricingRegion === "DZ" : isAlgeria;
  const locale = pricingLocale || "en-US";
  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const getDateRange = (start?: string | null, end?: string | null) => {
    const startLabel = formatDate(start);
    const endLabel = formatDate(end);
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
    if (startLabel) return `${startLabel}`;
    if (endLabel) return `${endLabel}`;
    return "On request";
  };
  const formatCurrency = (
    value: number | null | undefined,
    currency: "EUR" | "DZD"
  ) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "—";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };
  const selectProgram = (programId: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("program:select", { detail: programId })
      );
    }
    cinematicScrollTo("booking");
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Title: scrub-driven clip-path reveal on desktop, fade-up on mobile
      if (titleRef.current) {
        if (!isMobile) {
          gsap.fromTo(
            titleRef.current,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 75%",
                end: "top 50%",
                scrub: 1,
              },
            }
          );
        } else {
          gsap.fromTo(
            titleRef.current,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              ease: "expo.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
              },
            }
          );
        }
      }

      const cards = sectionRef.current?.querySelectorAll(".program-card");
      if (!cards || cards.length === 0) return;

      if (!isMobile && trackRef.current) {
        // Desktop: horizontal scroll
        const track = trackRef.current;
        const totalScroll = track.scrollWidth - window.innerWidth;

        // Pin section and translate track horizontally
        const horizontalScroll = gsap.to(track, {
          x: -totalScroll,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${totalScroll}`,
            pin: true,
            scrub: 1,
            pinSpacing: true,
            invalidateOnRefresh: true,
          },
        });

        // Nested parallax on card images using containerAnimation
        cards.forEach((card) => {
          const img = card.querySelector(".card-image-inner");
          if (img) {
            gsap.to(img, {
              xPercent: -15,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "left right",
                end: "right left",
                scrub: true,
                containerAnimation: horizontalScroll,
              },
            });
          }
        });
      } else {
        // Mobile: simple fade-up stagger
        gsap.fromTo(
          cards,
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "expo.out",
            scrollTrigger: {
              trigger: ".programs-grid",
              start: "top 85%",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="programs"
      ref={sectionRef}
      className="scene-section programs-surface relative bg-transparent"
    >
      {/* Title — always above the horizontal track */}
      <div ref={titleRef} className="programs-title relative px-6 pb-8 pt-20 text-center md:pb-14">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <span className="text-outline font-heading text-[8rem] uppercase leading-none tracking-[0.1em] text-ivory/20 md:text-[11rem]">
            02
          </span>
        </div>
        <p className="eyebrow">Curated itineraries</p>
        <h2 className="mt-4 font-heading text-3xl font-bold uppercase leading-[0.95] text-ivory md:text-5xl">
          Tassili Expeditions
        </h2>
        <div className="mx-auto mt-6 hairline w-28" />
        <p className="mx-auto mt-4 max-w-xl text-ivory/65">
          Curated journeys through the mineral palettes and rock cathedrals of southern Algeria.
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.32em] text-ivory/50">
          Click any program to prefill your booking
        </p>
        <p className="mt-6 hidden text-[10px] uppercase tracking-[0.4em] text-ivory/45 md:block">
          Scroll to explore
        </p>
      </div>

      {/* Desktop: horizontal scroll track */}
      <div className="hidden md:block">
        <div
          ref={trackRef}
          className="flex items-stretch gap-8 px-[10vw]"
          style={{ width: "max-content" }}
        >
          {programs.map((program, index) => (
            <article
              key={program.id}
              className="program-card group clip-corner relative w-[40vw] flex-shrink-0 cursor-pointer overflow-hidden border border-ivory/20 bg-ivory/5 transition-transform duration-500 hover:-translate-y-1"
              style={{ willChange: "transform, opacity" }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectProgram(program.id);
                }
              }}
              onClick={() => selectProgram(program.id)}
            >
              <div className="absolute left-4 top-4 z-10 flex items-center gap-3 border border-ivory/25 bg-ivory/10 px-3 py-2 text-[10px] font-semibold tracking-[0.32em] text-ivory/70">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>SAHARA</span>
              </div>
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <div
                  className="card-image-inner h-full w-[130%] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: program.cover_image
                      ? `url(${program.cover_image})`
                      : "linear-gradient(135deg, #6d4c35, #caa672)",
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent" />
              </div>

              {/* Content overlay */}
              <div className="absolute inset-x-0 bottom-0 p-7 text-ivory">
                <div className="mb-2 flex items-center gap-4 text-[11px] uppercase tracking-[0.26em] text-ivory/90">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {program.duration}
                  </span>
                  {(() => {
                    const priceValue = isDz ? program.price_dzd : program.price_eur;
                    const hasPrice = typeof priceValue === "number" && priceValue > 0;
                    if (!hasPrice) return null;
                    return (
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        From{" "}
                        {formatCurrency(
                          priceValue,
                          isDz ? "DZD" : "EUR"
                        )}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/85">
                  Dates: {getDateRange(program.start_date, program.end_date)}
                </p>
                <h3 className="font-heading text-2xl font-bold uppercase">
                  {program.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-ivory/70">
                  {program.description}
                </p>

                {/* Highlights on hover */}
                <div className="mt-4 flex flex-wrap gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {program.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-ivory/70"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Mobile: vertical grid */}
      <div className="programs-grid grid gap-8 px-6 pb-16 md:hidden">
        {programs.map((program, index) => (
          <article
            key={program.id}
            className="program-card group clip-corner relative cursor-pointer overflow-hidden border border-ivory/20 bg-ivory/5 transition-transform duration-500 hover:-translate-y-1"
            style={{ willChange: "transform, opacity" }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectProgram(program.id);
              }
            }}
            onClick={() => selectProgram(program.id)}
          >
            <div className="absolute left-4 top-4 z-10 flex items-center gap-3 border border-ivory/25 bg-ivory/10 px-3 py-2 text-[10px] font-semibold tracking-[0.32em] text-ivory/70">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>SAHARA</span>
            </div>
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: program.cover_image
                    ? `url(${program.cover_image})`
                    : "linear-gradient(135deg, #6d4c35, #caa672)",
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
              <div className="mb-2 flex items-center gap-4 text-[11px] uppercase tracking-[0.26em] text-ivory/90">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {program.duration}
                </span>
                {(() => {
                  const priceValue = isDz ? program.price_dzd : program.price_eur;
                  const hasPrice = typeof priceValue === "number" && priceValue > 0;
                  if (!hasPrice) return null;
                  return (
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      From{" "}
                      {formatCurrency(
                        priceValue,
                        isDz ? "DZD" : "EUR"
                      )}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/85">
                Dates: {getDateRange(program.start_date, program.end_date)}
              </p>
              <h3 className="font-heading text-2xl font-bold uppercase">
                {program.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-ivory/70">
                {program.description}
              </p>

              {/* Highlights on hover */}
              <div className="mt-4 flex flex-wrap gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {program.highlights.slice(0, 3).map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-ivory/70"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
