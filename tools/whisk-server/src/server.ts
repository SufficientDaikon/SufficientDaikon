#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  Whisk,
  Media,
  Project,
  ImageAspectRatio,
  VideoGenerationModel,
  imageToBase64,
} from "@rohitaryal/whisk-api";
import fs from "node:fs";
import path from "node:path";

// ─── CONSTANTS ───────────────────────────────────────────────

const OUTPUT_DIR = process.env.WHISK_OUTPUT_DIR
  ? path.resolve(process.env.WHISK_OUTPUT_DIR)
  : path.resolve("public/generated");

const ASPECT_MAP = {
  SQUARE: ImageAspectRatio.SQUARE,
  PORTRAIT: ImageAspectRatio.PORTRAIT,
  LANDSCAPE: ImageAspectRatio.LANDSCAPE,
} as const;

const MAX_CACHE_SIZE = 50;

// ─── SESSION STATE ───────────────────────────────────────────

let whiskInstance: Whisk | null = null;
let currentProject: Project | null = null;
const mediaCache = new Map<string, Media>();

// ─── HELPERS ─────────────────────────────────────────────────

function getWhisk(forceRefresh = false): Whisk {
  if (!whiskInstance || forceRefresh) {
    const cookie = process.env.WHISK_COOKIE;
    if (!cookie) {
      throw new Error(
        "WHISK_COOKIE environment variable is not set. " +
          "Extract your cookie from https://labs.google/fx/tools/whisk using Cookie Editor extension.",
      );
    }
    whiskInstance = new Whisk(cookie);
    currentProject = null; // Reset project when cookie changes
  }
  return whiskInstance;
}

