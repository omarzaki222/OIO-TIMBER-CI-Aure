import { render, screen } from "@testing-library/react";
import LoginPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/auth-context", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

describe("Login form", () => {
  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /enter/i })).toBeInTheDocument();
  });
});
