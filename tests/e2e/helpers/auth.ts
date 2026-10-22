import { expect, type Page } from "@playwright/test"

export function fixturePassword() {
  if (!process.env.E2E_PASSWORD) throw new Error("E2E_PASSWORD must match the disposable database SEED_PASSWORD")
  return process.env.E2E_PASSWORD
}

export async function login(page: Page, email = "admin@gkj.test") {
  await page.goto("/login")
  await page.getByLabel("Email", { exact: true }).fill(email)
  await page.getByLabel("Password", { exact: true }).fill(fixturePassword())
  await page.getByRole("button", { name: "Masuk", exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
}
