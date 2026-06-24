---
name: loop-select
description: Find or design the right bounded agent loop for a repeated task. Use when the user asks which loop to run, wants to convert AGENTS.md guidance into loops, or asks to design/adapt/audit a loop.
---

# Loop Select Skill

Use this skill to choose, adapt, or design a loop. Do not execute the loop unless the user explicitly asks you to run it.

Instructions:

1. Read `.agents/loops/README.md`.
2. Decide whether the task truly needs a loop. Use a one-shot task if one pass's result will not change the next pass.
3. If an existing loop fits, name it and provide a filled copy-ready prompt.
4. If no loop fits, use `.agents/loops/_template.md` to draft a new bounded loop.
5. Ensure the loop includes: trigger, fresh inputs, one bounded action, fixed check, state file, stop states, budget, and approval boundary.
6. Never grant production, destructive, privacy-sensitive, financial, or external-message authority through a loop prompt.
