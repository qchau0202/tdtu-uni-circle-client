import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Globe2, Heart, MessageCircle, Shield, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { FeedPost } from "@/data/feed"

function loadThreadById(id: string): FeedPost | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const stored = localStorage.getItem("unicircle_feed_posts")
    if (!stored) return undefined
    const parsed = JSON.parse(stored) as FeedPost[]
    return parsed.find((p) => p.id === id)
  } catch (error) {
    console.error("Failed to load thread from localStorage:", error)
    return undefined
  }
}

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const thread = useMemo(() => {
    if (!id) return undefined
    return loadThreadById(id)
  }, [id])

  if (!id || !thread) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="px-0 text-sm text-[#036aff]"
          onClick={() => navigate("/feed")}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to feed
        </Button>
        <Card className="border border-red-100 bg-red-50/70">
          <CardContent className="py-8 text-center space-y-2">
            <p className="text-base font-semibold text-red-700">Thread not found</p>
            <p className="text-sm text-red-600">
              The thread may have been removed, or your test data was not generated yet.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isFriendsOnly = thread.privacy === "friends"
  const isClosed = thread.status === "CLOSED"

  return (
    <div className="space-y-5">
      {/* Back link */}
      <button
        type="button"
        onClick={() => navigate("/feed")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#036aff] hover:text-[#024eba]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Student Feed
      </button>

      {/* Thread content */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-6 space-y-5">
          {/* Header meta */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-base">
                  {thread.author.initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#141414]">
                    {thread.author.name}
                  </span>
                  {thread.author.isFriend && (
                    <span className="rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                      Friend
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{thread.createdAt}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1.5">
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
                  {thread.threadType === "Q&A" ? "Q&A thread" : "Discussion"}
                </Badge>
                <Badge
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    thread.status === "OPEN"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-gray-100 text-gray-600 border-gray-200",
                  )}
                  variant="outline"
                >
                  {thread.status === "OPEN" ? "Open" : "Closed"}
                </Badge>
              </div>
              {thread.eventTag && (
                <Badge
                  variant="outline"
                  className="border-[#036aff] text-[#036aff] text-[11px] font-semibold px-2 py-0.5 rounded-full"
                >
                  {thread.eventTag}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Title + body */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-[#141414] leading-snug">
              {thread.title}
              {thread.isEdited && (
                <span className="ml-2 text-sm font-normal text-gray-400">(Edited)</span>
              )}
            </h1>
            <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">
              {thread.content}
            </p>
          </div>

          {/* Media */}
          {thread.media.length > 0 && (
            <div
              className={cn(
                "overflow-hidden rounded-xl border border-gray-200 bg-white",
                thread.media.length === 1 ? "grid grid-cols-1" : "grid grid-cols-2 gap-0.5",
              )}
            >
              {thread.media.map((item) => (
                <div
                  key={item.id}
                  className="relative flex aspect-video items-center justify-center text-sm font-semibold text-white"
                  style={{ backgroundColor: item.thumbColor }}
                >
                  <span className="z-10">{item.label}</span>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                </div>
              ))}
            </div>
          )}

          {/* Actions summary */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{thread.stats.likes} likes</span>
              <span>{thread.comments.length} comments</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm font-semibold text-[#141414]"
                onClick={() =>
                  toast.success("Mock only", {
                    description: "Thread actions will be wired to the Feed Service later.",
                  })
                }
              >
                <Shield className="mr-1.5 h-4 w-4" />
                Manage thread
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-[#141414]">
              {thread.comments.length} Comments
            </p>
            {isClosed && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                <MessageCircle className="h-3.5 w-3.5" />
                Thread is closed. New comments are disabled.
              </span>
            )}
          </div>

          {!isClosed && (
            <div className="rounded-lg border border-gray-200 bg-[#f9fafb] px-4 py-3 space-y-2">
              <p className="text-xs text-gray-500">
                Commenting is mock-only for now. In the real app this connects to the Feed
                Service.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs font-semibold"
                onClick={() =>
                  toast.info("Mock comment", {
                    description:
                      "Here you would open a full comment composer and persist via Feed Service.",
                  })
                }
              >
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                Add comment
              </Button>
          </div>
          )}

          <div className="space-y-3 pt-1">
            {thread.comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-3 rounded-lg border border-gray-100 bg-[#f5f5f5] px-4 py-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[#ffffff] text-[#141414] text-sm font-semibold">
                    {comment.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#141414]">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-400">{comment.createdAt}</span>
                    {comment.isEdited && (
                      <span className="text-[11px] text-gray-400">(Edited)</span>
                    )}
                    {comment.parentAuthor && (
                      <span className="text-[11px] text-gray-500">
                        Replying to <span className="font-medium">@{comment.parentAuthor}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}

            {thread.comments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">
                No comments yet. Be the first to start the discussion.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


