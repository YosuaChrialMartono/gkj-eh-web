import { test, expect } from "@playwright/test"
import { randomUUID } from "node:crypto"
import { Pool } from "pg"
import { encode } from "next-auth/jwt"
import { fixturePassword, login } from "./helpers/auth"

test("fabricated cookies and expired JWT cannot open protected routes", async ({ request }) => {
  const response = await request.get("/title-converter", { maxRedirects: 0, headers: { Cookie: "refresh_token=fake; authjs.session-token=fake" } })
  expect(response.status()).toBe(307)
  expect(response.headers().location).toMatch(/^\/login/)
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET required for expired-session acceptance")
  const expired = await encode({ token: { sub: randomUUID(), version: 0 }, secret: process.env.AUTH_SECRET, salt: "authjs.session-token", maxAge: -3600 })
  const current = await request.get("/api/auth/current", { headers: { Cookie: `authjs.session-token=${expired}` } })
  expect(current.status()).toBe(401)
})

test("local credentials login and title converter work without a bearer bridge", async ({ page }) => {
  await login(page)
  const current = await page.request.get("/api/auth/current")
  expect(current.ok()).toBe(true)
  const user = await current.json()
  expect(user.role).toBe("admin")
  expect(Object.keys(user).sort()).toEqual(["avatar", "email", "id", "name", "role"])
  await page.goto("/title-converter")
  await expect(page).toHaveURL(/\/title-converter$/)
  await expect(page.locator("main")).toBeVisible()
})

test("registration creates a viewer; logout revokes a copied session", async ({ page, browser, baseURL }) => {
  const url = process.env.TEST_DATABASE_URL
  if (!url || !new URL(url).pathname.endsWith("_test")) throw new Error("TEST_DATABASE_URL ending _test required for disposable registration acceptance")
  const email = `acceptance-${randomUUID()}@gkj.test`
  const pool = new Pool({ connectionString: url })
  try {
    await page.goto("/register")
    await page.getByLabel("Nama", { exact: true }).fill("Acceptance Viewer")
    await page.getByLabel("Email", { exact: true }).fill(email)
    await page.getByLabel("Password", { exact: true }).fill(fixturePassword())
    await page.getByLabel("Ulangi password", { exact: true }).fill(fixturePassword())
    await page.getByRole("button", { name: "Daftar", exact: true }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    expect((await (await page.request.get("/api/auth/current")).json()).role).toBe("viewer")
    const copied = await browser.newContext({ baseURL, storageState: await page.context().storageState() })
    try {
      const denied = await page.request.post("/api/content", { data: {} })
      expect(denied.status()).toBe(403)
      const userButton = page.getByRole("button").filter({ hasText: email })
      if (!await userButton.isVisible()) await page.getByRole("button", { name: "Toggle Sidebar" }).click()
      await userButton.click()
      await page.getByRole("menuitem", { name: "Log out", exact: true }).click()
      await expect(page).toHaveURL(/\/login$/)
      expect((await copied.request.get("/api/auth/current")).status()).toBe(401)
    } finally { await copied.close() }
  } finally {
    await pool.query("DELETE FROM users WHERE email = $1", [email])
    await pool.end()
  }
})
