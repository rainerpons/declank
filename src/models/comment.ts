import { AccountRecord } from "./account";

export interface CommentContext {
  element: HTMLElement;
  entryElement: HTMLElement;
  bodyElement: HTMLElement | null;
  username: string;
  rawText: string;
  normalizedText: string;
  hasMedia: boolean;
  isMediaOnly: boolean;
  account?: AccountRecord;
}
