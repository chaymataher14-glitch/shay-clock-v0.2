const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    // Mock an upload
    const file = new File([''], 'test.mp3', { type: 'audio/mp3' });
    Object.defineProperty(file, 'url', { value: 'blob:test' });
    mediaFiles = [{ name: 'test.mp3', url: 'blob:test', type: 'audio/mp3' }];
    playLocalMedia(0);
  });
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
