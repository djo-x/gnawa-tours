"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Compass, Shield, Star, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import type { DynamicSection as DynamicSectionType } from "@/types/section";

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  compass: Compass,
  shield: Shield,
  star: Star,
  heart: Heart,
};

interface DynamicSectionProps {
  section: DynamicSectionType;
}

export function DynamicSection({ section }: DynamicSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chapter = Number.isFinite(section.display_order)
    ? String(section.display_order + 2).padStart(2, "0")
    : null;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      const layout = section.layout_type;

      if (layout === "centered") {
        // Our Story: word-by-word opacity scrub reveal
        const words = sectionRef.current?.querySelectorAll(".word");
        if (words && words.length > 0 && !isMobile) {
          gsap.fromTo(
            words,
            { opacity: 0.15 },
            {
              opacity: 1,
              stagger: 0.05,
              ease: "none",
              scrollTrigger: {
                trigger: sectionRef.current?.querySelector(".centered-text"),
                start: "top 80%",
                end: "bottom 40%",
                scrub: true,
              },
            }
          );
        } else {
          const textEl = sectionRef.current?.querySelector(".centered-text");
          if (textEl) {
            gsap.fromTo(
              textEl,
              { y: 40, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.9,
                ease: "expo.out",
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top 80%",
                },
              }
            );
          }
        }

        // Image: parallax yPercent scrub + clip-path reveal
        const imgEl = sectionRef.current?.querySelector(".centered-image");
        if (imgEl && !isMobile) {
          gsap.fromTo(
            imgEl,
            { clipPath: "inset(0 100% 0 0)", yPercent: 10 },
            {
              clipPath: "inset(0 0% 0 0)",
              yPercent: -5,
              ease: "none",
              scrollTrigger: {
                trigger: imgEl,
                start: "top 85%",
                end: "bottom 30%",
                scrub: true,
              },
            }
          );
        }
      } else if (layout === "grid") {
        // Why Choose Us: scrub-driven card entrances with alternating parallax
        const cards = sectionRef.current?.querySelectorAll(".grid-card");
        if (cards && cards.length > 0) {
          cards.forEach((card, i) => {
            const yOffset = i % 2 === 0 ? 60 : 80;
            gsap.fromTo(
              card,
              { y: yOffset, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top 90%",
                  end: "top 50%",
                  scrub: true,
                },
              }
            );

            // Icon circles scale-in with delay
            const icon = card.querySelector(".icon-circle");
            if (icon) {
              gsap.fromTo(
                icon,
                { scale: 0 },
                {
                  scale: 1,
                  duration: 0.4,
                  delay: 0.3,
                  ease: "back.out(1.7)",
                  scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                  },
                }
              );
            }
          });
        }
      } else if (layout === "full-bleed") {
        // The Desert: pinned cinematic gallery
        // Zoom-settle on section entrance
        gsap.fromTo(
          sectionRef.current,
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
            },
          }
        );

        const titleEl = sectionRef.current?.querySelector(".section-title-block");
        if (titleEl) {
          gsap.fromTo(
            titleEl,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: "expo.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
              },
            }
          );
        }

        const galleryStage = sectionRef.current?.querySelector(".gallery-stage");
        if (galleryStage) {
          gsap.fromTo(
            galleryStage,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: {
                trigger: galleryStage,
                start: "top 85%",
              },
            }
          );
        }

        // Title overlay slow drift
        const overlay = sectionRef.current?.querySelector(".desert-overlay-text");
        if (overlay) {
          gsap.to(overlay, {
            yPercent: -6,
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        }
      } else if (layout === "text-left" || layout === "text-right") {
        // Testimonials: scrub-driven reveals instead of trigger-once
        const quotes = sectionRef.current?.querySelectorAll(".testimonial-quote");
        if (quotes && quotes.length > 0) {
          quotes.forEach((quote) => {
            gsap.fromTo(
              quote,
              { autoAlpha: 0, y: isMobile ? 30 : 50, rotateX: isMobile ? 0 : 3 },
              {
                autoAlpha: 1,
                y: 0,
                rotateX: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: quote,
                  start: "top 90%",
                  end: "top 50%",
                  scrub: true,
                },
              }
            );

            // Stars scale in after quote
            const stars = quote.querySelectorAll(".star-icon");
            if (stars.length > 0) {
              gsap.fromTo(
                stars,
                { scale: 0 },
                {
                  scale: 1,
                  duration: 0.3,
                  stagger: 0.05,
                  delay: 0.3,
                  ease: "back.out(1.7)",
                  scrollTrigger: {
                    trigger: quote,
                    start: "top 80%",
                  },
                }
              );
            }
          });
        } else {
          // Generic text-side content
          gsap.fromTo(
            ".section-content",
            { y: 40, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: "expo.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
              },
            }
          );
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [section.layout_type]);

  const content = section.content as Record<string, unknown>;

  return (
    <section
      id={section.section_key}
      ref={sectionRef}
      className={`relative border-t border-ivory/10 px-6 py-16 md:py-20 ${
        section.layout_type === "full-bleed"
          ? "scene-section flex min-h-screen items-center bg-cover bg-center bg-no-repeat text-ivory"
          : section.layout_type === "centered"
            ? "bg-transparent"
            : "bg-transparent"
      }`}
      style={
        section.layout_type === "full-bleed" && section.background_image
          ? { backgroundImage: `url(${section.background_image})` }
          : undefined
      }
    >
      <div className="section-ornament" aria-hidden="true" />
      <div className="section-ornament section-ornament--bottom" aria-hidden="true" />
      {section.layout_type === "full-bleed" && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,11,13,0.88),rgba(11,11,13,0.52)_45%,rgba(11,11,13,0.9))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(215,180,124,0.18),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,135,150,0.16),transparent_55%)]" />
        </>
      )}

      <div className="section-content relative z-10 mx-auto max-w-6xl">
        {/* Title */}
        <div
          className={`section-title-block relative mb-12 ${
            section.layout_type === "centered" || section.layout_type === "full-bleed"
              ? "text-center"
              : ""
          }`}
        >
          {chapter && (
            <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-outline font-heading text-[6rem] uppercase tracking-[0.16em] text-ivory/20 md:text-[9rem]">
              {chapter}
            </span>
          )}
          <h2 className="font-heading text-3xl font-bold uppercase tracking-[0.08em] text-ivory md:text-5xl">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-4 text-[12px] uppercase tracking-[0.36em] text-ivory/55">
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Layout-specific content */}
        {section.layout_type === "centered" && (
          <CenteredContent content={content} />
        )}
        {section.layout_type === "grid" && <GridContent content={content} />}
        {section.layout_type === "full-bleed" && (
          <FullBleedContent content={content} />
        )}
        {(section.layout_type === "text-left" ||
          section.layout_type === "text-right") && (
          <TextSideContent
            content={content}
            direction={section.layout_type}
          />
        )}
      </div>
    </section>
  );
}

