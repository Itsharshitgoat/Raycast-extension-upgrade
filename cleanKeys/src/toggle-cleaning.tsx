import { closeMainWindow, showHUD } from "@raycast/api";
import {
  isAppRunning,
  launchApp,
  clickToggle,
  getCleaningState,
  quitApp
} from "./utils";

export default async function ToggleCleaning() {
  await closeMainWindow();

  try {
    const running = await isAppRunning();

    if (!running) {
      // App is not running → launch it and start cleaning
      await launchApp();
      await clickToggle();

      const state = await getCleaningState();
      if (state === 1) {
        await showHUD(
          "🔒 Keyboard locked — clean away! Press Cmd+Esc again when done."
        );
      } else {
        await showHUD(
          "⚠️ Could not start cleaning. Check Accessibility permissions."
        );
      }
      return;
    }

    // App is running — check the current state
    const state = await getCleaningState();

    if (state === 1) {
      // Currently cleaning → stop it and quit the app
      await clickToggle();
      await new Promise(resolve => setTimeout(resolve, 500));
      await quitApp();
      await showHUD("✅ Keyboard unlocked! Cleaning complete.");
    } else if (state === 0) {
      // App is open but not cleaning → start cleaning
      await clickToggle();

      const newState = await getCleaningState();
      if (newState === 1) {
        await showHUD(
          "🔒 Keyboard locked — clean away! Press Cmd+Esc again when done."
        );
      } else {
        await showHUD(
          "⚠️ Could not start cleaning. Check Accessibility permissions."
        );
      }
    } else {
      // Can't determine state — try to launch fresh
      await quitApp();
      await new Promise(resolve => setTimeout(resolve, 500));
      await launchApp();
      await clickToggle();
      await showHUD(
        "🔒 Keyboard locked — clean away! Press Cmd+Esc again when done."
      );
    }
  } catch (error) {
    await showHUD("❌ Something went wrong. Is cleanKeys installed?");
  }
}
