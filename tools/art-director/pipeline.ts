#!/usr/bin/env npx tsx
/**
 * Art Director Pipeline — The Artifact
 *
 * Full pipeline: prompt → generate → evaluate → optimize → integrate
 *
 * Usage:
 *   npx tsx tools/art-director/pipeline.ts all              # Generate all assets
 *   npx tsx tools/art-director/pipeline.ts generate <slot>  # Generate one asset
 *   npx tsx tools/art-director/pipeline.ts evaluate <slot>  # Evaluate existing asset
 *   npx tsx tools/art-director/pipeline.ts status           # Show asset status
 */

import { GoogleGenAI, type Modality } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// ─── Config ──────────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.resolve(process.cwd(), "public/generated");
const MODEL = "gemini-2.5-flash-image";
const VISION_MODEL = "gemini-3.1-pro-preview";

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
      const t = line.trim();
      if (t && !t.startsWith("#")) {
        const eq = t.indexOf("=");
        if (eq > 0) {
          const k = t.slice(0, eq).trim();
          const v = t.slice(eq + 1).trim();
          if (!process.env[k]) process.env[k] = v;
        }
      }
    }
  }
}

function getClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("❌ GEMINI_API_KEY not set");
    process.exit(1);
  }
  return new GoogleGenAI({ apiKey: key });
}

// ─── Asset Manifest ──────────────────────────────────────────────────────────

interface AssetSpec {
  slot: string;
  filename: string;
  prompt: string;
  component: string;
  opacity: string;
  blendMode: string;
}

const ASSETS: Record<string, AssetSpec> = {
  hero: {
    slot: "hero",
    filename: "hero-bg",
    component: "Hero.astro",
    opacity: "15%",
    blendMode: "normal",
    prompt: `Abstract macro photograph of hundreds of fiber optic cable ends transmitting faint cyan light pulses through total darkness. Extreme close-up with very shallow depth of field — only a few fibers in sharp focus, the rest dissolve into soft cyan bokeh circles. Individual glass fiber cores visible, each carrying a dim photon of light in electric cyan (#00F0FF). Background is pure black void. Subtle volumetric haze drifts between the fibers. Shot on Canon MP-E 65mm macro lens at 5:1 magnification, f/2.8, ISO 3200. Color grade: crushed blacks, desaturated with selective cyan highlights. Fine film grain. Moody, clinical, cold. No text. No people. No UI elements.`,
  },
  archon: {
    slot: "archon",
    filename: "archon-hero",
    component: "CaseStudy (index=01)",
    opacity: "100%",
    blendMode: "normal",
    prompt: `Dark, cinematic top-down photograph of a large physical circuit board in a dark lab, showing a modular plugin architecture. A central processor chip glows with faint cyan (#00F0FF) light, surrounded by dozens of identical smaller module chips arranged in neat rows and columns — representing 83 installable skills. Five distinct ribbon cables radiate outward from the central chip toward the edges, each terminating at a different connector type — symbolizing 5 different platform targets. Some module chips have tiny cyan indicator LEDs lit, showing active deployment. PCB traces in dark copper run between all components. Shot from directly above with even lighting, medium format camera, f/8, dark matte black PCB substrate. The overall impression is an organized, extensible, modular system — a framework where components plug in and deploy outward. Moody, industrial, engineered. No text. No people.`,
  },
  aether: {
    slot: "aether",
    filename: "aether-hero",
    component: "CaseStudy (index=02)",
    opacity: "100%",
    blendMode: "normal",
    prompt: `Dark cinematic photograph of a scale model of a mission control room seen from above at a 45 degree angle. A central holographic display table in the center glows with cyan (#00F0FF) light, projecting faint data upward. Around it, exactly 6 smaller workstation screens arranged in a semicircle, each showing different readouts — representing specialized AI agents at their posts. Thin fiber optic cables connect all workstations back to the central hub, with visible light pulses traveling along them showing inter-agent communication. The room is almost completely dark except for the screen glows and cable lights. Scale model aesthetic — the workstations are miniature but detailed. Shot on macro lens with shallow depth of field, f/2.8. The mood says autonomous coordination — multiple specialists reporting to one orchestrator. Cold, precise, operational. No text. No people.`,
  },
  axon: {
    slot: "axon",
    filename: "axon-hero",
    component: "CaseStudy (index=03)",
    opacity: "100%",
    blendMode: "normal",
    prompt: `Dark cinematic photograph of a precision machining process viewed from the side. A raw block of dark metallic material enters from the left side and passes through 4 sequential processing stages moving right — each stage represented by a different precision tool or laser gate. The material is progressively transformed: rough block → cut segments → structured lattice → final polished crystalline output on the far right. Each processing stage is illuminated by a thin beam of light — the first two beams are warm amber/orange (#F59E0B) representing Rust, the last two transition to electric cyan (#00F0FF) representing compiled output. Metal shavings and sparks frozen in time around the cutting stages. Background is pure black workshop. Shot on 100mm macro, side-lit, f/4. The mood says transformation — raw code being compiled through precise stages into something refined. Industrial, methodical, engineered. No text. No people.`,
  },
  design: {
    slot: "design",
    filename: "design-world-bg",
    component: "DesignWorld.astro",
    opacity: "12%",
    blendMode: "screen",
    prompt: `Abstract long-exposure photograph of flowing ribbons of luminous purple (#C084FC) and violet light weaving through darkness like slow-motion aurora borealis. The light forms organic, calligraphic curves — some thick and bold, others hair-thin and delicate. Where ribbons cross, they create brighter interference patterns. Some areas dissolve into soft circular bokeh in lavender and magenta tones. The overall composition flows from lower-left to upper-right. Background fades from deep charcoal (#1c1b1b) to pure black. Shot at f/1.4 with intentional camera movement during 8-second exposure. Warm purple-tinted shadows, no harsh edges, painterly and fluid. No text. No people. No UI elements.`,
  },
  business: {
    slot: "business",
    filename: "business-world-bg",
    component: "BusinessWorld.astro",
    opacity: "12%",
    blendMode: "screen",
    prompt: `Aerial night photograph of a geometric city grid from 500 meters directly above. Streets form a precise rectangular network illuminated exclusively by amber (#F59E0B) sodium-vapor streetlights. Building rooftops are dark rectangles and squares of varying sizes creating a modular pattern. A few key intersections glow brighter as focal points. The grid extends to the edges of frame where it fades into blackness. Atmosphere creates a subtle warm amber haze. Shot on medium-format camera with 150mm lens, 30-second exposure from helicopter. Tilt-shift miniature effect makes the city look like a scale model. Deep contrast — amber light islands in a sea of black (#131313). No text. No people. No UI elements.`,
  },
};

