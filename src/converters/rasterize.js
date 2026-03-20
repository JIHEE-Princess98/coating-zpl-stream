const puppeteer = require("puppeteer");

let browser;
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

async function htmlToPngBuffer(
  html,
  { width = 610, deviceScaleFactor = 1 } = {}
) {
  const br = await getBrowser();
  const page = await br.newPage();
  await page.setViewport({ width, height: 600, deviceScaleFactor });
  await page.setContent(html, { waitUntil: "networkidle0" });
  const buf = await page.screenshot({ type: "png", fullPage: true });
  await page.close();
  return buf;
}

module.exports = { htmlToPngBuffer };
