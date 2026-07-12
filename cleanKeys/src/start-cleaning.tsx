import { closeMainWindow, showHUD } from "@raycast/api";
import { launchApp, clickToggle, getCleaningState } from "./utils";

export default async function StartCleaning() {
  await closeMainWindow();

  try {
    // Launch the app (or bring it to front if already running)
    await launchApp();

    // Check current state
    const state = await getCleaningState();

    if (state === 1) {
      // Already in cleaning mode
      await showHUD("Active cleaning mode");
      return;
    }

    // Click the toggle to start cleaning
    await clickToggle();

    // Verify it worked
    const newState = await getCleaningState();
    if (newState === 1) {
      await showHUD("Happy cleaning");
    } else {
      await showHUD("Did't able to start cleanKeys");
    }
  } catch (error) {
    await showHUD("Is cleanKeys even installed...?");
  }
}
