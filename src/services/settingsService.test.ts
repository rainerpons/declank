import { deepMerge, loadSettings, saveSettings } from "@/services/settingsService";
import { DEFAULT_SETTINGS } from "@/models/settings";

describe("settingsService", () => {
  describe("deepMerge", () => {
    it("returns defaults for empty stored", () => {
      expect(deepMerge(DEFAULT_SETTINGS, {})).toEqual(DEFAULT_SETTINGS);
      expect(deepMerge(DEFAULT_SETTINGS, undefined as any)).toEqual(DEFAULT_SETTINGS);
    });

    it("merges partial override correctly", () => {
      const partial = { enabled: false };
      const merged = deepMerge(DEFAULT_SETTINGS, partial);
      expect(merged.enabled).toBe(false);
      expect(merged.filters).toEqual(DEFAULT_SETTINGS.filters);
    });

    it("deep merges nested objects", () => {
      const partial = { filters: { generatedUsername: { enabled: false } } } as any;
      const merged = deepMerge(DEFAULT_SETTINGS, partial);
      expect(merged.filters.generatedUsername.enabled).toBe(false);
      expect(merged.filters.accountAge.enabled).toBe(DEFAULT_SETTINGS.filters.accountAge.enabled);
    });

    it("includes new keys in stored that aren't in defaults", () => {
      const partial = { newKey: "value" };
      const merged = deepMerge(DEFAULT_SETTINGS, partial as any);
      expect((merged as any).newKey).toBe("value");
    });

    it("replaces arrays instead of merging", () => {
      const defaults = { arr: [1, 2] };
      const partial = { arr: [3, 4, 5] };
      expect(deepMerge(defaults, partial)).toEqual({ arr: [3, 4, 5] });
    });
  });

  describe("loadSettings", () => {
    it("returns defaults if no stored settings", async () => {
      const settings = await loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it("merges partial stored settings", async () => {
      await chrome.storage.local.set({ declank_settings: { enabled: false } });
      const settings = await loadSettings();
      expect(settings.enabled).toBe(false);
    });

    it("handles storage errors by returning defaults", async () => {
      vi.spyOn(chrome.storage.local, "get").mockRejectedValueOnce(new Error("Storage error"));
      const settings = await loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("saveSettings", () => {
    it("saves to chrome.storage.local under correct key", async () => {
      await saveSettings(DEFAULT_SETTINGS);
      const data = await chrome.storage.local.get("declank_settings");
      expect(data.declank_settings).toEqual(DEFAULT_SETTINGS);
    });
  });
});
