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
}

async function handleProfileResponse(response: Response): Promise<BackendProfile> {
  const data = await response.json()
  if (!response.ok) {
    const message =
      data?.error?.message || data?.message || `HTTP ${response.status} – Failed to load profile`
    throw new Error(message)
  }

  // Support both { profile } and raw object shapes
  return (data.profile || data) as BackendProfile
}

export async function getProfileById(id: string): Promise<BackendProfile> {
  const res = await fetch(`${PROFILE_BASE_URL}/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  return handleProfileResponse(res)
}


