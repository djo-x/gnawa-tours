"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cinematicScrollTo } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

type NavSection = {
  id: string;
  label: string;
};

type NavigationProps = {
  sections: NavSection[];
  siteName?: string | null;
  siteLogo?: string | null;
};

export function Navigation({ sections, siteName, siteLogo }: NavigationProps) {
  const [activeSection, setActiveSection] = useState("hero");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRail, setShowRail] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const resolvedSiteName = siteName || "Gnaoua Tours";
  const cleanSiteLogo =
    typeof siteLogo === "string" && siteLogo.trim().length > 0
      ? siteLogo.trim()
      : null;
  const showHeroBrand = activeSection === "hero" && !isMenuOpen;

  function scrollToSection(sectionId: string) {
    cinematicScrollTo(sectionId);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setShowRail(true), 1100);

    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 h-px bg-ivory/10">
        <div
          ref={progressBarRef}
          className="h-full origin-left bg-gradient-to-r from-gold via-ivory/70 to-gold"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <div
        className={`fixed left-4 top-4 z-40 hidden transition-all duration-500 md:block ${
          showHeroBrand
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <button
          onClick={() => scrollToSection("hero")}
          className="group relative inline-flex items-center text-left transition duration-300"
          aria-label={`Retour à l’accueil ${resolvedSiteName}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 bg-[radial-gradient(circle,rgba(215,180,124,0.2)_0%,rgba(215,180,124,0.06)_40%,transparent_72%)] blur-xl opacity-65 transition-opacity duration-300 group-hover:opacity-90"
          />
          {cleanSiteLogo ? (
            <span className="relative block h-14 w-40 drop-shadow-[0_16px_38px_rgba(0,0,0,0.45)] sm:h-16 sm:w-48 md:h-20 md:w-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cleanSiteLogo}
                alt={`Logo ${resolvedSiteName}`}
                className="h-full w-full object-contain"
              />
            </span>
          ) : (
            <p className="font-heading text-3xl leading-none text-ivory drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
              {resolvedSiteName}
            </p>
          )}
        </button>
      </div>

      <div
        className={`group/nav fixed right-2 top-1/2 z-40 hidden -translate-y-1/2 flex-col transition-opacity duration-500 md:flex ${
          showRail ? "opacity-100" : "opacity-0"
        }`}
      >
        <nav
          className="flex flex-col gap-0.5 opacity-50 transition-opacity duration-300 hover:opacity-100"
          aria-label="Navigation des sections"
        >
          {sections.map(({ id, label }, i) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`group flex w-32 items-center justify-between border-b border-ivory/10 px-1 py-2.5 text-[10px] uppercase tracking-[0.28em] transition-colors ${
                activeSection === id
                  ? "text-ivory border-ivory/20"
                  : "text-ivory/50 hover:text-ivory hover:border-ivory/15"
              }`}
              aria-label={`Aller à ${label}`}
              title={label}
            >
              <span className="flex items-center gap-2.5">
                <span className={`nav-dot ${activeSection === id ? "nav-dot--active" : ""}`} />
                <span>{label}</span>
              </span>
              <span className={`font-heading text-xs tracking-[0.06em] ${activeSection === id ? "text-gold" : "text-ivory/40"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed right-5 top-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-ivory/25 bg-ivory/5 text-ivory backdrop-blur-md transition-colors hover:bg-ivory/10"
        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0b0d]/94 backdrop-blur-xl">
          <nav className="glass-panel rounded-[2rem] border border-ivory/10 p-10">
            <div className="flex flex-col items-center gap-6">
              {sections.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`font-heading text-3xl uppercase tracking-[0.12em] transition-colors md:text-5xl ${
                    activeSection === id ? "text-gold" : "text-ivory/70 hover:text-ivory"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
