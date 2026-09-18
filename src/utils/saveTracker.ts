export class SaveTracker {
  private currentSaveId = 0;

  constructor(
    private setStatus: (status: "idle" | "saving" | "saved" | "error") => void
  ) {}

  async trackSave(savePromise: Promise<void>): Promise<void> {
    this.currentSaveId++;
    const saveId = this.currentSaveId;
    this.setStatus("saving");

    try {
      await savePromise;
      if (this.currentSaveId === saveId) {
        this.setStatus("saved");
      }
    } catch (err) {
      if (this.currentSaveId === saveId) {
        this.setStatus("error");
      }
    }
  }
}
