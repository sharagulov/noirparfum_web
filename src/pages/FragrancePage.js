import { ProductCard } from "../components/ProductCard.js";
import { getStoredSort, ProductSort, sortableGridAttrs } from "../components/ProductSort.js";
import { SectionTitle } from "../components/SectionTitle.js";
import { getProducts, sortProducts } from "../lib/catalog.js";
import { escapeHtml } from "../lib/format.js";

const isFragranceProduct = (product) => product.category === "fragrance";
const isHomeProduct = (product) => product.category === "home";

const sectionsConfig = {
  duhi: {
    title: "ДУХИ",
    subtitle: "Подразделы по концентрации ароматов",
    items: [
      {
        slug: "duhi",
        title: "ДУХИ",
        range: "20-40%",
        subtitle: "Самая высокая стойкость и плотность композиции",
        description: "Концентрированные формулы для вечернего и акцентного звучания",
        image: "/images/sections/duhi/duhi.webp",
        filter: (product) => product.category === "fragrance" && product.concentration.toLowerCase().includes("extrait"),
      },
      {
        slug: "parfyumernaya-voda",
        title: "ПАРФЮМЕРНАЯ ВОДА",
        range: "15-20%",
        subtitle: "Основной формат коллекции",
        description: "Баланс стойкости и комфорта для ежедневной носки",
        image: "/images/sections/duhi/parfyumernaya-voda.webp",
        filter: (product) =>
          product.category === "fragrance" && product.concentration.toLowerCase().includes("eau de parfum"),
      },
      {
        slug: "tualetnaya-voda",
        title: "ТУАЛЕТНАЯ ВОДА",
        range: "5-15%",
        subtitle: "Лёгкое дневное звучание",
        description: "Более прозрачный профиль для мягкой повседневной носки",
        image: "/images/sections/duhi/tualetnaya-voda.webp",
        filter: (product) =>
          product.category === "fragrance" && product.concentration.toLowerCase().includes("eau de toilette"),
      },
      {
        slug: "odekolon",
        title: "ОДЕКОЛОН",
        range: "2-4%",
        subtitle: "Свежий формат с минимальной плотностью",
        description: "Цитрусовые и чистые композиции на тёплый сезон",
        image: "/images/sections/duhi/odekolon.webp",
        filter: (product) => product.category === "fragrance" && product.concentration.toLowerCase().includes("cologne"),
      },
    ],
  },
  dom: {
    title: "ДОМ",
    subtitle: "Подразделы домашних форматов",
    items: [
      {
        slug: "svechi",
        title: "СВЕЧИ",
        range: "HOME",
        subtitle: "Ароматические свечи для интерьера",
        description: "Классические свечи и коллекционные форматы для пространства",
        image: "/images/products/home_categories/svechi.webp",
        filter: (product) => product.category === "home",
      },
      {
        slug: "diffuzory",
        title: "ДИФФУЗОРЫ",
        range: "HOME",
        subtitle: "Постоянный аромат в пространстве",
        description: "Подбор по интенсивности и площади помещения",
        image: "/images/products/home_categories/diffuzory.webp",
        filter: (product) => product.category === "home",
      },
      {
        slug: "tekstil-i-sprei",
        title: "ТЕКСТИЛЬ И СПРЕИ",
        range: "HOME",
        subtitle: "Лёгкие форматы для дома",
        description: "Ароматизация текстиля и точечное применение в интерьере",
        image: "/images/products/home_categories/tekstil-i-sprei.webp",
        filter: (product) => product.category === "home",
      },
    ],
  },
};

function getSectionConfig(sectionSlug) {
  return sectionsConfig[sectionSlug] || null;
}

function getSubsection(sectionSlug, subsectionSlug) {
  const section = getSectionConfig(sectionSlug);
  if (!section) return null;
  return section.items.find((item) => item.slug === subsectionSlug) || null;
}

function getSubsectionHeroLine(item) {
  if (/%/.test(item.range || "")) {
    return `${item.range} · ${item.description}`;
  }
  return item.description;
}

function renderSubsectionNav(sectionSlug, sectionConfig, activeSlug) {
  const isLanding = activeSlug == null || activeSlug === "";
  const backClass = `subsection-nav__back${isLanding ? " is-active" : ""}`;
  const backAria = isLanding ? ' aria-current="page"' : "";

  const links = sectionConfig.items
    .map((item) => {
      const isActive = item.slug === activeSlug;
      const linkClass = `subsection-nav__link${isActive ? " is-active" : ""}`;
      const aria = isActive ? ' aria-current="page"' : "";
      return `<a class="${linkClass}" href="/${escapeHtml(sectionSlug)}/${escapeHtml(item.slug)}" data-link${aria}>${escapeHtml(item.title)}</a>`;
    })
    .join("");

  return `
    <nav class="subsection-nav" aria-label="Подразделы">
      <a class="${backClass}" href="/${escapeHtml(sectionSlug)}" data-link${backAria}>Все подразделы</a>
      <div class="subsection-nav__links">${links}</div>
    </nav>
  `;
}

