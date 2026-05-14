import { apiClient, authenticatedApiClient } from "./client"
import { getAccessToken } from "@/lib/auth/server-utils"
import type {
  Content,
  ContentListItem,
  ContentCreateInput,
  ContentUpdateInput,
  ContentListParams,
  PaginatedResponse,
} from "@/lib/types"

type RequestInitWithParams = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>
}

async function authed<T>(path: string, init?: RequestInitWithParams): Promise<T> {
  const token = await getAccessToken()
  if (!token) throw { message: "Not authenticated", status: 401 }
  return authenticatedApiClient<T>(token, path, init)
}

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
  return authed("/content", {
    params: params as Record<string, string | number | boolean | undefined>,
  })
}

export async function getContentById(id: string): Promise<Content> {
  return authed(`/content/${id}`)
}

export async function createContent(input: ContentCreateInput): Promise<Content> {
  return authed("/content", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateContent(
  id: string,
  input: ContentUpdateInput
): Promise<Content> {
  return authed(`/content/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteContent(id: string): Promise<void> {
  return authed(`/content/${id}`, { method: "DELETE" })
}
