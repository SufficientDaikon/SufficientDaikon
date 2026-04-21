import type { APIRoute } from "astro";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

export const prerender = false;

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are the intelligence briefing system for Ahmed Taha's portfolio — "The Artifact."
You answer questions about Ahmed's work, projects, skills, and background in a concise, direct, terminal-like tone.
Keep responses under 150 words. Use uppercase for emphasis. Never use markdown formatting.

KEY FACTS:
- Full name: Ahmed Taha, based in Cairo, Egypt
- Title: AI Agent Architect & Full-Stack Engineer
- GitHub: SufficientDaikon (62 repos, 51 public, 11 private)
- Languages: TypeScript, Python, Rust, Go, PowerShell, GDScript, C#, Lua, HTML/CSS, SQL, Shell (11 total)
- AI agents built: 17 (including 13 VS Code Copilot agents)
- MCP servers: 5 custom production servers

PROJECTS:
- Archon (formerly OMNISKILL): Cross-platform AI skills framework. 83 skills, 10 agents, 5 platforms (Claude, Copilot, Cursor, Windsurf, Antigravity). MIT licensed. PRODUCTION.
- Aether: Autonomous multi-agent orchestration. 28 subsystems, Bun + TypeScript. PAUSED.
- Axon: ML/AI-first systems programming language in Rust. Full lexer, parser, borrow checker. ACTIVE.
- HugBrowse: Tauri + React + Rust desktop app for Hugging Face. SHIPPED.

Use the available tools to show rich UI components when the user asks about projects, metrics, tech stack, timeline, or contact info.`;

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();

  const result = streamText({
    model: openrouter("google/gemini-2.0-flash-001"),
    system: SYSTEM_PROMPT,
    messages,
    tools: {
      show_project: tool({
        description:
          "Show a detailed project card. Use when the user asks about a specific project (Archon, Aether, or Axon).",
        parameters: z.object({
          project: z
            .enum(["archon", "aether", "axon"])
            .describe("Which project to display"),
        }),
        execute: async ({ project }) => ({ project, displayed: true }),
      }),
      show_metrics: tool({
        description:
          "Show metrics and stats panel. Use when the user asks about numbers, stats, or metrics.",
        parameters: z.object({}),
        execute: async () => ({ displayed: true }),
      }),
      show_timeline: tool({
        description:
          "Show career timeline. Use when the user asks about history, journey, or timeline.",
        parameters: z.object({}),
        execute: async () => ({ displayed: true }),
      }),
      show_tech_stack: tool({
        description:
          "Show tech stack overview. Use when the user asks about technologies, tools, or stack.",
        parameters: z.object({}),
        execute: async () => ({ displayed: true }),
      }),
      show_contact: tool({
        description:
          "Show contact information. Use when the user asks how to reach or contact Ahmed.",
        parameters: z.object({}),
        execute: async () => ({ displayed: true }),
      }),
    },
    maxSteps: 3,
  });

  return result.toUIMessageStreamResponse();
};
