#!/usr/bin/env -S npx tsx

/**
 * whisk-browser.ts — Playwright automation for Google Whisk
 *
 * Extracts Google auth cookies from your Firefox profile automatically,
 * injects them into a Playwright Chromium instance, and automates Whisk's
 * web UI for image generation, animation, and download.
 *
 * No manual login needed — your Firefox Google session is reused.
 *
 * Usage:
 *   npx tsx tools/whisk-browser.ts generate "prompt" [--name file] [--aspect square]
 *   npx tsx tools/whisk-browser.ts animate  "prompt" --script "camera motion" [--name file]
 *   npx tsx tools/whisk-browser.ts screenshot                        # Debug: screenshot Whisk state
 *
 * Flags:
 *   --aspect   square | landscape | portrait   (default: square)
 *   --name     output filename without extension
 *   --script   animation motion script (for animate command)
 *   --headed   show browser window
 *   --timeout  generation timeout in seconds (default: 120)
 *
 * Pipeline:
 *   Firefox cookies → Playwright Chromium → Whisk UI → public/generated/
 *   Then: Claude reads image (multimodal) → captions → feeds to Stitch MCP
 */

import { chromium, type BrowserContext, type Page } from "playwright";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

// ─── Config ──────────────────────────────────────────────────

const OUTPUT_DIR = path.resolve("public/generated");
const WHISK_URL = "https://labs.google/fx/tools/whisk";
const COOKIE_SCRIPT = path.resolve("tools/extract-firefox-cookies.py");

// ─── CLI ─────────────────────────────────────────────────────

const { values, positionals } = parseArgs({
  options: {
    aspect: { type: "string", default: "square" },
    name: { type: "string", default: "" },
    script: { type: "string", default: "" },
    headed: { type: "boolean", default: false },
    timeout: { type: "string", default: "120" },
  },
  allowPositionals: true,
  strict: false,
});

const command = positionals[0] || "help";
const prompt = positionals.slice(1).join(" ");
const aspect = (values.aspect || "square").toLowerCase();
const baseName = values.name || "";
const motionScript = values.script || "";
const headed = values.headed || false;
const genTimeout = parseInt(values.timeout || "120", 10) * 1000;

if (
  command === "help" ||
  (command === "generate" && !prompt) ||
  (command === "animate" && !prompt)
) {
  console.log(`
Whisk Browser Automation
========================
Commands:
  generate "prompt"   Generate image(s) from a text prompt
  animate  "prompt"   Generate image then animate it (video)
  screenshot          Debug: screenshot current Whisk state

Options:
  --aspect  square|landscape|portrait  (default: square)
  --name    output filename (no extension)
  --script  animation motion script (animate only)
  --headed  show browser window
  --timeout generation timeout in seconds (default: 120)

Examples:
  npx tsx tools/whisk-browser.ts generate "dark void with cyan grid" --name hero-bg --aspect landscape
  npx tsx tools/whisk-browser.ts animate "floating particles" --script "Slow camera push" --name hero-video
`);
  process.exit(command === "help" ? 0 : 1);
}

// ─── Logging ─────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[whisk] ${msg}`);
}

