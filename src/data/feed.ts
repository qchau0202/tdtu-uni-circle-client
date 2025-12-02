export type FeedPrivacy = "public" | "friends"

export interface FeedMediaItem {
  id: string
  type: "image" | "video"
  thumbColor: string
  label: string
}

export interface FeedPost {
  id: string
  author: {
    name: string
    initials: string
    isFriend: boolean
  }
  createdAt: string
  privacy: FeedPrivacy
  content: string
  eventTag?: string
  media: FeedMediaItem[]
  stats: {
    likes: number
    comments: number
  }
  comments: {
    id: string
    author: string
    initials: string
    text: string
    createdAt: string
  }[]
}

export const feedPosts: FeedPost[] = [
  {
    id: "p1",
    author: {
      name: "An Nguyen",
      initials: "AN",
      isFriend: true,
    },
    createdAt: "10 minutes ago",
    privacy: "friends",
    content:
      "Just finished tonight’s Intro to AI review session. We went deep into search algorithms and heuristic design.",
    eventTag: "Intro to AI Exam Review",
    media: [
      { id: "m1", type: "image", thumbColor: "#036aff", label: "Whiteboard notes" },
      { id: "m2", type: "image", thumbColor: "#141414", label: "Group photo" },
    ],
    stats: {
      likes: 18,
      comments: 5,
    },
    comments: [
      {
        id: "c1",
        author: "Bao Pham",
        initials: "BP",
        text: "Thanks for leading! The heuristic examples were super clear.",
        createdAt: "8 minutes ago",
      },
      {
        id: "c2",
        author: "Linh Tran",
        initials: "LT",
        text: "Could you share the whiteboard photo as a resource too?",
        createdAt: "5 minutes ago",
      },
    ],
  },
  {
    id: "p2",
    author: {
      name: "Linh Tran",
      initials: "LT",
      isFriend: true,
    },
    createdAt: "1 hour ago",
    privacy: "public",
    content:
      "Shared my elasticity cheat-sheet from today’s Microeconomics study circle. Feel free to reuse for your own notes.",
    eventTag: "Microeconomics – Elasticity",
    media: [
      { id: "m3", type: "image", thumbColor: "#f5f5f5", label: "Cheat sheet" },
    ],
    stats: {
      likes: 32,
      comments: 9,
    },
    comments: [
      {
        id: "c3",
        author: "An Nguyen",
        initials: "AN",
        text: "This cheat-sheet saved me in the quiz, thank you.",
        createdAt: "40 minutes ago",
      },
    ],
  },
  {
    id: "p3",
    author: {
      name: "Bao Pham",
      initials: "BP",
      isFriend: true,
    },
    createdAt: "Yesterday",
    privacy: "friends",
    content:
      "LeetCode-style DS session yesterday was intense but fun. Next time we’ll focus on graph problems only.",
    eventTag: "Data Structures Coding Drill",
    media: [
      { id: "m4", type: "video", thumbColor: "#141414", label: "Recording" },
      { id: "m5", type: "image", thumbColor: "#036aff", label: "Code snippets" },
      { id: "m6", type: "image", thumbColor: "#f5f5f5", label: "Solutions" },
    ],
    stats: {
      likes: 21,
      comments: 4,
    },
    comments: [
      {
        id: "c4",
        author: "Minh Ho",
        initials: "MH",
        text: "Graph drills next week please!",
        createdAt: "Yesterday",
      },
    ],
  },
]

export interface FeedFriend {
  id: string
  name: string
  initials: string
  studyFocus: string
  lastActive: string
}

export const feedFriends: FeedFriend[] = [
  {
    id: "f1",
    name: "An Nguyen",
    initials: "AN",
    studyFocus: "Intro to AI",
    lastActive: "Online now",
  },
  {
    id: "f2",
    name: "Linh Tran",
    initials: "LT",
    studyFocus: "Microeconomics",
    lastActive: "12m ago",
  },
  {
    id: "f3",
    name: "Bao Pham",
    initials: "BP",
    studyFocus: "Data Structures",
    lastActive: "1h ago",
  },
  {
    id: "f4",
    name: "Trang Le",
    initials: "TL",
    studyFocus: "Corporate Finance",
    lastActive: "2h ago",
  },
  {
    id: "f5",
    name: "Minh Ho",
    initials: "MH",
    studyFocus: "Statistics",
    lastActive: "Yesterday",
  },
]



