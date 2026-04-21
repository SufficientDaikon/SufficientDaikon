# 🔄 Day-to-Day Workflow Guide

> **How to actually integrate AI into your daily development workflow.** Not theory — real sequences of actions for real tasks.

---

## Workflow 1: Feature Development (Start to PR)

### Phase 1 — Plan (You + AI as sounding board)

```
1. Read the requirements / ticket
2. Sketch your approach mentally or on paper
3. Ask the AI to challenge your design:

   "I'm implementing [feature]. My plan is:
   1. [approach step 1]
   2. [approach step 2]
   3. [approach step 3]

   What failure modes or edge cases am I missing?"

4. Refine your plan based on feedback
```

### Phase 2 — Scaffold (AI does the heavy lifting)

```
1. Set context:
   "Project: [name], Stack: [stack], I'm working on [feature]"

2. Generate the skeleton:
   "Create [files/components/endpoints] for [feature] following [pattern]"

3. Review the output — check:
   □ File structure makes sense
   □ Naming matches your conventions
   □ No unnecessary dependencies added
   □ Types/interfaces look right
```

### Phase 3 — Implement (You direct, AI writes)

```
1. Work function-by-function or component-by-component
2. For each piece:
   - Describe the specific behavior you want
   - Reference existing patterns: "Like the UserService does it"
   - Specify edge cases explicitly
3. Review each piece before moving to the next
4. Commit after each working piece
```

### Phase 4 — Test (AI generates, you specify)

```
1. "Write tests for [function]. Cover these cases: [list them]"
2. Review the tests — do they test what matters?
3. Run the tests — do they pass?
4. "Add a test for the case where [edge case you thought of]"
5. Commit the tests
```

### Phase 5 — Polish & PR (You + AI for cleanup)

```
1. "Review all the changes I've made for bugs or issues"
2. Fix anything found
3. "Write a PR description covering: what changed, why, how to test"
4. Submit PR
```

---

## Workflow 2: Bug Fix

```
Step 1: Reproduce & Gather Evidence
- Get the error log, stack trace, or reproduction steps
- Identify the relevant code

Step 2: Ask AI to Diagnose
  "This is failing with [error].
   Here's the code: [paste]
   Here's the error: [paste]
   I've checked [X] and [Y] — those aren't the issue.
   What's causing this?"

Step 3: Evaluate the Diagnosis
- Does the explanation make sense?
- Does it match what you're seeing?
- If not, provide more context and re-ask

Step 4: Get the Fix
  "Fix this by [your preferred approach]. Minimal change only."

Step 5: Write a Regression Test
  "Write a test that would have caught this bug.
   The bug was: [description]
   The fix was: [description]"

Step 6: Commit with Context
  "Write a commit message explaining this bug fix.
   Include: what was broken, root cause, what changed."
```

---

## Workflow 3: Code Review (Using AI as Co-Reviewer)

```
Step 1: First Pass (You)
- Read the PR yourself first
- Form your own opinions about the changes
- Note things you're unsure about

Step 2: AI Review (Targeted)
  "Review this diff for:
   1. Bugs or logic errors
   2. Security issues
   3. Missing error handling
   Don't comment on style."

   [paste the diff or key sections]

Step 3: Compare
- Does the AI catch anything you missed?
- Does YOUR experience catch things the AI missed?
- Combine both into your review

Step 4: Post Your Review
- Write the review in YOUR voice
- Don't just paste AI feedback — synthesize it with your own observations
```

> **⚠️ Never submit an AI-generated code review verbatim.** Your colleagues deserve your actual judgment, not a bot's output. Use AI to augment your review, not replace it.

---

## Workflow 4: Understanding a New Codebase

```
Step 1: High-Level Overview
  "Explain the architecture of this project based on:
   - The directory structure: [paste tree output]
   - The main entry point: [paste]
   - The package.json/go.mod/requirements.txt: [paste]

   Focus on: data flow, major components, external dependencies."

Step 2: Drill Into Specific Areas
  "Explain what this module does and how it fits into the larger system:
   [paste the module's main file]

   I already understand [things you've learned so far]."

Step 3: Map the Dependencies
  "What calls this function? What does it depend on?
   Trace the call chain from [entry point] to [this function]."

Step 4: Find the Gotchas
  "What are the implicit assumptions in this code?
   What would break if I changed [specific thing]?"
```

---

## Workflow 5: Refactoring Legacy Code

```
Step 1: Understand Before You Touch
  "Explain this code. What does it do and why?
   Highlight any implicit assumptions or hidden side effects."

Step 2: Write Tests for Current Behavior FIRST
  "Write characterization tests for this function.
   These tests should capture what the code CURRENTLY does,
   not what it SHOULD do. Include weird edge cases."

Step 3: Plan the Refactor
  "I want to refactor this to [goal].
   Break it into safe, individually testable steps.
   Each step must leave the code working."

Step 4: Execute Step by Step
  For each step:
  - Let AI make the change
  - Review the change
  - Run the characterization tests (they should still pass)
  - Commit

Step 5: Update Tests for New Behavior
  - Modify tests to reflect intended behavior
  - Run them — they should fail
  - Make the behavioral change
  - Run them — they should pass
  - Commit
```

---

## Workflow 6: Learning a New Technology

```
Step 1: Anchored Explanation
  "Explain [new technology] to me.
   I'm an expert in [your existing knowledge].
   Map concepts from [what I know] to [what I'm learning].
   For example, how does [new concept] compare to [familiar concept]?"

Step 2: Guided Implementation
  "I'm building a [small project] to learn [technology].
   Walk me through it step by step.
   After each step, explain WHY, not just HOW.
   Use idiomatic [technology] patterns, not [my old language] patterns translated."

Step 3: Code Review Your Learning Code
  "Review this code I wrote while learning [technology].
   Am I doing anything non-idiomatic?
   What patterns should I change to be more [technology]-native?"
```

---

## Daily Habits for AI-Assisted Development

### Morning (2 minutes)

```
- Open your project's CLAUDE.md / memory file
- Update it if anything changed (new decisions, deprecated patterns, etc.)
- This keeps your AI context fresh
```

### During Work

```
- Commit after every working change (AI makes big changes fast — protect yourself)
- When you catch AI making a mistake, note the pattern → refine future prompts
- When AI writes something great, save the prompt → your personal pattern library
```

### End of Day (2 minutes)

```
- Review what you built today
- Update documentation if the AI helped you build something new
- Note any prompts that worked exceptionally well or poorly
```

---

## Common Workflow Questions

### "How do I know when to use AI vs. just code it myself?"

**Use this heuristic:**

- If you could write it in under 2 minutes → just write it
- If it's boilerplate or repetitive → AI
- If it requires deep domain knowledge → write it, use AI to review
- If it's complex but well-defined → AI with careful review
- If it's ambiguous → think first, then AI

### "How do I handle AI-generated code in PRs?"

- **Do** mention AI was used if your team has a policy
- **Do** review every line as if another human wrote it
- **Don't** commit code you don't understand
- **Don't** use "the AI wrote it" as an excuse for bugs

### "What about pair programming with AI?"

AI doesn't replace human pair programming. It serves a different role:

- **Human pair:** Creative collaboration, shared understanding, teaching
- **AI pair:** Fast implementation, breadth of knowledge, tireless code generation

Use both. They complement each other.

---

_Next: [PITFALLS.md](PITFALLS.md) — What goes wrong and how to avoid it._
