<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Notes

- Keep the Next.js rules block above intact unless the workspace conventions change.
- Add new project-specific guidance below this section.
- Prefer short, direct instructions that help future edits stay consistent.

## Project: POMR Coach

POMR Coach is a clinical reasoning workspace for medical clerkship students.

Its primary goal is to help students create structured POMR-based clinical notes while studying real patient cases during clerkship. The app should reduce the non-learning burden of formatting and exporting notes for submission, while preserving a clean, staged clinical reasoning workflow.

At the current stage, the highest priority is **not** to build a full AI assistant.  
The highest priority is to complete a stable local-first version that allows users to:

1. Enter POMR-related clinical information in a structured way.
2. Save and edit that information locally.
3. Export a clean, readable POMR note as PDF.
4. Use the app safely without requiring external medical AI APIs.

AI assistant features can be added later as optional enhancements.

---

## Core Working Principle

When receiving new feedback or change requests, do **not** blindly rewrite the whole app.

Always preserve the existing major structure, user flow, and already-working features unless there is a clear reason to change them.

The preferred working style is:

1. Identify what is already working well.
2. Keep the existing flow as the main backbone.
3. Break the requested changes into small, safe tasks.
4. Prioritize changes that improve usability and export quality.
5. Avoid large architectural rewrites unless absolutely necessary.
6. Make incremental improvements that are easy to test.

Even if the user gives multiple complex feedback items at once, handle them in a practical order.  
Do not attempt to solve everything by restructuring the entire project.

---

## Product Philosophy

POMR Coach should feel like a practical clerkship tool, not a complicated EMR clone.

The app should help users think like clinicians by guiding them through structured note-writing stages:

1. Home / case selection
2. Timeline memo
3. Admission note
4. Labs / images / procedures
5. Initial impression
6. Final impression
7. Progress notes
8. Export

The app should remain simple enough for medical students to use during a busy hospital day.

---

## Current Development Priority

The current priority is to complete a **local-first, AI-free MVP**.

This version should be useful even without AI assistant functionality.

The first public or GitHub-distributed version should focus on:

- Local desktop use
- Structured note input
- Reliable save/load behavior
- Clean PDF export
- Image attachment support where clinically useful
- Safe handling of empty fields
- Minimal privacy risk by avoiding external API calls

AI assistant features should be treated as a later module, not a blocker for MVP release.

---

## Important Privacy and Safety Assumptions

The app is intended for educational use by medical clerkship students.

The app should avoid collecting directly identifiable patient information.

Do not design the app around patient names, registration numbers, resident numbers, phone numbers, addresses, or exact identifiers.

Prefer safer clinical abstractions such as:

- Age range or approximate age
- Sex
- Hospital day rather than exact calendar dates
- Past medical history
- Symptoms
- Physical exam findings
- Lab values
- Imaging reports
- De-identified screenshots or images where possible

For the current MVP, do not require any external AI API.

If AI features are added later, they should be optional and clearly separated from the core local note/export workflow.

---

## Navigation Requirement

The main POMR Coach logo at the top of the app should behave as a home button.

From any screen or workflow stage, clicking the top logo should return the user to the initial home screen.

This should be implemented in a way that does not break the current navigation structure.

If the user has unsaved changes, automatic temporary saving would be nice, but it is not the highest priority right now.

Priority for this item:

1. Logo click returns to home.
2. Preserve existing user data if already saved.
3. Consider autosave or temporary save later.

Do not over-engineer autosave in the first pass unless it is simple and safe.

---

## Lab / Image / Procedure Input Requirements

The current app allows imaging results to be entered mainly as text reports. This is still important because future AI assistant feedback may use text-based prompts.

However, POMR Coach also has another important purpose: helping students create clean exportable POMR notes for clerkship submission.

Therefore, the app should support image uploads in clinical data sections where appropriate.

### Required improvement

Expand the Lab / Image / Procedure input flow so users can attach images.

Examples of supported image use cases:

- PACS screenshot
- X-ray image
- CT/MRI key screenshot
- Endoscopy image
- Procedure-related image
- Clinical figure or captured report image

### Important distinction

For future AI assistant features, only text-based reports may be passed into the AI prompt.

Uploaded images do not need to be interpreted by AI in the MVP.

For now, uploaded images should primarily support:

1. User study
2. Case organization
3. PDF export
4. Visual documentation

Do not block image upload implementation just because AI image interpretation is not ready.

---

## Export Requirements

Export quality is one of the most important MVP features.

