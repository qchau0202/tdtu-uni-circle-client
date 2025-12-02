import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { profileInfo } from "@/data/profile"

export function ProfileOverview() {
  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage alt={profileInfo.name} />
            <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-lg font-semibold">
              {profileInfo.initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#141414]">{profileInfo.name}</h1>
              <Badge className="bg-[#036aff]/10 text-[#036aff] border-none text-[11px] font-semibold">
                {profileInfo.major}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{profileInfo.email}</p>
            <p className="text-xs text-gray-500">Year {profileInfo.year}</p>
            <p className="mt-2 text-sm text-gray-600 max-w-xl">{profileInfo.bio}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
            {profileInfo.focusAreas.map((area) => (
              <Badge
                key={area}
                variant="outline"
                className="border-gray-200 text-[11px] font-medium"
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


