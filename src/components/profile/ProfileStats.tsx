import { Card, CardContent } from "@/components/ui/card"
import { profileStats } from "@/data/profile"

export function ProfileStats() {
  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-[#141414]">Study impact</h2>
          <p className="text-xs text-gray-500">
            Overview of your sessions, shared resources, and peer feedback.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {profileStats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-lg border border-gray-100 bg-[#f5f5f5] px-3 py-2 text-left"
            >
              <div className="text-base font-bold text-[#141414]">{stat.value}</div>
              <div className="text-[11px] font-semibold text-gray-600">{stat.label}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{stat.helper}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


