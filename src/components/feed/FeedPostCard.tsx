import { useNavigate } from "react-router-dom"
import { MessageCircle, Heart, Globe2, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { FeedPost } from "@/data/feed"

interface FeedPostCardProps {
  post: FeedPost
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const navigate = useNavigate()
  const isFriendsOnly = post.privacy === "friends"

  const handleOpenThread = () => {
    navigate(`/feed/${post.id}`)
  }

  const snippet =
    post.content.length > 180 ? `${post.content.slice(0, 180).trimEnd()}…` : post.content

  return (
    <Card
      className="border border-gray-200 rounded-xl shadow-sm cursor-pointer transition hover:border-[#036aff33] hover:shadow-md max-w-2xl w-full mx-auto"
      onClick={handleOpenThread}
    >
      <CardContent className="px-3 py-3 md:px-5 md:py-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11">
              <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-base">
                {post.author.initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#141414]">
                  {post.author.name}
                </span>
                {post.author.isFriend && (
                  <span className="rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                    Friend
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{post.createdAt}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  {isFriendsOnly ? (
                    <>
                      <Users className="h-3.5 w-3.5" />
                      Friends only
                    </>
                  ) : (
                    <>
                      <Globe2 className="h-3.5 w-3.5" />
                      Public
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <Badge className="bg-[#036aff0f] text-[#036aff] border-[#036aff26] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {post.threadType === "Q&A" ? "Q&A thread" : "Discussion"}
              </Badge>
              <Badge
                className={cn(
                  "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                  post.status === "OPEN"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-gray-100 text-gray-600 border-gray-200",
                )}
                variant="outline"
              >
                {post.status === "OPEN" ? "Open" : "Closed"}
              </Badge>
          </div>
          {post.eventTag && (
            <Badge
              variant="outline"
                className="border-[#036aff] text-[#036aff] text-[11px] font-semibold px-2 py-0.5 rounded-full"
            >
              {post.eventTag}
            </Badge>
          )}
          </div>
        </div>

        {/* Title + snippet */}
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-[#141414] leading-snug">
            {post.title}
            {post.isEdited && (
              <span className="ml-2 text-xs font-normal text-gray-400">(Edited)</span>
            )}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {snippet}
          </p>
        </div>

        {/* Media grid (small preview) */}
        {post.media.length > 0 && (
          <div
            className={cn(
              "overflow-hidden rounded-lg border border-gray-200 bg-white",
              post.media.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-0.5",
            )}
          >
            {post.media.map((item) => (
              <div
                key={item.id}
                className="relative flex aspect-video items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: item.thumbColor }}
              >
                <span className="z-10">{item.label}</span>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
            ))}
          </div>
        )}

        {/* Footer stats (static icons + counts only) */}
        <div className="flex items-center justify-start gap-4 pt-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 text-gray-400" />
            <span>{post.stats.likes}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
            <span>{post.comments.length}</span>
          </span>
          </div>
        </CardContent>
      </Card>
  )
}


