# Completion Contract Loop

Use when a task is long enough that partial work could be mistaken for completion: multi-file feature work, migrations, risky bug fixes, or broad refactors.

Do not use for simple one-shot edits.

## Copy-ready prompt

```text
Run the Completion Contract loop for this task.

Goal:
[task goal]

Before editing:
1. Inspect README/package config/nearby tests and the directly relevant code paths.
2. Create a compact completion contract in `.agent-work/state/<timestamp>_<topic>_completion-contract.md`.
3. The contract must list required outcomes, evidence required for each, non-goals, allowed paths, forbidden paths/actions, validation commands, approval boundaries, and stop budget.

Use this evidence table:

| Requirement | Evidence needed | Status: missing/weak/proved/contradicted | Notes |
|---|---|---|---|

Per pass:
1. Pick exactly one missing or weak requirement.
2. Make the smallest relevant change.
3. Run the narrowest check that can prove or falsify the requirement.
4. Update the evidence table with exact command/output summary and changed files.
5. If a change contradicts another requirement, revert or repair before continuing.

Final validation:
- Run the final validation commands listed in the contract, unless impossible.
- Review the diff against the allowed scope and non-goals.

Stop successfully only when every required outcome is `proved` and no requirement is `contradicted`.

Stop and report instead of continuing when:
- the task needs production/destructive/privacy-sensitive/financial/external action approval;
- a secret, private dataset, or unavailable external service is required;
- the needed change exceeds the allowed scope;
- the same failure repeats twice without a new diagnosis;
- the iteration/time budget is exhausted.

Final response:
- state the terminal state: success / clean no-op / blocked / approval-required / exhausted / stagnated;
- summarize changed files;
- include validation commands and results;
- list remaining risks or required human decisions.
```

## Default budget

Use 6 implementation passes or 90 minutes of active work unless the user provides a different budget.

## Good evidence examples

- test command exit code and failing/passing test names;
- typecheck/lint/build result;
- benchmark before/after under the same conditions;
- diff-limited proof that only in-scope files changed;
- manual reproduction steps with observed output.
