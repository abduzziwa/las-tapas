/**
 * Drops the entire LAS_TAAPS database.
 * Run with: node scripts/cleardb.js
 *
 * Uses MONGODB_URI and MONGODB_DB from .env.local (or falls back to defaults).
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && !process.env[key]) {
      process.env[key] = rest.join('=').trim();
    }
  }
}

loadEnv();

const uri    = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const dbName = process.env.MONGODB_DB  || 'LAS_TAAPS';

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log(`Connected to MongoDB at ${uri}`);

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log(`Database "${dbName}" is already empty.`);
    } else {
      console.log(`Dropping ${collections.length} collection(s) from "${dbName}":`);
      for (const col of collections) {
        await db.collection(col.name).drop();
        console.log(`  ✓ Dropped: ${col.name}`);
      }
      console.log('\nDatabase cleared successfully.');
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
