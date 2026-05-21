import { getProduct, getVariant, getPurchasableVariant } from "../lib/catalog.js";

const storageKey = "noirparfum_full_state";
const subscribers = new Set();

const initialState = {
  cart: [],
  compare: [],
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return structuredClone(initialState);
    const parsed = JSON.parse(raw);
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      compare: Array.isArray(parsed.compare) ? parsed.compare : [],
    };
  } catch {
    return structuredClone(initialState);
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  subscribers.forEach((subscriber) => subscriber(getState()));
}

export function subscribe(subscriber) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function getState() {
  return structuredClone(state);
}

export function resetState(next = initialState) {
  state = structuredClone(next);
  persist();
}

export function addToCart(slug, variantId, quantity = 1) {
  const product = getProduct(slug);
  const variant = getPurchasableVariant(product, variantId);
  if (!product || !variant) return false;
  const existing = state.cart.find((item) => item.slug === slug && item.variantId === variant.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    state.cart.push({ slug, variantId: variant.id, quantity });
  }
  persist();
  return true;
}

export function updateQuantity(slug, variantId, quantity) {
  const normalized = Math.max(0, Number(quantity) || 0);
  if (normalized === 0) {
    removeFromCart(slug, variantId);
    return;
  }
  const item = state.cart.find((entry) => entry.slug === slug && entry.variantId === variantId);
  if (item) {
    item.quantity = normalized;
    persist();
  }
}

export function removeFromCart(slug, variantId) {
  state.cart = state.cart.filter((item) => item.slug !== slug || item.variantId !== variantId);
  persist();
}

export function clearCart() {
  state.cart = [];
  persist();
}

export function toggleCompare(slug) {
  if (state.compare.includes(slug)) {
    state.compare = state.compare.filter((item) => item !== slug);
  } else {
    state.compare = [...state.compare, slug].slice(-4);
  }
  persist();
}

export function removeCompare(slug) {
  state.compare = state.compare.filter((item) => item !== slug);
  persist();
}

export function isCompared(slug) {
  return state.compare.includes(slug);
}

export function cartLines() {
  return state.cart
    .map((item) => {
      const product = getProduct(item.slug);
      const variant = getVariant(product, item.variantId);
      if (!product || !variant) return null;
      return {
        ...item,
        product,
        variant,
        lineTotal: variant.price === null ? 0 : variant.price * item.quantity,
      };
    })
    .filter(Boolean);
}

export function cartTotals(deliveryPrice = 0) {
  const lines = cartLines();
  const subtotal = lines.reduce((sum, item) => sum + item.lineTotal, 0);
  const paidLines = lines.filter((item) => item.variant.price !== null);
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const samples = subtotal >= 12000 ? 2 : 0;
  const delivery = subtotal >= 15000 ? 0 : deliveryPrice;
  return {
    subtotal,
    delivery,
    total: subtotal + delivery,
    totalQuantity,
    paidLines: paidLines.length,
    samples,
  };
}

export function compareProducts() {
  return state.compare.map(getProduct).filter(Boolean);
}
