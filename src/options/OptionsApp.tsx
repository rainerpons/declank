import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ExtensionSettings,
  DEFAULT_SETTINGS,
  TimeUnit,
  ThemePreference,
} from "@/models/settings";
import { loadSettings, saveSettings } from "@/services/settingsService";
import { applyTheme } from "@/utils/theme";
import { SaveTracker } from "@/utils/saveTracker";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";

const TIME_UNIT_OPTIONS = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
  { value: "year", label: "Years" },
];

const THEME_OPTIONS = [
  { value: "system", label: "System Default" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const MAX_THRESHOLD_VALUE = 100;

export function OptionsApp() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [thresholdError, setThresholdError] = useState<string | undefined>();

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTracker = useMemo(() => new SaveTracker(setSaveStatus), []);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      applyTheme(s.theme || "system");
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    
    // Listen for OS theme changes if set to system
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (settings.theme === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.theme, loaded]);

  const updateSettings = useCallback(
    (updater: (prev: ExtensionSettings) => ExtensionSettings) => {
      setSettings((prev) => {
        const next = updater(prev);
        if (prev.theme !== next.theme) {
          applyTheme(next.theme);
        }
        
        saveTracker.trackSave(saveSettings(next));
          
        return next;
      });
    },
    [saveTracker]
  );

  const handleThresholdChange = useCallback(
    (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        setThresholdError("Must be a positive number");
        return;
      }
      if (num > MAX_THRESHOLD_VALUE) {
        setThresholdError(`Maximum is ${MAX_THRESHOLD_VALUE}`);
        return;
      }
      setThresholdError(undefined);
      updateSettings((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          accountAge: {
            ...prev.filters.accountAge,
            threshold: {
              ...prev.filters.accountAge.threshold,
              value: num,
            },
          },
        },
      }));
    },
    [updateSettings]
  );

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 dark:text-slate-400">Loading settings...</p>
      </div>
    );
  }

  const isAgeFilterEnabled = settings.filters.accountAge.enabled;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Declank</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Configurable comment filters for old Reddit
        </p>
      </div>

      {/* General Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Extension enabled</Label>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Toggle the extension on or off
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  updateSettings((prev) => ({ ...prev, enabled: checked }))
                }
                aria-label="Toggle extension"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Debug logging</Label>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Log filtering activity to the browser console
                </p>
              </div>
              <Switch
                checked={settings.debug}
                onCheckedChange={(checked) =>
                  updateSettings((prev) => ({ ...prev, debug: checked }))
                }
                aria-label="Toggle debug logging"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  Choose your preferred appearance
                </p>
              </div>
              <Select
                value={settings.theme || "system"}
                onValueChange={(val) =>
                  updateSettings((prev) => ({ ...prev, theme: val as ThemePreference }))
                }
                options={THEME_OPTIONS}
                aria-label="Theme preference"
              />
            </div>

            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-4 py-3">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Declank currently supports{" "}
                <strong>old Reddit</strong> only (old.reddit.com).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Comment Filters</CardTitle>
          <CardDescription>
            Comments matching any enabled filter will be collapsed.
            Collapsed comments can still be expanded manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 divide-y divide-gray-100 dark:divide-slate-800">
            {/* Account Age Filter */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Account age</Label>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    Collapse comments from recently created accounts
                  </p>
                </div>
                <Switch
                  checked={isAgeFilterEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        accountAge: {
                          ...prev.filters.accountAge,
                          enabled: checked,
                        },
                      },
                    }))
                  }
                  aria-label="Toggle account age filter"
                />
              </div>
              <div className="mt-3 ml-0 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span className={!isAgeFilterEnabled ? "opacity-50" : ""}>Younger than</span>
                <Input
                  type="number"
                  min={1}
                  max={MAX_THRESHOLD_VALUE}
                  value={settings.filters.accountAge.threshold.value}
                  onChange={(e) => handleThresholdChange(e.target.value)}
                  error={thresholdError}
                  disabled={!isAgeFilterEnabled}
                  aria-label="Age threshold value"
                />
                <Select
                  value={settings.filters.accountAge.threshold.unit}
                  onValueChange={(unit) =>
                    updateSettings((prev) => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        accountAge: {
                          ...prev.filters.accountAge,
                          threshold: {
                            ...prev.filters.accountAge.threshold,
                            unit: unit as TimeUnit,
                          },
                        },
                      },
                    }))
                  }
                  options={TIME_UNIT_OPTIONS}
                  disabled={!isAgeFilterEnabled}
                  aria-label="Age threshold unit"
                />
              </div>
            </div>

            {/* Generated Username Filter */}
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatically generated usernames</Label>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    Collapse comments from usernames matching Reddit's
                    common generated-name format
                  </p>
                </div>
                <Switch
                  checked={settings.filters.generatedUsername.enabled}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        generatedUsername: {
                          ...prev.filters.generatedUsername,
                          enabled: checked,
                        },
                      },
                    }))
                  }
                  aria-label="Toggle generated username filter"
                />
              </div>
            </div>

            {/* Media-Only Filter */}
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Media-only comments</Label>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    Collapse comments containing only a GIF, image,
                    or other supported media
                  </p>
                </div>
                <Switch
                  checked={settings.filters.mediaOnly.enabled}
                  onCheckedChange={(checked) =>
                    updateSettings((prev) => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        mediaOnly: {
                          ...prev.filters.mediaOnly,
                          enabled: checked,
                        },
                      },
                    }))
                  }
                  aria-label="Toggle media-only filter"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end min-h-6 text-sm">
        {saveStatus === "saving" && <span className="text-gray-500 dark:text-slate-400">Saving…</span>}
        {saveStatus === "saved" && <span className="text-green-600 dark:text-green-500">✓ Saved</span>}
        {saveStatus === "error" && <span className="text-red-500 dark:text-red-400">⚠ Couldn't save</span>}
      </div>

      <p className="mt-2 text-center text-xs text-gray-400 dark:text-slate-500">
        Declank v0.1.0
      </p>
    </div>
  );
}
