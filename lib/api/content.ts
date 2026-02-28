import { apiClient, authenticatedApiClient } from "./client"
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
  token: string,
  params?: ContentListParams
): Promise<PaginatedResponse<ContentListItem>> {
  return authenticatedApiClient(token, "/content", {
    params: params as Record<string, string | number | boolean | undefined>,
  })
}

export async function getContentById(token: string, id: string): Promise<Content> {
  return authenticatedApiClient(token, `/content/${id}`)
}

export async function createContent(token: string, input: ContentCreateInput): Promise<Content> {
  return authenticatedApiClient(token, "/content", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateContent(
  token: string,
  id: string,
  input: ContentUpdateInput
): Promise<Content> {
  return authenticatedApiClient(token, `/content/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteContent(token: string, id: string): Promise<void> {
  return authenticatedApiClient(token, `/content/${id}`, { method: "DELETE" })
}
