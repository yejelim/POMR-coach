# DESIGN.md — POMR Coach

## Overview

POMR Coach is a local-first clinical reasoning workspace for medical clerkship students.

The interface should feel like a calm, structured, document-first workspace rather than a chatbot or hospital EMR. The product helps users reconstruct patient timelines, write pre-test and post-test impressions, define problem lists, write SOAP progress notes, receive AI feedback, and export clean submission PDFs.

The design should be inspired by Notion-like editorial clarity, but adapted for medical education:

- Documentation-first
- Calm and focused
- Minimal but not sterile
- Professional enough for clerkship and academic use
- Warm enough for students
- AI as a coach, not the primary author

The app should avoid looking like:

- a generic AI chatbot
- a cluttered hospital EMR
- a colorful gamified education app
- a one-off Codex-generated admin dashboard

The central visual principle:

> User draft first, AI feedback second.

The user’s writing area should always feel primary. AI feedback should appear as a secondary coaching layer.

---

## Brand Identity

### Product Name

POMR Coach

### Tagline

Write first. Reflect with AI. Learn from every case.

Use this tagline sparingly in docs or onboarding. In the running app, prefer the compact lockup:

```text
POMR Coach
by HealCode
```

### Korean Tagline

먼저 직접 쓰고, AI와 되돌아보며, 한 케이스마다 성장합니다.

### Brand Personality

- Calm
- Trustworthy
- Educational
- Clinical but not cold
- Minimal
- Structured
- Reflective
- Student-friendly
- Serious enough for hospital/academic use

---

## Design Direction

### Main Style

POMR Coach should feel like:

> A Notion-like clinical reasoning notebook with structured medical tables and a gentle coaching sidebar.

The app should use:

- a left workflow sidebar
- a calm top bar
- card-based writing sections
- readable tables
- subtle borders
- low shadows
- generous spacing
- restrained color accents
- Korean-English mixed clinical typography

Avoid:

- excessive gradients
- unnecessary illustrations
- many competing accent colors
- generic SaaS dashboard visuals
- oversized marketing-style hero sections inside the app
- repetitive explanatory text on every page

---

## Themes

POMR Coach should support multiple user-selectable themes.

MVP should include three themes:

1. Mint Clinical
2. Warm Brown
3. Dark Slate

Theme choice should affect:

- primary color
- background
- surface
- sidebar
- border
- text
- accent tint
- AI feedback panel tint
- badges

Theme choice should not affect:

- workflow structure
- clinical content hierarchy
- PDF export content
- AI behavior

---

# Theme 1 — Mint Clinical

This is the default theme.

Mood:

- clean
- clinical
- calm
- light
- trustworthy

Use for users who want a bright medical workspace.

```text
primary: #0F766E
primary-soft: #CCFBF1
primary-muted: #E6FFFA

accent: #2563EB
accent-soft: #DBEAFE

background: #F8FAFC
surface: #FFFFFF
surface-soft: #F1F5F9
surface-muted: #F8FAFC

sidebar: #FFFFFF
sidebar-active: #ECFDF5

border: #E2E8F0
border-strong: #CBD5E1

text-primary: #0F172A
text-secondary: #475569
text-muted: #64748B
text-faint: #94A3B8

success: #16A34A
warning: #D97706
danger: #DC2626

ai-surface: #F0FDFA
ai-border: #99F6E4
ai-text: #134E4A
```

---

# Theme 2 — Warm Brown

Mood:

- academic
- paper-like
- warm
- dark brown
- grounded
- reflective

Use for users who prefer a softer, less clinical, more study-notebook-like workspace with a deeper brown accent.

```text
primary: #5C2E1A
primary-soft: #D8B89C
primary-muted: #F4E7DC

accent: #8B3F18
accent-soft: #F4D7BD

background: #F7F1EB
surface: #FFFFFF
surface-soft: #EFE4D8
surface-muted: #FBF5EF

sidebar: #FFFAF5
sidebar-active: #EAD4C0

border: #DFC9B5
border-strong: #B98F70

text-primary: #21140F
text-secondary: #5A3A2B
text-muted: #7A5B4C
text-faint: #A78673

success: #166534
warning: #92400E
danger: #991B1B

ai-surface: #F7EADF
ai-border: #C99D7A
ai-text: #4A1F12
```

---

# Theme 3 — Dark Slate

Mood:

- focused
- quiet
- night-study
- professional
- low-glare

Use for night work and long study sessions.

```text
primary: #2DD4BF
primary-soft: #134E4A
primary-muted: #042F2E

accent: #60A5FA
accent-soft: #1E3A8A

background: #020617
surface: #0F172A
surface-soft: #111827
surface-muted: #1E293B

sidebar: #020617
sidebar-active: #0F2F2C

border: #1E293B
border-strong: #334155

text-primary: #F8FAFC
text-secondary: #CBD5E1
text-muted: #94A3B8
text-faint: #64748B

success: #22C55E
warning: #F59E0B
danger: #F87171

ai-surface: #0F2F2C
ai-border: #115E59
ai-text: #CCFBF1
```

