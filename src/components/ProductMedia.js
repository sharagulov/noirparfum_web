import { escapeHtml } from "../lib/format.js";

export function ProductMedia(product, className = "", { priority = false } = {}) {
  const image = product.image || {};
  if (image.ready) {
    const isFlacon = String(image.src || "").includes("/flacons/");
    const imgClassAttr = isFlacon ? ' class="product-media__img--flacon"' : "";
    const isDetail = priority || className.includes("product-media--detail");
    const loadAttrs = isDetail
      ? 'loading="eager" fetchpriority="high" decoding="async"'
      : 'loading="lazy" decoding="async"';
    return `
      <div class="product-media ${className}">
        <img${imgClassAttr} src="${escapeHtml(image.src)}" alt="${escapeHtml(product.name + " " + product.russianName)}" ${loadAttrs} />
      </div>
    `;
  }
  return `
    <div class="product-media product-media--placeholder product-media--${escapeHtml(image.tone || "default")} ${className}" aria-hidden="true">
      <div class="product-media__bottle">
        <span>${escapeHtml(product.name)}</span>
      </div>
    </div>
  `;
}
