# Housekeeper Loop

Use for low-risk cleanup: dead code, stale files, unused dependencies, obsolete docs, or generated leftovers.

## Copy-ready prompt

```text
Run the Housekeeper loop.

Goal:
Reduce low-risk repository clutter in [area] without changing behavior.

Fresh inputs:
- git status and recent diff;
- static analysis, dependency graph, import search, test coverage, CI config;
- README/docs references.

Scope:
- You may make one small cleanup per pass.
- Do not delete public APIs, migrations, datasets, checkpoints, large assets, or anything referenced by docs/CI/runtime without strong proof and approval.

Per pass:
1. Identify one cleanup candidate with evidence.
2. Prove it is unused/stale via search, tests, config, or dependency graph.
3. Make one reversible cleanup.
4. Run the fixed check: build/typecheck/test/lint/config parse appropriate to the area.
5. Record candidate, proof, changed files, and check result in `.agent-work/state/<timestamp>_<topic>_housekeeper.md`.

Stop successfully when:
- the agreed cleanup target is reached and checks pass.

Stop as clean no-op when:
- no candidate has enough evidence to change safely.

Stop as approval-required when:
- deletion affects public API, migrations, production paths, data, checkpoints, or customer-visible behavior.

Stop as stagnated when:
- candidates require speculation rather than proof.

Final response:
- removed/changed items;
- proof they were safe;
- checks run;
- deferred risky candidates.
```
