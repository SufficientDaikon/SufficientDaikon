# 🧠 Mental Models for AI-Assisted Development

> **The hardest part isn't learning the tools — it's changing how you think about work.**

This document covers the paradigm shifts that senior developers need to internalize. These aren't tips — they're fundamental changes in how you approach software development when AI is in the loop.

---

## Mental Model #1: You Are Now a Technical Director

### The Old Way

```
You → Think → Write Code → Debug → Ship
```

### The New Way

```
You → Think → Direct AI → Review → Refine → Ship
```

**What changed:** You moved from being an individual contributor who writes every line to being a **technical director** who specifies intent, reviews output, and makes judgment calls.

This doesn't make you less of an engineer. A film director isn't less of a filmmaker because they don't personally operate every camera.

**The skill that matters most now:** Your ability to **precisely articulate what you want** and **quickly evaluate whether you got it**. Both of these require deep expertise — which you already have.

---

## Mental Model #2: Prompts Are Specs, Not Wishes

Think of every prompt as a **mini specification document**. The same principles apply:

| Spec Principle              | Prompt Equivalent                            |
| --------------------------- | -------------------------------------------- |
| Clear requirements          | Specific, measurable instructions            |
| Defined scope               | Explicit boundaries ("don't change X")       |
| Acceptance criteria         | "It should handle these cases: ..."          |
| Non-functional requirements | "Must be O(n)", "Must not add dependencies"  |
| Context / background        | Project info, existing patterns, constraints |

**Bad prompt** (vague wish):

> "Make this API better."

**Good prompt** (mini spec):

> "Refactor the `/users` endpoint to:
>
> - Use pagination (cursor-based, 50 per page)
> - Add input validation for email format and name length (1-100 chars)
> - Return proper 422 errors with field-level error messages
> - Keep the existing response shape for backwards compatibility
> - Use the same validation approach as the `/orders` endpoint"

The AI is extremely literal. The more precisely you spec it, the better the output.

---

## Mental Model #3: Conversations, Not Commands

AI coding isn't like running a CLI command where you type once and get output. It's a **conversation** — an iterative refinement loop.

```
Turn 1: "Create a rate limiter middleware"
Turn 2: "Use a sliding window algorithm instead of fixed window"
Turn 3: "Add per-user limits, not just global"
Turn 4: "Store the counters in Redis, here's our Redis client pattern: [paste]"
Turn 5: "Add unit tests — mock the Redis client"
```

Each turn builds on the last. The AI remembers the full conversation. Use that.

**Key insight:** You don't need to write the perfect prompt on turn 1. Start broad, then narrow. It's faster to iterate than to craft a perfect one-shot prompt.

---

## Mental Model #4: The 80/20 of AI Coding

AI handles ~80% of the implementation work well:

- Boilerplate, scaffolding, CRUD
- Standard patterns (auth, validation, error handling)
- Tests (especially covering edge cases)
- Documentation, comments, types
- Refactoring known patterns

The remaining ~20% is where **your expertise is critical**:

