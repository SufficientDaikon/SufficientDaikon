# Reverse Prompting Reference

Complete library of reverse prompting templates organized by topic, level, and learning goal. Reverse prompting (Socratic teaching) is where you ask the learner questions that guide them to discover the answer themselves, rather than simply telling them.

---

## Why Reverse Prompting Works

Cognitive science is clear: information that's **retrieved** from memory sticks better than information that's **received** passively. When you ask a learner to predict, guess, or explain, you activate their retrieval circuits — even if they get it wrong. The correction that follows is dramatically more memorable than the same information delivered as a lecture.

For senior developers especially, reverse prompting is powerful because:

- They already have extensive knowledge that can be **connected** to new concepts
- They learn best when they feel like **peers** exploring, not students being lectured
- Being challenged is motivating (not threatening) when done respectfully
- It surfaces **misconceptions** that would otherwise remain hidden and cause bugs later

---

## Prompt Templates by Purpose

### 1. Prediction Prompts — "What Will Happen?"

**Goal:** Make the learner commit to an expectation before seeing reality. The gap between prediction and result is where learning happens.

**For L1-L2:**

```
"If you click this button right now, what do you think will change on the screen?"
"If we delete this line, what do you think breaks?"
"If 1000 users click this at the same time, what do you think happens?"
```

**For L3-L4:**

```
"What will this function return if we pass null?"
"If we remove the caching layer, what changes for the user?"
"What happens to the database if this transaction fails halfway?"
"If we swap this from a POST to a GET, what breaks?"
```

**For L5:**

```
"What's the worst-case latency if this queue backs up under 10x load?"
"How would this pattern behave under network partition?"
"If we migrated this from a relational to a document model, what queries become expensive?"
```

### 2. Explanation Prompts — "Teach It Back"

**Goal:** The learner explains a concept in their own words. If they can teach it, they understand it.

**For L1-L2:**

```
"If a friend asked you 'what's a database?', how would you explain it?"
"In your own words, what's the difference between frontend and backend?"
"Pretend I'm your mom — explain what an API does."
```

**For L3-L4:**

```
"How would you explain this middleware to a junior developer on your team?"
"If someone asked 'why don't we just put everything in one file?', what would you say?"
"Explain the difference between authentication and authorization without using either word."
```

**For L5:**

```
"How would you pitch this architecture to a VP of Engineering who thinks it's over-engineered?"
"If you had to write a blog post about why you chose this approach, what's your thesis?"
"Explain the tradeoffs of this design to someone who favors the opposite approach."
```

### 3. Debugging Prompts — "Find the Problem"

**Goal:** Instead of showing the learner a bug, make them hunt for it. This builds debugging intuition.

**For L1-L2:**

```
"Something's not working. The button click doesn't show the data.
What are the possible reasons? List as many as you can think of."
"The page loads but nothing appears. What's the first thing you'd check?"
```

**For L3-L4:**

```
"This API returns 200 OK but the data is wrong. Where in the pipeline
could the data get corrupted?"
"The test passes locally but fails in CI. What are three possible causes?"
"Users in Europe get slower responses than users in the US. Why?"
```

**For L5:**

```
"This works perfectly under normal load but crashes under stress testing
at 5000 concurrent connections. What are you looking for?"
"The service was stable for 3 months, then suddenly started throwing
OOM errors with no code changes. What changed?"
```

### 4. Design Decision Prompts — "What Would You Choose?"

**Goal:** Present a real design choice and ask the learner to reason about tradeoffs.

**For L2-L3:**

```
"Should we put this logic in the frontend or the backend?
What are the pros and cons of each?"
"We need to store user preferences. Should we use a database or
just keep it in the browser? What happens with each choice?"
```

**For L3-L4:**

```
"Should this be a REST API or a WebSocket? What factors would
change your answer?"
"We have 10 million records. SQL or NoSQL? What questions would
you ask before deciding?"
"Should this be a synchronous call or go through a message queue?"
```

**For L5:**

```
"Monolith or microservices for a team of 5 engineers? What about 50?"
"How would you handle data consistency across these three services
without distributed transactions?"
"Event sourcing vs. traditional CRUD for this domain — make the case for each."
```

### 5. Transfer Prompts — "Apply It Elsewhere"

**Goal:** Test if the learner can take a concept from one context and apply it in a new situation.

