import { useState } from "react"
import { Image, Video, Globe2, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type ComposerPrivacy = "public" | "friends"

export function FeedComposer() {
  const [privacy, setPrivacy] = useState<ComposerPrivacy>("friends")
  const [content, setContent] = useState("")

  const handlePost = () => {
    if (!content.trim()) {
      toast.error("Post cannot be empty", {
        description: "Please write something before posting",
      })
      return
    }
    toast.success("Post published!", {
      description: `Your post has been shared ${privacy === "public" ? "publicly" : "with friends"}`,
    })
    setContent("")
  }

  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-sm">
              QC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#036aff]/20"
              placeholder="Share what you learned or a study moment from an event you attended..."
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs font-bold text-[#141414] hover:bg-[#f5f5f5]"
                >
                  <Image className="h-4 w-4 mr-1" />
                  Add photos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs font-bold text-[#141414] hover:bg-[#f5f5f5]"
                >
                  <Video className="h-4 w-4 mr-1" />
                  Add video
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-full bg-[#f5f5f5] p-0.5">
                  <button
                    type="button"
                    onClick={() => setPrivacy("public")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold",
                      privacy === "public"
                        ? "bg-white text-[#141414] shadow-sm"
                        : "text-gray-600 hover:text-[#141414]",
                    )}
                  >
                    <Globe2 className="h-3 w-3" />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy("friends")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold",
                      privacy === "friends"
                        ? "bg-white text-[#141414] shadow-sm"
                        : "text-gray-600 hover:text-[#141414]",
                    )}
                  >
                    <Users className="h-3 w-3" />
                    Friends only
                  </button>
                </div>
                <Button
                  onClick={handlePost}
                  className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs px-4 py-2"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


