import "server-only"
import sanitizeHtml from "sanitize-html"

const richTextPolicy: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "s", "del", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "hr"],
  allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "title", "width", "height"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: { a: (_tagName, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer" } }) },
}

export const sanitizeContentHtml = (html: string) => sanitizeHtml(html, richTextPolicy)
