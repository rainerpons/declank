import { buildFilters, getEnabledFilters, requiresAccountMetadata, evaluateComment } from "@/filters/filterEngine";
import { DEFAULT_SETTINGS } from "@/models/settings";
import { CommentContext } from "@/models/comment";

function makeContext(overrides: Partial<CommentContext> = {}): CommentContext {
  return {
    element: document.createElement("div"),
    entryElement: document.createElement("div"),
    bodyElement: document.createElement("div"),
    username: "TestUser",
    rawText: "Hello world",
    normalizedText: "Hello world",
    hasMedia: false,
    isMediaOnly: false,
    ...overrides,
  };
}

describe("filterEngine", () => {
  it("buildFilters returns filters from default settings", () => {
    const filters = buildFilters(DEFAULT_SETTINGS);
    expect(filters.length).toBeGreaterThanOrEqual(3);
  });

  it("getEnabledFilters returns enabled filters", () => {
    const allEnabled = {
      ...DEFAULT_SETTINGS,
      filters: {
        generatedUsername: { enabled: true },
        accountAge: { enabled: true, threshold: { value: 30, unit: "day" } },
        mediaOnly: { enabled: true }
      }
    };
    expect(getEnabledFilters(buildFilters(allEnabled as any)).length).toBe(3);

    const allDisabled = {
      ...DEFAULT_SETTINGS,
      filters: {
        generatedUsername: { enabled: false },
        accountAge: { enabled: false, threshold: { value: 30, unit: "day" } },
        mediaOnly: { enabled: false }
      }
    };
    expect(getEnabledFilters(buildFilters(allDisabled as any)).length).toBe(0);
  });

  it("requiresAccountMetadata works correctly", () => {
    const onlyUsername = {
      ...DEFAULT_SETTINGS,
      filters: {
        generatedUsername: { enabled: true },
        accountAge: { enabled: false, threshold: { value: 30, unit: "day" } },
        mediaOnly: { enabled: false }
      }
    };
    expect(requiresAccountMetadata(getEnabledFilters(buildFilters(onlyUsername as any)))).toBe(false);

    const ageFilter = {
      ...DEFAULT_SETTINGS,
      filters: {
        generatedUsername: { enabled: false },
        accountAge: { enabled: true, threshold: { value: 30, unit: "day" } },
        mediaOnly: { enabled: false }
      }
    };
    expect(requiresAccountMetadata(getEnabledFilters(buildFilters(ageFilter as any)))).toBe(true);
  });

  it("evaluateComment logic", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      filters: {
        generatedUsername: { enabled: true },
        accountAge: { enabled: true, threshold: { value: 30, unit: "day" } },
        mediaOnly: { enabled: true }
      }
    };
    const filters = getEnabledFilters(buildFilters(settings as any));

    const ctx1 = makeContext({ username: "AdjectiveNoun1234" });
    expect(evaluateComment(ctx1, filters)).toBe("generatedUsername");

    const ctx2 = makeContext({ username: "normaluser" });
    expect(evaluateComment(ctx2, filters)).toBe(null);

    const disabledUsername = {
      ...DEFAULT_SETTINGS,
      filters: {
        generatedUsername: { enabled: false },
        accountAge: { enabled: false, threshold: { value: 30, unit: "day" } },
        mediaOnly: { enabled: false }
      }
    };
    expect(evaluateComment(ctx1, getEnabledFilters(buildFilters(disabledUsername as any)))).toBe(null);

    const ctx3 = makeContext({ username: "GeneratedName123", isMediaOnly: true });
    const match = evaluateComment(ctx3, filters);
    expect(match === "generatedUsername" || match === "mediaOnly").toBe(true);

    expect(evaluateComment(ctx1, [])).toBe(null);

    expect(evaluateComment(makeContext({ username: "TestUser2024" }), filters)).toBe("generatedUsername");
    expect(evaluateComment(makeContext({ isMediaOnly: true }), filters)).toBe("mediaOnly");
    
    const newAccount = { status: "active", createdUtc: Date.now() / 1000 - 100 } as any;
    expect(evaluateComment(makeContext({ username: "normal", account: newAccount }), filters)).toBe("accountAge");
  });
});
