# CLAUDE.md — The Artifact Portfolio

## Autonomy Policy

- **Do everything yourself.** If a task can be completed without user input, just do it.
- **Do NOT ask for confirmation** on routine actions: file creation, edits, installs, config changes, running builds/tests, git operations (except push), etc.
- **Only come to the user when:**
  1. You genuinely need input that you cannot figure out on your own (e.g., design choices, ambiguous requirements, credentials).
  2. You are done with a task and want the user to review the result.
- **Never ask "should I proceed?" or "is this okay?"** — just proceed.
- **Never list out steps and wait for approval** — execute them.
- If something fails, try to fix it yourself first. Only escalate if you're truly stuck.

## Project Overview

- **Owner:** Ahmed Taha
- **Location:** Cairo, Egypt
- **Path:** `h:/portfolio`
- **Type:** Personal portfolio — "The Artifact"
- **Stack:** Astro 5 + Tailwind CSS 4 + TypeScript (strict)
- **Deployment:** Cloudflare Pages (`ahmed-taha-portfolio`)
- **Deploy command:** `npx wrangler pages deploy dist/client --project-name ahmed-taha-portfolio`
- **GitHub:** [SufficientDaikon](https://github.com/SufficientDaikon)
- **Email:** tahaa755@gmail.com
- **LinkedIn:** ahmed-taha225

## MCP Servers

All configured in `.mcp.json`:

| Server         | Type            | Purpose                                                               |
| -------------- | --------------- | --------------------------------------------------------------------- |
| **Stitch**     | HTTP            | Google AI design tool (Project ID: `4381234788768248693`)             |
| **Awwwards**   | stdio (Python)  | Award-winning portfolio scraper — `tools/awwwards_server.py`          |
| **Astro Docs** | HTTP            | Official Astro documentation MCP — `https://mcp.docs.astro.build/mcp` |
| **Whisk**      | stdio (Node.js) | Google AI image/video generation — `tools/whisk-server/`              |

## Multi-Framework Architecture (HARD RULE — DO NOT BREAK)

> **This section contains actual code rules. These are NOT suggestions.**
> Breaking these rules will cause build failures, JSX conflicts, or runtime errors.

This project uses **Astro's islands architecture**. Before adding or modifying ANY component, consult the `astro-islands-expert` skill (`~/.claude/skills/astro-islands-expert/SKILL.md`) to determine the correct framework.

### Framework Selection Rule (HARD RULE)

**Before writing ANY new component or modifying existing ones, evaluate:**

1. **Static content, layout, SEO** → `.astro` component (default, zero JS)
2. **Real-time reactive UI, 60fps canvas effects, performance-critical counters** → SolidJS (`.tsx` in `**/solid/*`)
3. **Complex 3D scenes, WebGL, Three.js** → React + R3F (`.tsx` in `**/react/*`)
4. **Scroll-driven animations, transitions, micro-interactions** → Svelte (`.svelte` in `**/svelte/*`)
5. **Interactive inspectors, galleries, data-rich UI** → Vue (`.vue` in `**/vue/*`)

**Installing new integrations:** `npx astro add react|svelte|vue|solid-js`

**JSX disambiguation:** React `.tsx` must live in `**/react/*`. Solid `.tsx` must live in `**/solid/*`. Configured via `include` patterns in `astro.config.mjs`.

**Cross-framework state:** Use [nanostores](https://github.com/nanostores/nanostores) with framework-specific bindings (`@nanostores/react`, `@nanostores/solid`, `@nanostores/vue`, or `$` prefix in Svelte).

### Current State

The project currently uses **Astro-only** components with inline `<script>` tags for client-side JS. As the site evolves, individual components should be migrated to the appropriate framework per the rules above. The `astro.config.mjs` will need framework integrations added when first used.

## Design System: "The Forensic Monolith"

> **NOTE: Everything in this Design System section is a GUIDELINE, not a hard rule.**
> These colors, fonts, visual styles, and aesthetic choices represent the current direction
> but **can and will change** as the site evolves. Feel free to override, replace, or
> reinvent any visual element when a better approach emerges — whether from Awwwards
> inspiration, user feedback, or creative instinct. The only things that are actual
> hard rules are in the **Architecture & Code Rules** sections above and below.

### Creative North Star (current direction, subject to change)

Clinical, high-performance terminal aesthetic. Not friendly. Surgical. Every pixel is evidence. The portfolio reads like a declassified intelligence dossier.

### Color Tokens (current palette, can be changed)

| Token                     | Hex       | Usage                          |
| ------------------------- | --------- | ------------------------------ |
| `surface-lowest`          | `#0e0e0e` | Page background                |
| `surface-dim` / `surface` | `#131313` | Primary surface                |
| `surface-low`             | `#1c1b1b` | Elevated sections              |
| `surface-container`       | `#201f1f` | Card backgrounds               |
| `surface-high`            | `#2a2a2a` | Interactive elements           |
| `surface-highest`         | `#353534` | Hover states                   |
| `surface-bright`          | `#3a3939` | Highlights                     |
| `cyan`                    | `#00F0FF` | Primary accent (<5% of screen) |
| `cyan-dim`                | `#00DBE9` | Secondary accent               |
| `cyan-pale`               | `#DBFCFF` | Light accent tint              |
| `on-surface`              | `#E5E2E1` | Primary text                   |
| `on-surface-dim`          | `#C8C6C5` | Secondary text                 |
| `on-surface-variant`      | `#B9CACB` | Muted text                     |
| `outline`                 | `#849495` | Borders                        |
| `outline-variant`         | `#3B494B` | Ghost borders (15% opacity)    |

### Typography (current choices, can be swapped)

| Role        | Font          | Usage                       |
| ----------- | ------------- | --------------------------- |
| Headlines   | Manrope       | Section titles, hero text   |
| Body        | Inter         | Paragraphs, descriptions    |
| Labels/Data | Space Grotesk | Stats, codes, terminal text |

**Style:** Uppercase, wide tracking, clinical microcopy (`SYSTEM_INITIATED`, `CASE_STUDY_01`)

### Visual Guidelines (suggestions, not rules)

- **Border radius:** Currently `0px` everywhere — can change if the design direction shifts
- **No-Line Rule:** No 1px borders for sectioning — depth via background color shifts only
- **Ghost Borders:** `outline-variant` at 15% opacity when boundaries are needed
- **Shadows:** Currently avoided, depth via tonal layering. Can be introduced if the aesthetic evolves
- **Icons:** Material Symbols Outlined, weight 200 (ultra-thin) — can switch icon sets
- **Accent usage:** Electric Cyan for interactive elements — accent color can change

## File Structure

```
h:/portfolio/
├── .mcp.json                    — MCP server configurations
├── astro.config.mjs             — Astro config (add framework integrations here)
├── package.json                 — Dependencies
├── tools/
│   ├── awwwards_server.py       — Awwwards MCP server (FastMCP)
│   ├── extract-firefox-cookies.py — Extracts Google cookies from Firefox for Playwright
│   ├── whisk-browser.ts         — Playwright Whisk automation (generate/animate/screenshot)
│   ├── whisk-generate.ts        — Standalone Whisk API script (BROKEN — deprecated API)
│   ├── visual-qa.ts             — Playwright multi-viewport screenshot QA tool
│   └── whisk-server/            — Google Whisk MCP server (Node.js + MCP SDK)
│       ├── package.json
│       ├── tsconfig.json
│       └── src/server.ts        — 8 tools (BROKEN — @rohitaryal/whisk-api deprecated)
├── src/
│   ├── layouts/
│   │   └── Layout.astro         — Base HTML shell, all JS systems (~850 lines)
│   ├── pages/
│   │   └── index.astro          — Kore Canvas composition + camera system (~593 lines)
│   ├── components/
│   │   ├── Header.astro         — Fixed top nav bar (logo = panTo hub button)
│   │   ├── Sidebar.astro        — Left sidebar (desktop only, 256px)
│   │   ├── Hero.astro           — Hero section with HUD overlays
│   │   ├── TechTicker.astro     — Scrolling tech stack ticker
│   │   ├── SectionDivider.astro — Visual section breaks
│   │   ├── CaseStudy.astro      — Reusable project showcase (Archon, Aether, Axon)
│   │   ├── Metrics.astro        — Performance metrics with neural canvas + radar
│   │   ├── Timeline.astro       — DNA helix timeline (6 milestones)
│   │   ├── Contact.astro        — CTA + interactive terminal
│   │   ├── Footer.astro         — Footer with stats + social links + terminal closing
│   │   ├── WorldSelector.astro  — Hub: 3-panel flex accordion world selector
│   │   └── worlds/
│   │       ├── DesignWorld.astro — Creative world (purple palette, entrance animations)
│   │       └── BusinessWorld.astro — Operator world (amber palette, entrance animations)
│   ├── components/react/
│   │   ├── AIPanel.tsx          — AI chat panel (React island, @ai-sdk/react)
│   │   └── generative/         — 5 generative UI components
│   └── styles/
│       └── global.css           — Tailwind v4 @theme tokens, cursor vars, world classes
├── public/
│   ├── generated/               — Whisk-generated + self-hosted project images
│   │   ├── archon-hero.webp     — Archon project visual (self-hosted)
│   │   └── aether-hero.webp     — Aether project visual (self-hosted)
│   └── llm.txt                  — LLM/AI visitor context file
└── dist/                        — Build output (Cloudflare Pages)
```

## Visual Systems (in Layout.astro)

> **These are the current visual effects. They can be replaced, removed, or redesigned.**

All interactive JS systems currently live in `Layout.astro` inline `<script>` tags:

| System                | Description                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Boot Sequence         | Terminal-style startup animation (skippable, sessionStorage-cached)                       |
| Code Rain             | Matrix-style falling characters canvas (dimmed: 0.25 brightness)                          |
| Particle System       | Floating particle background (max 50, low-density)                                        |
| Custom Cursor         | World-aware crosshair cursor (color via --cursor-color CSS var)                           |
| Crosshair Lines       | Mouse-following guide lines (hidden in Design/Business worlds)                            |
| Magnetic Buttons      | Buttons that attract to cursor                                                            |
| 3D Tilt Cards         | Hover-based card tilt effect                                                              |
| GSAP ScrollTrigger    | Heading reveals, clip-path reveals, card staggers (scroller: .kore-world-inner)           |
| Lenis Smooth Scroll   | Smooth scroll wrapper (paused during world transitions)                                   |
| Interactive Terminal  | Working terminal with commands (`help`, `about`, `stack`, `projects`, `contact`, `clear`) |
| Neural Network Canvas | Animated neural network on `#neural-canvas` (paused when tab hidden)                      |
| EMP Rings             | Expanding rings in Contact section                                                        |
| Signal Bars           | WiFi-style animated bars (paused when tab hidden)                                         |
| Metric Card Glow      | Cards glow on mouse proximity                                                             |
| Mobile Menu           | Mobile nav drawer                                                                         |

## Kore Canvas System (in index.astro)

The portfolio uses an infinite canvas architecture inspired by Figma/Miro:

```
#kore-viewport (100vw x 100vh, fixed, overflow: hidden)
  └── #kore-camera (GSAP-driven transform: x, y, scale)
       └── #kore-universe (5000px x 5000px, absolute)
            ├── #kore-node-hub (2500, 2500) — WorldSelector
            ├── #kore-node-tech (3800, 2500) — Tech World (scrollable)
            ├── #kore-node-design (1200, 1200) — Design World
            └── #kore-node-business (3800, 3800) — Business World
```

**Camera system:**

- `panTo(worldId)` — GSAP timeline: exit (opacity+scale) → synapse pulse → camera move → enter (opacity+scale), ~0.95s total
- World accent colors: hub/tech=#00F0FF, design=#C084FC, business=#F59E0B
- Cursor color updates via `--cursor-color` CSS custom property
- Body gets `world-{id}` class for world-specific CSS
- Lenis pauses during transitions, resumes for scrollable worlds
- SVG synapse paths connect nodes (animated stroke-dasharray)

**Navigation:**

- Bottom nav bar (`#kore-nav`) with world buttons
- WorldSelector panel clicks → panTo
- Header logo → panTo('hub') (no page reload)
- Back buttons in Design/Business → panTo('hub')
- Escape key → panTo('hub')
- Window resize → re-center current world

**Mobile (<768px):**

- Canvas disabled, worlds stack vertically
- All positioning becomes relative
- Nav bar hidden, synapses hidden
- Only hub shown (Design/Business hidden via `display: none`)

## Real Data (from GitHub)

| Metric          | Value                      |
| --------------- | -------------------------- |
| Total repos     | 62 (51 public, 11 private) |
| AI agents built | 17                         |
| Archon skills   | 83                         |
| Languages       | 11                         |
| MCP servers     | 5                          |
| GitHub account  | Since May 2020             |
| Copilot agents  | 13 VS Code Copilot agents  |

### Featured Projects

- **Archon** — Cross-platform AI skills framework: 83 skills, 10 agents, 5 platforms. MIT licensed.
- **Aether** — Autonomous multi-agent orchestration: 28 subsystems, Bun + TypeScript. Status: Paused.
- **Axon** — ML/AI-first systems programming language in Rust. Full lexer, parser, borrow checker.

## Key Commands

```bash
npm run dev                    # Start dev server (localhost:4321)
npm run build                  # Production build (outputs to dist/)
npx astro build                # Same as above
npx wrangler pages deploy dist/client --project-name ahmed-taha-portfolio  # Deploy

# Whisk Image Generation (Playwright browser automation)
npm run whisk:generate "prompt text" -- --name filename --aspect square|landscape|portrait
npm run whisk:animate "prompt text" -- --name filename --script "camera motion"
npm run whisk:screenshot         # Debug: screenshot current Whisk state

# Visual QA Screenshots
npm run qa                       # All viewports (375, 768, 1440, 1920)
npm run qa:mobile                # Mobile only (375px)
```

## Tailwind CSS v4 Notes (HARD RULE)

- Uses `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`) — using the wrong one will break the build
- Design tokens defined via `@theme { }` directive in `global.css`
- Custom utilities via `@utility` directive
- Token classes: `bg-surface-dim`, `text-cyan`, `font-headline`, `font-label`, etc.

## Stitch-to-Code Implementation Workflow (HARD RULE)

> **This is the mandatory process for turning Stitch designs, Awwwards research, and design inspiration into production code.**
> Every visual upgrade MUST follow this pipeline. No shortcuts.

### The Pipeline: Research → Visualize → Design → Extract → Build → Verify

#### Phase 1: Research & Inspiration

1. Use Awwwards MCP (`list_portfolios`, `analyze_portfolio`, `extract_css`, `search_awwwards`) to find techniques
2. Use Astro Docs MCP to verify Astro-compatible approaches
3. Document findings: what technique, where it's used, why it's effective

#### Phase 1.5: Visual Prototyping with Whisk (Browser Automation)

> **Note:** The Whisk MCP API is broken. Use the Playwright browser automation instead:
> `npm run whisk:generate "prompt" -- --name filename --aspect square|landscape|portrait`

1. Generate concept visuals via `whisk:generate` with Forensic Monolith prompt keywords
2. For style consistency: use similar prompts with shared aesthetic descriptors
3. Iterate by running generation again with refined prompts
4. Run `caption_image` MCP tool on finals (may still work) — captions become alt text
5. For video backgrounds: generate LANDSCAPE then `whisk:animate` for ambient loops
6. Assets save to `public/generated/` (web-accessible at `/generated/`)

#### Phase 2: Design in Stitch

1. Generate screens in Stitch MCP (`generate_screen_from_text`) with detailed prompts including:
   - Exact colors from the current palette (or proposed new ones)
   - Typography choices with font names
   - Layout structure with grid/flex specifics
   - Animation descriptions (what moves, how, when)
   - Device type (DESKTOP first, then MOBILE)
2. Generate 3-5 variants per concept using `generate_variants`
3. User reviews and picks direction
4. Reference Whisk-generated images in Stitch prompts for contextual UI layouts
5. Use captions from `caption_image` as part of Stitch design briefs
6. Design UI layouts AROUND Whisk-generated visuals (not the other way around)

#### Phase 3: Extract & Translate

1. Fetch the chosen screen HTML via `get_screen` → download URL
2. Extract every reusable pattern:
   - **CSS techniques** → `global.css` as `@theme` tokens or `@utility` directives
   - **Animations** → `@keyframes` in component `<style>` or Svelte transitions
   - **Layout patterns** → Tailwind classes or CSS Grid templates
   - **Color/typography changes** → Update `@theme` tokens in `global.css`
   - **Interactive behaviors** → Determine correct framework per architecture rules
3. Never copy-paste raw Stitch HTML. Translate into proper Astro components with:
   - Semantic HTML
   - Tailwind utility classes (using existing design tokens)
   - Proper `<script>` isolation or framework island components
   - Accessibility attributes (aria-labels, roles, keyboard nav)

#### Phase 4: Build as Astro Components

1. **Check the Framework Selection Rule** — every component goes to the right framework
2. **Static/layout** → `.astro` component (default)
3. **Canvas/WebGL/Three.js** → React island in `src/components/react/`
4. **Scroll animations/transitions** → Svelte island in `src/components/svelte/`
5. **Real-time reactive UI** → SolidJS island in `src/components/solid/`
6. **Data-rich interactive panels** → Vue island in `src/components/vue/`
7. Keep GSAP/Lenis/global scroll in Astro `<script>` tags (Layout.astro), NOT inside framework islands
8. Every component must work without JS first (progressive enhancement)
9. Place Whisk-generated assets in `public/generated/` — reference via `/generated/` web paths
10. Auto-generate alt text via `caption_image` for every generated image used in components
11. For video backgrounds: use `<video autoplay muted loop playsinline>`, lazy-loaded below fold

#### Phase 5: Verify & Polish

1. `npm run build` — must pass with zero errors
2. Test on localhost:4321 — visual check
3. Lighthouse audit — Performance ≥90, Accessibility ≥95
4. Mobile responsive — test at 375px, 768px, 1024px, 1440px, 1920px
5. Check bundle size — no island should exceed 50KB gzipped

### Technique Library (extracted from Stitch + Awwwards research)

These are proven techniques ready to implement. Use them freely:

| Technique                 | Implementation                                                           | Where                   |
| ------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| CSS grid texture overlay  | `background-image: linear-gradient(...)` 40x40px grid at 5% cyan opacity | Any full-bleed section  |
| Radar sweep animation     | `@keyframes rotate` 360° at 4s linear, `transform-origin: center`        | Metrics, status widgets |
| Ultra-thin scrollbar      | `::-webkit-scrollbar` 2px width, cyan thumb, transparent track           | Terminal, code blocks   |
| Surface depth hierarchy   | 5 elevation levels (`#0e0e0e` → `#353535`), no shadows                   | All cards/sections      |
| Status badge system       | Color-coded chips (cyan=active, amber=warning, red=error)                | Project cards, timeline |
| Crosshair cursor          | `cursor: crosshair` global, custom SVG cursor for hover states           | Body element            |
| Monochromatic accent      | Single cyan hue family (#00F0FF → #00DBE9 → #DBFCFF)                     | Accent <5% of screen    |
| Text stroke-to-fill hover | `-webkit-text-stroke` outline → solid fill on hover                      | Hero text, headings     |
| Clip-path section reveals | `clip-path: inset()` animating from closed to open on scroll             | Section transitions     |
| SVG noise grain overlay   | `<svg><filter><feTurbulence>` blended at 3-5% opacity                    | Page-level texture      |
| SplitType text animation  | Character-by-character stagger reveal via GSAP                           | Hero, section headings  |
| Magnetic button effect    | Cursor proximity → button position offset via `transform`                | CTA buttons             |
| Metric bar component      | Label + percentage + animated fill bar                                   | Stats section           |
| Terminal log lines        | Prefixed `[OK]`/`[WARN]`/`>>` with blinking cursor `_`                   | Contact terminal        |
| Grid helper lines         | Full-viewport column guides at 10% opacity                               | Dev/presentation mode   |
| Whisk hero background     | `generate_image` dark clinical void + `refine_image` for grain           | Hero, CaseStudy images  |
| Whisk ambient video loop  | Generate LANDSCAPE → `animate_image` "Slow camera push"                  | Hero background video   |
| Whisk style consistency   | `upload_reference(STYLE)` master image → reuse across all gens           | All generated visuals   |
| Whisk alt text pipeline   | `caption_image` → trim to 125 chars → use as `<img alt="">`              | All `<img>` from Whisk  |

### Quality Bar

**The goal is Awwwards-worthy.** Every component should:

- Have at least one micro-interaction (hover, scroll, or entrance animation)
- Use the surface depth hierarchy — never flat same-color adjacent sections
- Include a data/forensic detail (coordinates, hex codes, timestamps, status indicators)
- Feel like it belongs in a mission control interface, not a corporate template

## Agent & Skill Invocation

### Astro Islands Expert (Skill)

Installed at `~/.claude/skills/astro-islands-expert/SKILL.md`. **Auto-loaded** whenever Astro components are being created or modified. Contains the framework decision matrix, hydration directive guide, Astro config patterns, nanostores cross-framework state, and performance budgets.

### Whisk Workflow Expert (Skill)

Installed at `~/.claude/skills/whisk-workflow/SKILL.md`. **Auto-loaded** when generating visual assets, managing Whisk authentication, or integrating Whisk outputs with Stitch/Awwwards. Contains prompt engineering templates, reference image workflows, cross-MCP pipeline patterns, and cookie refresh process.

### Recommended Agent Patterns

When working on this project, use the Claude Code Agent tool with these patterns:

| Task                                  | Agent Type              | Prompt Pattern                                                          |
| ------------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| Analyze award-winning sites for ideas | `Explore`               | "Use the awwwards MCP tools to analyze [site] and extract techniques"   |
| Research Astro APIs/features          | `Explore`               | "Query the astro-docs MCP server for [topic]"                           |
| Design a new component                | `UI Designer`           | "Design [component] following The Forensic Monolith design system"      |
| Build a React 3D island               | `Frontend Developer`    | "Create a React Three Fiber island at src/components/react/[name].tsx"  |
| Optimize performance                  | `Frontend Developer`    | "Audit island hydration and bundle sizes"                               |
| Review visual quality                 | `UX Researcher`         | "Evaluate the portfolio against Awwwards standards"                     |
| Generate visual assets                | `Image Prompt Engineer` | "Use Whisk MCP to generate [type] matching Forensic Monolith aesthetic" |
| Create ambient video                  | `Image Prompt Engineer` | "Generate a LANDSCAPE image and animate it for [section] background"    |

### Awwwards Workflow

Use the awwwards MCP server tools in this order for inspiration:

1. `list_portfolios` — browse the gallery
2. `analyze_portfolio` — deep-analyze interesting sites
3. `extract_css` — pull raw CSS techniques
4. `search_awwwards` — find sites by technique (e.g., "dark mode", "3d animation")
5. `get_design_ideas` — get curated patterns by category

### Whisk Workflow

> **CRITICAL:** The Whisk MCP server tools (`mcp__whisk__*`) use `@rohitaryal/whisk-api` which is
> **DEPRECATED AND BROKEN**. The `aisandbox-pa.googleapis.com/v1:runImageFx` endpoint returns 401.
> Google is shutting down Whisk on April 30, 2026, replacing it with Google Flow.
>
> **Use the Playwright browser automation instead:**

```bash
npm run whisk:generate "prompt" -- --name output-name --aspect square
npm run whisk:animate "prompt" -- --name output-name --script "Slow camera push"
npm run whisk:screenshot
```

**How it works:**
1. `tools/extract-firefox-cookies.py` reads Google cookies from Firefox profile
2. `tools/whisk-browser.ts` injects cookies into Playwright Chromium
3. Automates the Whisk web UI: fills prompt, clicks Generate, captures result images
4. Saves to `public/generated/` (web-accessible at `/generated/`)

**Known issue (as of 2026-03-29):**
- Image generation works (confirmed via screenshots)
- Image download/collection sometimes fails (CORS on `lh3.googleusercontent.com`)
- Fix needed: use element screenshots (`el.screenshot()`) instead of network fetch
- The `collectImages()` function in whisk-browser.ts needs this fix

**Whisk MCP tools (for reference, currently broken):**
1. `generate_image` — create base visuals
2. `refine_image` — iterate on generated images
3. `caption_image` — generate descriptions for alt text (may still work)
4. `upload_reference` — establish style consistency
5. `generate_with_references` — generate matching style
6. `animate_image` — convert to video loops via Veo 3.1
7. `list_generated` — inventory assets
8. `fetch_media` — re-download by ID

### Full MCP Pipeline (All 5 Servers)

```
Awwwards (Research) → Whisk (Visual Prototyping) → Stitch (UI Layout) → Claude (Code) → Astro (Build)
```

**Use Cases:**

1. **Hero/Section Backgrounds** — Whisk generates dark clinical imagery → Stitch designs layout around it → extract into Astro
2. **Project Visuals** — Whisk generates concept art for Archon/Aether/Axon via reference system → placed in CaseStudy.astro
3. **Texture/Pattern Generation** — Whisk generates noise/grain/grid overlays → saved to public/ → used as CSS `background-image`
4. **Video Backgrounds** — Whisk generates image → animates with Veo 3.1 → ambient hero `<video>`
5. **Style Consistency** — One "style reference" image → reused across all Whisk generations for visual cohesion
6. **Awwwards → Whisk Prototyping** — Find technique on Awwwards → caption with Whisk → generate Forensic Monolith variation
7. **Caption → Stitch Bridge** — Generate image → caption it → use caption as part of Stitch prompt for UI layout
8. **Alt Text Pipeline** — Generate image → auto-caption → use caption as alt text for accessibility (Lighthouse ≥95)

### Visual QA Pipeline

Playwright-based screenshot tool for multi-viewport quality assurance:

```bash
npm run qa                    # Capture all viewports: 375, 768, 1440, 1920
npm run qa:mobile             # Mobile only: 375px
```

**How it works:**
1. Launches headless Chromium, navigates to localhost:4321
2. Skips boot sequence (Escape key)
3. Desktop: navigates to each world via `[data-target]` nav buttons, waits for panTo
4. Mobile: captures full-page stacked layout
5. Saves to `screenshots/` directory (gitignored)

**QA analysis:**
- Claude reads screenshots via multimodal `Read` tool for visual quality feedback
- Feed to `caption_image` MCP tool for Gemini's perspective as second opinion
- File naming: `{world}-{width}x{height}.png`

**Source:** `tools/visual-qa.ts`
