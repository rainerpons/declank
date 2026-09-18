import { AccountRecord } from "@/models/account";
import { ExtensionSettings } from "@/models/settings";

export interface StorageSchema {
  declank_settings: ExtensionSettings;
  declank_accountCache: AccountCache;
  declank_storageVersion: number;
}

export interface AccountCache {
  [username: string]: AccountRecord;
}
