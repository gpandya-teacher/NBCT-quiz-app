import json
from pathlib import Path

FILES = [
    Path("frontend/src/data/pharma/pharma_full_dataset.json"),
    Path("frontend/src/data/msk/msk_full_dataset.json"),
    Path("frontend/src/data/neuro/neuro_full_dataset.json"),
]

for path in FILES:
    data = json.loads(path.read_text())
    for q in data:
        if not q.get("answer_letter") and q.get("options"):
            # fallback: if answer_text matches option, recover letter
            ans = q.get("answer_text", "").strip()
            for k, v in q["options"].items():
                if v.strip() == ans:
                    q["answer_letter"] = k
        # also ensure key exists
        if "answer_letter" not in q:
            q["answer_letter"] = ""

    path.write_text(json.dumps(data, indent=2))
    print("fixed answers:", path)
