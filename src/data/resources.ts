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
  { code: "503001", name: "Database Systems" },
  { code: "502301", name: "Corporate Finance" },
  { code: "501001", name: "Statistics" },
  { code: "503020", name: "Web Development" },
  { code: "503030", name: "Mobile Application Development" },
  { code: "502101", name: "Business Management" },
]

export const resourceTags = [
  "lecture-notes",
  "cheat-sheet",
  "past-paper",
  "diagram",
  "video",
  "summary",
  "assignment",
  "lab-guide",
]

// Load from localStorage or use empty array
function loadResourcesFromStorage(): ResourceItem[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("unicircle_resources")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load resources from localStorage:", error)
  }
  return []
}

export const resourceItems: ResourceItem[] = loadResourcesFromStorage()
