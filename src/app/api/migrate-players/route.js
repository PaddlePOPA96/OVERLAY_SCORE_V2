export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server'
import { doc, setDoc } from 'firebase/firestore'
import { dbFirestore } from '@/services/firebase/firestore'
import fs from 'fs'
import path from 'path'

export async function GET(request) {
  try {
    // 1. Read JSON file
    const filePath = path.join(process.cwd(), 'src/data/fix-player.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)

    // Ensure it has the players array
    if (!data.players || !Array.isArray(data.players)) {
      return NextResponse.json({ error: 'Invalid JSON structure' }, { status: 400 })
    }

    let successCount = 0;
    let failCount = 0;

    // 2. Iterate through clubs
    for (const clubData of data.players) {
      if (!clubData.club) continue;
      
      const clubName = clubData.club;
      // create safe doc ID (e.g. Zenit -> zenit)
      const safeId = clubName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      try {
        const docRef = doc(dbFirestore, 'clubs', safeId);
        await setDoc(docRef, {
          name: clubName,
          players: clubData.players || []
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to migrate ${clubName}:`, err);
        failCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${successCount} clubs successfully. Failed: ${failCount}`,
      totalClubsFound: data.players.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
