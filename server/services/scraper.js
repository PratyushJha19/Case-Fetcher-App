export const scrapeCourtData = async (
  caseType,
  caseNumber,
  filingYear,
  captchaText
) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://services.ecourts.gov.in/ecourtindia_v6/");

    // Fill form fields
    await page.selectOption("select[name='stateCode']", "Delhi");
    await page.selectOption("select[name='distCode']", "South");
    await page.selectOption("select[name='courtComplexCode']", "YourCode"); // update accordingly
    await page.selectOption("select[name='caseType']", caseType);
    await page.fill("input[name='caseNo']", caseNumber);
    await page.fill("input[name='caseYear']", filingYear);
    await page.fill("input[name='captcha']", captchaText);

    // Submit
    await Promise.all([
      page.waitForNavigation(),
      page.click("button#submitBtn"), // update the selector based on actual button ID/class
    ]);

    // Scrape the result page
    const data = await page.evaluate(() => {
      const partyNames =
        document.querySelector(".partyNameSelector")?.innerText || "";
      const filingDate =
        document.querySelector(".filingDateSelector")?.innerText || "";
      const nextHearing =
        document.querySelector(".nextHearingDateSelector")?.innerText || "";
      const pdfLink = document.querySelector(".pdfLinkSelector a")?.href || "";

      return { partyNames, filingDate, nextHearing, pdfLink };
    });

    const rawHTML = await page.content();
    await browser.close();
    return { parsedData: data, rawHTML };
  } catch (err) {
    await browser.close();
    throw err;
  }
};
