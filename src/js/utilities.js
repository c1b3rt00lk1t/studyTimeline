import { get as getIdb } from "../indexedDB/indexedDB";
import { showModalParams } from "./setLanguageLineModal";
import {
  createDropDownLanguages,
  addOnClickChangeLanguage,
  createDropDownLines,
  addOnClickChangeLine,
} from "./dropdownMenus";
import { onClickStudy } from "./studyMode";

/**
 * Timeline creation
 * */

// Reset line

function resetLine() {
  document.querySelector("#years").innerHTML = "";
  document.querySelector("#upper-details").innerHTML = "";
  document.querySelector("#lower-details").innerHTML = "";
  document.querySelectorAll(".modal").forEach((element) => element.remove());
}

// Title
async function checkTitle(line, language) {
  const lines = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_lines_${language}`)) ||
      "{}"
  );
  document.querySelector("a.navbar-brand").innerText = lines[line].description;
}

// Center line creation
async function createCenterLine(line, language) {
  const years = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_years_${language}`)) ||
      "{}"
  );
  const yearsContainer = document.querySelector("#years");
  const template = document.querySelector("#template-year").content;
  const fragment = document.createDocumentFragment();

  for (const year of years[line]) {
    const clone = template.cloneNode(true);
    clone.querySelector("div").textContent = year.year;
    clone.querySelector("div").id = `year${year.year}`;
    let classModal = "";
    if (year.modal != undefined) {
      clone.querySelector("div").dataset.bsToggle = "modal";
      clone.querySelector("div").dataset.bsTarget = "#" + year.modal;
      classModal = "modal-li";
    }

    clone.querySelector("div").classList = `year ${classModal} ${
      years[line].indexOf(year) % 2 === 0 ? "par" : "impar"
    }`;
    fragment.appendChild(clone);
  }
  yearsContainer.appendChild(fragment);
}

// Scroll to last saved scroll
function toLastScrollLeft() {
  document.querySelector("div.scroll-container").scrollLeft =
    localStorage.getItem("StudyTimeline_scrollLeft");
}

// Create upper and lower details

async function createDetailsLine(upperOrLower, line, language) {
  const years = JSON.parse(
    await getIdb("StudyTimeline_Data", `StudyTimeline_years_${language}`)
  );
  const yearsContainer = document.querySelector(upperOrLower);
  const template = document.querySelector("#template-detalles").content;
  const fragment = document.createDocumentFragment();
  const par = upperOrLower === "#upper-details" ? 1 : 0;

  for (const year of years[line]) {
    const clone = template.cloneNode(true);
    clone.querySelector("div").dataset.year = year.year;
    clone.querySelector("div").classList = `detalles ${
      par ? "upper" : "lower"
    }`;

    if (year.year % 2 === par && year.facts) {
      for (const fact of year.facts) {
        const li = document.createElement("li");
        li.textContent = fact.text;
        if (fact.modal != "") {
          li.dataset.bsToggle = "modal";
          li.dataset.bsTarget = "#" + fact.modal;
          li.classList = "modal-li";
        }
        clone.querySelector("ul").appendChild(li);
      }
    }

    fragment.appendChild(clone);
  }
  yearsContainer.appendChild(fragment);
}

