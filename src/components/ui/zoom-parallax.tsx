"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Image {
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  images: Image[];
  className?: string;
}

export function ZoomParallax({ images, className }: ZoomParallaxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReducedMotion(media.matches);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const baseScale = reducedMotion ? 1 : 1.1;
  const maxScale = reducedMotion ? 1.05 : 1.5;

  const scales = [
    useTransform(scrollYProgress, [0, 1], [baseScale, maxScale]),
    useTransform(scrollYProgress, [0, 1], [baseScale, maxScale * 1.1]),
    useTransform(scrollYProgress, [0, 1], [baseScale, maxScale * 1.2]),
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-[260vh] bg-gradient-to-b from-midnight via-[#09090b] to-midnight",
        className,
      )}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {images.map(({ src, alt }, index) => {
          const scale = scales[index % scales.length];

          const layoutClass =
            index === 0
              ? "[&>div]:!top-[8vh] [&>div]:!left-[8vw] [&>div]:!h-[38vh] [&>div]:!w-[40vw]"
              : index === 1
                ? "[&>div]:!top-[20vh] [&>div]:!left-[52vw] [&>div]:!h-[32vh] [&>div]:!w-[32vw]"
                : index === 2
                  ? "[&>div]:!top-[52vh] [&>div]:!left-[12vw] [&>div]:!h-[32vh] [&>div]:!w-[30vw]"
                  : "[&>div]:!top-[40vh] [&>div]:!left-[50vw] [&>div]:!h-[26vh] [&>div]:!w-[26vw]";

          return (
            <motion.div
              key={index}
              style={{ scale }}
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center",
                layoutClass,
              )}
            >
              <div className="relative h-[28vh] w-[36vw] overflow-hidden rounded-3xl border border-ivory/18 bg-ivory/5 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || `Scène du désert ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight/75 via-transparent to-transparent" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

