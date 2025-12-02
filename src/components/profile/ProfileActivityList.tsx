import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { profileActivities } from "@/data/profile"

export function ProfileActivityList() {
  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#141414]">Recent activity</h2>
            <p className="text-xs text-gray-500">
              A quick view of your latest sessions, resources, and posts.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {profileActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-[#f5f5f5] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Badge className="bg-[#036aff]/10 text-[#036aff] border-none text-[10px] font-semibold capitalize">
                  {activity.type.replace("-", " ")}
                </Badge>
                <span className="text-[11px] text-gray-400">{activity.date}</span>
              </div>
              <div className="text-sm font-semibold text-[#141414]">{activity.title}</div>
              <div className="text-xs text-gray-600">{activity.meta}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


