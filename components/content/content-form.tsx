"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { generateSlug } from "@/lib/slug"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TiptapEditor } from "@/components/tiptap/editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContentType, ContentStatus } from "@/lib/types"
import type { Content, ContentCreateInput } from "@/lib/types"

interface ContentFormProps {
  content?: Content
}

export function ContentForm({ content }: ContentFormProps) {
  const { accessToken } = useAuth()
  const router = useRouter()
  const isEdit = !!content

  const [title, setTitle] = useState(content?.title ?? "")
  const [slug, setSlug] = useState(content?.slug ?? "")
  const [type, setType] = useState<ContentType>(content?.type ?? ContentType.article)
  const [status, setStatus] = useState<ContentStatus>(content?.status ?? ContentStatus.draft)
  const [bodyJson, setBodyJson] = useState(content?.body ?? "")
  const [bodyHtml, setBodyHtml] = useState("")
  const [featuredImageUrl, setFeaturedImageUrl] = useState(content?.featuredImageUrl ?? "")
  const [publishedAt, setPublishedAt] = useState(content?.publishedAt?.slice(0, 16) ?? "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(generateSlug(title))
    }
  }, [title, slugManuallyEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError(null)
    setIsSubmitting(true)

    const payload: ContentCreateInput = {
      title,
      slug,
      type,
      status,
      body: bodyJson,
      bodyHtml,
      ...(featuredImageUrl ? { featuredImageUrl } : {}),
      ...(publishedAt ? { publishedAt: new Date(publishedAt).toISOString() } : {}),
    }

    try {
      const url = isEdit ? `/api/content/${content.id}` : "/api/content"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Save failed" }))
        throw new Error(err.message ?? "Save failed")
      }
      router.push("/content")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ContentType.article}>Article</SelectItem>
              <SelectItem value={ContentType.page}>Page</SelectItem>
              <SelectItem value={ContentType.sermon}>Sermon</SelectItem>
              <SelectItem value={ContentType.announcement}>Announcement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ContentStatus.draft}>Draft</SelectItem>
              <SelectItem value={ContentStatus.published}>Published</SelectItem>
              <SelectItem value={ContentStatus.archived}>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Body</Label>
        <TiptapEditor
          content={bodyJson}
          onChange={(json, html) => {
            setBodyJson(json)
            setBodyHtml(html)
          }}
          placeholder="Write your content here..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="featuredImageUrl">Featured Image URL</Label>
        <Input
          id="featuredImageUrl"
          type="url"
          value={featuredImageUrl}
          onChange={(e) => setFeaturedImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="publishedAt">Publish Date</Label>
        <Input
          id="publishedAt"
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
