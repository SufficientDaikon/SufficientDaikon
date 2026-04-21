#!/usr/bin/env npx tsx
/**
 * gemini-generate.ts — Gemini Image Generation CLI
 *
 * Drop-in Whisk replacement using Google's @google/genai SDK.
 * Supports text-to-image, image editing, batch generation,
 * multi-turn chat editing, and image analysis (vision).
 *
 * Usage:
 *   npx tsx tools/gemini-generate.ts gen "prompt" [options]
 *   npx tsx tools/gemini-generate.ts edit "instruction" --input image.png
 *   npx tsx tools/gemini-generate.ts batch "prompt" --count 4
 *   npx tsx tools/gemini-generate.ts see "question" --input image.png
 *   npx tsx tools/gemini-generate.ts preset hero|archon|aether|axon|design|business
 *
 * Options:
 *   --name <filename>     Output filename (without extension)
 *   --aspect <ratio>      Aspect ratio: square|landscape|portrait|wide|ultrawide
 *   --model <model>       Model: flash|pro|imagen
 *   --input <file>        Input image for editing/analysis
 *   --count <n>           Number of variants (batch mode, 1-4)
 *   --output <dir>        Output directory (default: public/generated)
 *   --preset <name>       Use a built-in preset prompt
 *   --enhance             Auto-enhance prompt with 5-component formula
 *   --raw                 Skip prompt enhancement, use raw prompt
 */

import { GoogleGenAI, type Modality } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// ─── Configuration ───────────────────────────────────────────────────────────

const MODELS = {
  flash: "gemini-3.1-flash-image-preview",
  pro: "gemini-3-pro-image-preview",
  nano: "gemini-2.5-flash-image",
  imagen: "imagen-3.0-generate-002",
} as const;

const ASPECT_RATIOS: Record<string, string> = {
  square: "1:1",
  portrait: "9:16",
  landscape: "16:9",
  wide: "16:9",
  ultrawide: "21:9",
  "4:3": "4:3",
  "3:4": "3:4",
  "1:1": "1:1",
  "9:16": "9:16",
  "16:9": "16:9",
};

const OUTPUT_DIR = path.resolve(process.cwd(), "public/generated");

// ─── Forensic Monolith Preset Prompts ────────────────────────────────────────

const PRESETS: Record<
  string,
  { prompt: string; aspect: string; name: string }
