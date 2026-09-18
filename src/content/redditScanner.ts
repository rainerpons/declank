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
const scannedComments = new WeakSet<HTMLElement>();

export async function scanCommentElements(
  commentElements: HTMLElement[],
  settings: ExtensionSettings
): Promise<ScanResult> {
  const allFilters = buildFilters(settings);
  const enabledFilters = getEnabledFilters(allFilters);

  const result: ScanResult = {
    totalComments: commentElements.length,
    processedComments: 0,
    collapsedComments: 0,
    skippedComments: 0,
    uniqueAuthors: 0,
  };

  if (enabledFilters.length === 0) {
    return result;
  }

  const needsAccountData = requiresAccountMetadata(enabledFilters);
  const localFilters = getLocalFilters(enabledFilters);

  // Phase 1: Parse comments and apply local-only filters
  const needsAccountLookup: CommentContext[] = [];
  const uniqueAuthors = new Set<string>();

  for (const commentEl of commentElements) {
    if (scannedComments.has(commentEl)) {
      result.skippedComments++;
      continue;
    }
    scannedComments.add(commentEl);

    if (hasCollapsedAncestor(commentEl)) {
      result.skippedComments++;
      continue;
    }

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

    let matched = false;
    for (const filter of localFilters) {
      if (filter.matches(context)) {
        collapseComment(commentEl, context.username, filter.id);
        result.collapsedComments++;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    if (needsAccountData) {
      needsAccountLookup.push(context);
    }
  }

  result.uniqueAuthors = uniqueAuthors.size;

  // Phase 2: Resolve accounts and apply remaining filters
  if (needsAccountLookup.length > 0 && needsAccountData) {
    const uniqueUsernames = [
      ...new Set(needsAccountLookup.map((c) => c.username)),
    ];

    const accountPromises = uniqueUsernames.map((username) =>
      resolveAccount(username).catch((err) => {
        warn(`Failed to resolve account ${username}:`, err);
        return null;
      })
    );
    const accounts = await Promise.all(accountPromises);

    const accountMap = new Map(
      uniqueUsernames
        .map((username, i) => [username, accounts[i]] as const)
        .filter(([, account]) => account !== null)
    );

    for (const context of needsAccountLookup) {
      if (hasCollapsedAncestor(context.element)) continue;
      if (context.element.classList.contains("collapsed")) continue;

      const account = accountMap.get(context.username);
      if (account) {
        context.account = account;
      }

      const matchedFilter = evaluateComment(context, enabledFilters);
      if (matchedFilter) {
        collapseComment(context.element, context.username, matchedFilter);
        result.collapsedComments++;
      }
    }
  }

  return result;
}

export async function scanComments(
  settings: ExtensionSettings
): Promise<ScanResult> {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(".comment"));
  log(`Initial scan: discovered ${elements.length} comments`);
  const result = await scanCommentElements(elements, settings);
  log(
    `Initial scan complete: processed ${result.processedComments}, collapsed ${result.collapsedComments}`
  );
  return result;
}
