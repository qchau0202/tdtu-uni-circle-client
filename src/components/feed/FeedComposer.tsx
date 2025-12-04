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
        description: "Please write a question or discussion before posting",
      })
      return
    }
    toast.success("Post published!", {
      description: `Your thread has been shared ${privacy === "public" ? "publicly" : "with friends"}`,
    })
    setContent("")
  }

  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm max-w-2xl w-full mx-auto">
      <CardContent className="px-3 py-3 md:px-5 md:py-4 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-base">
              QC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#036aff]/20"
              placeholder="Ask a question about your course or share a study thread"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5]"
                >
                  <Image className="h-4 w-4 mr-1.5" />
                  Add photos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-sm font-bold text-[#141414] hover:bg-[#f5f5f5]"
                >
                  <Video className="h-4 w-4 mr-1.5" />
                  Add video
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-full bg-[#f5f5f5] p-1">
                  <button
                    type="button"
                    onClick={() => setPrivacy("public")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
                      privacy === "public"
                        ? "bg-white text-[#141414] shadow-sm"
                        : "text-gray-600 hover:text-[#141414]",
                    )}
                  >
                    <Globe2 className="h-4 w-4" />
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrivacy("friends")}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
                      privacy === "friends"
                        ? "bg-white text-[#141414] shadow-sm"
                        : "text-gray-600 hover:text-[#141414]",
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Friends only
                  </button>
                </div>
                <Button
                  onClick={handlePost}
                  className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm px-5 py-2.5"
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


