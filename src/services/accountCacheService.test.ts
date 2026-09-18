import { resolveAccount, clearPageCache, getFromPageCache } from "@/services/accountCacheService";
import { fetchAccount } from "@/services/redditAccountService";
import { AccountRecord } from "@/models/account";
import { STORAGE_KEYS } from "@/storage/keys";

vi.mock("@/services/redditAccountService", () => ({
  fetchAccount: vi.fn(),
}));

describe("accountCacheService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearPageCache();
  });

  it("calls fetchAccount on cache miss", async () => {
    vi.mocked(fetchAccount).mockResolvedValueOnce({ status: "active", createdUtc: 100, username: "testuser", fetchedAtUtc: 0 } as AccountRecord);
    const acc = await resolveAccount("testuser");
    expect(fetchAccount).toHaveBeenCalledWith("testuser");
    expect(acc?.status).toBe("active");
  });

  it("does not call fetchAccount on page cache hit", async () => {
    vi.mocked(fetchAccount).mockResolvedValueOnce({ status: "active", username: "testuser2", fetchedAtUtc: 0 } as AccountRecord);
    await resolveAccount("testuser2");
    expect(fetchAccount).toHaveBeenCalledTimes(1);
    
    await resolveAccount("testuser2");
    expect(fetchAccount).toHaveBeenCalledTimes(1);
  });

  it("populates page cache from persistent cache without fetching", async () => {
    const mockRecord: AccountRecord = { accountId: "t2_123", username: "testuser3", status: "active", fetchedAtUtc: 0 };
    await chrome.storage.local.set({ [STORAGE_KEYS.accountCache]: { testuser3: mockRecord } });
    
    const acc = await resolveAccount("testuser3");
    expect(acc).toEqual(mockRecord);
    expect(fetchAccount).not.toHaveBeenCalled();
    expect(getFromPageCache("testuser3")).toEqual(mockRecord);
  });

  it("persists successful fetch to storage and page cache", async () => {
    const mockRecord: AccountRecord = { accountId: "t2_123", username: "testuser4", status: "active", fetchedAtUtc: 0 };
    vi.mocked(fetchAccount).mockResolvedValueOnce(mockRecord);
    
    await resolveAccount("testuser4");
    
    expect(getFromPageCache("testuser4")).toEqual(mockRecord);
    const storageData = await chrome.storage.local.get(STORAGE_KEYS.accountCache);
    expect(storageData[STORAGE_KEYS.accountCache].testuser4).toEqual(mockRecord);
  });

  it("does not persist failed fetch", async () => {
    vi.mocked(fetchAccount).mockResolvedValueOnce(null);
    const acc = await resolveAccount("testuser5");
    expect(acc).toBeNull();
    
    expect(getFromPageCache("testuser5")).toBeUndefined();
    const storageData = await chrome.storage.local.get(STORAGE_KEYS.accountCache);
    expect(storageData[STORAGE_KEYS.accountCache]).toBeUndefined();
  });

  it("handles concurrent duplicate lookups", async () => {
    const mockRecord: AccountRecord = { accountId: "t2_123", username: "testuser6", status: "active", fetchedAtUtc: 0 };
    vi.mocked(fetchAccount).mockImplementation(async () => {
      await new Promise(r => setTimeout(r, 10));
      return mockRecord;
    });
    
    const p1 = resolveAccount("testuser6");
    const p2 = resolveAccount("testuser6");
    
    await Promise.all([p1, p2]);
    expect(fetchAccount).toHaveBeenCalledTimes(1);
  });

  it("clears page memory", async () => {
    vi.mocked(fetchAccount).mockResolvedValueOnce({ status: "active", username: "testuser8", fetchedAtUtc: 0 } as AccountRecord);
    await resolveAccount("testuser8");
    expect(getFromPageCache("testuser8")).toBeDefined();
    
    clearPageCache();
    expect(getFromPageCache("testuser8")).toBeUndefined();
  });
});
