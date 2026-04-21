/**
 * AI Studio Manager — Playwright automation for Google AI Studio
 * Uses Firefox cookies to access aistudio.google.com without login
 *
 * Commands:
 *   check-quotas  — View current rate limits and quotas
 *   list-keys     — List existing API keys
 *   create-key    — Create a new API key
 *   screenshot    — Take a screenshot of current state
 */

import playwright from "playwright";
const { chromium } = playwright;
type Browser = playwright.Browser;
type Page = playwright.Page;
type BrowserContext = playwright.BrowserContext;
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const TOOLS_DIR = path
  .dirname(new URL(import.meta.url).pathname)
  .replace(/^\/([A-Z]:)/, "$1");
const PROJECT_DIR = path.resolve(TOOLS_DIR, "..");
const SCREENSHOTS_DIR = path.join(PROJECT_DIR, "screenshots");

interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

async function extractCookies(): Promise<Cookie[]> {
  console.log("🍪 Extracting Google cookies from Firefox...");
  const script = path.join(TOOLS_DIR, "extract-firefox-cookies.py");
  const raw = execSync(`python "${script}"`, { encoding: "utf-8" });
  const cookies: Cookie[] = JSON.parse(raw);

  // Filter to Google domains
  const googleCookies = cookies.filter(
    (c) =>
      c.domain.includes("google.com") ||
      c.domain.includes("googleapis.com") ||
      c.domain.includes("gstatic.com"),
  );

  console.log(
    `  Found ${googleCookies.length} Google cookies (${cookies.length} total)`,
  );
  return googleCookies;
}

function mapCookies(cookies: Cookie[]) {
  return cookies
    .filter(c => c.name && c.value && c.domain)
    .map((c) => {
      const mapped: any = {
        name: c.name,
        value: c.value,
        domain: c.domain.startsWith(".") ? c.domain : `.${c.domain}`,
        path: c.path || "/",
        httpOnly: c.httpOnly ?? false,
        secure: c.secure ?? true,
        sameSite: "Lax" as const,
      };
      if (c.expires && c.expires > 0 && c.expires < 2147483647) {
        mapped.expires = c.expires;
      }
      return mapped;
    });
}

async function createBrowser(): Promise<{
  browser: Browser;
  context: BrowserContext;
  page: Page;
}> {
  const cookies = await extractCookies();

  console.log("🌐 Launching browser...");
  const browser = await chromium.launch({
    headless: false, // Need visible browser for Google's bot detection
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:137.0) Gecko/20100101 Firefox/137.0",
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });

  // Inject cookies one at a time, skip invalid ones
  const mapped = mapCookies(cookies);
  let injected = 0;
  for (const cookie of mapped) {
    try {
      await context.addCookies([cookie]);
      injected++;
    } catch {
      // Skip invalid cookies silently
    }
  }
  console.log(`  Injected ${injected}/${mapped.length} cookies`);

  const page = await context.newPage();

  // Anti-detection: override navigator.webdriver
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  return { browser, context, page };
}

