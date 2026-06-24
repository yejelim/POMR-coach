# Artifact-to-Learning Loop

Use when a repeated successful method should become a durable learning, loop, or skill.

Do not use to promote one-off guesses into permanent rules.

## Copy-ready prompt

```text
Run the Artifact-to-Learning loop.

Goal:
Turn a repeated successful method into a durable, non-obvious learning or reusable loop.

Fresh inputs:
- at least two completed task artifacts or state files;
- final validation evidence from each;
- relevant current repo conventions.

Scope:
- You may edit `.agents/learnings/<topic>.md`, `.agents/loops/<name>.md`, or a skill wrapper only if evidence supports durability.
- Do not add generic programming advice or one-off facts.

Per pass:
1. Extract the candidate method, preconditions, failure mode, and evidence from prior artifacts.
2. Check whether it appears in at least two distinct cases or is a high-severity safety rule.
3. Test the method against a fresh or recent analogous case if available.
4. Write the smallest durable note or loop update.
5. Include expiry/review conditions when the rule depends on tools, SDKs, data, or infra.

Stop successfully when:
- the learning is evidence-backed, non-obvious, reusable, and scoped;
- old contradictory learning is updated or marked stale.

Stop as clean no-op when:
- the candidate is generic, one-off, or not supported by evidence.

Stop as blocked when:
- source artifacts are unavailable or evidence is too weak.

Final response:
- promoted learning/loop/skill path;
- evidence sources;
- expiry/review condition;
- rejected candidates and why.
```

## Suggested learning file shape

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
