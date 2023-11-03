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

export function addMoveIt() {
  document.body.addEventListener("click", moveIt);
}

export function scrollToBeginning() {
  document.getElementById("scrollToBeginning").click();
}

// Scroll to last saved scroll
export function toLastScrollLeft() {
  document.querySelector("div.scroll-container").scrollLeft =
    localStorage.getItem("StudyTimeline_scrollLeft");
}

// Event to scroll the line when moving to next or previous modal
export function createButtonsScrollToTarget() {
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
