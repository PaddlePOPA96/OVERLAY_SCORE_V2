import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key) acc[key] = val?.replace(/['"]/g, '');
  return acc;
}, {});

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getDatabase(app);

async function check() {
  const r = ref(db, 'match_live/qa7nZJdPb0S33ygRywkqB7TqWHJ3');
  const snap = await get(r);
  console.log("DATA FOR qa7nZ...:", snap.val());
  process.exit(0);
}
check();
