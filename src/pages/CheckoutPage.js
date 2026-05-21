import service from "../data/service.json";
import { escapeHtml, rub } from "../lib/format.js";
import { getAppParams, navigateApp } from "../lib/navigation.js";
import { cartLines, cartTotals, clearCart } from "../state/store.js";
import { render } from "../router.js";

export function CheckoutPage() {
  const params = getAppParams();
  if (params.get("status") === "success") return SuccessState();

  const lines = cartLines();
  if (!lines.length) {
    return `
      <section class="page-hero page-hero--compact">
        <div class="container">
          <div>
            <h1>Оформление недоступно</h1>
            <p>Корзина пуста. Добавьте товары из каталога, чтобы продолжить</p>
          </div>
          <a class="btn" href="/catalog" data-link>Открыть каталог</a>
        </div>
      </section>
    `;
  }

  const deliveryId = params.get("delivery") || "courier";
  const delivery = service.checkout.deliveryMethods.find((item) => item.id === deliveryId) || service.checkout.deliveryMethods[0];
  const paymentId = params.get("payment") || service.checkout.paymentMethods[0].id;
  const payment =
    service.checkout.paymentMethods.find((item) => item.id === paymentId) || service.checkout.paymentMethods[0];
  const totals = cartTotals(delivery.price);

  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>Оплата заказа</h1>
          <p>Клиентский checkout без бэкенда: форма имитирует финальный шаг и очищает локальную корзину после подтверждения</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container checkout-layout">
        <form class="checkout-form" data-checkout-form>
          <fieldset>
            <legend>Контакты</legend>
            <div class="form-grid">
              <label>Имя<input required name="name" placeholder="Анна" /></label>
              <label>Телефон<input required name="phone" inputmode="tel" placeholder="+7 900 000-00-00" /></label>
              <label class="span-2">Эл. почта<input required name="email" type="email" placeholder="name@example.com" /></label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Доставка</legend>
            <div class="choice-grid">
              ${service.checkout.deliveryMethods
                .map(
                  (method) => `
                    <label class="choice-card ${method.id === delivery.id ? "is-selected" : ""}">
                      <input type="radio" name="delivery" value="${escapeHtml(method.id)}" ${method.id === delivery.id ? "checked" : ""} />
                      <span>${escapeHtml(method.title)}</span>
                      <strong>${method.price ? rub(method.price) : "0 ₽"}</strong>
                      <small>${escapeHtml(method.eta)}</small>
                    </label>
                  `
                )
                .join("")}
            </div>
            <label class="address-field">Адрес или комментарий<textarea name="address" rows="4" placeholder="Адрес доставки, удобное время, комментарий к заказу"></textarea></label>
          </fieldset>

          <fieldset>
            <legend>Оплата</legend>
            <div class="choice-grid">
              ${service.checkout.paymentMethods
                .map(
                  (method) => `
                    <label class="choice-card ${method.id === payment.id ? "is-selected" : ""}">
                      <input type="radio" name="payment" value="${escapeHtml(method.id)}" ${method.id === payment.id ? "checked" : ""} />
                      <span>${escapeHtml(method.title)}</span>
                    </label>
                  `
                )
                .join("")}
            </div>
          </fieldset>

          <fieldset>
            <legend>Подарочная упаковка</legend>
            <div class="form-grid">
              <label>Пробник 1<select name="sample1">${service.checkout.sampleChoices.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
              <label>Пробник 2<select name="sample2">${service.checkout.sampleChoices.map((item) => `<option>${escapeHtml(item)}</option>`).join("")}</select></label>
              <label class="span-2">Открытка<input name="message" placeholder="Текст персонального сообщения" /></label>
            </div>
          </fieldset>

          <button class="btn" type="submit">Подтвердить заказ</button>
        </form>

        <aside class="summary-card">
          <h2>Заказ</h2>
          <div class="checkout-lines">
            ${lines
              .map(
                (line) => `
                  <div>
                    <span>${escapeHtml(line.product.name)} · ${escapeHtml(line.variant.label)} × ${line.quantity}</span>
                    <strong>${rub(line.lineTotal)}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
          <dl>
            <div><dt>Товары</dt><dd>${rub(totals.subtotal)}</dd></div>
            <div><dt>Доставка · ${escapeHtml(delivery.title)}</dt><dd>${totals.delivery ? rub(totals.delivery) : "0 ₽"}</dd></div>
            <div><dt>Пробники</dt><dd>${totals.samples ? `${totals.samples} в подарок` : "от 12 000 ₽"}</dd></div>
            <div class="summary-card__total"><dt>К оплате</dt><dd>${rub(totals.total)}</dd></div>
          </dl>
          <p>Финальная интеграция оплаты подключается отдельно. Сейчас сценарий остается полностью клиентским</p>
        </aside>
      </div>
    </section>
  `;
}

export function bindCheckoutPage() {
  document.querySelectorAll('input[name="delivery"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const params = getAppParams();
      params.set("delivery", radio.value);
      navigateApp(`/checkout?${params.toString()}`, { replace: true });
      render({ preserveScroll: true });
    });
  });
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const params = getAppParams();
      params.set("payment", radio.value);
      navigateApp(`/checkout?${params.toString()}`, { replace: true });
      render({ preserveScroll: true });
    });
  });
  document.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearCart();
    navigateApp("/checkout?status=success");
    render();
  });
}

function SuccessState() {
  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>Заказ оформлен</h1>
          <p>Локальный сценарий завершен: корзина очищена, данные не отправлялись на сервер. Экран готов для будущей интеграции платежного провайдера</p>
        </div>
        <a class="btn" href="/catalog" data-link>Вернуться в каталог</a>
      </div>
    </section>
  `;
}