function renderLandingProductsSection({ title, filter, emptyHint }) {
  const filtered = getProducts().filter(filter);
  const slugs = filtered.map((product) => product.slug);
  const sort = getStoredSort();
  const products = sortProducts(filtered, sort);

  return `
    <section class="section section-landing-products">
      <div class="container">
        ${SectionTitle({ title })}
        <div class="catalog-toolbar catalog-toolbar--subsection">
          <div class="catalog-toolbar__meta">
            <p>${products.length} ${products.length === 1 ? "позиция" : "позиций"}</p>
          </div>
          ${products.length ? ProductSort({ active: sort }) : ""}
        </div>
        <div class="product-grid product-grid--catalog" ${sortableGridAttrs(slugs)}>
          ${
            products.length
              ? products.map((product) => ProductCard(product)).join("")
              : `
                <div class="empty-state">
                  <h2>Пока пусто</h2>
                  <p>${escapeHtml(emptyHint)}</p>
                </div>
              `
          }
        </div>
      </div>
    </section>
  `;
}

function renderFragranceBand(item, sectionSlug, { compact = false } = {}) {
  const bandClass = compact ? "fragrance-band fragrance-band--compact" : "fragrance-band";
  return `
    <a class="${bandClass}" href="/${escapeHtml(sectionSlug)}/${escapeHtml(item.slug)}" data-link>
      <div class="fragrance-band__image" style="--fragrance-image: url('${escapeHtml(item.image)}');"></div>
      <div class="fragrance-band__overlay"></div>
      <div class="fragrance-band__content">
        <span>${escapeHtml(item.range)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.subtitle)}</p>
        <small>${escapeHtml(item.description)}</small>
      </div>
    </a>
  `;
}

export function SectionLandingPage(sectionSlug) {
  const section = getSectionConfig(sectionSlug);
  if (!section) return null;

  const isDuhi = sectionSlug === "duhi";
  const isDom = sectionSlug === "dom";
  const useCompactLanding = isDuhi || isDom;
  const bandsLayoutClass = useCompactLanding ? "fragrance-grid--compact" : "fragrance-stack";
  const landingSectionClass = isDuhi ? " section-landing--duhi" : isDom ? " section-landing--dom" : "";
  const bands = section.items.map((item) => renderFragranceBand(item, sectionSlug, { compact: useCompactLanding })).join("");

  let productsSection = "";
  if (isDuhi) {
    productsSection = renderLandingProductsSection({
      title: "Все ароматы",
      filter: isFragranceProduct,
      emptyHint: "Добавьте ароматы в каталог, и они появятся в этом разделе",
    });
  } else if (isDom) {
    productsSection = renderLandingProductsSection({
      title: "Все для дома",
      filter: isHomeProduct,
      emptyHint: "Добавьте товары для дома в каталог, и они появятся в этом разделе",
    });
  }

  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>${escapeHtml(section.title)}</h1>
          <p>${escapeHtml(section.subtitle)}</p>
        </div>
      </div>
    </section>

    <section class="section${landingSectionClass}">
      <div class="container ${bandsLayoutClass}">
        ${bands}
      </div>
    </section>
    ${productsSection}
  `;
}

export function SectionCatalogPage(sectionSlug, subsectionSlug) {
  const sectionConfig = getSectionConfig(sectionSlug);
  const subsection = getSubsection(sectionSlug, subsectionSlug);
  if (!subsection || !sectionConfig) {
    return `
      <section class="page-hero page-hero--compact">
        <div class="container">
          <div>
            <h1>Раздел не найден</h1>
            <p>Такого подраздела пока нет</p>
          </div>
          <a class="btn" href="/" data-link>Вернуться на главную</a>
        </div>
      </section>
    `;
  }

  const filtered = getProducts().filter(subsection.filter || (() => false));
  const slugs = filtered.map((product) => product.slug);
  const sort = getStoredSort();
  const products = sortProducts(filtered, sort);
  const heroLine = getSubsectionHeroLine(subsection);
  const isDom = sectionSlug === "dom";
  const heroClass = `page-hero page-hero--subsection${isDom ? " page-hero--dom" : ""}`;

  return `
    <section class="${heroClass}" style="--subsection-image: url('${escapeHtml(subsection.image)}');">
      <div class="page-hero__media" aria-hidden="true"></div>
      <div class="page-hero__scrim" aria-hidden="true"></div>
      <div class="container page-hero__body">
        <div class="page-hero__intro">
          <h1>${escapeHtml(subsection.title)}</h1>
          <p>${escapeHtml(heroLine)}</p>
        </div>
        ${renderSubsectionNav(sectionSlug, sectionConfig, subsectionSlug)}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="catalog-toolbar">
          <div class="catalog-toolbar__meta">
            <p>${products.length} ${products.length === 1 ? "позиция" : "позиций"}</p>
            <p>Каталог раздела «${escapeHtml(subsection.title)}»</p>
          </div>
          ${products.length ? ProductSort({ active: sort }) : ""}
        </div>
        <div class="product-grid product-grid--catalog" ${sortableGridAttrs(slugs)}>
          ${
            products.length
              ? products.map((product) => ProductCard(product)).join("")
              : `
                <div class="empty-state">
                  <h2>Пока пусто</h2>
                  <p>Добавьте подходящие товары, и они появятся в этом разделе</p>
                  <p>Подсказка: настройте поля <code>category</code> и <code>concentration</code> в <code>src/data/products.json</code></p>
                </div>
              `
          }
        </div>
      </div>
    </section>
  `;
}