function CenteredContent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const text = content.text as string;
  const image = typeof content.image === "string" ? content.image : "";
  const words = text ? text.split(/\s+/) : [];

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="centered-text text-lg leading-relaxed text-ivory/75 md:text-xl">
        {words.map((word, i) => (
          <span key={i} className="word inline-block" style={{ marginRight: "0.3em" }}>
            {word}
          </span>
        ))}
      </p>
      {image && (
        <div className="mt-10">
          <div
            className="centered-image mx-auto aspect-video max-w-2xl rounded-xl bg-cover bg-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            style={{ backgroundImage: `url(${image})` }}
          />
        </div>
      )}
    </div>
  );
}

function GridContent({ content }: { content: Record<string, unknown> }) {
  const cards = (content.cards || []) as Array<{
    icon: string;
    title: string;
    description: string;
  }>;

  return (
    <div className="grid-container grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = iconMap[card.icon] || Compass;
        return (
          <div
            key={card.title}
            className="grid-card artisan-card rounded-[1.5rem] border border-ivory/15 bg-ivory/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="glint" aria-hidden="true" />
            <div className="icon-circle mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-ivory/20 bg-ivory/10">
              <Icon size={24} className="text-gold" />
            </div>
            <h3 className="font-heading text-lg font-bold uppercase tracking-[0.08em] text-ivory">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ivory/70">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function FullBleedContent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const images = (content.images as string[]) || [];
  const hasImages = images.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoKey, setAutoKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const captions = (content.captions as string[]) || [];
  const text = typeof content.text === "string" ? content.text : "";
  const fallbackCaption =
    text
      .split(".")
      .map((sentence) => sentence.trim())
      .filter(Boolean)[0] || "";
  const safeIndex = hasImages ? Math.min(activeIndex, images.length - 1) : 0;
  const activeCaption = captions[safeIndex] || fallbackCaption;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduceMotion(media.matches);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!hasImages || reduceMotion || images.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [autoKey, reduceMotion, images.length, hasImages]);

  const goTo = (index: number) => {
    setActiveIndex(index);
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
    <div className="text-center">
      <p className="desert-overlay-text mx-auto max-w-3xl text-lg leading-relaxed text-ivory/80 md:text-xl">
        {content.text as string}
      </p>
      {hasImages && (
        <>
          <div className="gallery-stage group clip-corner relative mt-12 aspect-[5/6] overflow-hidden border border-ivory/20 bg-ivory/5 shadow-[0_50px_140px_rgba(0,0,0,0.5)] sm:aspect-[16/9]">
            {images.map((img, i) => (
              <div
                key={`${img}-${i}`}
                className={`gallery-image absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out transition-transform ${
                  i === safeIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
                style={{
                  backgroundImage: `url(${img})`,
                  backgroundColor: "#d4c4a8",
                  willChange: "transform, opacity",
                }}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(11,11,13,0.72),rgba(11,11,13,0.2)_45%,rgba(11,11,13,0.78))]" />

            <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.36em] text-ivory/70">
              <span>Archives du désert</span>
              <span className="h-px w-14 bg-ivory/25" />
              <span>
                {String(safeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Image précédente"
                  className="absolute left-5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ivory/30 bg-ivory/10 p-3 text-ivory/80 opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md transition hover:bg-ivory/20 md:opacity-0 md:group-hover:opacity-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Image suivante"
                  className="absolute right-5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-ivory/30 bg-ivory/10 p-3 text-ivory/80 opacity-100 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-md transition hover:bg-ivory/20 md:opacity-0 md:group-hover:opacity-100"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 bg-gradient-to-t from-midnight/80 via-midnight/45 to-transparent px-6 pb-6 pt-16 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="eyebrow text-ivory/70">
                        Cadre {String(safeIndex + 1).padStart(2, "0")}
                      </p>
                      {activeCaption && (
                        <p className="mt-2 max-w-xl text-sm text-ivory/80">
                          {activeCaption}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-ivory/20 bg-ivory/10 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-ivory/70 backdrop-blur-md">
                      {images.map((_, i) => (
                        <button
                          key={`dot-${i}`}
                          type="button"
                          onClick={() => goTo(i)}
                          aria-label={`Aller à l'image ${i + 1}`}
                          className={`h-1.5 w-6 rounded-full transition ${
                            i === safeIndex ? "bg-ivory/80" : "bg-ivory/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TextSideContent({
  content,
  direction,
}: {
  content: Record<string, unknown>;
  direction: "text-left" | "text-right";
}) {
  const quotes = (content.quotes || []) as Array<{
    name: string;
    location: string;
    text: string;
    rating: number;
  }>;

  if (quotes.length > 0) {
    return (
      <div className="space-y-8">
        {quotes.map((quote) => (
          <blockquote
            key={quote.name}
            className={`testimonial-quote artisan-card flex flex-col gap-4 rounded-[1.75rem] border border-ivory/15 bg-ivory/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:flex-row ${
              direction === "text-right" ? "md:flex-row-reverse" : ""
            }`}
            style={{ perspective: "800px", willChange: "transform, opacity" }}
          >
            <div className="glint" aria-hidden="true" />
            <div className="flex-1">
              <div className="mb-2 flex gap-1">
                {Array.from({ length: quote.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="star-icon fill-gold text-gold"
                  />
                ))}
              </div>
              <p className="text-ivory/80 italic leading-relaxed">
                &ldquo;{quote.text}&rdquo;
              </p>
              <footer className="mt-4">
                <cite className="not-italic">
                  <span className="font-semibold text-ivory">
                    {quote.name}
                  </span>
                  <span className="ml-2 text-sm text-ivory/50">
                    {quote.location}
                  </span>
                </cite>
              </footer>
            </div>
          </blockquote>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-8 md:flex-row ${
        direction === "text-right" ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="flex-1">
        <p className="text-lg leading-relaxed text-ivory/80">
          {content.text as string}
        </p>
      </div>
      {typeof content.image === "string" && (
        <div className="flex-1">
          <div
            className="centered-image aspect-video rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${content.image})` }}
          />
        </div>
      )}
    </div>
  );
}
