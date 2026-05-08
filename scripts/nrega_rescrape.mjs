/**
 * Re-scrape the 366 job cards that got 0 members in the first pass.
 * Fix: store list page URL and navigate directly back instead of goBack().
 * Also better member filtering.
 */
import { chromium } from "playwright";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";

if (!existsSync("data")) mkdirSync("data");

const PANCHAYAT_CODE = "1304003116";
const FIN_YEAR       = "2024-2025";
const DISTRICT_CODE  = "1304";
const BLOCK_CODE     = "1304021";
const DELAY          = 1000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Job cards that need re-scraping (from first pass)
const missing = JSON.parse(readFileSync("data/nrega_missing.json", "utf8"));

// Existing data to merge into
const raw = JSON.parse(readFileSync("data/nrega_raw.json", "utf8"));

function cleanMembers(members) {
  return (members || []).filter(m => {
    if (!m.name || m.name.length < 2) return false;
    if (/^HP-\d{2}/.test(m.name)) return false;
    if (/^\d+$/.test(m.name)) return false;
    if (/signature|thumb|impression|applicant/i.test(m.name)) return false;
    if (m.age > 100) return false;
    return true;
  });
}

async function extractMembers(page) {
  return page.evaluate(() => {
    const results = [];
    document.querySelectorAll("table tr").forEach(row => {
      const cells = [...row.querySelectorAll("td")].map(td => td.innerText.trim());
      if (cells.length < 3) return;
      const name   = cells[1] || "";
      const gender = (cells[2] || "").toUpperCase();
      const age    = parseInt(cells[3] || "0", 10) || 0;
      if (!name || name.length < 2) return;
      if (/^(name|s\.?no|sno|member|sl\.?\s*no)/i.test(name)) return;
      results.push({
        name,
        gender: gender.startsWith("F") ? "F" : gender.startsWith("M") ? "M" : "?",
        age,
      });
    });
    return results;
  });
}

