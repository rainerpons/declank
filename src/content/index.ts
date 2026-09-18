import { loadSettings } from "@/services/settingsService";
import { setDebugEnabled, log, error } from "@/utils/logger";
import { scanComments } from "./redditScanner";

async function main(): Promise<void> {
  // Defensive hostname check
  if (
    window.location.hostname !== "old.reddit.com" &&
    window.location.hostname !== "www.reddit.com"
  ) {
    return;
  }

  // Always log startup to console unconditionally so users can verify it runs
  console.log(`[Declank] Extension started on ${window.location.hostname}`);

  // Ensure this is actually old Reddit
  const isOldReddit = document.querySelector("#header-bottom-left") !== null;
  if (!isOldReddit) {
    console.log("[Declank] Not an old Reddit page structure, skipping");
    return;
  }

  try {
    const settings = await loadSettings();
    setDebugEnabled(settings.debug);

    log("Declank initialized with settings:", settings);

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
