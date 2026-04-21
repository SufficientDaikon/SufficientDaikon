#!/usr/bin/env -S npx tsx

/**
 * visual-qa.ts — Screenshot the portfolio at multiple viewports and worlds.
 *
 * Captures viewport screenshots for visual QA — feed them to Claude (multimodal Read)
 * or Whisk caption_image for AI-powered quality analysis.
 *
 * Usage:
 *   npx tsx tools/visual-qa.ts                          # All viewports, all worlds
 *   npx tsx tools/visual-qa.ts --viewports 375          # Mobile only
 *   npx tsx tools/visual-qa.ts --viewports 1440,1920    # Specific widths
 *   npx tsx tools/visual-qa.ts --url http://localhost:4321
 *   npx tsx tools/visual-qa.ts --output screenshots/v2
 */

import { chromium, type Page } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:4321" },
    output: { type: "string", default: "screenshots" },
    viewports: { type: "string", default: "375,768,1440,1920" },
    skipboot: { type: "boolean", default: true },
    timeout: { type: "string", default: "30" },
  },
  strict: false,
});

const BASE_URL = values.url!;
const OUTPUT_DIR = path.resolve(values.output!);
const VIEWPORTS = values
  .viewports!.split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter(Boolean);
const SKIP_BOOT = values.skipboot!;
const TIMEOUT = parseInt(values.timeout || "30", 10) * 1000;

interface World {
  id: string;
  name: string;
  navSelector: string | null;
}

const WORLDS: World[] = [
  { id: "hub", name: "hub", navSelector: null },
  { id: "tech", name: "tech", navSelector: '[data-target="tech"]' },
  { id: "design", name: "design", navSelector: '[data-target="design"]' },
  { id: "business", name: "business", navSelector: '[data-target="business"]' },
];

function log(msg: string) {
  console.log(`[qa] ${msg}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function skipBootSequence(page: Page): Promise<void> {
  try {
    const bootScreen = page.locator("#boot-screen");
    if (await bootScreen.isVisible({ timeout: 2000 }).catch(() => false)) {
      log("Boot sequence detected — skipping...");
      await page.keyboard.press("Escape");
      await page
        .waitForFunction(
          () => {
            const el = document.getElementById("boot-screen");
            return (
              !el ||
              el.classList.contains("dismissed") ||
              getComputedStyle(el).display === "none"
            );
          },
          { timeout: TIMEOUT },
        )
        .catch(() => {});
      await sleep(500);
      log("Boot sequence skipped");
    }
  } catch {
    // Boot might not exist
  }
}

async function waitForReady(page: Page): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout: TIMEOUT });
  } catch {
    // Best effort
  }
  await sleep(1500);
}

async function navigateToWorld(page: Page, world: World): Promise<void> {
  if (!world.navSelector) return;

  try {
    const navBtn = page.locator(world.navSelector).first();
    if (await navBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await navBtn.click();
      log(`  → ${world.name}`);
      await sleep(1500); // panTo animation
    } else {
      log(`  Nav button not found: ${world.navSelector}`);
    }
  } catch (e) {
    log(
      `  Failed to navigate to ${world.name}: ${e instanceof Error ? e.message : e}`,
    );
  }
}

async function run(): Promise<string[]> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  log(`Visual QA — ${BASE_URL}`);
  log(`Viewports: ${VIEWPORTS.join(", ")}`);
  log(`Output: ${OUTPUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const savedFiles: string[] = [];

  for (const width of VIEWPORTS) {
    const isMobile = width < 768;
    const height = isMobile ? 812 : 900;
    const viewport = { width, height };

    log(`\n--- ${width}x${height} ${isMobile ? "(mobile)" : "(desktop)"} ---`);

    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: isMobile ? 2 : 1,
      isMobile,
      hasTouch: isMobile,
    });

    const page = await context.newPage();

    try {
      await page.goto(BASE_URL, {
        waitUntil: "domcontentloaded",
        timeout: TIMEOUT,
      });
      await waitForReady(page);

      if (SKIP_BOOT) {
        await skipBootSequence(page);
      }

      if (isMobile) {
        // Mobile: canvas disabled, capture stacked layout
        const fileName = `mobile-${width}x${height}.png`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        await page.screenshot({ path: filePath, fullPage: true });
        const stat = fs.statSync(filePath);
        log(`  Saved: ${fileName} (${Math.round(stat.size / 1024)}KB)`);
        savedFiles.push(filePath);
      } else {
        // Desktop: navigate to each world
        for (const world of WORLDS) {
          await navigateToWorld(page, world);

          const fileName = `${world.name}-${width}x${height}.png`;
          const filePath = path.join(OUTPUT_DIR, fileName);

          try {
            await page.screenshot({ path: filePath, fullPage: false });
            const stat = fs.statSync(filePath);
            log(`  Saved: ${fileName} (${Math.round(stat.size / 1024)}KB)`);
            savedFiles.push(filePath);
          } catch (e) {
            log(`  Screenshot failed: ${e instanceof Error ? e.message : e}`);
          }
        }

        // Full-page capture of tech world scrollable content
        const techBtn = page.locator('[data-target="tech"]').first();
        if (await techBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await techBtn.click();
          await sleep(1500);

          const scrollable = page.locator(".kore-world-inner").first();
          const filePath = path.join(
            OUTPUT_DIR,
            `tech-fullpage-${width}x${height}.png`,
          );

          try {
            if (
              await scrollable.isVisible({ timeout: 2000 }).catch(() => false)
            ) {
              await scrollable.screenshot({ path: filePath });
            } else {
              await page.screenshot({ path: filePath, fullPage: true });
            }
            const stat = fs.statSync(filePath);
            log(
              `  Saved: tech-fullpage-${width}x${height}.png (${Math.round(stat.size / 1024)}KB)`,
            );
            savedFiles.push(filePath);
          } catch (e) {
            log(
              `  Full-page capture failed: ${e instanceof Error ? e.message : e}`,
            );
          }
        }
      }
    } catch (e) {
      log(`  Error at ${width}px: ${e instanceof Error ? e.message : e}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  log(`\n=== Visual QA Complete ===`);
  log(`Screenshots: ${savedFiles.length}`);
  log(`Directory: ${OUTPUT_DIR}`);
  log(`\nAnalyze with Claude: Read each screenshot file (multimodal)`);

  return savedFiles;
}

run().catch((e) => {
  console.error("Visual QA failed:", e);
  process.exit(1);
});
