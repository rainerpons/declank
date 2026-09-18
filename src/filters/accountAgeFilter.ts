import { CommentFilter } from "@/filters/types";
import { CommentContext } from "@/models/comment";
import { TimeUnit } from "@/models/settings";


/**
 * Calculate the cutoff date by subtracting the threshold from now.
 * Uses calendar-aware subtraction for months and years.
 */
export function calculateCutoffTimestamp(
  value: number,
  unit: TimeUnit,
  now: Date = new Date()
): number {
  const cutoff = new Date(now);
  switch (unit) {
    case "day":
      cutoff.setDate(cutoff.getDate() - value);
      break;
    case "week":
      cutoff.setDate(cutoff.getDate() - value * 7);
      break;
    case "month":
      cutoff.setMonth(cutoff.getMonth() - value);
      break;
    case "year":
      cutoff.setFullYear(cutoff.getFullYear() - value);
      break;
  }
  return Math.floor(cutoff.getTime() / 1000);
}

/**
 * Returns true if the account was created after the cutoff (i.e., younger than threshold).
 * Returns false (fail open) if creation timestamp is unavailable.
 */
export function isAccountYoungerThan(
  createdUtc: number | undefined,
  thresholdValue: number,
  thresholdUnit: TimeUnit,
  now?: Date
): boolean {
  if (createdUtc === undefined) return false; // Fail open
  const cutoff = calculateCutoffTimestamp(thresholdValue, thresholdUnit, now);
  return createdUtc > cutoff;
}

export function createAccountAgeFilter(
  enabled: boolean,
  thresholdValue: number,
  thresholdUnit: TimeUnit
): CommentFilter {
  return {
    id: "accountAge",
    name: "Account age",
    description: `Collapse comments from accounts younger than ${thresholdValue} ${thresholdUnit}(s).`,
    enabled,
    requiredData: ["accountMetadata"],
    matches(context: CommentContext): boolean {
      return isAccountYoungerThan(
        context.account?.createdUtc,
        thresholdValue,
        thresholdUnit
      );
    },
  };
}
