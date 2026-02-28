import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SlugNotFound() {
  return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <h1 className="text-3xl font-bold mb-4">Konten Tidak Ditemukan</h1>
      <p className="text-muted-foreground mb-8">
        Halaman yang Anda cari tidak tersedia atau telah dihapus.
      </p>
      <Button asChild>
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  )
}
