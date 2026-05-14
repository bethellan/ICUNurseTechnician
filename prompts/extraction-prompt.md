# ICU Technician App Entry Extraction Prompt

Convert the provided raw ICU Technician note into structured JSON for the ICU Technician Knowledge App.

Rules:
- Preserve exact operational details.
- Do not invent missing information.
- Do not convert uncertainty into certainty.
- If local workflow is unclear, use status "Open Question" or "Unverified".
- Use one of the app categories only.
- Return JSON only, no markdown.

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

Raw note:
[PASTE NOTE HERE]
