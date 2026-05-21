import { getPurchasableVariant, isPurchasable, statusLabels } from "../lib/catalog.js";
import { escapeHtml, localizeConcentration } from "../lib/format.js";
import { isCompared } from "../state/store.js";
import { ProductMedia } from "./ProductMedia.js";

export function ProductCard(product, { compact = false } = {}) {
  const variant = getPurchasableVariant(product);
  const canBuy = isPurchasable(product);
  const compared = isCompared(product.slug);
  return `
    <article class="product-card ${compact ? "product-card--compact" : ""}">
      <a class="product-card__media-link" href="/product/${escapeHtml(product.slug)}" data-link>
        ${ProductMedia(product)}
      </a>
      <div class="product-card__body">
        <div class="product-card__top">
          <a href="/product/${escapeHtml(product.slug)}" data-link>
            <h3>${escapeHtml(product.name)}</h3>
            <span>${escapeHtml(product.russianName)}</span>
          </a>
          <button class="icon-action ${compared ? "is-active" : ""}" type="button" data-compare="${escapeHtml(product.slug)}" aria-label="${compared ? "Убрать из сравнения" : "Добавить к сравнению"}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5v14M18 5v14M3 8h6M15 8h6M3 16h6M15 16h6" /></svg>
          </button>
        </div>
        <p class="product-card__notes">${escapeHtml(product.short)}</p>
        <div class="product-card__meta">
          <span>${escapeHtml(localizeConcentration(product.concentration))}</span>
          <span>${escapeHtml(statusLabels[product.status] || product.status)}</span>
        </div>
        <div class="product-card__footer">
          <strong>${escapeHtml(product.priceLabel)}</strong>
          ${
            canBuy
              ? `<button class="text-action" type="button" data-add-cart="${escapeHtml(product.slug)}" data-variant="${escapeHtml(variant.id)}">В корзину</button>`
              : `<a class="text-action" href="/service#request" data-link>Запросить</a>`
          }
        </div>
      </div>
    </article>
  `;
}
