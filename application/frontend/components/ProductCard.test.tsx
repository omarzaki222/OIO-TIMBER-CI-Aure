import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/api";

const product: Product = {
  id: "1",
  category_id: "c1",
  name: "Sample Oak Bench",
  slug: "sample-oak-bench",
  short_description: "A quiet bench.",
  description: null,
  specifications: {},
  dimensions: null,
  materials: null,
  finish: null,
  price: null,
  price_on_request: true,
  status: "PUBLISHED",
  is_featured: true,
  images: [],
};

describe("ProductCard", () => {
  it("renders unit name", () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText("Sample Oak Bench")).toBeInTheDocument();
  });
});
