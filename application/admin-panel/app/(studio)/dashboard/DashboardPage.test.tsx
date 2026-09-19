import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

vi.mock("@/services/studio", () => ({
  fetchDashboard: vi.fn(),
}));

import { fetchDashboard } from "@/services/studio";

describe("Dashboard", () => {
  it("renders metrics", async () => {
    vi.mocked(fetchDashboard).mockResolvedValue({
      products: 4,
      published_products: 2,
      customers: 9,
      pending_reservations: 1,
      reservations: 3,
      open_inquiries: 5,
    });
    render(<DashboardPage />);
    expect(await screen.findByText("Total units")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Published units")).toBeInTheDocument();
  });

  it("shows API errors", async () => {
    vi.mocked(fetchDashboard).mockRejectedValue(new Error("down"));
    render(<DashboardPage />);
    expect(await screen.findByText(/Could not load dashboard/i)).toBeInTheDocument();
  });
});
