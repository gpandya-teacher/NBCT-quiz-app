import json
import re
from pathlib import Path

FILES = [
    Path("frontend/src/data/pharma/pharma_full_dataset.json"),
    Path("frontend/src/data/msk/msk_full_dataset.json"),
    Path("frontend/src/data/neuro/neuro_full_dataset.json"),
]

BAD_STEM_PATTERNS = [
    r"^\s*the correct answer is\b",
    r"^\s*bottom line\b",
    r"^\s*choice [a-e]\b",
    r"^\s*https?://",
]

BAD_OPTION_PATTERNS = [
    r"^\s*choice [a-e]\b",
    r"^\s*the correct answer is\b",
    r"^\s*bottom line\b",
    r"^\s*correct answer explanation\b",
    r"^\s*https?://",
]

def norm(s):
    if s is None:
        return ""
    s = str(s)
    s = s.replace("\u00a0", " ")
    s = re.sub(r"https?://\S+", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def looks_bad_stem(stem: str) -> bool:
    s = norm(stem).lower()
    if len(s) < 35:
        return True
    for pat in BAD_STEM_PATTERNS:
        if re.search(pat, s, flags=re.I):
            return True
    if "correct answer explanation" in s:
        return True
    if "wrong answer explanation" in s:
        return True
    if s.count("choice a") or s.count("choice b"):
        return True
    return False

def clean_stem(stem: str) -> str:
    s = norm(stem)
    # truncate if explanation text leaked into stem
    s = re.split(r"Correct answer explanation|Wrong answer explanation|Bottom line:", s, flags=re.I)[0].strip()
    return s

def option_is_valid(text: str) -> bool:
    t = norm(text)
    if not t:
        return False
    if len(t) > 180:
        return False
    low = t.lower()
    for pat in BAD_OPTION_PATTERNS:
        if re.search(pat, low, flags=re.I):
            return False
    # explanations often contain punctuation-heavy long prose
    if low.count(".") > 2:
        return False
    if " because " in low or " presents with " in low:
        return False
    return True

def clean_options(opts):
    if not isinstance(opts, dict):
        return None
    out = {}
    for key in ["A", "B", "C", "D", "E", "F"]:
        if key in opts:
            val = norm(opts[key])
            if option_is_valid(val):
                out[key] = val
    return out

def record_is_valid(rec):
    stem = clean_stem(rec.get("stem", ""))
    if looks_bad_stem(stem):
        return False, None, None

    options = clean_options(rec.get("options", {}))
    if not options or len(options) < 2:
        return False, None, None

    answer_letter = norm(rec.get("answer_letter", ""))
    if answer_letter and answer_letter not in options:
        # allow missing answer if everything else is okay
        answer_letter = ""

    cleaned = dict(rec)
    cleaned["stem"] = stem
    cleaned["options"] = options
    cleaned["answer_letter"] = answer_letter
    cleaned["answer_text"] = norm(rec.get("answer_text", ""))
    cleaned["explanation"] = norm(rec.get("explanation", ""))
    cleaned["bottom_line"] = norm(rec.get("bottom_line", ""))
    cleaned["topic"] = norm(rec.get("topic", "General")) or "General"

    # normalize images
    imgs = rec.get("question_images", [])
    if isinstance(imgs, list):
        cleaned["question_images"] = [norm(x) for x in imgs if norm(x)]
    else:
        cleaned["question_images"] = []

    return True, cleaned, stem

for path in FILES:
    data = json.loads(path.read_text(encoding="utf-8"))
    cleaned_rows = []
    dropped = 0

    for rec in data:
        ok, cleaned, _ = record_is_valid(rec)
        if ok:
            cleaned_rows.append(cleaned)
        else:
            dropped += 1

    path.write_text(json.dumps(cleaned_rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"{path}: kept {len(cleaned_rows)} | dropped {dropped}")

