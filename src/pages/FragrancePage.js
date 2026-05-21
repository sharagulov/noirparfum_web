import { ProductCard } from "../components/ProductCard.js";
import { getProducts } from "../lib/catalog.js";
import { escapeHtml } from "../lib/format.js";

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
        image: "/images/sections/duhi/duhi.png",
        filter: (product) => product.category === "fragrance" && product.concentration.toLowerCase().includes("extrait"),
      },
      {
        slug: "parfyumernaya-voda",
        title: "ПАРФЮМЕРНАЯ ВОДА",
        range: "15-20%",
        subtitle: "Основной формат коллекции",
        description: "Баланс стойкости и комфорта для ежедневной носки",
        image: "/images/sections/duhi/parfyumernaya-voda.png",
        filter: (product) =>
          product.category === "fragrance" && product.concentration.toLowerCase().includes("eau de parfum"),
      },
      {
        slug: "tualetnaya-voda",
        title: "ТУАЛЕТНАЯ ВОДА",
        range: "5-15%",
        subtitle: "Лёгкое дневное звучание",
        description: "Более прозрачный профиль для мягкой повседневной носки",
        image: "/images/sections/duhi/tualetnaya-voda.png",
        filter: (product) =>
          product.category === "fragrance" && product.concentration.toLowerCase().includes("eau de toilette"),
      },
      {
        slug: "odekolon",
        title: "ОДЕКОЛОН",
        range: "2-4%",
        subtitle: "Свежий формат с минимальной плотностью",
        description: "Цитрусовые и чистые композиции на тёплый сезон",
        image: "/images/sections/duhi/odekolon.png",
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
        image: "/images/products/DSF1475-2_upscayl_8x_upscayl-standard-4x.png",
        filter: (product) => product.category === "home",
      },
      {
        slug: "diffuzory",
        title: "ДИФФУЗОРЫ",
        range: "HOME",
        subtitle: "Постоянный аромат в пространстве",
        description: "Подбор по интенсивности и площади помещения",
        image: "/images/products/terre.webp",
        filter: (product) => product.category === "home",
      },
      {
        slug: "tekstil-i-sprei",
        title: "ТЕКСТИЛЬ И СПРЕИ",
        range: "HOME",
        subtitle: "Лёгкие форматы для домашнего ритуала",
        description: "Ароматизация текстиля и точечное применение в интерьере",
        image: "/images/products/aurore.webp",
        filter: (product) => product.category === "home",
      },
    ],
  },
  "uhod-i-podarki": {
    title: "УХОД И ПОДАРКИ",
    subtitle: "Подразделы ухода и подарочных форматов",
    items: [
      {
        slug: "grooming",
        title: "ГРУМИНГ",
        range: "CARE",
        subtitle: "Форматы для ежедневного ухода",
        description: "Линейка ухода с фокусом на аромат и текстуру",
        image: "/images/products/MeltedSummer.png",
        filter: (product) => product.category === "home",
      },
      {
        slug: "gift-sets",
        title: "ПОДАРОЧНЫЕ НАБОРЫ",
        range: "GIFT",
        subtitle: "Собранные решения для подарка",
        description: "Готовые наборы и позиции для персонального выбора",
        image: "/images/products/MainImage.jpg",
        filter: (product) => product.category === "discovery",
      },
      {
        slug: "discovery",
        title: "НАБОРЫ ЗНАКОМСТВА",
        range: "DISCOVERY",
        subtitle: "Первый шаг перед полноразмерным флаконом",
        description: "Пробники для точного подбора аромата",
        image: "/images/products/DSF1475-2.webp",
        filter: (product) => product.category === "discovery",
      },
    ],
  },
  "kontent-i-brend": {
    title: "КОНТЕНТ И БРЕНД",
    subtitle: "Подразделы с редакционным контекстом бренда",
    items: [
      {
        slug: "novinki",
        title: "НОВИНКИ",
        range: "БРЕНД",
        subtitle: "Актуальные релизы и фокусные позиции",
        description: "Подборка текущих и ближайших запусков",
        image: "/images/products/Major_Tom_upscayl_8x_upscayl-standard-4x.png",
        filter: (product) => product.category === "fragrance",
      },
      {
        slug: "arhiv-kollekcii",
        title: "АРХИВ КОЛЛЕКЦИИ",
        range: "БРЕНД",
        subtitle: "История форматов и направлений",
        description: "Витрина ключевых релизов в текущем каталоге",
        image: "/images/sections/duhi/parfyumernaya-voda.png",
        filter: () => true,
      },
      {
        slug: "redakciya",
        title: "РЕДАКЦИЯ",
        range: "КОНТЕНТ",
        subtitle: "Выбор редакции и тематические подборки",
        description: "Подборки по настроению, сезону и сценариям",
        image: "/images/editorial/about.png",
        filter: (product) => product.category !== "atelier",
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
  const siblings = sectionConfig.items
    .filter((item) => item.slug !== activeSlug)
    .map(
      (item) =>
        `<a class="subsection-nav__link" href="/${escapeHtml(sectionSlug)}/${escapeHtml(item.slug)}" data-link>${escapeHtml(item.title)}</a>`
    )
    .join("");

  return `
    <nav class="subsection-nav" aria-label="Подразделы">
      <a class="subsection-nav__back" href="/${escapeHtml(sectionSlug)}" data-link>Все подразделы</a>
      <div class="subsection-nav__links">${siblings}</div>
    </nav>
  `;
}

export function SectionLandingPage(sectionSlug) {
  const section = getSectionConfig(sectionSlug);
  if (!section) return null;
  return `
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div>
          <h1>${escapeHtml(section.title)}</h1>
          <p>${escapeHtml(section.subtitle)}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container fragrance-stack">
        ${section.items
          .map(
            (item) => `
              <a class="fragrance-band" href="/${escapeHtml(sectionSlug)}/${escapeHtml(item.slug)}" data-link style="--fragrance-image: url('${escapeHtml(item.image)}');">
                <div class="fragrance-band__image"></div>
                <div class="fragrance-band__overlay"></div>
                <div class="fragrance-band__content">
                  <span>${escapeHtml(item.range)}</span>
                  <h2>${escapeHtml(item.title)}</h2>
                  <p>${escapeHtml(item.subtitle)}</p>
                  <small>${escapeHtml(item.description)}</small>
                </div>
              </a>
            `
          )
          .join("")}
      </div>
    </section>
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

  const products = getProducts().filter(subsection.filter || (() => false));
  const heroLine = getSubsectionHeroLine(subsection);

  return `
    <section class="page-hero page-hero--subsection" style="--subsection-image: url('${escapeHtml(subsection.image)}');">
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
          <p>${products.length} ${products.length === 1 ? "позиция" : "позиций"}</p>
          <p>Каталог раздела «${escapeHtml(subsection.title)}»</p>
        </div>
        <div class="product-grid product-grid--catalog">
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
