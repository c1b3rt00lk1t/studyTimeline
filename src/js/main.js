import { checkConnectionFromDB } from "../firebase/firebase.mjs";
import {
  setLanguage,
  setLine,
  getDataFromDBAll,
  createLineFromIndexedDB,
  clearLSFirstTimeAndScroll,
} from "./utilities.js";

/**
 * Set language and timeline
 */

await setLanguage();
await setLine();

/**
 * Check connection to retrieve data from there
 * When the data is in the indexedDB, a line is created
 */

checkConnectionFromDB(getDataFromDBAll);

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
