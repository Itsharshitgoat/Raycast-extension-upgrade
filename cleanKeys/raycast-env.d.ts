/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `start-cleaning` command */
  export type StartCleaning = ExtensionPreferences & {}
  /** Preferences accessible in the `stop-cleaning` command */
  export type StopCleaning = ExtensionPreferences & {}
  /** Preferences accessible in the `toggle-cleaning` command */
  export type ToggleCleaning = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `start-cleaning` command */
  export type StartCleaning = {}
  /** Arguments passed to the `stop-cleaning` command */
  export type StopCleaning = {}
  /** Arguments passed to the `toggle-cleaning` command */
  export type ToggleCleaning = {}
}

