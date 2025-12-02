import { useState } from "react"
import {
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  List,
  Grid,
  Lock,
  Globe2,
  KeyRound,
  UserPlus2,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  scheduleSessions,
  type ScheduleSession,
  discoverySessions,
  discoveryFilters,
  sessionQuestionPresets,
  initialJoinRequests,
  type DiscoverySession,
  type SessionQuestion,
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
  const [section, setSection] = useState<"schedule" | "discover" | "create" | "requests">("schedule")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set(["1"]))
  const [selectedFaculty, setSelectedFaculty] = useState(discoveryFilters.faculties[0])
  const [selectedCourse, setSelectedCourse] = useState(discoveryFilters.courses[0])
  const [selectedLocation, setSelectedLocation] = useState(discoveryFilters.locations[0])
  const [showDiscoveryFilters, setShowDiscoveryFilters] = useState(false)
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({})
  const [visibility, setVisibility] = useState<"public" | "private-invite" | "private-password">("public")
  const [sessionPassword, setSessionPassword] = useState("")
  const [createStep, setCreateStep] = useState<"questions" | "details" | "done">("questions")
  const [sessionTitle, setSessionTitle] = useState("")
  const [sessionCourse, setSessionCourse] = useState("")
  const [sessionLocation, setSessionLocation] = useState("")
  const [sessionTime, setSessionTime] = useState("")
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  const [requests, setRequests] = useState<JoinRequest[]>(initialJoinRequests)
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(new Set())
  const [requestedSessions, setRequestedSessions] = useState<Set<string>>(new Set())

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
      return
    }

    // Locked sessions: add a pending join request once
    setRequestedSessions((prevRequested) => {
      if (prevRequested.has(session.id)) return prevRequested

      const nextRequested = new Set(prevRequested)
      nextRequested.add(session.id)

      const newRequest: JoinRequest = {
        id: `local-${Date.now()}-${session.id}`,
        sessionTitle: session.title,
        requesterName: "You",
        requesterInitials: "YO",
        requestedAt: "Just now",
        status: "pending",
      }

      setRequests((prev) => [newRequest, ...prev])
      return nextRequested
    })
  }

  const updateRequestStatus = (id: string, status: "accepted" | "rejected") => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req)),
    )
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
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-5">
            {sessionQuestionPresets.map((q: SessionQuestion) => (
              <Card key={q.id} className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-sm font-semibold text-[#141414]">{q.label}</div>
                    {q.helperText && (
                      <p className="text-xs text-gray-500 mt-1">{q.helperText}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const selected = questionAnswers[q.id] === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setQuestionAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                            selected
                              ? "border-[#036aff] bg-[#036aff]/5 text-[#036aff]"
                              : "border-gray-200 text-gray-700 hover:border-[#036aff]/60"
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card className="border border-gray-200 rounded-xl shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="text-sm font-semibold text-[#141414]">Visibility</div>
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
                      Public session
                    </span>
                    {visibility === "public" && <Check className="h-4 w-4 text-[#036aff]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("private-invite")}
                    className={cn(
                      "w-full flex items-center justify-between rounded-md border px-3 py-2 text-xs",
                      visibility === "private-invite"
                        ? "border-[#036aff] bg-[#036aff]/5"
                        : "border-gray-200"
                    )}
                  >
                    <span className="flex items-center gap-2 text-gray-700">
                      <UserPlus2 className="h-4 w-4" />
                      Private – invite only
                    </span>
                    {visibility === "private-invite" && (
                      <Check className="h-4 w-4 text-[#036aff]" />
                    )}
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
                      <KeyRound className="h-4 w-4" />
                      Private – password
                    </span>
                    {visibility === "private-password" && (
                      <Check className="h-4 w-4 text-[#036aff]" />
                    )}
                  </button>
                </div>

                {visibility === "private-password" && (
                  <div className="pt-2 space-y-1">
                    <span className="text-xs text-gray-500">Session password</span>
                    <input
                      type="password"
                      value={sessionPassword}
                      onChange={(e) => setSessionPassword(e.target.value)}
                      placeholder="Create a short password"
                      className="h-8 rounded-md border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {createStep === "questions" && (
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="text-sm font-semibold text-[#141414]">
                    Quick summary
                  </div>
                  <p className="text-xs text-gray-600">
                    We’ll use these answers to pre-fill your study session details.
                    You can still adjust the title, time and location on the next step.
                  </p>
                  <Button
                    className="w-full bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm py-2"
                    onClick={() => setCreateStep("details")}
                  >
                    Continue to details
                  </Button>
                </CardContent>
              </Card>
            )}

            {createStep === "details" && (
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-[#141414]">
                      Session details
                    </div>
                    <span className="text-[11px] text-gray-500">Step 2 of 2</span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Title</label>
                      <input
                        type="text"
                        value={sessionTitle}
                        onChange={(e) => setSessionTitle(e.target.value)}
                        placeholder="e.g. Exam review: Intro to AI – Chapter 3"
                        className="h-8 w-full rounded-md border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Course</label>
                      <input
                        type="text"
                        value={sessionCourse}
                        onChange={(e) => setSessionCourse(e.target.value)}
                        placeholder="e.g. Introduction to AI"
                        className="h-8 w-full rounded-md border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Time</label>
                      <input
                        type="text"
                        value={sessionTime}
                        onChange={(e) => setSessionTime(e.target.value)}
                        placeholder="e.g. Today • 7:30 PM – 9:00 PM"
                        className="h-8 w-full rounded-md border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Location</label>
                      <input
                        type="text"
                        value={sessionLocation}
                        onChange={(e) => setSessionLocation(e.target.value)}
                        placeholder="e.g. Library A302 or Online"
                        className="h-8 w-full rounded-md border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-[#036aff]/30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      className="text-xs font-bold text-[#141414] hover:bg-[#f5f5f5] px-2"
                      onClick={() => setCreateStep("questions")}
                    >
                      Back
                    </Button>
                    <Button
                      className="bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-sm py-2 px-4"
                      onClick={() => {
                        setCreatedLink(
                          "https://unicircle.app/study/" +
                            (sessionTitle || "my-session").toLowerCase().replace(/\s+/g, "-"),
                        )
                        setCreateStep("done")
                      }}
                    >
                      Create session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {createStep === "done" && (
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#036aff]/10">
                      <Check className="h-4 w-4 text-[#036aff]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#141414]">
                        Session created
                      </div>
                      <p className="text-xs text-gray-500">
                        Share this link with friends or post it to your class group.
                      </p>
                    </div>
                  </div>

                  {createdLink && (
                    <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-[#f5f5f5] px-3 py-2">
                      <span className="flex-1 truncate text-xs text-[#141414]">
                        {createdLink}
                      </span>
                      <Button
                        variant="ghost"
                        className="text-xs font-bold text-[#141414] hover:bg-white px-2"
                      >
                        Copy
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 text-xs font-bold text-[#141414] py-2"
                      onClick={() => setCreateStep("details")}
                    >
                      Edit details
                    </Button>
                    <Button
                      className="flex-1 bg-[#036aff] text-white font-bold hover:bg-[#036aff]/90 text-xs py-2"
                      onClick={() => setSection("schedule")}
                    >
                      View in schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
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
