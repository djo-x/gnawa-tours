"use client";

import { useRef, useEffect } from "react";
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

        <p className="mb-3 text-center text-[10px] uppercase tracking-[0.36em] text-ivory/50">
          Conçu comme un carnet de sable et de silence.
        </p>
        <p className="text-center text-[10px] uppercase tracking-[0.32em] text-ivory/40">
          &copy; {new Date().getFullYear()} {resolvedSiteName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