function logError(msg: string) {
  console.error(`[whisk:error] ${msg}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Cookie Extraction from Firefox ──────────────────────────

interface PlaywrightCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

function extractFirefoxCookies(): PlaywrightCookie[] {
  log("Extracting Google cookies from Firefox profile...");

  if (!fs.existsSync(COOKIE_SCRIPT)) {
    throw new Error(
      `Cookie script not found: ${COOKIE_SCRIPT}\nRun from project root.`,
    );
  }

  // Try python3 first (Windows often has python3 via WindowsApps), fall back to python
  let pythonCmd = "python3";
  try {
    execSync("python3 --version", { stdio: "ignore" });
  } catch {
    pythonCmd = "python";
  }

  const result = execSync(`${pythonCmd} "${COOKIE_SCRIPT}"`, {
    encoding: "utf-8",
    timeout: 15000,
  });

  const parsed = JSON.parse(result.trim());
  if (parsed.error) throw new Error(parsed.error);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error(
      "No Google cookies found in Firefox. Is Firefox logged into Google?",
    );
  }

  // Sanitize expires values for Playwright (must be -1 or positive integer)
  const sanitized = parsed.filter((c: PlaywrightCookie) => {
    if (!c.name || !c.value || !c.domain) return false;
    if (typeof c.expires !== "number" || isNaN(c.expires)) {
      c.expires = -1;
    } else if (c.expires !== -1 && c.expires <= 0) {
      c.expires = -1;
    } else {
      c.expires = Math.floor(c.expires);
    }
    // Ensure sameSite is valid
    if (!["Strict", "Lax", "None"].includes(c.sameSite)) {
      c.sameSite = "Lax";
    }
    return true;
  });

  log(`Got ${sanitized.length} Google cookies from Firefox`);
  return sanitized;
}

// ─── Browser Launch ──────────────────────────────────────────

const USER_DATA_DIR = path.resolve(".playwright-whisk-profile");

async function launchWithCookies(
  headless: boolean,
): Promise<{ ctx: BrowserContext; page: Page }> {
  const cookies = extractFirefoxCookies();

  // Use persistent context to preserve OAuth consent across runs
  const ctx = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless,
    viewport: { width: 1440, height: 900 },
    bypassCSP: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  await ctx.addCookies(cookies);
  log(`Cookies injected (${cookies.length})`);

  const page = ctx.pages()[0] || (await ctx.newPage());
  return { ctx, page };
}

// ─── Whisk UI Automation ─────────────────────────────────────

const PROMPT_SELECTORS = [
  'textarea[aria-label*="escribe" i]',
  'textarea[placeholder*="escribe" i]',
  'textarea[aria-label*="prompt" i]',
  'textarea[placeholder*="prompt" i]',
  'textarea[aria-label*="magine" i]',
  "main textarea",
  '[role="main"] textarea',
].join(", ");

async function clickThroughSplash(page: Page): Promise<void> {
  // Only try on Whisk pages, not auth pages
  const url = page.url();
  if (url.includes("accounts.google.com") || url.includes("oauth")) return;

  for (const text of [
    "ENTER TOOL",
    "Enter tool",
    "Enter Tool",
    "GET STARTED",
    "Get started",
  ]) {
    const btn = page
      .locator(`a:has-text("${text}"), button:has-text("${text}")`)
      .first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      log(`Clicking "${text}" to enter Whisk...`);
      await btn.click().catch(() => {});
      await sleep(3000);
      return;
    }
  }
}

async function dismissBanners(page: Page): Promise<void> {
  for (const text of [
    "Understood",
    "CLOSE",
    "Close",
    "Got it",
    "Accept",
    "Dismiss",
    "OK",
    "I understand",
    "No thanks",
    "Maybe later",
  ]) {
    const btn = page.locator(`button:has-text("${text}")`).first();
    if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await sleep(300);
    }
  }
  // Close icon buttons
  const closeIcons = page.locator(
    'button[aria-label*="close" i], button[aria-label*="dismiss" i]',
  );
  const count = await closeIcons.count();
  for (let i = 0; i < count; i++) {
    const icon = closeIcons.nth(i);
    if (await icon.isVisible({ timeout: 300 }).catch(() => false)) {
      await icon.click().catch(() => {});
      await sleep(300);
    }
  }
}

async function waitForWhisk(page: Page, timeout: number): Promise<boolean> {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const url = page.url();

    // Handle Google account chooser — click the first account
    if (url.includes("accounts.google.com") || url.includes("signin")) {
      const accountBtn = page.locator('[data-identifier], [data-email], li[role="link"]').first();
      if (await accountBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        log("Account chooser detected — selecting account...");
        await accountBtn.click().catch(() => {});
        await sleep(5000);
        continue;
      }
      // Also try clicking "Continue" or "Allow" for OAuth consent
      for (const label of ["Continue", "Allow", "Next", "Yes"]) {
        const btn = page.locator(`button:has-text("${label}"), input[value="${label}"]`).first();
        if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
          log(`Clicking "${label}" on auth page...`);
          await btn.click().catch(() => {});
          await sleep(3000);
          break;
        }
      }
      await sleep(3000);
      continue;
    }

    // Still on non-Whisk page, wait
    if (!url.includes("labs.google") && !url.includes("whisk")) {
      await sleep(3000);
      continue;
    }

    await clickThroughSplash(page);
    await dismissBanners(page);

    // Check for prompt textarea
    if (
      await page
        .locator(PROMPT_SELECTORS)
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false)
    ) {
      return true;
    }

    // Whisk has Subject/Scene/Style/Text tabs — click Text to get the prompt
    const textTab = page
      .locator('button:has-text("Text"), [role="tab"]:has-text("Text")')
      .first();
    if (await textTab.isVisible({ timeout: 1000 }).catch(() => false)) {
      await textTab.click();
      await sleep(1000);
      if (
        await page
          .locator(PROMPT_SELECTORS)
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
      ) {
        return true;
      }
    }

    await sleep(3000);
  }

  return false;
}

async function setAspectRatio(page: Page, ratio: string): Promise<void> {
  const labels: Record<string, string[]> = {
    square: ["Square", "1:1"],
    landscape: ["Landscape", "16:9", "3:2"],
    portrait: ["Portrait", "9:16", "2:3"],
  };

  for (const label of labels[ratio] || []) {
    for (const sel of [
      `button:has-text("${label}")`,
      `[role="radio"]:has-text("${label}")`,
      `[role="option"]:has-text("${label}")`,
      `label:has-text("${label}")`,
    ]) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
        await btn.click();
        log(`Aspect ratio: ${label}`);
        await sleep(500);
        return;
      }
    }
  }
  log(`Aspect ratio "${ratio}" control not found — using default`);
}

// ─── Image Generation ────────────────────────────────────────

async function generateImages(): Promise<string[]> {
  log(`Generating: "${prompt.slice(0, 80)}${prompt.length > 80 ? "..." : ""}"`);
  log(`Aspect: ${aspect}`);

  const { ctx, page } = await launchWithCookies(!headed);
  const capturedUrls: string[] = [];

  // Intercept image responses
  page.on("response", (response) => {
    const url = response.url();
    if (
      response.status() === 200 &&
      (url.includes("lh3.googleusercontent.com") ||
        url.includes("storage.googleapis.com") ||
        url.includes("aisandbox"))
    ) {
      const ct = response.headers()["content-type"] || "";
      if (
        ct.includes("image") &&
        !url.includes("=s32") &&
        !url.includes("=s48") &&
        !url.includes("=s64")
      ) {
        capturedUrls.push(url);
      }
    }
  });

  try {
    await page.goto(WHISK_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const ready = await waitForWhisk(page, 60000);
    if (!ready) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      const debugPath = path.join(OUTPUT_DIR, "whisk-debug.png");
      await page.screenshot({ path: debugPath, fullPage: true });
      logError(`Whisk not ready. Debug screenshot: ${debugPath}`);
      logError(`URL: ${page.url()}`);
      const text = await page
        .locator("body")
        .innerText()
        .catch(() => "");
      logError(`Page (first 500): ${text.slice(0, 500)}`);
      await ctx.close();
      return [];
    }

    log("Whisk ready");
    await setAspectRatio(page, aspect);

    // Count existing images to distinguish new ones
    const preCount = await page
      .locator('img[src*="lh3.googleusercontent"]')
      .count();

    // Fill prompt
    const promptInput = page.locator(PROMPT_SELECTORS).first();
    await promptInput.click();
    await promptInput.fill("");
    await sleep(200);
    await promptInput.fill(prompt);
    await sleep(500);
    log("Prompt filled, submitting...");

    // Submit
    let submitted = false;
    for (const label of ["Generate", "Create", "Submit"]) {
      const btn = page.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        log(`Clicked "${label}"`);
        submitted = true;
        break;
      }
    }
    if (!submitted) {
      const sendBtn = page
        .locator(
          'button[aria-label*="send" i], button[aria-label*="submit" i], button[aria-label*="generate" i], button[type="submit"]',
        )
        .first();
      if (await sendBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await sendBtn.click();
        submitted = true;
      }
    }
    if (!submitted) {
      await promptInput.press("Enter");
      log("Submitted via Enter");
    }

    // Wait for generation
    log(`Waiting (up to ${genTimeout / 1000}s)...`);
    const startUrlCount = capturedUrls.length;
    const deadline = Date.now() + genTimeout;
    await sleep(3000);

    while (Date.now() < deadline) {
      if (capturedUrls.length > startUrlCount) {
        log(`${capturedUrls.length - startUrlCount} new image URL(s) captured`);
        await sleep(5000);
        break;
      }

      const currentCount = await page
        .locator('img[src*="lh3.googleusercontent"]')
        .count();
      if (currentCount > preCount) {
        log(`${currentCount - preCount} new image(s) in DOM`);
        await sleep(3000);
        break;
      }

      await sleep(3000);
    }

    return await collectImages(page, capturedUrls, startUrlCount);
  } finally {
    await ctx.close();
  }
}

// ─── Animation ───────────────────────────────────────────────

async function animateImage(): Promise<string[]> {
  log("Step 1/2: Generating base image (landscape required for animation)...");

  const { ctx, page } = await launchWithCookies(!headed);
  const capturedImageUrls: string[] = [];
  const capturedVideoUrls: string[] = [];

  page.on("response", (response) => {
    const url = response.url();
    if (response.status() !== 200) return;
    const ct = response.headers()["content-type"] || "";
    if (
      ct.includes("image") &&
      (url.includes("lh3.googleusercontent") ||
        url.includes("storage.googleapis"))
    ) {
      if (
        !url.includes("=s32") &&
        !url.includes("=s48") &&
        !url.includes("=s64")
      ) {
        capturedImageUrls.push(url);
      }
    }
    if (ct.includes("video")) {
      capturedVideoUrls.push(url);
    }
  });

  try {
    await page.goto(WHISK_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const ready = await waitForWhisk(page, 30000);
    if (!ready) {
      logError("Whisk not ready for animation");
      await ctx.close();
      return [];
    }

    // Force landscape for Veo animation
    await setAspectRatio(page, "landscape");

    // Generate base image
    const promptInput = page.locator(PROMPT_SELECTORS).first();
    await promptInput.click();
    await promptInput.fill(prompt);
    await sleep(500);

    let submitted = false;
    for (const label of ["Generate", "Create"]) {
      const btn = page.locator(`button:has-text("${label}")`).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click();
        submitted = true;
        break;
      }
    }
    if (!submitted) await promptInput.press("Enter");

    log("Waiting for base image...");
    const startCount = capturedImageUrls.length;
    const genDeadline = Date.now() + genTimeout;

    while (Date.now() < genDeadline) {
      if (capturedImageUrls.length > startCount) {
        await sleep(3000);
        break;
      }
      await sleep(2000);
    }

    if (capturedImageUrls.length <= startCount) {
      logError("No base image generated");
      await ctx.close();
      return [];
    }

    log("Base image ready. Step 2/2: Animating...");

    // Look for animate/video button
    const animateBtn = page
      .locator(
        'button:has-text("Animate"), button:has-text("Video"), button:has-text("Create video"), ' +
          'button[aria-label*="animate" i], button[aria-label*="video" i]',
      )
      .first();

    if (await animateBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await animateBtn.click();
      log("Clicked Animate");
      await sleep(2000);

      // Fill motion script if available
      if (motionScript) {
        const scriptInput = page
          .locator(
            'textarea[aria-label*="motion" i], textarea[aria-label*="script" i], ' +
              'textarea[placeholder*="motion" i], input[aria-label*="motion" i]',
          )
          .first();

        if (await scriptInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await scriptInput.fill(motionScript);
          log(`Motion: "${motionScript}"`);
          await sleep(500);
        }
      }

      // Trigger animation generation
      for (const label of ["Generate", "Create", "Animate"]) {
        const btn = page.locator(`button:has-text("${label}")`).first();
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await btn.click();
          break;
        }
      }

      // Wait for video (up to 180s)
      log("Waiting for video (up to 180s)...");
      const videoDeadline = Date.now() + 180000;
      while (Date.now() < videoDeadline) {
        if (capturedVideoUrls.length > 0) {
          log("Video captured!");
          await sleep(3000);
          break;
        }
        if (
          (await page
            .locator("video source, video[src]")
            .count()
            .catch(() => 0)) > 0
        ) {
          log("Video element in DOM");
          await sleep(2000);
          break;
        }
        await sleep(3000);
      }

      // Download video
      const savedVideos = await downloadVideos(page, capturedVideoUrls);
      if (savedVideos.length > 0) return savedVideos;
    } else {
      log("No animate button found — returning base image");
    }

    return await collectImages(page, capturedImageUrls, startCount);
  } finally {
    await ctx.close();
  }
}

// ─── Download Helpers ────────────────────────────────────────

function detectExt(contentType: string): string {
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg"))
    return ".jpg";
  return ".png";
}

async function collectImages(
  page: Page,
  networkUrls: string[],
  startIdx: number,
): Promise<string[]> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const saved: string[] = [];

  // Strategy 1 (PRIMARY): Element screenshots — bypasses CORS entirely
  // Find all large <img> elements and screenshot them directly
  const allImgs = await page.locator("img").all();
  let imgIdx = 0;
  for (const img of allImgs) {
    try {
      const box = await img.boundingBox();
      if (!box || box.width < 200 || box.height < 200) continue;

      // Skip tiny UI elements (avatars, icons)
      const src = await img.getAttribute("src").catch(() => "");
      if (src && (src.includes("=s32") || src.includes("=s48") || src.includes("=s64") || src.includes("=s96"))) continue;

      const fileName = baseName
        ? imgIdx === 0
          ? `${baseName}.png`
          : `${baseName}-${imgIdx + 1}.png`
        : `whisk-${Date.now()}-${imgIdx}.png`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      await img.screenshot({ path: filePath });

      const stat = fs.statSync(filePath);
      if (stat.size < 1000) {
        fs.unlinkSync(filePath);
        continue;
      }

      saved.push(filePath);
      log(`Captured: ${fileName} (${Math.round(stat.size / 1024)}KB, ${Math.round(box.width)}x${Math.round(box.height)})`);
      imgIdx++;
    } catch {
      // Element may have become detached, skip
    }
  }
  if (saved.length > 0) return saved;

  // Strategy 2: Network-captured URLs (may fail due to CORS)
  const newUrls = networkUrls.slice(startIdx);
  for (let i = 0; i < newUrls.length; i++) {
    try {
      const resp = await page.request.get(newUrls[i]);
      const buffer = await resp.body();
      if (buffer.length < 1000) continue;

      const ext = detectExt(resp.headers()["content-type"] || "");
      const fileName = baseName
        ? newUrls.length > 1
          ? `${baseName}-${i + 1}${ext}`
          : `${baseName}${ext}`
        : `whisk-${Date.now()}-${i}${ext}`;

      const filePath = path.join(OUTPUT_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
      saved.push(filePath);
      log(`Saved from network: ${fileName} (${Math.round(buffer.length / 1024)}KB)`);
    } catch (e) {
      logError(`Network download failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (saved.length > 0) return saved;

  // Strategy 3: Full viewport screenshot as last resort
  log("All strategies failed — capturing full viewport");
  const fileName = baseName ? `${baseName}.png` : `whisk-${Date.now()}.png`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage: false });
  saved.push(filePath);
  log(`Viewport screenshot: ${fileName}`);

  return saved;
}

