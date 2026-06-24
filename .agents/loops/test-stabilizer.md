# Test Stabilizer Loop

Use when tests are flaky, order-dependent, timing-sensitive, or intermittently failing.

## Copy-ready prompt

```text
Run the Test Stabilizer loop.

Goal:
Make [test/suite] reliable without hiding real failures.

Fresh inputs:
- failing test output and history;
- test file and fixtures;
- related source code;
- CI/environment differences if available.

Scope:
- You may change tests, fixtures, and source code directly implicated by the failure.
- Do not add blind sleeps, broad retries, or loosen assertions unless the test's original contract is wrong and that is justified by repo evidence.

Per pass:
1. Run the failing test under the same command multiple times or with the smallest useful repeat count.
2. Classify the failure: order dependency, time/race, leaked state, random seed, network/filesystem, fixture issue, actual bug, or environment issue.
3. Make one root-cause-oriented change.
4. Rerun the fixed check under the same conditions.
5. Record command, pass/fail count, changed files, and diagnosis in `.agent-work/state/<timestamp>_<topic>_test-stabilizer.md`.

Fixed check:
- [repeat command, e.g. `pnpm test path/to/test --runInBand` repeated N times]
- [broader suite command when targeted repeat passes]

Stop successfully when:
- targeted repeat passes N consecutive runs;
- relevant broader suite passes;
- no blind sleeps/retries or assertion weakening were introduced without justification.

Stop as clean no-op when:
- the failure cannot be reproduced after the agreed repeat count and no unsafe change is justified.

Stop as blocked when:
- CI-only environment or unavailable service is required.

Stop as stagnated when:
- two consecutive fixes fail with the same symptom and no new diagnosis.

Final response:
- root cause classification;
- changed files;
- repeat counts and results;
- remaining CI risk.
```
