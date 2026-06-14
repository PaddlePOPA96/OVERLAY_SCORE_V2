const fs = require('fs');
const path = require('path');

const dir = 'src/app/(dashboard)/dashboard/operator/_components';
const files = ['OperatorA.js', 'OperatorB.js', 'OperatorC.js', 'OperatorD.js', 'OperatorE.js', 'OperatorPildun.js'];

files.forEach(file => {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');

  if (!content.includes('PreviewWrapper')) {
    content = content.replace(
      "import ThirdTitleOverlay",
      "import PreviewWrapper from './shared/PreviewWrapper'\nimport ThirdTitleOverlay"
    );

    // Find the Card preview box
    content = content.replace(
      /(<Card className='operator-[a-z\-]+-preview-box[^>]*>)/,
      "$1\n            <PreviewWrapper>"
    );

    // Find the closing Card tag and insert closing PreviewWrapper BEFORE it
    // But wait, there might be multiple Cards. It's the preview box one.
    // The previous replace replaced the open tag. Let's find the closing tag.
    // Actually, in these files, the preview box is followed by UnifiedOperatorControls.
    content = content.replace(
      /(<\/Card>\s*<UnifiedOperatorControls)/,
      "  </PreviewWrapper>\n          $1"
    );

    fs.writeFileSync(p, content);
    console.log(`Patched ${file}`);
  }
});
