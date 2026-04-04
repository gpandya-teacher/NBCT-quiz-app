import json
from pathlib import Path

FILES = [
    Path("frontend/src/data/pharma/pharma_full_dataset.json"),
    Path("frontend/src/data/msk/msk_full_dataset.json"),
    Path("frontend/src/data/neuro/neuro_full_dataset.json"),
    Path("frontend/src/data/renal/renal_full_dataset.json"),
]

for path in FILES:
    if not path.exists():
        continue

    data = json.loads(path.read_text(encoding="utf-8"))
    fixed = 0

    for q in data:
        options = q.get("options", {})
        letter = (q.get("answer_letter") or "").strip()
        answer_text = (q.get("answer_text") or "").strip()

        if letter and isinstance(options, dict) and letter in options:
            clean_option = str(options[letter]).strip()

            # If answer_text is missing, blank, or just a dot, repair it
            if not answer_text or answer_text == ".":
                q["answer_text"] = clean_option
                fixed += 1

    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{path}: repaired {fixed} questions")
