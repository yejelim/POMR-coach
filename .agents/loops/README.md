# Agent Loops

A loop is a task with a check. The agent observes fresh state, makes one bounded change, runs a fixed check, records evidence, then repeats or stops.

Use a loop only when the result of one pass should change the next pass. If not, ask for a one-shot task.

## Selection guide

| Situation | Use this loop |
|---|---|
| Long implementation where partial progress could be mistaken for done | `completion-contract.md` |
| Normal bug fix or small feature with clear tests | `implementation-change.md` |
| Flaky or order-dependent tests | `test-stabilizer.md` |
| Documentation drift across README/docs/examples | `docs-sweep.md` |
| Dead code, stale files, unused dependency cleanup | `housekeeper.md` |
| Promote a repeated successful method into durable learning/skill | `artifact-to-learning.md` |

## Required loop shape

Every loop prompt should define:

1. Trigger and goal.
2. Fresh inputs to inspect.
3. One bounded in-scope action per pass.
4. Fixed check under the same conditions.
5. State/evidence file.
6. Stop conditions: success, no-op, blocked, approval-required, exhausted, stagnated.
7. Budget or affected-scope limit.
8. Forbidden actions and approval boundary.

## State files

For multi-pass work, write local state under `.agent-work/state/` using:

```text
.agent-work/state/<YYYY-MM-DD_HHMMSS>_<topic>_<loop>.md
```

State files are local and should not be committed. They should contain only operational evidence, never secrets.
