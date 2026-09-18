import { CommentContext } from "@/models/comment";
import {
  hasEmbeddedMedia,
  hasMediaLinks,
  stripMediaUrls,
} from "@/filters/mediaOnlyFilter";

/**
 * Extract the username from a comment element.
 * Uses :scope > .entry to avoid reading nested comments.
 */
export function parseUsername(comment: HTMLElement): string | null {
  const entry = comment.querySelector<HTMLElement>(":scope > .entry");
  if (!entry) return null;

  // Try the author tag
  const authorTag = entry.querySelector<HTMLAnchorElement>(
    ".tagline a.author"
  );
  return authorTag?.textContent?.trim() ?? null;
}

/**
 * Extract the raw text content from a comment body.
 * Uses scoped selectors to only get this comment's body, not nested replies.
 */
export function parseCommentBody(
  comment: HTMLElement
): { rawText: string; bodyElement: HTMLElement | null } {
  const entry = comment.querySelector<HTMLElement>(":scope > .entry");
  if (!entry) return { rawText: "", bodyElement: null };

  const bodyElement = entry.querySelector<HTMLElement>(
    ".usertext-body .md"
  );
  if (!bodyElement) return { rawText: "", bodyElement: null };

  const rawText = bodyElement.textContent ?? "";
  return { rawText, bodyElement };
}

/**
 * Normalize text for comparison: collapse whitespace and trim.
 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Detect whether a comment body contains media elements.
 */
export function detectMedia(
  bodyElement: HTMLElement | null
): { hasMedia: boolean; isMediaOnly: boolean; rawText: string } {
  if (!bodyElement) {
    return { hasMedia: false, isMediaOnly: false, rawText: "" };
  }

  const rawText = bodyElement.textContent ?? "";
  const hasMedia =
    hasEmbeddedMedia(bodyElement) || hasMediaLinks(bodyElement);

  const isMediaOnly = hasMedia
    ? stripMediaUrls(normalizeText(rawText)).length === 0
    : false;

  return { hasMedia, isMediaOnly, rawText };
}

/**
 * Parse a .comment element into a CommentContext.
 * Returns null if essential data cannot be extracted.
 */
export function parseComment(
  comment: HTMLElement
): CommentContext | null {
  const username = parseUsername(comment);
  if (!username) return null;

  const entry = comment.querySelector<HTMLElement>(":scope > .entry");
  if (!entry) return null;

  const { rawText, bodyElement } = parseCommentBody(comment);
  const mediaInfo = detectMedia(bodyElement);
  const normalizedText = normalizeText(rawText);

  return {
    element: comment,
    entryElement: entry,
    bodyElement,
    username,
    rawText,
    normalizedText,
    hasMedia: mediaInfo.hasMedia,
    isMediaOnly: mediaInfo.isMediaOnly,
  };
}
