import { escapeHtml } from "../lib/format.js";

export const SORT_STORAGE_KEY = "noir-product-sort";

export const SORT_OPTIONS = [
  { value: "default", label: "По умолчанию" },
  { value: "price-asc", label: "Цена ↑" },
  { value: "price-desc", label: "Цена ↓" },
  { value: "name", label: "Название А–Я" },
  { value: "new", label: "Новинки" },
];

export function getStoredSort() {
  if (typeof sessionStorage === "undefined") return "default";
  try {
    const stored = sessionStorage.getItem(SORT_STORAGE_KEY);
    return SORT_OPTIONS.some((option) => option.value === stored) ? stored : "default";
  } catch {
    return "default";
  }
}

export function setStoredSort(value) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SORT_STORAGE_KEY, value);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function ProductSort({ active = getStoredSort() } = {}) {
  const options = SORT_OPTIONS.map((option) => {
    const isActive = option.value === active;
    return `
      <button
        class="product-sort__option${isActive ? " is-active" : ""}"
        type="button"
        data-sort-option="${escapeHtml(option.value)}"
        aria-pressed="${isActive ? "true" : "false"}"
      >${escapeHtml(option.label)}</button>
    `;
  }).join("");

  return `
    <div class="product-sort" role="group" aria-labelledby="product-sort-label">
      <span class="product-sort__label" id="product-sort-label">Сортировка</span>
      <div class="product-sort__options">${options}</div>
    </div>
  `;
}

export function sortableGridAttrs(slugs) {
  return `data-sortable-grid data-product-slugs='${JSON.stringify(slugs)}'`;
}
