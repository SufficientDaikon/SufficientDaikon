# 🎯 Prompting Patterns for Senior Developers

> **Copy-paste templates for every common coding task.** Adapt to your stack and project.

---

## How to Use This Document

Each pattern has:

- **When to use it** — the situation
- **The template** — copy, fill in the blanks, send
- **Why it works** — what makes this prompt effective
- **Example** — a concrete real-world usage

---

## Pattern 1: The Context-First Prompt

### When to Use

Every time you start a new task or conversation. Sets the stage so every subsequent prompt produces relevant output.

### Template

```
## Context
Project: [name] — [one-liner]
Stack: [language/framework/DB/infra]
File: [path to the file you're working on]
Task: [what you're doing and why]
Constraints: [time, perf, compat, dependencies, etc.]

## Relevant Code
[paste interfaces, types, or existing patterns the AI should match]

## What I Need
[your actual request]
```

### Why It Works

The AI generates responses based on available context. Without this, it defaults to generic patterns. With it, the output matches your project's conventions on the first try.

### Example

```
## Context
Project: PaymentService — processes credit card transactions for an e-commerce platform
Stack: Go 1.22, PostgreSQL 16, gRPC, deployed on K8s
File: internal/payment/processor.go
Task: Adding retry logic for failed card authorizations
Constraints: Must not retry on hard declines (fraud, insufficient funds). Must be idempotent.

## Relevant Code
type PaymentResult struct {
    Status    PaymentStatus
    ErrorCode string
    Retryable bool
}

## What I Need
Add a retry wrapper around ProcessPayment that retries up to 3 times with exponential backoff,
but only when result.Retryable is true. Log each retry attempt.
```

---

## Pattern 2: The Specification Prompt

### When to Use

Building a new component, function, or module from scratch.

### Template

```
Create a [component type] called [name] that:

**Inputs:**
- [param1]: [type] — [description]
- [param2]: [type] — [description]

**Outputs:**
- Returns [type] containing [description]
- On error: [error handling behavior]

**Behavior:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Edge Cases:**
- When [condition]: [expected behavior]
- When [condition]: [expected behavior]

**Constraints:**
- [Performance/memory/dependency constraints]
- Follow the same pattern as [existing reference]

**Do NOT:**
- [Explicit exclusion 1]
- [Explicit exclusion 2]
```

### Why It Works

Mirrors a technical specification. The AI treats each section as a hard requirement. The "Do NOT" section prevents common AI tendencies (over-engineering, adding dependencies, changing signatures).

### Example

```
Create a middleware function called `rateLimiter` that:

**Inputs:**
- config: RateLimitConfig — { windowMs: number, maxRequests: number, keyGenerator: (req) => string }

**Outputs:**
- Express middleware function
- On limit exceeded: 429 response with { error: "Rate limit exceeded", retryAfter: number }

**Behavior:**
1. Extract key from request using config.keyGenerator
2. Check sliding window counter in Redis
3. If under limit: increment counter, set TTL if new, proceed to next()
4. If over limit: return 429 with Retry-After header

**Edge Cases:**
- When Redis is down: allow the request (fail open), log a warning
- When keyGenerator returns empty string: use IP address as fallback
- When windowMs is 0 or negative: throw during initialization, not at runtime

**Constraints:**
- Use our existing Redis client from `src/infra/redis.ts`
- O(1) per request (no scanning)
- Match the middleware pattern in `src/middleware/auth.ts`

**Do NOT:**
- Add new npm dependencies
- Use in-memory storage (must use Redis)
- Add rate limit headers to successful responses (we do that elsewhere)
```

---

## Pattern 3: The Surgical Edit

### When to Use

Modifying existing code — you want a precise change, not a rewrite.

### Template

```
In [file path], make this specific change:

**Current behavior:** [what it does now]
**Desired behavior:** [what it should do instead]

**Change only:** [specific function/block/section]
**Don't touch:** [what must remain unchanged]

[paste the relevant code section]
```

### Why It Works

AI tools love to rewrite entire files. This prompt constrains the scope. Explicitly stating what NOT to change is as important as stating what TO change.

### Example

```
In src/services/UserService.ts, make this specific change:

**Current behavior:** createUser() allows duplicate email addresses
**Desired behavior:** createUser() checks for existing email before insert, throws DuplicateEmailError if found

**Change only:** The createUser() method
**Don't touch:** The class constructor, other methods, or the import statements

export class UserService {
  async createUser(data: CreateUserDTO): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
}
```

---

## Pattern 4: The Test Generator

### When to Use

Writing tests for existing code. Works best when you specify edge cases explicitly.

### Template

```
Write [unit/integration] tests for this [function/class]:

[paste the code]

**Test framework:** [jest/pytest/go test/etc.]
**Assertion style:** [expect/assert/should]
**Match style of:** [reference existing test file]

**Cover these scenarios:**
1. Happy path: [describe normal input → expected output]
2. Edge case: [describe boundary condition]
3. Edge case: [describe another boundary]
4. Error case: [describe invalid input → expected error]
5. Error case: [describe failure mode]

**Mocking:**
- Mock [dependency] to return [value]
- Don't mock [thing that should be real]

**Do NOT:**
- Test private methods directly
- Add snapshot tests
- Test framework behavior (only test our logic)
```

