import brand from "../data/brand.json";
import service from "../data/service.json";
import { SectionTitle } from "../components/SectionTitle.js";
import { escapeHtml } from "../lib/format.js";

export function ServicePage() {
  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>Сервис</h1>
          <p>Доставка, оплата, refills и клиентская поддержка</p>
        </div>
        <a class="btn" href="/checkout" data-link>Оформление</a>
      </div>
    </section>

    <section class="section">
      <div class="container service-page-grid">
        <div>
          ${SectionTitle({ label: "Доставка", title: "Доставка и получение" })}
          <div class="info-list">
            ${service.delivery
              .map(
                (item) => `
                  <article>
                    <h2>${escapeHtml(item.title)}</h2>
                    <p>${escapeHtml(item.text)}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>
        <div>
          ${SectionTitle({ label: "Payment", title: "Оплата" })}
          <div class="line-list">
            ${service.payments.map((item) => `<div>${escapeHtml(item)}</div>`).join("")}
          </div>
        </div>
      </div>
    </section>

    <section id="refills" class="section section--band">
      <div class="container">
        ${SectionTitle({
          label: "Пополнения",
          title: "Refill Program",
          text: "Для постоянных клиентов доступно пополнение популярных позиций. Текущие возможности уточняются через поддержку"
        })}
        <div class="service-strip service-strip--wide">
          <div>
            <span></span>
            <p>Проверка совместимости флакона перед refill</p>
          </div>
          <div>
            <span></span>
            <p>Срок обработки заявки обычно 2-5 дней</p>
          </div>
          <div>
            <span></span>
            <p>Стоимость зависит от формата и концентрации</p>
          </div>
          <div>
            <span></span>
            <p>Запрос оформляется через форму ниже</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${SectionTitle({
          label: "Вопросы",
          title: "Коротко о сервисе",
          text: "Если нужен редкий формат, корпоративный заказ или подарок, удобнее оставить заявку и получить ответ от менеджера"
        })}
        <div class="line-list">
          ${service.perks.map((perk) => `<div>${escapeHtml(perk)}</div>`).join("")}
        </div>
      </div>
    </section>

    <section id="request" class="section">
      <div class="container request-panel">
        <div>
          ${SectionTitle({
            label: "Контакт",
            title: "Оставить запрос",
            text: "Форма для запросов на refills, редкие позиции и корпоративные заказы"
          })}
        </div>
        <form class="request-form">
          <label>Имя<input placeholder="Имя" /></label>
          <label>Контакт<input placeholder="Телефон или email" /></label>
          <label>Запрос<textarea rows="4" placeholder="Что нужно подготовить"></textarea></label>
          <button class="btn" type="button" data-request-demo>Отправить запрос</button>
          <p>${escapeHtml(brand.email)} · ${escapeHtml(brand.phone)}</p>
        </form>
      </div>
    </section>
  `;
}

export function bindServicePage() {
  document.querySelector("[data-request-demo]")?.addEventListener("click", () => {
    const form = document.querySelector(".request-form");
    form?.classList.add("is-sent");
    const message = form?.querySelector("p");
    if (message) message.textContent = "Запрос сохранен локально. Для продакшена здесь подключается CRM/API";
  });
}
