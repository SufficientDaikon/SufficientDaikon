# Ahmed Taha

I build AI that builds software — agent systems that plan, write, and ship production code.
To know what agents should build, I build the hard parts myself: C# in PowerShell's core engine, a language and borrow checker in Rust, local-first AI tools.

## Upstream

Core-engine work on [PowerShell](https://github.com/PowerShell/PowerShell), Microsoft's cross-platform shell (50k+ stars):

- [`New-Guid` defaults to UUID v7](https://github.com/PowerShell/PowerShell/pull/27033) — sortable, timestamp-ordered GUIDs out of the box. **Merged**, June 2026.
- [Wrote the fix for #3028](https://github.com/PowerShell/PowerShell/pull/27111) — the `-WindowStyle Hidden` console window flash, a bug that had been open for eight years with 160+ upvotes when I picked it up.
- [Corrected explicit `$false` on switch parameters](https://github.com/PowerShell/PowerShell/pull/27034) — `Get-Culture -ListAvailable:$false` and `Get-Location -Stack:$false` no longer behave as if the switch were set.
- [Bounded-wait timeouts for the hosting API](https://github.com/PowerShell/PowerShell/pull/27027) — `Stop(TimeSpan)` and invocation-level timeouts across 7 source files, so an embedded runspace can't hang its host forever. Specified in [RFC #409](https://github.com/PowerShell/PowerShell-RFC/pull/409).
- [Six engine fixes](https://github.com/PowerShell/PowerShell/pull/27035) from a static-analysis pass — null dereferences, redundant guards, type narrowing.
- [The `about_Error_Handling` reference](https://github.com/MicrosoftDocs/PowerShell-Docs/pull/12890) for the official documentation. **Merged.**

## Building

- [**Archon**](https://github.com/SufficientDaikon/archon) — a skills engine for AI agents: one skill library with complexity routing from trivial to expert, deployable to Claude Code, GitHub Copilot, and other agent platforms without rewriting a skill.
- [**Axon**](https://github.com/SufficientDaikon/Axon) — an ML-first systems language in Rust. Tensor shapes verified at compile time, memory safety from ownership instead of a garbage collector. Lexer, parser, and borrow checker written from scratch.
- [**Aether**](https://github.com/SufficientDaikon/aether) — multi-agent orchestration across 28 subsystems: a three-tier Master/Manager/Worker hierarchy with context-aware routing and durable workflows, built on Bun and TypeScript.
- [**dissector-agent**](https://github.com/SufficientDaikon/dissector-agent) — reverse-engineers any codebase into 17+ interlinked documents through 13 analysis phases, covering architecture, conventions, APIs, testing, and security.

Smaller, sharper things — [pr-to-course](https://github.com/SufficientDaikon/pr-to-course), which turns any pull request into an interactive course; [daedalus-debugger](https://github.com/SufficientDaikon/daedalus-debugger), which interrogates its own runtime and writes up the report — live in [the full repo list](https://github.com/SufficientDaikon?tab=repositories).

---

[tahaa755@gmail.com](mailto:tahaa755@gmail.com) · [LinkedIn](https://www.linkedin.com/in/ahmed-taha225/)
