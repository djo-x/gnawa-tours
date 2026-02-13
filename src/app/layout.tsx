import type { Metadata } from "next";
import { bodoni, spaceGrotesk } from "@/styles/fonts";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gnawa Tours - Saharan Desert Expeditions",
    template: "%s | Gnawa Tours",
  },
  description:
    "Premium travel agency specializing in Algerian Sahara expeditions. Explore Djanet, Tadrart Rouge, Illizi, and Ihrir with expert Tuareg guides.",
  keywords: [
    "sahara",
    "algeria",
    "desert expedition",
    "djanet",
    "tadrart rouge",
    "ihrir",
    "tassili",
    "tuareg",
    "travel",
  ],
  authors: [{ name: "Gnawa Tours" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Gnawa Tours",
    title: "Gnawa Tours - Saharan Desert Expeditions",
    description:
      "Premium travel agency specializing in Algerian Sahara expeditions. Discover the magic of the desert.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gnawa Tours - Saharan Desert Expeditions",
    description:
      "Premium travel agency specializing in Algerian Sahara expeditions.",
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
    <html lang="en">
      <body className={`${bodoni.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <a
          href="#hero"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-midnight focus:outline-none"
        >
          Skip to content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
