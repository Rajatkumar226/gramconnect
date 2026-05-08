/**
 * NREGA Job Card Scraper — Dohag Dehriyan Panchayat
 * Panchayat Code: 1304003116 | Block: Surani (1304021) | Kangra | HP
 *
 * Strategy:
 *  1. loginframegp.aspx cascade → select year/district/block/GP → Proceed → get signed IndexFrame URL
 *  2. From IndexFrame, grab Digest-signed JobCardReg and Panchregpeople links
 *  3. Navigate to JobCardReg (panchayat level) — extract job card list
 *  4. Drill into each job card for member names, ages, genders
 *  5. Save data/nrega_raw.json + data/nrega_families.json
 */

import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync } from "fs";

if (!existsSync("data")) mkdirSync("data");

const PANCHAYAT_CODE = "1304003116";
const PANCHAYAT_NAME = "DOHAG DEHRIYAN";
const BLOCK_CODE     = "1304021";
const BLOCK_NAME     = "Surani";
const DISTRICT_CODE  = "1304";
const FIN_YEAR       = "2024-2025";
const DELAY          = 1500;
const MAX_JC         = 500;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitForReport(page, label, maxMs = 120000) {
  const t0 = Date.now();
  let n = 0;
  while (Date.now() - t0 < maxMs) {
    const txt = await page.evaluate(() => (document.body.innerText || "").trim());
    if (!txt.includes("under process") && !txt.includes("SqlException") && txt.length > 200) {
      console.log(`   ✅  [${label}] loaded in ${Math.round((Date.now()-t0)/1000)}s`);
      return true;
    }
    n++;
    const w = Math.min(20000, 5000 * n);
    console.log(`   ⏳  [${label}] under process (${n}) — waiting ${w/1000}s…`);
    await sleep(w);
    await page.reload({ waitUntil: "networkidle" });
    await sleep(2000);
  }
  return false;
}

async function extractJobCards(page) {
  return page.evaluate(() => {
    const cards = [];
    document.querySelectorAll("table tr").forEach(row => {
      const cells = [...row.querySelectorAll("td")];
      if (cells.length < 3) return;
      const texts = cells.map(td => td.innerText.trim());
      const jcCell = cells.find(td =>
        td.querySelector("a") &&
        (/HP[-‑]\d/i.test(td.innerText) || td.querySelector("a[href*='jcr']") || td.querySelector("a[href*='JCR']"))
      );
      if (!jcCell) return;
      const anchor    = jcCell.querySelector("a");
      const jcNo      = anchor?.innerText.trim() || jcCell.innerText.trim();
      const jcHref    = anchor?.href || null;
      const headName  = texts[2] || texts[1] || "?";
      const relName   = texts[3] || "";
      const village   = texts[4] || "";
      const membersCount = parseInt(texts[texts.length - 1] || "0", 10) || 0;
      if (jcNo) cards.push({ jcNo, jcHref, headName, relName, village, membersCount });
    });
    return cards;
  });
}

