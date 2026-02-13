import { render, screen } from "@testing-library/react";
import { BookingSection } from "@/components/website/booking-section";
import type { Program } from "@/types/program";

// Mock GSAP
jest.mock("gsap", () => ({
  gsap: {
    registerPlugin: jest.fn(),
    context: jest.fn(() => ({ revert: jest.fn() })),
    fromTo: jest.fn(),
    to: jest.fn(),
  },
  ScrollTrigger: {},
}));

jest.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPrograms: Program[] = [
  {
    id: "1",
    title: "Tadrart Rouge Expedition",
    slug: "tadrart-rouge",
    description: "A 5-day expedition",
    duration: "5 days",
    start_date: null,
    end_date: null,
    price_eur: 1200,
    price_dzd: 180000,
    difficulty: "moderate",
    highlights: [],
    itinerary: [],
    gallery_urls: [],
    cover_image: null,
    display_order: 1,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
];

describe("BookingSection", () => {
  it("renders the booking form", () => {
    render(<BookingSection programs={mockPrograms} />);
    expect(screen.getByText("Book Your Journey")).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<BookingSection programs={mockPrograms} />);
    expect(screen.getByLabelText("Full Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Email *")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Group Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<BookingSection programs={mockPrograms} />);
    expect(screen.getByText("Send Inquiry")).toBeInTheDocument();
  });

  it("has booking section id", () => {
    const { container } = render(
      <BookingSection programs={mockPrograms} />
    );
    expect(container.querySelector("#booking")).toBeInTheDocument();
  });
});
