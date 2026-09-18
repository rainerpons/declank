/**
 * Test setup file for vitest.
 * Provides chrome.storage mock and other test utilities.
 */

// Mock chrome.storage.local API
const storage = new Map<string, unknown>();

const chromeStorageMock = {
  local: {
    get: vi.fn(async (keys: string | string[]) => {
      const result: Record<string, unknown> = {};
      const keyList = typeof keys === "string" ? [keys] : keys;
      for (const key of keyList) {
        const value = storage.get(key);
        if (value !== undefined) {
          result[key] = value;
        }
      }
      return result;
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(items)) {
        storage.set(key, value);
      }
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const keyList = typeof keys === "string" ? [keys] : keys;
      for (const key of keyList) {
        storage.delete(key);
      }
    }),
    clear: vi.fn(async () => {
      storage.clear();
    }),
  },
  onChanged: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

const chromeRuntimeMock = {
  onInstalled: {
    addListener: vi.fn(),
  },
  getManifest: vi.fn(() => ({
    version: "0.1.0",
  })),
};

// Assign to global
Object.defineProperty(globalThis, "chrome", {
  value: {
    storage: chromeStorageMock,
    runtime: chromeRuntimeMock,
  },
  writable: true,
});

// Export for use in tests
export { storage as mockStorage, chromeStorageMock };

// Clear storage between tests
beforeEach(() => {
  storage.clear();
  vi.clearAllMocks();
});
