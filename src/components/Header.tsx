import { PanelLeft, PanelLeftClose, Search, MessageCircle, Bell } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-4 px-6">
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
          <div className="flex items-center gap-2">
            <img src="/UniCircle_logo-removebg.png" alt="Uni Circle" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-[#141414]">UniCircle</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search"
              className="w-full pl-10 bg-[#f5f5f5] border-none"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Chat Icon */}
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="h-5 w-5 text-[#141414]" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#036aff] text-white text-xs">
              2
            </Badge>
          </Button>

          {/* Notification Icon */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-[#141414]" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#036aff] text-white text-xs">
              6
            </Badge>
          </Button>

          {/* User Profile */}
          <Button asChild variant="ghost" className="flex items-center gap-2 h-auto p-2">
            <Link to="/profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-[#f5f5f5] text-[#141414]">
                  QC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium text-[#141414]">
                  Quoc Chau
                </span>
                <span className="text-xs text-gray-500">523k0002@student.tdtu.edu.vn</span>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

