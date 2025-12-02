export type StudySessionVisibility = "public" | "private-invite" | "private-password"

// Schedule sessions used in the main StudySessionPage schedule view
export interface ScheduleSession {
  id: string
  topic: string
  lecture?: string
  link?: string
  teacher: {
    name: string
    avatar?: string
    initials: string
  }
  time: {
    from: string
    to: string
  }
  students: {
    avatars: string[]
    count: number
  }
  date: string
}

export const scheduleSessions: ScheduleSession[] = [
  {
    id: "1",
    topic: "Introduction to Artificial Intelligence",
    lecture: "Introduction to AI",
    link: "https://meet.google.com/les02-efg",
    teacher: {
      name: "Julie Dawson",
      initials: "JD",
    },
    time: {
      from: "09:00 AM",
      to: "10:20 AM",
    },
    students: {
      avatars: [],
      count: 13,
    },
    date: "Today March 12, 2025",
  },
  {
    id: "2",
    topic: "Introduction to Machine Learning",
    lecture: "Introduction to Machine Learning",
    link: "https://meet.google.com/les02-efg",
    teacher: {
      name: "Ida Aguirre",
      initials: "IA",
    },
    time: {
      from: "01:20 PM",
      to: "03:00 PM",
    },
    students: {
      avatars: [],
      count: 8,
    },
    date: "Today March 12, 2025",
  },
]

// Sessions visible in the discovery / peer group view
export interface DiscoverySession {
  id: string
  title: string
  faculty: string
  course: string
  location: string
  visibility: StudySessionVisibility
  hostName: string
  hostInitials: string
  time: string
  capacity: {
    current: number
    max: number
  }
  tags: string[]
}

export const discoverySessions: DiscoverySession[] = [
  {
    id: "d1",
    title: "Exam Review: Intro to AI – Chapter 3 Focus",
    faculty: "Technology",
    course: "Introduction to AI",
    location: "Library A302",
    visibility: "public",
    hostName: "An Nguyen",
    hostInitials: "AN",
    time: "Today • 7:30 PM – 9:00 PM",
    capacity: {
      current: 4,
      max: 8,
    },
    tags: ["Problem solving", "Past papers"],
  },
  {
    id: "d2",
    title: "Microeconomics – Graphs & Elasticity practice",
    faculty: "Business",
    course: "Microeconomics",
    location: "B2-104",
    visibility: "private-password",
    hostName: "Linh Tran",
    hostInitials: "LT",
    time: "Tomorrow • 3:00 PM – 4:30 PM",
    capacity: {
      current: 2,
      max: 6,
    },
    tags: ["Graphs", "Q&A"],
  },
  {
    id: "d3",
    title: "Data Structures coding drill (LeetCode style)",
    faculty: "Technology",
    course: "Data Structures",
    location: "Online",
    visibility: "private-invite",
    hostName: "Bao Pham",
    hostInitials: "BP",
    time: "Friday • 8:00 PM – 9:30 PM",
    capacity: {
      current: 5,
      max: 10,
    },
    tags: ["Coding", "Whiteboard"],
  },
]

export const discoveryFilters = {
  faculties: ["All faculties", "Technology", "Business", "Humanities"],
  courses: ["All courses", "Introduction to AI", "Microeconomics", "Data Structures"],
  locations: ["Any", "On campus", "Online", "Library"],
}

// Quick question presets for creating a new study session
export interface QuestionOption {
  id: string
  label: string
}

export interface SessionQuestion {
  id: string
  label: string
  helperText?: string
  options: QuestionOption[]
}

export const sessionQuestionPresets: SessionQuestion[] = [
  {
    id: "focus",
    label: "What do you want this session to focus on?",
    options: [
      { id: "theory", label: "Review theory" },
      { id: "practice", label: "Solve practice problems" },
      { id: "exam", label: "Exam-style questions" },
    ],
  },
  {
    id: "size",
    label: "How many students should join?",
    options: [
      { id: "small", label: "2 – 4 students" },
      { id: "medium", label: "5 – 8 students" },
      { id: "large", label: "9+ students" },
    ],
  },
  {
    id: "duration",
    label: "Preferred duration?",
    options: [
      { id: "45", label: "45 minutes" },
      { id: "60", label: "60 minutes" },
      { id: "90", label: "90 minutes" },
    ],
  },
  {
    id: "vibe",
    label: "What should the vibe be?",
    helperText: "So other students know what to expect.",
    options: [
      { id: "quiet", label: "Quiet / focused" },
      { id: "discussion", label: "Discussion heavy" },
      { id: "mixed", label: "Mix of both" },
    ],
  },
]

// Join requests for locked sessions
export type JoinRequestStatus = "pending" | "accepted" | "rejected"

export interface JoinRequest {
  id: string
  sessionTitle: string
  requesterName: string
  requesterInitials: string
  message?: string
  requestedAt: string
  status: JoinRequestStatus
}

// Seed join requests used to mock the request-to-join flow
export const initialJoinRequests: JoinRequest[] = [
  {
    id: "r1",
    sessionTitle: "Data Structures coding drill (LeetCode style)",
    requesterName: "Minh Ho",
    requesterInitials: "MH",
    message: "Can I join to practice trees and graphs?",
    requestedAt: "Today • 16:42",
    status: "pending",
  },
  {
    id: "r2",
    sessionTitle: "Microeconomics – Graphs & Elasticity practice",
    requesterName: "Trang Le",
    requesterInitials: "TL",
    requestedAt: "Yesterday • 21:10",
    status: "accepted",
  },
]


