import { test, expect, Page } from "@playwright/test"

async function rect(page: Page, selector: string) {
  return page.evaluate((s) => {
    const el = document.querySelector(s) as HTMLElement | null
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }, selector)
}

test.describe("public content navigation: no layout flash between /news and /sermons", () => {
  // Slow the backend so the loading.tsx skeleton stays visible long enough
  // to measure its bounding box.
  test.beforeEach(async ({ page }) => {
    await page.route("**/content/public*", async (route) => {
      await new Promise((r) => setTimeout(r, 800))
      return route.continue()
    })
  })

  test("skeleton outer container matches loaded page outer container (news)", async ({ page }) => {
    await page.goto("/news")
    // While loading, the page contains the loading.tsx skeleton — same outer container class.
    // Wait for either the skeleton or the loaded heading.
    await page.waitForSelector("h1:has-text('Berita')")
    const skeletonContainerRect = await rect(page, "main > div")
    expect(skeletonContainerRect, "skeleton container exists").toBeTruthy()

    // Wait for the real content (cards or "Belum ada" message)
    await page.waitForLoadState("domcontentloaded")
    await page.waitForFunction(() => {
      const hasCards = document.querySelector("[data-slot='card']")
      const hasEmpty = document.body.textContent?.includes("Belum ada")
      return hasCards || hasEmpty
    }, undefined, { timeout: 15000 })

    const loadedContainerRect = await rect(page, "main > div")
    expect(loadedContainerRect).toEqual(skeletonContainerRect)
  })

  test("h1 title position is identical in skeleton and loaded state (sermons)", async ({ page }) => {
    await page.goto("/sermons")
    const skeletonH1Rect = await rect(page, "h1")
    expect(skeletonH1Rect).toBeTruthy()

    await page.waitForFunction(() => {
      const hasCards = document.querySelector("[data-slot='card']")
      const hasEmpty = document.body.textContent?.includes("Belum ada")
      return hasCards || hasEmpty
    }, undefined, { timeout: 15000 })

    const loadedH1Rect = await rect(page, "h1")
    expect(loadedH1Rect).toEqual(skeletonH1Rect)
  })

  test("nav /news → /sermons: title rect stable through transition", async ({ page }) => {
    // First visit /news (loaded)
    await page.goto("/news")
    await page.waitForFunction(
      () => !!document.querySelector("[data-slot='card']") || !!document.body.textContent?.includes("Belum ada"),
      undefined,
      { timeout: 15000 },
    )
    const newsLoadedRect = await rect(page, "h1")

    // Click "Khotbah" nav link — backend is slowed by route() so loading.tsx shows
    const clickPromise = page.getByRole("link", { name: "Khotbah" }).click()
    // Race: capture skeleton's h1 ASAP after navigation begins
    await page.waitForURL(/\/sermons/, { timeout: 10000 })
    await clickPromise
    const skeletonH1Rect = await rect(page, "h1")

    // Skeleton h1 should align horizontally with where the loaded news h1 was
    // (same outer container max-w/px so x, w, h should match).
    expect(skeletonH1Rect?.x, "x").toBe(newsLoadedRect?.x)
    expect(skeletonH1Rect?.w, "w").toBe(newsLoadedRect?.w)

    // After load completes, h1 stays at same position
    await page.waitForFunction(
      () => !!document.querySelector("[data-slot='card']") || !!document.body.textContent?.includes("Belum ada"),
      undefined,
      { timeout: 15000 },
    )
    const sermonsLoadedRect = await rect(page, "h1")
    expect(sermonsLoadedRect?.x).toBe(skeletonH1Rect?.x)
    expect(sermonsLoadedRect?.w).toBe(skeletonH1Rect?.w)
  })
})

test.describe("public content cache: second visit is near-instant", () => {
  test("second visit to /news within 60s does not show the skeleton (cache hit)", async ({ page }) => {
    // Visit once (will hit BE, populate Next.js cache)
    await page.goto("/news")
    await page.waitForLoadState("domcontentloaded")
    await page.waitForFunction(
      () => !!document.querySelector("[data-slot='card']") || !!document.body.textContent?.includes("Belum ada"),
      undefined,
      { timeout: 15000 },
    )

    // Now slow the BE for ANY follow-up request
    let backendHits = 0
    await page.route("**/content/public*", async (route) => {
      backendHits++
      await new Promise((r) => setTimeout(r, 1500))
      return route.continue()
    })

    // Re-visit /news — should serve from cache without hitting BE
    await page.goto("/news")
    // Loaded state appears fast (no 1.5s wait); cards render almost immediately
    const start = Date.now()
    await page.waitForFunction(
      () => !!document.querySelector("[data-slot='card']") || !!document.body.textContent?.includes("Belum ada"),
      undefined,
      { timeout: 1200 },
    )
    const elapsed = Date.now() - start
    console.log(`re-visit /news content visible after ${elapsed}ms; BE hits: ${backendHits}`)
    // If cache works, BE shouldn't have been hit at all on the re-visit
    expect(backendHits, "no BE hit on cached re-visit").toBe(0)
  })
})