The exported PDF should be clean, readable, and suitable for clerkship note submission or personal study review.

### Empty field handling

Currently, empty fields may still appear in exported PDF with their section title, such as:

`Procedure findings -`

This should be fixed.

If the user leaves a field empty, that field should be excluded from the exported document.

The export logic should skip empty entities.

Examples:

- If no procedure was performed, do not show “Procedure findings.”
- If no image was uploaded, do not show an empty image section.
- If a subsection has no meaningful content, do not export that subsection.
- If an entire section is empty, omit the whole section.

The goal is to avoid clutter and improve final PDF readability.

### Definition of empty

Treat the following as empty:

- `null`
- `undefined`
- empty string
- whitespace-only string
- empty array
- empty object with no meaningful child values
- image field with no uploaded image
- table row where all cells are empty

Be careful not to remove clinically meaningful values such as:

- `0`
- `negative`
- `none`
- `not checked`
- `not applicable`
- `WNL`
- `normal`
- `no abnormal finding`

If the user explicitly typed something, preserve it.

---

## Progress Note Export Requirements

Progress notes are a major part of POMR Coach.

If users enter SOAP items in a table-like structure, the exported PDF should preserve that table-like structure as much as possible.

### Required improvement

Progress note SOAP sections should be exported in a structured table format.

Recommended structure:

| Problem | Subjective | Objective | Assessment | Plan |
|---|---|---|---|---|

Alternatively, if the current app structure organizes one problem at a time, this format is also acceptable:

### Problem: [Problem name]

| SOAP item | Content |
|---|---|
| S | Subjective content |
| O | Objective content |
| A | Assessment content |
| P | Plan content |

Choose the format that best fits the existing implementation with minimal disruption.

Do not rewrite the entire progress note system if a simpler export formatting change can achieve the goal.

### Objective section image support

The Objective section of progress notes should allow image attachments when clinically useful.

Examples:

- Follow-up chest X-ray
- ECG screenshot
- Wound photo, if de-identified and appropriate
- Lab trend graph
- Imaging follow-up screenshot

For the MVP, these images only need to be stored and exported.  
They do not need AI interpretation.

---

## Image Upload and Export Behavior

Image upload should be implemented carefully and simply.

Recommended behavior:

1. Allow image upload in relevant sections.
2. Show uploaded image preview in the UI.
3. Allow user to remove or replace uploaded image.
4. Store image locally or in the existing local data model.
5. Include uploaded images in PDF export.
6. Resize images reasonably in PDF so layout remains readable.
7. Avoid oversized images breaking the PDF layout.

Supported image formats should include common formats such as:

- PNG
- JPEG
- JPG
- WebP if easy to support

Do not add unnecessary complex image editing features.

---

## Local-First MVP Requirement

The first release should be usable without internet access after installation.

The app should not depend on an external medical AI API for core functionality.

The MVP should be distributable through GitHub so that other clerkship students can download and run it locally on their own desktop.

Prioritize:

- Simple installation
- Clear README
- Local data persistence
- Export reliability
- No required login
- No required cloud backend
- No required API key

Avoid introducing unnecessary server dependencies unless already part of the app architecture.

---

## AI Assistant Policy for Current Stage

Do not prioritize AI assistant implementation before the core note-taking and export workflow is stable.

AI assistant features are planned, but they should be modular and optional.

Future AI assistant may provide feedback on:

- Initial impression quality
- Final impression ranking
- Diagnostic plan
- Treatment plan
- Problem list consistency
- SOAP note completeness

However, for now:

- Do not block MVP on AI assistant.
- Do not require API keys.
- Do not send clinical data externally.
- Do not build the app around AI-first assumptions.
- Keep text data structured so AI integration can be added later.

---

## Preferred Task Prioritization

When multiple issues are provided, handle them in this general order:

### Priority 1: Preserve and stabilize existing core flow

- Do not break existing note creation.
- Do not break existing save/load.
- Do not break existing export.
- Do not remove existing screens unless clearly obsolete.

### Priority 2: Navigation usability

- Make the top POMR Coach logo return to the home screen.
- Keep this implementation simple.

### Priority 3: Export cleanup

- Remove empty fields from exported PDF.
- Improve readability of exported notes.
- Preserve meaningful user-entered values.

### Priority 4: Progress note export formatting

- Export SOAP notes as tables or table-like structured blocks.
- Match the user’s input structure as closely as practical.

### Priority 5: Image upload support

- Add image upload to Lab/Image/Procedure sections.
- Add image upload support to Objective fields in progress notes.
- Include uploaded images in PDF export.

