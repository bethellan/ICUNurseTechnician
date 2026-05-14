# ICU Technician JSON Batch Prompt for App v2

Convert the following notes into a JSON object with this exact shape:

{
  "entries": [
    {
      "id": "",
      "title": "",
      "category": "",
      "subcategory": "",
      "status": "",
      "importance": "",
      "summary": "",
      "bodyMarkdown": "",
      "locations": [],
      "people": [],
      "tags": [],
      "sourceRefs": [],
      "lastUpdated": "",
      "changeLog": []
    }
  ]
}

Rules:
- Preserve operational wording.
- Do not invent missing details.
- Do not make uncertain content Confirmed.
- Use "Open Question" if the note is asking for clarification.
- Use "Contradiction" if the note conflicts with existing knowledge.
- Return JSON only.

Allowed categories:
- Daily / Weekly / Monthly Routines
- Equipment & Devices
- Consumables & Stock
- Systems, Ordering & Fault Reporting
- Contacts & Escalation
- Open Questions & Contradictions
- Policies, Manuals & Resources

Allowed statuses:
- Confirmed
- Provisional
- Unverified
- Contradiction
- Open Question
- Deprecated
- Archived
- Unprocessed

Notes:
[PASTE NOTES HERE]
