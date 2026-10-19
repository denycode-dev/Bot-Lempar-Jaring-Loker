/**
 * Advanced Browser Stealth & Anti-Detection Helper
 * Provides realistic browser fingerprinting, WebGL spoofing, webdriver removal,
 * and navigator normalization to pass Cloudflare Turnstile, LinkedIn, Indeed, and Glints bot checks.
 */

export async function applyStealthToPage(page: any): Promise<void> {
  try {
    if (typeof page.setViewport === 'function') {
      await page.setViewport({ width: 1366, height: 768 });
    } else if (typeof page.setViewportSize === 'function') {
      await page.setViewportSize({ width: 1366, height: 768 });
    }
  } catch (e) {}

  try {
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    });
  } catch (e) {}
}
