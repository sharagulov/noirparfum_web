import products from "../data/products.json";
import collections from "../data/collections.json";
import { normalize } from "./format.js";

export const categoryLabels = {
  all: "Все",
  fragrance: "Ароматы",
  discovery: "Наборы",
  home: "Дом",
  atelier: "Atelier",
};

export const statusLabels = {
  in_stock: "в наличии",
  low_stock: "мало",
  on_request: "под заказ",
};

export function getProducts() {
  return products;
}

export function getCollections() {
  return collections;
}

export function getProduct(slug) {
  return products.find((product) => product.slug === slug) || null;
}

export function getCollection(id) {
  return collections.find((collection) => collection.id === id) || null;
}

export function getVariant(product, variantId) {
  if (!product) return null;
  return product.variants.find((variant) => variant.id === variantId) || product.variants[0] || null;
}

export function getPurchasableVariant(product, variantId) {
  const variant = getVariant(product, variantId);
  if (!variant || !variant.available || variant.price === null) return null;
  return variant;
}

export function isPurchasable(product) {
  return product.variants.some((variant) => variant.available && variant.price !== null);
}

export function filterProducts(list, filters = {}) {
  const q = normalize(filters.query);
  return list.filter((product) => {
    const inCategory = !filters.category || filters.category === "all" || product.category === filters.category;
    const inCollection = !filters.collection || filters.collection === "all" || product.collection === filters.collection;
    const inStatus = !filters.status || filters.status === "all" || product.status === filters.status;
    const inQuery =
      !q ||
      normalize(
        [
          product.name,
          product.russianName,
          product.short,
          product.mood,
          product.concentration,
          product.accords.join(" "),
          product.notes.top.join(" "),
          product.notes.heart.join(" "),
          product.notes.base.join(" "),
        ].join(" ")
      ).includes(q);
    return inCategory && inCollection && inStatus && inQuery;
  });
}

export function isNewProduct(product) {
  return (product.labels || []).some((label) => normalize(label) === "новинка");
}

function catalogOrderIndex(product) {
  return products.findIndex((item) => item.id === product.id);
}

export function sortProducts(list, sort = "default") {
  const copy = [...list];
  if (sort === "default") {
    return copy;
  }
  if (sort === "price-asc") {
    return copy.sort((a, b) => priceSortValue(a) - priceSortValue(b));
  }
  if (sort === "price-desc") {
    return copy.sort((a, b) => priceSortValue(b) - priceSortValue(a));
  }
  if (sort === "new") {
    return copy.sort((a, b) => {
      const aNew = isNewProduct(a) ? 0 : 1;
      const bNew = isNewProduct(b) ? 0 : 1;
      if (aNew !== bNew) return aNew - bNew;
      return catalogOrderIndex(a) - catalogOrderIndex(b);
    });
  }
  if (sort === "intensity") {
    return copy.sort((a, b) => b.intensity - a.intensity);
  }
  if (sort === "name") {
    return copy.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }
  if (sort === "featured") {
    return copy.sort((a, b) => {
      const priority = { in_stock: 0, low_stock: 1, on_request: 2 };
      return priority[a.status] - priority[b.status];
    });
  }
  return copy;
}

export function priceSortValue(product) {
  return product.priceFrom === null ? Number.POSITIVE_INFINITY : product.priceFrom;
}

export function relatedProducts(product, limit = 3) {
  if (!product) return [];
  const direct = product.pairWith.map(getProduct).filter(Boolean);
  const same = products.filter(
    (item) => item.slug !== product.slug && item.collection === product.collection && !direct.includes(item)
  );
  return [...direct, ...same].slice(0, limit);
}

export function availableCategories() {
  return Object.entries(categoryLabels).map(([value, label]) => ({ value, label }));
}

export function availableStatuses() {
  return [
    { value: "all", label: "Любой статус" },
    { value: "in_stock", label: "В наличии" },
    { value: "low_stock", label: "Мало" },
    { value: "on_request", label: "Под заказ" },
  ];
}