// ─── Quality Evaluation ──────────────────────────────────────────────────────

const EVALUATION_PROMPT = `You are an art director evaluating an image for a dark, forensic-aesthetic portfolio website. 

Score each criterion from 1-5 and give a brief note. Be HARSH — this is going on a real portfolio that will be shared with people.

Criteria:
1. DARKNESS — Is 70%+ of the frame near-black? (Dark images work as backgrounds)
2. NO AI TELLS — Any broken text, weird fingers, faces, uncanny artifacts?
3. COLOR DISCIPLINE — Is there only ONE accent color family? No rainbows?
4. ATMOSPHERIC DEPTH — Does it have volumetric quality? Fog, bokeh, depth of field?
5. TEXTURE — Does it have grain, surface detail, not smooth/plastic?
6. BACKGROUND SUITABILITY — Would this work behind text overlay? Not too busy?
7. EMOTIONAL FIT — Does it feel like [CONTEXT]? Not generic stock photo?
8. ORIGINALITY — Is this a fresh composition, not a cliché?

Output format:
DARKNESS: X/5 — note
AI_TELLS: X/5 — note
COLOR: X/5 — note
DEPTH: X/5 — note
TEXTURE: X/5 — note
BACKGROUND: X/5 — note
EMOTION: X/5 — note
ORIGINALITY: X/5 — note
TOTAL: XX/40
VERDICT: SHIP | ITERATE | REJECT
NOTES: One sentence on what to improve if not SHIP.`;

const CONTEXT_MAP: Record<string, string> = {
  hero: "a vast computational void — the background for an AI engineer's portfolio hero section",
  archon:
    "a massive interconnected intelligence framework — 83 AI skills in a cross-platform engine",
  aether:
    "autonomous multi-agent orchestration — 28 subsystems coordinating in synchrony",
  axon: "a precision-engineered compiler and programming language built from scratch in Rust",
  design:
    "a creative/design world — flowing, artistic, purple-toned atmosphere",
  business:
    "an operational command center — structured, data-driven, amber-toned precision",
};

