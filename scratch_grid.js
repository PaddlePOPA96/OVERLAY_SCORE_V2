const fs = require('fs');

// --- Update StreamUrlManager.jsx ---
let file = 'src/features/match-simulation/components/operator/StreamUrlManager.jsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Import Grid
content = content.replace(
  "Switch, FormControlLabel, Radio, RadioGroup } from '@mui/material';",
  "Switch, FormControlLabel, Grid } from '@mui/material';"
);

// 2. Add title2 state
content = content.replace(
  "const [title, setTitle] = useState('');",
  "const [title, setTitle] = useState('');\n  const [title2, setTitle2] = useState('');"
);

// 3. Add Firebase sync for title2
const title2Sync = `
    const title2Ref = ref(db, 'settings/stream_title_2');
    const unsubTitle2 = onValue(title2Ref, (snapshot) => {
      if (snapshot.exists()) setTitle2(snapshot.val());
      else setTitle2('SELAMAT ULANG TAHUN');
    });
`;
content = content.replace(
  "const unsubTitle = onValue(titleRef, (snapshot) => {",
  title2Sync + "\n    const unsubTitle = onValue(titleRef, (snapshot) => {"
);

// 4. Cleanup unsubTitle2
content = content.replace(
  "unsubTitle();",
  "unsubTitle();\n      unsubTitle2();"
);

// 5. Wrap Kiri and Kanan in Grid
const kiriStart = `<Typography variant="h6" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff' }}>`;
content = content.replace(kiriStart, `<Grid container spacing={3}><Grid item xs={12} md={multiMode ? 6 : 12}>\n        ` + kiriStart);

// Kiri ends after Kiri Presets
const kiriEnd = `</Box>\n        )}\n\n\n        <Typography variant="h6" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff', mt: 2 }}>`;
content = content.replace(kiriEnd, `</Box>\n        )}\n        </Grid>\n\n        {multiMode && (\n        <Grid item xs={12} md={6}>\n        <Typography variant="h6" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff' }}>`);

// Kanan ends before TAMPILAN HALAMAN STREAM
const kananEnd = `</Box>\n        )}\n\n\n        <Box sx={{ p: 2, bgcolor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>`;
content = content.replace(kananEnd, `</Box>\n        )}\n        </Grid>\n        )}\n        </Grid>\n\n        <Box sx={{ p: 2, bgcolor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>`);

// 6. Update TAMPILAN HALAMAN STREAM fields
const titleField = `            <TextField
              size="small"
              variant="outlined"
              label="Judul Stream (Bawah Video)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => set(ref(db, 'settings/stream_title'), title.trim())}
              sx={{ flex: 2, minWidth: '200px', '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
            />`;
const title2Field = `
            {multiMode && (
            <TextField
              size="small"
              variant="outlined"
              label="Judul Kanan"
              value={title2}
              onChange={(e) => setTitle2(e.target.value)}
              onBlur={() => set(ref(db, 'settings/stream_title_2'), title2.trim())}
              sx={{ flex: 2, minWidth: '200px', '& .MuiOutlinedInput-root': { color: isLight ? '#000' : '#fff' }, '& .MuiInputLabel-root': { color: isLight ? '#666' : '#aaa' } }}
            />
            )}`;
content = content.replace(titleField, titleField + title2Field);

fs.writeFileSync(file, content, 'utf-8');

// --- Update src/app/streams/page.jsx ---
let pageFile = 'src/app/streams/page.jsx';
let pageContent = fs.readFileSync(pageFile, 'utf-8');

// 1. Add streamTitle2 state
pageContent = pageContent.replace(
  "const [streamTitle, setStreamTitle] = useState('SELAMAT ULANG TAHUN');",
  "const [streamTitle, setStreamTitle] = useState('SELAMAT ULANG TAHUN');\n    const [streamTitle2, setStreamTitle2] = useState('SELAMAT ULANG TAHUN');"
);

// 2. Firebase Sync
const title2SyncPage = `
        const title2Ref = ref(db, 'settings/stream_title_2');
        const unsubTitle2 = onValue(title2Ref, (snapshot) => {
            if (snapshot.exists()) setStreamTitle2(snapshot.val());
        });
`;
pageContent = pageContent.replace(
  "const unsubTitle = onValue(titleRef, (snapshot) => {",
  title2SyncPage + "\n        const unsubTitle = onValue(titleRef, (snapshot) => {"
);

pageContent = pageContent.replace(
  "unsubTitle();",
  "unsubTitle();\n            unsubTitle2();"
);

// 3. Render
pageContent = pageContent.replace(
  "<h1 className={styles.title}>{streamTitle} (Kanan)</h1>",
  "<h1 className={styles.title}>{streamTitle2}</h1>"
);

fs.writeFileSync(pageFile, pageContent, 'utf-8');

console.log("Refactored to Grid and split titles.");
