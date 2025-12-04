import { FeedComposer } from "@/components/feed/FeedComposer"
import { FeedPostCard } from "@/components/feed/FeedPostCard"
import { feedPosts } from "@/data/feed"

export function FeedPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FeedComposer />
        <div className="space-y-4">
          {feedPosts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}


