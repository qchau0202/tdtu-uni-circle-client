import { ProfileOverview } from "@/components/profile/ProfileOverview"
import { ProfileStats } from "@/components/profile/ProfileStats"
import { ProfileActivityList } from "@/components/profile/ProfileActivityList"

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <ProfileOverview />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.65fr)_minmax(220px,0.35fr)]">
        <div className="space-y-4">
          <ProfileActivityList />
        </div>
        <div className="space-y-4">
          <ProfileStats />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage