import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

const login = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/hooks/auth-context", () => ({
  useAuth: () => ({ login }),
}));

describe("Admin login", () => {
  beforeEach(() => login.mockReset());

  it("renders studio login", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /enter studio/i })).toBeInTheDocument();
  });

  it("denies a customer account", async () => {
    login.mockResolvedValue({ role: "CUSTOMER", email: "a@example.com" });
    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/email/i), "a@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password12");
    await userEvent.click(screen.getByRole("button", { name: /enter studio/i }));
    expect(await screen.findByText(/access denied/i)).toBeInTheDocument();
  });
});