### Why It Works

Senior devs know the important edge cases but don't always enjoy writing the boilerplate. This gets the AI to do the tedious part while you specify the interesting test cases.

---

## Pattern 5: The Code Review Request

### When to Use

Having the AI review code — yours or others'. Most useful as a second pair of eyes before submitting a PR.

### Template

```
Review this code. Focus on:
1. Bugs or logic errors (highest priority)
2. Security vulnerabilities
3. Performance issues
4. Missing error handling

Don't comment on:
- Code style or formatting
- Naming conventions (unless genuinely misleading)
- Minor nitpicks

For each issue found, provide:
- The specific line or section
- What the problem is
- A concrete fix

[paste the code]
```

### Why It Works

Without the "Don't comment on" section, AI reviews are full of style nitpicks that waste your time. This focuses on the bugs you'd actually care about in a real PR review.

---

## Pattern 6: The Explain-and-Suggest

### When to Use

Understanding unfamiliar code (legacy, new codebase, complex algorithm) before modifying it.

### Template

```
Explain this code. I'm a senior developer who understands [language],
but I'm new to this codebase.

Focus on:
1. What is the business purpose of this code?
2. What are the key data flows?
3. What implicit assumptions does it make?
4. What are the potential failure modes?
5. If I needed to modify [specific aspect], where would I start?

[paste the code]
```

### Why It Works

The "senior developer" qualifier prevents condescending explanations of basic language features. The "implicit assumptions" question surfaces the hidden knowledge that makes legacy code dangerous to modify.

---

## Pattern 7: The Incremental Refactor

### When to Use

Refactoring complex code in safe, reviewable steps.

### Template

```
Refactor this code in [N] steps. Show each step separately so I can review and approve before moving to the next.

**Goal:** [what the final state should look like]
**Constraint:** Each step must leave the code in a working, compilable state.
**Constraint:** Don't change the public API — all existing callers must still work.

**Suggested steps (adjust if you see a better order):**
1. [First safe transformation]
2. [Second safe transformation]
3. [Third safe transformation]

[paste the code]
```

### Why It Works

Large refactors are risky. Breaking them into reviewable steps matches how senior devs actually do refactoring — small, safe, individually testable transformations.

---

## Pattern 8: The Architecture Discussion

### When to Use

Using AI as a sounding board for design decisions. Not asking it to decide — asking it to stress-test your thinking.

### Template

```
I'm designing [system/feature] and considering two approaches:

**Option A:** [describe approach]
- Pros: [your analysis]
- Cons: [your analysis]

**Option B:** [describe approach]
- Pros: [your analysis]
- Cons: [your analysis]

**My context:**
- Scale: [expected load/data volume]
- Team: [size, experience level]
- Timeline: [urgency]
- Existing systems: [what this integrates with]

**My current leaning:** [which option and why]

Challenge my thinking. What am I missing? Are there failure modes I haven't considered?
What would you recommend and why?
```

### Why It Works

You're not asking the AI to architect your system. You're asking it to be a devil's advocate. This leverages AI's breadth of knowledge while keeping your judgment in the driver's seat.

---

## Pattern 9: The Migration Guide

### When to Use

Migrating code between frameworks, versions, or languages.

### Template

```
Migrate this code from [source] to [target]:

**Source:** [framework/language version]
**Target:** [framework/language version]

**Preserve:**
- All business logic
- Error handling behavior
- Public API surface

**Adapt:**
- [Source pattern] → [target equivalent]
- [Source API] → [target API]

**Don't include:**
- Compatibility shims for the old version
- Migration comments (the git history is enough)

[paste the code]
```

---

## Pattern 10: The "Fix My Build" Prompt

### When to Use

When something breaks and you have error output.

### Template

```
This build/test/lint is failing. Here's the error:

[paste the full error output]

Here's the code it's pointing to:

[paste the relevant code]

What I've already checked:
- [thing you've ruled out]
- [another thing you've ruled out]

Fix the error. Show me the minimal change needed.
Don't refactor or improve unrelated code.
```

### Why It Works

The "What I've already checked" section prevents the AI from suggesting things you've already tried. The "minimal change" instruction prevents it from rewriting the whole file.

---

## Anti-Patterns to Avoid

| ❌ Don't Do This                          | ✅ Do This Instead                                                                     | Why                             |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| "Make this better"                        | "Reduce the cyclomatic complexity of this function by extracting the validation logic" | Vague prompts get vague results |
| Paste 500 lines with no context           | Paste the relevant 20-50 lines with context about the project                          | More code ≠ better results      |
| Accept the first output blindly           | Review, then say "change X to Y" or "also handle Z"                                    | The AI's first try is a draft   |
| "Write all the tests"                     | "Write tests covering these 5 specific scenarios"                                      | You know the important cases    |
| "Rewrite this file"                       | "Change only the processOrder function"                                                | Scope creep causes bugs         |
| Ask the AI to make architecture decisions | Present options and ask it to challenge your thinking                                  | You have the domain context     |

---

_Next: [WORKFLOW-GUIDE.md](WORKFLOW-GUIDE.md) — How to integrate AI into your daily development workflow._
