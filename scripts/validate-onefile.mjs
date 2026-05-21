import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:4173/onefile-noirparfum.html";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const pageErrors = [];
const consoleErrors = [];

page.on("pageerror", (error) => {
  pageErrors.push(error.message);
});

page.on("console", (msg) => {
  if (msg.type() === "error") {
    consoleErrors.push(msg.text());
  }
});

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForSelector("#app", { timeout: 10000 });
await page.waitForTimeout(400);

const catalogLink = page.locator('a[href="/catalog"][data-link]').first();
if ((await catalogLink.count()) > 0) {
  await catalogLink.click();
  await page.waitForTimeout(250);
}

const addToCartBtn = page.locator("[data-add-cart]").first();
if ((await addToCartBtn.count()) > 0) {
  await addToCartBtn.click();
  await page.waitForTimeout(200);
}

const cartLink = page.locator('a[href="/cart"][data-link]').first();
if ((await cartLink.count()) > 0) {
  await cartLink.click();
  await page.waitForTimeout(300);
}

const hasCartItem = (await page.locator(".cart-item").count()) > 0;
const appHtmlLength = await page.locator("#app").evaluate((el) => el.innerHTML.length);
const currentPath = await page.evaluate(() => location.pathname);

await browser.close();

console.log(
  JSON.stringify(
    {
      ok: pageErrors.length === 0,
      pageErrors,
      consoleErrors,
      hasCartItem,
      appHtmlLength,
      currentPath,
    },
    null,
    2,
  ),
);
