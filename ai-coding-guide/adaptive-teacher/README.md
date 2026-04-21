# 🎓 Adaptive Teacher — أستاذ (Ustaaz)

An AI teaching skill that adapts to the learner in real time. It detects your level through natural conversation, uses reverse prompting (Socratic method) to deepen understanding, and learns from how you interact with AI coding agents to optimize its teaching.

Built for teams transitioning to AI-assisted development. Supports English and Egyptian Arabic (العامية المصرية).

---

## Quick Start

### For Claude Code

```bash
cp -r adaptive-teacher ~/.claude/skills/
```

Then say: _"Teach me about [topic]"_

### For Copilot CLI

```bash
cp -r adaptive-teacher ~/.copilot/skills/
```

Then say: _"Teach me about [topic]"_

### For Cursor / Windsurf / Other Agents

Copy the `adaptive-teacher/` folder into the skill directory for your platform.

---

## What Makes This Different

| Feature             | Traditional Tutorials          | This Skill                                               |
| ------------------- | ------------------------------ | -------------------------------------------------------- |
| **Level Detection** | Manual quiz or self-assessment | Automatic — detected from conversation                   |
| **Adaptation**      | Fixed difficulty               | Real-time adjustment based on your responses             |
| **Teaching Method** | One-way information dump       | Reverse prompting — guides you to discover answers       |
| **Meta-Learning**   | None                           | Tracks HOW you learn, adjusts approach accordingly       |
| **Arabic Support**  | None or MSA (formal)           | Egyptian Arabic (العامية) — the way people actually talk |
| **AI Integration**  | Separate from coding           | Teaches WHILE you code with AI agents                    |

---

## The 5 Learner Levels (Auto-Detected)

The skill automatically detects where you are and adjusts. You'll never see these labels — the teaching just feels right.

| Level            | Who                                                           | Teaching Style                                                      |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Newcomer**     | No programming background                                     | Heavy metaphors, one concept at a time, lots of encouragement       |
| **Explorer**     | "Vibe coder" — builds with AI but doesn't understand the code | Bridges from what they know, connects everything to practical use   |
| **Practitioner** | Can code in at least one language, may have gaps              | Fills gaps, focuses on "why" not "what", challenges with edge cases |
| **Engineer**     | Professional developer learning something new                 | Peer-level discussion, mental models, tradeoffs                     |
| **Architect**    | Deep expert wanting a new perspective                         | Challenges assumptions, research-level discussion                   |

---

## Key Features

### 🔄 Reverse Prompting (Socratic Method)

Instead of dumping information, the skill asks questions that guide you to discover the answer yourself. Research shows this leads to 2-3x better retention.

Example:

> **You:** "What's a race condition?"  
> **Ustaaz:** "Imagine two users click 'buy' on the last item at the exact same time. What happens?"  
> **You:** "They'd both get it? But there's only one..."  
> **Ustaaz:** "Exactly! That nightmare is a race condition. Now — how would you prevent it?"

### 🧠 Meta-Learning (Learning from Agent Interactions)

The skill observes how you interact with AI coding tools and adapts:

- If you always ask for code first → it leads with code
- If you ask "but why?" a lot → it explains reasoning before showing code
- If you accept AI output without reviewing → it teaches verification skills

### 🇪🇬 Egyptian Arabic Translation

Say "بالعربي" or "explain in Arabic" at any point. The skill switches to **Egyptian colloquial Arabic** — not formal MSA (الفصحى). Technical terms stay in English because that's how Egyptian developers actually talk.

Example:

> "الفانكشن دي بتاخد parameter واحد وبترجع promise. يعني لما تعملها call، مش هتستنى — هتكمل شغل وترجعلك الناتج بعدين."

### 📊 Real-Time Level Adjustment

The skill continuously calibrates. If you start getting things right easily, it levels up automatically. If you seem confused, it slows down and simplifies — without announcing the change.

---

## Trigger Phrases

Say any of these to activate the skill:

| English                     | Arabic             |
| --------------------------- | ------------------ |
| "Teach me [topic]"          | "علمني [topic]"    |
| "Explain [concept]"         | "اشرحلي [concept]" |
| "How does [X] work?"        | "إزاي ده بيشتغل؟"  |
| "I don't understand [X]"    | "مش فاهم [X]"      |
| "Walk me through [X]"       | "مشيني على [X]"    |
| "Break this down for me"    | "بسّطهالي"         |
| "ELI5 [topic]"              | —                  |
| "Start a lesson on [topic]" | —                  |

---

## Skill Structure

```
adaptive-teacher/
├── SKILL.md                              # Main skill — identity, engine, protocols
└── references/
    ├── adaptive-learning.md              # Level detection, learning styles, adaptation
    ├── reverse-prompting.md              # Socratic prompt templates by level & topic
    ├── arabic-translation.md             # 200+ technical terms, cultural context, dialect rules
    └── learning-from-agent.md            # Meta-learning from AI agent interactions
```

---

## For Team Leads

### How to Share With Your Team

1. **Copy the skill** to a shared location (git repo, shared drive, etc.)
2. Each team member installs it in their agent's skill directory
3. No configuration needed — it adapts to each person individually

### Recommended Use Cases

| Use Case                     | How to Start                                           |
| ---------------------------- | ------------------------------------------------------ |
| Onboarding new developers    | "Teach me about our codebase architecture"             |
| Learning a new framework     | "Explain React hooks to me — I know Vue"               |
| Understanding AI tools       | "Teach me how to use AI coding assistants effectively" |
| Debugging concepts           | "Walk me through how to debug memory leaks"            |
| Arabic-speaking team members | "علمني عن الـ API design"                              |

### Teaching Methodology Behind the Skill

This skill combines techniques from:

- **Bloom's Taxonomy** — classifying learning objectives by cognitive level
- **Socratic Method** — reverse prompting to activate retrieval over passive reception
- **Zone of Proximal Development (Vygotsky)** — teaching just above current ability
- **Spaced Retrieval** — callbacks to earlier concepts to strengthen retention
- **Constructivism** — learners build knowledge through experience, not just instruction

Adapted from:

- [claude-howto Learning Roadmap](https://github.com/luongnv89/claude-howto/blob/main/LEARNING-ROADMAP.md)
- [codebase-to-course](https://github.com/zarazhangrui/codebase-to-course) skill architecture

---

## Anti-Patterns (What the Skill Avoids)

| ❌ Anti-Pattern                        | ✅ What It Does Instead                                               |
| -------------------------------------- | --------------------------------------------------------------------- |
| Starting with a quiz to assess level   | Natural conversation — level detected implicitly                      |
| Dumping walls of text                  | Short exchanges, visual formatting, one concept at a time             |
| Using the same metaphor for everything | Every concept gets its own tailored metaphor                          |
| Saying "That's wrong"                  | "That's a common way to think about it — there's one subtle twist..." |
| Translating to formal Arabic (MSA)     | Uses Egyptian colloquial Arabic + English tech terms                  |
| Teaching everything at once            | Teaches what you need NOW, offers to go deeper                        |
| Ignoring how you interact with AI      | Observes your AI workflow and teaches accordingly                     |

---

_Built by Ahmed Taha for the team. Inspired by [codebase-to-course](https://github.com/zarazhangrui/codebase-to-course) and [claude-howto](https://github.com/luongnv89/claude-howto)._
