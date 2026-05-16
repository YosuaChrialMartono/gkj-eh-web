"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const isEdit = !!content

  const [title, setTitle] = useState(content?.title ?? "")
  const [slug, setSlug] = useState(content?.slug ?? "")
  const [type, setType] = useState<ContentType>(content?.type ?? ContentType.article)
  const [status, setStatus] = useState<ContentStatus>(content?.status ?? ContentStatus.draft)
  const [bodyJson, setBodyJson] = useState(content?.body ?? "")
  const bodyHtmlRef = useRef("")
  const [featuredImageUrl, setFeaturedImageUrl] = useState(content?.featuredImageUrl ?? "")
  const [publishedAt, setPublishedAt] = useState(content?.publishedAt?.slice(0, 16) ?? "")
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  async function handleFeaturedImageUpload(file: File) {
    setError(null)
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Upload failed" }))
        throw new Error(err.message ?? "Upload failed")
      }
      const data = await res.json() as { url: string }
      setFeaturedImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleTitleChange = useCallback((next: string) => {
    setTitle(next)
    setSlug((prev) => (slugManuallyEdited ? prev : generateSlug(next)))
  }, [slugManuallyEdited])

  const handleSlugChange = useCallback((next: string) => {
    setSlug(next)
    setSlugManuallyEdited(true)
  }, [])

  const handleBodyChange = useCallback((json: string, html: string) => {
    setBodyJson(json)
    bodyHtmlRef.current = html
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload: ContentCreateInput = {
      title,
      slug,
      type,
      status,
      body: bodyJson,
      bodyHtml: bodyHtmlRef.current,
      ...(featuredImageUrl ? { featuredImageUrl } : {}),
      ...(publishedAt ? { publishedAt: new Date(publishedAt).toISOString() } : {}),
    }

    try {
      const url = isEdit ? `/api/content/${content.id}` : "/api/content"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        router.push("/login?from=/content/new")
        return
      }
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
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">
          Slug <span className="text-muted-foreground text-xs font-normal">(optional)</span>
        </Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          URL-friendly identifier. Auto-generated from title if left empty.
        </p>
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
        <Label htmlFor="body">
          Body <span className="text-destructive">*</span>
        </Label>
        <TiptapEditor
          content={bodyJson}
          onChange={handleBodyChange}
          placeholder="Write your content here..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="featuredImageUrl">Featured Image</Label>
        <Input
          id="featuredImageUrl"
          type="url"
          value={featuredImageUrl}
          onChange={(e) => setFeaturedImageUrl(e.target.value)}
          placeholder="https://… or upload below"
        />
        <div className="flex items-center gap-2">
          <Input
            id="featuredImageFile"
            type="file"
            accept="image/*"
            disabled={isUploadingImage}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFeaturedImageUpload(file)
              e.target.value = ""
            }}
            className="max-w-sm"
          />
          {isUploadingImage && (
            <span className="text-xs text-muted-foreground">Uploading…</span>
          )}
        </div>
        {featuredImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImageUrl}
            alt="Featured preview"
            className="mt-2 max-h-40 w-auto rounded border"
          />
        )}
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
