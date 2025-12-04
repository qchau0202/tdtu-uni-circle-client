import { PanelLeft, PanelLeftClose, LogOut, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { NotificationDropdown } from "./NotificationDropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully", {
      description: "See you again soon!",
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Sidebar toggle + Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#141414] hover:bg-[#f5f5f5]"
            onClick={onToggleSidebar}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/UniCircle_logo-removebg.png" alt="Uni Circle" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-[#141414]">UniCircle</span>
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Icon */}
          <NotificationDropdown />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-base">
                    {user?.initials || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-base font-medium text-[#141414]">
                    {user?.name || "User"}
                  </span>
                  <span className="text-sm text-gray-500">{user?.email || ""}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2 cursor-pointer text-base">
                  <User className="h-5 w-5" />
                  <span className="font-semibold text-[#141414]">Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-gray-200" />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-base"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-semibold">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

