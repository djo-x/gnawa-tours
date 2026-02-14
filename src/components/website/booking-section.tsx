"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Program } from "@/types/program";
import { useRegionalPricing } from "@/hooks/use-regional-pricing";

gsap.registerPlugin(ScrollTrigger);

interface BookingSectionProps {
  programs: Program[];
  originCountry?: string;
  pricingLocale?: string;
}

export function BookingSection({
  programs,
  originCountry,
  pricingLocale,
}: BookingSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const { originCountry: detectedOrigin } = useRegionalPricing();
  const resolvedOrigin = originCountry || detectedOrigin;
  const locale = pricingLocale || "fr-FR";
  const selectedProgram = programs.find((program) => program.id === selectedProgramId);
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

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Section entrance: clip-from-bottom scrub
      gsap.fromTo(
        sectionRef.current,
        { clipPath: "inset(5% 0 0 0)" },
        {
          clipPath: "inset(0 0 0 0)",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: isMobile ? "top 95%" : "top 85%",
            end: isMobile ? "top 70%" : "top 50%",
            scrub: true,
          },
        }
      );

      // Title: scrub-driven clip-path reveal
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: isMobile ? "top 80%" : "top 70%",
              end: isMobile ? "top 60%" : "top 40%",
              scrub: true,
            },
          }
        );
      }

      // Form fields: individual scrub reveals
      const fields = sectionRef.current?.querySelectorAll(".form-field");
      if (fields && fields.length > 0) {
        fields.forEach((field) => {
          gsap.fromTo(
            field,
            { y: 30, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: field,
                start: isMobile ? "top 95%" : "top 85%",
                end: isMobile ? "top 75%" : "top 60%",
                scrub: true,
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const handleSelect = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (typeof customEvent.detail === "string") {
        setSelectedProgramId(customEvent.detail);
      }
    };

    window.addEventListener("program:select", handleSelect as EventListener);
    return () => window.removeEventListener("program:select", handleSelect as EventListener);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const programId = selectedProgramId || (formData.get("program_id") as string);
    const data = {
      full_name: formData.get("full_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      program_id: programId,
      group_size: parseInt(formData.get("group_size") as string) || 1,
      message: formData.get("message") as string,
      origin_country: resolvedOrigin,
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Échec de l’envoi de la demande");
      }

      toast.success("Demande envoyée ! Nous vous contacterons très vite.");
      (e.target as HTMLFormElement).reset();
      setSelectedProgramId("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Une erreur est survenue"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="booking"
      ref={sectionRef}
      className="scene-section booking-surface border-t border-ivory/10 px-6 py-16 text-ivory md:py-20"
    >
      <div className="section-ornament" aria-hidden="true" />
      <div className="section-ornament section-ornament--bottom" aria-hidden="true" />
      <div className="booking-content artisan-card mx-auto max-w-2xl rounded-[2rem] border border-ivory/15 bg-ivory/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.5)] md:p-10">
        <div className="glint" aria-hidden="true" />
        <div ref={titleRef} className="mb-12 text-center">
          <p className="eyebrow mb-3">Demander une expédition</p>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-[0.08em] md:text-5xl">
            Réservez votre voyage
          </h2>
          <p className="mt-4 text-ivory/60">
            Prêt à explorer le Sahara ? Envoyez-nous une demande et nous créerons
            votre expédition idéale.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          suppressHydrationWarning
          data-lpignore="true"
          data-form-type="other"
          autoComplete="off"
        >
          <div className="form-field grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-[11px] uppercase tracking-[0.32em] text-ivory/65">
                Nom complet *
              </Label>
              <Input
                id="full_name"
                name="full_name"
                required
                placeholder="Votre nom complet"
                autoComplete="name"
                data-lpignore="true"
                className="border-ivory/20 bg-ivory/10 text-ivory placeholder:text-ivory/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.32em] text-ivory/65">
                E-mail *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="votre@email.com"
                autoComplete="email"
                data-lpignore="true"
                className="border-ivory/20 bg-ivory/10 text-ivory placeholder:text-ivory/30"
              />
            </div>
          </div>

          <div className="form-field grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[11px] uppercase tracking-[0.32em] text-ivory/65">
                Téléphone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+213 ..."
                autoComplete="tel"
                data-lpignore="true"
                className="border-ivory/20 bg-ivory/10 text-ivory placeholder:text-ivory/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program_id" className="text-[11px] uppercase tracking-[0.32em] text-ivory/65">
                Programme
              </Label>
              <Select
                name="program_id"
                value={selectedProgramId || undefined}
                onValueChange={setSelectedProgramId}
              >
                <SelectTrigger className="w-full border-ivory/20 bg-ivory/10 text-ivory">
                  <SelectValue placeholder="Choisir un programme" />
                </SelectTrigger>
                <SelectContent className="border-ivory/15 bg-[#0b0b0d]/95 text-ivory shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                  {programs.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="cursor-pointer focus:bg-ivory/10 focus:text-ivory"
                    >
                      <span className="flex flex-col">
                        <span className="text-sm">{p.title}</span>
                        <span className="text-[10px] uppercase tracking-[0.26em] text-ivory/50">
                          {getDateRange(p.start_date, p.end_date)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/45">
                {selectedProgram
                  ? `Dates : ${getDateRange(selectedProgram.start_date, selectedProgram.end_date)}`
                  : "Astuce : cliquez sur une carte pour pré‑sélectionner"}
              </p>
            </div>
          </div>

          <div className="form-field grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="group_size" className="text-[11px] uppercase tracking-[0.32em] text-ivory/65">
                Taille du groupe
              </Label>
              <Input
                id="group_size"
                name="group_size"
                type="number"
                min="1"
                max="20"
                defaultValue="1"
                data-lpignore="true"
                className="border-ivory/20 bg-ivory/10 text-ivory"
              />
            </div>
          </div>

          <div className="form-field space-y-2">
            <Label htmlFor="message" className="text-[11px] uppercase tracking-[0.32em] text-ivory/65">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Parlez-nous de votre expérience idéale dans le désert..."
              data-lpignore="true"
              className="border-ivory/20 bg-ivory/10 text-ivory placeholder:text-ivory/30"
            />
          </div>

          <div className="form-field">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full border border-ivory/30 bg-ivory/10 py-6 text-xs font-semibold uppercase tracking-[0.32em] text-ivory transition hover:bg-gold hover:text-midnight"
            >
              {isSubmitting ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
