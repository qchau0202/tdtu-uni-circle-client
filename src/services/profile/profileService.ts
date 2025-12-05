const PROFILE_BASE_URL =
  import.meta.env.VITE_PROFILE_SERVICE_URL || "http://localhost:3003/api/profile"

export interface BackendProfile {
  id: string
  student_id: string
  display_name: string
  dob: string | null
  phone_number: string | null
  faculty: string | null
  bio: string | null
  academic_year: string | null
  avatar_url: string | null
  social_links: any | null
  updated_at: string | null
  student?: {
    id: string
    student_code: string
    email: string
  }
}

export interface UpdateProfilePayload {
  display_name?: string
  dob?: string
  phone_number?: string
  faculty?: string
  bio?: string
  academic_year?: string
  avatar_url?: string
  social_links?: Record<string, string>
}

const authHeaders = (accessToken: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
})

async function handleProfileResponse(response: Response): Promise<BackendProfile> {
  const raw = await response.text()

  let data: any
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch {
    // Non-JSON, likely HTML error page or reverse proxy message
    const snippet = raw?.slice(0, 120) || "No response body"
    throw new Error(
      `Profile service returned a non-JSON response (HTTP ${response.status}). First bytes: ${snippet}`,
    )
  }

  if (!response.ok) {
    const message =
      data?.error?.message || data?.message || `HTTP ${response.status} – Failed to load profile`
    throw new Error(message)
  }

  return (data.profile || data) as BackendProfile
}

export async function getProfileById(
  id: string,
  accessToken: string,
): Promise<BackendProfile> {
  const res = await fetch(`${PROFILE_BASE_URL}/${id}`, {
    headers: authHeaders(accessToken),
  })

  return handleProfileResponse(res)
}

export async function updateProfile(
  id: string,
  payload: UpdateProfilePayload,
  accessToken: string,
): Promise<BackendProfile> {
  const res = await fetch(`${PROFILE_BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(payload),
  })

  return handleProfileResponse(res)
}


