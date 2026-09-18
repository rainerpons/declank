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
  username: string,
  filterId: string
): boolean {
  // Don't re-collapse already collapsed comments
  if (comment.classList.contains("collapsed")) {
    return false;
  }

  // Toggle classes to natively collapse the comment
  comment.classList.add("collapsed");
  comment.classList.remove("noncollapsed");

  log(`Collapsed u/${username} (filter: ${filterId})`);
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
