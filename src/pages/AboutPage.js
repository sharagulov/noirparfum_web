import brand from "../data/brand.json";
import { SectionTitle } from "../components/SectionTitle.js";
import { escapeHtml } from "../lib/format.js";

export function AboutPage() {
  return `
    <section class="page-hero page-hero--compact">
      <div class="container page-hero__split">
        <div>
          <h1>О бренде</h1>
          <p>${escapeHtml(brand.lead)}</p>
        </div>
        <div class="editorial-image">
          <img src="/images/editorial/about.webp" alt="Материалы и атмосфера NOIR Parfum" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container content-narrow">
        ${brand.story.map((paragraph) => `<p class="lead-copy">${escapeHtml(paragraph)}</p>`).join("")}
      </div>
    </section>

    <section class="section section--band">
      <div class="container value-grid">
        ${brand.values
          .map(
            (value) => `
              <article>
                <span></span>
                <h2>${escapeHtml(value.title)}</h2>
                <p>${escapeHtml(value.text)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="section">
      <div class="container atelier-story">
        ${SectionTitle({
          label: "Наши коллекции",
          title: "Коллекции",
          text: "Короткая структура каталога: духи, наборы, дом и специальные позиции под запрос"
        })}
        <div class="timeline">
          <div><span>01</span><p>Духи — основная линейка ароматов</p></div>
          <div><span>02</span><p>Наборы — форматы для знакомства и подарков</p></div>
          <div><span>03</span><p>Дом и ателье — интерьерные и кастомные форматы</p></div>
        </div>
      </div>
    </section>
  `;
}
