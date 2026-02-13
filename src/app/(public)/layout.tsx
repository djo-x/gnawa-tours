import { Navigation } from "@/components/website/navigation";
import { Footer } from "@/components/website/footer";
import { LenisProvider } from "@/providers/lenis-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <Navigation />
      <main className="relative">{children}</main>
      <Footer />
    </LenisProvider>
  );
}