> = {
  hero: {
    prompt: `A vast computational void stretching to infinity, pulsing with faint electromagnetic energy through a precise cyan (#00F0FF) grid matrix suspended in absolute darkness (#0e0e0e). Microscopic data particles drift through the space like luminous digital plankton, each trailing faint cyan filaments. No horizon, no ground — pure computational substrate. Scattered holographic glyphs float at varying depths, some sharp, some bokeh-blurred. A single concentrated beam of cold cyan light cuts diagonally through the void, illuminating suspended geometric fragments. Extreme wide shot, centered vanishing point, 16:9 cinematic frame. Shot on RED Monstro 8K, 14mm ultra-wide lens, f/1.4, ISO 800. Cold cyan-teal color grade with crushed blacks. Digital grain at 3% opacity. Inspired by Blade Runner 2049 cinematography and Ghost in the Shell data landscapes.`,
    aspect: "landscape",
    name: "hero-bg",
  },
  archon: {
    prompt: `A towering crystalline neural network structure rendered as a physical monument — thousands of interconnected nodes made of translucent cyan (#00F0FF) glass, suspended in a dark void (#0e0e0e). Each node pulses with internal light, connected by hair-thin luminous filaments carrying visible data packets. The structure resembles both a brain scan and a constellation map. At its core, a brighter cluster suggests a central intelligence. Volumetric fog drifts through the lower third. Medium-wide shot, slight low angle emphasizing scale, 16:9 frame. Cold clinical lighting from above, cyan rim lights on edges. Shot on ARRI Alexa 65, 24mm lens. Color grade: desaturated with selective cyan, crushed shadows. Microscopic technical annotations float near nodes like AR overlays. Inspired by neuroscience visualization and Tron Legacy aesthetics.`,
    aspect: "landscape",
    name: "archon-hero",
  },
  aether: {
    prompt: `An abstract visualization of autonomous agent orchestration — multiple distinct geometric entities (polyhedra, toroids, icosahedra) orbiting a central command nexus in synchronized patterns. Each entity emits a unique spectral signature while maintaining formation through visible force-field connections rendered as thin cyan (#00F0FF) laser lines against deep black (#0e0e0e). The central nexus is a slowly rotating dodecahedron radiating structured light pulses outward. Data streams flow between entities as particle ribbons. Wide shot, top-down 30-degree angle, 16:9 cinematic. Dramatic rim lighting in cold blue-white, volumetric atmosphere. Shot on Phantom Flex 4K, 35mm lens, 1000fps frozen motion. Crushed blacks, selective color on cyan elements only. Inspired by molecular dynamics simulation and mission control telemetry displays.`,
    aspect: "landscape",
    name: "aether-hero",
  },
  axon: {
    prompt: `A macro close-up of a single neural axon rendered as an engineered structure — a translucent cylindrical conduit carrying visible electrical impulses as cyan (#00F0FF) light pulses traveling along its length. The axon's myelin sheath is rendered as precision-machined metallic segments with microscopic circuit traces etched into the surface. At synaptic terminals, sparks of light jump across infinitesimal gaps. The background is pure darkness (#0e0e0e) with faint hexagonal grid artifacts. Extreme macro shot, razor-thin depth of field, 16:9 frame. Backlit with cold white light creating translucency, cyan transmission glow from within. Shot on Laowa Probe lens at 24:1 magnification. Color grade: monochromatic cyan-gray with peak whites on impulse points. Inspired by electron microscopy and bioengineering visualization.`,
    aspect: "landscape",
    name: "axon-hero",
  },
  design: {
    prompt: `A surreal creative workspace dissolving into digital abstraction — a drafting table surface morphs into flowing liquid purple (#C084FC) light at its edges, shapes and typography fragments orbiting in zero gravity. Bezier curve handles float visibly, connecting design elements. Color swatches materialize as holographic chips. A golden ratio spiral rendered in luminous wire overlays the composition. The environment transitions from physical (matte dark surfaces, #1c1b1b) to ethereal (particle-based, translucent). Wide shot, slight overhead angle, 16:9 frame. Soft purple-tinted key light from upper left, fill from floating elements. Shot on Phase One IQ4 150MP, 55mm lens, f/2.8. Color grade: warm shadows with selective purple highlights, gentle bloom on light sources. Inspired by creative tool splash screens and digital art exhibitions.`,
    aspect: "landscape",
    name: "design-world-bg",
  },
  business: {
    prompt: `A command center data visualization room — a curved wall of dark glass panels (#131313 to #201f1f gradient) displaying real-time business metrics as amber (#F59E0B) holographic projections. Bar charts grow upward like luminous architecture. Network graphs show connection flows between nodes. A large central circular display shows a slowly rotating globe with trade routes marked as amber light paths. The room floor reflects the displays faintly. No people, just the intelligence of the data itself. Wide shot, centered perspective, slight low angle, 16:9 frame. Ambient darkness with amber-tinted display glow as primary light source. Shot on Sony Venice 2, 18mm lens, T2. Color grade: deep contrast, amber-gold accent color only, everything else near-monochrome dark. Inspired by Bloomberg Terminal aesthetics and military command center design.`,
    aspect: "landscape",
    name: "business-world-bg",
  },
};

// ─── 5-Component Prompt Enhancement ──────────────────────────────────────────

const FORENSIC_STYLE = {
  lighting:
    "Cold overhead fluorescent with cyan (#00F0FF) rim lighting, deep shadows, low-key ratio",
  camera: "Shot on RED Monstro 8K, f/1.4, shallow depth of field",
  texture:
    "Digital noise at 3% opacity, subtle CRT scanlines, grid overlay at 5%",
  mood: "Clinical, surgical, forensic, mission control aesthetic",
  colors:
    "Cyan (#00F0FF) accent against deep blacks (#0e0e0e), surface grays (#131313-#353535)",
  references: "Blade Runner 2049, Ghost in the Shell, Tron Legacy, Mr. Robot",
};

function enhancePrompt(rawPrompt: string, aspect: string): string {
  const isLandscape =
    aspect === "landscape" || aspect === "wide" || aspect === "16:9";
  const composition = isLandscape
    ? "Wide cinematic frame, centered vanishing point, 16:9 aspect ratio"
    : "Vertical frame with strong central axis, 9:16 aspect ratio";

  return [
    rawPrompt.trim(),
    "",
    `Composition: ${composition}.`,
    `Lighting: ${FORENSIC_STYLE.lighting}.`,
    `Camera: ${FORENSIC_STYLE.camera}.`,
    `Color palette: ${FORENSIC_STYLE.colors}.`,
    `Texture: ${FORENSIC_STYLE.texture}.`,
    `Mood: ${FORENSIC_STYLE.mood}.`,
    `Visual references: ${FORENSIC_STYLE.references}.`,
  ].join("\n");
}

