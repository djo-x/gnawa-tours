'use client';

import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { cinematicScrollTo } from '@/lib/motion';
import { Drum, Mountain } from 'lucide-react';

type NavSection = {
  id: string;
  label: string;
};

interface HeaderProps {
  sections: NavSection[];
  siteName?: string | null;
  siteLogo?: string | null;
}

export function Header({ sections, siteName, siteLogo }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const resolvedSiteName = siteName || 'Gnaoua Tours';
  const cleanSiteLogo =
    typeof siteLogo === 'string' && siteLogo.trim().length > 0
      ? siteLogo.trim()
      : null;

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleNavClick = (id: string) => {
    cinematicScrollTo(id);
    setOpen(false);
  };

  const primaryCta = sections.find((s) => s.id === 'booking');

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors',
        scrolled &&
          'bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-[0_18px_40px_rgba(0,0,0,0.45)]',
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => handleNavClick('hero')}
          className="group flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-left transition hover:border-ivory/15 hover:bg-ivory/5"
          aria-label="Retour à l’accueil"
        >
          {cleanSiteLogo ? (
            <span className="relative flex h-8 w-28 items-center justify-start sm:h-10 sm:w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cleanSiteLogo}
                alt={`Logo ${resolvedSiteName}`}
                className="h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)]"
              />
            </span>
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ivory/10 text-gold shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
                <Mountain className="h-4 w-4" />
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="font-heading text-xs uppercase tracking-[0.26em] text-ivory">
                  {resolvedSiteName}
                </span>
                <span className="text-[10px] uppercase tracking-[0.32em] text-ivory/60">
                  Sahara algérien
                </span>
              </span>
            </>
          )}
        </button>

        <div className="hidden items-center gap-1.5 md:flex">
          {sections
            .filter((s) => s.id !== 'booking')
            .map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={buttonVariants({
                  variant: 'ghost',
                  className:
                    'rounded-full px-3 text-xs uppercase tracking-[0.24em] text-ivory/70 hover:text-ivory',
                })}
              >
                {link.label}
              </button>
            ))}
          {primaryCta && (
            <Button
              size="sm"
              onClick={() => handleNavClick(primaryCta.id)}
              className="hidden rounded-full border border-gold/60 bg-gold px-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-midnight shadow-[0_14px_40px_rgba(215,180,124,0.55)] hover:bg-gold/90 md:inline-flex"
            >
              {primaryCta.label}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {primaryCta && (
            <Button
              size="xs"
              onClick={() => handleNavClick(primaryCta.id)}
              className="rounded-full border border-gold/60 bg-gold px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-midnight shadow-[0_10px_28px_rgba(215,180,124,0.5)] hover:bg-gold/90"
            >
              {primaryCta.label}
            </Button>
          )}
          <Button
            size="icon-xs"
            variant="outline"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Basculer le menu"
            className="rounded-full border-ivory/35 bg-background/80 text-ivory backdrop-blur-md"
          >
            <MenuToggleIcon open={open} className="size-4" duration={220} />
          </Button>
        </div>
      </nav>

      <MobileMenu
        open={open}
        sections={sections}
        onNavigate={handleNavClick}
      />
    </header>
  );
}

type MobileMenuProps = {
  open: boolean;
  sections: NavSection[];
  onNavigate: (id: string) => void;
};

function MobileMenu({ open, sections, onNavigate }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div
      id="mobile-menu"
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/80',
        'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col border-t border-border/80 backdrop-blur-xl md:hidden',
      )}
    >
      <div className="flex size-full flex-col justify-between gap-4 p-4">
        <div className="grid gap-y-2">
          {sections.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              className={buttonVariants({
                variant: 'ghost',
                className:
                  'justify-start rounded-xl px-3 py-2 text-xs uppercase tracking-[0.28em] text-ivory/80 hover:text-ivory',
              })}
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-ivory/15 bg-ivory/5 px-4 py-3 text-[10px] uppercase tracking-[0.28em] text-ivory/65">
          <span className="flex items-center gap-2">
            <Drum className="h-3.5 w-3.5 text-gold" />
            Rythmes du désert
          </span>
          <span className="text-ivory/45">Djanet · Tadrart · Ihrir</span>
        </div>
      </div>
    </div>
  );
}

