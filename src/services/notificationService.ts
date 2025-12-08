export interface Notification {
  id: string
  title?: string
  message?: string
  type?: string
  is_read?: boolean
  created_at?: string
}

const API_BASE = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://localhost:3005/api/notifications"

const jsonHeaders = (accessToken?: string) => ({
  "Content-Type": "application/json",
  ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
})

async function handle<T>(res: Response): Promise<T> {
  const isJson = res.headers.get("content-type")?.includes("application/json")
  const data = isJson ? await res.json() : null
  if (!res.ok) {
    const message = (data && (data.error?.message || data.message)) || `HTTP ${res.status} request failed`
    throw new Error(message)
  }
  return data as T
}

export async function fetchNotifications(accessToken: string): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}`, {
    headers: jsonHeaders(accessToken),
  })
  const data = await handle<{ notifications?: Notification[]; data?: Notification[] }>(res)
  return data.notifications || data.data || []
}

export async function fetchNotificationById(accessToken: string, id: string): Promise<Notification> {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: jsonHeaders(accessToken),
  })
  const data = await handle<{ notification?: Notification }>(res)
  if (data.notification) return data.notification
  // fallback if API returns object directly
  return data as unknown as Notification
}

export async function createNotification(accessToken: string, payload: Record<string, any>): Promise<Notification> {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: jsonHeaders(accessToken),
    body: JSON.stringify(payload),
  })
  const data = await handle<{ notification?: Notification }>(res)
  return data.notification || (data as unknown as Notification)
}

export async function deleteNotification(accessToken: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: jsonHeaders(accessToken),
  })
  await handle(res)
}

export async function deleteAllNotifications(accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE}/delete-all`, {
    method: "DELETE",
    headers: jsonHeaders(accessToken),
  })
  await handle(res)
}

