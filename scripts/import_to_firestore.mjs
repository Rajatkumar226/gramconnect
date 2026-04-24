/**
 * One-time import script: loads families.json → Firestore.
 * Run: node scripts/import_to_firestore.mjs
 */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, writeBatch, doc, getDocs, collection } from "firebase/firestore";
import { readFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const firebaseConfig = {
  apiKey: "AIzaSyCCjUxaa007N4MvOYEXjgM5RrvinEhn_Dg",
  authDomain: "gramconnect-5a7e8.firebaseapp.com",
  projectId: "gramconnect-5a7e8",
  storageBucket: "gramconnect-5a7e8.firebasestorage.app",
  messagingSenderId: "1013502575304",
  appId: "1:1013502575304:web:a188508f855c787bc61bfd",
};

const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db   = getFirestore(app);

const families = JSON.parse(readFileSync("data/families.json", "utf8"));
const voters   = JSON.parse(readFileSync("data/voters_raw.json", "utf8"));

// Firestore writeBatch limit = 500 ops
async function batchWrite(items, collectionName, getId) {
  const CHUNK = 400;
  for (let i = 0; i < items.length; i += CHUNK) {
    const chunk = items.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    for (const item of chunk) {
      batch.set(doc(db, collectionName, getId(item)), item);
    }
    await batch.commit();
    console.log(`  ✓ ${collectionName} ${i + chunk.length}/${items.length}`);
  }
}

async function main() {
  console.log("🔥 Importing to Firestore...\n");

  // Check if already imported
  const existing = await getDocs(collection(db, "families"));
  if (!existing.empty) {
    console.log(`ℹ  families collection already has ${existing.size} docs. Skipping.`);
    console.log("   Delete the 'families' collection in Firebase Console to re-import.");
    process.exit(0);
  }

  console.log(`📦 Importing ${families.length} families...`);
  await batchWrite(families, "families", (f) => f.id);

  console.log(`\n📦 Importing ${voters.length} voters...`);
  const votersWithId = voters.map((v, i) => ({ ...v, id: `voter_${i}` }));
  await batchWrite(votersWithId, "voters", (v) => v.id);

  console.log("\n✅ Import complete!");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
