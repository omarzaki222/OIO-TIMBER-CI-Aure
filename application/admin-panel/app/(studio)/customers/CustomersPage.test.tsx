import { render, screen } from "@testing-library/react";
import CustomersPage from "./page";

vi.mock("@/services/studio", () => ({
  fetchCustomers: vi.fn(),
}));
import { fetchCustomers } from "@/services/studio";

describe("Customers", () => {
  it("lists emails", async () => {
    vi.mocked(fetchCustomers).mockResolvedValue([
      { id: "u1", email: "pat@example.com", first_name: "Pat", last_name: "Lee", phone: null, role: "CUSTOMER", is_active: true, created_at: null },
    ]);
    render(<CustomersPage />);
    expect(await screen.findByText("pat@example.com")).toBeInTheDocument();
  });
});
