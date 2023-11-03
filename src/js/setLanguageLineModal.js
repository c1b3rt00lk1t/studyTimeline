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

async function setLanguage() {
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

async function setLine() {
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
 * Displays a modal from the beginning
 */

export function showModalParams() {
  const modal = checkParams().modal;
  if (modal) {
    const myModal = new bootstrap.Modal(document.querySelector(`#${modal}`), {
      keyboard: false,
    });

    myModal.show();
    setTimeout(
      () =>
        document
          .querySelector(`[data-bs-target='#${modal}']`)
          .scrollIntoView({ behavior: "smooth", inline: "center" }),
      1000
    );
  }
}

/**
 * Clear first time and scroll position when closing
 */

function clearLSFirstTimeAndScroll() {
  localStorage.removeItem("StudyTimeline_notFirstTime");
  localStorage.removeItem("StudyTimeline_scrollLeft");
}

/**
 * Set initials
 */

export async function setInitials() {
  await setLanguage();
  await setLine();
  window.addEventListener("beforeunload", () => {
    clearLSFirstTimeAndScroll();
  });
}
