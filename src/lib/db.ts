import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * IndexedDB Schema Definition for Schema Storage
 */
interface SchemaDB extends DBSchema {
  schemas: {
    key: string; // exam_form identifier (e.g., 'JEE', 'UPSC')
    value: {
      exam_form: string;
      schema: Record<string, any>;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

/**
 * Database name and version
 */
const DB_NAME = 'dockit-schemas';
const DB_VERSION = 1;
const SCHEMA_STORE = 'schemas';
const MAX_SCHEMAS = 50;

/**
 * Initialize and return the IndexedDB connection
 */
export const dbPromise: Promise<IDBPDatabase<SchemaDB>> = openDB<SchemaDB>(
  DB_NAME,
  DB_VERSION,
  {
    upgrade(db: IDBPDatabase<SchemaDB>) {
      // Create the schemas object store if it doesn't exist
      if (!db.objectStoreNames.contains(SCHEMA_STORE)) {
        const store = db.createObjectStore(SCHEMA_STORE, {
          keyPath: 'exam_form',
        });
        
        // Create index for timestamp-based queries
        store.createIndex('by-timestamp', 'timestamp');
      }
    },
  }
);

/**
 * Store a schema in IndexedDB
 * @param examForm - The exam form identifier (e.g., 'JEE', 'UPSC')
 * @param schema - The schema object to store
 * @throws Error if quota is exceeded or storage fails
 */
export async function storeSchema(
  examForm: string,
  schema: Record<string, any>
): Promise<void> {
  try {
    const db = await dbPromise;
    
    // Check if we need to prune old entries
    const count = await db.count(SCHEMA_STORE);
    if (count >= MAX_SCHEMAS) {
      await pruneOldSchemas(db);
    }
    
    // Store the schema with timestamp
    await db.put(SCHEMA_STORE, {
      exam_form: examForm,
      schema,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    // Handle quota exceeded error
    if (
      error.name === 'QuotaExceededError' ||
      error.message?.includes('quota')
    ) {
      const db = await dbPromise;
      await pruneOldSchemas(db);
      
      // Retry once after pruning
      try {
        await db.put(SCHEMA_STORE, {
          exam_form: examForm,
          schema,
          timestamp: Date.now(),
        });
      } catch (retryError) {
        throw new Error(
          `Failed to store schema after pruning: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`
        );
      }
    } else {
      throw new Error(
        `Failed to store schema: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Retrieve a schema from IndexedDB
 * @param examForm - The exam form identifier
 * @returns The schema data or null if not found
 */
export async function getSchema(
  examForm: string
): Promise<{ exam_form: string; schema: Record<string, any> } | null> {
  try {
    const db = await dbPromise;
    const result = await db.get(SCHEMA_STORE, examForm);
    
    if (!result) {
      return null;
    }
    
    // Return without timestamp (as per test expectations)
    return {
      exam_form: result.exam_form,
      schema: result.schema,
    };
  } catch (error) {
    throw new Error(
      `Failed to retrieve schema: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get all stored schemas
 * @returns Array of all stored schemas
 */
export async function getAllSchemas(): Promise<
  Array<{ exam_form: string; schema: Record<string, any>; timestamp: number }>
> {
  try {
    const db = await dbPromise;
    return await db.getAll(SCHEMA_STORE);
  } catch (error) {
    throw new Error(
      `Failed to retrieve all schemas: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a schema from IndexedDB
 * @param examForm - The exam form identifier
 */
export async function deleteSchema(examForm: string): Promise<void> {
  try {
    const db = await dbPromise;
    await db.delete(SCHEMA_STORE, examForm);
  } catch (error) {
    throw new Error(
      `Failed to delete schema: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Clear all schemas from IndexedDB
 */
export async function clearAllSchemas(): Promise<void> {
  try {
    const db = await dbPromise;
    await db.clear(SCHEMA_STORE);
  } catch (error) {
    throw new Error(
      `Failed to clear schemas: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Prune old schemas to stay within quota
 * Removes the oldest schemas when the limit is exceeded
 * @param db - The database instance
 */
async function pruneOldSchemas(db: IDBPDatabase<SchemaDB>): Promise<void> {
  try {
    // Get all schemas sorted by timestamp (oldest first)
    const allSchemas = await db.getAllFromIndex(
      SCHEMA_STORE,
      'by-timestamp'
    );
    
    // Calculate how many to delete (keep 40 when limit is 50)
    const deleteCount = Math.max(
      allSchemas.length - Math.floor(MAX_SCHEMAS * 0.8),
      0
    );
    
    // Delete the oldest schemas
    for (let i = 0; i < deleteCount; i++) {
      await db.delete(SCHEMA_STORE, allSchemas[i].exam_form);
    }
    
    console.log(`Pruned ${deleteCount} old schemas from IndexedDB`);
  } catch (error) {
    console.error('Failed to prune schemas:', error);
    // If pruning fails, try to clear all as last resort
    await db.clear(SCHEMA_STORE);
  }
}

/**
 * Get the current schema count
 * @returns Number of schemas stored
 */
export async function getSchemaCount(): Promise<number> {
  try {
    const db = await dbPromise;
    return await db.count(SCHEMA_STORE);
  } catch (error) {
    throw new Error(
      `Failed to get schema count: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
