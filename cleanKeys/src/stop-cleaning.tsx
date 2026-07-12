import { closeMainWindow, showHUD } from "@raycast/api";
import { isAppRunning, clickToggle, getCleaningState, quitApp } from "./utils";

export default async function StopCleaning() {
  await closeMainWindow();

  try {
    const running = await isAppRunning();

    if (!running) {
      await showHUD("✅ Keyboard is already enabled — nothing to stop.");
      return;
    }

    const state = await getCleaningState();

    if (state === 0) {
      // Not in cleaning mode — just quit the app
      await quitApp();
      await showHUD("✅ Keyboard was already enabled. App closed.");
      return;
    }

    if (state === 1) {
      // In cleaning mode — click the toggle to stop, then quit
      await clickToggle();

      // Small delay to let the state change
      await new Promise(resolve => setTimeout(resolve, 500));

      // Quit the app
      await quitApp();
      await showHUD("✅ Keyboard unlocked! Cleaning complete.");
      return;
    }

    // state is null — window might not be accessible
    // Force quit as a fallback
    await quitApp();
    await showHUD("✅ cleanKeys closed. Keyboard should be re-enabled.");
  } catch (error) {
    await showHUD(
      "❌ Failed to stop cleaning. Try quitting cleanKeys manually."
    );
  }
}
