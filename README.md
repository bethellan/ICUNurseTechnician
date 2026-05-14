# ICU Technician Knowledge App v2

GitHub Pages-ready static web app for managing ICU Nurse Technician knowledge.

## What it does

- Imports and exports a portable JSON knowledge file
- Provides structured technician menu categories
- Supports quick capture notes
- Supports structured entry editing
- Tracks statuses: Confirmed, Provisional, Unverified, Contradiction, Open Question, Deprecated, Archived, Unprocessed
- Includes basic validation
- Generates ChatGPT prompts for transforming raw notes into structured entries
- Imports ChatGPT update batches through a merge-review screen
- Detects likely duplicates and supports Add / Merge / Keep separate / Reject / Contradiction

## v2 merge-review workflow

1. Ask ChatGPT to convert a batch of technician notes into JSON entries.
2. Save or copy that JSON as a file.
3. In the app, click **Import Update Batch**.
4. Review each imported entry.
5. Choose Add, Merge, Keep separate, Reject, or Add as contradiction/open question.
6. Click **Apply accepted changes**.
7. Export the updated JSON and save it to iCloud Drive.

## Privacy model

The app does not send your notes anywhere. All importing, reviewing, editing and exporting is done in the browser.

Recommended model:

```text
GitHub Pages = app/interface only
iCloud Drive = private technician-knowledge.json file
ChatGPT = structured note transformer
```

Do not commit your live `technician-knowledge.json` file to a public GitHub repository.
