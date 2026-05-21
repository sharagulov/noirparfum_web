import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const distIndexPath = path.join(distDir, "index.html");
const outputPath = path.join(rootDir, "onefile-noirparfum.html");

const distHtml = await fs.readFile(distIndexPath, "utf8");

const cssAssetMatches = [
  ...distHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi),
];
const jsAssetMatches = [
  ...distHtml.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi),
];

async function readAssetFile(assetPathFromHtml) {
  const normalizedPath = assetPathFromHtml.replace(/^\//, "");
  const absolutePath = path.join(distDir, normalizedPath);
  return fs.readFile(absolutePath, "utf8");
}

let inlinedHtml = distHtml;

for (const match of cssAssetMatches) {
  const [fullTag, href] = match;
  const cssContent = await readAssetFile(href);
  const styleTag = `<style data-inline-source="${href}">\n${cssContent}\n</style>`;
  inlinedHtml = inlinedHtml.replace(fullTag, styleTag);
}

for (const match of jsAssetMatches) {
  const [fullTag, src] = match;
  const jsContent = (await readAssetFile(src)).replace(/<\/script>/gi, "<\\/script>");
  const scriptTag = `<script type="module" data-inline-source="${src}">\n${jsContent}\n</script>`;
  inlinedHtml = inlinedHtml.replace(fullTag, scriptTag);
}

if (!/name=["']color-scheme["']/i.test(inlinedHtml)) {
  inlinedHtml = inlinedHtml.replace(
    /<meta charset="UTF-8"\s*\/?>/i,
    '<meta charset="UTF-8" />\n    <meta name="color-scheme" content="dark" />',
  );
}

inlinedHtml = inlinedHtml.replace(
  /<body>/i,
  '<body data-theme="dark">\n    <!-- Dark theme: NOIR Parfum single-file build -->',
);

await fs.writeFile(outputPath, inlinedHtml, "utf8");
console.log(`Created: ${outputPath}`);
