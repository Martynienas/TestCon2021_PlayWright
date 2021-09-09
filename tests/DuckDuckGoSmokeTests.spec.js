const { test, expect } = require("@playwright/test");
const { DuckStartPage } = require("../pages/duckStartPage");
const { DuckResultsPage } = require("../pages/duckResultsPage");

test.describe("Duck duck smoke test suite", () => {
  let page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    startPage = new DuckStartPage(page);
    resultsPage = new DuckResultsPage(page);
  });

  test.beforeEach(async () => {
    await startPage.goto();
  });

  test("Checking that page and logo loads", async () => {
    const isLogoVisible = await page.isVisible("#logo_homepage_link");
    expect(isLogoVisible).toBe(true);
  });

  test("Check that search results contain expected text", async () => {
    startPage.initiateSearch("Test");
    const firstResultText = await page.textContent("#r1-0");

    expect(firstResultText).toContain("Test");
  });

  test("T3 Check that Cheat sheet for MSWord is displayed", async () => {
    startPage.initiateSearch("Microsoft word cheat sheet");
    await page.waitForNavigation();
    await page.click("span.chomp--link__mr");

    expect(
      await page.isVisible('h6.cheatsheet__title:has-text("Formatting")')
    ).toBe(true);
  });

  test("T4 Check that URL shortening feature works", async () => {
    startPage.initiateSearch("shorten www.wikipedia.com");
    const shortUrl = await page.inputValue("#shorten-url");
    await page.goto(shortUrl);
    const newPageUrl = await page.url();
    expect(newPageUrl).toBe("https://www.wikipedia.org/");
  }, 60);

  test("T5 Check that intitle functionality works", async () => {
    startPage.initiateSearch("intitle:panda");
    await page.waitForNavigation();
    const results = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("h2.result__title.js-result-title"),
        (element) => element.textContent
      )
    );
    results.forEach((result) => {
      expect(result.toLowerCase()).toContain("panda");
    });
  });

  const passwordsLengthsPositive = ["8", "16", "64"];
  passwordsLengthsPositive.forEach((passwordLength) => {
    test(`T7 Check that generated passwords for length ${passwordLength}  are of correct length`, async () => {
      startPage.initiateSearch("password " + passwordLength);
      const generatedPassword = await resultsPage.getGeneratedPassword();
      expect(generatedPassword.length).toEqual(+passwordLength);
    });
  });

  test("T9 Check QR code is valid", async () => {
    startPage.initiateSearch("qr www.devbridge.com");
    await page.waitForNavigation();
    await page.waitForSelector('img[alt="A QR Code"]');
    const locator = page.locator('img[alt="A QR Code"]');

    expect(await locator.screenshot()).toMatchSnapshot("qrCode.png");
  });

  test("T10 Check that menu language can changed", async () => {
    await page.fill("#search_form_input_homepage", "qr www.devbridge.com");
    await page.click("#search_button_homepage");
    await page.waitForSelector('img[alt="A QR Code"]');
    await page.click("#duckbar_dropdowns > li > div > a");
    await page.selectOption("#setting_kad", "lt_LT");
    await page.waitForSelector(
      '.zcm__link.dropdown__button.js-dropdown-button:has-text("Nustatymai")'
    );
    menuText = await page.textContent("#duckbar");
    expect(menuText).toMatch(
      "VisiVaizdaiVaizdo įrašaiNaujienosŽemėlapiaiAtsakymasNustatymai"
    );
  });

  test("T11 Waiting for valid api responses", async () => {
    await page.fill("#search_form_input_homepage", "test");
    console.log();
    const [response] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url() ===
            "https://duckduckgo.com/js/spice/dictionary/hyphenation/test" &&
          response.status() === 200
      ),
      page.waitForResponse(
        (response) =>
          response.url() ===
            "https://duckduckgo.com/js/spice/dictionary/pronunciation/test" &&
          response.status() === 200
      ),
      page.waitForResponse(
        (response) =>
          response.url() ===
            "https://duckduckgo.com/js/spice/dictionary/audio/test" &&
          response.status() === 200
      ),

      await page.click("#search_button_homepage"),
    ]);
    expect(response.status()).toBe(200);
  });

  test("Check that calculator works", async () => {
    await startPage.initiateSearch("calculator");
    await page.click('button[value="1"]', { delay: 100 });
    await page.click('button[value="+"]', { delay: 100 });
    await page.click('button[value="1"]', { delay: 100 });
    await page.click('button[value="="]', { delay: 100 });
    const sumResult = await page.textContent("#display");
    await page.click('button[value="3"]', { delay: 100 });
    await page.click('button[value="×"]', { delay: 100 });
    await page.click('button[value="3"]', { delay: 100 });
    await page.click('button[value="="]', { delay: 100 });
    const multiplyResult = await page.textContent("#display");

    expect(parseInt(sumResult)).toBe(2);
    expect(parseInt(multiplyResult)).toBe(9);
    expect(await page.textContent(".tile__calc__col.tile__history")).toBe(
      "\n    3 × 3\n    9\n\n\n    1 + 1\n    2\n\n"
    );
  });
});