async function main() {
  console.log("🚀  Launching browser…");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36",
  });
  const page = await ctx.newPage();

  // ── Step 1: Navigate loginframegp → select GP → get signed IndexFrame URL ──
  console.log("\n📌  Step 1: loginframegp cascade select…");
  await page.goto(
    `https://nregastrep.nic.in/netnrega/loginframegp.aspx?salogin=Y&state_code=13`,
    { waitUntil: "networkidle", timeout: 30000 }
  );
  await sleep(2000);

  // Select year
  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlFin", FIN_YEAR);
  await sleep(2500);

  // Select Kangra district
  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlDistrict", DISTRICT_CODE);
  await sleep(2500);

  // Select Surani block
  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlBlock", BLOCK_CODE);
  await sleep(2500);

  // Get the GP list to confirm DOHAG DEHRIYAN is there
  const gpOpts = await page.$$eval("#ctl00_ContentPlaceHolder1_ddlPanchayat option", 
    opts => opts.map(o => ({ val: o.value, text: o.text.trim() }))
  );
  console.log(`   ${gpOpts.length} panchayats in Surani:`);
  gpOpts.slice(0, 5).forEach(o => console.log(`   • ${o.val}  ${o.text}`));

  const dohagOpt = gpOpts.find(o => o.val === PANCHAYAT_CODE);
  if (!dohagOpt) {
    console.error(`   ❌  Panchayat ${PANCHAYAT_CODE} not in dropdown`);
    await browser.close(); return;
  }
  console.log(`   ✅  Found: ${dohagOpt.text} (${dohagOpt.val})`);

  // Select DOHAG DEHRIYAN
  await page.selectOption("#ctl00_ContentPlaceHolder1_ddlPanchayat", PANCHAYAT_CODE);
  await sleep(1500);

  // Click Proceed → opens IndexFrame in a new window or navigates
  const [newPage] = await Promise.all([
    ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null),
    page.click("#ctl00_ContentPlaceHolder1_btProceed"),
  ]);
  
  await sleep(3000);
  
  // Check if a new tab was opened or current page navigated
  let indexPage = newPage || page;
  if (newPage) {
    await newPage.waitForLoadState("networkidle");
  } else {
    await page.waitForLoadState("networkidle");
  }
  await sleep(2000);

  const indexUrl = indexPage.url();
  console.log("   Index URL:", indexUrl.slice(0, 150));
  writeFileSync("/tmp/nrega_index.html", await indexPage.content());

  // ── Step 2: Get signed links from IndexFrame ─────────────────────────────
  console.log("\n📌  Step 2: Extracting signed links…");
  const signedLinks = await indexPage.evaluate(() => {
    const links = {};
    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.href;
      const text = a.innerText.trim();
      if (href.includes("JobCardReg") && !links.jobCardReg)   links.jobCardReg   = href;
      if (href.includes("Panchregpeople") && !links.panchreg) links.panchreg     = href;
      if (href.includes("employment_register_report.aspx") && !links.empReg) links.empReg = href;
      if (href.includes("Register_1B.pdf") && !links.pdfReg) links.pdfReg       = href;
    });
    return links;
  });

  Object.entries(signedLinks).forEach(([k, v]) => 
    console.log(`   • ${k}: ${v.slice(0, 100)}`)
  );

  // ── Step 3: Get job card list ─────────────────────────────────────────────
  console.log("\n📌  Step 3: Loading job card list…");
  
  let jobCards = [];
  
  if (signedLinks.jobCardReg) {
    await indexPage.goto(signedLinks.jobCardReg, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(2000);
    const ok = await waitForReport(indexPage, "JobCardReg", 120000);
    
    if (ok) {
      writeFileSync("/tmp/nrega_jcr_list.html", await indexPage.content());
      jobCards = await extractJobCards(indexPage);
      console.log(`   Found ${jobCards.length} job cards from JobCardReg`);
    }
  }

  // If JobCardReg failed, try Panchregpeople
  if (jobCards.length === 0 && signedLinks.panchreg) {
    console.log("   Trying Panchregpeople…");
    await indexPage.goto(signedLinks.panchreg, { waitUntil: "networkidle", timeout: 30000 });
    await sleep(2000);
    const ok = await waitForReport(indexPage, "Panchregpeople", 120000);
    
    if (ok) {
      writeFileSync("/tmp/nrega_panchreg.html", await indexPage.content());
      jobCards = await extractJobCards(indexPage);
      console.log(`   Found ${jobCards.length} job cards from Panchregpeople`);
      
      // Also look for direct links on this page
      if (jobCards.length === 0) {
        const txt = await indexPage.evaluate(() => document.body.innerText.slice(0, 500));
        console.log("   Page preview:", txt);
      }
    }
  }

  if (jobCards.length === 0) {
    console.log("   ❌  No job cards found in any report");
    const txt = await indexPage.evaluate(() => document.body.innerText.slice(0, 200));
    console.log("   Current page:", txt);
    await browser.close();
    return;
  }

  console.log(`   ✅  ${jobCards.length} job cards found`);
  jobCards.slice(0, 3).forEach(jc => 
    console.log(`   • ${jc.jcNo}: ${jc.headName} (${jc.membersCount} members)`)
  );
  writeFileSync("data/nrega_jcards.json", JSON.stringify(jobCards, null, 2));

  // ── Step 4: Fetch member details for each job card ────────────────────────
  console.log(`\n📌  Step 4: Fetching members (max ${MAX_JC} job cards)…`);
  const families = [];
  const cards = jobCards.slice(0, MAX_JC);

  for (let i = 0; i < cards.length; i++) {
    const jc = cards[i];
    process.stdout.write(`   [${String(i+1).padStart(3)}/${cards.length}] ${jc.jcNo} — ${jc.headName}…`);

    if (!jc.jcHref) {
      process.stdout.write(" (no link)\n");
      families.push({ ...jc, members: [] });
      continue;
    }

    try {
      await indexPage.goto(jc.jcHref, { waitUntil: "domcontentloaded", timeout: 20000 });
      await sleep(DELAY);

      const members = await indexPage.evaluate(() => {
        const results = [];
        document.querySelectorAll("table tr").forEach(row => {
          const cells = [...row.querySelectorAll("td")].map(td => td.innerText.trim());
          if (cells.length < 3) return;
          const name   = cells[1] || "";
          const gender = (cells[2] || "").toUpperCase();
          const age    = parseInt(cells[3] || "0", 10) || 0;
          if (!name || name.length < 2 || /^(name|s\.?no|sno|member|sl\.?\s*no)/i.test(name)) return;
          results.push({
            name,
            gender: gender.startsWith("F") ? "F" : gender.startsWith("M") ? "M" : "?",
            age,
          });
        });
        return results;
      });

      process.stdout.write(` ${members.length} members\n`);
      families.push({ ...jc, members });
    } catch (e) {
      process.stdout.write(` ERROR: ${e.message.slice(0, 40)}\n`);
      families.push({ ...jc, members: [] });
    }

    if (i < cards.length - 1) {
      await indexPage.goBack({ waitUntil: "domcontentloaded", timeout: 10000 }).catch(() => {});
      await sleep(500);
    }
  }

  // ── Step 5: Save results ──────────────────────────────────────────────────
  console.log("\n📌  Step 5: Saving…");
  
  const raw = {
    scraped_at:  new Date().toISOString(),
    source:      "MGNREGA Portal — nregastrep.nic.in",
    panchayat:   PANCHAYAT_NAME,
    panchayatCode: PANCHAYAT_CODE,
    block:       BLOCK_NAME,
    district:    "Kangra",
    state:       "Himachal Pradesh",
    fin_year:    FIN_YEAR,
    total_cards: families.length,
    families,
  };
  writeFileSync("data/nrega_raw.json", JSON.stringify(raw, null, 2));
  console.log(`   ✅  data/nrega_raw.json — ${families.length} families`);

  const gcFamilies = families.map((f, idx) => {
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
  const total = gcFamilies.reduce((s, f) => s + f.members.length, 0);
  console.log(`   ✅  data/nrega_families.json — ${gcFamilies.length} families, ${total} members`);
  console.log(`\n✅  Done! Run: node scripts/import_nrega_to_firestore.mjs\n`);

  await browser.close();
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