// ─── Core Generation Functions ───────────────────────────────────────────────

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "\n╔══════════════════════════════════════════════════════════╗",
    );
    console.error(
      "║  GEMINI_API_KEY not found                                ║",
    );
    console.error(
      "║                                                          ║",
    );
    console.error(
      "║  Get a free key: https://aistudio.google.com/apikey      ║",
    );
    console.error(
      "║  Then add to .env.local:                                 ║",
    );
    console.error(
      "║    GEMINI_API_KEY=your_key_here                          ║",
    );
    console.error(
      "║                                                          ║",
    );
    console.error(
      "║  Or set environment variable:                            ║",
    );
    console.error(
      "║    $env:GEMINI_API_KEY = 'your_key_here'                 ║",
    );
    console.error(
      "╚══════════════════════════════════════════════════════════╝\n",
    );
    process.exit(1);
  }
  return new GoogleGenAI({ apiKey });
}

function loadEnvFile(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex).trim();
          const value = trimmed.slice(eqIndex + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

async function saveImage(
  base64Data: string,
  mimeType: string,
  outputName: string,
  outputDir: string,
): Promise<string> {
  fs.mkdirSync(outputDir, { recursive: true });
  const ext = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
      ? "webp"
      : "png";
  const filename = `${outputName}.${ext}`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
  return filepath;
}

async function generateImage(opts: {
  prompt: string;
  model?: keyof typeof MODELS;
  aspect?: string;
  name?: string;
  outputDir?: string;
  enhance?: boolean;
}): Promise<string[]> {
  const ai = getClient();
  const modelId = MODELS[opts.model ?? "flash"];
  const aspect = opts.aspect ?? "landscape";
  const outputDir = opts.outputDir ?? OUTPUT_DIR;
  const enhance = opts.enhance ?? true;

  const finalPrompt = enhance
    ? enhancePrompt(opts.prompt, aspect)
    : opts.prompt;

  console.log(`\n⚡ Generating with ${modelId}...`);
  console.log(`📐 Aspect: ${ASPECT_RATIOS[aspect] ?? aspect}`);
  if (enhance) console.log(`🔬 Prompt enhanced with Forensic Monolith style`);
  console.log(`📝 Prompt: ${finalPrompt.slice(0, 120)}...`);
  console.log();

  const response = await ai.models.generateContent({
    model: modelId,
    contents: finalPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"] as Modality[],
    },
  });

  const savedPaths: string[] = [];
  const candidates = response.candidates ?? [];

  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? [];
    let imageIndex = 0;
    for (const part of parts) {
      if (part.text) {
        console.log(`💬 Model says: ${part.text}`);
      }
      if (part.inlineData) {
        const name = opts.name
          ? imageIndex === 0
            ? opts.name
            : `${opts.name}-${imageIndex}`
          : `gen-${Date.now()}-${imageIndex}`;
        const filepath = await saveImage(
          part.inlineData.data!,
          part.inlineData.mimeType!,
          name,
          outputDir,
        );
        savedPaths.push(filepath);
        console.log(`✅ Saved: ${filepath}`);
        imageIndex++;
      }
    }
  }

  if (savedPaths.length === 0) {
    console.error(
      "❌ No images generated. The model may have refused the prompt.",
    );
    console.error("   Try rephrasing or using --raw to skip enhancement.");
    const textParts = candidates.flatMap(
      (c) => c.content?.parts?.filter((p) => p.text) ?? [],
    );
    if (textParts.length > 0) {
      console.error(
        `   Model response: ${textParts.map((p) => p.text).join(" ")}`,
      );
    }
  }

  return savedPaths;
}

