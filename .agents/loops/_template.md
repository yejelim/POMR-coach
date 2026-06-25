# Loop Template

Use this template to design a new loop. Delete unused sections before using it.

## Use when

- [Describe the repeated task.]
- Use only if one pass's result should change the next pass.

## Do not use when

- The task is one-shot.
- There is no reliable check.
- The action is production, destructive, financial, privacy-sensitive, or externally visible without approval.

## Copy-ready prompt

```text
Run the [loop name] loop.

Goal:
[measurable outcome]

Fresh inputs:
- [files/logs/tests/metrics/reports to inspect]

Scope:
- You may change: [paths]
- You must not change: [paths/actions]

Per pass:
1. Inspect fresh inputs.
2. Choose one bounded, reversible action using [criteria].
3. Make the smallest relevant change.
4. Run the fixed check: [command/rubric/benchmark].
5. Record changed files, check output, evidence, and next step in [state file].
6. Keep the change only if the check improves or remains passing.

Repeat only while progress is measurable and [budget] remains.

Stop successfully when:
- [success gate]

Stop without changes when:
- [no-op condition]

Stop and report blocked when:
- [missing dependency/approval/secret/data/service]

Stop as exhausted when:
- [time/cost/iteration budget]

Stop as stagnated when:
- [same failure repeats with no new diagnosis]

Ask for approval before:
- [production/destructive/privacy/financial/external action]

Finish with:
- [PR/report/artifact/handoff]
```

## Verification

The fixed check should be stable across passes. Do not move the target after seeing results.
