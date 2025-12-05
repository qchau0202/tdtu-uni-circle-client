const RESOURCE_BASE_URL =
  import.meta.env.VITE_RESOURCE_SERVICE_URL || "http://localhost:3004/api/resources"

const API_KEY = import.meta.env.VITE_API_KEY || ""

export interface MediaFile {
  id?: string
  url: string
  publicId: string
  format: string
  size: number
  originalName: string
  uploadedAt: string
  caption: string | null
}

export interface Media {
  files: MediaFile[]
  images: MediaFile[]
  videos: MediaFile[]
  urls: MediaFile[]
}

export interface BackendResource {
  id: string
  owner_id: string
  title: string
  description: string | null
  course_code: string | null
  resource_type: "URL" | "DOCUMENT"
  hashtags: string[]
  upvote_count: number
  created_at: string
  media: Media
  owner?: {
    id: string
    student_code: string
    display_name: string
    avatar_url: string | null
  }
}

export interface CreateResourcePayload {
  title: string
  description?: string
  course_code?: string
  resource_type: "URL" | "DOCUMENT"
  hashtags?: string[]
  files?: File[]
}

export interface UpdateResourcePayload {
  title?: string
  description?: string
  course_code?: string
  hashtags?: string[]
  media?: Media
  files?: File[]
}

export interface GetResourcesParams {
  filter?: "all" | "my" | "following"
  course_code?: string
  hashtag?: string
  search?: string
}

export interface GetResourcesResponse {
  success: boolean
  count: number
  filter: string
  resources: BackendResource[]
}

const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  "x-api-key": API_KEY,
})

