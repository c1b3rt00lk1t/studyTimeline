import { get as getIdb } from "../indexedDB/indexedDB";

import {
  saveAsInitialLanguage,
  saveAsInitialLine,
  showModalParams,
} from "./setLanguageLineModal";

/**
 * Create the "drop down" language menu
 */

async function createDropDownLanguages() {
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
 *  Change language using the "dropdown" menu
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

async function addOnClickChangeLanguage() {
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

async function createDropDownLines(language) {
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

async function addOnClickChangeLine(language) {
  const lines = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_lines_${language}`)) ||
      "{}"
  );
  for (const line of Object.keys(lines)) {
    onClickChangeLine(line, language);
  }
}

/**
 * Study mode
 */

function onClickStudy() {
  document.getElementById("quizz").addEventListener("click", createStudy);
}

async function createStudy() {
  const language = localStorage.getItem("StudyTimeline_initialLanguage");
  const line = localStorage.getItem("StudyTimeline_initialLine");
  const modals = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_modals_${language}`)) ||
      "{}"
  );
  const basics = JSON.parse(
    (await getIdb("StudyTimeline_Data", `StudyTimeline_basics_${language}`)) ||
      "{}"
  );
  if (line !== "ic") return;
  let studyProgress = 0;

  const studyModals = modals[line]
    .map((modal) => ({ ...modal, id: modal.id + "study" }))
    .filter((modal) => modal.title.startsWith("["))
    .sort(() => Math.random() - 0.5);

  const body = document.querySelector("body");
  const template = document.querySelector("#template-modal-study").content;
  const fragment = document.createDocumentFragment();
  for (const modal of studyModals) {
    const clone = template.cloneNode(true);
    clone.querySelector(".modal").id = modal.id;
    clone.querySelector(".modal-title").textContent = modal.title.slice(7);
    // temp
    clone.querySelector(".modal-body").innerHTML = `
    <form autocomplete="off">
      <input class="studyInput" id=${
        modal.id + "input"
      } type="text" placeholder=" ${basics.year}..."/>
      <button id=${modal.id + "btn"}> ${basics.next} </button>
    </form>`;
    clone
      .querySelector(".modal-body button")
      .addEventListener("click", (ev) => {
        ev.preventDefault();
        const isCorrect =
          ev.target.parentNode.querySelector("input").value ===
          modal.title.slice(1, 5);
        if (isCorrect) {
          ev.target.parentNode
            .querySelector("input")
            .classList.remove("studyInputRed");
          ev.target.parentNode
            .querySelector("input")
            .classList.add("studyInputGreen");
          setTimeout(() => {
            resetInputModal(modal.id);
            fadeModal(modal.id);
            if (studyProgress < studyModals.length - 1) {
              studyProgress++;
              showModal(studyModals[studyProgress].id);
              focusInputModal(studyModals[studyProgress].id);
            } else {
              studyProgress = 0;
            }
          }, 1000);
        } else {
          ev.target.parentNode
            .querySelector("input")
            .classList.remove("studyInputGreen");
          ev.target.parentNode
            .querySelector("input")
            .classList.add("studyInputRed");
        }
      });

    fragment.appendChild(clone);
  }
  body.appendChild(fragment);
  showModal(studyModals[studyProgress].id);
  focusInputModal(studyModals[studyProgress].id);
}

function showModal(modalId) {
  const myModal2 = new bootstrap.Modal(document.querySelector(`#${modalId}`), {
    keyboard: false,
  });
  myModal2.show();
}

function focusInputModal(modalId) {
  // Focus input
  const studyModal = document.getElementById(modalId);
  studyModal.addEventListener("shown.bs.modal", function () {
    document.getElementById(`${modalId}input`).focus();
  });
}

function resetInputModal(modalId) {
  const inputModal = document.getElementById(`${modalId}input`);
  inputModal.value = "";
  inputModal.classList.remove("studyInputGreen", "studyInputGreen");
}

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

/**
 * Switch from a modal
 */

function fadeModal(id) {
  document.querySelector(`#${id}`).classList = "modal fade";
  document.querySelector(`#${id}`).style = "display: none";
  document.querySelector(`#${id}`).setAttribute("aria-hidden", true);
  document.querySelector(`#${id}`).removeAttribute("role");
  document.querySelector(`#${id}`).removeAttribute("aria-modal");
  const modalbackdrop = document.querySelector(".modal-backdrop");
  document.body.removeChild(modalbackdrop);
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
