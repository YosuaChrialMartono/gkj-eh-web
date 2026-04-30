import { generateSlug } from "./slug"

export interface TocItem {
  id: string
  label: string
}

export interface ProcessedContent {
  html: string
  toc: TocItem[]
}

const HEADING_RE = /<(h2|h3)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi
const ID_ATTR_RE = /\sid=["']([^"']+)["']/i

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, "").trim()
}

export function injectHeadingIds(html: string | null | undefined): ProcessedContent {
  if (!html) return { html: "", toc: [] }

  const seen = new Set<string>()
  const toc: TocItem[] = []

  const out = html.replace(HEADING_RE, (_match, tag: string, attrs: string | undefined, inner: string) => {
    const label = stripTags(inner)
    if (!label) return _match

    const existing = attrs?.match(ID_ATTR_RE)?.[1]
    let id = existing || generateSlug(label) || `heading-${toc.length + 1}`

    let n = 2
    const base = id
    while (seen.has(id)) {
      id = `${base}-${n++}`
    }
    seen.add(id)

    if (tag.toLowerCase() === "h2") {
      toc.push({ id, label })
    }

    if (existing) {
      return _match.replace(ID_ATTR_RE, ` id="${id}"`)
    }
    const safeAttrs = attrs ?? ""
    return `<${tag} id="${id}"${safeAttrs}>${inner}</${tag}>`
  })

  return { html: out, toc }
}
