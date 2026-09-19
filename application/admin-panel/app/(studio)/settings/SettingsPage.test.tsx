import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "./page";

const logout = vi.fn();
vi.mock("@/hooks/auth-context", () => ({
  useAuth: () => ({
    user: { email: "admin@example.com", first_name: "Ops", last_name: "Lead", role: "ADMIN" },
    logout,
  }),
}));

describe("Settings", () => {
  it("shows admin account and logout", async () => {
    render(<SettingsPage />);
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /sign out/i }));
    expect(logout).toHaveBeenCalled();
  });
});
