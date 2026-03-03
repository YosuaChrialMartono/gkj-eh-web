import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoleManager } from "@/components/pelayan/role-manager"
import { getRoles } from "@/lib/api/pelayan"

export default async function PelayanRolesPage() {
  const roles = await getRoles().catch(() => [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/pelayan">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Kelola Peran Pelayan</h1>
      </div>

      <div className="max-w-lg">
        <RoleManager initialRoles={roles} />
      </div>
    </div>
  )
}
