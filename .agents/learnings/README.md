# Learnings

Committed, curated, durable knowledge an agent should consult when relevant. This
is the middle rung of the promotion ladder (see `../README.md`): raw notes live in
the git-ignored `.agent-work/`, and only evidence-backed, reusable lessons are
promoted here.

## What belongs here

- A method that worked across **at least two distinct cases**, or a high-severity
  safety rule.
- Non-obvious, repo-specific knowledge not already in the code, `docs/`, or
  `AGENTS.md`.

## What does not

- One-off facts, guesses, or generic programming advice.
- Raw session transcripts or run evidence — those stay in `.agent-work/`.

## File shape

```md
# <topic>

Status: active | stale | disputed
Last reviewed: YYYY-MM-DD
Applies when: ...
Does not apply when: ...

## Lesson
...

## Evidence
- YYYY-MM-DD: task/run/artifact + validation result
- YYYY-MM-DD: task/run/artifact + validation result

## Review trigger
Review when tool/model/SDK/data pipeline changes, or after a contradiction.
```

Promote with the `artifact-to-learning` loop/skill. Keep entries human/PR-reviewed;
do not auto-append.