```
"We just learned how caching works for API responses.
Where else in this system could caching help?"

"This rate limiter prevents API abuse. What other systems
could benefit from the same pattern?"

"We used a queue to handle email sending. What other tasks
in this app could be queued instead of done immediately?"

"The observer pattern is how these components communicate.
Where else have you seen this pattern in daily life?"
```

### 6. Synthesis Prompts — "Connect the Dots"

**Goal:** Make the learner see how multiple concepts relate. This builds mental models.

```
"We've now covered the database, the API, and the frontend.
Trace the full journey of a user's data from when they type
it in a form to when it appears on another user's screen."

"How do authentication, authorization, and sessions work
together to keep the app secure?"

"We learned about caching, load balancing, and database
indexing. If you could only implement ONE of these to
improve performance, which would give the biggest bang
for the buck in THIS specific app? Why?"
```

### 7. Correction Prompts — "What's Wrong With This?"

**Goal:** Present a plausible but incorrect statement. The learner must find the error.

```
"Someone says: 'HTTPS makes your website faster.'
Is that true? What's the nuance?"

"A colleague claims: 'We don't need input validation because
we have a firewall.' What's wrong with that reasoning?"

"A junior dev says: 'I used a global variable so all
components can access the data easily.'
What problems might this cause?"

"An engineer says: 'NoSQL is always faster than SQL.'
Challenge this claim."
```

---

## Timing & Rhythm Rules

### The 3-1 Rule

For every 3 pieces of information you give, ask 1 reverse prompt. This maintains engagement without making the learner feel interrogated.

```
TEACH: "Here's how HTTP methods work..."
TEACH: "GET retrieves, POST creates, PUT updates..."
TEACH: "The server responds with status codes..."
REVERSE: "So if I wanted to delete a user, which method would I use? And what status code would you expect back?"
```

### The Difficulty Gauge

Adjust reverse prompt difficulty based on how the learner handled the last one:

```
Got it right easily      → Next prompt: harder or deeper
Got it right with effort → Next prompt: same difficulty, different topic
Got it wrong but close   → Give the answer, next prompt: same difficulty
Got it very wrong        → Teach more, next prompt: easier
Said "I don't know"      → Give the answer, skip reverse prompting for a bit
```

### The Frustration Circuit Breaker

If a learner:

- Answers "I don't know" twice in a row → Stop reverse prompting. Switch to teaching mode for the rest of this topic.
- Gets frustrated (short answers, "just tell me") → Immediately give the answer. Say: "No worries — this is tricky."
- Goes silent → Check in: "Want me to explain this differently, or would you rather move on?"

### The Warm-Up / Cool-Down Pattern

Start a session with EASY reverse prompts (to build confidence), ramp up difficulty in the middle, and end with a synthesis prompt that makes them feel accomplished:

```
WARM UP: "What do you think an API does, in your own words?"
         (Easy, no wrong answer, builds confidence)

RAMP UP: "If the API goes down, what happens to the frontend?"
         (Requires understanding of dependency)

PEAK:    "Design a fallback strategy for when the API is unavailable."
         (Application of knowledge)

COOL DOWN: "If you had to explain to someone why APIs matter,
            what would you say now vs. 30 minutes ago?"
           (Reflection, shows progress)
```

---

## Reverse Prompting in Arabic

When teaching in Egyptian Arabic, reverse prompts should match the conversational tone:

| English Prompt                               | Egyptian Arabic Equivalent            |
| -------------------------------------------- | ------------------------------------- |
| "What do you think happens here?"            | "إيه اللي هيحصل هنا في رأيك؟"         |
| "Before I tell you, take a guess"            | "قبل ما أقولك، حاول تتوقع"            |
| "Why do you think they chose this approach?" | "في رأيك ليه اختاروا الطريقة دي؟"     |
| "What would break if we changed this?"       | "لو غيرنا ده، إيه اللي ممكن يتكسر؟"   |
| "Explain it to me like I'm new"              | "اشرحهالي كإني أول مرة أسمع عنها"     |
| "Can you spot the problem?"                  | "تقدر تلاقي المشكلة؟"                 |
| "That's close! The subtle thing is..."       | "قريب! الحاجة الدقيقة هنا إن..."      |
| "Exactly! And here's why that matters..."    | "بالظبط! والمهم هنا إن..."            |
| "Not quite — think about it this way..."     | "مش بالظبط — فكر فيها كده..."         |
| "What's your instinct telling you?"          | "حاسس بإيه؟ إيه أول حاجة جت في بالك؟" |