---

## Color Usage Rules

### Primary Color

Use primary color for:

- primary buttons
- active sidebar item
- selected tabs
- section accent line
- focus rings
- important status badges

Do not use primary color for:

- long body text
- large background areas
- dense table fills

### Accent Color

Use accent color for:

- links
- informational badges
- secondary highlights
- selected references

### Semantic Colors

Use semantic colors sparingly:

- success for completed / controlled / resolved
- warning for pending / caution
- danger for critical / abnormal / worsening

Do not over-color clinical data. Tables should remain readable and calm.

---

## Typography

### Font Family

Use a font stack suitable for Korean-English mixed clinical notes.

Preferred:

```css
font-family: Pretendard, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

If Pretendard is not added yet, use the system fallback and leave a TODO.

### Type Scale

Use a practical app typography scale rather than large marketing typography.

| Token | Size | Weight | Line Height | Use |
|---|---:|---:|---:|---|
| display-sm | 28px | 600 | 1.25 | Page title / case title |
| heading-1 | 24px | 600 | 1.3 | Main section title |
| heading-2 | 20px | 600 | 1.35 | Subsection title |
| heading-3 | 18px | 600 | 1.4 | Card title |
| body-md | 15px | 400 | 1.6 | Main writing content |
| body-md-medium | 15px | 500 | 1.6 | Emphasis |
| body-sm | 14px | 400 | 1.55 | Supporting text |
| caption | 12px | 500 | 1.4 | Badges, metadata |
| table-cell | 13px | 400 | 1.45 | Dense clinical tables |
| button | 14px | 500 | 1.3 | Buttons |

### Typography Principles

- Prioritize readability over visual drama.
- Clinical notes need generous line height.
- Use 600 weight only for headings.
- Use 500 weight for buttons, active nav items, and labels.
- Avoid using too many font sizes on one screen.
- Use muted text for helper copy.
- Avoid repeating long explanatory text on every page.

---

## Layout

### App Shell

Use a stable workspace layout:

```text
Left sidebar | Top bar | Main editor area | Optional AI feedback panel
```

### Left Sidebar

Sidebar items should follow the workflow:

- Case Library
- Timeline
- Admission
- Impressions
- Problems
- Progress
- Export
- Settings

Sidebar should show:

- POMR Coach logo
- current case title if inside a case
- workflow navigation
- local-only / AI mode indicator near bottom

Active sidebar item:

- subtle tinted background
- primary color left border or icon
- medium-weight text

Avoid:

- overly colorful sidebar icons
- large sidebar explanation paragraphs
- complex nested navigation in MVP

### Top Bar

Top bar should show:

- case title
- department badge
- status badge: active / closed
- last saved
- export button if applicable

Top bar should be calm and thin.

### Main Area

Use a max-width for writing sections.

Recommended:

- main content max-width: 1120px
- wide table sections may use full available width
- page padding: 24px to 32px desktop
- mobile padding: 16px

### Section Rhythm

Use consistent vertical rhythm:

- page title margin bottom: 24px
- card gap: 16px
- major section gap: 24px
- form field gap: 12px
- table section gap: 16px

---

## Shapes

Use sober-editorial geometry inspired by Notion.

| Token | Value | Use |
|---|---:|---|
| radius-xs | 4px | tiny badges |
| radius-sm | 6px | small chips |
| radius-md | 8px | buttons, inputs |
| radius-lg | 12px | cards, tables |
| radius-xl | 16px | large panels |
| radius-full | 9999px | status pills only |

Rules:

- Buttons should use 8px radius, not full pills.
- Cards should use 12px radius.
- Badges may use full radius.
- Do not mix many radius styles on the same screen.

---

## Elevation

Keep the app mostly flat.

| Level | Treatment | Use |
|---|---|---|
| 0 | border only | default cards, tables |
| 1 | subtle shadow | hover/floating small panels |
| 2 | medium shadow | modals, command menu |
| 3 | stronger shadow | major overlay only |

Default cards should use:

- background surface
- 1px border
- no heavy shadow

Do not use marketing-style deep shadows in the main app.

---

## Components

### Buttons

#### Primary Button

Use for dominant actions:

- Save
- Create case
- Export PDF
- Confirm AI review

Style:

- background: primary
- text: white or theme-appropriate on-primary
- border: none
- radius-md
- height: 40px
- padding: 10px 16px
- font: button

#### Secondary Button

Use for secondary actions:

- Add row
- Add problem
- Preview prompt
- Cancel

Style:

- background: surface
- text: text-primary
- border: 1px solid border-strong
- radius-md

#### Ghost Button

Use for quiet actions:

- edit
- delete
- duplicate
- move

Style:

- transparent background
- muted text
- subtle active state

#### AI Review Button

Use for AI feedback actions.

Label examples:

- Initial impression 피드백 받기
- Final impression 피드백 받기
- Problem list 피드백 받기
- Assessment 피드백 받기
- 내 reasoning 검토받기

Style:

- can use primary-soft background with primary text
- should not visually overpower Save or Export
- should feel like “review” not “generate”

---

## Cards

### Standard Card

Use for:

- admission sections
- impression tables
- problem list
- progress note sections

Style:

- surface background
- 1px border
- radius-lg
- padding 20px
- no heavy shadow

### Section Header

Each card should have:

- concise title
- optional one-line helper text
- optional status badge

Avoid repeating long teaching explanations across all cards.

### Helper Text

Helper text should be:

- short
- contextual
- muted
- non-repetitive

Bad:

> This is where you should write your own thoughts before AI feedback because POMR Coach believes users should write first.

Good:

> 검사 결과를 보기 전, 문진과 PE만으로 먼저 작성하세요.

---

## Tables

Clinical tables are central to this app.

### Table Style

Use:

- compact but readable row height
- 13px table text
- subtle borders
- sticky header if table is long
- clear empty states
- muted placeholder text

Avoid:

- overly colorful cells
- spreadsheet-like visual noise
- heavy gridlines
- very small text below 12px

### Lab Table

Default columns:

```text
Test | Unit | Ref Range | OPD | Admission | ERCP day | Post-ERCP D1 | Interpretation
```

Lab table actions:

- Add row
- Add column
- Delete row
- Delete column

### Impression Table

Initial impression row fields:

- Rank
- Initial Impression / DDx
- Evidence from Hx/ROS/PE
- Evidence Against / Uncertainty
- Missing Data
- Dx Plan
- Tx Plan

Final impression row fields:

- Rank
- Final Impression
- Supporting Data
- Evidence Against / Remaining Uncertainty
- Dx Plan
- Tx Plan

### Problem List Table

Fields:

- Priority
- Problem
- Status
- Evidence
- Linked Impression
- Notes

Status badge colors:

- active: primary
- improving: success
- worsening: danger
- resolved: muted
- background: neutral
- pending: warning

---

## AI Feedback Panel

AI feedback must feel like coaching, not authorship.

### Placement

Preferred:

- right-side panel on desktop
- collapsible card below section on smaller screens

### Structure

AI feedback should be grouped into cards:

- Strengths
- Missing data
- Reasoning concerns
- Suggested revision
- Questions to ask
- Teaching points

### Visual Style

Use:

- ai-surface background
- ai-border border
- small “Coach Feedback” label
- no repeated disclaimer inside every feedback panel

Place the safety disclaimer once in a quiet app corner, such as the sidebar footer or case library header:

> 학습용 워크스페이스이며, 진료 판단을 대체하지 않습니다.

### Behavior

AI feedback must not:

- overwrite user input automatically
- appear before the user writes a draft
- be styled as the final answer
- encourage direct clinical decision-making

If user has not written enough:

> 먼저 본인의 draft를 작성한 뒤 피드백을 요청하세요.

---

## Empty States

Use calm, non-repetitive empty states.

### Timeline Empty

> 환자의 이야기를 시간순으로 재구성해보세요. EHR, 환자 문진, 입원 경과에서 중요한 사건을 추가할 수 있습니다.

### Admission Empty

> 문진, ROS, PE를 먼저 정리하세요. 검사 결과는 이후 final impression에서 반영합니다.

### Initial Impression Empty

> 검사 결과를 모두 보기 전에, 문진과 신체진찰을 바탕으로 initial impression을 먼저 작성해보세요.

### Lab Empty

> 검사 항목과 결과를 표로 정리하세요. 필요한 시점은 열로 추가할 수 있습니다.

### Final Impression Empty

> Lab, image, procedure 결과를 반영해 initial impression을 수정해보세요.

### Problem List Empty

> AI 제안을 보기 전에, 먼저 이 환자의 problem list를 직접 정의해보세요.

### Progress Empty

> 오늘의 V/S와 active problem을 바탕으로 SOAP note를 작성하세요.

---

## Microcopy Rules

Use Korean as the default UI language, with English medical terms preserved.

Good:

- Initial impression
- Final impression
- Problem list
- SOAP
- Dx plan
- Tx plan
- Monitoring
- Evidence
- Missing data

Avoid over-translating common medical terms.

### Tone

The app should sound:

- calm
- clear
- coaching-oriented
- concise

Avoid:

- overly cheerful tone
- excessive explanation
- repeated slogans
- chatbot-like phrasing
- judgmental language

---

## PDF Export Design

Submission PDF should be clean and professional.

Include:

- Admission note
- Pre-test Initial Impression table
- Lab/Image/Procedure summary
- Final Impression table
- Problem list
- Progress notes

Exclude:

- Timeline scratchpad
- AI feedback
- Flashcards
- Personal learning notes
- Learning reflection

### PDF Style

Use:

- white background
- black/dark slate text
- subtle table borders
- compact spacing
- small logo in header if available
- page numbers if feasible

PDF should not use the full app theme aggressively.

Even if the app is in dark mode, exported PDF should remain light and submission-friendly.

---

## Export Branding Options

Submission PDF export should allow the user to choose whether to include POMR Coach branding.

Add export options:

- [ ] Include POMR Coach logo in PDF header
- [ ] Include POMR Coach footnote/disclaimer in PDF footer

Default recommendation:

- For personal study export: branding can be enabled.
- For hospital/school submission export: branding should be optional and easy to disable.

The app should not force POMR Coach branding into submitted documents.

If branding is disabled:

- Do not show the POMR Coach logo in the header.
- Do not show app-related footnotes.
- Keep the document clean and submission-friendly.
- Preserve page numbers if enabled.
- Preserve clinical content formatting.

If branding is enabled:

- Use a small, subtle logo in the PDF header.
- Optional footer text should be concise and unobtrusive.

Example footer text:

> Generated with POMR Coach — educational note drafting workspace.

Korean footer text:

> POMR Coach에서 생성됨 — 학습용 POMR 작성 워크스페이스.

Do not include AI feedback, flashcards, or personal learning notes in submission PDFs regardless of branding settings.

---

## Logo Usage

Logo file should be placed in:

```text
public/POMR_coach_logo.png
```

If existing file is named `POMR_coach_loco.png`, ask before renaming or support the existing file.

Use logo in:

- sidebar header
- app favicon if feasible
- PDF header subtly, only when export branding is enabled

Do not:

- stretch logo
- recolor raster logo unless necessary
- make logo dominate the interface
- force logo into submission PDF when user disables branding

---

## Responsive Behavior

### Desktop

Use:

- persistent sidebar
- optional AI right panel
- wide tables
- comfortable card spacing

### Tablet

Use:

- collapsible sidebar
- AI feedback below content or drawer
- tables horizontally scrollable if needed

### Mobile

MVP does not need perfect mobile optimization, but should remain readable.

Use:

- single column layout
- collapsible navigation
- horizontal scroll for tables
- avoid tiny tap targets

Touch targets should be at least 40px high.

---

## Do

- Make the app feel like one coherent workspace.
- Use consistent radius, spacing, and typography.
- Use theme tokens instead of one-off colors.
- Keep clinical tables readable.
- Make user draft visually primary.
- Make AI feedback visually secondary.
- Use concise Korean microcopy.
- Preserve Korean-English mixed medical writing.
- Keep PDF export clean and submission-oriented.
- Let users hide app branding in exported submission PDFs.

---

## Don’t

- Do not make the app look like a chatbot.
- Do not make the app look like a cluttered EMR.
- Do not use too many colors on one page.
- Do not use large marketing hero sections inside the app.
- Do not repeat the same explanatory paragraph on every page.
- Do not style AI output as the final note.
- Do not over-gamify.
- Do not use heavy shadows for basic cards.
- Do not make buttons pill-shaped except status badges/tabs.
- Do not hardcode theme colors in individual components.
- Do not force POMR Coach branding into exported hospital/school submission PDFs.

---

## Implementation Guidance for Design Pass

When applying this design system:

1. Do not change core app functionality.
2. Do not rewrite data models.
3. Do not change AI behavior.
4. Create or update theme tokens first.
5. Refactor repeated UI styles into reusable components.
6. Standardize cards, tables, buttons, badges, and empty states.
7. Reduce repeated helper text.
8. Make the sidebar/topbar visually consistent.
9. Add theme switching only after base styling is tokenized.
10. Preserve all existing routes and workflows.
11. Add PDF branding options without changing exported clinical content.

Suggested implementation order:

1. Define design tokens and theme objects.
2. Standardize app shell: sidebar, topbar, main layout.
3. Standardize typography and spacing.
4. Standardize buttons and badges.
5. Standardize cards and section headers.
6. Standardize clinical tables.
7. Standardize AI feedback panels.
8. Add concise empty states.
9. Add theme switcher.
10. Polish PDF export styling.
11. Add PDF branding checkboxes for logo/footer visibility.

After implementation, report:

- files changed
- tokens added
- components refactored
- theme switcher behavior
- PDF branding option behavior
- known visual limitations
- what was intentionally left for later
