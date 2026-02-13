"use client";

import { HorizontalScroll } from "@/components/website/horizontal-scroll";
import { ParallaxElement } from "@/components/ui/parallax-element";
import { useSmoothReveal } from "@/hooks/use-smooth-reveal";
import Image from "next/image";

const fallbackImages = [
  "https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/1430672/pexels-photo-1430672.jpeg?w=800&q=80",
  "https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=800&q=80",
];

export function ShowcaseScroll({ images = fallbackImages }: { images?: string[] }) {
  const showcaseImages = images.length > 0 ? images : fallbackImages;
  const introRef = useSmoothReveal<HTMLDivElement>({
    direction: "up",
    distance: 45,
    scrub: 1.15,
    start: "top 88%",
    end: "top 48%",
    mode: "fadeSlide",
    stagedChildren: "[data-reveal]",
    stagger: 0.14,
  });

  const outroRef = useSmoothReveal<HTMLParagraphElement>({
    direction: "up",
    distance: 35,
    scrub: 1,
    start: "top 90%",
    end: "top 55%",
    mode: "fadeSlide",
  });

  return (
    <HorizontalScroll
      className="scene-section showcase-surface border-y border-ivory/10 bg-transparent"
      contentClassName="lg:px-24"
    >
      <div className="flex h-full items-center">
        <div ref={introRef} className="w-full pr-0 lg:w-[44vw] lg:pr-24">
          <p data-reveal className="eyebrow mb-3">Chapitre 01 / Notes de terrain</p>
          <h2 data-reveal className="font-heading text-4xl font-bold uppercase leading-[0.9] text-ivory md:text-7xl">
            Chroniques<br />du grès
          </h2>
          <div data-reveal className="mt-6 hairline w-24" />
          <p data-reveal className="mt-6 max-w-xl text-lg text-ivory/70 md:text-xl">
            Parcourez les textures de Djanet : arches sculptées par le vent, strates minérales et vallées ocre.
          </p>
          <div data-reveal className="mt-8 grid grid-cols-2 gap-6 text-[10px] uppercase tracking-[0.32em] text-ivory/55">
            <span>Indice de vent 08</span>
            <span>Temp 18°C</span>
            <span>Visibilité 92%</span>
            <span>Quartz 76%</span>
          </div>
          <p data-reveal className="mt-8 hidden text-[10px] uppercase tracking-[0.4em] text-ivory/45 md:block">
            Défilez pour explorer
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-0">
        {showcaseImages.map((src, i) => (
          <div
            key={i}
            className="clip-corner relative h-[52vh] w-[78vw] overflow-hidden border border-ivory/20 bg-ivory/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:w-[55vw] lg:mx-8 lg:h-[64vh] lg:w-[44vh] shrink-0"
          >
            <div className="absolute left-4 top-4 z-10 border border-ivory/30 bg-ivory/10 px-2 py-1 text-[10px] font-semibold tracking-[0.3em] text-ivory/70">
              {String(i + 1).padStart(2, "0")}
            </div>
            <ParallaxElement
              className="h-full w-full"
              options={{
                speed: i % 2 === 0 ? 0.12 : -0.08,
                axis: "y",
                scrub: 1.2,
                start: "top bottom",
                end: "bottom top",
                disableBelow: 1024,
                clamp: [-25, 25],
                tabletMultiplier: 0.7,
              }}
            >
              <Image
                src={src}
                alt={`Paysage ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </ParallaxElement>
          </div>
        ))}
      </div>
      <div className="flex items-center lg:w-[30vw] lg:pl-10 shrink-0">
        <p ref={outroRef} className="font-heading text-3xl uppercase leading-[0.96] text-ivory md:text-5xl">
          Routes gravées dans la pierre.
        </p>
      </div>
    </HorizontalScroll>
  );
}
