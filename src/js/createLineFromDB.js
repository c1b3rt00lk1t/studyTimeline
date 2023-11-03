import { set as setIdb, get as getIdb } from "../indexedDB/indexedDB";

import {
  getDataFromDBLines,
  getDataFromDBLanguages,
  getDataFromDBInitialLanguage,
  getDataFromDBBasics,
  getDataFromDBInitialLine,
  getDataFromDBYears,
  getDataFromDBModals,
  getDataFromDBVersion,
  checkConnectionFromDB,
} from "../firebase/firebase.mjs";

import { recreateEverything } from "./dropdownMenus";

/**
 * Get data from DB and stored it in indexedDB
 */

const storeDataToIndexedDB = async (mark, hasLanguage, data) => {
  if (hasLanguage) {
    for (const [language, prop] of Object.entries(data)) {
      await setIdb(
        "StudyTimeline_Data",
        `StudyTimeline_${mark}_${language}`,
        JSON.stringify(prop)
      );
    }
  } else {
    await setIdb(
      "StudyTimeline_Data",
      `StudyTimeline_${mark}`,
      JSON.stringify(data)
    );
  }
  console.log(`loaded: ${mark}`);
};

async function getDataFromDBAll() {
  const versionIndexedDB = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_version`)) || "{}"
  );
  const versionExternalDB = await getDataFromDBVersion(storeDataToIndexedDB);
  const checkVersions = versionExternalDB === versionIndexedDB;
  console.log(checkVersions ? "version up to date" : "updating...");

  if (!versionIndexedDB.length || !checkVersions) {
    let language = localStorage.getItem("StudyTimeline_initialLanguage");
    await Promise.all([
      getDataFromDBLines(storeDataToIndexedDB),
      getDataFromDBLanguages(storeDataToIndexedDB),
      getDataFromDBInitialLine(storeDataToIndexedDB),
      getDataFromDBYears(storeDataToIndexedDB),
      getDataFromDBModals(storeDataToIndexedDB),
      getDataFromDBInitialLanguage(storeDataToIndexedDB),
      getDataFromDBBasics(storeDataToIndexedDB),
    ]);
    await recreateEverything(language);
  }
}

export const createLineFromDB = () => checkConnectionFromDB(getDataFromDBAll);

/**
 * Check indexedDB for already existing data
 * If there is already data in indexedDB, create a line with it
 */

export async function createLineFromIndexedDB() {
  const versionIndexedDB = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_version`)) || "{}"
  );

  if (versionIndexedDB.length) {
    let language = localStorage.getItem("StudyTimeline_initialLanguage");
    await recreateEverything(language);
  }
}
