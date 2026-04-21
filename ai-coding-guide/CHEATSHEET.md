# 📋 AI-Assisted Coding Cheatsheet

> **Pin this to your desk.** Daily reference for working with AI coding assistants.

---

## 🟢 The Golden Rules

| Rule                       | Why                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Be specific, not vague** | "Add input validation" → bad. "Add email format validation using regex, return 422 with error details" → good.        |
| **Give context first**     | Tell the AI what the code does, what stack you're using, what constraints exist — BEFORE asking it to write anything. |
| **Iterate, don't restart** | Build on previous responses. The AI has memory within a session.                                                      |
| **Review everything**      | AI writes confident-looking code. It can still be wrong. YOUR experience is the quality gate.                         |
| **Commit frequently**      | AI changes lots of files fast. Small commits = easy rollbacks.                                                        |

---

## 🎯 Prompt Templates (Copy-Paste Ready)

### Writing New Code

```
I need a [component/function/class] that:
- Does [specific behavior]
- Accepts [these inputs] and returns [this output]
- Handles these edge cases: [list them]
- Follows [naming convention / pattern]

The existing codebase uses [framework/language/style].
Here's a similar example from our codebase: [paste or reference]
```

### Debugging

```
This code is [describe the bug — what you expected vs what happened].

Here's the relevant code: [paste it]
Here's the error: [paste the error/stack trace]
I've already tried: [what you've ruled out]

What's causing this and how do I fix it?
```

### Refactoring

```
Refactor this [function/class/module] to:
- [specific goal: extract method, reduce complexity, etc.]
- Keep the same public API / behavior
- Don't change [specific things to preserve]

Here's the current code: [paste it]
```

### Code Review

```
Review this code for:
- Bugs or logic errors
- Performance issues
- Security vulnerabilities
- Deviation from [our patterns/conventions]

Don't comment on style or formatting.
Here's the code: [paste it]
```

### Writing Tests

```
Write [unit/integration/e2e] tests for this [function/class]:
[paste the code]

Cover:
- Happy path with [these inputs]
- Edge cases: [list specific ones]
- Error cases: [list specific ones]

Use [test framework] with [assertion style].
Match this test file's style: [reference existing test]
```

### Explaining Legacy Code

```
Explain what this code does, step by step.
Focus on the business logic, not the syntax.
Highlight any potential bugs or code smells.
Note any implicit assumptions the code makes.

[paste the code]
```

---

## ⚡ Quick Patterns

| I Want To...               | Say This                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Generate boilerplate       | "Create a [REST endpoint / React component / DB migration] for [entity] with [fields]"                    |
| Write a commit message     | "Write a conventional commit message for these changes: [describe or show diff]"                          |
| Understand unfamiliar code | "Walk me through this code. What does it do and why?"                                                     |
| Find bugs                  | "What could go wrong with this code? Think adversarially."                                                |
| Optimize performance       | "Profile this code conceptually. Where are the bottlenecks and how do I fix them?"                        |
| Write documentation        | "Write JSDoc/docstring for this function. Include params, return type, throws, and a usage example."      |
| Convert between formats    | "Convert this [YAML/JSON/XML/CSV] to [target format], preserving [specific structure]"                    |
| Regex help                 | "Write a regex that matches [pattern]. Explain each part. Give 3 test cases that match and 3 that don't." |

---

## 🚦 When to Use AI vs. When to Code by Hand

### ✅ Use AI For:

- **Boilerplate & scaffolding** — CRUD endpoints, component shells, config files
- **Tests** — generating test cases, especially edge cases you might miss
- **Refactoring** — renaming, extracting methods, pattern transformations
- **Documentation** — JSDoc, README sections, API docs
- **Translation** — porting code between languages/frameworks
- **Explaining** — understanding unfamiliar codebases or legacy code
- **Regex & SQL** — complex patterns you'd normally Google

### 🚫 Code by Hand When:

- **Core architecture decisions** — AI doesn't know your system's constraints
- **Security-critical code** — auth, crypto, access control (AI can draft, YOU must verify)
- **Performance-critical hot paths** — AI optimizations can be naive
- **Novel algorithms** — if it's truly new, AI has no training data for it
- **Business logic that requires domain expertise** — AI doesn't know your business rules

---

## 🔄 The AI-Assisted Workflow Loop

```
1. THINK    → What do I need? What are the constraints?
2. PROMPT   → Tell the AI specifically what you want
3. REVIEW   → Read every line. Does it match your intent?
4. REFINE   → "Change X to Y" or "Also handle the case where..."
5. TEST     → Run it. Does it actually work?
6. COMMIT   → Small, focused commits with clear messages
```

---

## 🧠 Context-Setting Shortcuts

Start every new session or major task with a context block:

```
## Context
- Project: [name] — [one-line description]
- Stack: [language, framework, DB, etc.]
- File I'm working in: [path]
- What I'm doing: [task description]
- Constraints: [time, performance, backwards compat, etc.]
```

This saves you from getting generic responses that don't fit your project.

---

## ⚠️ Red Flags in AI Output

Stop and review carefully if you see:

| Red Flag                                             | Risk                     |
| ---------------------------------------------------- | ------------------------ |
| AI says "this should work" without showing why       | It's guessing            |
| Generated code doesn't handle errors                 | Missing edge cases       |
| Suspiciously simple solution to a complex problem    | Probably incomplete      |
| Code uses deprecated APIs or old patterns            | Training data cutoff     |
| New dependencies added without you asking            | Unnecessary bloat        |
| AI rewrites working code you didn't ask it to change | Scope creep              |
| Comments say one thing, code does another            | Copy-paste hallucination |

---

_Keep this next to your terminal. Update it as you learn what works for YOU._
