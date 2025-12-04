import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { emptyProfileInfo, type ProfileInfo, type SocialLink } from "@/data/profile"
import { useAuth } from "@/contexts/AuthContext"
import { getProfileById, type BackendProfile } from "@/services/profile/profileService"
import { Facebook, Instagram, Linkedin, Github, User, Mail, Phone, Calendar, UserCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "facebook":
      return <Facebook className="h-4 w-4" />
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "linkedin":
      return <Linkedin className="h-4 w-4" />
    case "github":
      return <Github className="h-4 w-4" />
    case "unicircle":
      return <UserCircle className="h-4 w-4" />
    default:
      return <User className="h-4 w-4" />
  }
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "None"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function ProfileOverview() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileInfo>(emptyProfileInfo)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getProfileById(user.id)
      .then((backend: BackendProfile) => {
        const socialLinks: SocialLink[] = Array.isArray(backend.social_links)
          ? backend.social_links
          : []

        setProfile({
          id: backend.id,
          studentId: backend.student_id || user.studentId || "",
          displayName: backend.display_name || user.name || "",
          dob: backend.dob || "",
          phoneNumber: backend.phone_number || "",
          faculty: backend.faculty || user.facultyCode || "",
          bio: backend.bio || "",
          academicYear: backend.academic_year || user.academicYear || "",
          avatarUrl: backend.avatar_url || user.avatar || "",
          socialLinks,
          updatedAt: backend.updated_at || "",
          email: user.email,
        })
      })
      .catch((err) => {
        console.error("Failed to load profile:", err)
        // Fallback to basic auth user info if profile API fails
        if (user) {
          setProfile({
            ...emptyProfileInfo,
            id: user.id,
            studentId: user.studentId,
            displayName: user.name,
            academicYear: user.academicYear || "",
            faculty: user.facultyCode || "",
            email: user.email,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  const initials = user?.initials || profile.displayName.charAt(0).toUpperCase() || "U"
  const avatarSrc = profile.avatarUrl || user?.avatar
  const displayName = profile.displayName || user?.name || "None"
  const studentId = profile.studentId || user?.studentId || "None"
  const faculty = profile.faculty || "None"
  const academicYear = profile.academicYear || "None"
  const dob = profile.dob ? formatDate(profile.dob) : "None"
  const phoneNumber = profile.phoneNumber || "None"
  const email = profile.email || user?.email || "None"
  const bio = profile.bio || "None"

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-[#141414]">
                    {loading ? "Loading profile..." : displayName}
                  </h1>
                  {faculty !== "None" && (
                    <Badge className="bg-[#036aff]/10 text-[#036aff] border-none text-sm font-semibold px-3 py-1">
                      {faculty}
                  </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-base text-gray-600">
                  <span>Student ID: {studentId}</span>
                  <span>·</span>
                  <span>Academic year: {academicYear}</span>
                </div>
              </div>
              <p className="text-base text-gray-600 max-w-2xl leading-relaxed">
                {bio}
              </p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Date of Birth */}
            <div className="flex items-start gap-3">
              <Calendar className="h-6 w-6 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Date of Birth
                </div>
                <div className="text-base font-semibold text-[#141414] mt-1">
                  {dob}
                </div>
              </div>
            </div>

            {/* Academic Year */}
            <div className="flex items-start gap-3">
              <UserCircle className="h-6 w-6 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Academic Year
                </div>
                <div className="text-base font-semibold text-[#141414] mt-1">
                  {academicYear}
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <Phone className="h-6 w-6 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Phone Number
                  </div>
                </div>
                <div className="text-base font-semibold text-[#141414] mt-1">
                  {phoneNumber || "None"}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </div>
                </div>
                <div className="text-base font-semibold text-[#141414] mt-1">
                  {email}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {profile.socialLinks.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Social Links
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.socialLinks.map((link) => {
                  const icon = getSocialIcon(link.platform)
                  const className = cn(
                    "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#141414] hover:bg-[#f5f5f5] transition-colors"
                  )

                  if (link.platform === "unicircle") {
                    return (
                      <Link key={link.platform} to={link.url} className={className}>
                        {icon}
                        {link.label}
                      </Link>
                    )
                  }

                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {icon}
                      {link.label}
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}