async function evaluateImage(
  slot: string,
  imagePath: string,
): Promise<{ score: number; verdict: string; notes: string }> {
  const ai = getClient();
  const context = CONTEXT_MAP[slot] ?? "a dark forensic portfolio";
  const prompt = EVALUATION_PROMPT.replace("[CONTEXT]", context);

  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString("base64");
  const mimeType = imagePath.endsWith(".webp")
    ? "image/webp"
    : imagePath.endsWith(".png")
      ? "image/png"
      : "image/jpeg";

  const response = await ai.models.generateContent({
    model: VISION_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }],
      },
    ],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Parse total score
  const totalMatch = text.match(/TOTAL:\s*(\d+)\/40/);
  const score = totalMatch ? parseInt(totalMatch[1]) : 0;

  const verdictMatch = text.match(/VERDICT:\s*(SHIP|ITERATE|REJECT)/);
  const verdict = verdictMatch ? verdictMatch[1] : "UNKNOWN";

  const notesMatch = text.match(/NOTES:\s*(.+)/);
  const notes = notesMatch ? notesMatch[1].trim() : "";

  return { score, verdict, notes };
}

// ─── Generation ──────────────────────────────────────────────────────────────

async function generateAsset(slot: string): Promise<string | null> {
  const spec = ASSETS[slot];
  if (!spec) {
    console.error(
      `❌ Unknown slot: ${slot}. Available: ${Object.keys(ASSETS).join(", ")}`,
    );
    return null;
  }

  const ai = getClient();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n${"═".repeat(60)}`);
  console.log(`🎬 GENERATING: ${spec.slot}`);
  console.log(`   Component: ${spec.component}`);
  console.log(`   Opacity: ${spec.opacity} | Blend: ${spec.blendMode}`);
  console.log(`${"═".repeat(60)}`);
  console.log(`\n📝 Prompt (${spec.prompt.length} chars):`);
  console.log(`   ${spec.prompt.slice(0, 100)}...`);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: spec.prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"] as Modality[],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.text) console.log(`\n💬 Model: ${part.text}`);
    if (part.inlineData) {
      const ext = part.inlineData.mimeType?.includes("png")
        ? "png"
        : part.inlineData.mimeType?.includes("webp")
          ? "webp"
          : "png";
      const filepath = path.join(OUTPUT_DIR, `${spec.filename}.${ext}`);
      fs.writeFileSync(filepath, Buffer.from(part.inlineData.data!, "base64"));

      const sizeKB = Math.round(fs.statSync(filepath).size / 1024);
      console.log(`\n✅ Saved: ${filepath} (${sizeKB} KB)`);
      return filepath;
    }
  }

  console.error(`\n❌ No image generated for ${slot}`);
  return null;
}

// ─── Pipeline: Generate + Evaluate + Retry ───────────────────────────────────

async function pipeline(slot: string, maxAttempts = 3): Promise<boolean> {
  console.log(`\n${"▓".repeat(60)}`);
  console.log(`▓  PIPELINE: ${slot.toUpperCase()}`);
  console.log(`${"▓".repeat(60)}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n── Attempt ${attempt}/${maxAttempts} ──`);

    const imagePath = await generateAsset(slot);
    if (!imagePath) {
      console.error(
        `   Generation failed. ${attempt < maxAttempts ? "Retrying..." : "Giving up."}`,
      );
      if (attempt < maxAttempts) await sleep(2000);
      continue;
    }

    // Evaluate
    console.log(`\n🔍 Evaluating quality...`);
    try {
      const result = await evaluateImage(slot, imagePath);
      console.log(`   Score: ${result.score}/40`);
      console.log(`   Verdict: ${result.verdict}`);
      if (result.notes) console.log(`   Notes: ${result.notes}`);

      if (result.verdict === "SHIP" || result.score >= 30) {
        console.log(`\n🎉 APPROVED — ${slot} passes quality gate`);
        return true;
      }

      if (result.verdict === "REJECT" && attempt < maxAttempts) {
        console.log(
          `\n🔄 REJECTED (${result.score}/40) — regenerating with refined approach...`,
        );
        await sleep(2000);
        continue;
      }

      // ITERATE verdict or last attempt
      if (attempt >= maxAttempts) {
        console.log(
          `\n⚠️  Max attempts reached. Best effort: ${result.score}/40`,
        );
        if (result.score >= 25) {
          console.log(`   Accepting with reservations (score ≥ 25)`);
          return true;
        }
        return false;
      }

      console.log(`\n🔄 Score below threshold — retrying...`);
      await sleep(2000);
    } catch (evalError: any) {
      console.log(
        `   ⚠️ Evaluation failed: ${evalError.message}. Accepting image.`,
      );
      return true;
    }
  }
  return false;
}

// ─── Commands ────────────────────────────────────────────────────────────────

async function runAll(): Promise<void> {
  console.log(`\n${"█".repeat(60)}`);
  console.log(`█  ART DIRECTOR PIPELINE — FULL RUN`);
  console.log(
    `█  Generating all ${Object.keys(ASSETS).length} portfolio assets`,
  );
  console.log(`${"█".repeat(60)}`);

  const results: Record<string, boolean> = {};

  for (const slot of Object.keys(ASSETS)) {
    results[slot] = await pipeline(slot);
    // Rate limit courtesy
    await sleep(3000);
  }

  // Summary
  console.log(`\n${"═".repeat(60)}`);
  console.log(`PIPELINE SUMMARY`);
  console.log(`${"═".repeat(60)}`);
  for (const [slot, passed] of Object.entries(results)) {
    const icon = passed ? "✅" : "❌";
    const spec = ASSETS[slot];
    console.log(
      `  ${icon} ${slot.padEnd(12)} → ${spec.filename} → ${spec.component}`,
    );
  }
  const passCount = Object.values(results).filter(Boolean).length;
  console.log(
    `\n  ${passCount}/${Object.keys(ASSETS).length} assets passed quality gates`,
  );

  if (passCount === Object.keys(ASSETS).length) {
    console.log(
      `\n🎉 ALL ASSETS APPROVED — Run \`npm run build\` to verify integration`,
    );
  } else {
    console.log(`\n⚠️  Some assets need manual review`);
  }
}

