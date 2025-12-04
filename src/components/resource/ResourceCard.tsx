import { ArrowBigUp, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ResourceItem } from "@/data/resources"

interface ResourceCardProps {
  resource: ResourceItem
  onVote: (resourceId: string) => void
  onSaveToCollection?: (resourceId: string) => void
  isSaved?: boolean
}

export function ResourceCard({ resource, onVote, onSaveToCollection, isSaved = false }: ResourceCardProps) {
  const navigate = useNavigate()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    const target = e.target as HTMLElement
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest('[role="button"]')
    ) {
      return
    }
    navigate(`/resource/${resource.id}`)
  }

  return (
    <Card 
      className="border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className="text-lg font-semibold text-[#141414] hover:text-[#036aff] break-words cursor-pointer"
              >
                {resource.title}
              </h3>
              <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </div>
            <p className="text-base text-gray-600 mt-1 leading-relaxed">{resource.summary}</p>
        {resource.fileName && (
              <p className="text-sm text-gray-500 mt-2">Attached file: {resource.fileName}</p>
        )}
          </div>
          <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#141414] hover:bg-[#f5f5f5]"
            onClick={() => onVote(resource.id)}
          >
              <ArrowBigUp className="h-5 w-5" />
            {resource.votes}
          </Button>
            {onSaveToCollection && (
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isSaved
                    ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    : "border-gray-200 text-[#141414] hover:bg-[#f5f5f5]"
                )}
                onClick={() => onSaveToCollection(resource.id)}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-5 w-5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="h-5 w-5" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <span className="font-semibold text-[#141414]">
            {resource.courseCode} &middot; {resource.courseName}
          </span>
          <span>·</span>
          <span>Added by {resource.contributor}</span>
          <span>·</span>
          <span>{resource.uploadedAt}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-[#036aff]/10 text-[#036aff] text-xs font-semibold px-2.5 py-1">
            {resource.courseCode}
          </Badge>
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-gray-200 text-xs capitalize px-2.5 py-1"
            >
              {tag.replace("-", " ")}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge
              variant="outline"
              className="border-dashed border-gray-200 text-xs px-2.5 py-1 text-gray-500"
            >
              +{resource.tags.length - 3} more
            </Badge>
          )}
          <Badge className="bg-[#036aff]/10 text-[#036aff] text-xs font-semibold capitalize px-2.5 py-1 ml-auto">
            {resource.type === "url" ? "link" : "document"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}


