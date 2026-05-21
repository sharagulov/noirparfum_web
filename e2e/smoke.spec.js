import { expect, test } from "@playwright/test";

test("catalog, product, cart and checkout are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "NOIR" })).toBeVisible();
  await page.getByRole("link", { name: "Открыть каталог" }).click();
  await expect(page.getByRole("heading", { name: "Каталог" })).toBeVisible();
  await page.getByRole("link", { name: "MINUIT" }).first().click();
  await expect(page.getByRole("heading", { name: "MINUIT" })).toBeVisible();
  await page.getByRole("button", { name: "Добавить в корзину" }).click();
  await page.getByRole("link", { name: "Корзина" }).click();
  await expect(page.getByRole("heading", { name: "Корзина" })).toBeVisible();
  await page.getByRole("link", { name: "Оформить заказ" }).click();
  await expect(page.getByRole("heading", { name: "Оплата заказа" })).toBeVisible();
});

test("compare page accepts products", async ({ page }) => {
  await page.goto("/catalog");
  await page.getByLabel("Добавить к сравнению").first().click();
  await page.getByRole("link", { name: "Сравнение" }).first().click();
  await expect(page.getByRole("heading", { name: "Сравнение" })).toBeVisible();
  await expect(page.getByText("MINUIT")).toBeVisible();
});
