import { clearLSFirstTimeAndScroll } from "./createLine.js";

import { setInitials } from "./setLanguageLineModal.js";
import {
  createLineFromDB,
  createLineFromIndexedDB,
} from "./createLineFromDB.js";
/**
 * Set language, timeline and cleanup
 */

await setInitials();

/**
 * Asyncronously retrieve data from firebase DB into indexedDB
 * When the data is in the indexedDB, a line is created
 */

createLineFromDB();

/**
 * In the meantime check indexedDB for already existing data
 * If there is already data in indexedDB, create a line with it
 */

await createLineFromIndexedDB();

/**
 * Service worker registration
 */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { type: "module" });
}
