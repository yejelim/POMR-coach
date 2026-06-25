---
name: test-stabilizer
description: Stabilize flaky or intermittent tests without hiding real failures.
---

# Test Stabilizer Skill

Use when tests fail intermittently, depend on order, race timing, leaked state, random seeds, or CI-only conditions.

Instructions:

1. Read `.agents/loops/test-stabilizer.md`.
2. Reproduce with a repeat command before changing code when possible.
3. Fix root cause; avoid blind sleeps, broad retries, or weakened assertions unless justified.
4. Stop only after the repeat target and broader relevant check pass, or report the correct non-success terminal state.
