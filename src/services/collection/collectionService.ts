// Backend collection service API client
const API_BASE_URL = import.meta.env.VITE_COLLECTION_SERVICE_URL || 'http://localhost:3006/api/collection';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export type CollectionItemType = 'RESOURCE' | 'THREAD' | 'COMMENT' | 'EXTERNAL';
export type CollectionVisibility = 'PRIVATE' | 'PUBLIC';

// Backend collection structure
export interface BackendCollection {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  tags: string[];
  refs: string[]; // Array of reference IDs (resources, threads, comments, etc.)
  created_at: string;
  owner?: {
    id: string;
    student_code: string;
    email: string;
  };
}

// Frontend collection structure (with mapped items)
export interface CollectionItem {
  id: string;
  collection_id: string;
  type: CollectionItemType;
  reference_id?: string | null;
  url?: string | null;
  private_note?: string | null;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string | null;
  visibility: CollectionVisibility;
  tags: string[];
  owner_id: string;
  created_at: string;
  updated_at: string;
  collection_items?: CollectionItem[];
  owner?: {
    id: string;
    student_code: string;
    email: string;
    display_name?: string;
  };
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  visibility?: CollectionVisibility;
  tags?: string[];
  refs?: string[];
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  visibility?: CollectionVisibility;
  tags?: string[];
  refs?: string[];
}

export interface AddItemRequest {
  type: CollectionItemType;
  reference_id?: string;
  url?: string;
  private_note?: string;
}

// Helper to map backend collection to frontend collection
function mapBackendToFrontend(backend: BackendCollection): Collection {
  // Map refs to collection_items
  // Note: Backend only stores refs as strings, so we create items from them
  // The frontend will need to handle the type mapping based on context
  const collection_items: CollectionItem[] = (backend.refs || []).map((ref, index) => ({
    id: `${backend.id}_item_${index}`,
    collection_id: backend.id,
    type: 'RESOURCE' as CollectionItemType, // Default type, can be determined from context
    reference_id: ref,
    url: null,
    private_note: null,
    created_at: backend.created_at,
  }));

  return {
    id: backend.id,
    name: backend.name,
    description: backend.description || null,
    visibility: backend.is_public ? 'PUBLIC' : 'PRIVATE',
    tags: backend.tags || [],
    owner_id: backend.owner_id,
    created_at: backend.created_at,
    updated_at: backend.created_at, // Backend doesn't have updated_at, use created_at
    collection_items,
    owner: backend.owner, // Preserve owner data from backend
  };
}

// Helper to map frontend collection to backend request
function mapFrontendToBackend(collection: Partial<Collection>): Partial<BackendCollection> {
  const refs = collection.collection_items?.map(item => item.reference_id).filter(Boolean) as string[] || [];
  
  return {
    name: collection.name,
    description: collection.description || null,
    is_public: collection.visibility === 'PUBLIC',
    tags: collection.tags || [],
    refs,
  };
}

const getHeaders = (accessToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add API key if available
  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }
  
  // Add Bearer token for authentication
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { error: { message: `HTTP ${response.status}: Request failed` } };
    }
    
    if (response.status === 401) {
      throw new Error(error.error?.message || 'Authentication required');
    }
    if (response.status === 403) {
      throw new Error(error.error?.message || 'Access forbidden');
    }
    if (response.status === 404) {
      throw new Error(error.error?.message || 'Resource not found');
    }
    
    throw new Error(error.error?.message || `HTTP ${response.status}: Request failed`);
  }
  
  return response.json();
}

// Get all collections
export async function getAllCollections(
  accessToken?: string,
  options?: {
    filter?: 'all' | 'my' | 'public';
    is_public?: boolean;
    tag?: string;
    search?: string;
  }
): Promise<Collection[]> {
  try {
    const queryParams = new URLSearchParams();
    if (options?.filter) {
      queryParams.append('filter', options.filter);
    }
    if (options?.is_public !== undefined) {
      queryParams.append('is_public', String(options.is_public));
    }
    if (options?.tag) {
      queryParams.append('tag', options.tag);
    }
    if (options?.search) {
      queryParams.append('search', options.search);
    }

    const url = queryParams.toString() 
      ? `${API_BASE_URL}?${queryParams.toString()}`
      : API_BASE_URL;

    const response = await fetch(url, {
      headers: getHeaders(accessToken),
    });

    const data = await handleResponse<{ success: boolean; collections: BackendCollection[] }>(response);
    return (data.collections || []).map(mapBackendToFrontend);
  } catch (error) {
    console.error('Error fetching collections:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch collections: Network error');
  }
}

// Get collection by ID
export async function getCollectionById(id: string, accessToken?: string): Promise<Collection> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      headers: getHeaders(accessToken),
    });

    const data = await handleResponse<{ success: boolean; collection: BackendCollection }>(response);
    return mapBackendToFrontend(data.collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch collection: Network error');
  }
}

// Create collection
export async function createCollection(
  request: CreateCollectionRequest,
  accessToken: string
): Promise<Collection> {
  try {
    const backendRequest = {
      name: request.name,
      description: request.description || null,
      is_public: request.visibility === 'PUBLIC',
      tags: request.tags || [],
      refs: request.refs || [],
    };

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(accessToken),
      body: JSON.stringify(backendRequest),
    });

    const data = await handleResponse<{ success: boolean; collection: BackendCollection }>(response);
    return mapBackendToFrontend(data.collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create collection: Network error');
  }
}

// Update collection
export async function updateCollection(
  id: string,
  request: UpdateCollectionRequest,
  accessToken: string
): Promise<Collection> {
  try {
    const backendRequest: any = {};
    if (request.name !== undefined) backendRequest.name = request.name;
    if (request.description !== undefined) backendRequest.description = request.description || null;
    if (request.visibility !== undefined) backendRequest.is_public = request.visibility === 'PUBLIC';
    if (request.tags !== undefined) backendRequest.tags = request.tags;
    if (request.refs !== undefined) backendRequest.refs = request.refs;

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(accessToken),
      body: JSON.stringify(backendRequest),
    });

    const data = await handleResponse<{ success: boolean; collection: BackendCollection }>(response);
    return mapBackendToFrontend(data.collection);
  } catch (error) {
    console.error('Error updating collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update collection: Network error');
  }
}

// Delete collection
export async function deleteCollection(id: string, accessToken: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(accessToken),
    });

    await handleResponse<{ success: boolean; message: string }>(response);
  } catch (error) {
    console.error('Error deleting collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete collection: Network error');
  }
}

// Update collection is used for all changes (name, visibility, refs)
