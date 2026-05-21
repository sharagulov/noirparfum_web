import { describe, expect, it } from "vitest";
import { filterProducts, getProduct, getProducts, isPurchasable, sortProducts } from "../src/lib/catalog.js";

describe("catalog data", () => {
  it("contains a refined but complete assortment", () => {
    expect(getProducts().length).toBeGreaterThanOrEqual(9);
    expect(getProduct("minuit").name).toBe("MINUIT");
    expect(getProduct("obsidienne").priceFrom).toBeNull();
  });

  it("filters products by category and query", () => {
    const result = filterProducts(getProducts(), { category: "fragrance", query: "ирис" });
    expect(result.map((product) => product.slug)).toContain("minuit");
    expect(result.every((product) => product.category === "fragrance")).toBe(true);
  });

  it("keeps on-request products out of direct purchase", () => {
    expect(isPurchasable(getProduct("obsidienne"))).toBe(false);
    expect(isPurchasable(getProduct("minuit"))).toBe(true);
  });

  it("sorts purchasable prices before request-only products", () => {
    const sorted = sortProducts(getProducts(), "price-asc");
    expect(sorted.at(-1).priceFrom).toBeNull();
  });
});
