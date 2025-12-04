import { Input } from "@/components/ui/input"
import { resourceCourses, resourceTags } from "@/data/resources"
import { cn } from "@/lib/utils"

interface ResourceFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCourse: string
  onCourseChange: (value: string) => void
  selectedTag: string
  onTagChange: (value: string) => void
}

export function ResourceFilters({
  searchTerm,
  onSearchChange,
  selectedCourse,
  onCourseChange,
  selectedTag,
  onTagChange,
}: ResourceFiltersProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="space-y-2 md:flex-1">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Course
          </div>
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => onCourseChange(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium",
                "focus:outline-none focus:ring-2 focus:ring-[#036aff]/20",
              )}
            >
              <option value="">All courses</option>
              {resourceCourses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.code} · {course.name}
                </option>
          ))}
            </select>
        </div>
      </div>

        <div className="space-y-2 md:flex-1">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tags</div>
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => onTagChange(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium capitalize",
                "focus:outline-none focus:ring-2 focus:ring-[#036aff]/20",
              )}
            >
              <option value="">All tags</option>
              {resourceTags.map((tag) => (
                <option key={tag} value={tag}>
              {tag.replace("-", " ")}
                </option>
          ))}
            </select>
          </div>
        </div>
      </div>

      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by title, course code, or contributor"
        className="h-12 border-gray-200 text-base"
      />
    </div>
  )
}


