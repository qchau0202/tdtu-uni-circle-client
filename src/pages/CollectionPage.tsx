import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus,
  Search,
  Lock,
  Globe2,
  FileText,
  MessageSquare,
  MessageCircle,
  Link as LinkIcon,
  Edit,
  Trash2,
  Copy,
  X,
  Tag,
  Bookmark,
  Check,
  LayoutGrid,
  List,
  Info,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { resourceItems } from "@/data/resources"
import { feedPosts, type FeedPost, type FeedComment } from "@/data/feed"
import {
  getUserCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addItemToCollection,
  removeItemFromCollection,
  searchCollections,
  cloneCollection,
  type Collection,
  type CollectionItem,
  type CollectionItemType,
  type CollectionVisibility,
} from "@/services/collection/localCollectionService"

const CollectionPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [collections, setCollections] = useState<Collection[]>([])
  const [searchResults, setSearchResults] = useState<Collection[]>([])
  const [activeTab, setActiveTab] = useState<"my-collections" | "discover">("my-collections")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [resourceIndex, setResourceIndex] = useState<Record<string, (typeof resourceItems)[number]>>({})
  const [bookmarkedResources, setBookmarkedResources] = useState<(typeof resourceItems)[number][]>([])
  const [likedThreads, setLikedThreads] = useState<FeedPost[]>([])
  const [likedComments, setLikedComments] = useState<{ comment: FeedComment; thread: FeedPost }[]>([])
  const [bookmarkSearch, setBookmarkSearch] = useState("")
  const [bookmarkFilters, setBookmarkFilters] = useState<{
    resources: boolean
    threads: boolean
    comments: boolean
  }>({ resources: true, threads: true, comments: true })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form states
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [collectionVisibility, setCollectionVisibility] = useState<CollectionVisibility>("PRIVATE")
  const [collectionTags, setCollectionTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  // Item form states
  const [itemType, setItemType] = useState<CollectionItemType>("RESOURCE")
  const [itemReferenceId, setItemReferenceId] = useState("")
  const [itemUrl, setItemUrl] = useState("")
  const [itemPrivateNote, setItemPrivateNote] = useState("")
  const [resourceSearchQuery, setResourceSearchQuery] = useState("")
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const quickTagPresets = ["midterm", "final", "labs", "project", "reference", "notes"]
  const quickTemplates = [
    {
      name: "Midterm study pack",
      description: "Key lectures, problem sets, and solutions for the exam.",
      visibility: "PRIVATE" as CollectionVisibility,
      tags: ["midterm", "notes", "practice"],
    },
    {
      name: "Course reference hub",
      description: "All official docs, slides, and helpful external links.",
      visibility: "PUBLIC" as CollectionVisibility,
      tags: ["reference", "slides", "links"],
    },
  ]

  useEffect(() => {
    if (user) {
      loadMyCollections()
      loadBookmarkData()
    }
  }, [user])

  // Build quick lookup for resources used in collection detail view
  useEffect(() => {
    try {
      const stored = localStorage.getItem("unicircle_resources")
      const storedList: (typeof resourceItems)[number][] = stored ? JSON.parse(stored) : []
      const index: Record<string, (typeof resourceItems)[number]> = {}
      ;[...resourceItems, ...storedList].forEach((r) => {
        index[r.id] = r
      })
      setResourceIndex(index)
      // Refresh bookmarks when resource index updates
      if (user) {
        loadBookmarkData(index)
      }
    } catch (error) {
      console.error("Failed to build resource index for collections:", error)
    }
  }, [])

  const getExternalHost = (url: string | undefined | null) => {
    if (!url) return ""
    try {
      const host = new URL(url).hostname
      return host.replace(/^www\./, "")
    } catch {
      return ""
    }
  }

  const parseIdList = (key: string): string[] => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []
    } catch {
      return []
    }
  }

  const loadBookmarkData = (customResourceIndex?: Record<string, (typeof resourceItems)[number]>) => {
    if (!user) return
    const currentIndex = customResourceIndex || resourceIndex

    const resourceIds = parseIdList("unicircle_bookmarked_resources")
    const likedThreadIds = parseIdList("unicircle_liked_threads")
    const likedCommentIds = new Set(parseIdList("unicircle_liked_comments"))

    const mappedResources = resourceIds
      .map((id) => currentIndex[id])
      .filter((r): r is (typeof resourceItems)[number] => Boolean(r))
    const mappedThreads = feedPosts.filter((p) => likedThreadIds.includes(p.id))

    const mappedComments: { comment: FeedComment; thread: FeedPost }[] = []
    feedPosts.forEach((thread) => {
      thread.comments.forEach((comment) => {
        if (likedCommentIds.has(comment.id)) {
          mappedComments.push({ comment, thread })
        }
      })
    })

    setBookmarkedResources(mappedResources)
    setLikedThreads(mappedThreads)
    setLikedComments(mappedComments)
  }

  const toggleBookmarkFilter = (key: "resources" | "threads" | "comments") => {
    setBookmarkFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const matchesSearch = (text: string) => {
    if (!bookmarkSearch.trim()) return true
    return text.toLowerCase().includes(bookmarkSearch.trim().toLowerCase())
  }

  const filteredBookmarkedResources = bookmarkedResources.filter(
    (res) =>
      bookmarkFilters.resources &&
      (matchesSearch(res.title) ||
        matchesSearch(res.summary) ||
        matchesSearch(res.courseCode) ||
        res.tags.some((t) => matchesSearch(t)))
  )

  const filteredLikedThreads = likedThreads.filter(
    (thread) =>
      bookmarkFilters.threads &&
      (matchesSearch(thread.title) ||
        matchesSearch(thread.content) ||
        matchesSearch(thread.author.name))
  )

  const filteredLikedComments = likedComments.filter(
    ({ comment, thread }) =>
      bookmarkFilters.comments &&
      (matchesSearch(comment.text) ||
        matchesSearch(comment.author) ||
        matchesSearch(thread.title))
  )

  const loadMyCollections = () => {
    if (!user) return
    try {
      setLoading(true)
      const data = getUserCollections(user.id)
      setCollections(data)
    } catch (error) {
      console.error("Failed to load collections:", error)
      toast.error("Failed to load collections", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    try {
      setLoading(true)
      const results = searchCollections(searchQuery, undefined, user?.id)
      setSearchResults(results)
    } catch (error) {
      toast.error("Failed to search collections", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = () => {
    if (!user || !collectionName.trim()) {
      toast.error("Collection name is required")
      return
    }

    try {
      setLoading(true)
      const newCollection = createCollection({
        name: collectionName,
        description: collectionDescription || undefined,
        visibility: collectionVisibility,
        tags: collectionTags,
        owner_id: user.id,
      })
      setCollections([newCollection, ...collections])
      setIsCreateDialogOpen(false)
      resetForm()
      toast.success("Collection created successfully")
    } catch (error) {
      toast.error("Failed to create collection", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCollection = () => {
    if (!user || !selectedCollection || !collectionName.trim()) {
      return
    }

    try {
      setLoading(true)
      const updated = updateCollection(selectedCollection.id, user.id, {
        name: collectionName,
        description: collectionDescription || undefined,
        visibility: collectionVisibility,
        tags: collectionTags,
      })
      setCollections(collections.map(c => c.id === updated.id ? updated : c))
      setIsEditDialogOpen(false)
      resetForm()
      toast.success("Collection updated successfully")
    } catch (error) {
      toast.error("Failed to update collection", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCollection = (collection: Collection) => {
    if (!user) return
    if (!confirm(`Are you sure you want to delete "${collection.name}"?`)) return

    try {
      setLoading(true)
      deleteCollection(collection.id, user.id)
      setCollections(collections.filter(c => c.id !== collection.id))
      toast.success("Collection deleted successfully")
    } catch (error) {
      toast.error("Failed to delete collection", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!user || !selectedCollection) return

    if (itemType === "EXTERNAL" && !itemUrl.trim()) {
      toast.error("URL is required for external items")
      return
    }

    if (itemType === "RESOURCE" && !selectedResourceId) {
      toast.error("Please select a resource")
      return
    }

    if (itemType !== "EXTERNAL" && itemType !== "RESOURCE" && !itemReferenceId.trim()) {
      toast.error("Reference ID is required")
      return
    }

    try {
      setLoading(true)
      addItemToCollection(selectedCollection.id, user.id, {
        type: itemType,
        reference_id: itemType === "RESOURCE" ? (selectedResourceId || undefined) : (itemType !== "EXTERNAL" ? itemReferenceId : undefined),
        url: itemType === "EXTERNAL" ? itemUrl : undefined,
        private_note: itemPrivateNote || undefined,
      })
      loadMyCollections()
      setIsAddItemDialogOpen(false)
      resetItemForm()
      toast.success("Item added to collection")
    } catch (error) {
      toast.error("Failed to add item", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = (item: CollectionItem) => {
    if (!user) return
    if (!confirm("Remove this item from the collection?")) return

    try {
      setLoading(true)
      removeItemFromCollection(item.id, user.id)
      loadMyCollections()
      toast.success("Item removed")
    } catch (error) {
      toast.error("Failed to remove item", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCloneCollection = (collection: Collection) => {
    if (!user) return

    try {
      setLoading(true)
      const cloned = cloneCollection(collection.id, user.id)
      setCollections([cloned, ...collections])
      toast.success("Collection cloned successfully")
    } catch (error) {
      toast.error("Failed to clone collection", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (collection: Collection) => {
    setSelectedCollection(collection)
    setCollectionName(collection.name)
    setCollectionDescription(collection.description || "")
    setCollectionVisibility(collection.visibility)
    setCollectionTags(collection.tags || [])
    setIsEditDialogOpen(true)
  }

  const openAddItemDialog = (collection: Collection) => {
    setSelectedCollection(collection)
    resetItemForm()
    setIsAddItemDialogOpen(true)
  }

  const openViewDialog = (collection: Collection) => {
    if (!user) return
    try {
      const fullCollection = getCollectionById(collection.id, user.id) || collection
      setSelectedCollection(fullCollection)
      setIsViewDialogOpen(true)
    } catch (error) {
      setSelectedCollection(collection)
      setIsViewDialogOpen(true)
    }
  }

  const resetForm = () => {
    setCollectionName("")
    setCollectionDescription("")
    setCollectionVisibility("PRIVATE")
    setCollectionTags([])
    setNewTag("")
    setSelectedCollection(null)
  }

  const resetItemForm = () => {
    setItemType("RESOURCE")
    setItemReferenceId("")
    setItemUrl("")
    setItemPrivateNote("")
    setResourceSearchQuery("")
    setSelectedResourceId(null)
  }

  const filteredResources = resourceItems.filter((resource) => {
    if (!resourceSearchQuery) return true
    const query = resourceSearchQuery.toLowerCase()
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.courseCode.includes(query) ||
      resource.summary.toLowerCase().includes(query)
    )
  })

  const alreadySavedResourceIds = new Set<string>()
  collections.forEach((collection) => {
    collection.collection_items?.forEach((item) => {
      if (item.type === "RESOURCE" && item.reference_id) {
        alreadySavedResourceIds.add(item.reference_id)
      }
    })
  })

  const addTag = () => {
    if (!newTag.trim()) return
    if (collectionTags.length >= 6) {
      toast.error("You can add up to 6 tags")
      return
    }
    if (!collectionTags.includes(newTag.trim())) {
      setCollectionTags([...collectionTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setCollectionTags(collectionTags.filter(t => t !== tag))
  }

  const getItemTypeIcon = (type: CollectionItemType) => {
    switch (type) {
      case "RESOURCE":
        return <FileText className="h-4 w-4" />
      case "THREAD":
        return <MessageSquare className="h-4 w-4" />
      case "COMMENT":
        return <MessageCircle className="h-4 w-4" />
      case "EXTERNAL":
        return <LinkIcon className="h-4 w-4" />
    }
  }

  const getItemTypeLabel = (type: CollectionItemType) => {
    switch (type) {
      case "RESOURCE":
        return "Resource"
      case "THREAD":
        return "Thread"
      case "COMMENT":
        return "Comment"
      case "EXTERNAL":
        return "External Link"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-4xl font-bold text-[#141414]">Collections</h1>
        </div>
        <Button
          className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
          onClick={openCreateDialog}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Collection
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="bg-white border border-gray-200 p-1 h-auto">
          <TabsTrigger
            value="my-collections"
            className={cn(
              "px-5 py-2.5 rounded-md font-bold text-base",
              activeTab === "my-collections"
                ? "bg-[#036aff] text-white"
                : "text-gray-600 hover:text-[#141414]"
            )}
          >
            My Collections
          </TabsTrigger>
          <TabsTrigger
            value="discover"
            className={cn(
              "px-5 py-2.5 rounded-md font-bold text-base",
              activeTab === "discover"
                ? "bg-[#036aff] text-white"
                : "text-gray-600 hover:text-[#141414]"
            )}
          >
            Discover
          </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className={cn(
                "px-5 py-2.5 rounded-md font-bold text-base",
                activeTab === "bookmarks"
                  ? "bg-[#036aff] text-white"
                  : "text-gray-600 hover:text-[#141414]"
              )}
            >
              Bookmarks
            </TabsTrigger>
        </TabsList>

        {/* My Collections Tab */}
        <TabsContent value="my-collections" className="mt-6">
          <div className="grid gap-6">
            <div className="space-y-4">
              {loading && collections.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-base">Loading...</div>
              ) : collections.length === 0 ? (
                <Card className="border border-gray-200 rounded-xl shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-base text-gray-500 mb-4">No collections yet</p>
                    <Button
                      onClick={openCreateDialog}
                      variant="outline"
                      className="border-gray-200 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5] px-5 py-2.5"
                    >
                      Create your first collection
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {collections.length > 0 && (
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">
                        {collections.length} collection{collections.length > 1 ? "s" : ""}
                      </p>
                      <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setViewMode("grid")}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-3 py-1",
                            viewMode === "grid"
                              ? "bg-white text-[#141414] shadow-sm"
                              : "text-gray-500"
                          )}
                        >
                          <LayoutGrid className="h-3.5 w-3.5" />
                          Grid
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("list")}
                          className={cn(
                            "flex items-center gap-1 rounded-full px-3 py-1",
                            viewMode === "list"
                              ? "bg-white text-[#141414] shadow-sm"
                              : "text-gray-500"
                          )}
                        >
                          <List className="h-3.5 w-3.5" />
                          List
                        </button>
                      </div>
                    </div>
                  )}

                  <div
                    className={
                      viewMode === "grid"
                        ? "grid gap-4 sm:grid-cols-2"
                        : "space-y-4"
                    }
                  >
                    {collections.map((collection) => (
                      <Card
                        key={collection.id}
                        className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow h-full"
                      >
                        <CardContent className="p-5 space-y-4 flex flex-col h-full">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-[#141414] truncate">
                                {collection.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "border-gray-200 text-sm px-2.5 py-1",
                                  collection.visibility === "PUBLIC"
                                    ? "border-green-200 text-green-700"
                                    : ""
                                )}
                              >
                                {collection.visibility === "PUBLIC" ? (
                                  <Globe2 className="h-4 w-4 mr-1" />
                                ) : (
                                  <Lock className="h-4 w-4 mr-1" />
                                )}
                                {collection.visibility}
                              </Badge>
                            </div>
                            {collection.description && (
                              <p className="text-base text-gray-600 line-clamp-2 leading-relaxed">
                                {collection.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-[#141414]">
                              {collection.collection_items?.length || 0} items
                            </span>
                            {collection.tags && collection.tags.length > 0 && (
                              <>
                                <span>·</span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {collection.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="border-gray-200 text-sm capitalize px-2.5 py-1"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {collection.tags.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="border-gray-200 text-sm px-2.5 py-1"
                                    >
                                      +{collection.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-gray-200 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5] px-4 py-2"
                              onClick={() => openViewDialog(collection)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-200 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5] px-4 py-2"
                              onClick={() => openEditDialog(collection)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-200 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5] px-4 py-2"
                              onClick={() => handleDeleteCollection(collection)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(220px,0.35fr)]">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search collections by name or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 border-gray-200 text-base h-12"
                />
                <Button
                  onClick={handleSearch}
                  className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>

              {loading && searchResults.length === 0 && searchQuery ? (
                <div className="text-center py-12 text-gray-500 text-base">Searching...</div>
              ) : searchResults.length === 0 && searchQuery ? (
                <Card className="border border-gray-200 rounded-xl shadow-sm">
                  <CardContent className="py-12 text-center text-base text-gray-500">
                    No collections found
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((collection) => (
                    <Card key={collection.id} className="border border-gray-200 rounded-xl shadow-sm">
                      <CardContent className="p-5 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-[#141414] truncate">
                                {collection.name}
                              </h3>
                              <Badge variant="outline" className="border-green-200 text-green-700 text-sm px-2.5 py-1">
                                <Globe2 className="h-4 w-4 mr-1" />
                                PUBLIC
                              </Badge>
                            </div>
                            {collection.description && (
                              <p className="text-base text-gray-600 line-clamp-2 leading-relaxed">{collection.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span className="font-semibold text-[#141414]">
                            {collection.collection_items?.length || 0} items
                          </span>
                          {collection.tags && collection.tags.length > 0 && (
                            <>
                              <span>·</span>
                              <div className="flex gap-1.5 flex-wrap">
                                {collection.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="border-gray-200 text-sm capitalize px-2.5 py-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-200 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5] px-4 py-2"
                            onClick={() => openViewDialog(collection)}
                          >
                            View
                          </Button>
                          {collection.visibility === "PUBLIC" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-200 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5] px-4 py-2"
                              onClick={() => handleCloneCollection(collection)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Clone
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-[#141414] mb-2">Search tips</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Search by collection name or tags to find public collections shared by other students.
                    </p>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    <li>Use tags like "Java" or "Web Dev" to find specific topics.</li>
                    <li>Clone public collections to customize them for your needs.</li>
                    <li>Private collections are only visible to their owners.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="mt-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-[#141414]">Your saved items</h3>
                <p className="text-sm text-gray-500">Resources you bookmarked, threads and comments you liked.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <Bookmark className="h-4 w-4" />
                <span>
                  {bookmarkedResources.length} resources · {likedThreads.length} threads · {likedComments.length} comments
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <Input
                value={bookmarkSearch}
                onChange={(e) => setBookmarkSearch(e.target.value)}
                placeholder="Search saved items..."
                className="w-full sm:w-72 border-gray-200 text-sm"
              />
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => toggleBookmarkFilter("resources")}
                  className={cn(
                    "rounded-full px-3 py-1 border",
                    bookmarkFilters.resources
                      ? "border-[#036aff] bg-[#036aff]/10 text-[#036aff]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  Resources
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmarkFilter("threads")}
                  className={cn(
                    "rounded-full px-3 py-1 border",
                    bookmarkFilters.threads
                      ? "border-[#036aff] bg-[#036aff]/10 text-[#036aff]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  Threads
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmarkFilter("comments")}
                  className={cn(
                    "rounded-full px-3 py-1 border",
                    bookmarkFilters.comments
                      ? "border-[#036aff] bg-[#036aff]/10 text-[#036aff]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  Comments
                </button>
              </div>
            </div>

            {filteredBookmarkedResources.length === 0 && filteredLikedThreads.length === 0 && filteredLikedComments.length === 0 ? (
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="py-10 text-center space-y-3">
                  <Bookmark className="h-10 w-10 text-gray-400 mx-auto" />
                  <p className="text-base text-gray-600">No items match these filters.</p>
                  <p className="text-sm text-gray-500">
                    Adjust filters or clear the search to see more.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div
                className={cn(
                  "grid gap-5",
                  [bookmarkFilters.resources, bookmarkFilters.threads, bookmarkFilters.comments].filter(Boolean).length === 1
                    ? "grid-cols-1"
                    : [bookmarkFilters.resources, bookmarkFilters.threads, bookmarkFilters.comments].filter(Boolean).length === 2
                      ? "lg:grid-cols-2"
                      : "lg:grid-cols-3"
                )}
              >
                {bookmarkFilters.resources && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-[#036aff]" />
                      <p className="text-sm font-semibold text-[#141414]">Bookmarked resources</p>
                    </div>
                    {filteredBookmarkedResources.length === 0 ? (
                      <Card className="border border-gray-200 rounded-xl shadow-sm">
                        <CardContent className="py-6 text-center text-sm text-gray-500">Nothing here with current filters.</CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {filteredBookmarkedResources.map((res) => (
                          <Card key={res.id} className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/resource/${res.id}`)}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="text-sm font-semibold text-[#141414] truncate">{res.title}</h4>
                                  <p className="text-xs text-gray-500 line-clamp-2">{res.summary}</p>
                                </div>
                                <Badge variant="outline" className="border-gray-200 text-[11px] px-2 py-0.5">
                                  {res.type === "document" ? "Document" : "Link"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <span>{res.courseCode}</span>
                                <span>·</span>
                                <span>{res.contributor}</span>
                              </div>
                              {res.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {res.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="border-gray-200 text-[11px] px-2 py-0.5">
                                      #{tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {bookmarkFilters.threads && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#036aff]" />
                      <p className="text-sm font-semibold text-[#141414]">Liked threads</p>
                    </div>
                    {filteredLikedThreads.length === 0 ? (
                      <Card className="border border-gray-200 rounded-xl shadow-sm">
                        <CardContent className="py-6 text-center text-sm text-gray-500">No liked threads with current filters.</CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {filteredLikedThreads.map((thread) => (
                          <Card key={thread.id} className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/feed/${thread.id}`)}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <span>{thread.author.name}</span>
                                <span>·</span>
                                <span>{thread.createdAt}</span>
                                <span>·</span>
                                <span>{thread.threadType}</span>
                              </div>
                              <h4 className="text-sm font-semibold text-[#141414] line-clamp-2">{thread.title}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2">{thread.content}</p>
                              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3.5 w-3.5" /> {thread.stats.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bookmark className="h-3.5 w-3.5" /> {thread.stats.likes}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {bookmarkFilters.comments && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-[#036aff]" />
                      <p className="text-sm font-semibold text-[#141414]">Liked comments</p>
                    </div>
                    {filteredLikedComments.length === 0 ? (
                      <Card className="border border-gray-200 rounded-xl shadow-sm">
                        <CardContent className="py-6 text-center text-sm text-gray-500">No liked comments with current filters.</CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {filteredLikedComments.map(({ comment, thread }) => (
                          <Card key={comment.id} className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/feed/${thread.id}`)}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                <span>{comment.author}</span>
                                <span>·</span>
                                <span>{comment.createdAt}</span>
                              </div>
                              <p className="text-sm text-[#141414] line-clamp-3">{comment.text}</p>
                              <div className="text-[11px] text-gray-500">
                                In thread: <span className="font-semibold text-[#036aff]">{thread.title}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#036aff]" />
              Create New Collection
            </DialogTitle>
            <DialogDescription className="text-base">
              Give it a name, choose visibility, and add tags. Use a template or quick tags to get started faster.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 bg-[#f8fafc] p-4 text-sm text-gray-700 flex items-start gap-3">
                <Info className="h-5 w-5 text-[#036aff] mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold text-[#141414]">Tips for a helpful collection</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Keep the title specific (course + goal).</li>
                    <li>Add 2-4 tags so you and teammates can find it quickly.</li>
                    <li>Public = shareable with classmates; Private = only you.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium mb-1 block">Name *</label>
                <Input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g., Web Dev Final Study Pack"
                  className="border-gray-200 text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium mb-1 block">Description</label>
                <Input
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="What is inside? Who is it for?"
                  className="border-gray-200 text-base h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-base font-medium mb-1 block">Visibility</label>
                <div className="flex gap-1 rounded-full bg-[#f5f5f5] p-1 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setCollectionVisibility("PRIVATE")}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 flex items-center justify-center gap-1.5",
                      collectionVisibility === "PRIVATE"
                        ? "bg-white text-[#141414] shadow-sm"
                        : "text-gray-600"
                    )}
                  >
                    <Lock className="h-4 w-4" />
                    Private
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectionVisibility("PUBLIC")}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 flex items-center justify-center gap-1.5",
                      collectionVisibility === "PUBLIC"
                        ? "bg-white text-[#141414] shadow-sm"
                        : "text-gray-600"
                    )}
                  >
                    <Globe2 className="h-4 w-4" />
                    Public
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium block">Tags</label>
                  <span className="text-xs text-gray-500">Add up to 6</span>
                </div>
                <div className="flex gap-2 mb-1">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tag (course, exam, notes...)"
                    className="border-gray-200 text-base h-11"
                  />
                  <Button type="button" onClick={addTag} variant="outline" className="border-gray-200 px-4">
                    <Tag className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickTagPresets.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!collectionTags.includes(tag) && collectionTags.length < 6) {
                          setCollectionTags([...collectionTags, tag])
                        }
                      }}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:border-[#036aff] hover:text-[#036aff]"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                {collectionTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {collectionTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1.5 border-gray-200 text-sm px-3 py-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-4 space-y-3 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#141414]">Templates</p>
                  <span className="text-xs text-gray-500">1-click fill</span>
                </div>
                <div className="space-y-2">
                  {quickTemplates.map((tpl) => (
                    <button
                      key={tpl.name}
                      type="button"
                      onClick={() => {
                        setCollectionName(tpl.name)
                        setCollectionDescription(tpl.description)
                        setCollectionVisibility(tpl.visibility)
                        setCollectionTags(tpl.tags)
                      }}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left hover:border-[#036aff] hover:bg-[#036aff]/5 transition"
                    >
                      <p className="text-sm font-semibold text-[#141414]">{tpl.name}</p>
                      <p className="text-xs text-gray-500">{tpl.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tpl.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="border-gray-200 text-[11px] px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-[#f8fafc] space-y-3">
                <p className="text-sm font-semibold text-[#141414]">Live preview</p>
                <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-[#141414] truncate">
                      {collectionName.trim() || "Untitled collection"}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2.5 py-1",
                        collectionVisibility === "PUBLIC"
                          ? "border-green-200 text-green-700"
                          : "border-gray-200 text-gray-600"
                      )}
                    >
                      {collectionVisibility === "PUBLIC" ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {collectionDescription.trim() || "Description preview will appear here."}
                  </p>
                  {collectionTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {collectionTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-gray-200 text-xs px-2 py-0.5">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {collectionTags.length === 0 && (
                    <p className="text-xs text-gray-400">Add tags to improve search.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-3 sm:justify-between">
                <Button
                  variant="ghost"
                  className="text-sm font-bold text-[#141414] hover:bg-[#f5f5f5]"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
                  onClick={handleCreateCollection}
                  disabled={loading}
                >
                  Create Collection
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="text-base font-medium mb-2 block">Name *</label>
              <Input
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="border-gray-200 text-base h-11"
              />
            </div>
            <div>
              <label className="text-base font-medium mb-2 block">Description</label>
              <Input
                value={collectionDescription}
                onChange={(e) => setCollectionDescription(e.target.value)}
                className="border-gray-200 text-base h-11"
              />
            </div>
            <div>
              <label className="text-base font-medium mb-2 block">Visibility</label>
              <div className="flex gap-1 rounded-full bg-[#f5f5f5] p-1 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setCollectionVisibility("PRIVATE")}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 flex items-center justify-center gap-1.5",
                    collectionVisibility === "PRIVATE"
                      ? "bg-white text-[#141414] shadow-sm"
                      : "text-gray-600"
                  )}
                >
                  <Lock className="h-4 w-4" />
                  Private
                </button>
                <button
                  type="button"
                  onClick={() => setCollectionVisibility("PUBLIC")}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 flex items-center justify-center gap-1.5",
                    collectionVisibility === "PUBLIC"
                      ? "bg-white text-[#141414] shadow-sm"
                      : "text-gray-600"
                  )}
                >
                  <Globe2 className="h-4 w-4" />
                  Public
                </button>
              </div>
            </div>
            <div>
              <label className="text-base font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                  className="border-gray-200 text-base h-11"
                />
                <Button type="button" onClick={addTag} variant="outline" className="border-gray-200 px-4">
                  <Tag className="h-5 w-5" />
                </Button>
              </div>
              {collectionTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collectionTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1.5 border-gray-200 text-sm px-3 py-1">
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="h-4 w-4" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between gap-3 sm:justify-between">
              <Button
                variant="ghost"
                className="text-sm font-bold text-[#141414] hover:bg-[#f5f5f5]"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
                onClick={handleUpdateCollection}
                disabled={loading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Item to Collection</DialogTitle>
            <DialogDescription className="text-base">
              Add a resource, thread, comment, or external link to your collection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="text-base font-medium mb-2 block">Type *</label>
              <div className="flex gap-1 rounded-full bg-[#f5f5f5] p-1 text-sm font-semibold flex-wrap">
                {(["RESOURCE", "THREAD", "COMMENT", "EXTERNAL"] as CollectionItemType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setItemType(type)}
                    className={cn(
                      "flex-1 min-w-[calc(50%-0.125rem)] rounded-full px-4 py-2.5 flex items-center justify-center gap-2",
                      itemType === type
                        ? "bg-white text-[#141414] shadow-sm"
                        : "text-gray-600"
                    )}
                  >
                    {getItemTypeIcon(type)}
                    <span className="text-sm">{getItemTypeLabel(type)}</span>
                  </button>
                ))}
              </div>
            </div>
            {itemType === "EXTERNAL" ? (
              <div>
                <label className="text-base font-medium mb-2 block">URL *</label>
                <Input
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="border-gray-200 text-base h-11"
                />
              </div>
            ) : itemType === "RESOURCE" ? (
              <div>
                <label className="text-base font-medium mb-2 block">Select Resource *</label>
                <Input
                  value={resourceSearchQuery}
                  onChange={(e) => setResourceSearchQuery(e.target.value)}
                  placeholder="Search resources by title, course code, or description..."
                  className="border-gray-200 text-base h-11 mb-3"
                />
                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                  {filteredResources.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No resources found. Try a different search term.
                    </div>
                  ) : (
                    filteredResources.map((resource) => {
                      const isSaved = alreadySavedResourceIds.has(resource.id)
                      const isSelected = selectedResourceId === resource.id
                      return (
                        <button
                          key={resource.id}
                          type="button"
                          onClick={() => {
                            setSelectedResourceId(resource.id)
                            setResourceSearchQuery(resource.title)
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg border transition-all",
                            isSelected
                              ? "border-[#036aff] bg-[#036aff]/5"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-[#141414] truncate">
                                  {resource.title}
                                </h4>
                                {isSaved && (
                                  <Badge variant="outline" className="border-green-200 text-green-700 text-xs px-2 py-0">
                                    Saved
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mb-1 line-clamp-1">{resource.summary}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{resource.courseCode}</span>
                                <span>·</span>
                                <span>{resource.contributor}</span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 text-[#036aff] shrink-0" />
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-base font-medium mb-2 block">Reference ID *</label>
                <Input
                  value={itemReferenceId}
                  onChange={(e) => setItemReferenceId(e.target.value)}
                  placeholder="Enter the ID of the thread or comment"
                  className="border-gray-200 text-base h-11"
                />
              </div>
            )}
            <div>
              <label className="text-base font-medium mb-2 block">Private Note</label>
              <textarea
                rows={4}
                value={itemPrivateNote}
                onChange={(e) => setItemPrivateNote(e.target.value)}
                placeholder="e.g., Only study Chapter 3 for the midterm"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#036aff]/20"
              />
            </div>
            <div className="flex justify-between gap-3 sm:justify-between">
              <Button
                variant="ghost"
                className="text-sm font-bold text-[#141414] hover:bg-[#f5f5f5]"
                onClick={() => setIsAddItemDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
                onClick={handleAddItem}
                disabled={loading}
              >
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Collection Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" showCloseButton={false}>
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <DialogTitle className="text-2xl font-bold text-[#141414]">
                    {selectedCollection?.name}
                  </DialogTitle>
                  {selectedCollection && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-3 py-1 rounded-full",
                        selectedCollection.visibility === "PUBLIC"
                          ? "border-green-200 text-green-700 bg-green-50"
                          : "border-gray-200 text-gray-600 bg-gray-50"
                      )}
                    >
                      {selectedCollection.visibility === "PUBLIC" ? (
                        <Globe2 className="h-4 w-4 mr-1.5" />
                      ) : (
                        <Lock className="h-4 w-4 mr-1.5" />
                      )}
                      {selectedCollection.visibility === "PUBLIC" ? "Public" : "Private"}
                    </Badge>
                  )}
                  {selectedCollection && user && selectedCollection.owner_id === user.id && (
                    <Badge className="bg-[#036aff]/10 text-[#036aff] text-xs font-semibold px-3 py-1 rounded-full">
                      Owner: You
                    </Badge>
                  )}
                </div>
                {selectedCollection?.description && (
                  <DialogDescription className="text-base text-gray-600 leading-relaxed">
                    {selectedCollection.description}
                  </DialogDescription>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Bookmark className="h-4 w-4" />
                    <span className="font-semibold">
                      {selectedCollection?.collection_items?.length || 0} items
                    </span>
                  </div>
                  {selectedCollection?.collection_items && selectedCollection.collection_items.length > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex flex-wrap gap-1.5 text-xs text-gray-500">
                        {(["RESOURCE", "THREAD", "COMMENT", "EXTERNAL"] as CollectionItemType[])
                          .map((type) => ({
                            type,
                            count: selectedCollection.collection_items!.filter((i) => i.type === type).length,
                          }))
                          .filter((entry) => entry.count > 0)
                          .map((entry) => (
                            <span key={entry.type} className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2.5 py-1">
                              {getItemTypeIcon(entry.type)}
                              <span>
                                {entry.count} {getItemTypeLabel(entry.type).toLowerCase()}
                              </span>
                            </span>
                          ))}
                      </div>
                    </>
                  )}
                  {selectedCollection?.tags && selectedCollection.tags.length > 0 && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCollection.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-gray-200 text-xs px-2 py-0.5 capitalize"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {selectedCollection && user && selectedCollection.owner_id === user.id && (
                <Button
                  className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5 shrink-0"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    openAddItemDialog(selectedCollection)
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {selectedCollection?.collection_items && selectedCollection.collection_items.length > 0 ? (
              <div className="space-y-3">
                {selectedCollection.collection_items.map((item, index) => (
                  <Card
                    key={item.id}
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#f5f5f5]">
                              {getItemTypeIcon(item.type)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-gray-200 text-xs px-3 py-1 font-semibold rounded-full"
                                >
                                  {getItemTypeLabel(item.type)}
                                </Badge>
                                <span className="text-[11px] text-gray-400">
                                  Item {index + 1} of {selectedCollection.collection_items?.length}
                                </span>
                              </div>
                              {item.type === "RESOURCE" && item.reference_id && resourceIndex[item.reference_id] && (
                                <p className="text-sm font-semibold text-[#141414] mt-1 line-clamp-1">
                                  {resourceIndex[item.reference_id].title}
                                </p>
                              )}
                              {item.type === "EXTERNAL" && item.url && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {getExternalHost(item.url)}
                                </p>
                              )}
                            </div>
                          </div>

                          {item.type === "EXTERNAL" && item.url && (
                            <div className="pl-13">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-base text-[#036aff] hover:text-[#036aff]/80 hover:underline break-all font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon className="h-4 w-4 shrink-0" />
                                <span className="break-all">{item.url}</span>
                              </a>
                            </div>
                          )}
                          
                          {item.type === "RESOURCE" && item.reference_id && (
                            <div className="pl-13">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/resource/${item.reference_id}`)
                                }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#036aff]/10 hover:bg-[#036aff]/20 rounded-lg border border-[#036aff]/20 text-[#036aff] font-medium transition-colors cursor-pointer"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="text-sm font-semibold">
                                  {resourceIndex[item.reference_id]?.title || "View resource"}
                                </span>
                              </button>
                            </div>
                          )}
                          
                          {item.type !== "EXTERNAL" && item.type !== "RESOURCE" && item.reference_id && (
                            <div className="pl-13">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-xs font-semibold text-gray-500 uppercase">ID:</span>
                                <span className="text-base text-gray-700 font-mono">{item.reference_id}</span>
                              </div>
                            </div>
                          )}
                          
                          {item.private_note && (
                            <div className="pl-13 mt-3">
                              <div className="p-4 bg-gradient-to-br from-[#f5f5f5] to-[#fafafa] rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1 h-4 bg-[#036aff] rounded-full"></div>
                                  <p className="text-sm font-semibold text-[#141414]">Private Note</p>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed pl-3">
                                  {item.private_note}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {selectedCollection && user && selectedCollection.owner_id === user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 px-3 shrink-0"
                            onClick={() => handleRemoveItem(item)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-4">
                  <Bookmark className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#141414] mb-2">No items yet</h3>
                <p className="text-base text-gray-500 text-center max-w-sm mb-6">
                  This collection is empty. Start adding resources, threads, comments, or external links.
                </p>
                {selectedCollection && user && selectedCollection.owner_id === user.id && (
                  <Button
                    className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      openAddItemDialog(selectedCollection)
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Item
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CollectionPage

