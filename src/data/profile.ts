export interface ProfileStat {
  id: string
  label: string
  value: string
  helper: string
}

export interface ProfileActivity {
  id: string
  type: "study-session" | "resource" | "feed"
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

export const profileInfo: ProfileInfo = {
  username: "quocchau_dev",
  studentId: "523k0002",
  name: "Quoc Chau",
  dateOfBirth: "2005-03-15",
  academicYear: "2023-2024",
  phoneNumber: "+84 123 456 789",
  email: "523k0002@student.tdtu.edu.vn",
  avatar: undefined,
  initials: "QC",
  major: "Software Engineering",
  bio: "Enjoys building study tools, leading peer sessions for AI and Data Structures, and collecting high‑quality notes.",
  focusAreas: ["AI fundamentals", "Data Structures", "Software Engineering"],
  socialLinks: [
    {
      platform: "facebook",
      url: "https://facebook.com/quocchau",
      label: "Facebook",
    },
    {
      platform: "instagram",
      url: "https://instagram.com/quocchau",
      label: "Instagram",
    },
    {
      platform: "unicircle",
      url: "/profile",
      label: "UniCircle Profile",
    },
  ],
  privacy: {
    phoneVisible: false, // Hidden by default
    emailVisible: false, // Hidden by default
  },
}

export const profileStats: ProfileStat[] = [
  {
    id: "sessions-hosted",
    label: "Study sessions hosted",
    value: "12",
    helper: "3 this month",
  },
  {
    id: "sessions-joined",
    label: "Sessions joined",
    value: "28",
    helper: "Mostly AI & DSA",
  },
  {
    id: "resources-shared",
    label: "Resources shared",
    value: "9",
    helper: "5 Software Eng, 4 AI",
  },
  {
    id: "upvotes",
    label: "Peer upvotes",
    value: "143",
    helper: "On notes & past papers",
  },
]

export const profileActivities: ProfileActivity[] = [
  {
    id: "a1",
    type: "study-session",
    title: "Hosted “Intro to AI – Search & Heuristics” review",
    meta: "Study Session · 18 students joined",
    date: "Today · 7:30 PM",
  },
  {
    id: "a2",
    type: "resource",
    title: "Shared “503045 Sprint Planning Checklist”",
    meta: "Resource · 503045 - Software Engineering",
    date: "Yesterday",
  },
  {
    id: "a3",
    type: "feed",
    title: "Posted midterm reflection on Microeconomics elasticity",
    meta: "Student Feed · 24 likes · 6 comments",
    date: "This week",
  },
  {
    id: "a4",
    type: "resource",
    title: "Uploaded “Data Structures Graph Algorithms Sketchbook”",
    meta: "Resource · 504070 - Data Structures",
    date: "Last week",
  },
]


