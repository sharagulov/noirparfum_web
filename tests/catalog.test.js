import { describe, expect, it } from "vitest";
import {
  filterProducts,
  getProduct,
  getProducts,
  isNewProduct,
  isPurchasable,
  sortProducts,
} from "../src/lib/catalog.js";

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

  it("keeps catalog order for default sort", () => {
    const list = getProducts().slice(0, 4);
    const sorted = sortProducts(list, "default");
    expect(sorted.map((product) => product.slug)).toEqual(list.map((product) => product.slug));
  });

  it("detects new products by label", () => {
    const novelty = getProducts().find(isNewProduct);
    expect(novelty).toBeTruthy();
    expect(isNewProduct(novelty)).toBe(true);
    expect(isNewProduct(getProduct("minuit"))).toBe(false);
  });

  it("sorts new products first", () => {
    const sorted = sortProducts(getProducts(), "new");
    const firstNewIndex = sorted.findIndex(isNewProduct);
    const firstNonNewIndex = sorted.findIndex((product) => !isNewProduct(product));
    if (firstNewIndex >= 0 && firstNonNewIndex >= 0) {
      expect(firstNewIndex).toBeLessThan(firstNonNewIndex);
    }
  });
});
