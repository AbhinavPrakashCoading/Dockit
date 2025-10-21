/**
 * Cache Manager
 * Manages caching of discovery results for performance
 */

interface DiscoveryResult {
  examId: string;
  examName: string;
  requirements: any[];
  sources: any[];
  confidence: number;
  validationScore: number;
  discoveryPath: string[];
  metadata: any;
}

interface CacheEntry {
  result: DiscoveryResult;
  cachedAt: string;
  expiresAt: string;
  accessCount: number;
  lastAccessed: string;
}

export class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 3600000; // 1 hour
  private maxSize: number = 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(ttl?: number, maxSize?: number) {
    if (ttl) this.defaultTTL = ttl;
    if (maxSize) this.maxSize = maxSize;
    
    // Start cleanup process
    this.startCleanup();
  }

  /**
   * Store discovery result in cache
   */
  async store(examName: string, result: DiscoveryResult, ttl?: number): Promise<void> {
    const key = this.generateKey(examName);
    const expirationTime = ttl || this.defaultTTL;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationTime);

    const entry: CacheEntry = {
      result,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      accessCount: 0,
      lastAccessed: now.toISOString()
    };

    // Ensure cache doesn't exceed max size
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, entry);
    console.log(`📦 Cached result for: ${examName} (expires: ${expiresAt.toLocaleString()})`);
  }

  /**
   * Retrieve discovery result from cache
   */
  async get(examName: string): Promise<DiscoveryResult | null> {
    const key = this.generateKey(examName);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      console.log(`🗑️ Removed expired cache entry for: ${examName}`);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = new Date().toISOString();

    console.log(`📦 Cache hit for: ${examName} (accessed ${entry.accessCount} times)`);
    return entry.result;
  }

  /**
   * Check if cache entry is expired
   */
  isExpired(entry: CacheEntry): boolean {
    return new Date() > new Date(entry.expiresAt);
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(examName: string): Promise<void> {
    const key = this.generateKey(examName);
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      console.log(`🗑️ Invalidated cache for: ${examName}`);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared cache (${size} entries removed)`);
  }

  /**
   * Update existing cache entry
   */
  async update(examName: string, updates: Partial<DiscoveryResult>): Promise<boolean> {
    const key = this.generateKey(examName);
    const entry = this.cache.get(key);

    if (!entry || this.isExpired(entry)) {
      return false;
    }

    // Merge updates
    entry.result = { ...entry.result, ...updates };
    entry.lastAccessed = new Date().toISOString();

    console.log(`📝 Updated cache entry for: ${examName}`);
    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: { key: string; cachedAt: string; accessCount: number; isExpired: boolean }[];
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      cachedAt: entry.cachedAt,
      accessCount: entry.accessCount,
      isExpired: this.isExpired(entry)
    }));

    // Calculate hit rate (simplified)
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const hitRate = entries.length > 0 ? totalAccesses / entries.length : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      entries
    };
  }

  /**
   * Get cache entries matching pattern
   */
  findByPattern(pattern: string): CacheEntry[] {
    const regex = new RegExp(pattern, 'i');
    const matches: CacheEntry[] = [];

    for (const [key, entry] of this.cache) {
      if (regex.test(key) || regex.test(entry.result.examName)) {
        matches.push(entry);
      }
    }

    return matches;
  }

  /**
   * Preload frequently used exams
   */
  async preload(examNames: string[], discoveryFunction: (name: string) => Promise<DiscoveryResult>): Promise<void> {
    console.log(`🔄 Preloading ${examNames.length} exams...`);

    const promises = examNames.map(async (examName) => {
      const key = this.generateKey(examName);
      
      // Skip if already cached and not expired
      const existing = this.cache.get(key);
      if (existing && !this.isExpired(existing)) {
        return;
      }

      try {
        const result = await discoveryFunction(examName);
        await this.store(examName, result);
      } catch (error) {
        console.log(`Failed to preload ${examName}:`, error.message);
      }
    });

    await Promise.all(promises);
    console.log(`✅ Preloading complete`);
  }

  /**
   * Generate cache key from exam name
   */
  private generateKey(examName: string): string {
    return examName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey: string | null = null;
    let oldestTime: Date | null = null;

    for (const [key, entry] of this.cache) {
      const lastAccessed = new Date(entry.lastAccessed);
      
      if (!oldestTime || lastAccessed < oldestTime) {
        oldestTime = lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Evicted LRU entry: ${oldestKey}`);
    }
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 300000); // 5 minutes
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  /**
   * Stop cleanup process
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Export cache data for persistence
   */
  export(): { [key: string]: CacheEntry } {
    const exported: { [key: string]: CacheEntry } = {};
    
    for (const [key, entry] of this.cache) {
      if (!this.isExpired(entry)) {
        exported[key] = entry;
      }
    }

    return exported;
  }

  /**
   * Import cache data from persistence
   */
  import(data: { [key: string]: CacheEntry }): void {
    for (const [key, entry] of Object.entries(data)) {
      if (!this.isExpired(entry)) {
        this.cache.set(key, entry);
      }
    }

    console.log(`📥 Imported ${Object.keys(data).length} cache entries`);
  }
}