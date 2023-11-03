import { clearLSFirstTimeAndScroll } from "./utilities.js";

import { setLanguage, setLine } from "./setLanguageLineModal.js";
import {
  createLineFromDB,
  createLineFromIndexedDB,
} from "./createFromDBorIndexedDB.js";
/**
 * Set language and timeline
 */

await setLanguage();
await setLine();

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
 * Clear first time and scroll position when closing
 */

window.addEventListener("beforeunload", () => {
  clearLSFirstTimeAndScroll();
});

/**
 * Service worker registration
 */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { type: "module" });
}
