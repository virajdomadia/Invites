const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 414, height: 896 });
  
  // Navigate to the app
  await page.goto('http://localhost:8083', { waitUntil: 'networkidle' });
  
  // Take initial screenshot
  await page.screenshot({ path: 'before_click.png' });
  console.log('Initial screenshot taken: before_click.png');
  
  // Get initial scroll position
  const initialScroll = await page.evaluate(() => window.scrollY);
  console.log('Initial scroll position:', initialScroll);
  
  // Wait for the invites button (it's a TouchableOpacity with the invites image)
  // The invites button is the first image in the hero section
  const invitesButton = page.locator('button').first();
  
  // Click the invites button
  console.log('Clicking invites button...');
  await invitesButton.click();
  
  // Wait for scroll animation to complete
  await page.waitForTimeout(1500);
  
  // Get new scroll position
  const newScroll = await page.evaluate(() => window.scrollY);
  console.log('New scroll position:', newScroll);
  
  // Take screenshot after click
  await page.screenshot({ path: 'after_click.png' });
  console.log('After-click screenshot taken: after_click.png');
  
  // Check if HostPartySection is visible
  const hostPartySectionVisible = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.includes('Host a Party') || text.includes('party');
  });
  console.log('HostPartySection visible after click:', hostPartySectionVisible);
  
  // Scroll difference
  console.log('Scroll difference:', newScroll - initialScroll);
  
  if (newScroll > initialScroll) {
    console.log('? Page scrolled successfully');
  } else {
    console.log('? Page did not scroll');
  }
  
  await browser.close();
})();
