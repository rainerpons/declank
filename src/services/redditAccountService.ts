import { AccountRecord, AccountStatus } from "@/models/account";
import { log, warn } from "@/utils/logger";
import { REDDIT_ABOUT_URL } from "@/utils/constants";
import { limitedFetch, FetchResult } from "./requestService";

interface RedditAboutResponse {
  kind?: string;
  data?: {
    name?: string;
    id?: string;
    created_utc?: number;
    is_suspended?: boolean;
    [key: string]: unknown;
  };
}

function isRedditAboutResponse(value: unknown): value is RedditAboutResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "data" in value
  );
}

function determineStatus(data: RedditAboutResponse["data"]): AccountStatus {
  if (!data) return "unavailable";
  if (data.is_suspended === true) return "suspended";
  return "active";
}

export function parseAccountResponse(
  username: string,
  result: FetchResult
): AccountRecord | null {
  if (!result.ok) {
    log(`Account lookup failed for ${username}: status ${result.status}`);
    return null; // Transient or permanent failure — do not cache
  }

  if (!isRedditAboutResponse(result.data)) {
    warn(`Unexpected response shape for ${username}`);
    return null;
  }

  const data = result.data.data;
  const status = determineStatus(data);

  const record: AccountRecord = {
    username,
    status,
    fetchedAtUtc: Math.floor(Date.now() / 1000),
  };

  if (data?.id) {
    record.accountId = `t2_${data.id}`;
  }

  if (typeof data?.created_utc === "number" && data.created_utc > 0) {
    record.createdUtc = data.created_utc;
  }

  log(`Parsed account ${username}: status=${status}, createdUtc=${record.createdUtc ?? "N/A"}`);
  return record;
}

export async function fetchAccount(
  username: string
): Promise<AccountRecord | null> {
  const url = REDDIT_ABOUT_URL(username);
  log(`Fetching account data for ${username}`);
  const result = await limitedFetch(url);
  return parseAccountResponse(username, result);
}
