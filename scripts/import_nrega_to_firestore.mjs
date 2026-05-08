/**
 * Import NREGA families into Firestore — merges into existing "families" collection
 * Adds to the existing voter-roll families without deleting them.
 *
 * Run: node scripts/import_nrega_to_firestore.mjs
 */
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, writeBatch, doc, getDocs, collection } from "firebase/firestore";
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

const nregaFamilies = JSON.parse(readFileSync("data/nrega_families.json", "utf8"));

async function batchWrite(items, colName, getId) {
  const CHUNK = 400;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = writeBatch(db);
    items.slice(i, i + CHUNK).forEach(item => {
      batch.set(doc(db, colName, getId(item)), item);
    });
    await batch.commit();
    console.log(`  ✓ ${colName}: ${Math.min(i + CHUNK, items.length)}/${items.length}`);
  }
}

async function main() {
  console.log("🔥 Importing NREGA families to Firestore…\n");
  console.log(`   Families to import: ${nregaFamilies.length}`);

  const totalMembers = nregaFamilies.reduce((s, f) => s + f.members.length, 0);
  console.log(`   Total members: ${totalMembers}\n`);

  console.log("Step 1: Writing NREGA families…");
  await batchWrite(nregaFamilies, "nrega_families", f => f.id);

  console.log("\n✅ NREGA import complete!");
  console.log("   Collection: nrega_families");
  console.log(`   ${nregaFamilies.length} families, ${totalMembers} members\n`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
