import { ContentForm } from "@/components/content/content-form"

export default function NewContentPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Content</h1>
      <ContentForm />
    </div>
  )
}
