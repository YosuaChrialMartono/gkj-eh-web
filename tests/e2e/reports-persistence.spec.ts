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

function samplePayload(label: string) {
  return {
    tanggal: "2026-06-21",
    waktu: "08:00",
    jenisKebaktian: `Kebaktian Test ${label}`,
    pelayanFirman: "Pdt. Test",
    perikopBacaan: "Yoh 1:1-3",
    temaRenungan: "Tema Test",
    pelayananKhusus: {
      baptisKudusAnak: 0,
      baptisKudusDewasa: 0,
      mengakuPercaya: 0,
      pemberkatanNikah: null,
    },
    persembahan: {
      melaluiKantong: { rp: 1000, amplop: 1 },
      bulanan: 0, syukur: 0, danaAbadi: 0, kasihPeduli: 0,
      syukurBaptisSidiNikah: { rp: 0, amplop: 0 },
      syukurPerjamuan: { rp: 0, amplop: 0 },
      perorangan: 0, pembangunan: 0, khusus: 0, lainLain: 0,
      jumlah: 1000, terbilang: "seribu rupiah",
    },
    kehadiranJemaat: {
      umum: { pria: 10, wanita: 12 },
      pemuda: { pria: 0, wanita: 0 },
      remaja: { pria: 0, wanita: 0 },
      anak: { pria: 0, wanita: 0 },
      total: { pria: 10, wanita: 12 },
    },
    pesertaPerjamuan: 0,
    anggotaMajelis: ["A", "B"],
    picIbadah: "X",
    organis: "Y",
    prokantor: ["a", "b", "c"],
    operatorLcd: "Z",
    tanggalJakarta: "2026-06-21",
    majelisGereja: "M",
    evaluasi: { berjalanBaik: "ok", perluDiperbaiki: "nope" },
  }
}

test.describe("reports BE persistence", () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test("create via BFF → appears in list → visible after reload → delete", async ({ page }) => {
    const payload = samplePayload(`E2E ${Date.now()}`)

    // 1. POST via FE BFF (which proxies to BE)
    const create = await page.request.post("/api/reports", { data: payload })
    expect(create.status(), "create status").toBe(201)
    const created = await create.json() as { id: string; jenisKebaktian: string }
    expect(created.id).toBeTruthy()
    expect(created.jenisKebaktian).toBe(payload.jenisKebaktian)

    try {
      // 2. List should include it
      const list = await page.request.get("/api/reports")
      expect(list.status()).toBe(200)
      const items = await list.json() as Array<{ id: string }>
      expect(items.some((r) => r.id === created.id), "new report in GET /reports").toBeTruthy()

      // 3. Detail page loads (not 404)
      const detailResp = await page.goto(`/laporan/${created.id}`)
      expect(detailResp?.status(), "detail page status").toBeLessThan(400)
      console.log("detail page title text:", await page.locator("h1").first().textContent())

      // 4. List page renders the new item
      await page.goto("/laporan")
      await page.waitForLoadState("networkidle")
      await expect(page.getByText(payload.jenisKebaktian).first()).toBeVisible({ timeout: 10000 })

      // 5. Reload list — still there (proves BE persistence, not memory)
      await page.reload()
      await page.waitForLoadState("networkidle")
      await expect(page.getByText(payload.jenisKebaktian).first()).toBeVisible({ timeout: 10000 })
    } finally {
      // 6. cleanup
      const del = await page.request.delete(`/api/reports/${created.id}`)
      expect([204, 200]).toContain(del.status())
    }
  })

  test("update via BFF persists the new title", async ({ page }) => {
    const payload = samplePayload(`UPD ${Date.now()}`)
    const create = await page.request.post("/api/reports", { data: payload })
    expect(create.status()).toBe(201)
    const { id } = await create.json()

    try {
      const newTitle = `Kebaktian Edited ${Date.now()}`
      const upd = await page.request.put(`/api/reports/${id}`, {
        data: { ...payload, jenisKebaktian: newTitle },
      })
      expect(upd.status()).toBe(200)

      const got = await page.request.get(`/api/reports/${id}`)
      expect(got.status()).toBe(200)
      const body = await got.json()
      expect(body.jenisKebaktian).toBe(newTitle)
    } finally {
      await page.request.delete(`/api/reports/${id}`)
    }
  })

  test("GET /api/members returns array of names (from BE pelayan persons)", async ({ page }) => {
    const res = await page.request.get("/api/members")
    expect(res.status()).toBe(200)
    const arr = await res.json() as string[]
    expect(Array.isArray(arr)).toBeTruthy()
    expect(arr.length).toBeGreaterThan(0)
    // seeded BE has Pdt. Yohanes — case insensitive prefix check
    expect(arr.some((n) => /pdt\.?\s*yohanes/i.test(n))).toBeTruthy()
  })
})
