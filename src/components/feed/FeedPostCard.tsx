import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle, Heart, Globe2, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { FeedPost } from "@/data/feed"

interface FeedPostCardProps {
  post: FeedPost
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const navigate = useNavigate()
  const isFriendsOnly = post.privacy === "friends"
  const [liked, setLiked] = useState(false)

  const likeCount = liked ? post.stats.likes + 1 : post.stats.likes

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

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{likeCount} likes</span>
              <span>{post.comments.length} comments</span>
            </div>
          <div className="flex items-center gap-2">
              <button
                type="button"
              onClick={(e) => {
                e.stopPropagation()
                  const newLiked = !liked
                  setLiked(newLiked)
                toast.success(newLiked ? "Thread liked!" : "Like removed", {
                  description: newLiked
                    ? "You liked this thread"
                    : "You removed your like from this thread",
                  })
                }}
                className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold hover:bg-[#f5f5f5]",
                  liked ? "text-red-500" : "text-[#141414]",
                )}
              >
              <Heart className={cn("h-3.5 w-3.5", liked && "fill-red-500 text-red-500")} />
                Like
              </button>
              <button
                type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenThread()
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#141414] hover:bg-[#f5f5f5]"
              >
              <MessageCircle className="h-3.5 w-3.5" />
              View thread
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
  )
}


