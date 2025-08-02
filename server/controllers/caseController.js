import { chromium } from "playwright";
import { v4 as uuidv4 } from "uuid";
import pool from "../db/index.js"; // Assuming you have a db.js file for database connection

const browserSessions = new Map();

export const getCaptcha = async (req, res) => {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://dhccaseinfo.nic.in/pcase/guiCaseWise.php", {
      timeout: 10000,
    });

    const element = await page.$('label#cap font[size="+1"]');
    const captchaText = (await element.textContent()).trim();

    const sessionId = uuidv4();
    browserSessions.set(sessionId, { browser, context, page });

    console.log("Captcha fetched:", captchaText);
    // console.log("Browser Session ID:", browserSessions);

    res.status(200).json({
      captchaText,
      sessionId,
    });
  } catch (err) {
    console.error("Error fetching CAPTCHA:", err);
    res.status(500).json({ message: "Failed to fetch CAPTCHA" });
  }
};

export const submitDetails = async (req, res) => {
  const { caseType, caseNumber, filingYear, captchaText, sessionId } = req.body;

  const session = browserSessions.get(sessionId);
  if (!session) {
    return res.status(400).json({ message: "Invalid or expired session." });
  }

  await pool.query(
    `INSERT INTO user_search (case_type, case_number, filing_year)
     VALUES ($1, $2, $3)`,
    [caseType, caseNumber, filingYear]
  );

  try {
    const { page } = session;

    // Fill form
    await page.selectOption('select[name="ctype"]', caseType);
    await page.fill('input[name="regno"]', caseNumber);
    await page.selectOption('select[name="regyr"]', filingYear);
    await page.fill('input[name="captcha_code"]', captchaText);
    await page.click('input[name="Submit"]');

    // Wait for navigation to complete
    await page.waitForLoadState("networkidle");

    // Extract all relevant details
    const data = await page.evaluate(() => {
      const getTextAfterLabel = (label) => {
        const fonts = Array.from(document.querySelectorAll('font[size="2"]'));
        for (let i = 0; i < fonts.length; i++) {
          if (fonts[i].textContent.trim().startsWith(label)) {
            return fonts[i + 1]?.textContent.trim() || null;
          }
        }
        return null;
      };

      const getPartyNames = () => {
        const tables = Array.from(document.querySelectorAll("table"));
        for (const table of tables) {
          if (
            table.textContent.includes("Vs.") ||
            table.textContent.includes("Vs")
          ) {
            const rows = table.querySelectorAll("tr");
            const petitioner = rows[0]?.innerText?.replace("Vs.", "")?.trim();
            const respondent = rows[1]?.innerText?.trim();
            return {
              petitioner,
              respondent,
            };
          }
        }
        return { petitioner: null, respondent: null };
      };

      const caseNo = getTextAfterLabel("Case No");
      const dateOfFiling = getTextAfterLabel("Date of Filing");
      const cnrNo = getTextAfterLabel("CNR No");
      const dateOfRegistration = getTextAfterLabel("Date of Registration");
      const status = getTextAfterLabel("Status");
      const advocate = getTextAfterLabel("Filing Advocate");
      const subject1 = getTextAfterLabel("Subject 1");
      const subject2 = getTextAfterLabel("Subject2");

      const { petitioner, respondent } = getPartyNames();

      return {
        caseNo,
        dateOfFiling,
        cnrNo,
        dateOfRegistration,
        status,
        petitioner,
        respondent,
        advocate,
        subject1,
        subject2,
      };
    });

    console.log("Extracted Case Details:", data);
    res.status(200).json(data);
    await pool.query(
      `INSERT INTO result_logs (case_no, filing_date, cnr, reg_date, status, advocate)
     VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data.caseNo,
        data.dateOfFiling,
        data.cnrNo,
        data.dateOfRegistration,
        data.status,
        data.advocate,
      ]
    );
  } catch (err) {
    console.error("Error during case submission:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching case details." });
  }
};
