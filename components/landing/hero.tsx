import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHero() {
  return (
    <section className="mx-auto max-w-[1180px] px-6 pt-20 pb-16 text-center md:px-8 md:pt-28 md:pb-20">
      <div className="mb-7 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
        Gereja Kristen Jawa · Sejak 1953
      </div>
      <h1 className="mx-auto mb-7 max-w-[1000px] text-balance font-serif text-[56px] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground md:text-[88px]">
        Bersekutu,
        <br />
        bersaksi,
        <br />
        <em className="italic text-accent">melayani.</em>
      </h1>
      <p className="mx-auto mb-10 max-w-[620px] text-pretty text-lg leading-relaxed text-muted-foreground md:text-[19px]">
        Rumah ibadah dan komunitas yang terbuka bagi siapa saja yang ingin
        bertumbuh dalam iman, kasih, dan pelayanan di tengah kota.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="#jadwal">Datang ibadah →</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/news">Berita terbaru</Link>
        </Button>
      </div>
    </section>
  )
}
