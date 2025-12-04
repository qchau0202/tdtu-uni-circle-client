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
  platform: "facebook" | "instagram" | "linkedin" | "github" | "unicircle"
  url: string
  label: string
}

export interface ProfileInfo {
  username: string
  studentId: string
  name: string
  dateOfBirth: string // Format: YYYY-MM-DD
  academicYear: string // Format: YYYY-YYYY (e.g., "2023-2024")
  phoneNumber: string
  email: string
  avatar?: string
  initials: string
  major: string
  bio: string
  focusAreas: string[]
  socialLinks: SocialLink[]
  privacy: {
    phoneVisible: boolean // Default: false (hidden)
    emailVisible: boolean // Default: false (hidden)
  }
}

// Helper function to convert academic year (YYYY-YYYY) to Kxx format
export const academicYearToKxx = (academicYear: string): string => {
  const [startYear] = academicYear.split("-")
  const year = parseInt(startYear)
  // Kxx format: K + last 2 digits of start year
  // For 2023 -> K23, 2024 -> K24, etc.
  const lastTwoDigits = year % 100
  return `K${lastTwoDigits.toString().padStart(2, "0")}`
}

// Load from localStorage or use default
function loadProfileInfoFromStorage(): ProfileInfo {
  if (typeof window === "undefined") {
    return {
      username: "",
      studentId: "",
      name: "",
      dateOfBirth: "",
      academicYear: "",
      phoneNumber: "",
      email: "",
      initials: "",
      major: "",
      bio: "",
      focusAreas: [],
      socialLinks: [],
      privacy: {
        phoneVisible: false,
        emailVisible: false,
      },
    }
  }
  try {
    const stored = localStorage.getItem("unicircle_profile_info")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load profile info from localStorage:", error)
  }
  return {
    username: "",
    studentId: "",
    name: "",
    dateOfBirth: "",
    academicYear: "",
    phoneNumber: "",
    email: "",
    initials: "",
    major: "",
    bio: "",
    focusAreas: [],
    socialLinks: [],
  privacy: {
      phoneVisible: false,
      emailVisible: false,
  },
  }
}

export const profileInfo: ProfileInfo = loadProfileInfoFromStorage()

// Load from localStorage or use empty array
function loadProfileStatsFromStorage(): ProfileStat[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("unicircle_profile_stats")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load profile stats from localStorage:", error)
  }
  return []
}

export const profileStats: ProfileStat[] = loadProfileStatsFromStorage()

// Load from localStorage or use empty array
function loadProfileActivitiesFromStorage(): ProfileActivity[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("unicircle_profile_activities")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load profile activities from localStorage:", error)
  }
  return []
}

export const profileActivities: ProfileActivity[] = loadProfileActivitiesFromStorage()
