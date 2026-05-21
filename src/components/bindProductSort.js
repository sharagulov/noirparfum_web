import { getProduct, sortProducts } from "../lib/catalog.js";
import { ProductCard } from "./ProductCard.js";
import { bindInteractive } from "./bindCommon.js";
import { setStoredSort } from "./ProductSort.js";

function parseSlugs(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function revealGridCards(grid) {
  grid.querySelectorAll(".product-card").forEach((el, index) => {
    el.style.setProperty("--reveal-delay", `${Math.min(index * 35, 240)}ms`);
    el.classList.add("is-visible");
  });
}

function setActiveOption(sortRoot, sortKey) {
  sortRoot.querySelectorAll("[data-sort-option]").forEach((button) => {
    const active = button.dataset.sortOption === sortKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

export function bindProductSort() {
  document.querySelectorAll("[data-sortable-grid]").forEach((grid) => {
    const sortRoot = grid.closest(".container")?.querySelector(".product-sort");
    if (!sortRoot) return;

    const slugs = parseSlugs(grid.dataset.productSlugs);
    if (!slugs.length) return;

    sortRoot.querySelectorAll("[data-sort-option]").forEach((button) => {
      button.addEventListener("click", () => {
        const sortKey = button.dataset.sortOption;
        if (!sortKey || button.classList.contains("is-active")) return;

        setStoredSort(sortKey);
        setActiveOption(sortRoot, sortKey);

        const products = slugs.map((slug) => getProduct(slug)).filter(Boolean);
        const sorted = sortProducts(products, sortKey);
        grid.innerHTML = sorted.map((product) => ProductCard(product)).join("");

        bindInteractive(grid);
        revealGridCards(grid);
      });
    });
  });
}
