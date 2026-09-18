import { log } from "@/utils/logger";

/**
 * Collapse a comment using old Reddit's native collapse toggle.
 *
 * Old Reddit uses a `.expand` element within `.entry > .tagline`.
 * Clicking it toggles the `.collapsed` class and hides the comment body,
 * preserving thread structure and allowing manual expansion.
 */
export function collapseComment(
  comment: HTMLElement,
  reason: string
): boolean {
  // Don't re-collapse already collapsed comments
  if (comment.classList.contains("collapsed")) {
    return false;
  }

  // Method 1: Try to find and click the native expand/collapse toggle
  const entry = comment.querySelector<HTMLElement>(":scope > .entry");
  if (entry) {
    const expandButton = entry.querySelector<HTMLElement>(
      ".tagline .expand"
    );
    if (expandButton) {
      expandButton.click();
      log(`Collapsed comment (native click): ${reason}`);
      return true;
    }
  }

  // Method 2: Fallback — toggle the collapsed class directly
  // This mimics old Reddit's behavior
  comment.classList.add("collapsed");

  // Old Reddit also adds a .collapsed class and toggles noncollapsed
  comment.classList.remove("noncollapsed");

  log(`Collapsed comment (class toggle): ${reason}`);
  return true;
}

/**
 * Check whether a comment element has an already-collapsed ancestor.
 */
export function hasCollapsedAncestor(comment: Element): boolean {
  return Boolean(
    comment.parentElement?.closest(".comment.collapsed")
  );
}
