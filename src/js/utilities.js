import {
  getDataFromDBLines,
  getDataFromDBLanguages,
  getDataFromDBInitialLanguage,
  getDataFromDBBasics,
  getDataFromDBInitialLine,
  getDataFromDBYears,
  getDataFromDBModals,
  getDataFromDBVersion,
} from "../firebase/firebase.mjs";
import { set as setIdb, get as getIdb } from "../indexedDB/indexedDB.js";

/**
 * Check parameters to determine language, line and/or modal
 */

export const checkParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const language = searchParams.get("lang");
  const line = searchParams.get("line");
  const modal = searchParams.get("modal");
  return { language, line, modal };
};

/**
 * Set the initial language
 */

export async function setLanguage() {
  let language =
    checkParams().language ||
    localStorage.getItem("StudyTimeline_initialLanguage") ||
    JSON.parse(
      (await getIdb("StudyTimeline_Data", `StudyTimeline_initialLanguage`)) ||
        '"en"'
    );
  saveAsInitialLanguage(language);
}

export function saveAsInitialLanguage(language) {
  localStorage.setItem("StudyTimeline_initialLanguage", language);
}

/**
 * Set the initial line
 */

export async function setLine() {
  let line =
    checkParams().line ||
    localStorage.getItem("StudyTimeline_initialLine") ||
    JSON.parse(
      (await getIdb("StudyTimeline_Data", `StudyTimeline_initialLine`)) ||
        '"js"'
    );

  saveAsInitialLine(line);
  return line;
}

export function saveAsInitialLine(line) {
  localStorage.setItem("StudyTimeline_initialLine", line);
}

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

export async function getDataFromDBAll() {
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
