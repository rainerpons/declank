import { CommentFilter, RequiredData } from "@/filters/types";
import { CommentContext } from "@/models/comment";
import { ExtensionSettings } from "@/models/settings";
import { log } from "@/utils/logger";
import { createAccountAgeFilter } from "./accountAgeFilter";
import { createGeneratedUsernameFilter } from "./generatedUsernameFilter";
import { createMediaOnlyFilter } from "./mediaOnlyFilter";

/**
 * Build the active filter list from current settings.
 */
export function buildFilters(settings: ExtensionSettings): CommentFilter[] {
  const { filters } = settings;
  return [
    createGeneratedUsernameFilter(filters.generatedUsername.enabled),
    createMediaOnlyFilter(filters.mediaOnly.enabled),
    createAccountAgeFilter(
      filters.accountAge.enabled,
      filters.accountAge.threshold.value,
      filters.accountAge.threshold.unit
    ),
  ];
}

/**
 * Get enabled filters only.
 */
export function getEnabledFilters(
  filters: CommentFilter[]
): CommentFilter[] {
  return filters.filter((f) => f.enabled);
}

/**
 * Determine if any enabled filter requires account metadata.
 */
export function requiresAccountMetadata(
  enabledFilters: CommentFilter[]
): boolean {
  return enabledFilters.some((f) =>
    f.requiredData.includes("accountMetadata" as RequiredData)
  );
}

/**
 * Get filters that do NOT require account metadata (local-only filters).
 */
export function getLocalFilters(
  enabledFilters: CommentFilter[]
): CommentFilter[] {
  return enabledFilters.filter(
    (f) => !f.requiredData.includes("accountMetadata" as RequiredData)
  );
}

/**
 * Get filters that DO require account metadata.
 */
export function getAccountFilters(
  enabledFilters: CommentFilter[]
): CommentFilter[] {
  return enabledFilters.filter((f) =>
    f.requiredData.includes("accountMetadata" as RequiredData)
  );
}

/**
 * Evaluate a comment against enabled filters with OR semantics.
 * Returns the ID of the first matching filter, or null if no filter matches.
 *
 * Local-only filters are evaluated first for short-circuiting.
 * Account filters are only evaluated if no local filter matched.
 */
export function evaluateComment(
  context: CommentContext,
  enabledFilters: CommentFilter[]
): string | null {
  const localFilters = getLocalFilters(enabledFilters);
  const accountFilters = getAccountFilters(enabledFilters);

  // Evaluate local filters first (no network dependency)
  for (const filter of localFilters) {
    if (filter.matches(context)) {
      log(
        `Comment by ${context.username} matched filter: ${filter.id}`
      );
      return filter.id;
    }
  }

  // Evaluate account filters only if account data was resolved
  for (const filter of accountFilters) {
    if (filter.matches(context)) {
      log(
        `Comment by ${context.username} matched filter: ${filter.id}`
      );
      return filter.id;
    }
  }

  return null;
}
