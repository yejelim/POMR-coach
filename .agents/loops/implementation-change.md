# Implementation Change Loop

Use for a normal bug fix or small feature where the likely validation command is clear.

## Copy-ready prompt

```text
Run the Implementation Change loop.

Goal:
[bug fix or small feature]

Fresh inputs:
- User request
- README/package config/CI for commands
- Relevant source files and nearby tests

Scope:
- Change only files needed for the requested behavior.
- Avoid unrelated refactors, dependency upgrades, generated files, and formatting churn.
- Do not touch `.env*`, secrets, large assets, datasets, checkpoints, or deployment-critical settings.

Per pass:
1. Reproduce or localize the issue when possible.
2. Make one minimal change.
3. Run the narrowest meaningful check: targeted test, typecheck, lint, dry-run, build, or config parse.
4. If the check fails, use the first actionable failure to choose the next minimal change.
5. Broaden validation only after the targeted check passes.

Stop successfully when:
- the requested behavior is implemented;
- the narrowest relevant validation passes;
- the diff is limited to the task scope.

Stop as clean no-op when:
- repo evidence already satisfies the request and no change is needed.

Stop and report blocked when:
- acceptance criteria are materially ambiguous;
- required services/secrets/data are unavailable;
- the correct fix requires schema, deployment, or API contract changes outside scope.

Final response:
- changed files;
- validation command(s) and result(s);
- known risks and unrun checks.
```

## Notes

Prefer one precise targeted check over broad test suites early in the loop. Do not claim completion from code inspection alone when a real check is available.
