import { ProductCard } from "../components/ProductCard.js";
import { getStoredSort, ProductSort, sortableGridAttrs } from "../components/ProductSort.js";
import { filterProducts, getProducts, sortProducts } from "../lib/catalog.js";
import { getAppParams } from "../lib/navigation.js";

export function CatalogPage() {
  const params = getAppParams();
  const filters = {
    query: "",
    category: params.get("category") || "all",
    collection: params.get("collection") || "all",
    status: params.get("status") || "all",
  };
  const filtered = filterProducts(getProducts(), filters);
  const slugs = filtered.map((product) => product.slug);
  const sort = getStoredSort();
  const products = sortProducts(filtered, sort);

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
          <div class="catalog-toolbar__meta">
            <p>${products.length} ${products.length === 1 ? "позиция" : "позиций"}</p>
            <p>Цены в рублях. Позиции под заказ подтверждаются менеджером</p>
          </div>
          ${products.length ? ProductSort({ active: sort }) : ""}
        </div>
        <div class="product-grid product-grid--catalog" ${sortableGridAttrs(slugs)}>
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
