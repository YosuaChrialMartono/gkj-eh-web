/**
 * HTML-encodes an XML string for embedding as an attribute value.
 * Used by all encoded XML attributes in the presentation file format
 * (Positions, PresetsXML, Triggers, XML, CountdownXML, etc.)
 */
export function htmlEncodeXml(xml: string): string {
  return xml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\r/g, "&#xD;")
    .replace(/\n/g, "&#xA;")
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export interface TitlePresetSlide {
  judul: string // e.g. 'KK 254 "Kristus Bangkit! Soraklah": 1'
  lirik: string // newline-separated lyric lines
}

/**
 * Builds the raw (unencoded) PresetsXML string from an array of slides.
 * Pass the result to htmlEncodeXml() before setting as an attribute value.
 */
export function buildPresetsXml(slides: TitlePresetSlide[]): string {
  const CRLF = "\r\n"

  const presets = slides
    .map(
      (slide) =>
        `  <TitlePreset>${CRLF}` +
        `    <Text>${CRLF}` +
        `      <TitlePresetItem>${CRLF}` +
        `        <Key>Judul.Text</Key>${CRLF}` +
        `        <Value>${slide.judul}</Value>${CRLF}` +
        `      </TitlePresetItem>${CRLF}` +
        `      <TitlePresetItem>${CRLF}` +
        `        <Key>Lirik.Text</Key>${CRLF}` +
        `        <Value>${slide.lirik}</Value>${CRLF}` +
        `      </TitlePresetItem>${CRLF}` +
        `    </Text>${CRLF}` +
        `  </TitlePreset>`
    )
    .join(CRLF)

  return (
    `<?xml version="1.0" encoding="utf-16"?>${CRLF}` +
    `<ArrayOfTitlePreset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">${CRLF}` +
    presets +
    CRLF +
    `</ArrayOfTitlePreset>`
  )
}
