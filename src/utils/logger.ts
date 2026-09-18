const PREFIX = "[Declank]";

let debugEnabled = false;

export const setDebugEnabled = (enabled: boolean): void => {
  debugEnabled = enabled;
};

export const isDebugEnabled = (): boolean => debugEnabled;

export const log = (...args: unknown[]): void => {
  if (!debugEnabled) return;
  console.log(PREFIX, ...args);
};

export const warn = (...args: unknown[]): void => {
  if (!debugEnabled) return;
  console.warn(PREFIX, ...args);
};

export const error = (...args: unknown[]): void => {
  // Errors always log regardless of debug mode
  console.error(PREFIX, ...args);
};
