const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3001/api/auth"

export interface AuthSession {
  access_token: string
  refresh_token: string
}

export interface BackendUser {
  id: string
  email: string
  student_code?: string
  username?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
    student_code?: string
  }
  [key: string]: any
}

export interface LoginResponse {
  message?: string
  session: AuthSession
  user: BackendUser
}

export interface RegisterResponse {
  message?: string
  user: BackendUser
  profile?: any
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")
  const isJson = contentType && contentType.includes("application/json")
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const message =
      (data && (data.error?.message || data.message)) ||
      `HTTP ${response.status} – Authentication request failed`
    throw new Error(message)
  }

  return data as T
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  return handleResponse<LoginResponse>(res)
}

export async function apiRegister(
  name: string,
  studentEmail: string,
  password: string,
): Promise<RegisterResponse> {
  const res = await fetch(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      student_email: studentEmail,
      username: name,
      password,
    }),
  })

  return handleResponse<RegisterResponse>(res)
}

export async function apiMe(accessToken: string): Promise<{ user: BackendUser }> {
  const res = await fetch(`${AUTH_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  // Return status code along with data for better error handling
  const contentType = res.headers.get("content-type")
  const isJson = contentType && contentType.includes("application/json")
  const data = isJson ? await res.json() : null

  if (!res.ok) {
    const message =
      (data && (data.error?.message || data.message)) ||
      `HTTP ${res.status} – Authentication request failed`
    const error = new Error(message) as Error & { status?: number }
    error.status = res.status
    throw error
  }

  return data as { user: BackendUser }
}

export async function apiRefreshToken(
  refreshToken: string,
): Promise<{ session: AuthSession }> {
  const res = await fetch(`${AUTH_BASE_URL}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  return handleResponse<{ session: AuthSession }>(res)
}

export async function apiLogout(accessToken: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  // Best-effort: even if this fails, we'll clear client session
  if (!res.ok) {
    // Don't throw to avoid blocking logout UX
    // eslint-disable-next-line no-console
    console.warn("Auth logout request failed", res.status)
  }
}