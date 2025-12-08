// Backend feed service API client
const API_BASE_URL = import.meta.env.VITE_FEED_SERVICE_URL || 'http://localhost:3004/api/feed';

// Backend thread structure
export interface BackendThread {
  id: string;
  author_id: string;
  content: string;
  tags: string[];
  visibility: 'public' | 'private';
  allowed_viewers?: string[];
  likes_count: number;
  comments_count: number;
  status: 'open' | 'closed';
  attachments?: {
    images?: Array<{ id: string; url: string }>;
    videos?: Array<{ id: string; url: string }>;
  } | null;
  is_deleted: boolean;
  deleted_at?: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    student_code: string;
    email: string;
    name?: string;
  };
}

// Backend comment structure
export interface BackendComment {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string | null;
  likes_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    student_code: string;
    email: string;
    name?: string;
  };
  parent_comment?: BackendComment | null;
}

// Frontend types (from data/feed.ts)
export type FeedPrivacy = "public" | "friends";
export type ThreadType = "Q&A" | "Normal";
export type ThreadStatus = "OPEN" | "CLOSED";

export interface FeedMediaItem {
  id: string;
  type: "image" | "video";
  url?: string;
  thumbColor: string;
  label: string;
}

export interface FeedComment {
  id: string;
  author: string;
  author_id?: string;
  initials: string;
  text: string;
  createdAt: string;
  isEdited?: boolean;
  parentCommentId?: string | null;
  parentAuthor?: string | null;
}

export interface FeedPost {
  authorId: string;
  id: string;
  author: {
    name: string;
    studentCode?: string;
    initials: string;
    isFriend: boolean;
  };
  createdAt: string;
  privacy: FeedPrivacy;
  threadType: ThreadType;
  status: ThreadStatus;
  isEdited?: boolean;
  title: string;
  content: string;
  eventTag?: string;
  media: FeedMediaItem[];
  stats: {
    likes: number;
    comments: number;
  };
  comments: FeedComment[];
}

// Helper functions
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

const getHeaders = (accessToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      const text = await response.text();
      error = { error: { message: `HTTP ${response.status}: ${text || 'Request failed'}` } };
    }
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in.');
    }
    if (response.status === 403) {
      throw new Error(error.error?.message || 'Access denied. Invalid permissions.');
    }
    if (response.status === 404) {
      throw new Error(error.error?.message || 'Resource not found.');
    }
    if (response.status === 400) {
      // Validation errors
      const details = error.error?.details;
      if (Array.isArray(details) && details.length > 0) {
        throw new Error(`Validation failed: ${details.join(', ')}`);
      }
      throw new Error(error.error?.message || 'Invalid request');
    }
    
    throw new Error(error.error?.message || `HTTP ${response.status}: Request failed`);
  }
  
  const data = await response.json();
  return data;
};

