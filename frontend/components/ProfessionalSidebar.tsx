"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  MessageSquare,
  MessageCircle,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/professional-dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Connections",
        url: "/professional-dashboard/connections",
        icon: Users,
      },
      {
        title: "Messages",
        url: "/professional-dashboard/messages",
        icon: MessageCircle,
      },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        title: "Job Listings",
        url: "/professional-dashboard/jobs",
        icon: Briefcase,
      },
      {
        title: "Resources",
        url: "/professional-dashboard/resources",
        icon: BookOpen,
      },
      {
        title: "Forum Posts",
        url: "/professional-dashboard/posts",
        icon: MessageSquare,
      },
    ],
  },
];

interface AppSidebarProps {
  user: any;
}

export function ProfessionalSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar className="bg-slate-900 border-r border-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Wifi className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <div className="absolute -inset-1 bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-base bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text ">
              TelecomNet Ghana
            </h2>
            <p className="text-xs text-slate-400">Professionals Dashboard</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-slate-900">
        {menuItems.map((section, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupLabel className="text-slate-500 text-xs font-bold uppercase tracking-wider px-5 py-3 mt-2">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === item.url ||
                        (item.url !== "/professional-dashboard" &&
                          pathname.startsWith(item.url))
                      }
                      className="hover:bg-slate-800/80 hover:text-white data-[active=true]:bg-linear-to-r data-[active=true]:from-cyan-500 data-[active=true]:to-blue-500 text-slate-300 data-[active=true]:text-white transition-all duration-200 mx-2 rounded-lg"
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-900">
        {user && (
          <div className="flex items-center gap-3 px-2 py-3 bg-slate-800/30 rounded-lg">
            <Avatar className="h-10 w-10 border-2 border-cyan-500">
              <AvatarImage
                src={user.profileImage || undefined}
                alt={user.name}
                />
              <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-500 text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
