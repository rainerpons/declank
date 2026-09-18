import { CommentFilter } from "@/filters/types";
import { CommentContext } from "@/models/comment";


const KNOWN_NON_GENERATED = new Set([
  "automoderator",
  "redditcareresources",
  "reddit",
]);

const PASCAL_CASE_PATTERN = /^(?:[A-Z][a-z]+){2,}\d{1,5}$/;
const UNDERSCORE_PATTERN = /^[A-Z][a-z]+(?:_[A-Z][a-z]+)+_?\d{1,5}$/;
const HYPHEN_PATTERN = /^[A-Z][a-z]+(?:-[A-Z][a-z]+)+-?\d{1,5}$/;

/**
 * Tests whether a username matches common Reddit auto-generated patterns.
 * 
 * Known generated formats:
 * - PascalCaseWords followed by digits: PomegranateOk3520
 * - Underscore_Separated_Words_Digits: Conscious_Age_1077  
 * - Hyphen-Separated-Words-Digits: Capital-Factor-382
 */
export function isGeneratedUsername(username: string): boolean {
  // Reject known system/special accounts
  if (KNOWN_NON_GENERATED.has(username.toLowerCase())) return false;

  return (
    PASCAL_CASE_PATTERN.test(username) ||
    UNDERSCORE_PATTERN.test(username) ||
    HYPHEN_PATTERN.test(username)
  );
}

export function createGeneratedUsernameFilter(
  enabled: boolean
): CommentFilter {
  return {
    id: "generatedUsername",
    name: "Automatically generated usernames",
    description:
      "Collapse comments from usernames matching Reddit's common generated-name format.",
    enabled,
    requiredData: ["username"],
    matches(context: CommentContext): boolean {
      return isGeneratedUsername(context.username);
    },
  };
}
