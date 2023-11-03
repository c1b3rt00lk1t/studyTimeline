import { get as getIdb } from "../indexedDB/indexedDB";
import { createLine } from "./createLine";
import {
  saveAsInitialLanguage,
  saveAsInitialLine,
} from "./setLanguageLineModal";
import { onClickStudy } from "./studyMode";

/**
 * Create the "drop down" language menu
 */

export async function createDropDownLanguages() {
  let languages = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_languages`)) || "{}"
  );
  const dropDownMenu = document.querySelector("#dropdownLanguages");
  dropDownMenu.innerHTML = "";
  const template = document.querySelector("#template-dropdown").content;
  const fragment = document.createDocumentFragment();

  const sortedLanguages = Object.entries(languages).sort((a, b) =>
    a[1].order > b[1].order ? 1 : -1
  );

  for (const [language, { description }] of sortedLanguages) {
    const clone = template.cloneNode(true);
    clone.querySelector("a").id = language;
    clone.querySelector("a").textContent = description;

    fragment.appendChild(clone);
  }
  dropDownMenu.appendChild(fragment);
}

/**
 *  Change language usirecreateEverythingcreateng the "dropdown" menu
 */

function onClickChangeLanguage(language) {
  document.getElementById(language).addEventListener("click", async () => {
    // If the language is changed the previous params combination is deleted
    window.history.replaceState({}, document.title, "/" + "index.html");
    // Keeps track of the previous scroll point to be kept
    const scrollLeft = document.querySelector(
      "div.scroll-container"
    ).scrollLeft;
    localStorage.setItem("StudyTimeline_scrollLeft", scrollLeft);
    // Save the Language
    saveAsInitialLanguage(language);
    // Recreates everything
    await recreateEverything(language);
  });
}

export async function addOnClickChangeLanguage() {
  const languages = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_languages`)) || "{}"
  );
  for (const language of Object.keys(languages)) {
    onClickChangeLanguage(language);
  }
}

/**
 * Create the line drop down menu
 */

export async function createDropDownLines(language) {
  const lines = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_lines_${language}`)) ||
      "{}"
  );
  const basics = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_basics_${language}`)) ||
      "{}"
  );
  const dropDownMenu = document.querySelector("#dropdownLines");
  dropDownMenu.innerHTML = "";
  const template = document.querySelector("#template-dropdown").content;
  const fragment = document.createDocumentFragment();

  for (const [line, { description }] of Object.entries(lines).sort(
    (a, b) => b.order - a.order
  )) {
    const clone = template.cloneNode(true);
    clone.querySelector("a").id = line;
    clone.querySelector("a").textContent = description;

    fragment.appendChild(clone);
  }
  dropDownMenu.appendChild(fragment);

  //temp
  dropDownMenu.innerHTML += `
                      <li>
                          <hr class="dropdown-divider" />
                      </li>
                      <li><a id="quizz" class="dropdown-item " href="#">${basics.study}</a></li>`;
}

/**
 *  Change line using the "dropdown" menu
 * */

function onClickChangeLine(line) {
  document.getElementById(line).addEventListener("click", async () => {
    saveAsInitialLine(line);
    await createLine();
  });
}

export async function addOnClickChangeLine(language) {
  const lines = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_lines_${language}`)) ||
      "{}"
  );
  for (const line of Object.keys(lines)) {
    onClickChangeLine(line, language);
  }
}

export async function recreateEverything(language) {
  await createDropDownLanguages();
  await addOnClickChangeLanguage();
  await createLine();
  await createDropDownLines(language);
  await addOnClickChangeLine(language);
  onClickStudy();
  console.log("recreated");
}
