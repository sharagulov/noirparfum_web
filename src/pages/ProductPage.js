import { ProductCard } from "../components/ProductCard.js";
import { ProductMedia } from "../components/ProductMedia.js";
import { SectionTitle } from "../components/SectionTitle.js";
import { getCollection, getProduct, getPurchasableVariant, getVariant, isPurchasable, relatedProducts, statusLabels } from "../lib/catalog.js";
import { escapeHtml, localizeConcentration, rub } from "../lib/format.js";
import { addToCart, isCompared, toggleCompare } from "../state/store.js";
import { render } from "../router.js";
import { showToast } from "../components/bindCommon.js";

export function ProductPage(slug) {
  const product = getProduct(slug);
  if (!product) return NotFoundProduct();
  const params = new URLSearchParams(location.search);
  const selected = getVariant(product, params.get("variant"));
  const purchasable = getPurchasableVariant(product, selected?.id);
  const collection = getCollection(product.collection);
  const compared = isCompared(product.slug);
  const related = relatedProducts(product);

  return `
    <section class="product-detail">
      <div class="product-detail__media">
        ${ProductMedia(product, "product-media--detail")}
      </div>
      <div class="product-detail__info">
        <div class="breadcrumbs">
          <a href="/catalog" data-link>Каталог</a>
          <span>/</span>
          <a href="/catalog?collection=${escapeHtml(product.collection)}" data-link>${escapeHtml(collection?.name || product.collection)}</a>
        </div>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="product-detail__sub">${escapeHtml(product.russianName)} · ${escapeHtml(localizeConcentration(product.concentration))}</p>
        <p class="product-detail__quote">«${escapeHtml(product.quote)}»</p>
        <p>${escapeHtml(product.story)}</p>

        <div class="product-detail__status">
          <span>${escapeHtml(statusLabels[product.status] || product.status)}</span>
          <span>${escapeHtml(product.categoryLabel)}</span>
          <span>${escapeHtml(product.mood)}</span>
        </div>

        <div class="variant-group" aria-label="Выбор формата">
          ${product.variants
            .map(
              (variant) => `
                <button class="${selected?.id === variant.id ? "is-active" : ""}" type="button" data-select-variant="${escapeHtml(variant.id)}">
                  <span>${escapeHtml(variant.label)}</span>
                  <strong>${variant.price === null ? "по запросу" : rub(variant.price)}</strong>
                </button>
              `
            )
            .join("")}
        </div>

        <div class="product-buy">
          <strong>${escapeHtml(product.priceLabel)}</strong>
          ${
            isPurchasable(product) && purchasable
              ? `<button class="btn" type="button" data-product-add="${escapeHtml(product.slug)}" data-variant="${escapeHtml(purchasable.id)}">Добавить в корзину</button>`
              : `<a class="btn" href="/service#request" data-link>Запросить условия</a>`
          }
          <button class="btn btn--ghost ${compared ? "is-active" : ""}" type="button" data-product-compare="${escapeHtml(product.slug)}">${compared ? "В сравнении" : "Сравнить"}</button>
        </div>
      </div>
    </section>

    <section class="section section--band">
      <div class="container product-specs">
        <div>
          ${SectionTitle({ title: "Пирамида" })}
          <div class="note-list">
            <div><span>Верхние ноты</span><p>${escapeHtml(product.notes.top.join(" · "))}</p></div>
            <div><span>Ноты сердца</span><p>${escapeHtml(product.notes.heart.join(" · "))}</p></div>
            <div><span>База</span><p>${escapeHtml(product.notes.base.join(" · "))}</p></div>
          </div>
        </div>
        <div class="metrics-panel">
          ${Metric("Интенсивность", product.intensity)}
          ${Metric("Стойкость", product.longevity, 10)}
          ${Metric("Шлейф", product.sillage)}
          <div class="metric-text"><span>Сезон</span><strong>${escapeHtml(product.season)}</strong></div>
          <div class="metric-text"><span>Время</span><strong>${escapeHtml(product.time)}</strong></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container care-grid">
        <div>
          ${SectionTitle({ label: "Уход", title: "Как носить" })}
          <p>${escapeHtml(product.care)}</p>
        </div>
        <div>
          ${SectionTitle({ label: "Аккорды", title: "Аккорды" })}
          <div class="tag-cloud">${product.accords.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${SectionTitle({ label: "Сочетания", title: "Сочетается с" })}
        <div class="product-grid product-grid--related">
          ${related.map((item) => ProductCard(item, { compact: true })).join("")}
        </div>
      </div>
    </section>
  `;
}

export function bindProductPage() {
  document.querySelectorAll("[data-select-variant]").forEach((button) => {
    button.addEventListener("click", () => {
      const params = new URLSearchParams(location.search);
      params.set("variant", button.dataset.selectVariant);
      history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
      render({ preserveScroll: true });
    });
  });
  document.querySelector("[data-product-add]")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const added = addToCart(button.dataset.productAdd, button.dataset.variant);
    render({ preserveScroll: true });
    showToast(added ? "Добавлено в корзину" : "Товар доступен только по запросу");
  });
  document.querySelector("[data-product-compare]")?.addEventListener("click", (event) => {
    toggleCompare(event.currentTarget.dataset.productCompare);
    render({ preserveScroll: true });
  });
}

function Metric(label, value, max = 5) {
  const count = Math.min(value, max);
  return `
    <div class="metric">
      <div><span>${escapeHtml(label)}</span><strong>${value}/${max}</strong></div>
      <div class="metric__bar" style="--metric-count: ${max}">${Array.from({ length: max }, (_, i) => `<span class="${i < count ? "is-on" : ""}"></span>`).join("")}</div>
    </div>
  `;
}

function NotFoundProduct() {
  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>Аромат не найден</h1>
          <p>Возможно, он снят с витрины или находится в разработке</p>
        </div>
        <a class="btn" href="/catalog" data-link>Вернуться в каталог</a>
      </div>
    </section>
  `;
}
