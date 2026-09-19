import { render, screen } from "@testing-library/react";
import { AuthGate } from "./AuthGate";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

vi.mock("@/hooks/auth-context", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/hooks/auth-context";

const mocked = vi.mocked(useAuth);

describe("AuthGate", () => {
  beforeEach(() => replace.mockReset());

  it("redirects when unauthenticated", () => {
    mocked.mockReturnValue({ user: null, loading: false, login: vi.fn(), logout: vi.fn() });
    render(
      <AuthGate>
        <p>secret</p>
      </AuthGate>,
    );
    expect(replace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("denies customers", () => {
    mocked.mockReturnValue({
      user: { id: "1", email: "c@x.com", first_name: "A", last_name: null, phone: null, role: "CUSTOMER", is_active: true },
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
    render(
      <AuthGate>
        <p>secret</p>
      </AuthGate>,
    );
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });
});
