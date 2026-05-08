#!/usr/bin/env python3
"""
Correct OCR gender errors in voters_raw.json, then rebuild families.json.

Priority for gender determination:
  1. relType = "husband" → Female  (person IS a wife — from form structure, not OCR)
  2. relType = "wife"    → Male    (person IS a husband — from form structure)
  3. Name suffix patterns → reliable for most Hindi names
  4. OCR gender field → last resort
"""

import json, re

VOTERS_PATH  = "data/voters_raw.json"
FAMILIES_PATH = "data/families.json"

# ── Gender inference ──────────────────────────────────────────────────────────

FEMALE_SUFFIXES = ["देवी", "कुमारी", "बाई", "वती", "मती", "बेगम", "बीबी"]
MALE_SUFFIXES   = ["कुमार", "राम", "लाल", "सिंह", "प्रसाद", "नाथ", "दास",
                   "चन्द", "चंद", "शर्मा", "पाल", "गुप्ता", "वर्मा"]

# Common names where suffix alone isn't enough
KNOWN_FEMALE = ["सुनीता", "रेखा", "गीता", "सीता", "मीना", "नीता", "रीता", "लता",
                "आशा", "उषा", "ऊषा", "अनीता", "ममता", "कमला", "सरोज", "रमा",
                "सरिता", "कांता", "शकुन्तला", "सावित्री", "विमला", "शांति",
                "इंदिरा", "पुष्पा", "संतोष", "रंजना", "सुदर्शना", "वीना",
                "कविता", "संगीता", "निर्मला", "सुषमा", "रजनी", "कलाशां",
                "रसीद बीबी", "रमजान", "प्रियंका", "अदिति", "आंचल", "हेमा",
                "नीलमा", "रजिन्द्र कुमार", "अनिकेत", "अभिलेख"]

def name_gender(name):
    for s in FEMALE_SUFFIXES:
        if s in name:
            return "F"
    n = name.strip()
    for kf in KNOWN_FEMALE:
        if n.startswith(kf):
            return "F"
    for s in MALE_SUFFIXES:
        if n.endswith(s) or f" {s}" in n:
            return "M"
    return None

def infer_gender(voter):
    rt = voter.get("relType", "")
    name = voter.get("name", "")
    # relType is the most reliable signal
    if rt == "husband":
        return "F"
    if rt == "wife":
        return "M"
    # Name suffix
    ng = name_gender(name)
    if ng:
        return ng
    # Fall back to OCR field
    return voter.get("gender", "M")

# ── Family building (same logic as parse_voters.py) ──────────────────────────

def normalize_house(h):
    return re.sub(r"[^0-9A-Za-z\-]", "", h).upper()

def norm(s):
    return re.sub(r"[^ऀ-ॿa-zA-Z\s]", "", (s or "").strip()).lower()

def build_families(voters):
    by_house = {}
    for v in voters:
        key = normalize_house(v.get("house", "X")) or "UNKNOWN"
        by_house.setdefault(key, []).append(v)

    families = []
    fid = 1
    for house_key, members in sorted(by_house.items()):
        if not members:
            continue
        for i, m in enumerate(members):
            m["id"] = f"h{house_key}_m{i}"

        name_to_id = {m["name"]: m["id"] for m in members}
        for m in members:
            rel_name = m.get("relName", "")
            matched_id = name_to_id.get(rel_name)
            if not matched_id:
                for name, mid in name_to_id.items():
                    if rel_name and (rel_name in name or name in rel_name) and mid != m["id"]:
                        matched_id = mid
                        break
            m["linkedTo"] = matched_id

        # Head: oldest male without a parent in this house
        males = [m for m in members if m.get("gender") == "M"]
        root = None
        for m in sorted(males, key=lambda x: -x.get("age", 0)):
            if not m.get("linkedTo"):
                root = m
                break
        if not root:
            root = sorted(members, key=lambda x: -x.get("age", 0))[0]

        families.append({
            "id": f"f{fid}",
            "house": house_key,
            "headId": root["id"],
            "headName": root["name"],
            "members": members,
        })
        fid += 1
    return families

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("📂 Reading voters_raw.json...")
    with open(VOTERS_PATH, encoding="utf-8") as f:
        voters = json.load(f)

    print(f"   {len(voters)} voters loaded.")

    # Count before
    ocr_errors_before = sum(1 for v in voters if v.get("relType") == "husband" and v.get("gender") == "M")
    print(f"   Gender errors (husband+M): {ocr_errors_before}")

    # Fix gender
    fixed = 0
    for v in voters:
        correct = infer_gender(v)
        if correct != v.get("gender"):
            v["gender"] = correct
            fixed += 1

    print(f"   ✅ Gender corrected for {fixed} voters")

    # Save corrected voters
    with open(VOTERS_PATH, "w", encoding="utf-8") as f:
        json.dump(voters, f, ensure_ascii=False, indent=2)
    print(f"   ✓ Saved {VOTERS_PATH}")

    # Rebuild families
    print("\n🏠 Rebuilding families...")
    families = build_families(voters)
    print(f"   ✅ {len(families)} families built")

    with open(FAMILIES_PATH, "w", encoding="utf-8") as f:
        json.dump(families, f, ensure_ascii=False, indent=2)
    print(f"   ✓ Saved {FAMILIES_PATH}")

    # Quick sanity check
    husband_M = sum(1 for fam in families for m in fam["members"]
                    if m.get("relType") == "husband" and m.get("gender") == "M")
    print(f"\n🔍 Sanity: husband+M remaining after fix: {husband_M} (should be 0)")
    print("✅ Done. Run reimport_to_firestore.mjs to push corrected data to Firestore.")

if __name__ == "__main__":
    main()
