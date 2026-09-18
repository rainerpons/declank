import { ExtensionSettings, DEFAULT_SETTINGS } from "@/models/settings";
import { STORAGE_KEYS } from "@/storage/keys";

export function deepMerge<T extends object>(defaults: T, stored: Partial<T>): T {
  const result = { ...defaults };
  if (!stored) return result;
  for (const key of Object.keys(stored) as Array<keyof T>) {
    const storedVal = stored[key];
    const defaultVal = defaults[key];
    if (
      storedVal !== undefined &&
      typeof storedVal === "object" &&
      storedVal !== null &&
      !Array.isArray(storedVal) &&
      typeof defaultVal === "object" &&
      defaultVal !== null &&
      !Array.isArray(defaultVal)
    ) {
      result[key] = deepMerge(
        defaultVal as Record<string, unknown>,
        storedVal as Partial<Record<string, unknown>>
      ) as T[keyof T];
    } else if (storedVal !== undefined) {
      result[key] = storedVal as T[keyof T];
    }
  }
  return result;
}

export async function loadSettings(): Promise<ExtensionSettings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.settings);
    const stored = result[STORAGE_KEYS.settings] as Partial<ExtensionSettings> | undefined;
    if (!stored) return { ...DEFAULT_SETTINGS };
    return deepMerge(DEFAULT_SETTINGS, stored);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.settings]: settings });
}

export function onSettingsChanged(
  callback: (settings: ExtensionSettings) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === "local" && STORAGE_KEYS.settings in changes) {
      const newValue = changes[STORAGE_KEYS.settings]?.newValue as ExtensionSettings | undefined;
      if (newValue) callback(newValue);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
