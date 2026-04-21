#!/usr/bin/env node
/**
 * Gemini Vision MCP Server
 * Gives AI agents "eyes" — screenshot any URL and analyze with Gemini 2.5 Pro vision.
 *
 * Tools:
 *   screenshot_url    — Capture a webpage screenshot (full page or viewport)
 *   analyze_image     — Analyze a local image file with Gemini vision
 *   screenshot_and_analyze — Screenshot + analyze in one call
 *   compare_images    — Compare two screenshots side by side
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { chromium, type Browser, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY environment variable required");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-pro-preview";

// Reusable browser instance
let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

async function takeScreenshot(
  url: string,
  opts: {
    width?: number;
    height?: number;
    fullPage?: boolean;
    waitMs?: number;
    skipBootSequence?: boolean;
    outputPath?: string;
  } = {},
): Promise<{ path: string; base64: string }> {
  const {
    width = 1440,
    height = 900,
    fullPage = false,
    waitMs = 3000,
    skipBootSequence = true,
    outputPath,
  } = opts;

  const b = await getBrowser();
  const page = await b.newPage({ viewport: { width, height } });

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    if (skipBootSequence) {
      // Try to skip boot sequence by pressing Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(1000);
    }

    // Remove dev toolbars
    await page.evaluate(() => {
      document.querySelector("astro-dev-toolbar")?.remove();
    });

    await page.waitForTimeout(waitMs);

    const screenshotPath =
      outputPath ||
      path.join(
        process.env.SCREENSHOT_DIR || "screenshots",
        `gemini-vision-${Date.now()}.png`,
      );

    // Ensure directory exists
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });

    const buffer = await page.screenshot({ path: screenshotPath, fullPage });

    return {
      path: screenshotPath,
      base64: buffer.toString("base64"),
    };
  } finally {
    await page.close();
  }
}

async function analyzeWithGemini(
  imageBase64: string,
  prompt: string,
  mimeType: string = "image/png",
): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      },
    ],
  });

  return response.text || "No response from Gemini";
}

async function analyzeMultipleImages(
  images: Array<{ base64: string; mimeType?: string }>,
  prompt: string,
): Promise<string> {
  const parts: Array<any> = [];

  for (const img of images) {
    parts.push({
      inlineData: {
        mimeType: img.mimeType || "image/png",
        data: img.base64,
      },
    });
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
  });

  return response.text || "No response from Gemini";
}

// --- MCP Server Setup ---

const server = new McpServer({
  name: "gemini-vision",
  version: "1.0.0",
});

// Tool 1: Screenshot a URL
server.tool(
  "screenshot_url",
  "Capture a screenshot of any webpage. Returns the file path of the saved screenshot.",
  {
    url: z
      .string()
      .describe(
        "URL to screenshot (e.g., http://localhost:4321 or https://example.com)",
      ),
    width: z
      .number()
      .optional()
      .default(1440)
      .describe("Viewport width in pixels"),
    height: z
      .number()
      .optional()
      .default(900)
      .describe("Viewport height in pixels"),
    full_page: z
      .boolean()
      .optional()
      .default(false)
      .describe("Capture full scrollable page"),
    wait_ms: z
      .number()
      .optional()
      .default(3000)
      .describe("Wait time after load in ms"),
    skip_boot: z
      .boolean()
      .optional()
      .default(true)
      .describe("Press Escape to skip boot sequence"),
    output_path: z.string().optional().describe("Custom output file path"),
  },
  async ({
    url,
    width,
    height,
    full_page,
    wait_ms,
    skip_boot,
    output_path,
  }) => {
    try {
      const result = await takeScreenshot(url, {
        width,
        height,
        fullPage: full_page,
        waitMs: wait_ms,
        skipBootSequence: skip_boot,
        outputPath: output_path,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: `Screenshot saved to: ${result.path}\nSize: ${Math.round(Buffer.from(result.base64, "base64").length / 1024)}KB\nViewport: ${width}x${height}${full_page ? " (full page)" : ""}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
      };
    }
  },
);

// Tool 2: Analyze a local image with Gemini
server.tool(
  "analyze_image",
  "Analyze a local image file using Gemini vision. Send any image and get detailed analysis.",
  {
    image_path: z.string().describe("Absolute path to the image file"),
    prompt: z
      .string()
      .optional()
      .default(
        "You are an elite Awwwards judge and UI/UX expert. Analyze this website screenshot with BRUTAL honesty. Score 1-10. List every single issue you see — layout problems, visual inconsistencies, missing effects, poor contrast, empty areas, broken elements. Be specific about coordinates/locations. Don't sugarcoat anything.",
      )
      .describe("Analysis prompt for Gemini"),
  },
  async ({ image_path, prompt }) => {
    try {
      const ext = path.extname(image_path).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
      };
      const mimeType = mimeMap[ext] || "image/png";

      const imageBuffer = fs.readFileSync(image_path);
      const base64 = imageBuffer.toString("base64");

      const analysis = await analyzeWithGemini(base64, prompt, mimeType);

      return {
        content: [{ type: "text" as const, text: analysis }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
      };
    }
  },
);

// Tool 3: Screenshot + Analyze in one call
server.tool(
  "screenshot_and_analyze",
  "Screenshot a URL and immediately analyze it with Gemini vision. The fastest way to get eyes on a page.",
  {
    url: z.string().describe("URL to screenshot and analyze"),
    prompt: z
      .string()
      .optional()
      .default(
        "You are an elite Awwwards judge and UI/UX expert. Analyze this website screenshot with BRUTAL honesty. Score 1-10. List every single issue you see — layout problems, visual inconsistencies, missing effects, poor contrast, empty areas, broken elements. Be specific about coordinates/locations. Don't sugarcoat anything.",
      )
      .describe("Analysis prompt"),
    width: z.number().optional().default(1440).describe("Viewport width"),
    height: z.number().optional().default(900).describe("Viewport height"),
    full_page: z
      .boolean()
      .optional()
      .default(false)
      .describe("Capture full page"),
    wait_ms: z
      .number()
      .optional()
      .default(3000)
      .describe("Wait time after load"),
    skip_boot: z
      .boolean()
      .optional()
      .default(true)
      .describe("Skip boot sequence"),
    output_path: z.string().optional().describe("Save screenshot to path"),
  },
  async ({
    url,
    prompt,
    width,
    height,
    full_page,
    wait_ms,
    skip_boot,
    output_path,
  }) => {
    try {
      const screenshot = await takeScreenshot(url, {
        width,
        height,
        fullPage: full_page,
        waitMs: wait_ms,
        skipBootSequence: skip_boot,
        outputPath: output_path,
      });

      const analysis = await analyzeWithGemini(screenshot.base64, prompt);

      return {
        content: [
          {
            type: "text" as const,
            text: `Screenshot: ${screenshot.path}\n\n--- GEMINI ANALYSIS ---\n\n${analysis}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
      };
    }
  },
);

// Tool 4: Compare two images
server.tool(
  "compare_images",
  "Compare two screenshots side-by-side with Gemini vision. Great for before/after comparisons.",
  {
    image_path_1: z.string().describe("Path to first image (before)"),
    image_path_2: z.string().describe("Path to second image (after)"),
    prompt: z
      .string()
      .optional()
      .default(
        "Compare these two screenshots. The first is BEFORE, the second is AFTER. What changed? What improved? What got worse? What's still broken? Be brutally specific.",
      )
      .describe("Comparison prompt"),
  },
  async ({ image_path_1, image_path_2, prompt }) => {
    try {
      const img1 = fs.readFileSync(image_path_1).toString("base64");
      const img2 = fs.readFileSync(image_path_2).toString("base64");

      const ext1 = path.extname(image_path_1).toLowerCase();
      const ext2 = path.extname(image_path_2).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
      };

      const analysis = await analyzeMultipleImages(
        [
          { base64: img1, mimeType: mimeMap[ext1] || "image/png" },
          { base64: img2, mimeType: mimeMap[ext2] || "image/png" },
        ],
        prompt,
      );

      return {
        content: [{ type: "text" as const, text: analysis }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
      };
    }
  },
);

// Tool 5: Navigate and screenshot (for SPAs with client-side routing)
server.tool(
  "navigate_and_screenshot",
  "For SPAs: navigate to a page, click elements, scroll, then screenshot. Ideal for canvas-based sites.",
  {
    url: z.string().describe("Initial URL to load"),
    actions: z
      .array(
        z.object({
          type: z.enum(["click", "scroll", "wait", "press_key", "evaluate"]),
          selector: z
            .string()
            .optional()
            .describe("CSS selector for click actions"),
          scroll_to: z
            .number()
            .optional()
            .describe("Scroll position (px) within .kore-world-inner"),
          wait_ms: z.number().optional().describe("Wait duration in ms"),
          key: z.string().optional().describe("Key to press (e.g., 'Escape')"),
          script: z
            .string()
            .optional()
            .describe("JavaScript to evaluate on page"),
        }),
      )
      .describe("Ordered list of actions to perform before screenshot"),
    width: z.number().optional().default(1440),
    height: z.number().optional().default(900),
    output_path: z.string().optional(),
    analyze: z
      .boolean()
      .optional()
      .default(true)
      .describe("Also analyze with Gemini after screenshot"),
    prompt: z
      .string()
      .optional()
      .default(
        "You are an elite Awwwards judge. Analyze this portfolio section with BRUTAL honesty. Score 1-10. List every issue. Be specific.",
      ),
  },
  async ({ url, actions, width, height, output_path, analyze, prompt }) => {
    const b = await getBrowser();
    const page = await b.newPage({
      viewport: { width: width!, height: height! },
    });

    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.evaluate(() =>
        document.querySelector("astro-dev-toolbar")?.remove(),
      );

      for (const action of actions) {
        switch (action.type) {
          case "click":
            if (action.selector) {
              await page
                .locator(action.selector)
                .first()
                .click({ force: true });
            }
            break;
          case "scroll":
            if (action.scroll_to !== undefined) {
              await page
                .locator("#kore-node-tech .kore-world-inner")
                .first()
                .evaluate((el, pos) => (el.scrollTop = pos), action.scroll_to);
            }
            break;
          case "wait":
            await page.waitForTimeout(action.wait_ms || 1000);
            break;
          case "press_key":
            if (action.key) await page.keyboard.press(action.key);
            break;
          case "evaluate":
            if (action.script) await page.evaluate(action.script);
            break;
        }
      }

      const screenshotPath =
        output_path ||
        path.join(
          process.env.SCREENSHOT_DIR || "screenshots",
          `nav-${Date.now()}.png`,
        );
      fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });

      const buffer = await page.screenshot({ path: screenshotPath });
      const base64 = buffer.toString("base64");

      let result = `Screenshot saved: ${screenshotPath}`;

      if (analyze) {
        const analysis = await analyzeWithGemini(base64, prompt!);
        result += `\n\n--- GEMINI ANALYSIS ---\n\n${analysis}`;
      }

      return { content: [{ type: "text" as const, text: result }] };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
      };
    } finally {
      await page.close();
    }
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Gemini Vision MCP Server running (model: ${MODEL})`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
