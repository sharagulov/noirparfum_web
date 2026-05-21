import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const products = readJson("src/data/products.json");
const collections = readJson("src/data/collections.json");

const slugs = new Set();
const variants = new Set();
let ok = true;

for (const product of products) {
  required(product, ["id", "slug", "name", "russianName", "category", "collection", "status", "priceLabel", "notes", "variants", "image"]);
  if (slugs.has(product.slug)) fail(`Duplicate slug: ${product.slug}`);
  slugs.add(product.slug);
  if (!collections.some((collection) => collection.id === product.collection)) fail(`Unknown collection for ${product.slug}: ${product.collection}`);
  if (!Array.isArray(product.variants) || !product.variants.length) fail(`No variants for ${product.slug}`);
  for (const variant of product.variants || []) {
    if (variants.has(variant.id)) fail(`Duplicate variant: ${variant.id}`);
    variants.add(variant.id);
    if (variant.price !== null && typeof variant.price !== "number") fail(`Invalid price for ${variant.id}`);
  }
  if (product.priceFrom !== null && typeof product.priceFrom !== "number") fail(`Invalid priceFrom for ${product.slug}`);
  if (product.image?.ready && !fs.existsSync(path.join(root, "public", product.image.src.replace(/^\//, "")))) {
    fail(`Missing ready image: ${product.image.src}`);
  }
}

for (const collection of collections) {
  required(collection, ["id", "title", "name", "description", "heroProduct"]);
  if (!slugs.has(collection.heroProduct)) fail(`Unknown hero product for ${collection.id}: ${collection.heroProduct}`);
}

if (!ok) process.exit(1);
console.log(`OK: ${products.length} products, ${collections.length} collections`);

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function required(object, fields) {
  for (const field of fields) {
    if (!(field in object)) fail(`Missing field "${field}"`);
  }
}

function fail(message) {
  ok = false;
  console.error(message);
}
