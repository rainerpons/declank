import { ExtensionSettings } from "@/models/settings";
import { CommentContext } from "@/models/comment";
import {
  buildFilters,
  getEnabledFilters,
  requiresAccountMetadata,
  getLocalFilters,
  evaluateComment,
} from "@/filters/filterEngine";
import { resolveAccount } from "@/services/accountCacheService";
import { parseComment } from "./commentParser";
import { collapseComment, hasCollapsedAncestor } from "./commentCollapser";
import { log, warn } from "@/utils/logger";

interface ScanResult {
  totalComments: number;
  processedComments: number;
  collapsedComments: number;
  skippedComments: number;
  uniqueAuthors: number;
}

/**
 * Scan all initially rendered comments on an old Reddit page.
 * Process as a flat NodeList, check ancestry for collapsed parents,
 * apply filters with short-circuiting and demand-driven account lookups.
 */
export async function scanComments(
  settings: ExtensionSettings
): Promise<ScanResult> {
  const allFilters = buildFilters(settings);
  const enabledFilters = getEnabledFilters(allFilters);

  const result: ScanResult = {
    totalComments: 0,
    processedComments: 0,
    collapsedComments: 0,
    skippedComments: 0,
    uniqueAuthors: 0,
  };

  if (enabledFilters.length === 0) {
    log("No filters enabled, skipping scan");
    return result;
  }

  log(
    `Active filters: ${enabledFilters.map((f) => f.id).join(", ")}`
  );

  const needsAccountData = requiresAccountMetadata(enabledFilters);
  const localFilters = getLocalFilters(enabledFilters);

  // Discover all comments as a flat NodeList
  const commentElements = document.querySelectorAll<HTMLElement>(".comment");
  result.totalComments = commentElements.length;
  log(`Found ${result.totalComments} comment elements`);

  // Phase 1: Parse comments and apply local-only filters
  // Collect comments needing account data for phase 2
  const needsAccountLookup: CommentContext[] = [];
  const uniqueAuthors = new Set<string>();

  for (const commentEl of commentElements) {
    // Skip descendants of already-collapsed comments
    if (hasCollapsedAncestor(commentEl)) {
      result.skippedComments++;
      continue;
    }

    // Skip already-collapsed comments
    if (commentEl.classList.contains("collapsed")) {
      result.skippedComments++;
      continue;
    }

    const context = parseComment(commentEl);
    if (!context) {
      result.skippedComments++;
      continue;
    }

    result.processedComments++;
    uniqueAuthors.add(context.username);

    // Try local-only filters first (short-circuit)
    let matched = false;
    for (const filter of localFilters) {
      if (filter.matches(context)) {
        collapseComment(commentEl, `filter:${filter.id}`);
        result.collapsedComments++;
        matched = true;
        break;
      }
    }

    // If locally matched, no need for account lookup
    if (matched) continue;

    // Queue for account lookup if needed
    if (needsAccountData) {
      needsAccountLookup.push(context);
    }
  }

  result.uniqueAuthors = uniqueAuthors.size;
  log(
    `Phase 1 complete: ${result.collapsedComments} collapsed, ` +
      `${needsAccountLookup.length} need account data`
  );

  // Phase 2: Resolve accounts and apply remaining filters
  if (needsAccountLookup.length > 0 && needsAccountData) {
    // Deduplicate usernames for efficient batch lookup
    const uniqueUsernames = [
      ...new Set(needsAccountLookup.map((c) => c.username)),
    ];
    log(
      `Resolving ${uniqueUsernames.length} unique accounts for ${needsAccountLookup.length} comments`
    );

    // Resolve all unique accounts (concurrency-limited)
    const accountPromises = uniqueUsernames.map((username) =>
      resolveAccount(username).catch((err) => {
        warn(`Failed to resolve account ${username}:`, err);
        return null;
      })
    );
    const accounts = await Promise.all(accountPromises);

    // Build a username->account map
    const accountMap = new Map(
      uniqueUsernames
        .map((username, i) => [username, accounts[i]] as const)
        .filter(([, account]) => account !== null)
    );

    // Apply remaining filters with account data
    for (const context of needsAccountLookup) {
      // Re-check if ancestor was collapsed during phase 2 processing
      if (hasCollapsedAncestor(context.element)) continue;
      if (context.element.classList.contains("collapsed")) continue;

      const account = accountMap.get(context.username);
      if (account) {
        context.account = account;
      }

      const matchedFilter = evaluateComment(context, enabledFilters);
      if (matchedFilter) {
        collapseComment(context.element, `filter:${matchedFilter}`);
        result.collapsedComments++;
      }
    }
  }

  log(
    `Scan complete: ${result.totalComments} total, ` +
      `${result.processedComments} processed, ` +
      `${result.collapsedComments} collapsed, ` +
      `${result.skippedComments} skipped, ` +
      `${result.uniqueAuthors} unique authors`
  );

  return result;
}
