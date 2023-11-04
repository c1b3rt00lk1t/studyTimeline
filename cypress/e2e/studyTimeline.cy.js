describe("template spec", () => {
  // const URL = "https://studytimeline-c92b5.web.app";
  const URL = "http://localhost:5000";

  beforeEach(() => {
    cy.viewport(1600, 900);
    cy.visit(URL);
  });

  it("displays the footer", () => {
    cy.contains("developed by");
  });

  it("displays the default title", () => {
    cy.contains("Javascript History");
  });

  xit("opens the introduction modal", () => {
    cy.contains("Introduction").click();
    cy.contains("Next >> 1995");
  });

  it("navigates forward through several modals and closes the last one", () => {
    const ms = 500;
    cy.get("div").contains("Introduction").click();
    cy.wait(ms);
    cy.get("button").contains("Next >> 1995").as("firstModal");
    cy.wait(ms);
    cy.get("button").contains("Next >> 1995").click();
    cy.wait(ms);
    cy.get("button").contains("Next >> 1996").click();
    cy.wait(ms);
    cy.get("button").contains("Next >> 1997").click();
    cy.wait(ms);
    cy.get("button").contains("Next >> 2005").click();
    cy.wait(ms);
    cy.get("button").contains("Next >> 2008").click();
    cy.wait(ms);
    cy.get("button").contains("Next >> 2009").click();
    cy.wait(ms);
    cy.get("#modal2009nodejs button.btn-close").click();
  });
});
