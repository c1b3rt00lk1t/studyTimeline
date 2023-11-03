import { get as getIdb } from "../indexedDB/indexedDB";
/**
 * Study mode
 */

export function onClickStudy() {
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
