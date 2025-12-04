import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowBigUp,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Link as LinkIcon,
  FileText,
  User,
  CalendarClock,
  GraduationCap,
  Tag as TagIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import type { ResourceItem } from "@/data/resources"
import {
  getUserCollections,
  createCollection,
  addItemToCollection,
  type Collection,
} from "@/services/collection/localCollectionService"

const ResourceDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resource, setResource] = useState<ResourceItem | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    try {
      const stored = localStorage.getItem("unicircle_resources")
      const list: ResourceItem[] = stored ? JSON.parse(stored) : []
      const foundResource = list.find((r) => r.id === id)
      setResource(foundResource || null)
    } catch (error) {
      console.error("Failed to load resource detail:", error)
      setResource(null)
    }
  }, [id])

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

  const getOrCreateMainRepository = (): Collection => {
    if (!user) throw new Error("User not authenticated")
    const mainRepo = collections.find((c) => c.name === "Main Repository")
    if (mainRepo) return mainRepo

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

  const handleSaveToCollection = () => {
    if (!user) {
      toast.error("Please log in to save resources")
      return
    }
    setIsSaveDialogOpen(true)
  }

  const handleSaveResource = (collectionId: string | null) => {
    if (!user || !resource) return

    try {
      setLoading(true)
      let targetCollectionId = collectionId

      if (!targetCollectionId) {
        const mainRepo = getOrCreateMainRepository()
        targetCollectionId = mainRepo.id
      }

      addItemToCollection(targetCollectionId, user.id, {
        type: "RESOURCE",
        reference_id: resource.id,
      })

      const updatedCollections = getUserCollections(user.id)
      setCollections(updatedCollections)

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

  const handleVote = () => {
    if (!resource) return
    toast.success("Upvoted!", {
      description: `You upvoted "${resource.title}"`,
    })
  }

  if (!resource) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#141414] mb-2">Resource not found</h2>
          <p className="text-base text-gray-500 mb-4">The resource you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/resource")} className="bg-[#036aff] text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    )
  }

  const isSaved = savedResourceIds.has(resource.id)
  const isPdf =
    resource.type === "document" &&
    (resource.fileName?.toLowerCase().endsWith(".pdf") ||
      (typeof resource.url === "string" && resource.url.toLowerCase().includes(".pdf")) ||
      (typeof resource.url === "string" && resource.url.startsWith("blob:")))

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(resource.url)
      toast.success("Link copied")
    }
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb + primary actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/resource")}
          className="text-[#141414] hover:bg-[#f5f5f5] px-0"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Resources
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#141414] hover:bg-[#f5f5f5]"
            onClick={handleVote}
          >
            <ArrowBigUp className="h-5 w-5" />
            {resource.votes}
          </Button>
          {user && (
            <Button
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                isSaved
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-[#036aff] bg-[#036aff] text-white hover:bg-[#036aff]/90"
              )}
              onClick={handleSaveToCollection}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-5 w-5" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-5 w-5" />
                  Save to Collection
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main resource card with title, metadata, and tags */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="px-5 py-5 space-y-5">
          {/* Title and type badge */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-[#141414]">{resource.title}</h1>
            <Badge className="bg-[#036aff]/10 text-[#036aff] text-xs font-semibold capitalize px-2.5 py-1">
              {resource.type === "url" ? "Document link" : "Uploaded document"}
            </Badge>
          </div>
          
          {/* Summary */}
          <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            {resource.summary}
          </p>

          {/* Resource metadata */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Course",
                value: `${resource.courseCode} · ${resource.courseName}`,
                icon: GraduationCap,
              },
              {
                label: "Contributor",
                value: resource.contributor,
                icon: User,
              },
              {
                label: "Uploaded",
                value: resource.uploadedAt,
                icon: CalendarClock,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-[#f8f9fb] px-3 py-2.5">
                <item.icon className="h-5 w-5 text-[#036aff] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">{item.label}</p>
                  <p className="text-sm text-[#141414] font-semibold truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tags & topics */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <TagIcon className="h-5 w-5 text-[#036aff]" />
              <h2 className="text-sm font-semibold text-[#141414] uppercase tracking-wide">
                Tags & topics
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="border-gray-200 text-sm capitalize px-3 py-1.5">
                  {tag.replace("-", " ")}
                </Badge>
              ))}
              <Badge className="bg-[#036aff]/10 text-[#036aff] text-sm font-semibold capitalize px-3 py-1.5">
                {resource.type === "url" ? "Link" : "Document"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links & attachments */}
      <Card className="border border-gray-200 rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#141414] uppercase tracking-wide">
            Links & attachments
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-100 bg-white p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase">
                <LinkIcon className="h-4 w-4 text-[#036aff]" />
                Resource link
              </div>
              <p className="text-sm text-[#141414] break-all">{resource.url}</p>
              <div className="flex gap-2">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#036aff] hover:underline"
                >
                  Open link
                </a>
                <span className="text-gray-300">•</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-xs font-semibold text-gray-500 hover:text-[#036aff]"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase">
                  <FileText className="h-4 w-4 text-[#036aff]" />
                  <span>File attachment</span>
                </div>
                {isPdf && (
                  <span className="text-[11px] text-gray-400">
                    Click preview to open PDF
                  </span>
                )}
              </div>
              {resource.fileName ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#141414]">{resource.fileName}</p>
                      <p className="text-xs text-gray-500">Available for download</p>
                    </div>
                    <Badge variant="outline" className="border-gray-200 text-xs">
                      Document
                    </Badge>
                  </div>
                  {isPdf && (
                    <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden bg-[#f5f5f5]">
                      <iframe
                        src={resource.url}
                        title={resource.title}
                        className="w-full h-[420px] bg-white"
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">No attached file</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ResourceDetailPage

