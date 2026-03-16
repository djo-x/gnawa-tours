"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/gnaoua_tours1/", label: "Instagram" },
];

const quickLinks = [
  { label: "Programmes", href: "#programs" },
  { label: "Notre histoire", href: "#our-story" },
  { label: "Galerie", href: "#the-desert" },
  { label: "Réserver", href: "#booking" },
];

type FooterProps = {
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  siteName?: string | null;
};

const fallbackContact = {
  email: "info@gnawatours.com",
  phone: "+213 555 123 456",
  address: "Djanet, wilaya d’Illizi, Algérie",
  siteName: "Gnaoua Tours",
};

export function Footer({
  contactEmail,
  contactPhone,
  address,
  siteName,
}: FooterProps) {
  const resolvedEmail = contactEmail || fallbackContact.email;
  const resolvedPhone = contactPhone || fallbackContact.phone;
  const resolvedAddress = address || fallbackContact.address;
  const resolvedSiteName = siteName || fallbackContact.siteName;
  const footerRef = useRef<HTMLElement>(null);
  const waveRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cols = footerRef.current?.querySelectorAll(".footer-col");
      if (cols && cols.length > 0) {
        gsap.fromTo(
          cols,
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 90%",
              end: "top 55%",
              scrub: true,
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  // Observe footer visibility for wave animation
  useEffect(() => {
    const footerEl = footerRef.current;
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(footerEl);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Subtle wave animation inspired by animated-footer
  useEffect(() => {
    let t = 0;

    const animateWave = () => {
      const waveElements = waveRefs.current;
      let offset = 0;

      waveElements.forEach((element, index) => {
        if (element) {
          offset += Math.max(0, 10 * Math.sin((t + index) * 0.28));
          element.style.transform = `translateY(${index * 0.4 + offset}px)`;
        }
      });

      t += 0.08;
      animationFrameRef.current = requestAnimationFrame(animateWave);
    };

    if (isVisible) {
      if (!animationFrameRef.current) {
        animateWave();
      }
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isVisible]);

  const handleBackToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={footerRef} className="scene-section border-t border-ivory/10 text-ivory/80">
      <div className="section-ornament" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div className="footer-col artisan-card rounded-[1.75rem] border border-ivory/12 bg-ivory/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="glint" aria-hidden="true" />
            <h3 className="font-heading text-2xl uppercase tracking-[0.12em] text-ivory">{resolvedSiteName}</h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/60">
              Expéditions sahariennes premium en Algérie. Découvrez la magie de Djanet,
              Tadrart Rouge et Ihrir.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col artisan-card rounded-[1.75rem] border border-ivory/12 bg-ivory/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="glint" aria-hidden="true" />
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-ivory/60">
              Liens rapides
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm uppercase tracking-[0.12em] text-ivory/70 transition-colors hover:text-ivory"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col artisan-card rounded-[1.75rem] border border-ivory/12 bg-ivory/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="glint" aria-hidden="true" />
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-ivory/60">
              Contact
            </h4>
            <ul className="space-y-3">
              {resolvedEmail && (
                <li className="flex items-center gap-2 text-sm text-ivory/70">
                  <Mail size={14} className="text-gold" />
                  {resolvedEmail}
                </li>
              )}
              {resolvedPhone && (
                <li className="flex items-center gap-2 text-sm text-ivory/70">
                  <Phone size={14} className="text-gold" />
                  {resolvedPhone}
                </li>
              )}
              {resolvedAddress && (
                <li className="flex items-center gap-2 text-sm text-ivory/70">
                  <MapPin size={14} className="text-gold" />
                  {resolvedAddress}
                </li>
              )}
            </ul>
            <div className="mt-6 flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ivory/60 transition-colors hover:text-ivory"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-ivory/10" />

        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:justify-between">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.36em] text-ivory/50">
              Conçu comme un carnet de sable et de silence.
            </p>
            <p className="text-[10px] uppercase tracking-[0.32em] text-ivory/40">
              &copy; {new Date().getFullYear()} {resolvedSiteName}. Tous droits réservés.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBackToTop}
            className="text-[10px] uppercase tracking-[0.32em] text-ivory/55 transition-colors hover:text-ivory"
          >
            Retour en haut
          </button>
        </div>
      </div>

      {/* Wave footer inspired by animated-footer, adapted to desert palette */}
      <div
        aria-hidden="true"
        className="mt-4 overflow-hidden"
        style={{ height: 120 }}
      >
        <div>
          {Array.from({ length: 23 }).map((_, index) => (
            <div
              key={index}
              ref={(el) => {
                waveRefs.current[index] = el;
              }}
              style={{
                height: `${index + 1}px`,
                background:
                  "linear-gradient(to right, rgba(215,180,124,0.8), rgba(246,241,231,0.9))",
                transition: "transform 0.12s ease",
                willChange: "transform",
                marginTop: "-2px",
                opacity: 0.16,
              }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