async function editImage(opts: {
  instruction: string;
  inputPath: string;
  name?: string;
  outputDir?: string;
}): Promise<string[]> {
  const ai = getClient();
  const outputDir = opts.outputDir ?? OUTPUT_DIR;

  if (!fs.existsSync(opts.inputPath)) {
    console.error(`❌ Input file not found: ${opts.inputPath}`);
    process.exit(1);
  }

  const imageData = fs.readFileSync(opts.inputPath);
  const base64 = imageData.toString("base64");
  const mimeType = opts.inputPath.endsWith(".png")
    ? "image/png"
    : opts.inputPath.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

  console.log(`\n🎨 Editing ${opts.inputPath}...`);
  console.log(`📝 Instruction: ${opts.instruction}`);

  const response = await ai.models.generateContent({
    model: MODELS.flash,
    contents: [
      {
        role: "user",
        parts: [
          { text: opts.instruction },
          { inlineData: { data: base64, mimeType } },
        ],
      },
    ],
    config: {
      responseModalities: ["TEXT", "IMAGE"] as Modality[],
    },
  });

  const savedPaths: string[] = [];
  const parts = response.candidates?.[0]?.content?.parts ?? [];

  for (const part of parts) {
    if (part.text) console.log(`💬 ${part.text}`);
    if (part.inlineData) {
      const name = opts.name ?? `edited-${Date.now()}`;
      const filepath = await saveImage(
        part.inlineData.data!,
        part.inlineData.mimeType!,
        name,
        outputDir,
      );
      savedPaths.push(filepath);
      console.log(`✅ Saved: ${filepath}`);
    }
  }

  return savedPaths;
}

async function analyzeImage(opts: {
  question: string;
  inputPath: string;
}): Promise<string> {
  const ai = getClient();

  if (!fs.existsSync(opts.inputPath)) {
    console.error(`❌ Input file not found: ${opts.inputPath}`);
    process.exit(1);
  }

  const imageData = fs.readFileSync(opts.inputPath);
  const base64 = imageData.toString("base64");
  const mimeType = opts.inputPath.endsWith(".png")
    ? "image/png"
    : opts.inputPath.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";

  console.log(`\n👁️  Analyzing ${opts.inputPath}...`);
  console.log(`❓ Question: ${opts.question}`);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: opts.question },
        ],
      },
    ],
  });

  const text =
    response.candidates?.[0]?.content?.parts?.[0]?.text ?? "(no response)";
  console.log(`\n🔍 Analysis:\n${text}`);
  return text;
}

