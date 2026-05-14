# ICU Technician Knowledge App

A GitHub Pages-ready static web app for managing ICU Nurse Technician knowledge.

## What it does

- Imports and exports a portable JSON knowledge file
- Provides structured technician menu categories
- Supports quick capture notes
- Supports structured entry editing
- Tracks statuses: Confirmed, Provisional, Unverified, Contradiction, Open Question, Deprecated, Archived, Unprocessed
- Includes basic validation
- Generates ChatGPT prompts for transforming raw notes into structured entries

## First setup

1. Create a new GitHub repository.
2. Upload these files to the repository root.
3. Enable GitHub Pages from repository settings.
4. Open the published site.
5. Import `sample-data/empty-technician-knowledge.json` or load the sample from the app.
6. Export the updated JSON file into iCloud Drive.

## Recommended iCloud folder

```text
iCloud Drive/
└─ ICU Technician Knowledge/
   ├─ technician-knowledge.json
   ├─ backups/
   ├─ exports/
   └─ attachments/
```

## Important privacy note

Do not store patient-identifiable information, private staff information, or internal confidential hospital content in a public GitHub Pages site.

The safest model is:
- GitHub Pages hosts the app interface.
- Your actual knowledge JSON lives separately in iCloud Drive.
- You manually import/export the JSON file.
