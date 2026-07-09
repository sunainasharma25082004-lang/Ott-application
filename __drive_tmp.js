const { chromium } = require('playwright');

const OUT = 'C:/Users/jhasa/.claude/jobs/41ed4038/tmp/';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'], headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();

  const shot = async (name) => { await page.screenshot({ path: OUT + name + '.png' }); console.log('screenshot ->', name); };

  await page.goto('http://localhost:8081/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.getByPlaceholder('Email').fill('demoviewer@test.com');
  await page.getByPlaceholder('Password').fill('Demo@1234');
  await page.getByText('Sign In', { exact: true }).last().click();
  await page.waitForTimeout(4000);
  await page.getByText('Demo Viewer', { exact: false }).first().click();
  await page.waitForTimeout(3000);

  const videoUrl = 'http://localhost:5000/uploads/movies/1783498174806-0b8c096c04cb.mp4';
  const thumb = 'http://localhost:5000/uploads/movies/thumbnails/1783498174809-f8f3f71f4639.jpg';
  const target = `http://localhost:8081/player/watch?videoUrl=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent('Big Buck Bunny (Demo)')}&thumbnail=${encodeURIComponent(thumb)}&contentId=6a4e05bee1d99e98ad5c8998&contentType=Movie&durationSeconds=600`;
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const pagesBefore = context.pages().length;
  console.log('pages before click:', pagesBefore);

  await page.mouse.click(1146 + 19, 14 + 19);
  await page.waitForTimeout(2000);

  const pagesAfter = context.pages();
  console.log('pages after click:', pagesAfter.length);
  for (const p of pagesAfter) {
    console.log('  page url:', p.url());
  }
  await shot('61_after_click_pages');

  await browser.close();
})().catch((e) => {
  console.error('DRIVER ERROR:', e);
  process.exit(1);
});
