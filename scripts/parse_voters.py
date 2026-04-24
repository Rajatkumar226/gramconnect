#!/usr/bin/env python3
"""
Parse Dehrian voter list PDFs → build family tree JSON.
Strategy: split on 'निर्वाचक का नाम :' label to isolate each voter block,
then extract fields from each block.
"""

import fitz, pytesseract, json, re
from PIL import Image
import io

pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"

PDF_FILES = [
    ("/Users/prepladder/gramconnect/2025-EROLLGEN-S08-12-FinalRoll-Revision1-HIN-4-WI.pdf", "4"),
    ("/Users/prepladder/gramconnect/2025-EROLLGEN-S08-12-FinalRoll-Revision1-HIN-5-WI.pdf", "5"),
]

# ── OCR ───────────────────────────────────────────────────────────────────────

def ocr_page(doc, page_num: int) -> str:
    page = doc[page_num]
    mat  = fitz.Matrix(2.5, 2.5)
    pix  = page.get_pixmap(matrix=mat)
    img  = Image.open(io.BytesIO(pix.tobytes("png")))
    text = pytesseract.image_to_string(img, lang="hin+eng", config="--psm 6")
    return text

# ── Parse ─────────────────────────────────────────────────────────────────────

def clean_name(s: str) -> str:
    """Strip OCR noise from a name string."""
    # Remove things that look like field labels leaking in
    s = re.sub(r"(निर्वाचक|गृह|फोटो|आयु|लिंग|संख्या|उपलब्ध).*", "", s)
    s = re.sub(r"[|{}\[\]\\@#$%^*_=<>~`]", " ", s)
    s = re.sub(r"\s+", " ", s).strip(" :/")
    return s

REL_PATTERNS = [
    (r"पति\s+का\s+नाम\s*[:\-]\s*(.+)",   "husband"),
    (r"पिता\s+का\s+नाम\s*[:\-]\s*(.+)",  "father"),
    (r"माता\s+का\s+नाम\s*[:\-]\s*(.+)",  "mother"),
    (r"पत्नी\s+का\s+नाम\s*[:\-]\s*(.+)", "wife"),
]

def parse_voters_from_text(text: str, part: str) -> list:
    """
    Split full page OCR text on the voter name label, then extract each voter.
    """
    # Normalise label variations OCR produces
    text = re.sub(r"निर्वाचक\s+का\s+नाम\s*[:\-]", "VOTER_START", text)

    blocks = text.split("VOTER_START")
    voters = []

    for block in blocks[1:]:   # first chunk is page header
        block = block.strip()
        if not block:
            continue

        v = {"part": part}

        # ── Name: everything up to the first relation keyword ──
        name_part = re.split(r"(?:पति|पिता|माता|पत्नी)\s+का\s+नाम", block)[0]
        v["name"] = clean_name(name_part)
        if not v["name"] or len(v["name"]) < 2:
            continue

        # ── Relationship ──
        for pattern, rel_type in REL_PATTERNS:
            m = re.search(pattern, block)
            if m:
                v["relType"] = rel_type
                rel_raw = m.group(1)
                # Stop at next label
                rel_raw = re.split(r"(?:गृह|फोटो|आयु|लिंग|निर्वाचक)", rel_raw)[0]
                v["relName"] = clean_name(rel_raw)
                break

        # ── House number ──
        m = re.search(r"गृह\s*(?:संख्या|WaT|el|Warr)\s*[:\-]\s*([0-9A-Za-z/\-]+)", block)
        if m:
            v["house"] = m.group(1).strip()

        # ── Age ──
        m = re.search(r"आयु\s*[:\-]\s*(\d+)", block)
        if m:
            v["age"] = int(m.group(1))

        # ── Gender ──
        m = re.search(r"लिंग\s*[:\-]\s*(महिला|पुरुष)", block)
        if m:
            v["gender"] = "F" if "महिला" in m.group(1) else "M"

        # Only keep complete records
        if v.get("name") and v.get("relName") and v.get("house"):
            voters.append(v)

    return voters

# ── Build family tree ─────────────────────────────────────────────────────────

def normalize_house(h: str) -> str:
    """Normalise noisy house numbers for grouping."""
    return re.sub(r"[^0-9A-Za-z\-]", "", h).upper()

def build_families(voters: list) -> list:
    """
    Group by house number. Within each house, link members via
    father / husband relations to establish parent-child / spouse links.
    Returns list of family dicts.
    """
    by_house: dict = {}
    for v in voters:
        key = normalize_house(v.get("house", "X"))
        by_house.setdefault(key, []).append(v)

    families = []
    fid = 1

    for house_key, members in sorted(by_house.items()):
        if len(members) < 1:
            continue

        # Assign stable IDs
        for i, m in enumerate(members):
            m["id"] = f"h{house_key}_m{i}"

        # Build name→id lookup for this house
        name_to_id = {}
        for m in members:
            name_to_id[m["name"]] = m["id"]

        # Link: for each member find their related person in the same house
        for m in members:
            rel_name = m.get("relName", "")
            rel_type = m.get("relType", "")

            # Try exact match first, then partial
            matched_id = name_to_id.get(rel_name)
            if not matched_id:
                for name, mid in name_to_id.items():
                    if rel_name and (rel_name in name or name in rel_name) and mid != m["id"]:
                        matched_id = mid
                        break

            m["linkedTo"] = matched_id  # None if relation is outside this house

        # Find head: oldest male whose father is NOT in this house (root of tree)
        males = [m for m in members if m.get("gender") == "M"]
        root  = None
        for m in sorted(males, key=lambda x: -x.get("age", 0)):
            if not m.get("linkedTo"):   # no parent in this house = root
                root = m
                break
        if not root:
            root = sorted(members, key=lambda x: -x.get("age", 0))[0]

        families.append({
            "id":      f"f{fid}",
            "house":   house_key,
            "headId":  root["id"],
            "headName": root["name"],
            "members": members,
        })
        fid += 1

    return families

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    all_voters = []

    for pdf_path, part in PDF_FILES:
        print(f"\n📄 Processing Part {part}")
        doc    = fitz.open(pdf_path)
        total  = len(doc)
        before = len(all_voters)

        for pn in range(total):
            print(f"   Page {pn+1}/{total}...", end="\r", flush=True)
            try:
                text   = ocr_page(doc, pn)
                voters = parse_voters_from_text(text, part)
                all_voters.extend(voters)
            except Exception as e:
                print(f"\n   ⚠ Page {pn+1}: {e}")

        print(f"\n   ✓ {len(all_voters)-before} voters from Part {part}")

    print(f"\n✅ Total voters: {len(all_voters)}")

    # Save raw
    out_raw = "/Users/prepladder/gramconnect/scripts/voters_raw.json"
    with open(out_raw, "w", encoding="utf-8") as f:
        json.dump(all_voters, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved {out_raw}")

    # Build families
    families = build_families(all_voters)
    print(f"✓ Built {len(families)} families")

    out_fam = "/Users/prepladder/gramconnect/scripts/families.json"
    with open(out_fam, "w", encoding="utf-8") as f:
        json.dump(families, f, ensure_ascii=False, indent=2)
    print(f"✓ Saved {out_fam}")

    # Print 3 sample families
    print("\n── Sample ──")
    for fam in families[:3]:
        print(f"\n🏠 House {fam['house']} | Head: {fam['headName']}")
        for m in fam["members"]:
            rel = f"{m.get('relType','')} of {m.get('relName','')}"
            print(f"  • {m['name']} ({m.get('gender','?')}, {m.get('age','?')}) — {rel}")

if __name__ == "__main__":
    main()
