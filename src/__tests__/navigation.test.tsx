import { render, screen } from "@testing-library/react";
import { Navigation } from "@/components/website/navigation";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <span {...props}>{children}</span>
    ),
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

const sections = [
  { id: "hero", label: "Accueil" },
  { id: "programs", label: "Programmes" },
  { id: "booking", label: "Réserver" },
];

describe("Navigation", () => {
  it("renders the hamburger menu button", () => {
    render(<Navigation sections={sections} />);
    const menuButton = screen.getByLabelText("Ouvrir le menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("renders section navigation dots", () => {
    render(<Navigation sections={sections} />);
    const nav = screen.getByLabelText("Navigation des sections");
    expect(nav).toBeInTheDocument();
  });

  it("has correct aria labels for section buttons", () => {
    render(<Navigation sections={sections} />);
    expect(screen.getByLabelText("Aller à Accueil")).toBeInTheDocument();
    expect(screen.getByLabelText("Aller à Programmes")).toBeInTheDocument();
    expect(screen.getByLabelText("Aller à Réserver")).toBeInTheDocument();
  });
});