// Map backend thread to frontend FeedPost
export function mapBackendThreadToFeedPost(thread: BackendThread, _currentUserId?: string): FeedPost {
  // Extract title from content (first line or first 50 chars)
  const contentLines = thread.content.split('\n');
  const firstLine = contentLines[0]?.trim() || '';
  const title = firstLine.length > 0 && firstLine.length <= 100 
    ? firstLine 
    : thread.content.substring(0, 50).trim();
  const content = contentLines.length > 1 
    ? contentLines.slice(1).join('\n').trim() 
    : (firstLine.length > 100 ? thread.content.trim() : '');
  
  // Determine thread type from tags
  const threadType: ThreadType = thread.tags?.some(tag => 
    tag.toLowerCase().includes('q&a') || tag.toLowerCase().includes('qa') || tag.toLowerCase() === 'q&a'
  ) ? 'Q&A' : 'Normal';
  
  // Get event tag if exists
  const eventTag = thread.tags?.find(tag => 
    !tag.toLowerCase().includes('q&a') && 
    !tag.toLowerCase().includes('qa') && 
    !tag.toLowerCase().includes('discussion')
  );
  
  // Map attachments to media items
  const media: FeedMediaItem[] = [];
  if (thread.attachments?.images) {
    thread.attachments.images.forEach((img, idx) => {
      media.push({
        id: img.id || `img-${idx}`,
        type: 'image',
        url: img.url,
        thumbColor: '#036aff',
        label: 'Image',
      });
    });
  }
  if (thread.attachments?.videos) {
    thread.attachments.videos.forEach((vid, idx) => {
      media.push({
        id: vid.id || `vid-${idx}`,
        type: 'video',
        thumbColor: '#ef4444',
        label: 'Video',
      });
    });
  }
  
  // Get author info
  const authorName = thread.author?.name || thread.author?.student_code || 'Unknown';
  const authorStudentCode = thread.author?.student_code;
  const initials = authorName
    .split(' ')
    .map(n => n[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'U';
  
  return {
    authorId: thread.author_id,
    id: thread.id,
    author: {
      name: authorName,
      studentCode: authorStudentCode,
      initials,
      isFriend: false, // TODO: Implement friend checking
    },
    createdAt: formatRelativeTime(new Date(thread.created_at)),
    privacy: thread.visibility === 'private' ? 'friends' : 'public',
    threadType,
    status: thread.status.toUpperCase() as ThreadStatus,
    isEdited: thread.is_edited,
    title: title.trim(),
    content: content.trim(),
    eventTag,
    media,
    stats: {
      likes: thread.likes_count || 0,
      comments: thread.comments_count || 0,
    },
    comments: [], // Will be loaded separately
  };
}

// Map backend comment to frontend FeedComment
export function mapBackendCommentToFeedComment(comment: BackendComment): FeedComment {
  const authorName = comment.author?.name || comment.author?.student_code || 'Unknown';
  const initials = authorName
    .split(' ')
    .map(n => n[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'U';
  
  return {
    id: comment.id,
    author: authorName,
    author_id: comment.author_id,
    initials,
    text: comment.content,
    createdAt: formatRelativeTime(new Date(comment.created_at)),
    isEdited: comment.is_edited,
    parentCommentId: comment.parent_comment_id || null,
    parentAuthor: comment.parent_comment?.author?.name || comment.parent_comment?.author?.student_code || null,
  };
}

// API Functions

export async function getAllThreads(
  accessToken: string,
  filters?: {
    tags?: string[];
    visibility?: 'public' | 'private';
    status?: 'open' | 'closed';
    search?: string;
  }
): Promise<{ count: number; threads: BackendThread[] }> {
  try {
    const params = new URLSearchParams();
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }
    if (filters?.visibility) {
      params.append('visibility', filters.visibility);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    const url = `${API_BASE_URL}/threads${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(accessToken),
    });
    
    return handleResponse<{ success: boolean; count: number; threads: BackendThread[] }>(response);
  } catch (error) {
    console.error('Error fetching threads:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch threads: Network error');
  }
}

export interface CreateThreadRequest {
  content: string;
  tags?: string[];
  visibility?: 'public' | 'private';
  allowed_viewers?: string[];
  attachments?: {
    images?: Array<{ id: string; url: string }>;
    videos?: Array<{ id: string; url: string }>;
  };
}

export async function createThread(
  request: CreateThreadRequest,
  accessToken: string
): Promise<BackendThread> {
  try {
    const headers = getHeaders(accessToken);
    const body = JSON.stringify(request);
    
    const response = await fetch(`${API_BASE_URL}/threads`, {
      method: 'POST',
      headers,
      body,
    });
    
    const data = await handleResponse<{ success: boolean; thread: BackendThread }>(response);
    return data.thread;
  } catch (error) {
    console.error('Error creating thread:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create thread: Network error');
  }
}

export interface UpdateThreadRequest {
  title?: string;
  content?: string;
  tags?: string[];
  visibility?: 'public' | 'private';
  allowed_viewers?: string[];
  attachments?: {
    images?: Array<{ id: string; url: string }>;
    videos?: Array<{ id: string; url: string }>;
  };
}

export async function updateThread(
  threadId: string,
  request: UpdateThreadRequest,
  accessToken: string
): Promise<BackendThread> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
      method: 'PUT',
      headers: getHeaders(accessToken),
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse<{ success: boolean; thread: BackendThread }>(response);
    return data.thread;
  } catch (error) {
    console.error('Error updating thread:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update thread: Network error');
  }
}

export async function deleteThread(
  threadId: string,
  accessToken: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    });
    
    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting thread:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete thread: Network error');
  }
}

export async function getThreadById(
  threadId: string,
  accessToken: string
): Promise<BackendThread> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}`, {
      method: 'POST',
      headers: getHeaders(accessToken),
    });
    
    const data = await handleResponse<{ success: boolean; thread: BackendThread }>(response);
    return data.thread;
  } catch (error) {
    console.error('Error fetching thread:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch thread: Network error');
  }
}

export async function closeThread(
  threadId: string,
  accessToken: string
): Promise<BackendThread> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/close`, {
      method: 'POST',
      headers: getHeaders(accessToken),
    });
    
    const data = await handleResponse<{ success: boolean; thread: BackendThread }>(response);
    return data.thread;
  } catch (error) {
    console.error('Error closing thread:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to close thread: Network error');
  }
}

export async function reopenThread(
  threadId: string,
  accessToken: string
): Promise<BackendThread> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/reopen`, {
      method: 'POST',
      headers: getHeaders(accessToken),
    });
    
    const data = await handleResponse<{ success: boolean; thread: BackendThread }>(response);
    return data.thread;
  } catch (error) {
    console.error('Error reopening thread:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to reopen thread: Network error');
  }
}