- System design and architecture decisions
- Choosing the right abstractions
- Performance optimization for your specific workload
- Security review (the AI will miss subtle vulnerabilities)
- Business logic correctness (the AI doesn't know your domain)

**Don't fight the 80/20.** Let AI handle the 80% fast, then spend your senior-level expertise on the 20% that matters.

---

## Mental Model #5: Trust But Verify (The Review Muscle)

Your instinct as a senior dev is to trust code you wrote because you understand every line. With AI-generated code, you need to adopt a **PR review mindset** — even for code you directed.

### The Verification Checklist

```
□ Does it do what I asked? (Not what I literally said — what I MEANT)
□ Does it handle errors and edge cases?
□ Does it follow our project's patterns?
□ Are there unnecessary dependencies or imports?
□ Is it over-engineered? (AI loves to add abstractions)
□ Does it actually compile/run?
□ Did it change anything I didn't ask it to change?
□ Are the types correct? (AI often plays fast and loose with types)
```

**Pro tip:** The AI is excellent at generating code that _looks_ correct. Your job is to think about what it _didn't_ do — the missing error handler, the race condition, the edge case.

---

## Mental Model #6: Context Is King

The single biggest factor in AI output quality is **how much context you provide**.

### The Context Hierarchy (most to least impactful)

1. **Project-level context** — CLAUDE.md, README, architecture docs
   - Set once, applies to all conversations
   - "This is a TypeScript monorepo using NestJS, PostgreSQL, and Redis"

2. **Task-level context** — what you're working on right now
   - "I'm implementing the password reset flow"
   - "This is a high-traffic endpoint (10k req/s)"

3. **Code context** — the actual code being discussed
   - Paste relevant files, interfaces, schemas
   - Reference existing patterns: "Do it like the UserService"

4. **Constraint context** — what NOT to do
   - "Don't add new dependencies"
   - "Keep backwards compatibility with v2 API"
   - "Must work on Node 18"

**Most senior devs under-invest in context.** They assume the AI "knows" their project. It doesn't. Spend 30 seconds setting context, save 10 minutes of bad output.

---

## Mental Model #7: The Rubber Duck Got an Upgrade

You've used rubber duck debugging before — explaining a problem out loud to find the solution. AI is a **rubber duck that talks back**.

Use this for:

- **Design discussions** — "I'm choosing between approach A and B. Here are the tradeoffs..."
- **Debugging** — "Here's what I see, here's what I expected. What am I missing?"
- **Architecture review** — "Here's my proposed system design. What are the failure modes?"
- **Learning** — "Explain how [concept] works, but assume I already understand [prerequisite]"

**The key shift:** You're not asking the AI to decide for you. You're using it as a sounding board that can also write code. The decisions are still yours.

---

## Mental Model #8: Fail Fast, Iterate Faster

In traditional coding, rewriting a function takes effort, so you plan carefully before writing.

With AI, the cost of generating code approaches zero. This changes the optimal strategy:

### Old Approach (High cost of writing)

```
Plan extensively → Write carefully → Debug slowly
```

### New Approach (Low cost of generating)

```
Rough spec → Generate → Evaluate → Throw away and re-spec if needed
```

**It's often faster to re-prompt with better instructions than to manually fix bad AI output.** Don't get attached to generated code — treat it as disposable until it passes your review.

---

## Mental Model #9: The AI Doesn't Know What It Doesn't Know

This is the most important mental model for senior devs to internalize:

**The AI will NEVER say "I don't know enough about your system to answer this safely."**

It will always produce _something_. It will produce it confidently. And it might be wrong in subtle, hard-to-catch ways:

- Using a function signature that doesn't exist in your codebase
- Applying a pattern from a different framework version
- Making assumptions about your database schema
- Ignoring thread safety in concurrent code
- Using a deprecated API it saw in training data

**Your experience is the safety net.** The AI is fast but has no judgment about your specific system. You are slow but have deep judgment about your specific system. Together, you're unstoppable.

---

## Mental Model #10: Compound Returns

AI-assisted development has **compound returns**. The more you invest in setup and workflow, the faster every subsequent task becomes:

```
Week 1: Slower than hand-coding (learning the tools)
Week 2: About the same speed (finding your rhythm)
Week 3: 1.5-2x faster (patterns clicking)
Month 2: 3-5x faster (muscle memory, refined prompts)
Month 3: You can't imagine going back
```

The developers who get the most value are those who:

1. Invest in **project-level context** (CLAUDE.md, memory files)
2. Build a **personal library of prompt patterns** that work
3. Develop the **review muscle** (fast, accurate evaluation of AI output)
4. Learn when to use AI and when to **just write the damn code yourself**

---

## The Bottom Line

You are not being replaced. You are being **amplified**.

The developers who thrive with AI are those who:

- Lean into their **experience and judgment** (the things AI lacks)
- Get comfortable **directing** rather than just **writing**
- Build **systematic workflows** instead of one-off prompt experiments
- Stay **skeptical** of AI output while being **open** to the speed gains

Your decades of experience are more valuable now, not less. You know _what_ to build and _why_. The AI just helps you build it faster.

---

_Next: [PROMPTING-PATTERNS.md](PROMPTING-PATTERNS.md) — Battle-tested prompt templates for real work._
