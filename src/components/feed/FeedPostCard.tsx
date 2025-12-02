import { useState } from "react"
import { MessageCircle, Heart, Globe2, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { FeedPost } from "@/data/feed"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FeedPostCardProps {
  post: FeedPost
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const isFriendsOnly = post.privacy === "friends"
  const [liked, setLiked] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  const likeCount = liked ? post.stats.likes + 1 : post.stats.likes

  return (
    <>
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-sm">
                {post.author.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#141414]">
                  {post.author.name}
                </span>
                {post.author.isFriend && (
                  <span className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    Friend
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                <span>{post.createdAt}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  {isFriendsOnly ? (
                    <>
                      <Users className="h-3 w-3" />
                      Friends only
                    </>
                  ) : (
                    <>
                      <Globe2 className="h-3 w-3" />
                      Public
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          {post.eventTag && (
            <Badge
              variant="outline"
              className="border-[#036aff] text-[#036aff] text-[11px] font-semibold"
            >
              {post.eventTag}
            </Badge>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-[#141414] leading-relaxed">{post.content}</p>

        {/* Media grid */}
        {post.media.length > 0 && (
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-gray-200 bg-white",
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
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const newLiked = !liked
                  setLiked(newLiked)
                  toast.success(newLiked ? "Post liked!" : "Post unliked", {
                    description: newLiked ? "You liked this post" : "You removed your like",
                  })
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold hover:bg-[#f5f5f5]",
                  liked ? "text-red-500" : "text-[#141414]",
                )}
              >
                <Heart className={cn("h-3 w-3", liked && "fill-red-500 text-red-500")} />
                Like
              </button>
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-[#141414] hover:bg-[#f5f5f5]"
              >
                <MessageCircle className="h-3 w-3" />
                Comment
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>
              Discussion from friends on this update. This is mock data only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-72 overflow-y-auto py-1">
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-3 rounded-lg border border-gray-100 bg-[#f5f5f5] px-3 py-2"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[#ffffff] text-[#141414] text-xs font-semibold">
                    {comment.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#141414]">
                      {comment.author}
                    </span>
                    <span className="text-[10px] text-gray-400">{comment.createdAt}</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">{comment.text}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">
                No comments yet. Be the first to start the discussion.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


