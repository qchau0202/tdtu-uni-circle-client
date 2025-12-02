import { useMemo, useState } from "react"
import { ResourceCard } from "@/components/resource/ResourceCard"
import { ResourceFilters } from "@/components/resource/ResourceFilters"
import { resourceItems, resourceCourses, type ResourceItem } from "@/data/resources"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const MaterialRepository = () => {
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

  const filteredResources = useMemo(() => {
    return resources
      .filter((resource) => {
        const matchesSearch =
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.courseCode.includes(searchTerm) ||
          resource.contributor.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCourse = selectedCourse ? resource.courseCode === selectedCourse : true
        const matchesTag = selectedTag ? resource.tags.includes(selectedTag) : true
        return matchesSearch && matchesCourse && matchesTag
      })
      .sort((a, b) => b.votes - a.votes)
  }, [resources, searchTerm, selectedCourse, selectedTag])

  const handleVote = (resourceId: string) => {
    setResources((prev) =>
      prev.map((resource) =>
        resource.id === resourceId ? { ...resource, votes: resource.votes + 1 } : resource,
      ),
    )
  }

  const handleMockUpload = () => {
    if (!uploadTitle) return
    if (resourceType === "url" && !uploadUrl) return
    if (resourceType === "document" && !uploadFile) return

    const matchedCourse = resourceCourses.find((course) => course.code === uploadCourse)
    const newResource: ResourceItem = {
      id: `draft-${Date.now()}`,
      title: uploadTitle,
      summary: uploadDescription || "Draft resource waiting for approval.",
      courseCode: uploadCourse || "503045",
      courseName: matchedCourse?.name ?? "TDTU Course",
      tags: ["lecture-notes"],
      type: resourceType,
      url: resourceType === "url" ? uploadUrl : "#",
      fileName: resourceType === "document" ? uploadFile?.name : undefined,
      contributor: "You",
      uploadedAt: "Just now",
      votes: 0,
    }

    setResources((prev) => [newResource, ...prev])
    setUploadTitle("")
    setUploadUrl("")
    setUploadCourse("")
    setUploadDescription("")
    setUploadFile(null)
    setResourceType("url")
    setIsUploadOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-3xl font-bold text-[#141414]">Resource Sharing</h1>
          <p className="text-sm text-gray-500">Managed by Resource Service</p>
          <p className="text-xs text-gray-500">
            Upload your own lecture notes, summaries, or past papers to help classmates. Resources
            are tagged with TDTU course codes so they are easy to find.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-500 max-w-xs">
            Resource Service prefers shareable URLs. Attachments are converted to previewable links.
          </p>
          <Button
            className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs px-4 py-2"
            onClick={() => setIsUploadOpen(true)}
          >
            Upload resource
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(220px,0.35fr)]">
        <div className="space-y-6">
          <ResourceFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
          />

          <div className="space-y-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} onVote={handleVote} />
            ))}
            {filteredResources.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No resources match your filters yet. Try another course or tag.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Peer review
                </span>
                <span className="rounded-full bg-[#036aff]/10 px-2 py-0.5 text-xs font-semibold text-[#036aff]">
                  Live
                </span>
              </div>
              <p>
                Students upvote helpful notes so quality content rises to the top. Upvotes reset
                every semester.
              </p>
              <div className="rounded-lg bg-[#f5f5f5] px-3 py-2 text-xs text-[#141414]">
                {resources[0]?.title} currently leads with {resources[0]?.votes ?? 0} peer reviews.
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-[#141414]">Search tips</h3>
                <p className="text-xs text-gray-500">
                  Combine course codes with tags such as &ldquo;past-paper&rdquo; or
                  &ldquo;diagram&rdquo; to narrow results quickly.
                </p>
              </div>
              <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                <li>Use a TDTU course code (e.g. 503045) for exact matches.</li>
                <li>Filter by tags when you need specific resource types.</li>
                <li>Sort by peer review (votes) to see trusted material.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share a resource</DialogTitle>
            <DialogDescription>
              Upload links or files for your classmates. Files are stored and converted to secure
              URLs automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Title (e.g. Software Engineering sprint tips)"
              className="border-gray-200"
            />
            <Input
              value={uploadCourse}
              onChange={(e) => setUploadCourse(e.target.value)}
              placeholder="Course code (e.g. 503045)"
              className="border-gray-200"
            />

            <div className="flex gap-2 rounded-full bg-[#f5f5f5] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setResourceType("url")}
                className={cn(
                  "flex-1 rounded-full px-3 py-1",
                  resourceType === "url" ? "bg-white text-[#141414] shadow-sm" : "text-gray-600",
                )}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setResourceType("document")}
                className={cn(
                  "flex-1 rounded-full px-3 py-1",
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
                className="border-gray-200"
              />
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  className="hidden"
                  id="resource-file-input"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                />
                <label htmlFor="resource-file-input" className="cursor-pointer font-semibold text-[#036aff]">
                  {uploadFile ? uploadFile.name : "Choose a file to upload"}
                </label>
                <p>PDF or Office documents preferred.</p>
              </div>
            )}

            <textarea
              rows={3}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Short description or summary"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#036aff]/20"
            />
          </div>

          <DialogFooter className="flex justify-between gap-3 sm:justify-between">
            <Button
              variant="ghost"
              className="text-xs font-bold text-[#141414] hover:bg-[#f5f5f5]"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs px-4 py-2"
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

export default MaterialRepository