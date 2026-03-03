import { apiClient } from "./client"
import type {
  Content,
  ContentListItem,
  ContentCreateInput,
  ContentUpdateInput,
  ContentListParams,
  PaginatedResponse,
} from "@/lib/types"

export async function getPublicContentList(
  params?: ContentListParams
): Promise<PaginatedResponse<ContentListItem>> {
  return apiClient("/content/public", { params: params as Record<string, string | number | boolean | undefined> })
}

export async function getContentBySlug(slug: string): Promise<Content> {
  return apiClient(`/content/public/slug/${slug}`)
}

export async function getContentList(
  params?: ContentListParams
): Promise<PaginatedResponse<ContentListItem>> {
  return apiClient("/content", {
    params: params as Record<string, string | number | boolean | undefined>,
  })
}

export async function getContentById(id: string): Promise<Content> {
  return apiClient(`/content/${id}`)
}

export async function createContent(input: ContentCreateInput): Promise<Content> {
  return apiClient("/content", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateContent(
  id: string,
  input: ContentUpdateInput
): Promise<Content> {
  return apiClient(`/content/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteContent(id: string): Promise<void> {
  return apiClient(`/content/${id}`, { method: "DELETE" })
}
