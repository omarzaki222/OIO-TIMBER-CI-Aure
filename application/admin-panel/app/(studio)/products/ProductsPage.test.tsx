import { render, screen } from "@testing-library/react";
import ProductsPage from "./page";

vi.mock("@/services/studio", () => ({
  fetchProducts: vi.fn(),
  fetchCategories: vi.fn(),
  deleteProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

import { fetchCategories, fetchProducts } from "@/services/studio";

describe("Products list", () => {
  it("lists units", async () => {
    vi.mocked(fetchCategories).mockResolvedValue([]);
    vi.mocked(fetchProducts).mockResolvedValue([
      {
        id: "p1",
        category_id: "c1",
        name: "Oak sideboard",
        slug: "oak-sideboard",
        short_description: null,
        description: null,
        specifications: {},
        dimensions: null,
        materials: null,
        finish: null,
        price: null,
        price_on_request: true,
        status: "PUBLISHED",
        is_featured: false,
        images: [],
      },
    ]);
    render(<ProductsPage />);
    expect(await screen.findByText("Oak sideboard")).toBeInTheDocument();
  });
});
