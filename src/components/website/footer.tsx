"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/gnawatours", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/gnawatours", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/@gnawatours", label: "YouTube" },
];

const quickLinks = [
  { label: "Programs", href: "#programs" },
  { label: "Our Story", href: "#our-story" },
  { label: "Gallery", href: "#the-desert" },
  { label: "Book Now", href: "#booking" },
];

export function Footer() {
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
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div className="footer-col rounded-[1.75rem] border border-ivory/12 bg-ivory/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h3 className="font-heading text-2xl uppercase tracking-[0.12em] text-ivory">Gnawa Tours</h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/60">
              Premium Saharan desert expeditions in Algeria. Discover the magic of Djanet,
              Tadrart Rouge, and Ihrir.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col rounded-[1.75rem] border border-ivory/12 bg-ivory/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-ivory/60">
              Quick Links
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
          <div className="footer-col rounded-[1.75rem] border border-ivory/12 bg-ivory/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.4em] text-ivory/60">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-ivory/70">
                <Mail size={14} className="text-gold" />
                info@gnawatours.com
              </li>
              <li className="flex items-center gap-2 text-sm text-ivory/70">
                <Phone size={14} className="text-gold" />
                +213 555 123 456
              </li>
              <li className="flex items-center gap-2 text-sm text-ivory/70">
                <MapPin size={14} className="text-gold" />
                Djanet, Illizi Province, Algeria
              </li>
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

        <p className="text-center text-[10px] uppercase tracking-[0.32em] text-ivory/40">
          &copy; {new Date().getFullYear()} Gnawa Tours. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
