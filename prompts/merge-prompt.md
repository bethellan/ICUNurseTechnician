# ICU Technician Knowledge Merge Prompt

Compare the new JSON entries against the existing ICU Technician knowledge file.

Rules:
- Do not duplicate entries that are substantially the same.
- If new information confirms old information, preserve source history and promote confidence only when justified.
- If new information conflicts, keep both meanings and create or update a Contradiction/Open Question entry.
- Do not delete older knowledge unless explicitly marked deprecated.
- Return a JSON patch plan with:
  - addEntries
  - updateEntries
  - possibleDuplicates
  - contradictions
  - questionsForAndrew

Existing JSON:
[PASTE EXISTING FILE OR RELEVANT SECTION]

New JSON:
[PASTE NEW ENTRIES]
