import { STORAGE_KEYS, CURRENT_STORAGE_VERSION } from "@/storage/keys";

// Initialize storage version on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({
      [STORAGE_KEYS.storageVersion]: CURRENT_STORAGE_VERSION,
    });
    console.log("[Declank] Extension installed, storage initialized");
  } else if (details.reason === "update") {
    // Future: handle storage migrations here
    console.log(
      `[Declank] Extension updated to ${chrome.runtime.getManifest().version}`
    );
  }
});
