import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const EASE = {
  smooth: "expo.out",
  smoothInOut: "expo.inOut",
  snap: "expo.out",
  elastic: "elastic.out(1, 0.5)",
  bounce: "bounce.out",
  cinematic: "expo.inOut",
  reveal: "expo.out",
} as const;

export const DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 1,
  reveal: 1.2,
} as const;
