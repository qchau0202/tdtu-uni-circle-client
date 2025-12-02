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

export const profileInfo = {
  name: "Quoc Chau",
  initials: "QC",
  email: "523k0002@student.tdtu.edu.vn",
  major: "Software Engineering",
  year: "K27",
  bio: "Enjoys building study tools, leading peer sessions for AI and Data Structures, and collecting high‑quality notes.",
  focusAreas: ["AI fundamentals", "Data Structures", "Software Engineering"],
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


