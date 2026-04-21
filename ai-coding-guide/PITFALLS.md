# ⚠️ Pitfalls, Traps & Hard-Won Lessons

> **Every mistake in here was made by a real developer.** Learn from them so you don't have to repeat them.

---

## Pitfall #1: The Confidence Trap

### What Happens

The AI writes code that looks professional, compiles cleanly, and reads well — but is subtly wrong.

### Real Example

```python
# AI generated this for "check if user has permission"
def has_permission(user, resource):
    return user.role in resource.allowed_roles

# Looks correct. But the actual codebase uses a hierarchical permission system
# where ADMIN implies EDITOR implies VIEWER. This flat check breaks that.
```

### How to Avoid

- **Always test edge cases**, not just the happy path
- **Ask the AI:** "What assumptions did you make about the permission model?"
- **Compare with existing code:** If your codebase does it differently, the AI's version is probably wrong

---

## Pitfall #2: The Scope Creep Rewrite

### What Happens

You ask for a small change. The AI rewrites the entire file "while it's at it" — introducing bugs in code you didn't ask it to touch.

### Real Example

```
You: "Add null checking to the getName() method"
AI: "I've improved the entire class! I also renamed variables, restructured
     the constructor, added TypeScript strict mode, and refactored the error
     handling. Here's the updated file..."
```

### How to Avoid

- **Always say:** "Change only [specific thing]. Don't modify anything else."
- **Review diffs carefully** — if lines you didn't ask about changed, reject them
- **Use surgical prompts** — specify exactly what to change and what to preserve

---

## Pitfall #3: The Dependency Bloat

### What Happens

AI loves importing libraries. You ask for date formatting, it installs `moment.js`, `date-fns`, and `luxon`.

### Real Example

```
You: "Format this date as ISO 8601"
AI: "First, install date-fns: npm install date-fns"

// You already have: new Date().toISOString()
// Zero dependencies needed.
```

### How to Avoid

- **Say:** "Do not add new dependencies. Use what's already in the project."
- **Check imports** — if it adds something new, ask "Can we do this with the standard library?"
- **Verify package.json** — if unexpected deps appeared, question them

---

## Pitfall #4: The Outdated Pattern

### What Happens

AI training data has a cutoff. It might suggest patterns from older versions of your framework.

### Real Example

```javascript
// AI suggests React class components in a hooks-based codebase
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }
  // ... entire class component pattern
}

// Your codebase uses:
const UserProfile = () => {
  const [user, setUser] = useState(null);
  // ...
};
```

### How to Avoid

- **Specify versions:** "We use React 18 with hooks. No class components."
- **Reference existing code:** "Follow the same pattern as UserProfile.tsx"
- **Be specific about APIs:** "Use the `useQuery` hook from @tanstack/react-query v5"

---

## Pitfall #5: The "Works on My Machine" Output

### What Happens

AI generates code that works in isolation but breaks in your specific environment.

### Real Example

```go
// AI generates code using os.ReadFile()
data, err := os.ReadFile("config.yaml")

// Your project runs on Go 1.15 (ReadFile was added in 1.16)
// Or: your config is loaded from a database, not a file
```

### How to Avoid

- **Specify your environment:** Go version, Node version, OS, container, etc.
- **Specify your infrastructure:** "Config comes from Consul, not files"
- **Run the code** before accepting it — don't just read it

---

## Pitfall #6: The Security Blind Spot

### What Happens

AI generates code that is functionally correct but has security vulnerabilities. It doesn't flag these because it wasn't asked about security.

### Real Example

```javascript
// AI generates an API endpoint
app.get("/user/:id", async (req, res) => {
  const user = await db.query(
    `SELECT * FROM users WHERE id = ${req.params.id}`,
  );
  res.json(user);
});

// SQL injection vulnerability. Should use parameterized queries.
// AI didn't flag this because you asked for "an endpoint" not "a secure endpoint."
```

### How to Avoid

- **For any data-handling code,** explicitly say: "Follow security best practices. Use parameterized queries / input sanitization / output encoding."
- **Separately ask:** "Review this for security vulnerabilities"
- **Never trust AI for:** auth, crypto, access control, or input validation without manual review

---

## Pitfall #7: The Over-Engineering Spiral

### What Happens

You ask for a simple function. AI returns an enterprise-grade abstraction with dependency injection, factory patterns, and interfaces for things that will only ever have one implementation.

