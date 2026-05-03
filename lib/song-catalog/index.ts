import kj from "./kj.json"
import pkj from "./pkj.json"
import nkb from "./nkb.json"
import kk from "./kk.json"
import kpj from "./kpj.json"

export type BookCode = "KJ" | "PKJ" | "NKB" | "KK" | "KPJ"

export type SongEntry = {
  code: BookCode
  no: string
  title: string
}

type RawEntry = { no: string; title: string }

const books: Array<[BookCode, RawEntry[]]> = [
  ["KJ", kj as RawEntry[]],
  ["PKJ", pkj as RawEntry[]],
  ["NKB", nkb as RawEntry[]],
  ["KK", kk as RawEntry[]],
  ["KPJ", kpj as RawEntry[]],
]

export const songCatalog: SongEntry[] = books.flatMap(([code, entries]) =>
  entries.map((e) => ({ code, no: e.no, title: e.title })),
)

export function formatSong(entry: SongEntry): string {
  return `${entry.code} ${entry.no} "${entry.title}"`
}

export const songSuggestions: string[] = songCatalog.map(formatSong)
