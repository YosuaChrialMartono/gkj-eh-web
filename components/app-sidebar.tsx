"use client"

import * as React from "react"
import {
  Command,
  FileText,
  SquareTerminal,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Content",
      url: "/content",
      icon: FileText,
      isActive: false,
      items: [
        { title: "All Content", url: "/content" },
        { title: "New Content", url: "/content/new" },
      ],
    },
    {
      title: "Bakominfo",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Title Converter",
          url: "/title-converter",
        },
      ],
    },
    {
      title: "Pelayan",
      url: "/pelayan",
      icon: Users,
      isActive: false,
      items: [
        { title: "Jadwal", url: "/pelayan" },
        { title: "Kelola Peran", url: "/pelayan/roles" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">GKJ Eben Haezer</span>
                  <span className="truncate text-xs">Web Gereja</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
