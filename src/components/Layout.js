import brand from "../data/brand.json";
import { cartTotals, compareProducts } from "../state/store.js";
import { escapeHtml } from "../lib/format.js";
import { Logo } from "./Logo.js";

export function Header(currentPath = "/") {
  const totals = cartTotals();
  const compareCount = compareProducts().length;
  const nav = brand.navigation
    .map((item) => {
      const navPath = item.href.split("#")[0].split("?")[0] || "/";
      const active =
        navPath === "/"
          ? currentPath === "/"
          : currentPath === navPath || currentPath.startsWith(`${navPath}/`);
      return `<a href="${item.href}" data-link class="${active ? "is-active" : ""}">${escapeHtml(item.label)}</a>`;
    })
    .join("");

  return `
    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-header__logo" href="/" data-link>${Logo()}</a>
        <nav class="nav" aria-label="Основная навигация">${nav}</nav>
        <div class="header-actions">
          <a class="header-icon" href="/catalog?focus=search" data-link aria-label="Поиск">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35M10.8 18.1a7.3 7.3 0 1 1 0-14.6 7.3 7.3 0 0 1 0 14.6Z" /></svg>
          </a>
          <a class="header-icon" href="/compare" data-link aria-label="Сравнение">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M17 4v16M4 8h6M14 8h6M4 16h6M14 16h6" /></svg>
            ${compareCount ? `<span>${compareCount}</span>` : ""}
          </a>
          <a class="header-icon" href="/cart" data-link aria-label="Корзина">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 8h11.2l-1 11H7.4L6.4 8ZM9 8a3 3 0 0 1 6 0" /></svg>
            ${totals.totalQuantity ? `<span>${totals.totalQuantity}</span>` : ""}
          </a>
          <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
    <nav class="mobile-menu" aria-label="Мобильное меню" aria-hidden="true">
      ${nav}
      <a href="/cart" data-link>Корзина</a>
    </nav>
  `;
}

export function Footer() {
  const nav = brand.navigation
    .map((item) => `<a href="${item.href}" data-link>${escapeHtml(item.label)}</a>`)
    .join("");
  const social = brand.social
    .map(
      (item) =>
        `<a href="${item.href}" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`
    )
    .join("");
  return `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          ${Logo({ inert: true })}
          <p>${escapeHtml(brand.tagline)}<br>${escapeHtml(brand.city)}, ${escapeHtml(brand.address)}</p>
        </div>
        <nav aria-label="Навигация в футере">${nav}</nav>
        <div>
          <a href="mailto:${escapeHtml(brand.email)}">${escapeHtml(brand.email)}</a>
          <div class="footer-social">${social}</div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>NOIR Parfum © 2024–2026</span>
        <span>Демо-витрина · локальный прототип без серверной отправки</span>
      </div>
    </footer>
  `;
}

export function PageShell(content, path) {
  return `
    ${Header(path)}
    <main id="main">${content}</main>
    ${Footer()}
    <div class="toast" role="status" aria-live="polite"></div>
  `;
}
