import { loadSettings } from "@/services/settingsService";
import { setDebugEnabled, log, error } from "@/utils/logger";
import { scanComments } from "./redditScanner";

async function main(): Promise<void> {
  // Defensive hostname check
  if (window.location.hostname !== "old.reddit.com") {
    return;
  }

  try {
    const settings = await loadSettings();
    setDebugEnabled(settings.debug);

    log("Declank content script loaded");

    if (!settings.enabled) {
      log("Extension is disabled, skipping");
      return;
    }

    const result = await scanComments(settings);
    log("Scan result:", result);
  } catch (err) {
    error("Declank encountered an error:", err);
  }
}

main();
