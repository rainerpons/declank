import { describe, it, expect, vi } from "vitest";
import { SaveTracker } from "./saveTracker";

describe("SaveTracker", () => {
  it("transitions to saving and then saved on success", async () => {
    const setStatus = vi.fn();
    const tracker = new SaveTracker(setStatus);

    const promise = Promise.resolve();
    await tracker.trackSave(promise);

    expect(setStatus).toHaveBeenNthCalledWith(1, "saving");
    expect(setStatus).toHaveBeenNthCalledWith(2, "saved");
  });

  it("transitions to saving and then error on failure", async () => {
    const setStatus = vi.fn();
    const tracker = new SaveTracker(setStatus);

    const promise = Promise.reject(new Error("Test error"));
    await tracker.trackSave(promise);

    expect(setStatus).toHaveBeenNthCalledWith(1, "saving");
    expect(setStatus).toHaveBeenNthCalledWith(2, "error");
  });

  it("ignores older resolved promises if a newer save was started", async () => {
    const setStatus = vi.fn();
    const tracker = new SaveTracker(setStatus);

    let resolveFirst!: () => void;
    const firstPromise = new Promise<void>((r) => { resolveFirst = r; });
    const secondPromise = Promise.resolve();

    const p1 = tracker.trackSave(firstPromise);
    const p2 = tracker.trackSave(secondPromise);

    resolveFirst();
    await Promise.all([p1, p2]);

    expect(setStatus).toHaveBeenNthCalledWith(1, "saving");
    expect(setStatus).toHaveBeenNthCalledWith(2, "saving");
    expect(setStatus).toHaveBeenNthCalledWith(3, "saved");
    expect(setStatus).toHaveBeenCalledTimes(3); // The first promise resolving shouldn't call setStatus("saved")
  });
});
