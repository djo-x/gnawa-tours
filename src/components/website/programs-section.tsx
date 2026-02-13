"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, DollarSign, CalendarCheck, Sparkles } from "lucide-react";
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
  const { isAlgeria } = useRegionalPricing();
  const isDz = pricingRegion ? pricingRegion === "DZ" : isAlgeria;
  const locale = pricingLocale || "fr-FR";
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
    return "Sur demande";
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
  const getProgramImages = (program: Program) => {
    const urls = [program.cover_image, ...program.gallery_urls].filter(
      (item): item is string => typeof item === "string" && item.trim() !== ""
    );
    return Array.from(new Set(urls));
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;

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

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: isMobile ? "top 95%" : "top 85%",
              end: isMobile ? "top 70%" : "top 55%",
              scrub: true,
            },
          }
        );

        const image = card.querySelector(".program-image");
        if (image) {
          gsap.fromTo(
            image,
            { scale: 1.08, y: 18 },
            {
              scale: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "top 40%",
                scrub: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="programs"
      ref={sectionRef}
      className="scene-section programs-surface relative bg-transparent"
    >
      <div className="section-ornament" aria-hidden="true" />
      <div className="section-ornament section-ornament--bottom" aria-hidden="true" />
      {/* Title */}
      <div ref={titleRef} className="programs-title relative px-6 pb-8 pt-20 text-center md:pb-14">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <span className="text-outline font-heading text-[8rem] uppercase leading-none tracking-[0.1em] text-ivory/20 md:text-[11rem]">
            02
          </span>
        </div>
        <p className="eyebrow">Itinéraires sélectionnés</p>
        <h2 className="mt-4 font-heading text-3xl font-bold uppercase leading-[0.95] text-ivory md:text-5xl">
          Expéditions du Tassili
        </h2>
        <div className="mx-auto mt-6 hairline w-28" />
        <p className="mx-auto mt-4 max-w-xl text-ivory/65">
          Des voyages soigneusement composés à travers les palettes minérales et les cathédrales de roche du sud algérien.
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.32em] text-ivory/50">
          Utilisez « Réserver ce programme » pour préremplir votre réservation
        </p>
        <p className="mt-6 hidden text-[10px] uppercase tracking-[0.4em] text-ivory/45 md:block">
          Défilez pour explorer
        </p>
      </div>

      {/* Programs */}
      <div className="programs-grid mx-auto grid max-w-6xl gap-10 px-6 pb-16">
        {programs.map((program, index) => {
          const itinerary = Array.isArray(program.itinerary) ? program.itinerary : [];
          const columnCount = itinerary.length > 8 ? 3 : itinerary.length > 4 ? 2 : 1;
          const chunkSize = Math.max(1, Math.ceil(itinerary.length / columnCount));
          const columns = Array.from({ length: columnCount }, (_, col) =>
            itinerary.slice(col * chunkSize, (col + 1) * chunkSize)
          );
          const gridClass =
            columnCount === 1
              ? "grid-cols-1"
              : columnCount === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

          return (
            <article
              key={program.id}
              className="program-card group artisan-card clip-corner relative overflow-hidden border border-ivory/20 bg-ivory/5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] transition-transform duration-500 hover:-translate-y-1"
              style={{ willChange: "transform, opacity" }}
            >
              <div className="grid gap-8 p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:p-10">
              <ProgramGallery
                index={index}
                title={program.title}
                images={getProgramImages(program)}
              />

              <div className="space-y-6 text-ivory">
                <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-ivory/75">
                  <span className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1">
                    <Clock size={14} />
                    {program.duration}
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1">
                    <CalendarCheck size={14} />
                    {getDateRange(program.start_date, program.end_date)}
                  </span>
                  {(() => {
                    const priceValue = isDz ? program.price_dzd : program.price_eur;
                    const hasPrice = typeof priceValue === "number" && priceValue > 0;
                    if (!hasPrice) return null;
                    return (
                      <span className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1">
                        <DollarSign size={14} />
                        À partir de{" "}
                        {formatCurrency(
                          priceValue,
                          isDz ? "DZD" : "EUR"
                        )}
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <h3 className="font-heading text-3xl font-bold uppercase tracking-[0.06em]">
                    {program.title}
                  </h3>
                  {program.description && (
                    <p className="mt-4 text-base leading-relaxed text-ivory/75">
                      {program.description}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-ivory/60">
                    <Sparkles size={14} className="text-gold" />
                    Points forts
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {program.highlights.length > 0 ? (
                      program.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-full border border-ivory/20 bg-ivory/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-ivory/80"
                        >
                          {h}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-ivory/60">
                        Points forts à venir.
                      </span>
                    )}
                  </div>
                </div>

              </div>

              <div className="rounded-2xl border border-ivory/15 bg-ivory/5 p-5 lg:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.32em] text-ivory/60">
                  Itinéraire complet
                </p>
                <div className={`mt-4 grid gap-6 ${gridClass}`}>
                  {itinerary.length > 0 ? (
                    columns.map((column, colIndex) => (
                      <div key={`${program.id}-col-${colIndex}`} className="space-y-4">
                        {column.map((day) => (
                          <div
                            key={`${program.id}-${day.day}`}
                            className="relative border-l border-ivory/20 pl-5"
                          >
                            <div className="absolute -left-[6px] top-1 h-3 w-3 rounded-full bg-gold/80" />
                            <div className="text-xs uppercase tracking-[0.28em] text-ivory/70">
                              Jour {day.day}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-ivory">
                              {day.title}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-ivory/70">
                              {day.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-ivory/60">
                      Itinéraire détaillé à venir.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
                <button
                  type="button"
                  onClick={() => selectProgram(program.id)}
                  className="rounded-full border border-ivory/30 bg-ivory/10 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-ivory transition hover:bg-gold hover:text-midnight"
                >
                  Réserver ce programme
                </button>
                <span className="text-[10px] uppercase tracking-[0.32em] text-ivory/50">
                  Réponse rapide sous 24h
                </span>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgramGallery({
  index,
  title,
  images,
}: {
  index: number;
  title: string;
  images: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoKey, setAutoKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const hasImages = images.length > 0;
  const safeIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduceMotion(media.matches);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!hasImages || reduceMotion || images.length <= 1 || paused) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [autoKey, reduceMotion, images.length, hasImages, paused]);

  const goTo = (target: number) => {
    setActiveIndex(target);
    setAutoKey((prev) => prev + 1);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    setAutoKey((prev) => prev + 1);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    setAutoKey((prev) => prev + 1);
  };

  return (
    <div
      className="artisan-card relative overflow-hidden rounded-2xl border border-ivory/20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="glint" aria-hidden="true" />
      <div className="absolute left-4 top-4 z-10 flex items-center gap-3 border border-ivory/25 bg-ivory/10 px-3 py-2 text-[10px] font-semibold tracking-[0.32em] text-ivory/80">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>SAHARA</span>
      </div>
      <div className="program-image relative h-[40vh] w-full overflow-hidden">
        {hasImages ? (
          images.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out ${
                i === safeIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundColor: "#caa672",
              }}
              role="img"
              aria-label={`${title} - image ${i + 1}`}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#6d4c35,#caa672)]" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent" />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Image précédente"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ivory/30 bg-ivory/10 p-2 text-ivory/80 opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md transition hover:bg-ivory/20 md:opacity-0 md:group-hover:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Image suivante"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ivory/30 bg-ivory/10 p-2 text-ivory/80 opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md transition hover:bg-ivory/20 md:opacity-0 md:group-hover:opacity-100"
          >
            ›
          </button>
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-3 py-2 text-[10px] uppercase tracking-[0.32em] text-ivory/70 opacity-100 backdrop-blur-md md:opacity-0 md:group-hover:opacity-100">
            {images.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Aller à l'image ${i + 1}`}
                className={`h-1.5 w-5 rounded-full transition ${
                  i === safeIndex ? "bg-ivory/80" : "bg-ivory/25"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
