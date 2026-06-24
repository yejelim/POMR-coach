# AGENTS.md

Repository-wide guidance for coding agents. Keep this file short: it is always-on context.
Move procedures to `.agents/loops/` or `.agents/skills/`. Move enforceable rules to hooks, permissions, CI, or scripts.
Explicit user/chat instructions override this file.

## Core rules

- Read directly relevant files before editing. Inspect the nearby tests, entrypoints, configs, and call paths that can be affected.
- Keep changes minimal and task-scoped. Do not perform unrelated refactors, renames, dependency upgrades, or formatting churn.
- Prefer documented project commands from `README.md`, package config, Makefiles, or CI. If no command is documented, inspect config and state the assumption before using it.
- Do not read, print, write, or commit secrets. Do not edit `.env*`, credential files, deployment secrets, private keys, or production-only settings unless the user explicitly asks and the repo policy allows it.
- Do not delete or move large assets, datasets, checkpoints, or generated artifact trees unless explicitly requested.
- Do not commit unless explicitly asked. Before any requested commit, review the diff scope and validation evidence.
- After code changes, run the narrowest meaningful validation available. Report the exact command and result. If validation cannot be run, say why.

## Where to find context

- `README.md`: product facts, repo layout, setup/run/test commands.
- Nested `AGENTS.md`: directory-specific rules. The closest file to the edited code takes precedence.
- `.agents/`: canonical, committed agent material (see `.agents/README.md`). Only `.agents/skills/` is auto-discovered by tools; everything else is reached through links from here.
- `.agents/skills/`: reusable task procedures (skills). Claude reads them via the `.claude/skills` symlink.
- `.agents/loops/`: bounded feedback workflows. Use a loop only when one pass's result should change the next pass. Start at `.agents/loops/README.md`.
- `.agents/learnings/`: committed, curated, evidence-gated learnings. Consult when clearly relevant; verify against current repo evidence before relying on them.
- `.agent-work/`: local, git-ignored ephemeral state for active loop runs, scratch, and raw evidence. Not a source of truth.

## Loop policy

Use a loop for repeated work, not for every task. A valid loop has:

- a trigger and goal;
- fresh inputs to inspect;
- one bounded, reversible action per pass;
- a fixed check that decides whether the action helped;
- a state/evidence file when the work lasts more than one pass;
- stop states: success, clean no-op, blocked, approval-required, exhausted, or stagnated;
- a budget or affected-scope limit;
- an approval boundary for production, destructive, privacy-sensitive, financial, or external-message actions.

Blocked, exhausted, and stagnant runs are not successful runs. Report them honestly with the evidence and next input needed.

## Maintenance rule for this file

Before adding a new rule here, ask: “Should every agent read this on every task?” If not, put it in a loop, skill, nested `AGENTS.md`, hook, script, or CI check instead.
