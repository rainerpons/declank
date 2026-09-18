import { CommentFilter } from "@/filters/types";
import { CommentContext } from "@/models/comment";


/** Media-hosting domains whose URLs should not count as meaningful text */
const MEDIA_URL_PATTERNS: RegExp[] = [
  /https?:\/\/(?:www\.)?giphy\.com\/\S*/gi,
  /https?:\/\/(?:www\.)?tenor\.com\/\S*/gi,
  /https?:\/\/i\.redd\.it\/\S*/gi,
  /https?:\/\/v\.redd\.it\/\S*/gi,
  /https?:\/\/preview\.redd\.it\/\S*/gi,
  /https?:\/\/(?:i\.)?imgur\.com\/\S*/gi,
  /https?:\/\/(?:www\.)?gfycat\.com\/\S*/gi,
  /https?:\/\/(?:www\.)?streamable\.com\/\S*/gi,
];

/** Tags that represent embedded media */
const MEDIA_SELECTORS = [
  "img:not(.flairemoji):not([width='16']):not([width='20'])",
  "video",
  "iframe",
  "object",
  "embed",
].join(", ");

/**
 * Check if a body element contains embedded media elements.
 */
export function hasEmbeddedMedia(bodyElement: HTMLElement): boolean {
  return bodyElement.querySelector(MEDIA_SELECTORS) !== null;
}

/**
 * Check if the body contains links pointing to known media hosts.
 */
export function hasMediaLinks(bodyElement: HTMLElement): boolean {
  const links = bodyElement.querySelectorAll("a[href]");
  for (const link of links) {
    const href = (link as HTMLAnchorElement).href;
    if (MEDIA_URL_PATTERNS.some((p) => p.test(href))) {
      // Reset lastIndex for global regexes
      MEDIA_URL_PATTERNS.forEach((p) => (p.lastIndex = 0));
      return true;
    }
  }
  MEDIA_URL_PATTERNS.forEach((p) => (p.lastIndex = 0));
  return false;
}

/**
 * Strip known media URLs from text to determine if any meaningful prose remains.
 */
export function stripMediaUrls(text: string): string {
  let stripped = text;
  for (const pattern of MEDIA_URL_PATTERNS) {
    stripped = stripped.replace(pattern, "");
    pattern.lastIndex = 0;
  }
  return stripped.replace(/\s+/g, " ").trim();
}

/**
 * Determine if a comment contains only media with no meaningful text.
 */
export function isMediaOnlyComment(
  bodyElement: HTMLElement | null,
  rawText: string
): boolean {
  if (!bodyElement) return false;

  const containsMedia =
    hasEmbeddedMedia(bodyElement) || hasMediaLinks(bodyElement);
  if (!containsMedia) return false;

  // Strip media URLs from the text and check if anything meaningful remains
  const remainingText = stripMediaUrls(rawText);
  return remainingText.length === 0;
}

export function createMediaOnlyFilter(enabled: boolean): CommentFilter {
  return {
    id: "mediaOnly",
    name: "Media-only comments",
    description:
      "Collapse comments containing only a GIF, image, or other supported media.",
    enabled,
    requiredData: ["commentText", "media"],
    matches(context: CommentContext): boolean {
      return context.isMediaOnly;
    },
  };
}