// Create modals
async function createModals(line, language) {
  const modals = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_modals_${language}`)) ||
      "{}"
  );
  const body = document.querySelector("body");
  const template = document.querySelector("#template-modal").content;
  const fragment = document.createDocumentFragment();
  for (const modal of modals[line]) {
    const clone = template.cloneNode(true);
    clone.querySelector(".modal").id = modal.id;
    clone.querySelector(".modal-title").textContent = modal.title;
    for (const content of modal.contents) {
      clone.querySelector(".modal-body").innerHTML += `<p>${content.text}</p>`;

      if (content.img !== "") {
        clone.querySelector(
          ".modal-body"
        ).innerHTML += `<img src="${content.img.path}" alt="modal" class="${content.img.imgClass}"/>`;
      }
    }
    if (!!modal.footer) {
      for (const foot of modal.footer) {
        clone.querySelector(
          ".modal-footer"
        ).innerHTML += `<button class="btn btn-sm btn-secondary" data-bs-target="#${foot.id}" data-bs-toggle="modal" data-bs-dismiss="modal">${foot.text}</button>`;
      }
    }

    fragment.appendChild(clone);
  }
  body.appendChild(fragment);
}

// Event to unfold or fold details
function createInfoButtons() {
  [...document.querySelectorAll(".infoShow")].forEach((btn) =>
    btn.addEventListener("click", showInfo)
  );
}

// Event to scroll the line when moving to next or previous modal
function createButtonsScrollToTarget() {
  [...document.querySelectorAll(".modal-footer > button")].forEach((btn) =>
    btn.addEventListener("click", () => {
      document
        .querySelector(
          `#year${[...btn.dataset.bsTarget].slice(6, 10).join("")}`
        )
        .scrollIntoView({ behavior: "smooth", inline: "center" });
    })
  );
}

async function showInfo(ev) {
  const lang =
    localStorage.getItem("StudyTimeline_initialLanguage") ||
    JSON.parse(
      (await getIdb("StudyTimeline_Data", `StudyTimeline_initialLanguage`)) ||
        "{}"
    );
  const basics = JSON.parse(
    await getIdb("StudyTimeline_Data", `StudyTimeline_basics_${lang}`)
  );
  const id =
    ev.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
  document.querySelector(`#${id}Info`).classList.toggle("infoHidden");
  ev.target.textContent =
    ev.target.textContent[0] === "+"
      ? `- ${basics.detail}`
      : `+ ${basics.detail}`;
}

async function createLine() {
  const line = localStorage.getItem("StudyTimeline_initialLine");
  const language = localStorage.getItem("StudyTimeline_initialLanguage");
  const notFirstTime = localStorage.getItem("StudyTimeline_notFirstTime");
  resetLine();
  checkTitle(line, language);
  await createCenterLine(line, language);
  toLastScrollLeft();
  await createDetailsLine("#upper-details", line, language);
  await createDetailsLine("#lower-details", line, language);
  await createModals(line, language);
  createInfoButtons();
  createButtonsScrollToTarget();
  addMoveIt();
  !notFirstTime && scrollToBeginning();
  showModalParams();
  localStorage.setItem("StudyTimeline_notFirstTime", "true");
}

export function clearLSFirstTimeAndScroll() {
  localStorage.removeItem("StudyTimeline_notFirstTime");
  localStorage.removeItem("StudyTimeline_scrollLeft");
}

/**
 * Scroll control
 */

function moveIt(evt) {
  if (evt.type === "click") {
    if (!evt.target.classList.contains("scroll-trigger")) {
      return;
    }
  }

  const scrollContainer = document.querySelector(".scroll-container");
  const division = evt.target.dataset.division;
  const direction = evt.target.dataset.direction;

  if (division === "0") {
    if (direction === "back") {
      const scrollByOptions = { left: 0, behavior: "smooth" };
      scrollContainer.scroll(scrollByOptions);
    } else if (direction === "forward") {
      const scrollByOptions = {
        left: document.querySelector(".scroll-container").scrollWidth,
        behavior: "smooth",
      };
      scrollContainer.scroll(scrollByOptions);
    }
  } else {
    /* Divide by 2 to reduce the distance scrolled */
    let xScrollBy = scrollContainer.clientWidth / division;
    /* Negate the scrollBy value if the back arrow was clicked */
    if (direction === "back") {
      xScrollBy = xScrollBy * -1;
    }

    const scrollByOptions = { left: xScrollBy, behavior: "smooth" };
    scrollContainer.scrollBy(scrollByOptions);
  }
}

function addMoveIt() {
  document.body.addEventListener("click", moveIt);
}

function scrollToBeginning() {
  document.getElementById("scrollToBeginning").click();
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
