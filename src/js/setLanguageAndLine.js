import { get as getIdb } from "../indexedDB/indexedDB.js";

/**
 * Check parameters to determine language, line and/or modal
 */

const checkParams = () => {
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