async function saveScreenshot(page: Page, name: string) {
  if (!fs.existsSync(SCREENSHOTS_DIR))
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filepath}`);
}

async function checkQuotas() {
  const { browser, page } = await createBrowser();

  try {
    console.log("\n📊 Navigating to AI Studio Rate Limits...");
    await page.goto("https://aistudio.google.com/rate-limit", {
      waitUntil: "load",
      timeout: 30000,
    });
    await page.waitForTimeout(5000);

    // Check if we're logged in or redirected to login
    const url = page.url();
    console.log(`  Current URL: ${url}`);

    if (url.includes("accounts.google.com") || url.includes("signin")) {
      console.log("❌ Redirected to login — cookies may be expired");
      await saveScreenshot(page, "aistudio-login-redirect");
      return;
    }

    // Close any notification popups
    const closeBtn = await page.$('button:has-text("×"), button[aria-label="Close"], .dismiss-button');
    if (closeBtn) await closeBtn.click().catch(() => {});
    
    // Click "See more" to expand all models
    const seeMore = await page.$('button:has-text("See more"), [class*="see-more"]');
    if (seeMore) {
      console.log('  Clicking "See more" to expand all models...');
      await seeMore.click();
      await page.waitForTimeout(2000);
    }

    await saveScreenshot(page, "aistudio-rate-limits-expanded");

    // Extract the full table text
    const pageText = await page.textContent("body");
    if (pageText) {
      const lines = pageText.split("\n").filter((l) => l.trim());
      const relevantLines = lines.filter(
        (l) =>
          l.includes("RPM") || l.includes("RPD") || l.includes("TPM") ||
          l.includes("IPM") || l.includes("Image") || l.includes("image") ||
          l.includes("Banana") || l.includes("banana") ||
          l.includes("Imagen") || l.includes("Flash") || l.includes("Pro") ||
          l.includes("Free") || l.includes("tier") || l.includes("0 /")
      );
      if (relevantLines.length > 0) {
        console.log("\n📋 Rate limit info:");
        relevantLines.slice(0, 40).forEach((l) =>
          console.log(`  ${l.trim().substring(0, 150)}`)
        );
      }
    }

    // Scroll down to see more
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    await saveScreenshot(page, "aistudio-rate-limits-scrolled");

    // Also check projects page
    console.log("\n📁 Navigating to Projects page...");
    await page.goto("https://aistudio.google.com/projects", {
      waitUntil: "load",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);
    await saveScreenshot(page, "aistudio-projects");

    const projectText = await page.textContent("body");
    if (projectText) {
      const lines = projectText.split("\n").filter((l) => l.trim());
      const relevantLines = lines.filter(
        (l) =>
          l.includes("project") ||
          l.includes("Project") ||
          l.includes("tier") ||
          l.includes("Tier") ||
          l.includes("billing") ||
          l.includes("Billing") ||
          l.includes("key") ||
          l.includes("Key"),
      );
      if (relevantLines.length > 0) {
        console.log("\n📋 Project information:");
        relevantLines
          .slice(0, 20)
          .forEach((l) => console.log(`  ${l.trim().substring(0, 120)}`));
      }
    }
  } catch (err) {
    console.error("Error:", err);
    await saveScreenshot(page, "aistudio-error");
  } finally {
    await browser.close();
  }
}

async function listKeys() {
  const { browser, page } = await createBrowser();

  try {
    console.log("\n🔑 Navigating to API Keys page...");
    await page.goto("https://aistudio.google.com/apikey", {
      waitUntil: "load",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const url = page.url();
    console.log(`  Current URL: ${url}`);

    if (url.includes("accounts.google.com") || url.includes("signin")) {
      console.log("❌ Redirected to login — cookies may be expired");
      await saveScreenshot(page, "aistudio-login-redirect");
      return;
    }

    await saveScreenshot(page, "aistudio-apikeys");

    // Extract key info
    const pageText = await page.textContent("body");
    if (pageText) {
      const lines = pageText.split("\n").filter((l) => l.trim());
      const relevantLines = lines.filter(
        (l) =>
          l.includes("AIza") ||
          l.includes("key") ||
          l.includes("Key") ||
          l.includes("project") ||
          l.includes("Project") ||
          l.includes("Create") ||
          l.includes("create"),
      );
      if (relevantLines.length > 0) {
        console.log("\n📋 API Key information:");
        relevantLines
          .slice(0, 20)
          .forEach((l) => console.log(`  ${l.trim().substring(0, 120)}`));
      }
    }

    // Look for key elements
    const keyElements = await page.$$(
      '[class*="key"], [data-key], [class*="api"]',
    );
    console.log(`  Found ${keyElements.length} key-related elements`);
  } catch (err) {
    console.error("Error:", err);
    await saveScreenshot(page, "aistudio-error");
  } finally {
    await browser.close();
  }
}

async function createKey() {
  const { browser, page } = await createBrowser();

  try {
    console.log("\n🔑 Navigating to API Keys page to create new key...");
    await page.goto("https://aistudio.google.com/apikey", {
      waitUntil: "load",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);

    const url = page.url();
    if (url.includes("accounts.google.com") || url.includes("signin")) {
      console.log("❌ Redirected to login — cookies may be expired");
      await saveScreenshot(page, "aistudio-login-redirect");
      return;
    }

    await saveScreenshot(page, "aistudio-before-create");

    // Look for "Create API key" button
    const createBtn = await page.$(
      'button:has-text("Create API key"), [aria-label*="Create"], button:has-text("Create")',
    );
    if (createBtn) {
      console.log('  Found "Create API key" button, clicking...');
      await createBtn.click();
      await page.waitForTimeout(5000);
      await saveScreenshot(page, "aistudio-after-create-click");

      // Check for project selection dialog
      const dialog = await page.$(
        '[role="dialog"], [class*="dialog"], [class*="modal"]',
      );
      if (dialog) {
        console.log("  Dialog appeared — may need to select a project");
        await saveScreenshot(page, "aistudio-create-dialog");

        // Try to find and click "Create API key in new project"
        const newProjectBtn = await page.$(
          'button:has-text("new project"), button:has-text("Create API key in")',
        );
        if (newProjectBtn) {
          console.log('  Clicking "Create API key in new project"...');
          await newProjectBtn.click();
          await page.waitForTimeout(8000);
          await saveScreenshot(page, "aistudio-new-key-created");
        }
      }

      // Try to read the new key
      const keyText = await page.textContent("body");
      if (keyText) {
        const keyMatch = keyText.match(/AIza[A-Za-z0-9_-]{30,40}/);
        if (keyMatch) {
          console.log(`\n✅ NEW API KEY: ${keyMatch[0]}`);
          console.log("  Update .env.local with this key");
        }
      }
    } else {
      console.log('  Could not find "Create API key" button');
      // List all buttons for debugging
      const buttons = await page.$$eval("button", (btns) =>
        btns.map((b) => b.textContent?.trim()).filter(Boolean),
      );
      console.log("  Available buttons:", buttons.slice(0, 15).join(", "));
    }
  } catch (err) {
    console.error("Error:", err);
    await saveScreenshot(page, "aistudio-error");
  } finally {
    await browser.close();
  }
}

async function takeScreenshot() {
  const { browser, page } = await createBrowser();

  try {
    const targetUrl = process.argv[4] || "https://aistudio.google.com/apikey";
    console.log(`\n📸 Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(3000);
    await saveScreenshot(page, "aistudio-manual");
    console.log("  Done!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
}

// CLI
const command = process.argv[2] || "help";

switch (command) {
  case "check-quotas":
  case "quotas":
    await checkQuotas();
    break;
  case "list-keys":
  case "keys":
    await listKeys();
    break;
  case "create-key":
  case "create":
    await createKey();
    break;
  case "screenshot":
  case "ss":
    await takeScreenshot();
    break;
  default:
    console.log(`
AI Studio Manager — Google AI Studio automation via Playwright

Commands:
  check-quotas  View current rate limits and quotas
  list-keys     List existing API keys  
  create-key    Create a new API key
  screenshot    Take screenshot of any URL (default: apikey page)
                Usage: screenshot [url]

Examples:
  npx tsx tools/aistudio-manager.ts check-quotas
  npx tsx tools/aistudio-manager.ts list-keys
  npx tsx tools/aistudio-manager.ts create-key
  npx tsx tools/aistudio-manager.ts screenshot https://aistudio.google.com/rate-limit
`);
}
