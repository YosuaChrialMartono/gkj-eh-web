import { redirect } from "next/navigation"
import { getAccessToken } from "@/lib/auth/server-utils"
import { AppSidebar } from "@/components/app-sidebar"
import { ColorModeToggle } from "@/components/color-mode-toggle"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Validate the session by actually minting an access token (backend verifies
  // the refresh token's signature + expiry) rather than trusting mere cookie
  // presence. React.cache means child RSC fetches reuse this same mint.
  const accessToken = await getAccessToken()
  if (!accessToken) {
    redirect("/login?from=/dashboard")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center w-full justify-between gap-2 px-4">
            <div className="flex items-center px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DashboardBreadcrumb />
            </div>
            <ColorModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
