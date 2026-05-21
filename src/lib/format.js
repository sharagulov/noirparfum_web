export function rub(value) {
  if (value === null || value === undefined) return "по запросу";
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export function compactRub(value) {
  if (value === null || value === undefined) return "цена по запросу";
  return rub(value);
}

export function plural(value, forms) {
  const abs = Math.abs(value) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .trim();
}

export function toTitle(value) {
  return String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const concentrationMap = {
  "eau de parfum": "Парфюмерная вода",
  "extrait de parfum": "Духи",
  "parfum cologne": "Одеколон",
  "eau de toilette": "Туалетная вода",
  "discovery set": "Набор пробников",
  candle: "Свеча",
  bespoke: "Индивидуальный формат",
};

export function localizeConcentration(value) {
  const source = String(value || "").trim();
  const mapped = concentrationMap[source.toLowerCase()];
  return mapped || source;
}
