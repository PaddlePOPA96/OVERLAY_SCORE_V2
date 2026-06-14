const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getDatabase(app);

async function check() {
  const r = ref(db, 'match_live/qa7nZJdPb0S33ygRywkqB7TqWHJ3');
  const snap = await get(r);
  console.log("DATA FOR qa7nZ...:", snap.val());
  process.exit(0);
}
check();
