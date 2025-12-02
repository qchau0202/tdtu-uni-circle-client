export interface Notification {
  id: string
  type: "invitation" | "join_request" | "session_created" | "request_accepted" | "request_rejected"
  title: string
  message: string
  studentId: string // Target student ID
  fromStudentId?: string // Sender student ID
  fromStudentName?: string
  sessionId?: string
  sessionTitle?: string
  link?: string
  read: boolean
  createdAt: string
}

const STORAGE_KEY = "unicircle_notifications"

// Get all notifications for a student
export function getNotifications(studentId: string): Notification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const allNotifications: Notification[] = JSON.parse(stored)
    return allNotifications.filter((n) => n.studentId === studentId)
  } catch {
    return []
  }
}

// Get unread notifications count
export function getUnreadCount(studentId: string): number {
  const notifications = getNotifications(studentId)
  return notifications.filter((n) => !n.read).length
}

// Add a notification
export function addNotification(notification: Omit<Notification, "id" | "read" | "createdAt">): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allNotifications: Notification[] = stored ? JSON.parse(stored) : []

    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
    }

    allNotifications.push(newNotification)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications))

    // Trigger custom event for real-time updates
    window.dispatchEvent(new CustomEvent("notification-added", { detail: newNotification }))
  } catch (error) {
    console.error("Failed to add notification:", error)
  }
}

// Mark notification as read
export function markAsRead(studentId: string, notificationId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const allNotifications: Notification[] = JSON.parse(stored)
    const updated = allNotifications.map((n) =>
      n.id === notificationId && n.studentId === studentId ? { ...n, read: true } : n,
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("notification-updated"))
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
  }
}

// Mark all as read
export function markAllAsRead(studentId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const allNotifications: Notification[] = JSON.parse(stored)
    const updated = allNotifications.map((n) =>
      n.studentId === studentId ? { ...n, read: true } : n,
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("notification-updated"))
  } catch (error) {
    console.error("Failed to mark all as read:", error)
  }
}

// Delete notification
export function deleteNotification(studentId: string, notificationId: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const allNotifications: Notification[] = JSON.parse(stored)
    const updated = allNotifications.filter(
      (n) => !(n.id === notificationId && n.studentId === studentId),
    )

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent("notification-updated"))
  } catch (error) {
    console.error("Failed to delete notification:", error)
  }
}

// Send invitation notification
export function sendInvitationNotification(
  targetStudentId: string,
  fromStudentId: string,
  fromStudentName: string,
  sessionTitle: string,
  sessionId: string,
  link?: string,
): void {
  addNotification({
    type: "invitation",
    title: "Study Session Invitation",
    message: `${fromStudentName} invited you to join "${sessionTitle}"`,
    studentId: targetStudentId,
    fromStudentId,
    fromStudentName,
    sessionId,
    sessionTitle,
    link,
  })
}

// Send join request notification (to session host)
export function sendJoinRequestNotification(
  targetStudentId: string, // Host student ID
  fromStudentId: string,
  fromStudentName: string,
  sessionTitle: string,
  sessionId: string,
): void {
  addNotification({
    type: "join_request",
    title: "Join Request",
    message: `${fromStudentName} wants to join your session "${sessionTitle}"`,
    studentId: targetStudentId,
    fromStudentId,
    fromStudentName,
    sessionId,
    sessionTitle,
    link: `/study-sessions?tab=requests`,
  })
}

// Send request response notification
export function sendRequestResponseNotification(
  targetStudentId: string,
  sessionTitle: string,
  accepted: boolean,
): void {
  addNotification({
    type: accepted ? "request_accepted" : "request_rejected",
    title: accepted ? "Request Accepted" : "Request Rejected",
    message: `Your request to join "${sessionTitle}" has been ${accepted ? "accepted" : "rejected"}`,
    studentId: targetStudentId,
    sessionTitle,
    link: accepted ? `/study-sessions` : undefined,
  })
}

