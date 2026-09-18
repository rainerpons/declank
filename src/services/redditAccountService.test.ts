import { parseAccountResponse } from "@/services/redditAccountService";

describe("redditAccountService", () => {
  describe("parseAccountResponse", () => {
    it("parses active account", () => {
      const result = {
        ok: true,
        data: {
          kind: "t2",
          data: {
            id: "123",
            created_utc: 1600000000,
            is_suspended: false
          }
        }
      } as any;
      
      const account = parseAccountResponse("testuser", result);
      expect(account).toEqual({
        accountId: "t2_123",
        username: "testuser",
        status: "active",
        createdUtc: 1600000000,
        fetchedAtUtc: expect.any(Number)
      });
    });

    it("parses suspended account without created_utc", () => {
      const result = {
        ok: true,
        data: {
          kind: "t2",
          data: {
            id: "123",
            is_suspended: true
          }
        }
      } as any;
      
      const account = parseAccountResponse("testuser", result);
      expect(account).toEqual({
        accountId: "t2_123",
        username: "testuser",
        status: "suspended",
        fetchedAtUtc: expect.any(Number)
      });
    });

    it("parses suspended account with created_utc", () => {
      const result = {
        ok: true,
        data: {
          kind: "t2",
          data: {
            id: "123",
            created_utc: 1600000000,
            is_suspended: true
          }
        }
      } as any;
      
      const account = parseAccountResponse("testuser", result);
      expect(account).toEqual({
        accountId: "t2_123",
        username: "testuser",
        status: "suspended",
        createdUtc: 1600000000,
        fetchedAtUtc: expect.any(Number)
      });
    });

    it("returns null for failed response", () => {
      const result = { ok: false, error: "Not found" } as any;
      expect(parseAccountResponse("testuser", result)).toBeNull();
    });

    it("returns null for malformed response", () => {
      expect(parseAccountResponse("testuser", { ok: true, data: {} } as any)).toBeNull();
      expect(parseAccountResponse("testuser", { ok: true, data: { kind: "t2" } } as any)).toBeNull();
    });

    it("returns null for missing data object", () => {
      expect(parseAccountResponse("testuser", { ok: true } as any)).toBeNull();
    });

    it("ignores created_utc of 0 or negative", () => {
      const res0 = { ok: true, data: { kind: "t2", data: { id: "1", created_utc: 0 } } } as any;
      expect(parseAccountResponse("testuser", res0)?.createdUtc).toBeUndefined();

      const resNeg = { ok: true, data: { kind: "t2", data: { id: "2", created_utc: -100 } } } as any;
      expect(parseAccountResponse("testuser", resNeg)?.createdUtc).toBeUndefined();
    });
  });
});
