import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/website/hero-section";
import type { HeroSettings } from "@/types/section";

// Mock GSAP
jest.mock("gsap", () => ({
  gsap: {
    registerPlugin: jest.fn(),
    context: jest.fn(() => ({ revert: jest.fn() })),
    fromTo: jest.fn(),
    to: jest.fn(),
    timeline: jest.fn(() => ({
      fromTo: jest.fn().mockReturnThis(),
      to: jest.fn().mockReturnThis(),
    })),
    ticker: {
      add: jest.fn(),
      remove: jest.fn(),
      lagSmoothing: jest.fn(),
    },
  },
  ScrollTrigger: {},
}));

jest.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

const mockHero: HeroSettings = {
  id: "1",
  headline: "Découvrir le Sahara algérien",
  subheadline: "Voyagez à travers des paysages ancestraux",
  cta_text: "Commencer l’aventure",
  background_image: "/images/hero.jpg",
  overlay_opacity: 0.45,
  created_at: "",
  updated_at: "",
};

describe("HeroSection", () => {
  it("renders headline text", () => {
    render(<HeroSection hero={mockHero} />);
    expect(
      screen.getByText("Découvrir le Sahara algérien")
    ).toBeInTheDocument();
  });

  it("renders subheadline", () => {
    render(<HeroSection hero={mockHero} />);
    expect(
      screen.getByText("Voyagez à travers des paysages ancestraux")
    ).toBeInTheDocument();
  });

  it("renders CTA button", () => {
    render(<HeroSection hero={mockHero} />);
    expect(
      screen.getByText("Commencer l’aventure")
    ).toBeInTheDocument();
  });

  it("has hero section id for navigation", () => {
    const { container } = render(<HeroSection hero={mockHero} />);
    expect(container.querySelector("#hero")).toBeInTheDocument();
  });
});
