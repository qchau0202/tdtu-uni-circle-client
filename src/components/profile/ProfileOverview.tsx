import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { profileInfo, academicYearToKxx } from "@/data/profile"
import {
  Facebook,
  Instagram,
  Linkedin,
  Github,
  User,
  Lock,
  Mail,
  Phone,
  Calendar,
  UserCircle,
} from "lucide-react"
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
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function ProfileOverview() {
  const kxxYear = academicYearToKxx(profileInfo.academicYear)

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileInfo.avatar} alt={profileInfo.name} />
              <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-2xl font-semibold">
                {profileInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#141414]">{profileInfo.name}</h1>
                  <Badge className="bg-[#036aff]/10 text-[#036aff] border-none text-xs font-semibold">
                    {profileInfo.major}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="font-semibold">@{profileInfo.username}</span>
                  <span>·</span>
                  <span>Student ID: {profileInfo.studentId}</span>
                  <span>·</span>
                  <span>Year {kxxYear}</span>
                </div>
              </div>
              {profileInfo.bio && (
                <p className="text-sm text-gray-600 max-w-2xl">{profileInfo.bio}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {profileInfo.focusAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="outline"
                    className="border-gray-200 text-xs font-medium"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Date of Birth */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date of Birth
                </div>
                <div className="text-sm font-semibold text-[#141414] mt-0.5">
                  {formatDate(profileInfo.dateOfBirth)}
                </div>
              </div>
            </div>

            {/* Academic Year */}
            <div className="flex items-start gap-3">
              <UserCircle className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Academic Year
                </div>
                <div className="text-sm font-semibold text-[#141414] mt-0.5">
                  {profileInfo.academicYear} ({kxxYear})
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Phone Number
                  </div>
                  {!profileInfo.privacy.phoneVisible && (
                    <Lock className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                <div className="text-sm font-semibold text-[#141414] mt-0.5">
                  {profileInfo.privacy.phoneVisible ? (
                    profileInfo.phoneNumber
                  ) : (
                    <span className="text-gray-400 italic">Hidden (shared in Chat only)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email
                  </div>
                  {!profileInfo.privacy.emailVisible && (
                    <Lock className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                <div className="text-sm font-semibold text-[#141414] mt-0.5">
                  {profileInfo.privacy.emailVisible ? (
                    profileInfo.email
                  ) : (
                    <span className="text-gray-400 italic">Hidden (shared in Chat only)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {profileInfo.socialLinks.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Social Links
              </div>
              <div className="flex flex-wrap gap-2">
                {profileInfo.socialLinks.map((link) => {
                  const icon = getSocialIcon(link.platform)
                  const className = cn(
                    "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#141414] hover:bg-[#f5f5f5] transition-colors"
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


