import { addToCart, toggleCompare } from "../state/store.js";
import { render } from "../router.js";

export function bindCommon() {
  const header = document.querySelector(".site-header");
  const setScrolled = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  const burger = document.querySelector(".burger");
  const mobile = document.querySelector(".mobile-menu");
  burger?.addEventListener("click", () => {
    const open = mobile?.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("nav-open", !!open);
  });

  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      event.preventDefault();
      document.body.classList.remove("nav-open");
      history.pushState({}, "", href);
      render();
    });
  });

  document.querySelectorAll("[data-add-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      const added = addToCart(button.dataset.addCart, button.dataset.variant);
      render({ preserveScroll: true });
      showToast(added ? "Добавлено в корзину" : "Товар доступен только по запросу");
    });
  });

  document.querySelectorAll("[data-compare]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleCompare(button.dataset.compare);
      render({ preserveScroll: true });
    });
  });
}

export function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}
