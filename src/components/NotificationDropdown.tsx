import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import {
  fetchNotifications,
  deleteNotification,
  type Notification,
} from "@/services/notificationService"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

export function NotificationDropdown() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const unreadCount = notifications.length

  const loadNotifications = () => {
    if (!user || !accessToken) return
    fetchNotifications(accessToken)
      .then((notifs) => {
        setNotifications(notifs.sort((a, b) => {
          const aDate = new Date((a.created_at as string) || "").getTime() || 0
          const bDate = new Date((b.created_at as string) || "").getTime() || 0
          return bDate - aDate
        }))
      })
      .catch((err) => {
        console.error("Failed to load notifications:", err)
        setNotifications([])
      })
  }

  useEffect(() => {
    if (!user || !accessToken) return
    loadNotifications()

    // Listen for notification events
    const handleNotificationUpdate = () => {
      loadNotifications()
    }

    return () => {
    }
  }, [user, accessToken])

  const handleNotificationClick = (notification: Notification) => {
    if (notification && (notification as any).link) {
      navigate((notification as any).link)
    }
  }

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    if (!user || !accessToken) return
    deleteNotification(accessToken, notificationId)
      .then(loadNotifications)
      .catch((err) => console.error("Failed to delete notification:", err))
  }

  const getNotificationIcon = () => <Bell className="h-4 w-4 text-gray-600" />

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-[#141414]" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#036aff] text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-[#141414]">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "px-4 py-3 hover:bg-[#f5f5f5] cursor-pointer transition-colors border-b border-gray-100 group",
                  !notification.read && "bg-blue-50/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#141414]">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                      </div>
                      {/* Read state not supported in API; badge omitted */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="h-6 w-6 p-0 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full text-xs text-gray-600 hover:text-[#141414]"
              onClick={() => navigate("/notifications")}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

