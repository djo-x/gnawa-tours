import { gsap, ScrollTrigger, EASE, DURATION } from "./gsap-config";

export function fadeInUp(element: Element, trigger?: Element) {
  return gsap.fromTo(
    element,
    { y: 60, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: DURATION.normal,
      ease: EASE.smooth,
      scrollTrigger: {
        trigger: trigger || element,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
}

export function parallaxBg(element: Element, speed = 0.5) {
  return gsap.to(element, {
    yPercent: speed * 100,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

export function staggerChildren(
  container: Element,
  childSelector: string,
  stagger = 0.15
) {
  const children = container.querySelectorAll(childSelector);
  return gsap.fromTo(
    children,
    { y: 40, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: DURATION.normal,
      ease: EASE.smooth,
      stagger,
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    }
  );
}

export function revealText(element: Element) {
  const chars = element.querySelectorAll(".char");
  if (chars.length === 0) return null;

  return gsap.fromTo(
    chars,
    { autoAlpha: 0, y: 20 },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.fast,
      ease: EASE.smooth,
      stagger: 0.03,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
}

export function clipReveal(
  element: Element,
  direction: "left" | "bottom" = "left",
  duration = DURATION.reveal
) {
  const from =
    direction === "left"
      ? "inset(0 100% 0 0)"
      : "inset(0 0 100% 0)";
  const to = "inset(0 0% 0 0)";

  return gsap.fromTo(
    element,
    { clipPath: from },
    {
      clipPath: to,
      duration,
      ease: EASE.reveal,
    }
  );
}

export function pinSection(
  element: Element,
  endMultiplier: string,
  options?: { onUpdate?: (self: ScrollTrigger) => void }
) {
  return ScrollTrigger.create({
    trigger: element,
    start: "top top",
    end: endMultiplier,
    pin: true,
    pinSpacing: true,
    onUpdate: options?.onUpdate,
  });
}

export { gsap, ScrollTrigger, EASE, DURATION };
