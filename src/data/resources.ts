export interface ResourceItem {
  id: string
  title: string
  summary: string
  courseCode: string
  courseName: string
  tags: string[]
  type: "url" | "document"
  url: string
  fileName?: string
  contributor: string
  uploadedAt: string
  votes: number
}

export const resourceCourses = [
  { code: "503045", name: "Software Engineering" },
  { code: "503012", name: "Introduction to Artificial Intelligence" },
  { code: "502201", name: "Microeconomics" },
  { code: "504070", name: "Data Structures" },
]

export const resourceTags = [
  "lecture-notes",
  "cheat-sheet",
  "past-paper",
  "diagram",
  "video",
  "summary",
]

export const resourceItems: ResourceItem[] = [
  {
    id: "r1",
    title: "503045 Sprint Planning Checklist",
    summary:
      "One-page checklist we used before each sprint review. Covers backlog grooming, definition of done, and QA handoff tips.",
    courseCode: "503045",
    courseName: "Software Engineering",
    tags: ["lecture-notes", "cheat-sheet"],
    type: "url",
    url: "https://unicircle.app/resources/503045-sprint-checklist",
    contributor: "An Nguyen",
    uploadedAt: "2 hours ago",
    votes: 42,
  },
  {
    id: "r2",
    title: "Microeconomics Elasticity Mini Guide",
    summary:
      "Summaries of price/income elasticity plus 10 short solved exercises. Great for quick revision.",
    courseCode: "502201",
    courseName: "Microeconomics",
    tags: ["summary", "past-paper"],
    type: "url",
    url: "https://unicircle.app/resources/elasticity-guide",
    contributor: "Linh Tran",
    uploadedAt: "Today, 09:10",
    votes: 68,
  },
  {
    id: "r3",
    title: "Intro to AI Midterm Practice (2024)",
    summary:
      "Compiled past midterm questions with step-by-step solutions covering search, CSPs, and heuristic design.",
    courseCode: "503012",
    courseName: "Introduction to Artificial Intelligence",
    tags: ["past-paper", "lecture-notes"],
    type: "url",
    url: "https://unicircle.app/resources/ai-midterm-pack",
    contributor: "Bao Pham",
    uploadedAt: "Yesterday",
    votes: 55,
  },
  {
    id: "r4",
    title: "Data Structures Graph Algorithms Sketchbook",
    summary:
      "Whiteboard snapshots + explanations for DFS/BFS, Dijkstra, and Union-Find. Helpful for coding interviews.",
    courseCode: "504070",
    courseName: "Data Structures",
    tags: ["diagram", "lecture-notes"],
    type: "document",
    url: "#",
    fileName: "ds-graphs.pdf",
    contributor: "Trang Le",
    uploadedAt: "3 days ago",
    votes: 37,
  },
]


