import { describe, expect, it } from "vitest"
import { sanitizeContentHtml } from "@/lib/server/content/sanitize"

describe("CMS rich-text policy", () => {
  it("preserves supported editor formatting while stripping executable markup and unsafe URLs", () => {
    const safe = sanitizeContentHtml('<h2>Welcome</h2><p onclick="alert(1)">Hello <strong>church</strong><script>alert(1)</script><a href="javascript:alert(1)">link</a><img src="data:text/html,x" onerror="alert(1)"><a href="https://example.org">site</a></p>')
    expect(safe).toContain("<h2>Welcome</h2>")
    expect(safe).toContain("<strong>church</strong>")
    expect(safe).toContain('href="https://example.org"')
    expect(safe).toContain('rel="noopener noreferrer"')
    expect(safe).not.toMatch(/script|onclick|onerror|javascript:|data:text/i)
  })
})
