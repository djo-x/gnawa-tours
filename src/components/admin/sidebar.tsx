"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Layers,
  CalendarCheck,
  Image as ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/programs", label: "Programmes", icon: Map },
  { href: "/admin/sections", label: "Sections", icon: Layers },
  { href: "/admin/bookings", label: "Réservations", icon: CalendarCheck },
  { href: "/admin/media", label: "Médias", icon: ImageIcon },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  const widthClass = collapsed ? "md:w-20" : "md:w-72";
  const mobileTranslate = mobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur md:hidden">
        <Link href="/admin/dashboard" className="font-heading text-base font-bold text-primary">
          Gnaoua Admin
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 hover:bg-muted"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      <aside
        className={`glass-panel fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border/70 transition-transform duration-300 md:translate-x-0 ${widthClass} ${mobileTranslate}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/70 px-4">
          <Link
            href="/admin/dashboard"
            className={`font-heading text-lg font-bold text-primary ${collapsed ? "md:hidden" : ""}`}
          >
            Gnaoua Admin
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-2 hover:bg-muted md:hidden"
              aria-label="Fermer la barre latérale"
            >
              <X size={18} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-md p-2 hover:bg-muted md:inline-flex"
              aria-label={collapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(215,167,93,0.28)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} />
                <span className={collapsed ? "md:hidden" : ""}>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border/70 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} />
            <span className={collapsed ? "md:hidden" : ""}>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
