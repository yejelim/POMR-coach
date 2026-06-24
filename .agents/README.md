# .agents/

Canonical, committed home for agent-facing material in this repo. This layout is
vendor-neutral: the single cross-tool entry point is the root `AGENTS.md`, which
routes into this folder.

## Important: only `skills/` is auto-discovered

Coding tools auto-load **only** `.agents/skills/` (OpenAI Codex reads
`.agents/skills/` natively; Claude Code reads it through the `.claude/skills`
symlink). Nothing else in this folder is auto-loaded. `loops/` and `learnings/`
reach an agent **only** because the root `AGENTS.md` links to them. If you add new
material here, link it from `AGENTS.md` or no agent will see it.

## Layout

- `skills/<name>/SKILL.md` — reusable task procedures. Auto-discovered. Keep each
  `SKILL.md` a thin trigger that points at the matching `loops/` file.
- `loops/` — bounded feedback-loop prompts and their selection guide
  (`loops/README.md`). Inert reference material.
- `learnings/` — committed, curated, evidence-gated durable knowledge.

## Knowledge promotion ladder

Durability and review rigor increase top to bottom; promotion is one-directional:

```text
.agent-work/        raw, ephemeral, git-ignored. "what this run found."
   |  (artifact-to-learning gate: >=2 cases of evidence + Status/Review-trigger)
   v
.agents/learnings/  curated, committed. "what we learned the hard way."
   |  (once general and stable)
   v
AGENTS.md rule  (short, always-on)   or   docs/ (product/system truth, human-owned)
```

`docs/` is a separate, human-first track: it documents what the system *is* and is
owned by humans, with the code as its source of truth. Use `.agents/` for how an
agent should *work*; use `docs/` for what the system *is*.