async function handleResourceResponse<T>(response: Response): Promise<T> {
  let data: any = null
  try {
    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")
    if (isJson) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error("Non-JSON response:", text.substring(0, 200))
    }
  } catch (parseError) {
    console.error("Failed to parse response:", parseError)
    throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`)
  }

  if (!response.ok) {
    const message =
      (data && (data.error?.message || data.message)) ||
      `HTTP ${response.status} – Resource request failed`
    const error = new Error(message) as Error & { status?: number; code?: string }
    error.status = response.status
    error.code = data?.error?.code
    throw error
  }

  return (data?.resource || data) as T
}

export async function getResources(
  params: GetResourcesParams,
  accessToken: string,
): Promise<GetResourcesResponse> {
  const queryParams = new URLSearchParams()
  if (params.filter) queryParams.append("filter", params.filter)
  if (params.course_code) queryParams.append("course_code", params.course_code)
  if (params.hashtag) queryParams.append("hashtag", params.hashtag)
  if (params.search) queryParams.append("search", params.search)

  const res = await fetch(`${RESOURCE_BASE_URL}?${queryParams.toString()}`, {
    headers: authHeaders(accessToken),
  })

  return handleResourceResponse<GetResourcesResponse>(res)
}

export async function getResourceById(
  id: string,
  accessToken: string,
): Promise<BackendResource> {
  const res = await fetch(`${RESOURCE_BASE_URL}/${id}`, {
    headers: authHeaders(accessToken),
  })

  return handleResourceResponse<BackendResource>(res)
}

export async function createResource(
  payload: CreateResourcePayload,
  accessToken: string,
): Promise<BackendResource> {
  const formData = new FormData()
  formData.append("title", payload.title)
  if (payload.description) formData.append("description", payload.description)
  if (payload.course_code) formData.append("course_code", payload.course_code)
  formData.append("resource_type", payload.resource_type)
  if (payload.hashtags && payload.hashtags.length > 0) {
    formData.append("hashtags", JSON.stringify(payload.hashtags))
  }

  // Add files if provided
  if (payload.files && payload.files.length > 0) {
    payload.files.forEach((file) => {
      formData.append("files", file)
    })
  }

  const res = await fetch(RESOURCE_BASE_URL, {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      // Don't set Content-Type header - browser will set it with boundary for form-data
    },
    body: formData,
  })

  return handleResourceResponse<BackendResource>(res)
}

export async function updateResource(
  id: string,
  payload: UpdateResourcePayload,
  accessToken: string,
): Promise<BackendResource> {
  // Backend PUT route doesn't have multer middleware, but README says to use form-data
  // Backend checks: if (req.files || req.body.media) -> form-data mode
  // Otherwise: JSON mode (req.body is used directly)
  
  // Strategy: Always use form-data when media is involved (per README)
  // Use JSON only when updating text fields without media
  const hasFiles = payload.files && payload.files.length > 0
  const hasMedia = payload.media !== undefined
  
  if (hasFiles || hasMedia) {
    // Use form-data when uploading files or updating media (per README)
    // NOTE: Backend PUT route needs multer middleware to parse form-data
    // If backend doesn't have multer, this will fail
    const formData = new FormData()
    
    // Always send title (must be non-empty for backend to add it)
    if (!payload.title || !payload.title.trim()) {
      throw new Error("Title is required for update")
    }
    formData.append("title", payload.title.trim())
    
    // Always send description (backend checks !== undefined, can be empty string)
    formData.append("description", payload.description !== undefined ? payload.description : "")
    
    // Send course_code if provided
    if (payload.course_code !== undefined && payload.course_code.trim()) {
      formData.append("course_code", payload.course_code.trim())
    }
    
    // Send hashtags if provided (must be JSON string in form-data)
    if (payload.hashtags && Array.isArray(payload.hashtags) && payload.hashtags.length > 0) {
      formData.append("hashtags", JSON.stringify(payload.hashtags))
    }
    
    // Always send media object (required for form-data mode per README)
    // Backend checks: if (req.body.media) -> enters form-data parsing mode
    // If media is provided, use it; otherwise send empty (backend will preserve existing)
    const mediaToSend = payload.media || {
      files: [],
      images: [],
      videos: [],
      urls: [],
    }
    formData.append("media", JSON.stringify(mediaToSend))

    // Add files if provided (req.files will exist if any files sent)
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append("files", file)
      })
    }

    const res = await fetch(`${RESOURCE_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        ...authHeaders(accessToken),
        // Don't set Content-Type - browser sets it with boundary for form-data
      },
      body: formData,
    })

    return handleResourceResponse<BackendResource>(res)
  } else {
    // Use JSON when no files and no media updates
    // Backend checks: if (req.files || req.body.media) -> form-data mode
    // Otherwise: JSON mode (resourceData = req.body)
    
    if (!payload.title || !payload.title.trim()) {
      throw new Error("Title is required for update")
    }

    const jsonPayload: any = {
      title: payload.title.trim(),
    }

    // Add optional fields (but NOT media - that requires form-data per README)
    if (payload.description !== undefined) {
      jsonPayload.description = payload.description
    }
    if (payload.course_code !== undefined && payload.course_code.trim()) {
      jsonPayload.course_code = payload.course_code.trim()
    }
    if (payload.hashtags && Array.isArray(payload.hashtags) && payload.hashtags.length > 0) {
      jsonPayload.hashtags = payload.hashtags
    }

    const res = await fetch(`${RESOURCE_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        ...authHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonPayload),
    })

    return handleResourceResponse<BackendResource>(res)
  }
}

export async function deleteResource(
  id: string,
  accessToken: string,
): Promise<void> {
  const res = await fetch(`${RESOURCE_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message =
      data?.error?.message || `HTTP ${res.status} – Failed to delete resource`
    throw new Error(message)
  }
}

export async function deleteFile(
  resourceId: string,
  type: "files" | "images" | "videos" | "urls",
  index: number,
  accessToken: string,
): Promise<BackendResource> {
  const res = await fetch(`${RESOURCE_BASE_URL}/${resourceId}/${type}/${index}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  })

  return handleResourceResponse<BackendResource>(res)
}

export async function updateFileMetadata(
  resourceId: string,
  type: "files" | "images" | "videos" | "urls",
  index: number,
  caption: string,
  accessToken: string,
): Promise<BackendResource> {
  const res = await fetch(`${RESOURCE_BASE_URL}/${resourceId}/${type}/${index}`, {
    method: "PATCH",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ caption }),
  })

  return handleResourceResponse<BackendResource>(res)
}

