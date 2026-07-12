import { runAppleScript } from "run-applescript";

/**
 * Checks whether CleanMyKeyboard is currently running.
 */
export async function isAppRunning(): Promise<boolean> {
  const result = await runAppleScript(`
    tell application "System Events"
      if exists (processes where name is "CleanMyKeyboard") then
        return "true"
      else
        return "false"
      end if
    end tell
  `);
  return result.trim() === "true";
}

/**
 * Returns the current value of the cleaning toggle checkbox.
 * 1 = cleaning mode active (keyboard disabled)
 * 0 = normal mode (keyboard enabled)
 * Returns null if the app is not running or the window can't be accessed.
 */
export async function getCleaningState(): Promise<number | null> {
  try {
    const result = await runAppleScript(`
      tell application "System Events"
        if not (exists process "CleanMyKeyboard") then return "not_running"
        tell process "CleanMyKeyboard"
          if (count of windows) is 0 then return "no_window"
          tell window "CleanMyKeyboard"
            tell group 1
              return value of checkbox 1 as string
            end tell
          end tell
        end tell
      end tell
    `);
    if (result === "not_running" || result === "no_window") return null;
    return parseInt(result, 10);
  } catch {
    return null;
  }
}

/**
 * Launches CleanMyKeyboard and waits for its window to appear.
 */
export async function launchApp(): Promise<void> {
  await runAppleScript(`
    tell application "CleanMyKeyboard" to activate
    
    -- Wait for the window to appear (up to 5 seconds)
    repeat 50 times
      tell application "System Events"
        if exists process "CleanMyKeyboard" then
          tell process "CleanMyKeyboard"
            if (count of windows) > 0 then exit repeat
          end tell
        end if
      end tell
      delay 0.1
    end repeat
  `);
}

/**
 * Clicks the cleaning toggle checkbox in the CleanMyKeyboard window.
 * The app must be running and have a visible window.
 */
export async function clickToggle(): Promise<void> {
  await runAppleScript(`
    tell application "System Events"
      tell process "CleanMyKeyboard"
        set frontmost to true
        delay 0.3
        tell window "CleanMyKeyboard"
          tell group 1
            click checkbox 1
          end tell
        end tell
      end tell
    end tell
  `);
}

/**
 * Quits CleanMyKeyboard gracefully.
 */
export async function quitApp(): Promise<void> {
  await runAppleScript(`
    tell application "CleanMyKeyboard" to quit
  `);
}
