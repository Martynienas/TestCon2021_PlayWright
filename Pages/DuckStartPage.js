const inputField = "#search_form_input_homepage";
const searchButton = "#search_button_homepage";

exports.DuckStartPage = class DuckStartPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("https://start.duckduckgo.com/");
  }

  async initiateSearch(searchCriteria) {
    await this.page.fill(inputField, searchCriteria);
    await this.page.click(searchButton);
    await this.page.waitForNavigation();
  }
};
