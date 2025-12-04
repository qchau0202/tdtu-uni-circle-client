const API_BASE_URL = import.meta.env.VITE_COLLECTION_SERVICE_URL || 'http://localhost:3006/api/collections';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export type CollectionItemType = 'RESOURCE' | 'THREAD' | 'COMMENT' | 'EXTERNAL';
export type CollectionVisibility = 'PRIVATE' | 'PUBLIC';

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
  owner_id: string;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  visibility?: CollectionVisibility;
  tags?: string[];
}

export interface AddItemRequest {
  type: CollectionItemType;
  reference_id?: string;
  url?: string;
  private_note?: string;
}

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // Always send API key if available, otherwise backend will return 401
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }
  return headers;
};

// Get all collections for a user
export async function getUserCollections(userId: string): Promise<Collection[]> {
  try {
    const response = await fetch(`${API_BASE_URL}?userId=${userId}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { error: { message: `HTTP ${response.status}: Failed to fetch collections` } };
      }
      
      if (response.status === 401) {
        throw new Error('API key is required. Please set VITE_API_KEY in your environment variables.');
      }
      if (response.status === 403) {
        throw new Error('Invalid API key. Please check your VITE_API_KEY environment variable.');
      }
      
      throw new Error(error.error?.message || `HTTP ${response.status}: Failed to fetch collections`);
    }

    const data = await response.json();
    return data.collections || data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch collections: Network error');
  }
}

// Get collection by ID
export async function getCollectionById(id: string, userId: string): Promise<Collection> {
  const response = await fetch(`${API_BASE_URL}/${id}?userId=${userId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch collection');
  }

  const data = await response.json();
  return data.collection;
}

// Create collection
export async function createCollection(request: CreateCollectionRequest): Promise<Collection> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { error: { message: `HTTP ${response.status}: Failed to create collection` } };
      }
      
      if (response.status === 401) {
        throw new Error('API key is required. Please set VITE_API_KEY in your environment variables.');
      }
      
      throw new Error(error.error?.message || `HTTP ${response.status}: Failed to create collection`);
    }

    const data = await response.json();
    return data.collection || data;
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
  userId: string,
  request: UpdateCollectionRequest
): Promise<Collection> {
  const response = await fetch(`${API_BASE_URL}/${id}?userId=${userId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update collection');
  }

  const data = await response.json();
  return data.collection;
}

// Delete collection
export async function deleteCollection(id: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}?userId=${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to delete collection');
  }
}

// Add item to collection
export async function addItemToCollection(
  collectionId: string,
  userId: string,
  item: AddItemRequest
): Promise<CollectionItem> {
  try {
    const response = await fetch(`${API_BASE_URL}/${collectionId}/items?userId=${userId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { error: { message: `HTTP ${response.status}: Failed to add item` } };
      }
      
      if (response.status === 401) {
        throw new Error('API key is required. Please set VITE_API_KEY in your environment variables.');
      }
      if (response.status === 403) {
        throw new Error(error.error?.message || 'You do not have permission to add items to this collection.');
      }
      
      throw new Error(error.error?.message || `HTTP ${response.status}: Failed to add item to collection`);
    }

    const data = await response.json();
    return data.item || data;
  } catch (error) {
    console.error('Error adding item to collection:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to add item to collection: Network error');
  }
}

// Update collection item
export async function updateCollectionItem(
  itemId: string,
  userId: string,
  private_note: string
): Promise<CollectionItem> {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}?userId=${userId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ private_note }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update item');
  }

  const data = await response.json();
  return data.item;
}

// Remove item from collection
export async function removeItemFromCollection(itemId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}?userId=${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to remove item from collection');
  }
}

// Search collections
export async function searchCollections(
  query?: string,
  tags?: string[],
  userId?: string
): Promise<Collection[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (tags) tags.forEach(tag => params.append('tags', tag));
  if (userId) params.append('userId', userId);

  const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to search collections');
  }

  const data = await response.json();
  return data.collections || [];
}

// Clone collection
export async function cloneCollection(
  id: string,
  userId: string,
  newName?: string
): Promise<Collection> {
  const response = await fetch(`${API_BASE_URL}/${id}/clone`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId, newName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to clone collection');
  }

  const data = await response.json();
  return data.collection;
}

