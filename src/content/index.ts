import { loadSettings, onSettingsChanged } from "@/services/settingsService";
import { ExtensionSettings } from "@/models/settings";
import { setDebugEnabled, log, error } from "@/utils/logger";
import { scanComments, scanCommentElements } from "./redditScanner";

let currentSettings: ExtensionSettings;
let observer: MutationObserver | null = null;
let isObserving = false;

function startObserver() {
  if (isObserving || !observer) return;
  const commentArea = document.querySelector(".sitetable.nestedlisting") || document.body;
  observer.observe(commentArea, { childList: true, subtree: true });
  isObserving = true;
}

function stopObserver() {
  if (!isObserving || !observer) return;
  observer.disconnect();
  isObserving = false;
}

function handleSettingsChange(newSettings: ExtensionSettings) {
  const wasEnabled = currentSettings.enabled;
  currentSettings = newSettings;
  setDebugEnabled(currentSettings.debug);

  if (wasEnabled && !currentSettings.enabled) {
    // Transition: enabled -> disabled
    stopObserver();
    console.log("[Declank] Disabled");
  } else if (!wasEnabled && currentSettings.enabled) {
    // Transition: disabled -> enabled
    startObserver();
    // Scan immediately to catch any comments that loaded while disabled
    scanComments(currentSettings).catch(err => error("Error scanning on enable:", err));
    console.log("[Declank] Enabled");
  }
}

async function main(): Promise<void> {
  if (
    window.location.hostname !== "old.reddit.com" &&
    window.location.hostname !== "www.reddit.com"
  ) {
    return;
  }

  const isOldReddit = document.querySelector("#header-bottom-left") !== null;
  if (!isOldReddit) {
    return;
  }

  console.log(`[Declank] Initialized on ${window.location.hostname}`);

  try {
    currentSettings = await loadSettings();
    setDebugEnabled(currentSettings.debug);

    // Initialize the observer once
    observer = new MutationObserver((mutations) => {
      const newComments: HTMLElement[] = [];
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.classList.contains("comment")) {
              newComments.push(node);
            }
            const descendants = node.querySelectorAll<HTMLElement>(".comment");
            for (const desc of descendants) {
              newComments.push(desc);
            }
          }
        }
      }

      if (newComments.length > 0) {
        log(`Newly loaded comments discovered: ${newComments.length}`);
        scanCommentElements(newComments, currentSettings).then((result) => {
          if (result.processedComments > 0) {
            log(`Processed ${result.processedComments} new comments, collapsed ${result.collapsedComments}`);
          }
        }).catch(err => error("Error scanning new comments:", err));
      }
    });

    onSettingsChanged(() => {
      // Re-load full settings to ensure deep merge defaults are present
      // Alternatively, we could just use the value directly, but this is safer
      loadSettings().then(handleSettingsChange);
    });

    if (currentSettings.enabled) {
      startObserver();
      await scanComments(currentSettings);
    }

  } catch (err) {
    error("Declank encountered an error:", err);
  }
}

main();
