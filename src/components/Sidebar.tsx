import { Link } from "react-router-dom"
import { Home, BookOpen, BarChart3, FolderOpen, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeItem?: string
  collapsed?: boolean
}

const menuItems = [
  { id: "home", label: "Student Feed", icon: ListChecks, path: "/" },
  { id: "study-sessions", label: "Study Sessions", icon: BookOpen, path: "/study-sessions" },
  { id: "material-repo", label: "Material Repository", icon: FolderOpen, path: "/material-repo" },
  { id: "resources", label: "Resources", icon: BarChart3, path: "/resources" },
]

export function Sidebar({ activeItem = "home", collapsed = false }: SidebarProps) {
  return (
    <aside className="h-[calc(100vh-4rem)] border-r border-gray-200 bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          return (
            <Button
              key={item.id}
              variant="ghost"
              asChild
              className={cn(
                "w-full justify-start h-11 text-left font-normal",
                isActive
                  ? "bg-[#036aff] text-white hover:bg-[#036aff] hover:text-white"
                  : "text-[#141414] hover:bg-[#f5f5f5]",
                collapsed ? "px-3 justify-center" : "gap-3 px-3"
              )}
            >
              <Link to={item.path}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {!collapsed && (
                    <span className="text-sm font-bold truncate">{item.label}</span>
                  )}
                </div>
              </Link>
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}

