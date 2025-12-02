import { useState, useEffect } from "react"
import {
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  List,
  Grid,
  Lock,
  Globe2,
  Check,
  X,
  Clock,
  Calendar,
  Users,
  Video,
  Link as LinkIcon,
  Copy,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import {
  sendInvitationNotification,
  sendJoinRequestNotification,
  sendRequestResponseNotification,
} from "@/services/notificationService"
import {
  scheduleSessions,
  type ScheduleSession,
  discoverySessions,
  discoveryFilters,
  initialJoinRequests,
  type DiscoverySession,
  type JoinRequest,
} from "../data/studySessions"

function SessionCard({ 
  session, 
  isExpanded, 
  onToggle, 
  viewMode = "list" 
}: { 
  session: ScheduleSession
  isExpanded: boolean
  onToggle: () => void
  viewMode?: "list" | "grid"
}) {
  if (viewMode === "grid") {
    return (
      <Card className="relative border border-gray-200 rounded-xl shadow-sm h-full flex flex-col">
        <CardContent className="p-4 flex flex-col flex-1 gap-3">
          {/* Time Section */}
          <div className="space-y-1">
            <div className="text-xs text-gray-500">From</div>
            <div className="text-sm font-semibold text-[#141414]">{session.time.from}</div>
            <div className="text-xs text-gray-500 pt-1">To</div>
            <div className="text-sm font-semibold text-[#141414]">{session.time.to}</div>
          </div>

          {/* Topic */}
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Topic</div>
            <div className="text-sm font-semibold text-[#141414] leading-snug line-clamp-2">
              {session.topic}
            </div>
          </div>

          {/* Teacher Section */}
          <div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.teacher.avatar} alt={session.teacher.name} />
                <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-xs">
                  {session.teacher.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500">Teacher</div>
                <div className="text-sm font-semibold text-[#141414] truncate">
                  {session.teacher.name}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {session.lecture && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Lecture</div>
                  <div className="text-sm font-semibold text-[#141414] line-clamp-1">
                    {session.lecture}
                  </div>
                </div>
              )}
              {session.link && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Link</div>
                  <a 
                    href={session.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[#036aff] hover:underline truncate block"
                  >
                    {session.link}
                  </a>
                </div>
              )}

              {/* Student Avatars */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(4, session.students.count) }).map((_, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-xs">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {session.students.count > 4 && (
                  <Badge className="bg-[#036aff] text-white h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs">
                    +{session.students.count - 4}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                <Button
                  className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 w-full text-sm py-2"
                >
                  Join meeting
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 font-bold hover:bg-red-50 flex-1 text-sm py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#036aff] text-[#036aff] font-bold hover:bg-blue-50 flex-1 text-sm py-2"
                  >
                    Reschedule
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Show More/Less Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-[#036aff] font-bold hover:bg-transparent p-0 h-auto mt-1.5 text-sm"
          >
            {isExpanded ? "Show less" : "Show more"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // List View
  return (
    <Card className="relative border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-12 gap-3">
          {/* Time Section */}
          <div className="col-span-2">
            <div className="text-xs text-gray-500 mb-0.5">From</div>
            <div className="text-sm font-semibold text-[#141414] mb-2">{session.time.from}</div>
            <div className="text-xs text-gray-500 mb-0.5">To</div>
            <div className="text-sm font-semibold text-[#141414]">{session.time.to}</div>
          </div>

          {/* Course Details */}
          <div className="col-span-6">
            <div className="text-xs text-gray-500 mb-0.5">Topic</div>
            <div className="text-sm font-semibold text-[#141414] mb-2">{session.topic}</div>
            
            {isExpanded && (
              <>
                {session.lecture && (
                  <>
                    <div className="text-xs text-gray-500 mb-0.5">Lecture</div>
                    <div className="text-sm font-semibold text-[#141414] mb-2">{session.lecture}</div>
                  </>
                )}
                {session.link && (
                  <>
                    <div className="text-xs text-gray-500 mb-0.5">Link</div>
                    <a 
                      href={session.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[#036aff] hover:underline"
                    >
                      {session.link}
                    </a>
                  </>
                )}
              </>
            )}
          </div>

          {/* Teacher Section */}
          <div className="col-span-4 flex items-start justify-end">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={session.teacher.avatar} alt={session.teacher.name} />
                <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-xs">
                  {session.teacher.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs text-gray-500">Teacher</div>
                <div className="text-xs font-bold text-[#141414]">{session.teacher.name}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-[#036aff] font-bold hover:bg-transparent p-0 h-auto text-xs"
              >
                {isExpanded ? "Show less" : "Show more"}
              </Button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* Student Avatars */}
              <div className="col-span-12 mt-2 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(5, session.students.count) }).map((_, i) => (
                    <Avatar key={i} className="h-7 w-7 border-2 border-white">
                      <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-xs">
                        {String.fromCharCode(65 + i)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {session.students.count > 5 && (
                  <Badge className="bg-[#036aff] text-white h-7 w-7 rounded-full flex items-center justify-center p-0 text-xs">
                    +{session.students.count - 5}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="col-span-12 mt-2 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 font-bold hover:bg-red-50 text-xs py-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  className="border-[#036aff] text-[#036aff] font-bold hover:bg-blue-50 text-xs py-1"
                >
                  Reschedule
                </Button>
                <Button
                  className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs py-1"
                >
                  Join meeting
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const StudySessionPage = () => {
  const { user } = useAuth()
  const [section, setSection] = useState<"schedule" | "discover" | "create" | "requests">("schedule")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set(["1"]))
  const [selectedFaculty, setSelectedFaculty] = useState(discoveryFilters.faculties[0])
  const [selectedCourse, setSelectedCourse] = useState(discoveryFilters.courses[0])
  const [selectedLocation, setSelectedLocation] = useState(discoveryFilters.locations[0])
  const [showDiscoveryFilters, setShowDiscoveryFilters] = useState(false)
  const [visibility, setVisibility] = useState<"public" | "private-password">("public")
  const [sessionPassword, setSessionPassword] = useState("")
  const [useSystemPassword, setUseSystemPassword] = useState(true)
  const [createStep, setCreateStep] = useState<"details" | "done">("details")
  const [studyTopic, setStudyTopic] = useState("")
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([])
  const [participantLimit, setParticipantLimit] = useState("")
  const [invitedStudentIds, setInvitedStudentIds] = useState<string[]>([])
  const [currentStudentId, setCurrentStudentId] = useState("")
  const [googleMeetLink, setGoogleMeetLink] = useState("")
  const [roomLink, setRoomLink] = useState("")
  // Initialize date to today
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const [sessionDate, setSessionDate] = useState(getTodayDate())
  const [sessionStartTime, setSessionStartTime] = useState("")
  const [sessionDuration, setSessionDuration] = useState<"30" | "60" | "90" | "120" | "custom">("60")
  const [customDuration, setCustomDuration] = useState("")
  const [createdLink, setCreatedLink] = useState<string | null>(null)

  // Calculate end time based on start time and duration
  const calculateEndTime = (): string => {
    if (!sessionStartTime) return ""
    const [hours, minutes] = sessionStartTime.split(":").map(Number)
    const durationMinutes =
      sessionDuration === "custom" ? parseInt(customDuration) || 60 : parseInt(sessionDuration)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
    const endHours = endDate.getHours().toString().padStart(2, "0")
    const endMinutes = endDate.getMinutes().toString().padStart(2, "0")
    return `${endHours}:${endMinutes}`
  }

  // Format date for display
  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }
  }

  // Format time for display (12-hour format)
  const formatTimeDisplay = (timeString: string): string => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  // Generate system password
  const generateSystemPassword = (): string => {
    return Math.random().toString(36).slice(-8).toUpperCase()
  }

  // Generate unique room link
  const generateRoomLink = (): string => {
    const randomId = Math.random().toString(36).slice(-12)
    return `https://unicircle.app/study/${randomId}`
  }

  // Generate Google Meet link
  const generateGoogleMeetLink = (): string => {
    const randomId = Math.random().toString(36).slice(-11)
    return `https://meet.google.com/${randomId}`
  }

  // Toggle faculty selection
  const toggleFaculty = (faculty: string) => {
    if (faculty === "All faculties") {
      setSelectedFaculties([])
      return
    }
    setSelectedFaculties((prev) => {
      if (prev.includes(faculty)) {
        return prev.filter((f) => f !== faculty)
      }
      return [...prev, faculty]
    })
  }

  // Add invited student
  const addInvitedStudent = () => {
    const studentId = currentStudentId.trim()
    if (studentId && !invitedStudentIds.includes(studentId)) {
      setInvitedStudentIds((prev) => [...prev, studentId])
      setCurrentStudentId("")
      
      // Send notification to invited student
      if (user && studyTopic) {
        sendInvitationNotification(
          studentId,
          user.studentId,
          user.name,
          studyTopic,
          `session-${Date.now()}`,
          roomLink || undefined,
        )
      }
      
      toast.success("Student invited", {
        description: `Notification sent to ${studentId}`,
      })
    }
  }

  // Remove invited student
  const removeInvitedStudent = (studentId: string) => {
    setInvitedStudentIds((prev) => prev.filter((id) => id !== studentId))
  }

  // Initialize Google Meet link and room link when component mounts or when creating
  const initializeRoomLinks = () => {
    if (!googleMeetLink) {
      setGoogleMeetLink(generateGoogleMeetLink())
    }
    if (!roomLink) {
      setRoomLink(generateRoomLink())
    }
    if (useSystemPassword && visibility === "private-password" && !sessionPassword) {
      setSessionPassword(generateSystemPassword())
    }
  }

  const [requests, setRequests] = useState<JoinRequest[]>(initialJoinRequests)
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(new Set())
  const [requestedSessions, setRequestedSessions] = useState<Set<string>>(new Set())

  // Auto-initialize links when entering create section
  useEffect(() => {
    if (section === "create" && createStep === "details") {
      initializeRoomLinks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, createStep])

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  const getDateLabel = () => {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return `Today ${today.toLocaleDateString('en-US', options)}`
  }

  const handleDiscoveryAction = (session: DiscoverySession) => {
    // Public sessions: mark as joined
    if (session.visibility === "public") {
      setJoinedSessions((prev) => {
        const next = new Set(prev)
        next.add(session.id)
        return next
      })
      toast.success("Joined session!", {
        description: `You've joined "${session.title}"`,
      })
      return
    }

    // Locked sessions: add a pending join request once
    setRequestedSessions((prevRequested) => {
      if (prevRequested.has(session.id)) {
        toast.info("Request already sent", {
          description: "You've already requested to join this session",
        })
        return prevRequested
      }

      const nextRequested = new Set(prevRequested)
      nextRequested.add(session.id)

      const newRequest: JoinRequest = {
        id: `local-${Date.now()}-${session.id}`,
        sessionTitle: session.title,
        requesterName: user?.name || "You",
        requesterInitials: user?.initials || "YO",
        requestedAt: "Just now",
        status: "pending",
      }

      setRequests((prev) => [newRequest, ...prev])
      
      // Send notification to session host
      // For demo: extract host student ID from host name (mock)
      // In real app, this would come from the session data
      const hostStudentId = session.hostName.toLowerCase().replace(/\s+/g, "") + "123" // Mock ID
      if (user) {
        sendJoinRequestNotification(
          hostStudentId, // Host student ID
          user.studentId,
          user.name,
          session.title,
          session.id,
        )
      }
      
      toast.success("Join request sent!", {
        description: `Your request to join "${session.title}" has been sent to the host`,
      })
      return nextRequested
    })
  }

  const updateRequestStatus = (id: string, status: "accepted" | "rejected") => {
    setRequests((prev) => {
      const request = prev.find((req) => req.id === id)
      const updated = prev.map((req) => (req.id === id ? { ...req, status } : req))
      
      // Send notification to requester
      if (request && user) {
        // Extract requester student ID from request (mock - in real app this would be in the request)
        const requesterStudentId = request.requesterName.toLowerCase().replace(/\s+/g, "") + "123"
        sendRequestResponseNotification(
          requesterStudentId,
          request.sessionTitle,
          status === "accepted",
        )
      }
      
      if (status === "accepted") {
        toast.success("Request accepted", {
          description: `${request?.requesterName} has been added to the session`,
        })
      } else {
        toast.info("Request rejected", {
          description: `You've rejected ${request?.requesterName}'s join request`,
        })
      }
      
      return updated
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#141414]">Study Sessions</h1>
          <p className="text-sm text-gray-500">Managed by Study Service</p>

          {/* High-level section switcher */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f5] p-1">
            {[
              { id: "schedule", label: "My schedule" },
              { id: "discover", label: "Discover groups" },
              { id: "create", label: "Create session" },
              { id: "requests", label: "Requests" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id as typeof section)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  section === item.id
                    ? "bg-white text-[#141414] shadow-sm"
                    : "text-gray-600 hover:text-[#141414]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          {section === "schedule" && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-white border border-gray-200 p-1 h-auto">
                  <TabsTrigger
                    value="upcoming"
                    className={cn(
                      "px-4 py-2 rounded-md font-bold text-sm",
                      activeTab === "upcoming"
                        ? "bg-[#036aff] text-white"
                        : "text-gray-600 hover:text-[#141414]"
                    )}
                  >
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className={cn(
                      "px-4 py-2 rounded-md font-bold text-sm",
                      activeTab === "pending"
                        ? "bg-[#036aff] text-white"
                        : "text-gray-600 hover:text-[#141414]"
                    )}
                  >
                    Pending
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className={cn(
                      "px-4 py-2 rounded-md font-bold text-sm",
                      activeTab === "past"
                        ? "bg-[#036aff] text-white"
                        : "text-gray-600 hover:text-[#141414]"
                    )}
                  >
                    Past
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="text-sm text-gray-500">{getDateLabel()}</div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          {section === "schedule" && (
            <div className="flex items-center border border-gray-200 rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-8 w-8",
                  viewMode === "list"
                    ? "bg-[#036aff] text-white hover:bg-[#036aff] hover:text-white"
                    : "text-[#141414] hover:bg-[#f5f5f5]"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 w-8",
                  viewMode === "grid"
                    ? "bg-[#036aff] text-white hover:bg-[#036aff] hover:text-white"
                    : "text-[#141414] hover:bg-[#f5f5f5]"
                )}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          )}
          {section === "discover" && (
            <Button
              variant="ghost"
              className="font-bold text-[#141414] hover:bg-[#f5f5f5]"
              onClick={() => setShowDiscoveryFilters((prev) => !prev)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showDiscoveryFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          )}
          <Button
            className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90"
            onClick={() => setSection("create")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create session
          </Button>
        </div>
      </div>

      {/* Section Content */}
      {section === "schedule" && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="upcoming" className="mt-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scheduleSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isExpanded={expandedSessions.has(session.id)}
                    onToggle={() => toggleSession(session.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {scheduleSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isExpanded={expandedSessions.has(session.id)}
                    onToggle={() => toggleSession(session.id)}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="pending" className="space-y-4 mt-6">
            <div className="text-center py-12 text-gray-500">
              No pending sessions
            </div>
          </TabsContent>
          <TabsContent value="past" className="space-y-4 mt-6">
            <div className="text-center py-12 text-gray-500">
              No past sessions
            </div>
          </TabsContent>
        </Tabs>
      )}

      {section === "discover" && (
        <div className="mt-4 space-y-4">
          {showDiscoveryFilters && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Faculty</span>
                  <div className="flex gap-1 rounded-full bg-[#f5f5f5] p-1">
                    {discoveryFilters.faculties.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setSelectedFaculty(f)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          selectedFaculty === f
                            ? "bg-white text-[#141414] shadow-sm"
                            : "text-gray-600 hover:text-[#141414]"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Course</span>
                  <div className="flex gap-1 rounded-full bg-[#f5f5f5] p-1">
                    {discoveryFilters.courses.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCourse(c)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          selectedCourse === c
                            ? "bg-white text-[#141414] shadow-sm"
                            : "text-gray-600 hover:text[#141414]"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Location</span>
                  <div className="flex gap-1 rounded-full bg-[#f5f5f5] p-1">
                    {discoveryFilters.locations.map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setSelectedLocation(l)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          selectedLocation === l
                            ? "bg-white text-[#141414] shadow-sm"
                            : "text-gray-600 hover:text-[#141414]"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discovery cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {discoverySessions.map((session: DiscoverySession) => {
              const isJoined = joinedSessions.has(session.id)
              const isRequested = requestedSessions.has(session.id)

              return (
              <Card key={session.id} className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#141414] mb-1">
                        {session.title}
                      </h3>
                      <p className="text-xs text-gray-500">{session.course}</p>
                      <p className="text-xs text-gray-500">{session.faculty}</p>
                    </div>
                    <Badge className="bg-[#f5f5f5] text-[#141414] border-none text-[11px] font-semibold">
                      {session.visibility === "public" ? (
                        <span className="flex items-center gap-1">
                          <Globe2 className="h-3 w-3" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{session.time}</span>
                    <span>
                      {session.capacity.current}/{session.capacity.max} joined
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Avatar className="h-7 w-7">
                      <AvatarImage alt={session.hostName} />
                      <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-xs">
                        {session.hostInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs text-gray-500">Host</div>
                      <div className="text-sm font-semibold text-[#141414]">
                        {session.hostName}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {session.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-gray-200 text-[11px] font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    {session.visibility === "private-password" && (
                      <input
                        type="password"
                        placeholder="Enter session password"
                        className="h-8 rounded-md border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                      />
                    )}
                    <Button
                      disabled={isJoined || isRequested}
                      onClick={() => handleDiscoveryAction(session)}
                      className={cn(
                        "bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs py-2 disabled:opacity-70",
                        isJoined || isRequested ? "cursor-default" : ""
                      )}
                    >
                      {isJoined
                        ? "Joined"
                        : isRequested
                        ? "Requested"
                        : session.visibility === "public"
                        ? "Join session"
                        : session.visibility === "private-password"
                        ? "Join with password"
                        : "Request to join"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>
      )}

      {section === "create" && (
        <div className="mt-4 max-w-4xl">
          {createStep === "details" && (
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#141414]">Create Study Room</h2>
                      <p className="text-xs text-gray-500 mt-1">Create a Google Meet room for your study session</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={initializeRoomLinks}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Generate Links
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Study Topic */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700">Study Topic *</label>
                      <input
                        type="text"
                        value={studyTopic}
                        onChange={(e) => setStudyTopic(e.target.value)}
                        placeholder="e.g. Midterm revision"
                        className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#036aff]/30"
                      />
                    </div>

                    {/* Faculty Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700">Faculty (Filter Options)</label>
                      <p className="text-[11px] text-gray-500">Select one or more faculties. Auto-filled based on your courses.</p>
                      <div className="flex flex-wrap gap-2">
                        {discoveryFilters.faculties.map((faculty) => {
                          const isSelected = selectedFaculties.includes(faculty) || (faculty === "All faculties" && selectedFaculties.length === 0)
                          return (
                            <button
                              key={faculty}
                              type="button"
                              onClick={() => toggleFaculty(faculty)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                                isSelected
                                  ? "border-[#036aff] bg-[#036aff]/5 text-[#036aff]"
                                  : "border-gray-200 text-gray-700 hover:border-[#036aff]/60"
                              )}
                            >
                              {faculty}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Date & Time</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start Date *
                          </label>
                          <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="h-9 w-full rounded-md border border-gray-200 px-3 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Start Time *
                          </label>
                          <input
                            type="time"
                            value={sessionStartTime}
                            onChange={(e) => setSessionStartTime(e.target.value)}
                            className="h-9 w-full rounded-md border border-gray-200 px-3 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Duration</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { value: "30", label: "30 min" },
                            { value: "60", label: "1 hour" },
                            { value: "90", label: "1.5 hours" },
                            { value: "120", label: "2 hours" },
                            { value: "custom", label: "Custom" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setSessionDuration(option.value as any)}
                              className={cn(
                                "px-3 py-2 rounded-md text-xs font-semibold border transition-colors",
                                sessionDuration === option.value
                                  ? "border-[#036aff] bg-[#036aff]/5 text-[#036aff]"
                                  : "border-gray-200 text-gray-700 hover:border-[#036aff]/60"
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        {sessionDuration === "custom" && (
                          <input
                            type="number"
                            value={customDuration}
                            onChange={(e) => setCustomDuration(e.target.value)}
                            placeholder="Minutes"
                            min="15"
                            step="15"
                            className="h-9 w-full rounded-md border border-gray-200 px-3 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                          />
                        )}
                        {sessionStartTime && sessionDuration && (
                          <div className="rounded-lg bg-[#f5f5f5] px-3 py-2 text-xs">
                            <p><span className="font-semibold">Start:</span> {formatTimeDisplay(sessionStartTime)}</p>
                            <p><span className="font-semibold">End:</span> {formatTimeDisplay(calculateEndTime())}</p>
                            <p><span className="font-semibold">Duration:</span> {
                              sessionDuration === "custom" ? `${customDuration || 0} min` :
                              sessionDuration === "30" ? "30 min" :
                              sessionDuration === "60" ? "1 hour" :
                              sessionDuration === "90" ? "1.5 hours" : "2 hours"
                            }</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room Configuration */}
                    <div className="space-y-4 pt-2 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Room Configuration</div>
                      
                      {/* Participant Limit */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Participant Limit
                        </label>
                        <input
                          type="number"
                          value={participantLimit}
                          onChange={(e) => setParticipantLimit(e.target.value)}
                          placeholder="e.g. 10 (leave empty for unlimited)"
                          min="1"
                          className="h-9 w-full rounded-md border border-gray-200 px-3 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                        />
                      </div>

                      {/* Room Type & Privacy */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Room Type</label>
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setVisibility("public")}
                            className={cn(
                              "w-full flex items-center justify-between rounded-md border px-3 py-2 text-xs",
                              visibility === "public"
                                ? "border-[#036aff] bg-[#036aff]/5"
                                : "border-gray-200"
                            )}
                          >
                            <span className="flex items-center gap-2 text-gray-700">
                              <Globe2 className="h-4 w-4" />
                              Public Room - Open link for everyone
                            </span>
                            {visibility === "public" && <Check className="h-4 w-4 text-[#036aff]" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisibility("private-password")}
                            className={cn(
                              "w-full flex items-center justify-between rounded-md border px-3 py-2 text-xs",
                              visibility === "private-password"
                                ? "border-[#036aff] bg-[#036aff]/5"
                                : "border-gray-200"
                            )}
                          >
                            <span className="flex items-center gap-2 text-gray-700">
                              <Lock className="h-4 w-4" />
                              Private Room - Require password
                            </span>
                            {visibility === "private-password" && <Check className="h-4 w-4 text-[#036aff]" />}
                          </button>
                        </div>
                        {visibility === "private-password" && (
                          <div className="space-y-2 pl-7">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={useSystemPassword}
                                onChange={(e) => {
                                  setUseSystemPassword(e.target.checked)
                                  if (e.target.checked) {
                                    setSessionPassword(generateSystemPassword())
                                  } else {
                                    setSessionPassword("")
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label className="text-xs text-gray-600">Use system-generated password</label>
                            </div>
                            {!useSystemPassword && (
                              <input
                                type="text"
                                value={sessionPassword}
                                onChange={(e) => setSessionPassword(e.target.value)}
                                placeholder="Create your own password"
                                className="h-8 w-full rounded-md border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                              />
                            )}
                            {useSystemPassword && sessionPassword && (
                              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-[#f5f5f5] px-2 py-1.5">
                                <span className="text-xs font-mono text-[#141414] flex-1">{sessionPassword}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSessionPassword(generateSystemPassword())}
                                  className="h-6 px-2 text-xs"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(sessionPassword)
                                    toast.success("Password copied!")
                                  }}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Google Meet Link */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Google Meet Link
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={googleMeetLink}
                            onChange={(e) => setGoogleMeetLink(e.target.value)}
                            placeholder="Will be generated automatically"
                            className="h-9 flex-1 rounded-md border border-gray-200 px-3 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGoogleMeetLink(generateGoogleMeetLink())
                              toast.success("Google Meet link generated!")
                            }}
                            className="text-xs"
                          >
                            Generate
                          </Button>
                        </div>
                      </div>

                      {/* Unique Room Link */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500 flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          Unique Room Link (Shareable)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={roomLink}
                            onChange={(e) => setRoomLink(e.target.value)}
                            placeholder="Will be generated automatically"
                            className="h-9 flex-1 rounded-md border border-gray-200 px-3 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRoomLink(generateRoomLink())
                              toast.success("Room link generated!")
                            }}
                            className="text-xs"
                          >
                            Generate
                          </Button>
                          {roomLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(roomLink)
                                toast.success("Room link copied!")
                              }}
                              className="text-xs"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Student Invitation */}
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <label className="text-xs font-semibold text-gray-700">Student Invitation</label>
                      <p className="text-[11px] text-gray-500">Enter student IDs to invite them. Notifications will be sent to invited students.</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentStudentId}
                          onChange={(e) => setCurrentStudentId(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addInvitedStudent()
                            }
                          }}
                          placeholder="Enter student ID (e.g. 523k0002)"
                          className="h-9 flex-1 rounded-md border border-gray-200 px-3 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                        />
                        <Button
                          type="button"
                          onClick={addInvitedStudent}
                          className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs px-4"
                        >
                          Add
                        </Button>
                      </div>
                      {invitedStudentIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {invitedStudentIds.map((id) => (
                            <Badge
                              key={id}
                              variant="outline"
                              className="border-gray-200 text-xs font-medium pr-1"
                            >
                              {id}
                              <button
                                type="button"
                                onClick={() => removeInvitedStudent(id)}
                                className="ml-1 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      className="text-xs font-bold text-[#141414] hover:bg-[#f5f5f5]"
                      onClick={() => setSection("schedule")}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm py-2 px-6"
                      onClick={() => {
                        // Validation
                        if (!studyTopic.trim()) {
                          toast.error("Study topic required", {
                            description: "Please provide a study topic",
                          })
                          return
                        }
                        if (!sessionDate) {
                          toast.error("Date required", {
                            description: "Please select a date",
                          })
                          return
                        }
                        if (!sessionStartTime) {
                          toast.error("Start time required", {
                            description: "Please select a start time",
                          })
                          return
                        }
                        if (sessionDuration === "custom" && (!customDuration || parseInt(customDuration) < 15)) {
                          toast.error("Invalid duration", {
                            description: "Please enter a valid duration (minimum 15 minutes)",
                          })
                          return
                        }
                        if (!googleMeetLink) {
                          setGoogleMeetLink(generateGoogleMeetLink())
                        }
                        if (!roomLink) {
                          setRoomLink(generateRoomLink())
                        }
                        if (visibility === "private-password" && !sessionPassword) {
                          setSessionPassword(generateSystemPassword())
                        }

                        const finalRoomLink = roomLink || generateRoomLink()
                        setCreatedLink(finalRoomLink)
                        
                        // Send notifications to all invited students when room is created
                        if (user && invitedStudentIds.length > 0) {
                          invitedStudentIds.forEach((studentId) => {
                            sendInvitationNotification(
                              studentId,
                              user.studentId,
                              user.name,
                              studyTopic,
                              `session-${Date.now()}`,
                              finalRoomLink,
                            )
                          })
                        }
                        
                        setCreateStep("done")
                        toast.success("Study room created!", {
                          description: `"${studyTopic}" is now live. Notifications sent to ${invitedStudentIds.length} student(s).`,
                        })
                      }}
                    >
                      Create Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          {createStep === "done" && (
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#141414]">Study Room Created!</h2>
                      <p className="text-xs text-gray-500">Your room is ready. Share the link with participants.</p>
                    </div>
                  </div>

                  {/* Study Session View */}
                  <div className="space-y-4 pt-2 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                      Study Session View
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Study Topic</p>
                        <p className="text-sm font-semibold text-[#141414]">{studyTopic}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-semibold text-[#141414]">{formatDateDisplay(sessionDate)}</p>
                      </div>
                    </div>

                    {/* Time Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg bg-[#f5f5f5] p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Start Time</p>
                        <p className="text-sm font-semibold text-[#141414]">
                          {sessionStartTime ? formatTimeDisplay(sessionStartTime) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">End Time</p>
                        <p className="text-sm font-semibold text-[#141414]">
                          {sessionStartTime ? formatTimeDisplay(calculateEndTime()) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="text-sm font-semibold text-[#141414]">
                          {sessionDuration === "custom"
                            ? `${customDuration || 0} minutes`
                            : sessionDuration === "30"
                            ? "30 minutes"
                            : sessionDuration === "60"
                            ? "1 hour"
                            : sessionDuration === "90"
                            ? "1.5 hours"
                            : "2 hours"}
                        </p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Participants</p>
                        <p className="text-xs font-semibold text-[#141414]">
                          {invitedStudentIds.length} invited
                          {participantLimit && ` / ${participantLimit} max`}
                        </p>
                      </div>
                      {invitedStudentIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {invitedStudentIds.map((id) => (
                            <Badge key={id} variant="outline" className="border-gray-200 text-xs">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Room Configurations */}
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Room Configurations</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Room Type:</span>
                          <span className="font-semibold text-[#141414]">
                            {visibility === "public" ? "Public" : "Private (Password Protected)"}
                          </span>
                        </div>
                        {visibility === "private-password" && sessionPassword && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Password:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-[#141414]">{sessionPassword}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(sessionPassword)
                                  toast.success("Password copied!")
                                }}
                                className="h-6 px-2"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Participant Limit:</span>
                          <span className="font-semibold text-[#141414]">
                            {participantLimit || "Unlimited"}
                          </span>
                        </div>
                        {selectedFaculties.length > 0 && (
                          <div className="flex items-start justify-between">
                            <span className="text-gray-600">Faculties:</span>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {selectedFaculties.map((f) => (
                                <Badge key={f} variant="outline" className="border-gray-200 text-[10px]">
                                  {f}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-3 pt-2 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Google Meet Link
                          </label>
                          {googleMeetLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(googleMeetLink)
                                toast.success("Google Meet link copied!")
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          )}
                        </div>
                        {googleMeetLink && (
                          <div className="rounded-md border border-gray-200 bg-[#f5f5f5] px-3 py-2">
                            <p className="text-xs text-[#141414] break-all">{googleMeetLink}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            Unique Room Link (Shareable)
                          </label>
                          {createdLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(createdLink || "")
                                toast.success("Room link copied!", {
                                  description: "Session link has been copied to clipboard",
                                })
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          )}
                        </div>
                        {createdLink && (
                          <div className="rounded-md border border-gray-200 bg-[#f5f5f5] px-3 py-2">
                            <p className="text-xs text-[#141414] break-all">{createdLink}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 text-xs font-bold text-[#141414] py-2"
                      onClick={() => setCreateStep("details")}
                    >
                      Edit Details
                    </Button>
                    <Button
                      className="flex-1 bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs py-2"
                      onClick={() => setSection("schedule")}
                    >
                      View in Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      )}

      {section === "requests" && (
        <div className="mt-4 space-y-3">
          {requests.map((req: JoinRequest) => (
            <Card key={req.id} className="border border-gray-200 rounded-xl shadow-sm">
              <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage alt={req.requesterName} />
                    <AvatarFallback className="bg-[#f5f5f5] text-[#141414] text-xs">
                      {req.requesterInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold text-[#141414]">
                      {req.requesterName}
                    </div>
                    <div className="text-xs text-gray-500">
                      wants to join: {req.sessionTitle}
                    </div>
                    {req.message && (
                      <div className="mt-1 text-xs text-gray-600">“{req.message}”</div>
                    )}
                    <div className="mt-1 text-[11px] text-gray-400">
                      {req.requestedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-0">
                  {req.status === "pending" ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-gray-200 text-[#141414] text-xs py-1.5 px-3"
                        onClick={() => updateRequestStatus(req.id, "rejected")}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs py-1.5 px-3"
                        onClick={() => updateRequestStatus(req.id, "accepted")}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                    </>
                  ) : (
                    <Badge
                      className={cn(
                        "text-[11px] font-semibold px-2 py-1",
                        req.status === "accepted"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      )}
                    >
                      {req.status === "accepted" ? "Accepted" : "Rejected"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No join requests at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StudySessionPage
