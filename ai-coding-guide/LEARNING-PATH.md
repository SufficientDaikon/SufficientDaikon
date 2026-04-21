# 🗺️ Learning Path: From Skeptic to Power User

> **A structured progression for senior developers adopting AI-assisted development.**
> Inspired by the [claude-howto Learning Roadmap](https://github.com/luongnv89/claude-howto/blob/main/LEARNING-ROADMAP.md).

---

## 🧭 Self-Assessment: Where Are You?

Be honest. There's no shame in being at Level 0 — everyone starts somewhere.

| Statement                                                                     | ✓   |
| ----------------------------------------------------------------------------- | --- |
| I've used an AI coding tool at least once (ChatGPT, Copilot, Claude, etc.)    |     |
| I can write a prompt that gets useful code output most of the time            |     |
| I know when to use AI vs. code by hand for a given task                       |     |
| I have a system for reviewing AI-generated code before committing             |     |
| I use project-level context (CLAUDE.md, .cursorrules, etc.) to improve output |     |
| I've integrated AI into my CI/CD or automation workflows                      |     |
| I've built custom commands, skills, or MCP tools for my workflow              |     |
| I regularly teach or mentor others on AI-assisted development                 |     |

| Score | Level                           | Start At |
| ----- | ------------------------------- | -------- |
| 0-1   | **Level 0:** Skeptic / Observer | Phase 1  |
| 2-3   | **Level 1:** Experimenter       | Phase 2  |
| 4-5   | **Level 2:** Practitioner       | Phase 3  |
| 6-8   | **Level 3:** Power User         | Phase 4  |

---

## Phase 1: First Contact (Week 1)

**Goal:** Get your first AI-assisted win. Prove to yourself that it's useful.

**Mindset shift:** You're not "giving up control." You're gaining a tool.

### Day 1-2: Try It on Something Low-Stakes

Pick a task that doesn't matter much:

- [ ] Write unit tests for an existing function
- [ ] Generate JSDoc/docstrings for a module
- [ ] Convert a config file from one format to another
- [ ] Explain a piece of legacy code you've been avoiding

**Prompt to try:**

```
Write unit tests for this function. Use [your test framework].
Cover the happy path and these edge cases: [list 3].

[paste the function]
```

### Day 3-4: Use It for Boilerplate

The least controversial use case. Let AI handle the boring stuff:

- [ ] Generate a CRUD endpoint / REST controller
- [ ] Scaffold a new component with your project's patterns
- [ ] Create database migration files
- [ ] Write error handling boilerplate

### Day 5: Reflect

Ask yourself:

- What worked well?
- What output did I have to fix?
- Was I faster or slower than coding by hand?
- What would have made the AI output better?

**Success criteria:** You've used AI for at least 3 real tasks and formed your own opinion about where it helps.

---

## Phase 2: Building the Habit (Weeks 2-3)

**Goal:** Integrate AI into your daily workflow for appropriate tasks.

**Mindset shift:** From "I'll try AI" to "Is this an AI task or a hand-coding task?"

### Week 2: The Prompt Refinement Loop

- [ ] Read [PROMPTING-PATTERNS.md](PROMPTING-PATTERNS.md) — pick 3 patterns to practice
- [ ] Use the **Context-First Prompt** pattern for every session
- [ ] Use the **Specification Prompt** pattern for new code
- [ ] Use the **Surgical Edit** pattern for modifications
- [ ] When output is wrong, refine the prompt instead of manually fixing
- [ ] Save prompts that worked well — start your personal library

### Week 3: The Review Discipline

- [ ] Read [PITFALLS.md](PITFALLS.md) — internalize the top 5
- [ ] For every AI-generated code block, check:
  - Does it use functions/modules that actually exist?
  - Are the imports correct?
  - Does it handle errors?
  - Did it change anything I didn't ask for?
- [ ] Practice: "Just the code, no explanation" to save time
- [ ] Practice: asking for code review of YOUR hand-written code

**Success criteria:** You naturally reach for AI for boilerplate and tests without thinking about it. You catch AI mistakes before they reach your commits.

---

## Phase 3: Systematic Workflows (Weeks 4-6)

**Goal:** Build repeatable AI-assisted workflows for complex tasks.

**Mindset shift:** From individual prompts to **choreographed workflows**.

### Week 4: Feature Development Workflow

- [ ] Read [WORKFLOW-GUIDE.md](WORKFLOW-GUIDE.md)
- [ ] Implement one full feature using the Feature Development workflow:
  1. Plan with AI as sounding board
  2. Scaffold with AI
  3. Implement piece by piece with review
  4. Generate tests
  5. Polish and PR
- [ ] Time yourself — compare to your pre-AI pace
- [ ] Note which phases benefited most from AI

### Week 5: Project-Level Context

- [ ] Set up your project memory file (CLAUDE.md, .cursorrules, or equivalent)
- [ ] Include: stack, patterns, conventions, constraints, recent decisions
- [ ] Test: does the AI output match your project's style without you specifying it each time?
- [ ] Share the context file with your team (commit it to the repo)

### Week 6: Code Review Augmentation

- [ ] Use AI as a co-reviewer for 3 PRs this week
- [ ] Compare: what did the AI catch that you missed?
- [ ] Compare: what did YOU catch that the AI missed?
- [ ] Develop your blended review process

**Success criteria:** You have a repeatable workflow for features, bugs, and reviews. Your project has a memory file. You're measurably faster on appropriate tasks.

---

## Phase 4: Power User Territory (Months 2-3)

**Goal:** Customize your tools, automate your workflow, and teach others.

**Mindset shift:** From "using AI" to **"building AI-enhanced systems."**

### Custom Commands & Skills

- [ ] Create 3-5 custom slash commands for your most common tasks:
  - `/review` — your code review checklist
  - `/test` — your test generation template
  - `/commit` — your commit message format
  - `/deploy` — your deployment checklist
- [ ] Build a custom skill for your domain (if using Claude Code / Copilot CLI)

### Tool Integration (MCP / Extensions)

- [ ] Connect your AI tool to external services:
  - GitHub — PR creation, issue management
  - Database — query and schema exploration
  - Documentation — your internal docs as context
  - CI/CD — trigger builds and read results
- [ ] Set up hooks or automation for:
  - Pre-commit checks via AI
  - Automated test generation on file change
  - PR description generation

### CI/CD Integration

- [ ] Add AI-powered code review to your CI pipeline
- [ ] Set up automated documentation generation
- [ ] Create AI-assisted triage for failing tests:
  ```bash
  # Example: pipe test failures to AI for analysis
  npm test 2>&1 | ai-tool "Analyze these test failures. Group by root cause."
  ```

### Teaching & Mentoring

- [ ] Share what you've learned with your team
- [ ] Create a team prompt library (shared repo of effective prompts)
- [ ] Establish team guidelines for AI-assisted development:
  - When to use AI, when not to
  - Review standards for AI-generated code
  - How to handle AI in PRs (disclose? always? only for significant portions?)
- [ ] Mentor one colleague through Phases 1-2

**Success criteria:** Your AI workflow is customized to your project, integrated into your pipeline, and your team is following shared AI development practices.

---

## 📊 Progress Tracking

### Metrics to Watch (Be Honest With Yourself)

| Metric                             | Phase 1           | Phase 2 | Phase 3       | Phase 4       |
| ---------------------------------- | ----------------- | ------- | ------------- | ------------- |
| % of tasks where AI saves time     | 20-30%            | 40-50%  | 60-70%        | 70-80%        |
| Avg prompts to get useful output   | 4-5               | 2-3     | 1-2           | 1             |
| Bugs from AI code caught in review | Many              | Some    | Few           | Rare          |
| Time spent reviewing AI output     | 50% of time saved | 30%     | 20%           | 15%           |
| Team adoption                      | Just you          | 2-3     | Half the team | Team standard |

### Signs You're Growing

- ✅ You know exactly when AI will help and when it won't
- ✅ Your prompts are specific enough to get good output on the first try
- ✅ You catch AI mistakes faster than you catch human mistakes in PR review
- ✅ You've stopped being impressed by AI output and started being critical
- ✅ You're faster at the things AI helps with AND you still write great code by hand
- ✅ Junior devs ask you how to use AI effectively

### Signs You're in a Rut

- ❌ You accept AI output without reading every line
- ❌ You can't write the code by hand anymore (skill atrophy)
- ❌ Every prompt is vague ("make this better", "fix this")
- ❌ You fight the AI instead of iterating (re-prompting 10+ times)
- ❌ You use AI for everything, including 2-line changes

---

## 🎓 Continuing Education

### Resources Referenced in This Guide

| Resource                                                                                                      | What It Covers                                |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [claude-howto Learning Roadmap](https://github.com/luongnv89/claude-howto/blob/main/LEARNING-ROADMAP.md)      | Comprehensive Claude Code feature walkthrough |
| [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering) | Official guide to writing effective prompts   |
| [GitHub Copilot Documentation](https://docs.github.com/en/copilot)                                            | Copilot-specific features and workflows       |

### Practice Exercises

**Exercise 1: The Prompt Improvement Challenge**
Take a vague prompt you've used. Rewrite it 3 times, each more specific than the last. Compare the outputs.

**Exercise 2: The Review Drill**
Have AI generate 100 lines of code. Set a timer for 3 minutes. Find as many issues as you can. This builds your review speed.

**Exercise 3: The Handoff Test**
Use AI to generate a complete module. Give it to a colleague with no context. If they can understand and maintain it, the AI did well. If not, your prompts need work.

**Exercise 4: The Speed Run**
Pick a feature you've built before. Build it again using AI. Time it. Compare quality. Learn where AI accelerates you and where it slows you down.

**Exercise 5: The Teaching Test**
Explain your AI workflow to a non-technical colleague. If you can explain when and why you use it, you truly understand it. If you can only explain "it writes code for me" — dig deeper.

---

## The Final Word

AI-assisted development is not a fad. It's not a replacement for your skills. It's a permanent shift in how software is built — like IDEs, version control, and CI/CD were before it.

The senior developers who thrive are those who:

1. **Adopt early** but **adopt thoughtfully**
2. **Stay critical** — never stop reviewing, never stop thinking
3. **Invest in their craft** — AI makes good developers better, not bad developers good
4. **Share what they learn** — the whole team benefits

You've been writing code for years. Now you're going to write it faster, with fewer bugs, and with more time for the interesting problems.

Welcome to the next chapter.

---

_Back to: [README.md](README.md) — Start from the beginning._
