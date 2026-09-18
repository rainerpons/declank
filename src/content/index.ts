import { loadSettings } from "@/services/settingsService";
import { setDebugEnabled, log, error } from "@/utils/logger";
import { scanComments, scanCommentElements } from "./redditScanner";

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
    const settings = await loadSettings();
    setDebugEnabled(settings.debug);

    if (!settings.enabled) {
      log("Extension is disabled, skipping");
      return;
    }

    // Initial scan
    await scanComments(settings);

    // Observe for dynamically loaded comments
    const observer = new MutationObserver((mutations) => {
      const newComments: HTMLElement[] = [];
      
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;
        
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            // The added node itself might be a comment
            if (node.classList.contains("comment")) {
              newComments.push(node);
            }
            // Or it might contain comments
            const descendants = node.querySelectorAll<HTMLElement>(".comment");
            for (const desc of descendants) {
              newComments.push(desc);
            }
          }
        }
      }

      if (newComments.length > 0) {
        log(`Newly loaded comments discovered: ${newComments.length}`);
        scanCommentElements(newComments, settings).then((result) => {
          if (result.processedComments > 0) {
            log(`Processed ${result.processedComments} new comments, collapsed ${result.collapsedComments}`);
          }
        }).catch(err => error("Error scanning new comments:", err));
      }
    });

    const commentArea = document.querySelector(".sitetable.nestedlisting") || document.body;
    observer.observe(commentArea, { childList: true, subtree: true });

  } catch (err) {
    error("Declank encountered an error:", err);
  }
}

main();
