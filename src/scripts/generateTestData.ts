/**
 * Test Data Generator Script
 * 
 * This script generates dynamic test data based on the project specification:
 * - Module A: Student Identity (Auth Service)
 * - Module B: Feed & Forum (Feed Service) - Q&A Threads
 * - Module C: Resource Sharing (Resource Service) - Academic Materials
 * - Module D: Personal Collection (Collection Service) - PKM
 * 
 * Run this script to populate localStorage with test data for development/testing.
 */

// TDTU Course Codes and Names
const TDTU_COURSES = [
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

// Resource Tags
const RESOURCE_TAGS = [
  "lecture-notes",
  "cheat-sheet",
  "past-paper",
  "diagram",
  "video",
  "summary",
  "assignment",
  "lab-guide",
]

// Sample Vietnamese names for students
const STUDENT_NAMES = [
  "An Nguyen", "Bao Pham", "Linh Tran", "Minh Ho", "Trang Le",
  "Quoc Chau", "Hieu Nguyen", "Thao Pham", "Duc Tran", "Nga Ho",
  "Khanh Le", "Tuan Nguyen", "Mai Pham", "Hung Tran", "Lan Ho",
]

// Generate initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0].toUpperCase())
    .join("")
    .slice(0, 2)
}

// Generate email from student ID
function generateEmail(studentId: string): string {
  return `${studentId}@student.tdtu.edu.vn`
}

// Generate random date within last 30 days
function randomRecentDate(): string {
  const daysAgo = Math.floor(Math.random() * 30)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  
  if (daysAgo === 0) return "Today"
  if (daysAgo === 1) return "Yesterday"
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 14) return "Last week"
  if (daysAgo < 21) return "2 weeks ago"
  return "3 weeks ago"
}

// Generate resources (Module C)
export function generateResources() {
  const resources = []
  const resourceTypes: ("url" | "document")[] = ["url", "document"]
  const documentExtensions = ["pdf", "docx", "pptx"]
  
  for (let i = 0; i < 15; i++) {
    const course = TDTU_COURSES[Math.floor(Math.random() * TDTU_COURSES.length)]
    const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)]
    const contributor = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)]
    const tagCount = Math.floor(Math.random() * 3) + 1
    const tags = RESOURCE_TAGS
      .sort(() => Math.random() - 0.5)
      .slice(0, tagCount)
    
    const resourceTitles = [
      `${course.code} ${course.name} Lecture Notes`,
      `${course.name} Midterm Practice Questions`,
      `${course.name} Final Exam Review Guide`,
      `${course.name} Lab Assignment Solutions`,
      `${course.name} Summary Notes`,
      `${course.name} Past Papers Collection`,
      `${course.name} Cheat Sheet`,
    ]
    
    const resourceSummaries = [
      `Comprehensive notes covering all topics from ${course.name}. Includes diagrams and examples.`,
      `Practice questions with detailed solutions for ${course.name} midterm preparation.`,
      `Complete review guide for ${course.name} final exam. Covers all chapters.`,
      `Step-by-step solutions for lab assignments in ${course.name}.`,
      `Condensed summary of key concepts in ${course.name}. Perfect for quick revision.`,
      `Collection of past exam papers for ${course.name} with answer keys.`,
      `Quick reference guide for ${course.name} covering formulas and key concepts.`,
    ]
    
    const title = resourceTitles[Math.floor(Math.random() * resourceTitles.length)]
    const summary = resourceSummaries[Math.floor(Math.random() * resourceSummaries.length)]
    
    resources.push({
      id: `r${i + 1}`,
      title,
      summary,
      courseCode: course.code,
      courseName: course.name,
      tags,
      type,
      url: type === "url" 
        ? `https://unicircle.app/resources/${course.code.toLowerCase()}-${i + 1}`
        : "#",
      fileName: type === "document"
        ? `${course.code.toLowerCase()}-${title.toLowerCase().replace(/\s+/g, "-")}.${documentExtensions[Math.floor(Math.random() * documentExtensions.length)]}`
        : undefined,
      contributor,
      uploadedAt: randomRecentDate(),
      votes: Math.floor(Math.random() * 100),
    })
  }
  
  return resources
}

