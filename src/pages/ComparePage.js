import { ProductCard } from "../components/ProductCard.js";
import { ProductMedia } from "../components/ProductMedia.js";
import { SectionTitle } from "../components/SectionTitle.js";
import { getProducts } from "../lib/catalog.js";
import { escapeHtml, localizeConcentration } from "../lib/format.js";
import { compareProducts, removeCompare } from "../state/store.js";
import { render } from "../router.js";

export function ComparePage() {
  const compared = compareProducts();
  const suggestions = getProducts().filter((product) => !compared.includes(product)).slice(0, 4);

  if (!compared.length) {
    return `
      <section class="page-hero page-hero--compact">
        <div class="container">
          <div>
            <h1>Сравнение</h1>
            <p>Добавьте до четырех ароматов из каталога, чтобы сравнить ноты, настроение, стойкость и сценарий покупки</p>
          </div>
          <a class="btn" href="/catalog" data-link>Выбрать ароматы</a>
        </div>
      </section>
      <section class="section">
        <div class="container">
          ${SectionTitle({ label: "Старт", title: "Подойдут для первого сравнения" })}
          <div class="product-grid">${suggestions.map((product) => ProductCard(product)).join("")}</div>
        </div>
      </section>
    `;
  }

  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>Сравнение</h1>
          <p>${compared.length} из 4 позиций. Сравнение помогает выбрать между близкими настроениями и форматами</p>
        </div>
        <a class="btn btn--ghost" href="/catalog" data-link>Добавить ещё</a>
      </div>
    </section>

    <section class="section">
      <div class="container compare-board" style="--compare-count: ${compared.length}">
        <div class="compare-row compare-row--products">
          <div class="compare-label">Аромат</div>
          ${compared.map(ProductColumn).join("")}
        </div>
        ${CompareRow("Настроение", compared.map((product) => product.mood))}
        ${CompareRow("Категория", compared.map((product) => product.categoryLabel))}
        ${CompareRow("Концентрация", compared.map((product) => localizeConcentration(product.concentration)))}
        ${CompareRow("Верх", compared.map((product) => product.notes.top.join(" · ")))}
        ${CompareRow("Сердце", compared.map((product) => product.notes.heart.join(" · ")))}
        ${CompareRow("База", compared.map((product) => product.notes.base.join(" · ")))}
        ${CompareRow("Сезон", compared.map((product) => product.season))}
        ${CompareRow("Время", compared.map((product) => product.time))}
        ${CompareRow("Интенсивность", compared.map((product) => `${product.intensity}/5`))}
        ${CompareRow("Стойкость", compared.map((product) => `${product.longevity}/10`))}
        ${CompareRow("Цена", compared.map((product) => product.priceLabel))}
      </div>
    </section>
  `;
}

export function bindComparePage() {
  document.querySelectorAll("[data-remove-compare]").forEach((button) => {
    button.addEventListener("click", () => {
      removeCompare(button.dataset.removeCompare);
      render({ preserveScroll: true });
    });
  });
}

function ProductColumn(product) {
  return `
    <div class="compare-product">
      <a href="/product/${escapeHtml(product.slug)}" data-link>${ProductMedia(product, "product-media--compare")}</a>
      <h2>${escapeHtml(product.name)}</h2>
      <p>${escapeHtml(product.russianName)}</p>
      <button class="text-action" type="button" data-remove-compare="${escapeHtml(product.slug)}">Убрать</button>
    </div>
  `;
}

function CompareRow(label, values) {
  return `
    <div class="compare-row">
      <div class="compare-label">${escapeHtml(label)}</div>
      ${values.map((value) => `<div>${escapeHtml(value)}</div>`).join("")}
    </div>
  `;
}
