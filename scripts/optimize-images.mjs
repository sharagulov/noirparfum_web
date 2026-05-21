/**
 * Optimize raster assets under public/images:
 * - PNG/JPEG → WebP (quality 84)
 * - Resize by asset role (flacon, banner, hero)
 * - Optional --prune to remove superseded PNG/JPEG after WebP exists
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesDir = path.join(root, "public", "images");
const quality = 84;
const prune = process.argv.includes("--prune");
const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp"]);

/** @returns {{ max: number, fit: "inside", withoutEnlargement: true } | null} */
function resizeOptions(relPosix) {
  const p = relPosix.replace(/\\/g, "/").toLowerCase();
  if (p.includes("hero-main")) {
    return { width: 1920, height: 1920, fit: "inside", withoutEnlargement: true };
  }
  if (p.includes("/flacons/") || p.includes("home_categories") || p.includes("/products/candles/")) {
    return { width: 800, height: 800, fit: "inside", withoutEnlargement: true };
  }
  if (p.includes("/sections/") || p.includes("/editorial/") || p.includes("/brand/")) {
    return { width: 1600, height: 99999, fit: "inside", withoutEnlargement: true };
  }
  if (p.startsWith("products/")) {
    return { width: 800, height: 800, fit: "inside", withoutEnlargement: true };
  }
  return { width: 1600, height: 99999, fit: "inside", withoutEnlargement: true };
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && RASTER.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
  return files;
}

function formatBytes(n) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

async function optimizeFile(absPath) {
  const rel = path.relative(imagesDir, absPath);
  const relPosix = rel.split(path.sep).join("/");
  const ext = path.extname(absPath).toLowerCase();
  const base = absPath.slice(0, -ext.length);
  const outPath = `${base}.webp`;

  let pipeline = sharp(absPath, { failOn: "none" }).rotate();
  const resize = resizeOptions(relPosix);
  if (resize) pipeline = pipeline.resize(resize);
  pipeline = pipeline.webp({ quality, effort: 4 });

  const before = fs.statSync(absPath).size;
  if (outPath === absPath) {
    const tmp = `${outPath}.opt.tmp`;
    await pipeline.toFile(tmp);
    await fs.promises.copyFile(tmp, outPath);
    await fs.promises.unlink(tmp);
  } else {
    await pipeline.toFile(outPath);
  }
  const after = fs.statSync(outPath).size;

  const sourceIsLossy = ext === ".jpg" || ext === ".jpeg";
  const sourceIsPng = ext === ".png";
  if (prune && (sourceIsLossy || sourceIsPng) && outPath !== absPath) {
    fs.unlinkSync(absPath);
  } else if (ext === ".webp" && prune && absPath !== outPath) {
    // no-op: same file
  }

  return { rel: relPosix, before, after, out: path.relative(imagesDir, outPath).split(path.sep).join("/"), pruned: prune && ext !== ".webp" };
}

function totalRasterBytes(dir) {
  return walk(dir).reduce((sum, f) => sum + fs.statSync(f).size, 0);
}

async function main() {
  if (!fs.existsSync(imagesDir)) {
    console.error("Missing public/images");
    process.exit(1);
  }

  const beforeTotal = totalRasterBytes(imagesDir);
  const files = walk(imagesDir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    if (ext === ".webp") return true;
    return ext === ".png" || ext === ".jpg" || ext === ".jpeg";
  });

  const sources = files.filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext === ".png" || ext === ".jpg" || ext === ".jpeg";
  });
  const recompressWebp = process.argv.includes("--recompress-webp");
  const toProcess = recompressWebp
    ? [
        ...sources,
        ...files.filter((f) => path.extname(f).toLowerCase() === ".webp" && !hasRasterSibling(f, new Set(sources))),
      ]
    : sources;

  console.log(`Optimizing ${toProcess.length} file(s) in public/images …`);
  let saved = 0;
  for (const file of toProcess) {
    try {
      const result = await optimizeFile(file);
      const delta = result.before - result.after;
      saved += Math.max(0, delta);
      console.log(
        `  ${result.rel} → ${result.out}  ${formatBytes(result.before)} → ${formatBytes(result.after)}${result.pruned ? " (source removed)" : ""}`
      );
    } catch (err) {
      console.error(`  FAIL ${path.relative(imagesDir, file)}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  const afterTotal = totalRasterBytes(imagesDir);
  console.log(`\nTotal raster: ${formatBytes(beforeTotal)} → ${formatBytes(afterTotal)}`);
  if (prune) console.log("Prune: removed converted PNG/JPEG sources.");
  else console.log('Tip: re-run with --prune to delete superseded PNG/JPEG after verifying references.');
}

function hasRasterSibling(webpPath, sources) {
  const base = webpPath.slice(0, -".webp".length);
  return [...sources].some((s) => s.startsWith(base + "."));
}

main();
