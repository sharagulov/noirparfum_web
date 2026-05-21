import { ProductCard } from "../components/ProductCard.js";
import { filterProducts, getProducts, sortProducts } from "../lib/catalog.js";

export function CatalogPage() {
  const params = new URLSearchParams(location.search);
  const filters = {
    query: "",
    category: params.get("category") || "all",
    collection: params.get("collection") || "all",
    status: params.get("status") || "all",
  };
  const products = sortProducts(filterProducts(getProducts(), filters), "featured");

  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>Каталог</h1>
          <p>Духи, наборы, дом и atelier-позиции в одном каталоге</p>
        </div>
        <a class="btn btn--ghost" href="/compare" data-link>Сравнение</a>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="catalog-toolbar">
          <p>${products.length} ${products.length === 1 ? "позиция" : "позиций"}</p>
          <p>Цены в рублях. Позиции под заказ подтверждаются менеджером</p>
        </div>
        <div class="product-grid product-grid--catalog">
          ${
            products.length
              ? products.map((product) => ProductCard(product)).join("")
              : `<div class="empty-state"><h2>Ничего не найдено</h2><p>Попробуйте открыть другой подраздел</p><a class="btn" href="/" data-link>На главную</a></div>`
          }
        </div>
      </div>
    </section>
  `;
}