// Generate feed posts/threads (Module B)
export function generateFeedPosts() {
  const posts = []
  const mediaTypes: ("image" | "video")[] = ["image", "video"]
  const thumbColors = ["#036aff", "#141414", "#f5f5f5", "#10b981", "#f59e0b"]
  
  for (let i = 0; i < 10; i++) {
    const author = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)]
    const course = TDTU_COURSES[Math.floor(Math.random() * TDTU_COURSES.length)]
    const privacy: ("public" | "friends") = Math.random() > 0.5 ? "public" : "friends"
    const threadType: "Q&A" | "Normal" = Math.random() > 0.5 ? "Q&A" : "Normal"
    const status: "OPEN" | "CLOSED" = Math.random() > 0.8 ? "CLOSED" : "OPEN"
    const isEdited = Math.random() > 0.7
    const canManage = author === "Quoc Chau"
    const mediaCount = Math.floor(Math.random() * 3) // 0-2 media items
    const commentCount = Math.floor(Math.random() * 8)
    
    const postContents = [
      `Just finished reviewing ${course.name}. The concepts are getting clearer now!`,
      `Does anyone have tips for the ${course.name} midterm? Struggling with some topics.`,
      `Shared my notes from today's ${course.name} lecture. Hope it helps!`,
      `Working on ${course.name} assignment. Any study groups forming?`,
      `Found a great resource for ${course.name}. Check it out!`,
      `Question about ${course.name}: Can someone explain this concept?`,
      `Study session for ${course.name} was productive today. Thanks everyone!`,
    ]
    
    const eventTags = [
      `${course.name} Exam Review`,
      `${course.name} Study Group`,
      `${course.name} Assignment Help`,
      `${course.name} Discussion`,
    ]
    
    const media: Array<{ id: string; type: "image" | "video"; thumbColor: string; label: string }> = []
    for (let j = 0; j < mediaCount; j++) {
      media.push({
        id: `m${i + 1}-${j + 1}`,
        type: mediaTypes[Math.floor(Math.random() * mediaTypes.length)],
        thumbColor: thumbColors[Math.floor(Math.random() * thumbColors.length)],
        label: j === 0 ? "Screenshot" : j === 1 ? "Whiteboard notes" : "Recording",
      })
    }
    
    // Generate comments
    const comments = []
    const commentAuthors = STUDENT_NAMES.filter((n) => n !== author)
    for (let j = 0; j < Math.min(commentCount, 5); j++) {
      const commentAuthor = commentAuthors[Math.floor(Math.random() * commentAuthors.length)]
      const commentTexts = [
        "Great question! I had the same issue.",
        "Thanks for sharing this!",
        "This helped me understand better.",
        "Can you explain more about this?",
        "I found this resource helpful too.",
        "Let me know if you need help!",
      ]
      const baseComment: any = {
        id: `c${i + 1}-${j + 1}`,
        author: commentAuthor,
        initials: getInitials(commentAuthor),
        text: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        createdAt: randomRecentDate(),
      }

      // Randomly mark some comments as "edited"
      if (Math.random() > 0.75) {
        baseComment.isEdited = true
      }

      // Randomly mark some comments as replies (for UI-only reference)
      if (j > 0 && Math.random() > 0.6) {
        const parentIndex = Math.floor(Math.random() * j)
        const parent = comments[parentIndex]
        if (parent) {
          baseComment.parentCommentId = parent.id
          baseComment.parentAuthor = parent.author
        }
      }

      comments.push(baseComment)
    }
    
    const titleOptions = [
      `[${course.code}] ${course.name} midterm Q&A`,
      `[${course.code}] Question about ${course.name}`,
      `${course.name} assignment help needed`,
      `${course.name} discussion thread`,
    ]

    posts.push({
      id: `p${i + 1}`,
      author: {
        name: author,
        initials: getInitials(author),
        isFriend: Math.random() > 0.3,
      },
      createdAt: randomRecentDate(),
      privacy,
      threadType,
      status,
      isEdited,
      title: titleOptions[Math.floor(Math.random() * titleOptions.length)],
      content: postContents[Math.floor(Math.random() * postContents.length)],
      eventTag: eventTags[Math.floor(Math.random() * eventTags.length)],
      media,
      stats: {
        likes: Math.floor(Math.random() * 50),
        comments: commentCount,
      },
      comments,
      // UI-only flag so we can show edit / close / delete controls for "current" student
      canManage,
    })
  }
  
  return posts
}

