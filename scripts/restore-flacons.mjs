// Restore original flacon images from git and re-encode to high-quality WebP.
// Usage: node scripts/restore-flacons.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const tmpDir = path.join(root, ".restore-flacons-tmp");
const flaconsDir = path.join(root, "public", "images", "products", "flacons");
const newDir = path.join(flaconsDir, "new");

const renameMap = {
  "image_part_001.png": "minuit",
  "image_part_002.png": "cendres",
  "image_part_003.png": "aurore",
  "image_part_004.png": "terre",
  "image_part_005.png": "velours",
  "image_part_006.png": "lumen",
  "image_part_007.png": "obsidienne",
  "image_part_008.png": "sylhour-noir",
  "image_part_009.png": "la-nuit-discovery",
  "image_part_010.png": "chambre-noire",
  "image_part_011.png": "atelier-noir",
  "image_part_012.png": "encens",
  "image_part_013.png": "nebuleuse",
  "image_part_014.png": "fer-noir",
  "image_part_015.png": "opale",
  "image_part_016.png": "brume-interieure",
  "image_part_017.png": "carte-noire",
  "image_part_018.png": "absinthe",
  "image_part_019.png": "veille",
  "image_part_020.png": "miroir",
};

const newFlacons = [
  "ambre-froid",
  "bois-encre",
  "brume-chambre",
  "brume-sel",
  "cendre-or",
  "cire-minuit",
  "cuir-fauve",
  "decouverte-crepuscule",
  "encens-maison",
  "epices-rouges",
  "fleur-cendre",
  "iris-deuil",
  "noctivore",
  "orage-gris",
  "passeport-noir",
  "pluie-metal",
  "resine-noire",
  "salon-obscur",
  "santal-blanc",
  "tabac-velours",
];

const quality = 94;
const flaconMax = 1800;

fs.mkdirSync(tmpDir, { recursive: true });
fs.mkdirSync(flaconsDir, { recursive: true });
fs.mkdirSync(newDir, { recursive: true });

function gitShow(ref, file, outPath) {
  const buf = execFileSync("git", ["show", `${ref}:${file}`], { maxBuffer: 200 * 1024 * 1024 });
  fs.writeFileSync(outPath, buf);
}

async function encode(src, outPath) {
  const before = fs.statSync(src).size;
  await sharp(src, { failOn: "none" })
    .rotate()
    .resize({ width: flaconMax, height: flaconMax, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outPath);
  const after = fs.statSync(outPath).size;
  return { before, after };
}

const ref1 = "9081fcc";
const ref2 = "13e2ffc";

let totalBefore = 0;
let totalAfter = 0;

console.log("Restoring main flacon line from", ref1);
for (const [orig, slug] of Object.entries(renameMap)) {
  const srcInGit = `public/images/products/flacons/${orig}`;
  const tmpFile = path.join(tmpDir, orig);
  try {
    gitShow(ref1, srcInGit, tmpFile);
  } catch (e) {
    console.warn(`  skip ${orig}: ${e.message.split("\n")[0]}`);
    continue;
  }
  const outPath = path.join(flaconsDir, `${slug}.webp`);
  const r = await encode(tmpFile, outPath);
  totalBefore += r.before;
  totalAfter += r.after;
  console.log(`  ${orig} → flacons/${slug}.webp  ${(r.before / 1024).toFixed(0)} KB → ${(r.after / 1024).toFixed(0)} KB`);
}

console.log("\nRestoring new flacon line from", ref2);
for (const slug of newFlacons) {
  const srcInGit = `public/images/products/flacons/new/${slug}.jpg`;
  const tmpFile = path.join(tmpDir, `new-${slug}.jpg`);
  try {
    gitShow(ref2, srcInGit, tmpFile);
  } catch (e) {
    console.warn(`  skip ${slug}: ${e.message.split("\n")[0]}`);
    continue;
  }
  const outPath = path.join(newDir, `${slug}.webp`);
  const r = await encode(tmpFile, outPath);
  totalBefore += r.before;
  totalAfter += r.after;
  console.log(`  ${slug}.jpg → flacons/new/${slug}.webp  ${(r.before / 1024).toFixed(0)} KB → ${(r.after / 1024).toFixed(0)} KB`);
}

console.log("\nRestoring hero-main from", ref1);
try {
  const tmp = path.join(tmpDir, "MainImage.jpg");
  gitShow(ref1, "public/images/products/MainImage.jpg", tmp);
  const out = path.join(root, "public", "images", "products", "hero-main.webp");
  const r = await sharp(tmp, { failOn: "none" })
    .rotate()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90, effort: 6 })
    .toFile(out);
  totalBefore += fs.statSync(tmp).size;
  totalAfter += fs.statSync(out).size;
  console.log(`  hero-main.webp re-encoded (${r.width}x${r.height})`);
} catch (e) {
  console.warn(`  skip hero-main: ${e.message.split("\n")[0]}`);
}

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(
  `\nDone. Original total: ${(totalBefore / (1024 * 1024)).toFixed(2)} MB → high-quality WebP: ${(totalAfter / (1024 * 1024)).toFixed(2)} MB`,
);
