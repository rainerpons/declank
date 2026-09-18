export type AccountStatus =
  | "active"
  | "suspended"
  | "deleted"
  | "unavailable"
  | "unknown";

export interface AccountRecord {
  username: string;
  accountId?: string;
  createdUtc?: number;
  status: AccountStatus;
  fetchedAtUtc: number;
}
