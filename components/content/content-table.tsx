import Link from "next/link"
import { getContentList } from "@/lib/api/content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeleteContentDialog } from "./delete-content-dialog"
import type { ContentListParams, ContentStatus } from "@/lib/types"

interface ContentTableProps {
  params?: ContentListParams
}

const STATUS_VARIANT: Record<ContentStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "secondary",
  archived: "outline",
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })
}

export async function ContentTable({ params }: ContentTableProps) {
  let result
  try {
    result = await getContentList(params)
  } catch {
    return <p className="text-sm text-muted-foreground">Failed to load content.</p>
  }

  if (result.data.length === 0) {
    return <p className="text-sm text-muted-foreground">No content found.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {result.data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>
              <Badge variant="outline">{item.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
            </TableCell>
            <TableCell>{item.author?.name}</TableCell>
            <TableCell>{formatDate(item.updatedAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/content/${item.id}/edit`}>Edit</Link>
                </Button>
                <DeleteContentDialog contentId={item.id} contentTitle={item.title} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
