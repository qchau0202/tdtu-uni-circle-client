export interface ProfileStat {
  id: string
  label: string
  value: string
  helper: string
}

export interface ProfileActivity {
  id: string
  type: "collection" | "resource" | "feed"
  title: string
  meta: string
  date: string
}

export interface SocialLink {
  platform: string
  url: string
  label?: string
}

// Shape of profile data used in the UI (mapped from backend profile & auth user)
export interface ProfileInfo {
  id: string
  studentId: string
  displayName: string
  dob: string
  phoneNumber: string
  faculty: string
  bio?: string | null
  academicYear: string
  avatarUrl?: string | null
  socialLinks: SocialLink[]
  updatedAt?: string
  email: string
}

export const emptyProfileInfo: ProfileInfo = {
  id: "",
  studentId: "",
  displayName: "",
  dob: "",
  phoneNumber: "",
  faculty: "",
  bio: "",
  academicYear: "",
  avatarUrl: "",
  socialLinks: [],
  updatedAt: "",
  email: "",
}

// Stats and activity will later be wired to real services.
// For now they default to empty (no fake test data).
export const profileStats: ProfileStat[] = []
export const profileActivities: ProfileActivity[] = []
