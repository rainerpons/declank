import { CommentContext } from "@/models/comment";

export type RequiredData =
  | "username"
  | "commentText"
  | "media"
  | "accountMetadata";

export interface CommentFilter {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredData: RequiredData[];
  matches(context: CommentContext): boolean;
}
