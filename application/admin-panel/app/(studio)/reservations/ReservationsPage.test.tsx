import { render, screen } from "@testing-library/react";
import ReservationsPage from "./page";

vi.mock("@/services/studio", () => ({
  fetchReservations: vi.fn(),
}));
import { fetchReservations } from "@/services/studio";

describe("Reservations", () => {
  it("lists requests", async () => {
    vi.mocked(fetchReservations).mockResolvedValue([
      { id: "r1", user_id: "u1", product_id: "p1", status: "PENDING", customer_note: null, admin_note: null },
    ]);
    render(<ReservationsPage />);
    expect(await screen.findByText(/Request r1/i)).toBeInTheDocument();
  });
});