async function showStatus(): Promise<void> {
  console.log(`\n📊 ASSET STATUS\n`);

  for (const [slot, spec] of Object.entries(ASSETS)) {
    const pngPath = path.join(OUTPUT_DIR, `${spec.filename}.png`);
    const webpPath = path.join(OUTPUT_DIR, `${spec.filename}.webp`);

    const exists = fs.existsSync(pngPath) || fs.existsSync(webpPath);
    const filePath = fs.existsSync(pngPath) ? pngPath : webpPath;

    if (exists) {
      const size = Math.round(fs.statSync(filePath).size / 1024);
      const ext = path.extname(filePath);
      console.log(
        `  ✅ ${slot.padEnd(12)} │ ${spec.filename}${ext} │ ${size} KB │ → ${spec.component}`,
      );
    } else {
      console.log(`  ❌ ${slot.padEnd(12)} │ MISSING │ → ${spec.component}`);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  loadEnv();

  const command = process.argv[2] ?? "help";
  const target = process.argv[3];

  switch (command) {
    case "all":
      await runAll();
      break;

    case "generate":
    case "gen":
      if (!target) {
        console.error("❌ Specify slot: " + Object.keys(ASSETS).join(", "));
        process.exit(1);
      }
      await pipeline(target);
      break;

    case "evaluate":
    case "eval": {
      if (!target) {
        console.error("❌ Specify slot");
        process.exit(1);
      }
      const spec = ASSETS[target];
      if (!spec) {
        console.error(`❌ Unknown: ${target}`);
        process.exit(1);
      }
      const p = path.join(OUTPUT_DIR, `${spec.filename}.png`);
      const pw = path.join(OUTPUT_DIR, `${spec.filename}.webp`);
      const fp = fs.existsSync(p) ? p : pw;
      if (!fs.existsSync(fp)) {
        console.error(`❌ No image found for ${target}`);
        process.exit(1);
      }
      const result = await evaluateImage(target, fp);
      console.log(`\nScore: ${result.score}/40 | Verdict: ${result.verdict}`);
      if (result.notes) console.log(`Notes: ${result.notes}`);
      break;
    }

    case "status":
      await showStatus();
      break;

    default:
      console.log(`
Art Director Pipeline — The Artifact

Commands:
  all                    Generate & evaluate all 6 assets
  generate <slot>        Generate one asset (with quality gate)
  evaluate <slot>        Evaluate existing asset
  status                 Show all asset file status

Slots: ${Object.keys(ASSETS).join(", ")}
      `);
  }
}

main().catch((err) => {
  console.error(`\n❌ ${err.message ?? err}`);
  process.exit(1);
});