// Comment APIs

export async function getCommentsByThreadId(
  threadId: string,
  accessToken: string
): Promise<BackendComment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/comments`, {
      headers: getHeaders(accessToken),
    });
    
    const data = await handleResponse<{ success: boolean; count: number; comments: BackendComment[] }>(response);
    return data.comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch comments: Network error');
  }
}

export interface CreateCommentRequest {
  content: string;
  parent_comment_id?: string | null;
}

export async function createComment(
  threadId: string,
  request: CreateCommentRequest,
  accessToken: string
): Promise<BackendComment> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/comments`, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse<{ success: boolean; comment: BackendComment }>(response);
    return data.comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create comment: Network error');
  }
}

export interface UpdateCommentRequest {
  content: string;
}

export async function updateComment(
  commentId: string,
  request: UpdateCommentRequest,
  accessToken: string
): Promise<BackendComment> {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      headers: getHeaders(accessToken),
      body: JSON.stringify(request),
    });
    
    const data = await handleResponse<{ success: boolean; comment: BackendComment }>(response);
    return data.comment;
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update comment: Network error');
  }
}

export async function deleteComment(
  commentId: string,
  accessToken: string
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    });
    
    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete comment: Network error');
  }
}

// Get deleted threads (for restoration)
export async function getDeletedThreads(
  accessToken: string
): Promise<BackendThread[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/deleted`, {
      headers: getHeaders(accessToken),
    });
    
    const data = await handleResponse<{ success: boolean; threads: BackendThread[] }>(response);
    return data.threads;
  } catch (error) {
    console.error('Error fetching deleted threads:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch deleted threads: Network error');
  }
}

// Restore a deleted thread
export async function restoreThread(
  threadId: string,
  accessToken: string
): Promise<BackendThread> {
  try {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/restore`, {
      method: 'POST',
      headers: getHeaders(accessToken),
    });
    
    const data = await handleResponse<{ success: boolean; thread: BackendThread }>(response);
    return data.thread;
  } catch (error) {
    console.error('Error restoring thread:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to restore thread: Network error');
  }
}

