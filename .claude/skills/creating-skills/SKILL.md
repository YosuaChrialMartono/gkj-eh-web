---
name: creating-skills
description: Use this skill when creating a new Claude Code skill for this project or any project. Applies when the user asks to add a skill, create a SKILL.md, define a new reusable AI behavior module, or teach Claude how to do something specific. USE WHEN: "create a skill", "add a skill for", "make a SKILL.md", "teach Claude how to", "define a reusable behavior".
allowed-tools: [Read, Write, Edit, Bash, Glob]
---

# Creating Skills

Skills are reusable AI knowledge modules stored in `.claude/skills/<skill-name>/SKILL.md`.
Claude loads them automatically when a task matches the skill's description.

## Directory Structure

```
.claude/skills/
└── <gerund-name>/              # e.g., building-components, analyzing-data
    ├── SKILL.md                # Entry point — keep under 500 lines
    └── docs/                   # Optional: overflow docs referenced from SKILL.md
        ├── examples.md
        ├── concepts.md
        └── reference.md
```

## SKILL.md Frontmatter (Required)

```yaml
---
name: your-skill-name
description: >
  Detailed description that answers: what does this skill do, and when
  should it be used? Write in third person. Include USE WHEN patterns
  with exact keywords users might say.
allowed-tools: [Read, Edit, Write, Bash, Glob, Grep]
---
```

### Frontmatter Rules

| Field | Rules |
|---|---|
| `name` | Required. Max 64 chars. Lowercase letters, numbers, hyphens only. Gerund form. |
| `description` | Required. Max 1024 chars. No XML tags. Third person. Trigger-rich (see below). |
| `allowed-tools` | Optional. Restrict which tools this skill uses. |

## Naming Convention — Gerund Form

Use `verb + -ing` form (gerund):
```
✅ building-api-routes
✅ analyzing-spreadsheets
✅ creating-skills
✅ debugging-api-routes
✅ managing-database-migrations

❌ api-routes       (noun, not gerund)
❌ debug            (infinitive)
❌ APIRouteBuilder  (PascalCase)
```

## Writing the Description (Most Critical Part)

The description is injected into Claude's system prompt and determines activation reliability.

### Activation rates by description quality

| Quality | Activation Rate |
|---|---|
| No optimization | ~20% |
| Simple description | ~20% |
| Optimized with USE WHEN patterns | ~50% |
| With examples and trigger keywords | ~72–90% |

### Template for high-activation descriptions

```
Use this skill when [primary use case]. Applies when the user asks to [action 1],
[action 2], or [action 3]. USE WHEN: "[keyword phrase 1]", "[keyword phrase 2]",
"[keyword phrase 3]", "[keyword phrase 4]".
```

### Rules for descriptions
- Write in **third person** throughout ("Use this skill when..." not "I will...")
- Include **exact keyword phrases** users might say in `USE WHEN:` patterns
- Be specific about scope — also say what the skill does NOT cover
- Max 1024 characters — be concise but trigger-rich
- No XML tags (they interfere with the system prompt)

### Example — Good vs Bad Description

```yaml
# ❌ Too vague — low activation
description: Helps with components.

# ✅ Specific + trigger-rich — high activation
description: >
  Use this skill when creating, editing, or organizing React components.
  Applies when the user asks to add a new UI component, build a page section,
  style with Tailwind, handle dark mode, or place a new component in the right
  directory. USE WHEN: "create a component", "add a button", "build a form",
  "add dark mode", "style with Tailwind", "where should this component go".
```

## SKILL.md Body Structure

Keep under 500 lines. Use progressive disclosure — put detailed content in `docs/`.

```markdown
# Skill Title

Brief 1-2 sentence summary of what this skill covers.

## Core Concept / Quick Reference
The most essential information — what Claude needs to know immediately.

## Patterns / Examples
Show real code examples. Examples section should be LONGER than the rules section.
Show both ✅ correct and ❌ incorrect patterns.

## Step-by-Step Workflow (if applicable)

## Key Files
Reference the actual files in this project that Claude should read or edit.

## What NOT to Do
Explicit anti-patterns to avoid.
```

## Progressive Disclosure Pattern

When content would exceed 500 lines, move detailed sections to `docs/`:

```markdown
# My Skill

Core content here (under 300 lines).

## Advanced Reference
See [CLI Reference](./docs/cli-reference.md) for the full command list.
See [Examples](./docs/examples.md) for 20+ worked examples.
```

Claude loads referenced files on-demand only when needed, saving tokens.

## Testing a New Skill

After creating the skill, test activation by:

1. Start a new Claude Code session in the project directory
2. Give a prompt that matches the USE WHEN patterns
3. Verify Claude loads and follows the skill's guidance
4. If activation is inconsistent, add more trigger keywords to the description

## Checklist Before Finishing a Skill

- [ ] Name is gerund form, kebab-case
- [ ] `name` in frontmatter matches the directory name
- [ ] Description is in third person
- [ ] Description includes `USE WHEN:` patterns with keyword phrases
- [ ] Description is under 1024 characters
- [ ] SKILL.md body is under 500 lines
- [ ] Code examples show ✅ correct and ❌ incorrect patterns
- [ ] `Key Files` section references actual project files
- [ ] Skill has been tested for activation in a real session