### Real Example

```typescript
// You asked for: "A function to send an email"
// AI returns:
interface IEmailProvider { ... }
interface IEmailTemplate { ... }
interface IEmailConfig { ... }
class EmailProviderFactory { ... }
class EmailTemplateEngine { ... }
class EmailService {
  constructor(
    private provider: IEmailProvider,
    private templateEngine: IEmailTemplate,
    private config: IEmailConfig,
    private logger: ILogger,
    private metrics: IMetricsCollector,
  ) { ... }
}

// What you actually needed:
async function sendEmail(to: string, subject: string, body: string) {
  await sgMail.send({ to, from: config.fromEmail, subject, html: body });
}
```

### How to Avoid

- **Say:** "Keep it simple. No unnecessary abstractions."
- **Say:** "YAGNI — only build what I'm asking for right now."
- **If the output is more than 3x the size you expected,** it's probably over-engineered

---

## Pitfall #8: The Test Theater

### What Happens

AI writes tests that always pass but don't actually test anything meaningful.

### Real Example

```javascript
// AI writes:
test("createUser works", async () => {
  const user = await createUser({ name: "Test", email: "test@test.com" });
  expect(user).toBeDefined(); // This passes even if createUser returns {}
});

// What you needed:
test("createUser returns user with generated ID and timestamps", async () => {
  const user = await createUser({ name: "Test", email: "test@test.com" });
  expect(user.id).toMatch(/^usr_[a-z0-9]+$/);
  expect(user.name).toBe("Test");
  expect(user.email).toBe("test@test.com");
  expect(user.createdAt).toBeInstanceOf(Date);
});
```

### How to Avoid

- **Specify assertions explicitly:** "Assert on [specific fields/values]"
- **Ask for negative tests:** "What should this test verify does NOT happen?"
- **Review the assertions** — if everything is `toBeDefined()` or `toBeTruthy()`, the tests are theater

---

## Pitfall #9: The Copy-Paste Hallucination

### What Happens

AI references functions, APIs, or modules that don't exist in your codebase. It hallucinates plausible-sounding imports and method calls.

### Real Example

```typescript
// AI writes:
import { validateSchema } from "@/utils/validation";
const result = validateSchema(input, UserSchema);

// Your project has no such file, function, or pattern.
// AI invented a plausible path and function name.
```

### How to Avoid

- **Check every import** — does that file/module actually exist?
- **Paste your actual directory structure** when asking for code
- **Specify:** "Only use functions and modules that already exist in the codebase"

---

## Pitfall #10: The "Let Me Explain" Procrastination

### What Happens

You ask for code. The AI writes a 500-word explanation of what it's going to do, then finally gives you the code. You waste time reading theory you already know.

### How to Avoid

- **Say:** "Just the code. No explanation unless I ask."
- **Or:** "Code first, then a brief explanation of any non-obvious choices."
- Saves significant time across a workday

---

## Pitfall #11: The Lost Context

### What Happens

Long conversations lose context. The AI "forgets" constraints you set at the beginning and starts contradicting its earlier output.

### How to Avoid

- **Restate constraints** when starting a new sub-task within the same conversation
- **Use project memory** (CLAUDE.md, COPILOT.md) for persistent context
- **Start a new conversation** for new tasks rather than reusing long threads
- **Be explicit:** "Remember, we're using X framework and Y pattern (as established earlier)"

---

## The Meta-Pitfall: Treating AI as Infallible

The biggest trap isn't any specific mistake — it's the gradual erosion of your critical thinking.

When AI generates 50 lines of code in 3 seconds, it's tempting to skim-review and ship. Over time, this leads to:

1. **Lower code quality** — bugs slip through
2. **Less understanding** — you stop reading the code deeply
3. **Skill atrophy** — you forget how to write certain patterns
4. **Technical debt** — AI-generated code follows AI patterns, not your team's patterns

### The Antidote

- **Read every line** as if a junior developer wrote it
- **Hand-write code** regularly to keep your skills sharp
- **Question AI decisions** — "Why did you choose X instead of Y?"
- **Maintain your standards** — if you wouldn't accept it in a PR from a human, don't accept it from AI

---

_Next: [LEARNING-PATH.md](LEARNING-PATH.md) — A structured roadmap from skeptic to power user._
