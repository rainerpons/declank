export type TimeUnit = "day" | "week" | "month" | "year";

export interface AccountAgeFilterSettings {
  enabled: boolean;
  threshold: {
    value: number;
    unit: TimeUnit;
  };
}

export interface GeneratedUsernameFilterSettings {
  enabled: boolean;
}

export interface MediaOnlyFilterSettings {
  enabled: boolean;
}

export interface FilterSettings {
  accountAge: AccountAgeFilterSettings;
  generatedUsername: GeneratedUsernameFilterSettings;
  mediaOnly: MediaOnlyFilterSettings;
}

export type ThemePreference = "system" | "light" | "dark";

export interface ExtensionSettings {
  enabled: boolean;
  debug: boolean;
  theme: ThemePreference;
  filters: FilterSettings;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  debug: false,
  theme: "system",
  filters: {
    accountAge: {
      enabled: true,
      threshold: {
        value: 1,
        unit: "year",
      },
    },
    generatedUsername: {
      enabled: true,
    },
    mediaOnly: {
      enabled: true,
    },
  },
};