function reloadCookieFromDisk(): boolean {
  try {
    const mcpJsonPath = path.resolve(".mcp.json");
    if (!fs.existsSync(mcpJsonPath)) return false;
    const raw = fs.readFileSync(mcpJsonPath, "utf-8");
    const config = JSON.parse(raw);
    const newCookie = config?.mcpServers?.whisk?.env?.WHISK_COOKIE;
    if (newCookie && newCookie !== process.env.WHISK_COOKIE) {
      process.env.WHISK_COOKIE = newCookie;
      whiskInstance = null;
      currentProject = null;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function getProject(): Promise<Project> {
  if (!currentProject) {
    const whisk = getWhisk();
    currentProject = await whisk.newProject("Claude-Whisk-Session");
  }
  return currentProject;
}

function cacheMedia(media: Media): void {
  if (mediaCache.size >= MAX_CACHE_SIZE) {
    const firstKey = mediaCache.keys().next().value;
    if (firstKey) mediaCache.delete(firstKey);
  }
  mediaCache.set(media.mediaGenerationId, media);
}

async function resolveMedia(mediaId: string): Promise<Media> {
  const cached = mediaCache.get(mediaId);
  if (cached) return cached;
  const whisk = getWhisk();
  const media = await Whisk.getMedia(mediaId, whisk.account);
  cacheMedia(media);
  return media;
}

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function saveMedia(
  media: Media,
  prefix: string = "img",
): { filePath: string; webPath: string; fileName: string } {
  ensureOutputDir();
  const ext = media.mediaType === "VIDEO" ? "mp4" : "png";
  const timestamp = Date.now();
  const idShort = media.mediaGenerationId.slice(0, 8);
  const fileName = `${prefix}_${timestamp}_${idShort}.${ext}`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  // Use the library's built-in save method
  media.save(OUTPUT_DIR);

  // The library saves with its own naming, so we also write with our naming
  const encodedData = media.encodedMedia;
  const base64Data = encodedData.replace(/^data:\w+\/[\w+-]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, buffer);

  const webPath = `/generated/${fileName}`;
  return { filePath, webPath, fileName };
}

function formatError(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  const msg = error instanceof Error ? error.message : String(error);

  // Try to reload cookie from disk on any auth-like error
  if (
    msg.includes("new cookie is required") ||
    msg.includes("not a valid cookie") ||
    msg.includes("UNAUTHORIZED") ||
    msg.includes("Cannot read properties of undefined")
  ) {
    const reloaded = reloadCookieFromDisk();
    return {
      content: [
        {
          type: "text" as const,
          text:
            "AUTH ERROR: Google cookie is invalid or expired.\n" +
            (reloaded
              ? "Cookie was auto-reloaded from .mcp.json. Please retry the same call.\n"
              : "Could not auto-reload cookie.\n") +
            "\nManual fix steps:\n" +
            "1. Open https://labs.google/fx/tools/whisk/project in Chrome\n" +
            "2. Use Cookie Editor extension → Export → Header String\n" +
            "3. Update WHISK_COOKIE in .mcp.json\n" +
            "4. Retry the call (cookie will auto-reload)",
        },
      ],
      isError: true,
    };
  }

  if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
    return {
      content: [
        {
          type: "text" as const,
          text: "RATE LIMITED: Google's API is throttling requests. Wait 30-60 seconds and try again.",
        },
      ],
      isError: true,
    };
  }

  return {
    content: [{ type: "text" as const, text: `ERROR: ${msg}` }],
    isError: true,
  };
}

// ─── SERVER SETUP ────────────────────────────────────────────

const server = new McpServer({
  name: "whisk",
  version: "1.0.0",
});

// ─── TOOL 1: generate_image ─────────────────────────────────

server.registerTool(
  "generate_image",
  {
    title: "Generate Image",
    description:
      "Generate images from a text prompt using Google Whisk (Imagen 3.5). " +
      "Returns file paths to saved images and their media IDs for refinement/animation.",
    inputSchema: z.object({
      prompt: z.string().describe("Text description of the desired image"),
      aspect_ratio: z
        .enum(["SQUARE", "PORTRAIT", "LANDSCAPE"])
        .default("LANDSCAPE")
        .describe("Image aspect ratio"),
      seed: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Seed for reproducibility (0 = random)"),
      count: z
        .number()
        .int()
        .min(1)
        .max(4)
        .default(1)
        .describe("Number of images to generate (1-4)"),
    }),
  },
  async ({ prompt, aspect_ratio, seed, count }) => {
    try {
      const whisk = getWhisk();
      const images = await whisk.generateImage(
        {
          prompt,
          seed: seed || undefined,
          aspectRatio: ASPECT_MAP[aspect_ratio],
        },
        count,
      );

      const results = images.map((media, i) => {
        cacheMedia(media);
        const { filePath, webPath } = saveMedia(media, "img");
        return {
          index: i + 1,
          filePath,
          webPath,
          mediaId: media.mediaGenerationId,
          seed: media.seed,
        };
      });

      const output = results
        .map(
          (r) =>
            `${r.index}. ${r.webPath}\n` +
            `   File: ${r.filePath}\n` +
            `   Media ID: ${r.mediaId}\n` +
            `   Seed: ${r.seed}`,
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text" as const,
            text: `Generated ${results.length} image(s):\n\n${output}`,
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── TOOL 2: generate_with_references ────────────────────────

server.registerTool(
  "generate_with_references",
  {
    title: "Generate with References",
    description:
      "Generate an image using subject/scene/style reference images (Whisk's signature feature). " +
      "First upload references with upload_reference, then use their media IDs here. " +
      "Or provide file paths directly.",
    inputSchema: z.object({
      prompt: z.string().describe("Text instruction for the generation"),
      aspect_ratio: z
        .enum(["SQUARE", "PORTRAIT", "LANDSCAPE"])
        .default("LANDSCAPE")
        .describe("Image aspect ratio"),
      seed: z
        .number()
        .int()
        .min(0)
        .default(0)
        .describe("Seed for reproducibility (0 = random)"),
      subject_file: z
        .string()
        .optional()
        .describe("Absolute path to a subject reference image file"),
      scene_file: z
        .string()
        .optional()
        .describe("Absolute path to a scene reference image file"),
      style_file: z
        .string()
        .optional()
        .describe("Absolute path to a style reference image file"),
    }),
  },
  async ({
    prompt,
    aspect_ratio,
    seed,
    subject_file,
    scene_file,
    style_file,
  }) => {
    try {
      const project = await getProject();

      if (subject_file) {
        await project.addSubject({ file: subject_file });
      }
      if (scene_file) {
        await project.addScene({ file: scene_file });
      }
      if (style_file) {
        await project.addStyle({ file: style_file });
      }

      const media = await project.generateImageWithReferences({
        prompt,
        seed: seed || undefined,
        aspectRatio: ASPECT_MAP[aspect_ratio],
      });

      cacheMedia(media);
      const { filePath, webPath } = saveMedia(media, "ref");

      return {
        content: [
          {
            type: "text" as const,
            text:
              `Generated image with references:\n\n` +
              `File: ${filePath}\n` +
              `Web path: ${webPath}\n` +
              `Media ID: ${media.mediaGenerationId}\n` +
              `Seed: ${media.seed}\n` +
              `Subjects: ${project.subjects.length}, Scenes: ${project.scenes.length}, Styles: ${project.styles.length}`,
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── TOOL 3: refine_image ────────────────────────────────────

server.registerTool(
  "refine_image",
  {
    title: "Refine Image",
    description:
      "Edit/modify an existing generated image using natural language instructions " +
      '(e.g., "Add a red hat", "Make it snowy", "Change the background to space"). ' +
      "Requires a media_id from a previous generate_image call.",
    inputSchema: z.object({
      media_id: z
        .string()
        .describe(
          "Media ID of the image to refine (from generate_image output)",
        ),
      instruction: z.string().describe("Natural language edit instruction"),
    }),
  },
  async ({ media_id, instruction }) => {
    try {
      const media = await resolveMedia(media_id);

      if (media.mediaType !== "IMAGE") {
        return {
          content: [
            {
              type: "text" as const,
              text: "ERROR: Can only refine images, not videos.",
            },
          ],
          isError: true as const,
        };
      }

      const refined = await media.refine(instruction);
      cacheMedia(refined);
      const { filePath, webPath } = saveMedia(refined, "ref");

      return {
        content: [
          {
            type: "text" as const,
            text:
              `Refined image:\n\n` +
              `File: ${filePath}\n` +
              `Web path: ${webPath}\n` +
              `Media ID: ${refined.mediaGenerationId}\n` +
              `Instruction: ${instruction}`,
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── TOOL 4: animate_image ──────────────────────────────────

server.registerTool(
  "animate_image",
  {
    title: "Animate Image to Video",
    description:
      "Convert a generated LANDSCAPE image into a video using Veo 3.1. " +
      "WARNING: Only works with LANDSCAPE aspect ratio images. " +
      "This operation takes 30-120 seconds as it polls for completion.",
    inputSchema: z.object({
      media_id: z
        .string()
        .describe("Media ID of the landscape image to animate"),
      script: z
        .string()
        .describe(
          "Video script describing camera motion or scene action " +
            '(e.g., "Camera pans slowly to the left", "Zoom into the building")',
        ),
    }),
  },
  async ({ media_id, script }) => {
    try {
      const media = await resolveMedia(media_id);

      if (media.mediaType !== "IMAGE") {
        return {
          content: [
            {
              type: "text" as const,
              text: "ERROR: Can only animate images, not videos.",
            },
          ],
          isError: true as const,
        };
      }

      const video = await media.animate(script, VideoGenerationModel.VEO_3_1);
      cacheMedia(video);
      const { filePath, webPath } = saveMedia(video, "vid");

      return {
        content: [
          {
            type: "text" as const,
            text:
              `Video generated successfully!\n\n` +
              `File: ${filePath}\n` +
              `Web path: ${webPath}\n` +
              `Media ID: ${video.mediaGenerationId}\n` +
              `Script: ${script}`,
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── TOOL 5: caption_image ──────────────────────────────────

server.registerTool(
  "caption_image",
  {
    title: "Caption Image",
    description:
      "Generate text captions/descriptions for an image. " +
      "Provide either a local file path or a media_id from a previous generation.",
    inputSchema: z.object({
      file_path: z
        .string()
        .optional()
        .describe("Absolute path to a local image file"),
      media_id: z
        .string()
        .optional()
        .describe("Media ID of a previously generated image"),
      count: z
        .number()
        .int()
        .min(1)
        .max(8)
        .default(1)
        .describe("Number of captions to generate"),
    }),
  },
  async ({ file_path, media_id, count }) => {
    try {
      if (!file_path && !media_id) {
        return {
          content: [
            {
              type: "text" as const,
              text: "ERROR: Provide either file_path or media_id.",
            },
          ],
          isError: true as const,
        };
      }

      const whisk = getWhisk();

      if (media_id) {
        const media = await resolveMedia(media_id);
        const captions = await media.caption(count);
        return {
          content: [
            {
              type: "text" as const,
              text: `Captions for media ${media_id}:\n\n${captions.map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
            },
          ],
        };
      }

      // file_path provided
      const base64 = await imageToBase64(file_path!);
      const captions = await Whisk.generateCaption(
        base64,
        whisk.account,
        count,
      );
      return {
        content: [
          {
            type: "text" as const,
            text: `Captions for ${path.basename(file_path!)}:\n\n${captions.map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── TOOL 6: upload_reference ───────────────────────────────

server.registerTool(
  "upload_reference",
  {
    title: "Upload Reference Image",
    description:
      "Upload a local image as a reference (subject, scene, or style) for use in generate_with_references. " +
      "The image will be uploaded and captioned automatically.",
    inputSchema: z.object({
      file_path: z.string().describe("Absolute path to the local image file"),
      category: z
        .enum(["SUBJECT", "SCENE", "STYLE"])
        .describe(
          "Reference category: SUBJECT (main character/object), " +
            "SCENE (background/environment), STYLE (artistic style)",
        ),
    }),
  },
  async ({ file_path, category }) => {
    try {
      const project = await getProject();

      let ref;
      if (category === "SUBJECT") {
        ref = await project.addSubject({ file: file_path });
      } else if (category === "SCENE") {
        ref = await project.addScene({ file: file_path });
      } else {
        ref = await project.addStyle({ file: file_path });
      }

      return {
        content: [
          {
            type: "text" as const,
            text:
              `Uploaded ${category} reference:\n\n` +
              `Media ID: ${ref.mediaGenerationId}\n` +
              `Caption: ${ref.prompt}\n` +
              `File: ${file_path}\n\n` +
              `Current references — Subjects: ${project.subjects.length}, Scenes: ${project.scenes.length}, Styles: ${project.styles.length}`,
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── TOOL 7: fetch_media ────────────────────────────────────

server.registerTool(
  "fetch_media",
  {
    title: "Fetch Media",
    description:
      "Download a previously generated image or video by its media ID and save it locally.",
    inputSchema: z.object({
      media_id: z.string().describe("Media ID of the generated media to fetch"),
    }),
  },
  async ({ media_id }) => {
    try {
      const media = await resolveMedia(media_id);
      const { filePath, webPath } = saveMedia(
        media,
        media.mediaType === "VIDEO" ? "vid" : "img",
      );

      return {
        content: [
          {
            type: "text" as const,
            text:
              `Fetched ${media.mediaType.toLowerCase()}:\n\n` +
              `File: ${filePath}\n` +
              `Web path: ${webPath}\n` +
              `Media ID: ${media.mediaGenerationId}\n` +
              `Type: ${media.mediaType}\n` +
              `Seed: ${media.seed}`,
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── TOOL 8: list_generated ─────────────────────────────────

server.registerTool(
  "list_generated",
  {
    title: "List Generated Files",
    description:
      "List all images and videos that have been generated and saved locally.",
    inputSchema: z.object({
      type: z
        .enum(["all", "image", "video"])
        .default("all")
        .describe("Filter by media type"),
    }),
  },
  async ({ type }) => {
    try {
      ensureOutputDir();

      const files = fs.readdirSync(OUTPUT_DIR).filter((f) => {
        if (type === "image") return /\.(png|jpg|jpeg|webp)$/i.test(f);
        if (type === "video") return /\.(mp4|webm)$/i.test(f);
        return true;
      });

      if (files.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No ${type === "all" ? "" : type + " "}files found in ${OUTPUT_DIR}`,
            },
          ],
        };
      }

      const fileDetails = files.map((f) => {
        const stat = fs.statSync(path.join(OUTPUT_DIR, f));
        const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
        const created = stat.birthtime
          .toISOString()
          .replace("T", " ")
          .slice(0, 19);
        return `  ${f} (${sizeMb} MB, ${created})`;
      });

      return {
        content: [
          {
            type: "text" as const,
            text:
              `Generated files (${files.length}):\n` +
              `Directory: ${OUTPUT_DIR}\n\n` +
              fileDetails.join("\n"),
          },
        ],
      };
    } catch (error) {
      return formatError(error);
    }
  },
);

// ─── START SERVER ────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
