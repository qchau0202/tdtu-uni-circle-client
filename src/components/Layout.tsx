import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"

export function Layout() {
  const location = useLocation()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Map routes to sidebar items
  const getActiveItem = () => {
    const path = location.pathname
    if (path === "/" || path === "/home") return "home"
    if (path === "/feed") return "feed"
    if (path === "/study-sessions") return "study-sessions"
    if (path === "/resource") return "resource"
    return "home"
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <div
          className={
            isSidebarCollapsed
              ? "w-20 shrink-0 transition-all duration-200"
              : "w-64 shrink-0 transition-all duration-200"
          }
        >
          <Sidebar activeItem={getActiveItem()} collapsed={isSidebarCollapsed} />
        </div>
        <div className="flex-1 border border-gray-200">
          <div className="h-full overflow-y-auto p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}