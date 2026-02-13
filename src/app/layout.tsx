import type { Metadata } from "next";
import { bodoni, spaceGrotesk } from "@/styles/fonts";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gnaoua Tours - Expéditions dans le Sahara",
    template: "%s | Gnaoua Tours",
  },
  description:
    "Agence de voyages premium spécialisée dans les expéditions du Sahara algérien. Explorez Djanet, Tadrart Rouge, Illizi et Ihrir avec des guides touaregs experts.",
  keywords: [
    "sahara",
    "algérie",
    "expédition désert",
    "djanet",
    "tadrart rouge",
    "ihrir",
    "tassili",
    "tuareg",
    "voyage",
  ],
  authors: [{ name: "Gnaoua Tours" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Gnaoua Tours",
    title: "Gnaoua Tours - Expéditions dans le Sahara",
    description:
      "Agence de voyages premium spécialisée dans les expéditions du Sahara algérien. Découvrez la magie du désert.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gnaoua Tours - Expéditions dans le Sahara",
    description:
      "Agence de voyages premium spécialisée dans les expéditions du Sahara algérien.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${bodoni.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <a
          href="#hero"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-midnight focus:outline-none"
        >
          Aller au contenu
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