async function downloadVideos(
  page: Page,
  videoUrls: string[],
): Promise<string[]> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const saved: string[] = [];

  for (const url of videoUrls) {
    try {
      const resp = await page.request.get(url);
      const buffer = await resp.body();
      const fileName = baseName
        ? `${baseName}.mp4`
        : `whisk-video-${Date.now()}.mp4`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
      saved.push(filePath);
      log(`Saved video: ${fileName} (${Math.round(buffer.length / 1024)}KB)`);
    } catch (e) {
      logError(`Video download failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (saved.length > 0) return saved;

  // DOM video elements
  const videos = await page.locator("video[src], video source[src]").all();
  for (const v of videos) {
    try {
      const src = await v.getAttribute("src");
      if (!src || src.startsWith("blob:")) continue;
      const resp = await page.request.get(src);
      const buffer = await resp.body();
      const fileName = baseName
        ? `${baseName}.mp4`
        : `whisk-video-${Date.now()}.mp4`;
      const filePath = path.join(OUTPUT_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
      saved.push(filePath);
      log(`Video from DOM: ${fileName}`);
    } catch {
      // skip
    }
  }

  return saved;
}

// ─── Screenshot Debug ────────────────────────────────────────

async function takeScreenshot(): Promise<void> {
  const { ctx, page } = await launchWithCookies(!headed);

  try {
    await page.goto(WHISK_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(5000);
    await clickThroughSplash(page);
    await sleep(2000);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const filePath = path.join(OUTPUT_DIR, "whisk-state.png");
    await page.screenshot({ path: filePath, fullPage: true });
    log(`Screenshot saved: ${filePath}`);
    log(`URL: ${page.url()}`);

    const text = await page
      .locator("body")
      .innerText()
      .catch(() => "");
    log(`Page (first 500): ${text.slice(0, 500)}`);
  } finally {
    await ctx.close();
  }
}

// ─── Entry ───────────────────────────────────────────────────

async function main() {
  switch (command) {
    case "generate": {
      const images = await generateImages();
      if (images.length > 0) {
        log(`\nDone! ${images.length} image(s):`);
        for (const f of images) log(`  /generated/${path.basename(f)}`);
        console.log(
          JSON.stringify({
            success: true,
            files: images,
            webPaths: images.map((f) => `/generated/${path.basename(f)}`),
          }),
        );
      } else {
        logError("No images generated. Run with --headed to debug.");
        process.exit(1);
      }
      break;
    }
    case "animate": {
      const videos = await animateImage();
      if (videos.length > 0) {
        log(`\nDone! ${videos.length} file(s):`);
        for (const f of videos) log(`  /generated/${path.basename(f)}`);
        console.log(
          JSON.stringify({
            success: true,
            files: videos,
            webPaths: videos.map((f) => `/generated/${path.basename(f)}`),
          }),
        );
      } else {
        logError("Animation failed. Run with --headed to debug.");
        process.exit(1);
      }
      break;
    }
    case "screenshot":
      await takeScreenshot();
      break;
    default:
      logError(
        `Unknown command: "${command}". Use: generate | animate | screenshot`,
      );
      process.exit(1);
  }
}

main().catch((e) => {
  logError(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