async function batchGenerate(opts: {
  prompt: string;
  count: number;
  name?: string;
  aspect?: string;
  outputDir?: string;
  enhance?: boolean;
}): Promise<string[]> {
  const count = Math.min(Math.max(opts.count, 1), 8);
  console.log(`\n🔄 Batch generating ${count} variants...`);

  const allPaths: string[] = [];
  for (let i = 0; i < count; i++) {
    const name = opts.name
      ? `${opts.name}-v${i + 1}`
      : `batch-${Date.now()}-v${i + 1}`;
    console.log(`\n── Variant ${i + 1}/${count} ──`);
    const paths = await generateImage({
      ...opts,
      name,
    });
    allPaths.push(...paths);

    // small delay between requests to be polite to the API
    if (i < count - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n📦 Batch complete: ${allPaths.length} images generated`);
  return allPaths;
}

async function runPreset(presetName: string): Promise<string[]> {
  const preset = PRESETS[presetName];
  if (!preset) {
    console.error(`❌ Unknown preset: "${presetName}"`);
    console.error(`   Available: ${Object.keys(PRESETS).join(", ")}`);
    process.exit(1);
  }

  console.log(`\n🎯 Running preset: ${presetName}`);
  return generateImage({
    prompt: preset.prompt,
    aspect: preset.aspect,
    name: preset.name,
    enhance: false, // presets are already fully specified
  });
}

// ─── CLI Parser ──────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): {
  command: string;
  prompt: string;
  flags: Record<string, string>;
} {
  const args = argv.slice(2);
  const command = args[0] ?? "help";
  const flags: Record<string, string> = {};
  const positional: string[] = [];

  let i = 1;
  while (i < args.length) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      const value =
        args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
      flags[key] = value;
    } else {
      positional.push(args[i]);
    }
    i++;
  }

  return {
    command,
    prompt: positional.join(" "),
    flags,
  };
}

function printHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  GEMINI IMAGE GENERATOR — The Artifact Visual Pipeline     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Commands:                                                   ║
║    gen <prompt>          Generate image from text prompt      ║
║    edit <instruction>    Edit existing image                  ║
║    batch <prompt>        Generate multiple variants           ║
║    see <question>        Analyze/describe an image            ║
║    preset <name>         Use built-in preset prompt           ║
║    presets               List all available presets           ║
║    help                  Show this help                       ║
║                                                              ║
║  Options:                                                    ║
║    --name <filename>     Output filename (no extension)       ║
║    --aspect <ratio>      square|landscape|portrait|wide       ║
║    --model <model>       flash|pro|nano|imagen                ║
║    --input <file>        Input image (edit/see commands)      ║
║    --count <n>           Variant count (batch, 1-8)           ║
║    --output <dir>        Output directory                     ║
║    --enhance             Auto-enhance with Forensic style     ║
║    --raw                 Use prompt as-is (no enhancement)    ║
║                                                              ║
║  Presets:                                                    ║
║    hero      — Computational void hero background            ║
║    archon    — Neural network monument                       ║
║    aether    — Agent orchestration visualization             ║
║    axon      — Neural axon macro                             ║
║    design    — Creative workspace (purple palette)           ║
║    business  — Command center (amber palette)                ║
║                                                              ║
║  Examples:                                                   ║
║    npx tsx tools/gemini-generate.ts gen "a cyberpunk city"    ║
║    npx tsx tools/gemini-generate.ts preset hero              ║
║    npx tsx tools/gemini-generate.ts batch "abstract art" \\    ║
║      --count 4 --name variants                               ║
║    npx tsx tools/gemini-generate.ts edit "make darker" \\      ║
║      --input public/generated/hero-bg.png                    ║
║    npx tsx tools/gemini-generate.ts see "describe this" \\     ║
║      --input public/generated/hero-bg.png                    ║
║                                                              ║
║  Setup:                                                      ║
║    1. Get key: https://aistudio.google.com/apikey            ║
║    2. Add to .env.local: GEMINI_API_KEY=your_key             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  loadEnvFile();

  const { command, prompt, flags } = parseArgs(process.argv);

  switch (command) {
    case "gen":
    case "generate": {
      if (!prompt) {
        console.error('❌ Missing prompt. Usage: gen "your prompt here"');
        process.exit(1);
      }
      await generateImage({
        prompt,
        model: (flags.model as keyof typeof MODELS) ?? "flash",
        aspect: flags.aspect ?? "landscape",
        name: flags.name,
        outputDir: flags.output,
        enhance: flags.raw ? false : true,
      });
      break;
    }

    case "edit": {
      if (!prompt) {
        console.error(
          '❌ Missing instruction. Usage: edit "make it darker" --input image.png',
        );
        process.exit(1);
      }
      if (!flags.input) {
        console.error("❌ Missing --input flag. Specify the image to edit.");
        process.exit(1);
      }
      await editImage({
        instruction: prompt,
        inputPath: flags.input,
        name: flags.name,
        outputDir: flags.output,
      });
      break;
    }

    case "batch": {
      if (!prompt) {
        console.error(
          '❌ Missing prompt. Usage: batch "your prompt" --count 4',
        );
        process.exit(1);
      }
      await batchGenerate({
        prompt,
        count: parseInt(flags.count ?? "4", 10),
        name: flags.name,
        aspect: flags.aspect ?? "landscape",
        outputDir: flags.output,
        enhance: flags.raw ? false : true,
      });
      break;
    }

    case "see":
    case "analyze":
    case "vision": {
      if (!prompt) {
        console.error(
          '❌ Missing question. Usage: see "describe this image" --input image.png',
        );
        process.exit(1);
      }
      if (!flags.input) {
        console.error("❌ Missing --input flag. Specify the image to analyze.");
        process.exit(1);
      }
      await analyzeImage({
        question: prompt,
        inputPath: flags.input,
      });
      break;
    }

    case "preset": {
      if (!prompt) {
        console.error("❌ Missing preset name. Usage: preset hero");
        console.error(`   Available: ${Object.keys(PRESETS).join(", ")}`);
        process.exit(1);
      }
      await runPreset(prompt);
      break;
    }

    case "presets":
    case "list": {
      console.log("\n🎯 Available Presets:\n");
      for (const [name, preset] of Object.entries(PRESETS)) {
        console.log(
          `  ${name.padEnd(12)} → ${preset.name}.png (${preset.aspect})`,
        );
        console.log(`  ${"".padEnd(12)}   ${preset.prompt.slice(0, 80)}...`);
        console.log();
      }
      break;
    }

    case "help":
    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message ?? err);
  if (err.status === 401 || err.status === 403) {
    console.error(
      "   → API key may be invalid. Check GEMINI_API_KEY in .env.local",
    );
  }
  if (err.status === 429) {
    console.error("   → Rate limited. Wait a moment and try again.");
  }
  process.exit(1);
});
