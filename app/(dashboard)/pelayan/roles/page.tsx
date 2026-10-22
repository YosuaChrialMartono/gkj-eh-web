import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoleManager } from "@/components/pelayan/role-manager"
import { listPelayanRoles } from "@/lib/server/pelayan"
import { listPelayanPersons } from "@/lib/server/pelayan"
import { PersonManager } from "@/components/pelayan/person-manager"

export default async function PelayanRolesPage() {
  const [roles, persons] = await Promise.all([listPelayanRoles(), listPelayanPersons()])

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
      <div className="max-w-lg"><PersonManager initialPersons={persons} /></div>
    </div>
  )
}
