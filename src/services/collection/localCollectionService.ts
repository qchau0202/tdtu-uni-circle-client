// Frontend-only collection service using localStorage
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

const STORAGE_KEY = 'unicircle_collections';
const ITEMS_STORAGE_KEY = 'unicircle_collection_items';

// Helper functions
const getCollections = (): Collection[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCollections = (collections: Collection[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
};

const getCollectionItems = (): CollectionItem[] => {
  try {
    const data = localStorage.getItem(ITEMS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCollectionItems = (items: CollectionItem[]): void => {
  localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
};

// Get all collections for a user
export function getUserCollections(userId: string): Collection[] {
  const collections = getCollections();
  const items = getCollectionItems();
  
  return collections
    .filter(c => c.owner_id === userId)
    .map(collection => ({
      ...collection,
      collection_items: items.filter(item => item.collection_id === collection.id)
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Get collection by ID
export function getCollectionById(id: string, userId: string): Collection | null {
  const collections = getCollections();
  const items = getCollectionItems();
  
  const collection = collections.find(c => c.id === id);
  if (!collection) return null;
  
  // Check visibility
  if (collection.visibility === 'PRIVATE' && collection.owner_id !== userId) {
    return null;
  }
  
  return {
    ...collection,
    collection_items: items.filter(item => item.collection_id === id)
  };
}

// Create collection
export function createCollection(request: {
  name: string;
  description?: string;
  visibility?: CollectionVisibility;
  tags?: string[];
  owner_id: string;
}): Collection {
  const collections = getCollections();
  const now = new Date().toISOString();
  
  const newCollection: Collection = {
    id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: request.name,
    description: request.description || null,
    visibility: request.visibility || 'PRIVATE',
    tags: request.tags || [],
    owner_id: request.owner_id,
    created_at: now,
    updated_at: now,
    collection_items: []
  };
  
  collections.push(newCollection);
  saveCollections(collections);
  
  return newCollection;
}

// Update collection
export function updateCollection(
  id: string,
  userId: string,
  request: {
    name?: string;
    description?: string;
    visibility?: CollectionVisibility;
    tags?: string[];
  }
): Collection {
  const collections = getCollections();
  const items = getCollectionItems();
  
  const index = collections.findIndex(c => c.id === id && c.owner_id === userId);
  if (index === -1) {
    throw new Error('Collection not found or access denied');
  }
  
  const collection = collections[index];
  collections[index] = {
    ...collection,
    ...(request.name && { name: request.name }),
    ...(request.description !== undefined && { description: request.description || null }),
    ...(request.visibility && { visibility: request.visibility }),
    ...(request.tags && { tags: request.tags }),
    updated_at: new Date().toISOString()
  };
  
  saveCollections(collections);
  
  return {
    ...collections[index],
    collection_items: items.filter(item => item.collection_id === id)
  };
}

// Delete collection
export function deleteCollection(id: string, userId: string): void {
  const collections = getCollections();
  const items = getCollectionItems();
  
  const index = collections.findIndex(c => c.id === id && c.owner_id === userId);
  if (index === -1) {
    throw new Error('Collection not found or access denied');
  }
  
  collections.splice(index, 1);
  saveCollections(collections);
  
  // Delete associated items
  const filteredItems = items.filter(item => item.collection_id !== id);
  saveCollectionItems(filteredItems);
}

// Add item to collection
export function addItemToCollection(
  collectionId: string,
  userId: string,
  item: {
    type: CollectionItemType;
    reference_id?: string;
    url?: string;
    private_note?: string;
  }
): CollectionItem {
  const collections = getCollections();
  const items = getCollectionItems();
  
  const collection = collections.find(c => c.id === collectionId && c.owner_id === userId);
  if (!collection) {
    throw new Error('Collection not found or access denied');
  }
  
  if (item.type === 'EXTERNAL' && !item.url) {
    throw new Error('URL is required for EXTERNAL type');
  }
  
  if (item.type !== 'EXTERNAL' && !item.reference_id) {
    throw new Error('reference_id is required for non-EXTERNAL types');
  }
  
  const newItem: CollectionItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    collection_id: collectionId,
    type: item.type,
    reference_id: item.reference_id || null,
    url: item.url || null,
    private_note: item.private_note || null,
    created_at: new Date().toISOString()
  };
  
  items.push(newItem);
  saveCollectionItems(items);
  
  return newItem;
}

// Update collection item
export function updateCollectionItem(
  itemId: string,
  userId: string,
  private_note: string
): CollectionItem {
  const collections = getCollections();
  const items = getCollectionItems();
  
  const item = items.find(i => i.id === itemId);
  if (!item) {
    throw new Error('Item not found');
  }
  
  const collection = collections.find(c => c.id === item.collection_id && c.owner_id === userId);
  if (!collection) {
    throw new Error('Access denied');
  }
  
  const index = items.findIndex(i => i.id === itemId);
  items[index] = {
    ...item,
    private_note: private_note || null
  };
  
  saveCollectionItems(items);
  
  return items[index];
}

// Remove item from collection
export function removeItemFromCollection(itemId: string, userId: string): void {
  const collections = getCollections();
  const items = getCollectionItems();
  
  const item = items.find(i => i.id === itemId);
  if (!item) {
    throw new Error('Item not found');
  }
  
  const collection = collections.find(c => c.id === item.collection_id && c.owner_id === userId);
  if (!collection) {
    throw new Error('Access denied');
  }
  
  const index = items.findIndex(i => i.id === itemId);
  items.splice(index, 1);
  saveCollectionItems(items);
}

// Search collections
export function searchCollections(
  query?: string,
  tags?: string[],
  userId?: string
): Collection[] {
  const collections = getCollections();
  const items = getCollectionItems();
  
  let results = collections.filter(c => c.visibility === 'PUBLIC');
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery) ||
      c.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  if (tags && tags.length > 0) {
    results = results.filter(c => 
      tags.some(tag => c.tags.includes(tag))
    );
  }
  
  return results.map(collection => ({
    ...collection,
    collection_items: items.filter(item => item.collection_id === collection.id)
  }));
}

// Clone collection
export function cloneCollection(
  id: string,
  userId: string,
  newName?: string
): Collection {
  const collections = getCollections();
  const items = getCollectionItems();
  
  const original = collections.find(c => c.id === id && c.visibility === 'PUBLIC');
  if (!original) {
    throw new Error('Collection not found or not cloneable');
  }
  
  const originalItems = items.filter(item => item.collection_id === id);
  const now = new Date().toISOString();
  
  const cloned: Collection = {
    id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: newName || `${original.name} (Copy)`,
    description: original.description,
    visibility: 'PRIVATE',
    tags: [...original.tags],
    owner_id: userId,
    created_at: now,
    updated_at: now,
    collection_items: []
  };
  
  collections.push(cloned);
  saveCollections(collections);
  
  // Clone items
  const clonedItems = originalItems.map(item => ({
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    collection_id: cloned.id,
    created_at: now
  }));
  
  clonedItems.forEach(item => items.push(item));
  saveCollectionItems(items);
  
  return {
    ...cloned,
    collection_items: clonedItems
  };
}

