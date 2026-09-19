import { render, screen } from "@testing-library/react";
import { ProductForm } from "./ProductForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/services/studio", () => ({
  fetchCategories: vi.fn().mockResolvedValue([{ id: "c1", name: "Bedrooms", slug: "bedrooms", description: null, is_active: true, sort_order: 1 }]),
  fetchProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  addProductImage: vi.fn(),
  deleteProductImage: vi.fn(),
}));

describe("Product form", () => {
  it("renders unit fields", async () => {
    render(<ProductForm />);
    expect(await screen.findByText(/New unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Slug/i)).toBeInTheDocument();
  });
});
