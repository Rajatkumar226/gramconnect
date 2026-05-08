/**
 * Force re-import: deletes existing families + voters in Firestore,
 * then re-imports corrected data from data/families.json + data/voters_raw.json.
 *
 * Run: node scripts/reimport_to_firestore.mjs
 */
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, writeBatch, doc,
  getDocs, collection, deleteDoc,
} from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = {
  apiKey: "AIzaSyCCjUxaa007N4MvOYEXjgM5RrvinEhn_Dg",
  authDomain: "gramconnect-5a7e8.firebaseapp.com",
  projectId: "gramconnect-5a7e8",
  storageBucket: "gramconnect-5a7e8.firebasestorage.app",
  messagingSenderId: "1013502575304",
  appId: "1:1013502575304:web:a188508f855c787bc61bfd",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db  = getFirestore(app);

const families = JSON.parse(readFileSync("data/families.json", "utf8"));
const voters   = JSON.parse(readFileSync("data/voters_raw.json", "utf8"));

async function deleteCollection(colName) {
  const snap = await getDocs(collection(db, colName));
  if (snap.empty) { console.log(`  ℹ  ${colName} already empty`); return; }
  const CHUNK = 400;
  const docs  = snap.docs;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = writeBatch(db);
    docs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  console.log(`  🗑  Deleted ${docs.length} docs from ${colName}`);
}

async function batchWrite(items, colName, getId) {
  const CHUNK = 400;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = writeBatch(db);
    items.slice(i, i + CHUNK).forEach((item) => {
      batch.set(doc(db, colName, getId(item)), item);
    });
    await batch.commit();
    console.log(`  ✓ ${colName}: ${Math.min(i + CHUNK, items.length)}/${items.length}`);
  }
}

async function main() {
  console.log("🔥 Force re-importing corrected data to Firestore…\n");

  console.log("Step 1: Clearing old data…");
  await deleteCollection("families");
  await deleteCollection("voters");

  console.log("\nStep 2: Importing corrected families…");
  await batchWrite(families, "families", (f) => f.id);

  console.log("\nStep 3: Importing corrected voters…");
  const votersWithId = voters.map((v, i) => ({ ...v, id: `voter_${i}` }));
  await batchWrite(votersWithId, "voters", (v) => v.id);

  console.log("\n✅ Re-import complete! Gender corrections are now live in Firestore.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
