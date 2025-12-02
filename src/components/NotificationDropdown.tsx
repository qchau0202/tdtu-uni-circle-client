import { useState, useEffect } from "react"
import { Bell, Check, X, UserPlus2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from "@/services/notificationService"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

export function NotificationDropdown() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = () => {
    if (!user) return
    const notifs = getNotifications(user.studentId)
    setNotifications(notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setUnreadCount(getUnreadCount(user.studentId))
  }

  useEffect(() => {
    if (!user) return
    loadNotifications()

    // Listen for notification events
    const handleNotificationUpdate = () => {
      loadNotifications()
    }

    window.addEventListener("notification-added", handleNotificationUpdate)
    window.addEventListener("notification-updated", handleNotificationUpdate)

    // Poll for updates (for cross-browser testing)
    const interval = setInterval(loadNotifications, 2000)

    return () => {
      window.removeEventListener("notification-added", handleNotificationUpdate)
      window.removeEventListener("notification-updated", handleNotificationUpdate)
      clearInterval(interval)
    }
  }, [user])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(user!.studentId, notification.id)
      loadNotifications()
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleMarkAllRead = () => {
    if (user) {
      markAllAsRead(user.studentId)
      loadNotifications()
    }
  }

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    if (user) {
      deleteNotification(user.studentId, notificationId)
      loadNotifications()
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "invitation":
        return <UserPlus2 className="h-4 w-4 text-[#036aff]" />
      case "join_request":
        return <Users className="h-4 w-4 text-yellow-600" />
      case "request_accepted":
        return <Check className="h-4 w-4 text-green-600" />
      case "request_rejected":
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

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
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-7 px-2"
            >
              Mark all read
            </Button>
          )}
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
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-[#036aff] shrink-0 mt-1" />
                      )}
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

