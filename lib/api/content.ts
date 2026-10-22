import { listDashboardContent, listPublicContent, getDashboardContent, getPublishedContentBySlug, createContent as insertContent, updateContent as patchContent, removeContent } from "@/lib/server/content/service"
import { AppError } from "@/lib/actions/result"
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
  return listPublicContent(params)
}

export async function getContentBySlug(slug: string): Promise<Content> {
  const result = await getPublishedContentBySlug(slug)
  if (!result) throw new AppError("NOT_FOUND", "Content not found")
  return result
}

export async function getContentList(
  params?: ContentListParams
): Promise<PaginatedResponse<ContentListItem>> {
  return listDashboardContent(params)
}

export async function getContentById(id: string): Promise<Content> {
  const result = await getDashboardContent(id)
  if (!result) throw new AppError("NOT_FOUND", "Content not found")
  return result
}

export async function createContent(input: ContentCreateInput): Promise<Content> {
  return insertContent(input)
}

export async function updateContent(
  id: string,
  input: ContentUpdateInput
): Promise<Content> {
  const result = await patchContent(id, input)
  if (!result) throw new AppError("NOT_FOUND", "Content not found")
  return result
}

export async function deleteContent(id: string): Promise<void> {
  if (!await removeContent(id)) throw new AppError("NOT_FOUND", "Content not found")
}
