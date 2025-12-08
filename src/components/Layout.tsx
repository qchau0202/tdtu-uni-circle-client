import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function Layout() {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Map routes to sidebar items
  const getActiveItem = () => {
    const path = location.pathname
    if (path === "/" || path === "/home") return "home"
    if (path === "/feed") return "feed"
    if (path === "/collections") return "collections"
    if (path === "/resource") return "resource"
    return "home"
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        activeItem={getActiveItem()}
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex-1 border-l border-gray-200 h-screen overflow-hidden bg-gray-50">
          <div className="h-full overflow-y-auto p-6 bg-gray-50">
            <Outlet />
        </div>
      </div>
    </div>
  )
}