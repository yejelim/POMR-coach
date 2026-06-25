---
name: completion-contract
description: Run or prepare a completion contract for long coding tasks where partial progress could be mistaken for done.
---

# Completion Contract Skill

Use for long-running implementation, migration, risky bug fix, or multi-file refactor work.

Instructions:

1. Read `.agents/loops/completion-contract.md`.
2. Create or update the required `.agent-work/state/..._completion-contract.md` only if the task is truly multi-pass.
3. Work requirement by requirement and keep the evidence table current.
4. Do not report success until every required outcome is proved and final validation evidence exists.
5. Report blocked, approval-required, exhausted, or stagnated honestly when those stop states apply.
