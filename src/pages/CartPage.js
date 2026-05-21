import { ProductMedia } from "../components/ProductMedia.js";
import service from "../data/service.json";
import { escapeHtml, rub } from "../lib/format.js";
import { cartLines, cartTotals, clearCart, removeFromCart, updateQuantity } from "../state/store.js";
import { render } from "../router.js";

export function CartPage() {
  const lines = cartLines();
  const totals = cartTotals();

  if (!lines.length) {
    return `
      <section class="page-hero page-hero--compact">
        <div class="container">
          <div>
            <h1>Корзина пуста</h1>
            <p>Добавьте аромат, discovery-набор или домашний ритуал, чтобы перейти к оформлению</p>
          </div>
          <a class="btn" href="/catalog" data-link>Открыть каталог</a>
        </div>
      </section>
    `;
  }

  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>Корзина</h1>
          <p>${totals.totalQuantity} ${totals.totalQuantity === 1 ? "позиция" : "позиции"} готовы к оформлению. Заказ остается на устройстве и не отправляется на сервер</p>
        </div>
        <button class="btn btn--ghost" type="button" data-clear-cart>Очистить</button>
      </div>
    </section>

    <section class="section">
      <div class="container cart-layout">
        <div class="cart-lines">
          ${lines.map(CartLine).join("")}
        </div>
        ${CartSummary(totals)}
      </div>
    </section>
  `;
}

export function bindCartPage() {
  document.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      updateQuantity(input.dataset.slug, input.dataset.variant, input.value);
      render({ preserveScroll: true });
    });
  });
  document.querySelectorAll("[data-remove-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.slug, button.dataset.variant);
      render({ preserveScroll: true });
    });
  });
  document.querySelector("[data-clear-cart]")?.addEventListener("click", () => {
    clearCart();
    render();
  });
}

function CartLine(line) {
  return `
    <article class="cart-line">
      <a href="/product/${escapeHtml(line.product.slug)}" data-link>${ProductMedia(line.product, "product-media--cart")}</a>
      <div>
        <a href="/product/${escapeHtml(line.product.slug)}" data-link>
          <h2>${escapeHtml(line.product.name)}</h2>
          <p>${escapeHtml(line.product.russianName)} · ${escapeHtml(line.variant.label)}</p>
        </a>
        <div class="cart-line__controls">
          <label>
            Количество
            <input type="number" min="1" max="9" value="${line.quantity}" data-qty data-slug="${escapeHtml(line.slug)}" data-variant="${escapeHtml(line.variantId)}" />
          </label>
          <button class="text-action" type="button" data-remove-cart data-slug="${escapeHtml(line.slug)}" data-variant="${escapeHtml(line.variantId)}">Убрать</button>
        </div>
      </div>
      <strong>${rub(line.lineTotal)}</strong>
    </article>
  `;
}

export function CartSummary(totals, deliveryTitle = "") {
  return `
    <aside class="summary-card">
      <h2>Итого</h2>
      <dl>
        <div><dt>Товары</dt><dd>${rub(totals.subtotal)}</dd></div>
        <div><dt>Доставка${deliveryTitle ? ` · ${escapeHtml(deliveryTitle)}` : ""}</dt><dd>${totals.delivery ? rub(totals.delivery) : "0 ₽"}</dd></div>
        <div><dt>Пробники</dt><dd>${totals.samples ? `${totals.samples} в подарок` : "от 12 000 ₽"}</dd></div>
        <div class="summary-card__total"><dt>К оплате</dt><dd>${rub(totals.total)}</dd></div>
      </dl>
      <a class="btn" href="/checkout" data-link>Оформить заказ</a>
      <p>${escapeHtml(service.perks[1])}</p>
    </aside>
  `;
}
