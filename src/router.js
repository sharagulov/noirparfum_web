import { bindCommon } from "./components/bindCommon.js";
import { bindProductSort } from "./components/bindProductSort.js";
import { PageShell } from "./components/Layout.js";
import { AboutPage } from "./pages/AboutPage.js";
import { bindCartPage, CartPage } from "./pages/CartPage.js";
import { CatalogPage } from "./pages/CatalogPage.js";
import { bindCheckoutPage, CheckoutPage } from "./pages/CheckoutPage.js";
import { bindComparePage, ComparePage } from "./pages/ComparePage.js";
import { SectionCatalogPage, SectionLandingPage } from "./pages/FragrancePage.js";
import { HomePage } from "./pages/HomePage.js";
import { bindProductPage, ProductPage } from "./pages/ProductPage.js";
import { bindServicePage, ServicePage } from "./pages/ServicePage.js";

const app = document.getElementById("app");

export function render(options = {}) {
  const path = location.pathname.replace(/\/$/, "") || "/";
  const route = resolveRoute(path);
  if (!app) return;
  app.innerHTML = PageShell(route.html, path);
  bindCommon();
  bindProductSort();
  route.bind?.();
  reveal();
  if (location.hash) {
    document.querySelector(location.hash)?.scrollIntoView({ block: "start" });
  } else if (!options.preserveScroll) {
    window.scrollTo(0, 0);
  }
}

function resolveRoute(path) {
  if (path === "/") return { html: HomePage() };
  const sectionRoots = ["/duhi", "/dom", "/uhod-i-podarki", "/kontent-i-brend"];
  if (sectionRoots.includes(path)) {
    const section = path.slice(1);
    const html = SectionLandingPage(section);
    if (html) return { html };
  }
  if (sectionRoots.some((root) => path.startsWith(`${root}/`))) {
    const [section, subsection] = path.split("/").filter(Boolean);
    return { html: SectionCatalogPage(section, subsection) };
  }
  if (path === "/catalog") return { html: CatalogPage() };
  if (path.startsWith("/product/")) {
    const slug = decodeURIComponent(path.split("/").filter(Boolean)[1] || "");
    return { html: ProductPage(slug), bind: bindProductPage };
  }
  if (path === "/cart") return { html: CartPage(), bind: bindCartPage };
  if (path === "/checkout") return { html: CheckoutPage(), bind: bindCheckoutPage };
  if (path === "/compare") return { html: ComparePage(), bind: bindComparePage };
  if (path === "/about") return { html: AboutPage() };
  if (path === "/service") return { html: ServicePage(), bind: bindServicePage };
  return {
    html: `
      <section class="page-hero page-hero--compact">
        <div class="container">
          <div>
            <h1>Страница не найдена</h1>
            <p>Такой страницы нет в витрине NOIR</p>
          </div>
          <a class="btn" href="/" data-link>На главную</a>
        </div>
      </section>
    `,
  };
}

function reveal() {
  requestAnimationFrame(() => {
    document.querySelectorAll("[data-reveal-stagger], .product-card, .collection-tile, .section-title").forEach((el, index) => {
      el.style.setProperty("--reveal-delay", `${Math.min(index * 35, 240)}ms`);
      el.classList.add("is-visible");
    });
  });
}

window.addEventListener("popstate", () => render());
