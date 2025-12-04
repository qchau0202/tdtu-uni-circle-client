import { useMemo, useState, useEffect } from "react"
import { ResourceCard } from "@/components/resource/ResourceCard"
import { ResourceFilters } from "@/components/resource/ResourceFilters"
import { resourceItems, resourceCourses, type ResourceItem } from "@/data/resources"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { feedFriends } from "@/data/feed"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getUserCollections,
  createCollection,
  addItemToCollection,
  type Collection,
} from "@/services/collection/localCollectionService"

type ResourceScope = "all" | "following" | "mine"

const ResourcePage = () => {
  const { user } = useAuth()
  const [resources, setResources] = useState(resourceItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadUrl, setUploadUrl] = useState("")
  const [uploadCourse, setUploadCourse] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [resourceType, setResourceType] = useState<"url" | "document">("url")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<ResourceScope>("all")

  // Load collections on mount
  useEffect(() => {
    if (user) {
      loadCollections()
    }
  }, [user])

  const loadCollections = () => {
    if (!user) return
    try {
      const data = getUserCollections(user.id)
      setCollections(data)
      // Check which resources are already saved
      const savedIds = new Set<string>()
      data.forEach((collection) => {
        collection.collection_items?.forEach((item) => {
          if (item.type === "RESOURCE" && item.reference_id) {
            savedIds.add(item.reference_id)
          }
        })
      })
      setSavedResourceIds(savedIds)
    } catch (error) {
      console.error("Failed to load collections:", error)
    }
  }

  // Get or create main repository collection
  const getOrCreateMainRepository = (): Collection => {
    if (!user) throw new Error("User not authenticated")
    
    // Check if main repository exists
    const mainRepo = collections.find((c) => c.name === "Main Repository")
    if (mainRepo) return mainRepo

    // Create main repository
    const newCollection = createCollection({
      name: "Main Repository",
      description: "Default collection for saved resources",
      visibility: "PRIVATE",
      tags: [],
      owner_id: user.id,
    })
    setCollections([newCollection, ...collections])
    return newCollection
  }

  const handleSaveToCollection = (resourceId: string) => {
    if (!user) {
      toast.error("Please log in to save resources")
      return
    }
    setSelectedResourceId(resourceId)
    setIsSaveDialogOpen(true)
  }

  const handleSaveResource = (collectionId: string | null) => {
    if (!user || !selectedResourceId) return

    try {
      setLoading(true)
      let targetCollectionId = collectionId

      // If no collection selected, use or create main repository
      if (!targetCollectionId) {
        const mainRepo = getOrCreateMainRepository()
        targetCollectionId = mainRepo.id
      }

      // Add resource to collection
      addItemToCollection(targetCollectionId, user.id, {
        type: "RESOURCE",
        reference_id: selectedResourceId,
      })

      // Reload collections to get updated data
      const updatedCollections = getUserCollections(user.id)
      setCollections(updatedCollections)
      
      // Check which resources are already saved
      const savedIds = new Set<string>()
      updatedCollections.forEach((collection) => {
        collection.collection_items?.forEach((item) => {
          if (item.type === "RESOURCE" && item.reference_id) {
            savedIds.add(item.reference_id)
          }
        })
      })
      setSavedResourceIds(savedIds)
      
      setIsSaveDialogOpen(false)
      const collectionName = updatedCollections.find((c) => c.id === targetCollectionId)?.name || "Main Repository"
      setSelectedResourceId(null)
      
      toast.success("Resource saved!", {
        description: `Saved to "${collectionName}"`,
      })
    } catch (error) {
      console.error("Save resource error:", error)
      toast.error("Failed to save resource", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const friendNames = useMemo(() => new Set(feedFriends.map((f) => f.name)), [])

  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        const isOwner =
          !!user && (resource.contributor === "You" || resource.contributor === user.name)
        const isFriend = !isOwner && friendNames.has(resource.contributor)

        const matchesScope =
          scope === "all"
            ? true
            : scope === "mine"
            ? isOwner
            : isFriend

        if (!matchesScope) return false

        const matchesSearch =
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.courseCode.includes(searchTerm) ||
          resource.contributor.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCourse = selectedCourse ? resource.courseCode === selectedCourse : true
        const matchesTag = selectedTag ? resource.tags.includes(selectedTag) : true
        return matchesSearch && matchesCourse && matchesTag
      })
      .sort((a, b) => b.votes - a.votes)
  }, [resources, searchTerm, selectedCourse, selectedTag, scope, user, friendNames])

  const handleVote = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId)
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId ? { ...resource, votes: resource.votes + 1 } : resource,
      ),
    )
    toast.success("Upvoted!", {
      description: `You upvoted "${resource?.title}"`,
    })
  }

  const handleMockUpload = () => {
    if (!uploadTitle) {
      toast.error("Title required", {
        description: "Please provide a title for your resource",
      })
      return
    }
    if (resourceType === "url" && !uploadUrl) {
      toast.error("URL required", {
        description: "Please provide a URL for your resource",
      })
      return
    }
    if (resourceType === "document" && !uploadFile) {
      toast.error("File required", {
        description: "Please select a file to upload",
      })
      return
    }

    const matchedCourse = resourceCourses.find((course) => course.code === uploadCourse)

    // For this frontend-only demo, we create a temporary blob URL for documents
    // so they can be previewed like remote PDFs. This URL may not survive a full reload.
    const documentUrl =
      resourceType === "document" && uploadFile ? URL.createObjectURL(uploadFile) : undefined

    const newResource: ResourceItem = {
      id: `draft-${Date.now()}`,
      title: uploadTitle,
      summary: uploadDescription || "Draft resource waiting for approval.",
      courseCode: uploadCourse || "503045",
      courseName: matchedCourse?.name ?? "TDTU Course",
      tags: ["lecture-notes"],
      type: resourceType,
      url: resourceType === "url" ? uploadUrl : documentUrl || "#",
      fileName: resourceType === "document" ? uploadFile?.name : undefined,
      contributor: "You",
      uploadedAt: "Just now",
      votes: 0,
    }

    setResources((prev) => {
      const updated = [newResource, ...prev]
      try {
        localStorage.setItem("unicircle_resources", JSON.stringify(updated))
      } catch (error) {
        console.error("Failed to persist resources to localStorage:", error)
      }
      return updated
    })
    setUploadTitle("")
    setUploadUrl("")
    setUploadCourse("")
    setUploadDescription("")
    setUploadFile(null)
    setResourceType("url")
    setIsUploadOpen(false)
    toast.success("Resource uploaded!", {
      description: `"${uploadTitle}" has been shared with your classmates`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(220px,0.35fr)]">
        <div className="space-y-6">
          <Tabs value={scope} onValueChange={(v) => setScope(v as ResourceScope)}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList className="bg-white border border-gray-200 p-1 h-auto">
                <TabsTrigger
                  value="all"
                  className={cn(
                    "px-4 py-2 rounded-md font-bold text-sm",
                    scope === "all"
                      ? "bg-[#036aff] text-white"
                      : "text-gray-600 hover:text-[#141414]"
                  )}
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className={cn(
                    "px-4 py-2 rounded-md font-bold text-sm",
                    scope === "following"
                      ? "bg-[#036aff] text-white"
                      : "text-gray-600 hover:text-[#141414]"
                  )}
                >
                  Following
                </TabsTrigger>
                <TabsTrigger
                  value="mine"
                  className={cn(
                    "px-4 py-2 rounded-md font-bold text-sm",
                    scope === "mine"
                      ? "bg-[#036aff] text-white"
                      : "text-gray-600 hover:text-[#141414]"
                  )}
                >
                  My resources
                </TabsTrigger>
              </TabsList>
          <Button
                className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
            onClick={() => setIsUploadOpen(true)}
          >
            Upload resource
          </Button>
      </div>

            <TabsContent value={scope} className="space-y-6 mt-4">
          <ResourceFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
          />

              <div className="space-y-4">
            {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onVote={handleVote}
                    onSaveToCollection={handleSaveToCollection}
                    isSaved={savedResourceIds.has(resource.id)}
                  />
            ))}
            {filteredResources.length === 0 && (
                  <p className="text-base text-gray-500 text-center py-12">
                    No resources match your filters yet. Try another course, tag, or scope.
              </p>
            )}
          </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-4 text-base text-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Peer review
                </span>
                <span className="rounded-full bg-[#036aff]/10 px-3 py-1 text-sm font-semibold text-[#036aff]">
                  Live
                </span>
              </div>
              <p className="leading-relaxed">
                Students upvote helpful notes so quality content rises to the top. Upvotes reset
                every semester.
              </p>
              <div className="rounded-lg bg-[#f5f5f5] px-4 py-3 text-sm text-[#141414]">
                {resources[0]?.title} currently leads with {resources[0]?.votes ?? 0} peer reviews.
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-[#141414] mb-2">Search tips</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Combine course codes with tags such as &ldquo;past-paper&rdquo; or
                  &ldquo;diagram&rdquo; to narrow results quickly.
                </p>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>Use a TDTU course code (e.g. 503045) for exact matches.</li>
                <li>Filter by tags when you need specific resource types.</li>
                <li>Sort by peer review (votes) to see trusted material.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Save to Collection Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Save to Collection</DialogTitle>
            <DialogDescription className="text-base">
              Choose a collection to save this resource to, or save to your Main Repository.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left h-auto py-4 px-4 border-2",
                  "hover:bg-[#f5f5f5]"
                )}
                onClick={() => handleSaveResource(null)}
                disabled={loading}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-base font-semibold text-[#141414]">Main Repository</span>
                  <span className="text-sm text-gray-500">
                    {collections.find((c) => c.name === "Main Repository")
                      ? "Default collection for saved resources"
                      : "Will be created automatically"}
                  </span>
                </div>
              </Button>
            </div>

            {collections.filter((c) => c.name !== "Main Repository").length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">Your Collections</p>
                {collections
                  .filter((c) => c.name !== "Main Repository")
                  .map((collection) => (
                    <Button
                      key={collection.id}
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left h-auto py-4 px-4",
                        "hover:bg-[#f5f5f5]"
                      )}
                      onClick={() => handleSaveResource(collection.id)}
                      disabled={loading}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-base font-semibold text-[#141414]">
                          {collection.name}
                        </span>
                        {collection.description && (
                          <span className="text-sm text-gray-500">{collection.description}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {collection.collection_items?.length || 0} items
                        </span>
                      </div>
                    </Button>
                  ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between gap-3 sm:justify-between">
            <Button
              variant="ghost"
              className="text-sm font-bold text-[#141414] hover:bg-[#f5f5f5]"
              onClick={() => {
                setIsSaveDialogOpen(false)
                setSelectedResourceId(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Share a resource</DialogTitle>
            <DialogDescription className="text-base">
              Upload links or files for your classmates. Files are stored and converted to secure
              URLs automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Title (e.g. Software Engineering sprint tips)"
              className="border-gray-200 text-base h-11"
            />
            <Input
              value={uploadCourse}
              onChange={(e) => setUploadCourse(e.target.value)}
              placeholder="Course code (e.g. 503045)"
              className="border-gray-200 text-base h-11"
            />

            <div className="flex gap-2 rounded-full bg-[#f5f5f5] p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setResourceType("url")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2",
                  resourceType === "url" ? "bg-white text-[#141414] shadow-sm" : "text-gray-600",
                )}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setResourceType("document")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2",
                  resourceType === "document" ? "bg-white text-[#141414] shadow-sm" : "text-gray-600",
                )}
              >
                Document
              </button>
            </div>

            {resourceType === "url" ? (
              <Input
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="Resource URL"
                className="border-gray-200 text-base h-11"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                  id="resource-file-input"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
                <label htmlFor="resource-file-input" className="cursor-pointer font-semibold text-[#036aff] text-base">
                  {uploadFile ? uploadFile.name : "Choose a file to upload"}
                </label>
                <p className="mt-2">PDF or Office documents preferred.</p>
              </div>
            )}

            <textarea
              rows={4}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Short description or summary"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#036aff]/20"
            />
          </div>

          <DialogFooter className="flex justify-between gap-3 sm:justify-between">
            <Button
              variant="ghost"
              className="text-sm font-bold text-[#141414] hover:bg-[#f5f5f5]"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
              onClick={handleMockUpload}
            >
              Share resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ResourcePage

