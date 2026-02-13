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

export function Navigation({ sections }: { sections: NavSection[] }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRail, setShowRail] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

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

      <div className="fixed left-5 top-5 z-40 hidden md:block">
        <button
          onClick={() => scrollToSection("hero")}
          className="rounded-full border border-ivory/20 bg-ivory/5 px-5 py-3 text-left backdrop-blur-md transition hover:border-ivory/40"
        >
          <p className="font-heading text-2xl leading-none text-ivory">Gnaoua Tours</p>
        </button>
      </div>

      <nav
        className={`fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 transition-opacity duration-500 md:flex ${
          showRail ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Navigation des sections"
      >
        {sections.map(({ id, label }, i) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className={`group flex w-40 items-center justify-between border-b border-ivory/15 px-1.5 py-3 text-[10px] uppercase tracking-[0.32em] transition ${
              activeSection === id
                ? "text-ivory"
                : "text-ivory/55 hover:text-ivory"
            }`}
            aria-label={`Aller à ${label}`}
            title={label}
          >
            <span className="flex items-center gap-3">
              <span className={`nav-dot ${activeSection === id ? "nav-dot--active" : ""}`} />
              <span>{label}</span>
            </span>
            <span className={`font-heading text-sm tracking-[0.08em] ${activeSection === id ? "text-gold" : "text-ivory/45"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </nav>

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
