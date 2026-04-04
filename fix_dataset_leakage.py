import json
import re
from pathlib import Path

FILES = [
    Path("frontend/src/data/msk/msk_full_dataset.json"),
    Path("frontend/src/data/pharma/pharma_full_dataset.json"),
    Path("frontend/src/data/neuro/neuro_full_dataset.json"),
]

CUT_MARKERS = [
    r"\bCorrect answer explanation\b",
    r"\bWrong answer explanation[s]?\b",
    r"\bBottom line:\b",
    r"\bChoice A:\b",
    r"\bChoice B:\b",
    r"\bChoice C:\b",
    r"\bChoice D:\b",
    r"\bChoice E:\b",
    r"\bChoice F:\b",
    r"\bChoice G:\b",
    r"\bChoice H:\b",
    r"\bHigh Yield USMLE Audio Answer\b",
    r"\bCut to the chase Audio Answer\b",
    r"https?://\S+",
    r"\bSubject\b",
    r"\bSystem\b",
    r"\bTopic\b",
]

META_PATTERNS = [
    r"\bAnatomy\b",
    r"\bPharmacology\b",
    r"\bHistology\b",
    r"\bPathology\b",
    r"\bBiochemistry\b",
    r"\bGeneral Principles\b",
    r"\bCell and molecular biology\b",
    r"\bNeurology\b",
    r"\bMusculoskeletal\b",
]

def clean_spaces(text: str) -> str:
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def cut_at_markers(text: str) -> str:
    if not text:
        return ""
    out = text
    for pat in CUT_MARKERS:
        out = re.split(pat, out, flags=re.I)[0]
    return clean_spaces(out)

def strip_meta_tail(text: str) -> str:
    if not text:
        return ""
    out = text
    # remove long metadata tails like "Anatomy Neurology ... Subject System Topic"
    out = re.sub(r"(Anatomy|Pharmacology|Histology|Pathology|Biochemistry).*$", "", out, flags=re.I)
    return clean_spaces(out)

def sanitize_option(text: str) -> str:
    t = clean_spaces(text or "")
    t = cut_at_markers(t)
    t = strip_meta_tail(t)
    return t

def looks_like_bad_stem(text: str) -> bool:
    t = clean_spaces(text or "")
    if not t:
        return True
    if re.match(r"^(The correct answer is\b|Choice [A-H]:\b|Bottom line\b)", t, flags=re.I):
        return True
    if len(t) < 20:
        return True
    return False

def salvage_stem_from_explanation(rec: dict) -> str:
    """
    If stem is bad/missing, try to recover the first real vignette sentence
    from explanation or bottom_line. Conservative only.
    """
    candidates = [
        rec.get("stem", ""),
        rec.get("explanation", ""),
        rec.get("bottom_line", ""),
    ]
    for cand in candidates:
        c = clean_spaces(cand or "")
        # Try to find a vignette start
        m = re.search(r"(A|An)\s+\d{1,3}-year-old\b.*", c)
        if m:
            return cut_at_markers(m.group(0))
    return cut_at_markers(clean_spaces(rec.get("stem", "")))

def sanitize_stem(rec: dict) -> str:
    stem = clean_spaces(rec.get("stem", ""))
    stem = cut_at_markers(stem)
    stem = strip_meta_tail(stem)
    if looks_like_bad_stem(stem):
        stem = salvage_stem_from_explanation(rec)
    return clean_spaces(stem)

def sanitize_explanation(text: str) -> str:
    t = clean_spaces(text or "")
    # remove repeated links / junk
    t = re.sub(r"https?://\S+", "", t)
    return clean_spaces(t)

for path in FILES:
    data = json.loads(path.read_text(encoding="utf-8"))
    fixed = []
    for rec in data:
        rec = dict(rec)
        rec["stem"] = sanitize_stem(rec)

        opts = rec.get("options", {})
        if isinstance(opts, dict):
            new_opts = {}
            for key, val in opts.items():
                new_opts[key] = sanitize_option(val)
            rec["options"] = new_opts

        rec["answer_text"] = sanitize_option(rec.get("answer_text", ""))
        rec["explanation"] = sanitize_explanation(rec.get("explanation", ""))
        rec["bottom_line"] = sanitize_explanation(rec.get("bottom_line", ""))

        fixed.append(rec)

    path.write_text(json.dumps(fixed, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"fixed: {path} ({len(fixed)} questions)")
