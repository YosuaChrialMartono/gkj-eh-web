import { test, expect, Page } from "@playwright/test"

const CREDS = { email: "admin@gkj.test", password: "admin123" }

async function login(page: Page) {
  await page.goto("/login")
  await page.locator("#email").fill(CREDS.email)
  await page.locator("#password").fill(CREDS.password)
  await page.getByRole("button", { name: /^masuk$|^login$/i }).click()
  await page.waitForURL(/\/(dashboard|content|pelayan|laporan|title-converter)/, {
    timeout: 10000,
  })
}

async function hasHorizontalOverflow(page: Page): Promise<{
  overflow: boolean
  body: number
  viewport: number
}> {
  return await page.evaluate(() => {
    const body = document.documentElement.scrollWidth
    const viewport = document.documentElement.clientWidth
    return { overflow: body > viewport + 1, body, viewport }
  })
}

const routes = [
  { path: "/dashboard", name: "dashboard" },
  { path: "/content", name: "content list" },
  { path: "/content/new", name: "content new" },
  { path: "/pelayan", name: "pelayan jadwal" },
  { path: "/pelayan/roles", name: "pelayan roles" },
  { path: "/title-converter", name: "title converter" },
  { path: "/laporan", name: "laporan list" },
  { path: "/laporan/new", name: "laporan new" },
  { path: "/statistik", name: "statistik" },
]

test.describe("mobile responsiveness", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  for (const r of routes) {
    test(`${r.name} (${r.path}) no horizontal overflow`, async ({ page }) => {
      await page.goto(r.path)
      await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(500)
      const { overflow, body, viewport } = await hasHorizontalOverflow(page)
      const label = `${r.path} body=${body}px viewport=${viewport}px`
      console.log(label, overflow ? "OVERFLOW" : "ok")
      expect(overflow, label).toBeFalsy()
    })
  }
})

test("login page no horizontal overflow", async ({ page }) => {
  await page.goto("/login")
  await page.waitForLoadState("domcontentloaded")
  await page.waitForTimeout(500)
  const { overflow, body, viewport } = await hasHorizontalOverflow(page)
  expect(overflow, `/login body=${body}px viewport=${viewport}px`).toBeFalsy()
})

test("register page no horizontal overflow", async ({ page }) => {
  await page.goto("/register")
  await page.waitForLoadState("domcontentloaded")
  await page.waitForTimeout(500)
  const { overflow, body, viewport } = await hasHorizontalOverflow(page)
  expect(overflow, `/register body=${body}px viewport=${viewport}px`).toBeFalsy()
})
