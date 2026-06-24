# Report sample

Canonical preview of the **Submission PDF Export** report (`src/export/templates/submission-html.ts`),
so the current design can be reviewed without running the app.

| File | What it is |
|------|------------|
| `report-sample.pdf` | Authoritative A4 print-to-PDF artifact (what "Print / Save as PDF" produces). |
| `report-sample.html` | The rendered HTML; open it in a browser to inspect or print interactively. |

The case is **fully synthetic and de-identified** — no real patient data.

## Regenerating

Run this after any change to the report template so the committed sample stays current:

```bash
npm run report:sample
```

- HTML is always (re)generated via Vite SSR (the same module pipeline the tests use).
- The PDF additionally needs a Chromium-based browser (Chrome or Edge). Auto-detection
  covers the common install paths; set `CHROME_PATH` to override.
- The "Date generated" / footer timestamp reflects when the sample was generated, so a
  regenerated sample will differ by that timestamp even if the design is unchanged.
