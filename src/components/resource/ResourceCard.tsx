import { ArrowBigUp, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ResourceItem } from "@/data/resources"

interface ResourceCardProps {
  resource: ResourceItem
  onVote: (resourceId: string) => void
}

export function ResourceCard({ resource, onVote }: ResourceCardProps) {
  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="text-base font-semibold text-[#141414] hover:text-[#036aff]"
              >
                {resource.title}
              </a>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
        <p className="text-sm text-gray-600 mt-1">{resource.summary}</p>
        {resource.fileName && (
          <p className="text-xs text-gray-500">Attached file: {resource.fileName}</p>
        )}
          </div>
          <Button
            variant="ghost"
            className="flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-[#141414] hover:bg-[#f5f5f5]"
            onClick={() => onVote(resource.id)}
          >
            <ArrowBigUp className="h-4 w-4" />
            {resource.votes}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="font-semibold text-[#141414]">
            {resource.courseCode} &middot; {resource.courseName}
          </span>
          <span>·</span>
          <span>Added by {resource.contributor}</span>
          <span>·</span>
          <span>{resource.uploadedAt}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-gray-200 text-xs capitalize">
              {tag.replace("-", " ")}
            </Badge>
          ))}
          <Badge className="bg-[#036aff]/10 text-[#036aff] text-xs font-semibold capitalize">
            {resource.type === "url" ? "link" : "document"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}


