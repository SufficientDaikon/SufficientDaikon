<div align="center">

# Ahmed Taha's Portfolio

**AI Agent Architect | Systems Engineer | Builder of Autonomous Frameworks**

[Live](https://ahmedtaha.dev) · [GitHub](https://github.com/SufficientDaikon) · [LinkedIn](https://ahmed-taha225)

</div>

---

## What's Here

This is my professional portfolio and AI playground — a static Astro 5 site running on Cloudflare Pages. It showcases:

- **Archon** — Cognitive kernel for Claude Code (99 skills, 12 synapses, 17 agents)
- **Aether** — Multi-agent orchestration system (paused)
- **Axon** — ML/AI-first systems language in Rust
- **The Artifact** — This portfolio + generative AI panel with streaming completions

### Tech Stack

- **Frontend**: Astro 5 + React + Tailwind CSS 4
- **Styling**: CSS 4 with modern primitives (`@container`, `@property`)
- **AI Integration**: OpenRouter + AI SDK v6
- **Deployment**: Cloudflare Pages + Edge Functions
- **DX**: TypeScript, Bun, strict linting

## Getting Started

```bash
git clone https://github.com/SufficientDaikon/portfolio.git
cd portfolio
bun install
bun run dev
```

Environment setup:
```bash
cp .env.example .env.local
# Add your OPENROUTER_API_KEY from https://openrouter.ai/keys
```

### Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Local dev server at `http://localhost:4321` |
| `bun run build` | Production build to `./dist/` |
| `bun run preview` | Preview prod build locally |
| `bun run type-check` | TypeScript validation |

## Architecture Highlights

### AI Panel

Interactive chat panel using Claude Haiku with tool bindings:
- **show_project** — Project card for Archon/Aether/Axon
- **show_metrics** — Stats dashboard
- **show_timeline** — Career timeline
- **show_tech_stack** — Tech inventory
- **show_contact** — Contact info

Streaming completions via OpenRouter API. Bindings trigger React state updates to show content dynamically.

### Design System

Color primitives:
- **Primary**: `#00F0FF` (cyan) — accent, highlights, interactive states
- **Dark**: `#0e0e0e` (near-black) — backgrounds
- **Text**: `#f5f5f5` (off-white) — body copy

Uses CSS variables + Tailwind theme extensions for consistency.

## Production Checklist ✓

- ✓ Canonical tag for SEO (prevents duplicate indexing)
- ✓ Absolute OG/Twitter image URLs (social previews work across domains)
- ✓ AI SDK v6 migration (m.toolInvocations → m.parts API)
- ✓ Environment configuration (.env.example included)
- ✓ Preconnect links for Google Fonts (reduces font latency)

## Deployment

```bash
# Push to main branch
git push origin main

# Cloudflare Pages auto-deploys on push
# Site goes live at https://ahmedtaha.dev
```

## Notes

- The `public/llms.txt` file enables AI crawler discovery (Perplexity, Claude web search, etc.)
- Session storage clears on page close (no persistent data collection)
- Font loading is optimized with `rel="preconnect"` (saves 100–300ms cold load)

---

**Maintained by Ahmed Taha** | [GitHub](https://github.com/SufficientDaikon) | [tahaa755@gmail.com](mailto:tahaa755@gmail.com)
