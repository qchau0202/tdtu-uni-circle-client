// Backend collection service API client
const API_BASE_URL = import.meta.env.VITE_COLLECTION_SERVICE_URL || 'http://localhost:3005/api/collections';
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
  filters?: {
    filter?: 'all' | 'my' | 'public';
    is_public?: boolean;
    tag?: string;
    search?: string;
  }
): Promise<Collection[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.filter) params.append('filter', filters.filter);
    if (filters?.is_public !== undefined) params.append('is_public', String(filters.is_public));
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.search) params.append('search', filters.search);

    const url = params.toString() ? `${API_BASE_URL}?${params.toString()}` : API_BASE_URL;
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

// Get all collections for a user (convenience function)
export async function getUserCollections(userId: string, accessToken?: string): Promise<Collection[]> {
  return getAllCollections(accessToken, { filter: 'my' });
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

// Add item to collection (by updating refs array)
export async function addItemToCollection(
  collectionId: string,
  item: AddItemRequest,
  accessToken: string
): Promise<Collection> {
  try {
    // First, get the current collection
    const currentCollection = await getCollectionById(collectionId, accessToken);
    
    // Determine the reference ID to add
    const referenceId = item.reference_id || item.url || '';
    if (!referenceId) {
      throw new Error('reference_id or url is required');
    }
    
    // Add the reference to the refs array if not already present
    const currentRefs = currentCollection.collection_items?.map(item => item.reference_id).filter(Boolean) as string[] || [];
    if (currentRefs.includes(referenceId)) {
      // Item already exists, return current collection
      return currentCollection;
    }
    
    const updatedRefs = [...currentRefs, referenceId];
    
    // Update the collection with the new refs
    return updateCollection(collectionId, { refs: updatedRefs }, accessToken);
  } catch (error) {
    console.error('Error adding item to collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add item to collection: Network error');
  }
}

// Update collection item (note: backend doesn't support item-level updates, only refs)
// This is a convenience function that would require fetching and updating the entire collection
export async function updateCollectionItem(
  itemId: string,
  collectionId: string,
  private_note: string,
  accessToken: string
): Promise<CollectionItem> {
  // Note: Backend doesn't support item-level metadata like private_note
  // This would need to be stored separately or the backend would need to support it
  // For now, we'll just return a placeholder
  throw new Error('Item-level updates are not supported by the backend. Use updateCollection instead.');
}

// Remove item from collection (by updating refs array)
export async function removeItemFromCollection(
  collectionId: string,
  referenceId: string,
  accessToken: string
): Promise<Collection> {
  try {
    // Get the current collection
    const currentCollection = await getCollectionById(collectionId, accessToken);
    
    // Remove the reference from the refs array
    const currentRefs = currentCollection.collection_items?.map(item => item.reference_id).filter(Boolean) as string[] || [];
    const updatedRefs = currentRefs.filter(ref => ref !== referenceId);
    
    // Update the collection with the updated refs
    return updateCollection(collectionId, { refs: updatedRefs }, accessToken);
  } catch (error) {
    console.error('Error removing item from collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to remove item from collection: Network error');
  }
}

// Search collections
export async function searchCollections(
  query?: string,
  tags?: string[],
  accessToken?: string
): Promise<Collection[]> {
  try {
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (tags && tags.length > 0) {
      tags.forEach(tag => params.append('tag', tag));
    }
    params.append('filter', 'public'); // Search only public collections

    const response = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      headers: getHeaders(accessToken),
    });

    const data = await handleResponse<{ success: boolean; collections: BackendCollection[] }>(response);
    return (data.collections || []).map(mapBackendToFrontend);
  } catch (error) {
    console.error('Error searching collections:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to search collections: Network error');
  }
}

// Clone collection (not directly supported by backend, would need to create new collection with same data)
export async function cloneCollection(
  id: string,
  newName: string,
  accessToken: string
): Promise<Collection> {
  try {
    // Get the original collection
    const original = await getCollectionById(id, accessToken);
    
    // Create a new collection with the same data but private
    return createCollection({
      name: newName || `${original.name} (Copy)`,
      description: original.description || undefined,
      visibility: 'PRIVATE',
      tags: original.tags,
      refs: original.collection_items?.map(item => item.reference_id).filter(Boolean) as string[] || [],
    }, accessToken);
  } catch (error) {
    console.error('Error cloning collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to clone collection: Network error');
  }
}