async function main() {
  console.log(`🚀  Re-scraping ${missing.length} missing job cards…`);

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });
  const page = await ctx.newPage();

  // ── Step 1: Get fresh signed URLs via loginframegp ───────────────────────
  console.log("\n📌  Step 1: Getting fresh signed URLs…");
  await page.goto(
    "https://nregastrep.nic.in/netnrega/loginframegp.aspx?salogin=Y&state_code=13",
    { waitUntil: "networkidle", timeout: 30000 }
  );
  await sleep(2000);

  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlFin", FIN_YEAR);
  await sleep(2500);
  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlDistrict", DISTRICT_CODE);
  await sleep(2500);
  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlBlock", BLOCK_CODE);
  await sleep(2500);
  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlPanchayat", PANCHAYAT_CODE);
  await sleep(1500);

  const [newPg] = await Promise.all([
    ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null),
    page.click("#ctl00_ContentPlaceHolder1_btProceed"),
  ]);
  await sleep(3000);

  const indexPage = newPg || page;
  if (newPg) await newPg.waitForLoadState("networkidle");
  else await page.waitForLoadState("networkidle");
  await sleep(2000);

  // Get JobCardReg link
  const jcrUrl = await indexPage.$eval(
    "a[href*='JobCardReg']", a => a.href
  ).catch(() => null);

  if (!jcrUrl) {
    console.error("   ❌  Could not find JobCardReg URL");
    await browser.close(); return;
  }
  console.log("   JCR URL:", jcrUrl.slice(0, 100));

  // ── Step 2: Load job card list ───────────────────────────────────────────
  console.log("\n📌  Step 2: Loading job card list…");
  await indexPage.goto(jcrUrl, { waitUntil: "networkidle", timeout: 30000 });
  await sleep(2000);

  const listUrl = indexPage.url();
  console.log("   List page URL:", listUrl.slice(0, 100));

  // Build a map of jcNo → fresh href from the current list page
  const freshLinks = await indexPage.evaluate(() => {
    const map = {};
    document.querySelectorAll("table tr").forEach(row => {
      const cells = [...row.querySelectorAll("td")];
      if (cells.length < 3) return;
      const jcCell = cells.find(td =>
        td.querySelector("a") &&
        (/HP[-‑]\d/i.test(td.innerText) || td.querySelector("a[href*='jcr']"))
      );
      if (!jcCell) return;
      const anchor = jcCell.querySelector("a");
      if (anchor && anchor.href) {
        map[anchor.innerText.trim()] = anchor.href;
      }
    });
    return map;
  });
  console.log(`   Mapped ${Object.keys(freshLinks).length} fresh JC links`);

  // ── Step 3: Re-scrape each missing job card ──────────────────────────────
  console.log(`\n📌  Step 3: Fetching ${missing.length} missing families…`);

  const updates = {};  // jcNo → members
  let matched = 0, unmatched = 0;

  for (let i = 0; i < missing.length; i++) {
    const jc = missing[i];
    const jcNoClean = jc.jcNo.replace(/\s*\*\s*$/, "").trim();  // remove trailing *
    const href = freshLinks[jcNoClean] || freshLinks[jc.jcNo];

    process.stdout.write(`   [${String(i+1).padStart(3)}/${missing.length}] ${jcNoClean} — ${jc.headName}…`);

    if (!href) {
      process.stdout.write(" (no fresh link)\n");
      unmatched++;
      continue;
    }

    matched++;
    try {
      await indexPage.goto(href, { waitUntil: "domcontentloaded", timeout: 20000 });
      await sleep(DELAY);

      const raw_members = await extractMembers(indexPage);
      const members = cleanMembers(raw_members);
      process.stdout.write(` ${members.length} members\n`);
      updates[jcNoClean] = members;
    } catch (e) {
      process.stdout.write(` ERROR: ${e.message.slice(0, 40)}\n`);
    }

    // Navigate directly back to list page (no goBack)
    if (i < missing.length - 1 && (i + 1) % 1 === 0) {
      await indexPage.goto(listUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
      await sleep(800);
    }
  }

  console.log(`\n   Matched: ${matched}, Unmatched: ${unmatched}`);

  // ── Step 4: Merge updates into existing raw data ─────────────────────────
  console.log("\n📌  Step 4: Merging with existing data…");

  raw.families.forEach(f => {
    const jcNoClean = f.jcNo.replace(/\s*\*\s*$/, "").trim();
    if (updates[jcNoClean] !== undefined && updates[jcNoClean].length > 0) {
      f.members = updates[jcNoClean];
    }
    // Also clean existing members
    if (f.members && f.members.length > 0) {
      f.members = cleanMembers(f.members);
    }
  });

  writeFileSync("data/nrega_raw.json", JSON.stringify(raw, null, 2));
  console.log("   ✅  Updated data/nrega_raw.json");

  // ── Step 5: Rebuild nrega_families.json ──────────────────────────────────
  const PANCHAYAT_NAME = "DOHAG DEHRIYAN";
  const gcFamilies = raw.families.map((f, idx) => {
    const head = {
      id:      `nrega_${idx}_head`,
      name:    f.headName,
      age:     f.members[0]?.age || 0,
      gender:  "M",
      relType: "head",
      relName: f.relName || "",
      house:   f.jcNo,
      part:    "NREGA",
      linkedTo: null,
      source:  "NREGA",
    };
    const others = (f.members || [])
      .filter(m => m.name !== f.headName)
      .map((m, mi) => ({
        id:      `nrega_${idx}_m${mi+1}`,
        name:    m.name,
        age:     m.age,
        gender:  m.gender === "?" ? "M" : m.gender,
        relType: "member",
        relName: f.headName,
        house:   f.jcNo,
        part:    "NREGA",
        linkedTo: head.id,
        source:  "NREGA",
      }));
    return {
      id:       `nrega_family_${idx}`,
      house:    f.jcNo,
      headId:   head.id,
      headName: f.headName,
      village:  f.village || PANCHAYAT_NAME,
      members:  [head, ...others],
    };
  });

  writeFileSync("data/nrega_families.json", JSON.stringify(gcFamilies, null, 2));
  const totalM = gcFamilies.reduce((s, f) => s + f.members.length, 0);
  const withM = gcFamilies.filter(f => f.members.length > 1).length;
  console.log(`   ✅  data/nrega_families.json — ${gcFamilies.length} families, ${totalM} total members`);
  console.log(`   ✅  Families with members: ${withM}`);

  await browser.close();
  console.log("\n✅  Re-scrape done! Run: node scripts/import_nrega_to_firestore.mjs\n");
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
