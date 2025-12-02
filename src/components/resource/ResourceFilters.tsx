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
    <div className="space-y-4">
      <Input
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by title, course code, or contributor"
        className="h-10 border-gray-200"
      />

      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCourseChange("")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              selectedCourse === ""
                ? "border-[#036aff] bg-[#036aff]/5 text-[#036aff]"
                : "border-gray-200 text-gray-600 hover:border-[#036aff]/60",
            )}
          >
            All courses
          </button>
          {resourceCourses.map((course) => (
            <button
              key={course.code}
              type="button"
              onClick={() => onCourseChange(course.code)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                selectedCourse === course.code
                  ? "border-[#036aff] bg-[#036aff]/5 text-[#036aff]"
                  : "border-gray-200 text-gray-600 hover:border-[#036aff]/60",
              )}
            >
              {course.code}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tags</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTagChange("")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              selectedTag === ""
                ? "border-[#036aff] bg-[#036aff]/5 text-[#036aff]"
                : "border-gray-200 text-gray-600 hover:border-[#036aff]/60",
            )}
          >
            All tags
          </button>
          {resourceTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange(tag)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                selectedTag === tag
                  ? "border-[#036aff] bg-[#036aff]/5 text-[#036aff]"
                  : "border-gray-200 text-gray-600 hover:border-[#036aff]/60",
              )}
            >
              {tag.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


