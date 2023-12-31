import { get as getIdb } from "../indexedDB/indexedDB";
import { showModalParams } from "./setLanguageLineModal";
import {
  addMoveIt,
  scrollToBeginning,
  toLastScrollLeft,
  createButtonsScrollToTarget,
} from "./scroll";

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

  // identifies the modal id
  let currentNode = ev.target;
  while (!currentNode.classList.value.includes("modal ")) {
    currentNode = currentNode.parentNode;
  }
  const id = currentNode.id;

  document.querySelector(`#${id}Info`).classList.toggle("infoHidden");
  ev.target.textContent =
    ev.target.textContent[0] === "+"
      ? `- ${basics.detail}`
      : `+ ${basics.detail}`;
}

export async function createLine() {
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
