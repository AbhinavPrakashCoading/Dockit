import { openDB, DBSchema, IDBPDatabase } from 'idb';
// Allow runtime requires in server-only code paths without importing Node modules in client bundles
declare const require: any;

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
  pdfCache: {
    key: string; // URL of the cached PDF
    value: {
      url: string;
      data: ArrayBuffer;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

/**
 * Database name and version
 */
const DB_NAME = 'dockit-schemas';
const DB_VERSION = 2; // Incremented for new pdfCache store
const SCHEMA_STORE = 'schemas';
const PDF_CACHE_STORE = 'pdfCache';
const MAX_SCHEMAS = 50;
const PDF_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Lazy initialization to prevent SSR issues
let _dbPromise: Promise<IDBPDatabase<SchemaDB>> | null = null;

/**
 * Server-side fallback storage location for SSR (file-based)
 */
// Server-side fallback paths (initialized lazily to avoid client-side bundling issues)
let SERVER_DATA_DIR: string | null = null;
let SERVER_SCHEMA_FILE: string | null = null;
let SERVER_PDF_INDEX: string | null = null;
let SERVER_PDF_DIR: string | null = null;

function ensureServerDirs() {
  // Only run on server
  if (typeof window !== 'undefined') return;

  try {
    // Lazy require to avoid bundling Node modules into client bundle
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');

    if (!SERVER_DATA_DIR) SERVER_DATA_DIR = path.join(process.cwd(), '.dockit_data');
    if (!SERVER_SCHEMA_FILE) SERVER_SCHEMA_FILE = path.join(SERVER_DATA_DIR!, 'schemas.json');
    if (!SERVER_PDF_INDEX) SERVER_PDF_INDEX = path.join(SERVER_DATA_DIR!, 'pdf_index.json');
    if (!SERVER_PDF_DIR) SERVER_PDF_DIR = path.join(SERVER_DATA_DIR!, 'pdf_cache');

    if (!fs.existsSync(SERVER_DATA_DIR)) fs.mkdirSync(SERVER_DATA_DIR);
    if (!fs.existsSync(SERVER_PDF_DIR)) fs.mkdirSync(SERVER_PDF_DIR);
    if (!fs.existsSync(SERVER_SCHEMA_FILE)) fs.writeFileSync(SERVER_SCHEMA_FILE, JSON.stringify({}), 'utf-8');
    if (!fs.existsSync(SERVER_PDF_INDEX)) fs.writeFileSync(SERVER_PDF_INDEX, JSON.stringify({}), 'utf-8');
  } catch (e) {
    // Ignore errors; best-effort fallback
    // eslint-disable-next-line no-console
    console.warn('Failed to ensure server dirs for fallback storage:', e);
  }
}

/**
 * Initialize and return the IndexedDB connection
 * Only initializes in browser environment
 */
function getDbPromise(): Promise<IDBPDatabase<SchemaDB>> {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available in SSR'));
  }
  
  if (!_dbPromise) {
    _dbPromise = openDB<SchemaDB>(
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
          
          // Create the PDF cache object store if it doesn't exist
          if (!db.objectStoreNames.contains(PDF_CACHE_STORE)) {
            const cacheStore = db.createObjectStore(PDF_CACHE_STORE, {
              keyPath: 'url',
            });
            
            // Create index for timestamp-based queries and cleanup
            cacheStore.createIndex('by-timestamp', 'timestamp');
          }
        },
      }
    );
  }
  
  return _dbPromise;
}

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
  // If running on server (SSR), use file-based fallback to avoid IndexedDB rejection
  if (typeof window === 'undefined') {
    try {
      ensureServerDirs();
      // runtime require to avoid bundling 'fs' into client
      const fs = require('fs');
      const content = fs.readFileSync(SERVER_SCHEMA_FILE!, 'utf-8');
      const data = content ? JSON.parse(content) : {};
      data[examForm] = { exam_form: examForm, schema, timestamp: Date.now() };
      fs.writeFileSync(SERVER_SCHEMA_FILE!, JSON.stringify(data, null, 2), 'utf-8');
      return;
    } catch (err) {
      console.warn('Server fallback: failed to store schema to file:', err);
      return; // Non-fatal fallback
    }
  }

  try {
    const db = await getDbPromise();

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
      const db = await getDbPromise();
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
    const db = await getDbPromise();
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
    const db = await getDbPromise();
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
    const db = await getDbPromise();
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
    const db = await getDbPromise();
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
    const db = await getDbPromise();
    return await db.count(SCHEMA_STORE);
  } catch (error) {
    throw new Error(
      `Failed to get schema count: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Store a PDF in the cache with 24h TTL
 * @param url - The URL of the PDF
 * @param data - The PDF data as ArrayBuffer
 */
export async function cachePDF(url: string, data: ArrayBuffer): Promise<void> {
  // Server-side fallback: store PDF to filesystem cache
  if (typeof window === 'undefined') {
    try {
      ensureServerDirs();
      // runtime require to avoid bundling Node modules into client
      const fs = require('fs');
      const path = require('path');
      const indexContent = fs.readFileSync(SERVER_PDF_INDEX!, 'utf-8');
      const index = indexContent ? JSON.parse(indexContent) : {};
      const filename = Buffer.from(url).toString('base64') + '.bin';
      const filePath = path.join(SERVER_PDF_DIR!, filename);
      // Write binary data
      fs.writeFileSync(filePath, Buffer.from(new Uint8Array(data)));
      index[url] = { filename, timestamp: Date.now() };
      fs.writeFileSync(SERVER_PDF_INDEX!, JSON.stringify(index, null, 2), 'utf-8');
      return;
    } catch (err) {
      console.warn('Server fallback: failed to cache PDF to file:', err);
      return; // Non-fatal
    }
  }

  try {
    const db = await getDbPromise();
    await db.put(PDF_CACHE_STORE, {
      url,
      data,
      timestamp: Date.now(),
    });
    
    // Clean up expired cache entries
    await cleanExpiredPDFCache();
  } catch (error) {
    console.error('Failed to cache PDF:', error);
    // Non-critical, so we don't throw
  }
}

/**
 * Retrieve a cached PDF if it exists and is not expired
 * @param url - The URL of the PDF
 * @returns The cached PDF data or null if not found or expired
 */
export async function getCachedPDF(url: string): Promise<ArrayBuffer | null> {
  // Server-side fallback: read from filesystem cache
  if (typeof window === 'undefined') {
    try {
      ensureServerDirs();
      // runtime require to avoid bundling Node modules into client
      const fs = require('fs');
      const path = require('path');
      const indexContent = fs.readFileSync(SERVER_PDF_INDEX!, 'utf-8');
      const index = indexContent ? JSON.parse(indexContent) : {};
      const entry = index[url];
      if (!entry) return null;
      const age = Date.now() - (entry.timestamp || 0);
      if (age > PDF_CACHE_TTL) {
        // delete expired
        try {
          fs.unlinkSync(path.join(SERVER_PDF_DIR!, entry.filename));
        } catch (e) {
          // ignore
        }
        delete index[url];
        fs.writeFileSync(SERVER_PDF_INDEX!, JSON.stringify(index, null, 2), 'utf-8');
        return null;
      }

      const filePath = path.join(SERVER_PDF_DIR!, entry.filename);
      if (!fs.existsSync(filePath)) return null;
      const buf = fs.readFileSync(filePath);
      // Convert Buffer to ArrayBuffer
      const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      return arrayBuffer;
    } catch (err) {
      console.warn('Server fallback: failed to retrieve cached PDF from file:', err);
      return null;
    }
  }

  try {
    const db = await getDbPromise();
    const cached = await db.get(PDF_CACHE_STORE, url);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is expired (24 hours)
    const age = Date.now() - cached.timestamp;
    if (age > PDF_CACHE_TTL) {
      // Delete expired cache
      await db.delete(PDF_CACHE_STORE, url);
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.error('Failed to retrieve cached PDF:', error);
    return null;
  }
}

/**
 * Clean up expired PDF cache entries
 */
async function cleanExpiredPDFCache(): Promise<void> {
  try {
    const db = await getDbPromise();
    const allCached = await db.getAllFromIndex(
      PDF_CACHE_STORE,
      'by-timestamp'
    );
    
    const now = Date.now();
    for (const entry of allCached) {
      const age = now - entry.timestamp;
      if (age > PDF_CACHE_TTL) {
        await db.delete(PDF_CACHE_STORE, entry.url);
      }
    }
  } catch (error) {
    console.error('Failed to clean expired PDF cache:', error);
  }
}

/**
 * Clear all cached PDFs
 */
export async function clearPDFCache(): Promise<void> {
  try {
    const db = await getDbPromise();
    await db.clear(PDF_CACHE_STORE);
  } catch (error) {
    throw new Error(
      `Failed to clear PDF cache: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
