import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { getContentById } from "@/lib/api/content"
import { ContentForm } from "@/components/content/content-form"

interface EditContentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: EditContentPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get("refresh_token")?.value ?? ""

  let content
  try {
    content = await getContentById(token, id)
  } catch {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Content</h1>
      <ContentForm content={content} />
    </div>
  )
}
