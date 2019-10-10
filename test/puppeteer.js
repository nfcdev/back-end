
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Instructs the blank page to navigate a URL
  //await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('https://vilse.studorg.liu.se/index.php');
  
  // Fetches page's title
 /*  const title = await page.title();
  console.info(`The title is: ${title}`);
  await page.waitForSelector('sidebar-component');

  await page.mouse.move(40, 150); */
  await page.mouse.click(40,150, {delay: 2000})

  await browser.close();
})();