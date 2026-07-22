const fs = require('fs');
const content = fs.readFileSync('src/app/(dashboard)/dashboard/operator/_components/shared/ThirdTitleControls.js', 'utf8');
console.log(content.includes('squadsDataJson.default'));