### Priority 6: Local-first release preparation

- Ensure the app can run locally.
- Prepare README or usage instructions.
- Avoid external API dependency.

### Priority 7: Later AI assistant features

- Add only after the MVP is stable.
- Keep optional and modular.

---

## Coding Style and Implementation Guidance

Prefer small, targeted changes.

Before making a change, inspect the current implementation and identify the least disruptive way to satisfy the requirement.

Avoid broad refactoring unless:

- The current implementation is blocking the requested feature.
- The current structure is clearly broken.
- A small refactor will significantly reduce future bugs.

When modifying export logic, consider creating reusable helper functions such as:

- `isEmptyValue(value)`
- `hasMeaningfulContent(section)`
- `filterEmptyFields(data)`
- `renderSectionIfNotEmpty(section)`
- `renderImages(images)`
- `renderSoapTable(progressNote)`

The exact function names can vary depending on the codebase.

---

## Empty Field Filtering Guidance

Implement a robust utility for detecting empty values.

Pseudo-logic:

```ts
function isMeaningfullyEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isMeaningfullyEmpty);
  }

  if (typeof value === "object") {
    return Object.values(value).every(isMeaningfullyEmpty);
  }

  return false;
}

```

Be careful not to treat 0 or false as automatically empty if they may be meaningful in the app.

⸻

## PDF Export Design Guidance

The PDF should be clean and submission-friendly.

General principles:

* Avoid exporting empty headings.
* Keep section hierarchy clear.
* Use consistent spacing.
* Use tables for structured data when helpful.
* Keep images reasonably sized.
* Avoid page overflow.
* Avoid awkward dangling section titles at the bottom of pages.
* Preserve the clinical flow of the note.

## Recommended export order:

1. Basic case information
2. Timeline memo
3. Admission note
4. Initial impression
5. Lab / Image / Procedure findings
6. Final impression
7. Progress notes
8. Optional appendix for uploaded images, if inline export is difficult

If inline image export becomes layout-heavy, it is acceptable to place images in an appendix-like section at the end, as long as they are clearly labeled and associated with the relevant note section.

⸻

## Data Model Guidance for Images

If the existing data model does not support images, extend it minimally.

Each uploaded image should ideally include:

* id
* file name
* file type
* local data URL or local file reference
* section association
* optional caption
* optional note
* upload timestamp if easy

Example:
type UploadedImage = {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl?: string;
  localPath?: string;
  caption?: string;
  note?: string;
  createdAt?: string;
};

Use whichever storage method best fits the existing app.

For a local-first MVP, avoid cloud storage.

⸻

## UI Guidance

Keep the UI simple and medical-student-friendly.

For image upload UI:

* Use clear labels such as “Upload image”
* Show preview after upload
* Provide remove/replace controls
* Allow optional captions
* Avoid complex image management panels

For progress notes:

* Preserve the current workflow if it already works.
* Improve export formatting before redesigning the entire input UI.
* Add Objective image upload only in a way that fits the current structure.

⸻

## Release Guidance

The first GitHub-ready version should be positioned as:

“POMR Coach MVP: local structured POMR note builder and PDF exporter for clerkship students.”

Do not market it as an AI diagnostic tool.

Do not imply that it provides medical advice.

Recommended README emphasis:

* Educational tool
* Local-first
* No external AI required
* Helps structure POMR notes
* Helps export study/submission notes
* Users should remove identifiable patient information
* Not a medical device
* Not for direct patient care decision-making

⸻

## What Not To Do

Do not:

* Rewrite the entire app from scratch.
* Replace working flows without a reason.
* Prioritize AI assistant before export and local usability.
* Require cloud login.
* Require an external API key for MVP.
* Send clinical data externally in the core version.
* Export empty section titles.
* Break existing PDF export while improving formatting.
* Add complex image interpretation features at this stage.
* Turn the app into a full EMR clone.
* Overcomplicate the UI.

⸻

## Expected Agent Behavior

When working on this repository, act like a careful senior engineer.

You should:

1. Understand the existing code before editing.
2. Preserve the current working structure.
3. Make the smallest useful change.
4. Prioritize user-facing stability.
5. Explain what you changed.
6. Mention any trade-offs or limitations.
7. Suggest next steps only after completing the current task.

When multiple requested changes are present, choose a sensible order and proceed step by step.

The user expects practical judgment, not mechanical obedience.

The correct behavior is to improve the app steadily while keeping the already-working POMR Coach experience intact.