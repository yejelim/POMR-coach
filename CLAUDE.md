# CLAUDE.md

@AGENTS.md

Claude-specific entry file. Do not duplicate repository-wide rules here.

Use project skills in `.claude/skills/` (a symlink to the canonical `.agents/skills/`) only when the task matches their descriptions. Prefer explicit invocation for loops that can run for multiple passes.

If a task is simple and one-shot, do not start a loop or create `.agent-work/` state just because a loop exists.
