import { FeedComposer } from "@/components/feed/FeedComposer"
import { FeedPostCard } from "@/components/feed/FeedPostCard"
import { feedPosts, feedFriends } from "@/data/feed"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function FeedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#141414]">Student Feed</h1>
          <p className="text-sm text-gray-500">Managed by Feed Service</p>
          <p className="text-xs text-gray-500">
            See updates, study wins, and media shared only from students you follow.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(220px,0.3fr)]">
        <div className="space-y-4">
          <FeedComposer />
          <div className="space-y-4">
            {feedPosts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="border border-gray-200 rounded-xl shadow-sm">
            <CardContent className="p-4 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-[#141414]">Study friends</h2>
                <p className="text-xs text-gray-500">See where your friends are focusing.</p>
              </div>
              <div className="space-y-3">
                {feedFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-xs font-semibold">
                          {friend.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-semibold text-[#141414]">{friend.name}</div>
                        <div className="text-[11px] text-gray-500">{friend.studyFocus}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400">{friend.lastActive}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full rounded-full bg-[#f5f5f5] py-2 text-xs font-semibold text-[#141414] hover:bg-[#e9e9e9]"
              >
                View all friends
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


