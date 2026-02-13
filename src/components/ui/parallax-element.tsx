"use client";

import { useParallax } from "@/hooks/use-parallax";
import type { ParallaxOptions } from "@/hooks/use-parallax";
import { cn } from "@/lib/utils";
import React from "react";

interface ParallaxElementProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  scrub?: number | boolean;
  options?: ParallaxOptions;
  children: React.ReactNode;
}

export function ParallaxElement({
  speed = 0.5,
  scrub = true,
  options,
  className,
  children,
  ...props
}: ParallaxElementProps) {
  const ref = useParallax<HTMLDivElement>(options ?? speed, scrub);

  return (
    <div ref={ref} className={cn("relative will-change-transform", className)} {...props}>
      {children}
    </div>
  );
}

