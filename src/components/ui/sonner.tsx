import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      closeButton
      richColors
      expand={true}
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white text-[#141414] border border-gray-200 shadow-lg rounded-xl",
          description: "text-gray-600",
          actionButton: "bg-[#036aff] text-white hover:bg-[#036aff]/90 rounded-md",
          cancelButton: "bg-[#f5f5f5] text-[#141414] hover:bg-[#e5e5e5] rounded-md",
          closeButton: "bg-transparent hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-md",
          success: "border-l-[3px] border-l-green-500",
          error: "border-l-[3px] border-l-red-500",
          info: "border-l-[3px] border-l-[#036aff]",
          warning: "border-l-[3px] border-l-yellow-500",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600" />,
        info: <InfoIcon className="size-4 text-[#036aff]" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-600" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#036aff]" />,
      }}
      position="top-right"
      {...props}
    />
  )
}

export { Toaster }
