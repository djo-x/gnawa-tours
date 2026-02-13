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

describe("Navigation", () => {
  it("renders the hamburger menu button", () => {
    render(<Navigation />);
    const menuButton = screen.getByLabelText("Open menu");
    expect(menuButton).toBeInTheDocument();
  });

  it("renders section navigation dots", () => {
    render(<Navigation />);
    const nav = screen.getByLabelText("Section navigation");
    expect(nav).toBeInTheDocument();
  });

  it("has correct aria labels for section buttons", () => {
    render(<Navigation />);
    expect(screen.getByLabelText("Go to Home")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to Programs")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to Book")).toBeInTheDocument();
  });
});
