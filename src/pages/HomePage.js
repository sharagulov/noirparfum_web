import { escapeHtml } from "../lib/format.js";

export function HomePage() {
  const sections = [
    {
      title: "ДУХИ",
      href: "/duhi",
    },
    {
      title: "ДОМ",
      href: "/dom",
    },
  ];

  return `
    <section class="home-portal">
      <div class="home-portal__bg">
        <img src="/images/products/hero-main.jpg" alt="" fetchpriority="high" decoding="async" />
      </div>
      <div class="home-portal__shade" aria-hidden="true"></div>
      <aside class="home-portal__promo" data-reveal aria-label="SYLHOUR NOIR — лимитированный тираж">
        <div class="home-portal__promo-head">
          <p class="home-portal__promo-name">SYLHOUR NOIR</p>
          <p class="home-portal__promo-price">18&nbsp;400&nbsp;₽</p>
        </div>
        <div class="home-portal__promo-action">
          <p class="home-portal__promo-tagline">Лимитированный тираж · Eau de Parfum 50 мл</p>
          <a class="btn btn--ghost home-portal__promo-btn" href="/product/sylhour-noir" data-link>Смотреть аромат</a>
        </div>
      </aside>
      <div class="home-portal__inner">
        <div class="home-portal__grid" data-reveal-stagger>
          ${sections
            .map(
              (section) => `
                <a class="home-portal__card" href="${escapeHtml(section.href)}" data-link>
                  <h2>${escapeHtml(section.title)}</h2>
                </a>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
