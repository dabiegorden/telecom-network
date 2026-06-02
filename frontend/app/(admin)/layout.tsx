"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Settings, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppSidebar } from "@/constants";

function AdminDashboardContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is admin
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          router.push("/");
          return;
        }

        const parsedUser = JSON.parse(userData);

        // Check if user is admin
        if (parsedUser.role !== "admin") {
          toast.error("Unauthorized access. Admin only.");
          router.push("/");
          return;
        }

        setUser(parsedUser);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500"></div>
          <p className="text-slate-400 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        {/* Enhanced Header with TelecomNet Theme */}
        <header className="fixed top-0 right-0 left-0 z-50 flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg group-has-data-[collapsible=icon]/sidebar-wrapper:left-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-200 rounded-lg p-2" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-slate-700"
            />
            {/* Enhanced Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/"
                    className="text-slate-400 hover:text-white transition-colors duration-200 font-medium"
                  >
                    TelecomNet Ghana
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-slate-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-semibold">
                    Admin Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Enhanced Header Actions */}
          <div className="ml-auto flex items-center gap-2 px-4">
            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 rounded-lg relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 rounded-lg"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile Section */}
            {user && (
              <div className="flex items-center gap-3">
                {/* Desktop User Info */}
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user.role}
                  </p>
                </div>

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="outline-none">
                    <div className="flex items-center gap-2 rounded-lg hover:bg-slate-800 transition-colors p-1 cursor-pointer">
                      <Avatar className="h-9 w-9 border-2 border-cyan-500">
                        {/* <AvatarImage
                          src={user.profileImage || "/placeholder.svg"}
                          alt={user.name}
                        /> */}
                        <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-500 text-white font-semibold">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-slate-900 border-slate-800 text-slate-200 mt-2"
                    align="end"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3 p-2">
                        <Avatar className="h-12 w-12 border-2 border-cyan-500">
                          {/* <AvatarImage
                            src={user.profileImage || "/placeholder.svg"}
                            alt={user.name}
                          /> */}
                          <AvatarFallback className="bg-linear-to-br from-orange-500 to-red-500 text-white font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-white">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-slate-400">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-linear-to-r from-orange-500 to-red-500 text-white font-bold uppercase tracking-wider">
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />

                    {/* Mobile Actions */}
                    <div className="sm:hidden">
                      <DropdownMenuItem className="cursor-pointer text-slate-300 focus:text-white focus:bg-slate-800">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-slate-300 focus:text-white focus:bg-slate-800">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-800" />
                    </div>

                    <DropdownMenuItem className="cursor-pointer text-slate-300 focus:text-white focus:bg-slate-800">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-slate-800" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-500 focus:text-red-400 focus:bg-red-500/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </header>

        {/* Enhanced Main Content with TelecomNet Theme */}
        <div className="pt-16 flex flex-1 flex-col min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
          {/* Content Wrapper with proper spacing and mobile optimization */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Background Decoration - Grid Pattern */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
              <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
            </div>

            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AdminDashboardContent>{children}</AdminDashboardContent>;
}
