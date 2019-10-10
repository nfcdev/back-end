
/* const puppeteer = require('puppeteer');

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
  //await page.mouse.click(40,150, {delay: 5000})
/* 
  await page.mouse.move(0, 0);
  await page.mouse.down();
  
  // Drops the mouse to another point
  await page.mouse.move(100, 100);
  await page.mouse.up();

  await browser.close(); */
  const puppeteer = require('puppeteer');
  (async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    const navigationPromise = page.waitForNavigation()
    
    await page.goto('https://vilse.studorg.liu.se/index.php')
    
    await page.setViewport({ width: 871, height: 836 })
  
    await page.waitForSelector('body > #container > #header #loggan')
    await page.click('body > #container > #header #loggan')
    
    await navigationPromise
    
    await page.waitForSelector('table > tbody > tr > td:nth-child(5) > a')
    await page.click('table > tbody > tr > td:nth-child(5) > a')
    
    await navigationPromise

    await page.setViewport({ width: 1745, height: 852 })
    await page.screenshot({path: 'vilse.png'});
    await browser.close()

  })();