// Generate feed friends
export function generateFeedFriends() {
  const friends = []
  const studyFocuses = TDTU_COURSES.map((c) => c.name)
  const lastActiveOptions = ["Online now", "5m ago", "12m ago", "1h ago", "2h ago", "Yesterday"]
  
  for (let i = 0; i < 8; i++) {
    const name = STUDENT_NAMES[i % STUDENT_NAMES.length]
    friends.push({
      id: `f${i + 1}`,
      name,
      initials: getInitials(name),
      studyFocus: studyFocuses[Math.floor(Math.random() * studyFocuses.length)],
      lastActive: lastActiveOptions[Math.floor(Math.random() * lastActiveOptions.length)],
    })
  }
  
  return friends
}

// Generate collections (Module D)
export function generateCollections(resources: any[], feedPosts: any[]) {
  const collections = []
  const collectionNames = [
    "Web Dev Final",
    "AI Fundamentals",
    "Data Structures Review",
    "Software Engineering Notes",
    "Microeconomics Study Guide",
    "Database Systems Collection",
    "Mobile App Development",
    "Business Management Resources",
    "Statistics Cheat Sheets",
    "Java Programming Resources",
  ]
  
  const externalUrls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://github.com/example/repo",
    "https://docs.example.com/tutorial",
    "https://stackoverflow.com/questions/example",
    "https://medium.com/@author/article",
    "https://www.w3schools.com/tutorial",
    "https://developer.mozilla.org/en-US/docs",
  ]
  
  for (let i = 0; i < 8; i++) {
    const name = collectionNames[i] || `Collection ${i + 1}`
    const visibility: ("PRIVATE" | "PUBLIC") = Math.random() > 0.6 ? "PUBLIC" : "PRIVATE"
    const owner = STUDENT_NAMES[Math.floor(Math.random() * STUDENT_NAMES.length)]
    const tagCount = Math.floor(Math.random() * 4) + 1
    const tags = ["Java", "Web Dev", "AI", "Data Structures", "Software Eng", "Business"]
      .sort(() => Math.random() - 0.5)
      .slice(0, tagCount)
    
    // Generate collection items (polymorphic)
    const itemCount = Math.floor(Math.random() * 8) + 3 // 3-10 items
    const items = []
    
    for (let j = 0; j < itemCount; j++) {
      const itemType = Math.random()
      let item: any
      
      if (itemType < 0.3) {
        // RESOURCE (30%)
        const resource = resources[Math.floor(Math.random() * resources.length)]
        item = {
          id: `item-${i + 1}-${j + 1}`,
          type: "RESOURCE",
          reference_id: resource.id,
          url: null,
          private_note: j === 0 ? "Focus on chapters 1-3 for midterm" : null,
        }
      } else if (itemType < 0.6) {
        // THREAD (30%)
        const post = feedPosts[Math.floor(Math.random() * feedPosts.length)]
        item = {
          id: `item-${i + 1}-${j + 1}`,
          type: "THREAD",
          reference_id: post.id,
          url: null,
          private_note: j === 1 ? "Great explanation in comments" : null,
        }
      } else if (itemType < 0.8) {
        // COMMENT (20%)
        const post = feedPosts[Math.floor(Math.random() * feedPosts.length)]
        if (post.comments && post.comments.length > 0) {
          const comment = post.comments[Math.floor(Math.random() * post.comments.length)]
          item = {
            id: `item-${i + 1}-${j + 1}`,
            type: "COMMENT",
            reference_id: comment.id,
            url: null,
            private_note: null,
          }
        } else {
          // Fallback to EXTERNAL if no comments
          item = {
            id: `item-${i + 1}-${j + 1}`,
            type: "EXTERNAL",
            reference_id: null,
            url: externalUrls[Math.floor(Math.random() * externalUrls.length)],
            private_note: "Useful reference material",
          }
        }
      } else {
        // EXTERNAL (20%)
        item = {
          id: `item-${i + 1}-${j + 1}`,
          type: "EXTERNAL",
          reference_id: null,
          url: externalUrls[Math.floor(Math.random() * externalUrls.length)],
          private_note: Math.random() > 0.7 ? "Bookmark for later review" : null,
        }
      }
      
      items.push(item)
    }
    
    collections.push({
      id: `collection-${i + 1}`,
      name,
      description: `A curated collection of resources for ${name.toLowerCase()}`,
      visibility,
      tags,
      owner_id: `user-${STUDENT_NAMES.indexOf(owner) + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      collection_items: items,
    })
  }
  
  return collections
}

// Generate profile data
export function generateProfileData() {
  const studentId = "523k0002"
  const name = "Quoc Chau"
  
  return {
    profileInfo: {
      username: "quocchau_dev",
      studentId,
      name,
      dateOfBirth: "2005-03-15",
      academicYear: "2023-2024",
      phoneNumber: "+84 123 456 789",
      email: generateEmail(studentId),
      avatar: undefined,
      initials: getInitials(name),
      major: "Software Engineering",
      bio: "Enjoys building study tools, leading peer sessions for AI and Data Structures, and collecting high‑quality notes.",
      focusAreas: ["AI fundamentals", "Data Structures", "Software Engineering"],
      socialLinks: [
        {
          platform: "facebook" as const,
          url: "https://facebook.com/quocchau",
          label: "Facebook",
        },
        {
          platform: "instagram" as const,
          url: "https://instagram.com/quocchau",
          label: "Instagram",
        },
        {
          platform: "unicircle" as const,
          url: "/profile",
          label: "UniCircle Profile",
        },
      ],
      privacy: {
        phoneVisible: false,
        emailVisible: false,
      },
    },
    profileStats: [
      {
        id: "collections-created",
        label: "Collections created",
        value: "8",
        helper: "3 this month",
      },
      {
        id: "resources-shared",
        label: "Resources shared",
        value: "12",
        helper: "5 Software Eng, 4 AI, 3 DS",
      },
      {
        id: "threads-posted",
        label: "Threads posted",
        value: "15",
        helper: "Mostly AI & DSA",
      },
      {
        id: "upvotes",
        label: "Peer upvotes",
        value: "143",
        helper: "On notes & past papers",
      },
    ],
    profileActivities: [
      {
        id: "a1",
        type: "collection" as const,
        title: "Created \"Web Dev Final\" collection",
        meta: "Collection · 12 items",
        date: "Today · 7:30 PM",
      },
      {
        id: "a2",
        type: "resource" as const,
        title: "Shared \"503045 Sprint Planning Checklist\"",
        meta: "Resource · 503045 - Software Engineering",
        date: "Yesterday",
      },
      {
        id: "a3",
        type: "feed" as const,
        title: "Posted midterm reflection on Microeconomics elasticity",
        meta: "Student Feed · 24 likes · 6 comments",
        date: "This week",
      },
      {
        id: "a4",
        type: "resource" as const,
        title: "Uploaded \"Data Structures Graph Algorithms Sketchbook\"",
        meta: "Resource · 504070 - Data Structures",
        date: "Last week",
      },
    ],
  }
}

// Main function to generate all test data
export function generateAllTestData() {
  console.log("🚀 Generating test data...")
  
  const resources = generateResources()
  const feedPosts = generateFeedPosts()
  const feedFriends = generateFeedFriends()
  const collections = generateCollections(resources, feedPosts)
  const profileData = generateProfileData()
  
  // Store in localStorage
  localStorage.setItem("unicircle_resources", JSON.stringify(resources))
  localStorage.setItem("unicircle_feed_posts", JSON.stringify(feedPosts))
  localStorage.setItem("unicircle_feed_friends", JSON.stringify(feedFriends))
  localStorage.setItem("unicircle_collections", JSON.stringify(collections))
  localStorage.setItem("unicircle_profile_info", JSON.stringify(profileData.profileInfo))
  localStorage.setItem("unicircle_profile_stats", JSON.stringify(profileData.profileStats))
  localStorage.setItem("unicircle_profile_activities", JSON.stringify(profileData.profileActivities))
  
  console.log("✅ Test data generated successfully!")
  console.log(`   - ${resources.length} resources`)
  console.log(`   - ${feedPosts.length} feed posts`)
  console.log(`   - ${feedFriends.length} feed friends`)
  console.log(`   - ${collections.length} collections`)
  console.log("   - Profile data")
  console.log("\n💡 Data stored in localStorage. Refresh the page to see changes.")
  
  return {
    resources,
    feedPosts,
    feedFriends,
    collections,
    profileData,
  }
}

// Export for use in browser console or as a module
if (typeof window !== "undefined") {
  (window as any).generateTestData = generateAllTestData
  console.log("💡 Run generateTestData() in the console to generate test data")
}

