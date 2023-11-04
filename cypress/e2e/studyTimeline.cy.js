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
});
