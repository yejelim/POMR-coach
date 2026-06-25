# Docs Sweep Loop

Use for keeping docs, examples, README snippets, and command references in sync with the repo.

## Copy-ready prompt

```text
Run the Docs Sweep loop.

Goal:
Find and fix documentation drift for [area].

Fresh inputs:
- README and docs for the area;
- package/config files that define real commands;
- source examples, CLI help, schemas, generated types, or tests that prove current behavior.

Scope:
- You may edit docs and examples in [paths].
- Do not change product behavior unless explicitly requested.

Per pass:
1. Pick one verifiable drift item.
2. Verify the current truth from code/config/tests, not from another stale doc.
3. Make one small docs/example update.
4. Run the relevant docs check, link check, snippet test, typecheck, or at least a syntax/config check if available.
5. Record drift item, source of truth, changed files, and check result in `.agent-work/state/<timestamp>_<topic>_docs-sweep.md`.

Stop successfully when:
- all in-scope high-confidence drift items are fixed;
- docs checks pass or unrun checks are explained.

Stop as clean no-op when:
- no verifiable drift is found.

Stop as blocked when:
- the true behavior is ambiguous or product decisions are needed.

Stop as exhausted when:
- the agreed file/time limit is reached.

Final response:
- fixed drift items;
- source of truth for each;
- validation results;
- deferred ambiguous items.
```
