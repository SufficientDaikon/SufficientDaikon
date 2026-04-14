<div align="center">
  <img src="./assets/header.svg" width="100%" alt="Ahmed Taha — AI Agent Architect" />
</div>

<br/>

I build autonomous systems that build software. Not wrappers around ChatGPT — actual multi-agent orchestration with cognitive architectures, skill routing, and self-improving feedback loops.

Currently shipping production code to [**PowerShell/PowerShell**](https://github.com/PowerShell/PowerShell) (52K stars) — not just issues, actual engine-level PRs that fix 8-year-old bugs and add new timeout APIs.

<div align="center">
  <a href="https://www.linkedin.com/in/ahmed-taha225/"><kbd>LinkedIn</kbd></a>&nbsp;&nbsp;
  <a href="mailto:tahaa755@gmail.com"><kbd>Email</kbd></a>&nbsp;&nbsp;
  <a href="https://github.com/SufficientDaikon"><kbd>GitHub</kbd></a>
</div>

<br/>

<img src="./assets/divider.svg" width="100%" alt="" />

<br/>

## What I Actually Build

<table>
<tr>
<td width="50%" valign="top">

### Archon — AI Skills Engine

The core of everything I ship. 83 skills, 10 agents, 5 cognitive synapses. Write a skill once, deploy it on Claude Code, VS Code Copilot, Antigravity, and 2 more platforms.

Not a chatbot framework. A **cognitive architecture** with enforced guardrails, complexity routing (TRIVIAL→EXPERT), and a virtuoso execution loop that prevents hallucination cascades.

**[`archon`](https://github.com/SufficientDaikon/archon)** — Python · 83 skills · MIT

</td>
<td width="50%" valign="top">

### Axon — ML-First Systems Language

A programming language designed from scratch for machine learning. Compile-time tensor shape verification, ownership-based memory safety (like Rust), native GPU execution.

If Python + Rust had a child raised by CUDA engineers, this is what you'd get.

**[`Axon`](https://github.com/SufficientDaikon/Axon)** — Rust · Compiler + Runtime

</td>
</tr>
<tr>
<td width="50%" valign="top">

### HugBrowse — Local AI Platform

Browse, download, and run Hugging Face models locally. Privacy-first — nothing leaves your machine. Built with Tauri v2 (Rust backend) + React frontend. GGUF quantized model support.

**[`hugbrowse`](https://github.com/SufficientDaikon/hugbrowse)** — TypeScript + Rust · Tauri v2

</td>
<td width="50%" valign="top">

### Aether — Agent Orchestration

Multi-agent LLM coordination with 28 subsystems. Agents negotiate, delegate, and self-correct. Built on Bun for raw speed.

Currently paused — the architecture is solid but waiting for the right moment to ship.

**[`aether`](https://github.com/SufficientDaikon/aether)** — TypeScript · Bun · 28 subsystems

</td>
</tr>
</table>

<details>
<summary><strong>More things I've shipped</strong></summary>
<br/>

| Project | What it does |
|---------|-------------|
| **[sdd-vscode-agents](https://github.com/SufficientDaikon/sdd-vscode-agents)** | 13 Copilot Chat agents for spec-driven development — from research to production code with quality gates |
| **[axios-scanner](https://github.com/SufficientDaikon/axios-scanner)** | One-click scanner for the axios npm supply chain attack (March 2026). Detects RAT artifacts, C2 connections, persistence |
| **[daedalus-debugger](https://github.com/SufficientDaikon/daedalus-debugger)** | Autonomous AI environment debugger — probes hardware, MCP servers, model capabilities. Self-contained HTML report |
| **[godot-kit](https://github.com/SufficientDaikon/godot-kit)** | AI-powered Godot 4.x development bundle — 9 skill packs, 4 MCP servers |
| **[dissector-agent](https://github.com/SufficientDaikon/dissector-agent)** | Reverse-engineers any codebase into 17+ interlinked documentation files through 13 analysis phases |
| **[adaptive-teacher](https://github.com/SufficientDaikon/adaptive-teacher)** | AI teaching skill that calibrates to learner level in real-time — Socratic questioning, reverse prompting, Egyptian Arabic support |
| **[feinix-os](https://github.com/SufficientDaikon/feinix-os)** | Feinix — research architecture for an AI-first operating system |
| **[pr-to-course](https://github.com/SufficientDaikon/pr-to-course)** | Transform any GitHub PR into an interactive HTML course |
| **[copilot-sdk-dissection](https://github.com/SufficientDaikon/copilot-sdk-dissection)** | 14-phase architectural dissection of GitHub's copilot-sdk with interactive docs site |

</details>

<br/>

<img src="./assets/divider.svg" width="100%" alt="" />

<br/>

## Open Source Impact

These aren't drive-by typo fixes. Each PR modifies core engine code in a project with 52K+ stars:

| PR | What I Changed | Status |
|----|---------------|--------|
| [**Bounded-wait timeouts**](https://github.com/PowerShell/PowerShell/pull/27027) | Added `Stop(TimeSpan)`, `PSInvocationSettings.Timeout`, runspace/pipeline/connection timeouts across 7 source files. Includes RFC. | Open |
| [**WindowStyle Hidden fix**](https://github.com/PowerShell/PowerShell/pull/27111) | Fixed #3028 (8 years open, 160+ upvotes) — eliminated console window flash when launching with `-WindowStyle Hidden` | Open |
| [**UUID v7 default**](https://github.com/PowerShell/PowerShell/pull/27033) | Changed `New-Guid` to generate UUID v7 by default — monotonic, sortable, timestamp-embedded | Open |
| [**Static analysis fixes**](https://github.com/PowerShell/PowerShell/pull/27035) | Fixed 6 PVS-Studio findings across the engine | Open |
| [**Error handling docs**](https://github.com/MicrosoftDocs/PowerShell-Docs/pull/12890) | Added `about_Error_Handling` and fixed error terminology across docs | **Merged** |

<br/>

<img src="./assets/divider.svg" width="100%" alt="" />

<br/>

## How I Work

<!-- lowlighter/metrics renders these — they auto-update daily via GitHub Actions -->
<!-- If you see broken images, the metrics workflow needs a METRICS_TOKEN secret (GitHub PAT with read:user scope) -->

<div align="center">

**Isometric Contribution Calendar**

<img src="./assets/metrics/isocalendar.svg" width="100%" alt="Isometric contribution calendar — shows commit density across the full year in a 3D isometric view" />

</div>

<br/>

<table>
<tr>
<td width="50%" align="center">

**Coding Habits**

<img src="./assets/metrics/habits.svg" width="100%" alt="Coding habits — when I code, how often, activity patterns" />

</td>
<td width="50%" align="center">

**Languages (indepth)**

<img src="./assets/metrics/languages.svg" width="100%" alt="Language breakdown — analyzed from actual repo content, not just file extensions" />

</td>
</tr>
</table>

<table>
<tr>
<td width="50%" align="center">

**Lines of Code History**

<img src="./assets/metrics/lines.svg" width="100%" alt="Lines of code added vs removed over time" />

</td>
<td width="50%" align="center">

**Notable Contributions**

<img src="./assets/metrics/notable.svg" width="100%" alt="Contributions to notable repositories — repos with significant star counts" />

</td>
</tr>
</table>

<br/>

<img src="./assets/divider.svg" width="100%" alt="" />

<br/>

## Commit Invaders

Your contribution graph is boring. Mine fights back.

<!-- Generated by Goblinlordx/commit-invaders — contributions become Space Invaders enemies, pure CSS animation -->
<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SufficientDaikon/SufficientDaikon/output/commit-invaders-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/SufficientDaikon/SufficientDaikon/output/commit-invaders.svg" />
  <img alt="Commit Invaders — my contributions turned into a Space Invaders game" src="https://raw.githubusercontent.com/SufficientDaikon/SufficientDaikon/output/commit-invaders-dark.svg" width="100%" />
</picture>
</div>

<br/>

<div align="center">
  <img src="./assets/footer.svg" width="100%" alt="" />
</div>
