import { AccountRecord } from "@/models/account";
import { AccountCache } from "@/storage/schemas";
import { STORAGE_KEYS } from "@/storage/keys";
import { log } from "@/utils/logger";
import { fetchAccount } from "./redditAccountService";

/** L1: Page-scoped in-memory cache */
const pageCache = new Map<string, AccountRecord>();

/** In-flight lookups to prevent duplicate concurrent requests */
const pendingLookups = new Map<string, Promise<AccountRecord | null>>();

export function getFromPageCache(username: string): AccountRecord | undefined {
  return pageCache.get(username);
}

async function getFromPersistentCache(
  username: string
): Promise<AccountRecord | undefined> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.accountCache);
    const cache = (result[STORAGE_KEYS.accountCache] ?? {}) as AccountCache;
    return cache[username];
  } catch {
    return undefined;
  }
}

async function persistAccount(record: AccountRecord): Promise<void> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.accountCache);
    const cache = (result[STORAGE_KEYS.accountCache] ?? {}) as AccountCache;

    // Preserve previously known immutable facts
    const existing = cache[record.username];
    if (existing?.createdUtc && !record.createdUtc) {
      record = { ...record, createdUtc: existing.createdUtc };
    }
    if (existing?.accountId && !record.accountId) {
      record = { ...record, accountId: existing.accountId };
    }

    cache[record.username] = record;
    await chrome.storage.local.set({ [STORAGE_KEYS.accountCache]: cache });
  } catch (e) {
    // Storage failure — not fatal, just log
    log("Failed to persist account record:", e);
  }
}

/**
 * Resolve an account record through the cache hierarchy:
 * 1. In-memory page cache
 * 2. Persistent chrome.storage.local
 * 3. Network fetch from Reddit
 *
 * Deduplicates concurrent lookups for the same username.
 */
export async function resolveAccount(
  username: string
): Promise<AccountRecord | null> {
  // L1: Page cache
  const memoryCached = pageCache.get(username);
  if (memoryCached) {
    return memoryCached;
  }

  // Deduplicate concurrent lookups
  const pending = pendingLookups.get(username);
  if (pending) {
    return pending;
  }

  const lookup = (async (): Promise<AccountRecord | null> => {
    // L2: Persistent cache
    const persistentCached = await getFromPersistentCache(username);
    if (persistentCached) {
      pageCache.set(username, persistentCached);
      return persistentCached;
    }

    // L3: Network
    const record = await fetchAccount(username);
    if (record) {
      pageCache.set(username, record);
      await persistAccount(record);
    }
    return record;
  })();

  pendingLookups.set(username, lookup);
  try {
    return await lookup;
  } finally {
    pendingLookups.delete(username);
  }
}

/** Clear the page-level cache (useful for testing) */
export function clearPageCache(): void {
  pageCache.clear();
}
