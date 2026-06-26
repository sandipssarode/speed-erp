import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 860 });
await page.goto('http://localhost:5173/ui-showcase');
await page.waitForTimeout(2500);

for (const [label, file] of [
  ['Variant B', 'showcase-B.png'],
  ['Variant C', 'showcase-C.png'],
  ['Variant D', 'showcase-D.png'],
]) {
  await page.locator('button').filter({ hasText: label }).first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: file });
  console.log('captured', file);
}

await browser.close();
