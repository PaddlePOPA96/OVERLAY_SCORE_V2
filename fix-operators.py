import os
import re

dir_path = "src/features/match-simulation/components/operator"
files = ["OperatorA.js", "OperatorB.js", "OperatorC.js", "OperatorD.js", "OperatorE.js", "OperatorPildun.js"]

for file in files:
    filepath = os.path.join(dir_path, file)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Add import
    if "import PreviewWrapper" not in content:
        content = content.replace("import { Card } from '@/components/ui/card'", 
                                  "import { Card } from '@/components/ui/card'\nimport PreviewWrapper from './shared/PreviewWrapper'")

    # 2. Fix the Card content block
    # We will look for <Card className='operator-X-preview-box'...> and replace the inside.
    # Note: Pildun has a different class name
    card_pattern = r"(<Card className='operator-[a-z]-preview-box'[^>]*>)(.*?)(</Card>)"
    if "OperatorPildun" in file:
        card_pattern = r"(<Card className='operator-[a-z]-preview-box[^>]*>)(.*?)(</Card>)"
        
    def replace_card(m):
        start_tag = m.group(1)
        inner = m.group(2)
        end_tag = m.group(3)
        
        # If already wrapped, don't wrap again
        if "<PreviewWrapper>" in inner:
            # Just fix the opacity bug inside
            inner = re.sub(r"opacity:\s*data\?\.thirdTitle\?\.isShowing\s*\?\s*0\s*:\s*1,?", "", inner)
            inner = re.sub(r"translateY\(-20px\)", "translateY(-40px)", inner)
            return start_tag + inner + end_tag
            
        # Fix the opacity bug
        inner = re.sub(r"opacity:\s*data\?\.thirdTitle\?\.isShowing\s*\?\s*0\s*:\s*1,?", "", inner)
        # Also clean up the transition string
        inner = inner.replace("transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',",
                              "transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',")
                              
        # Change translateY(-20px) to -40px to match ScoreboardOverlay
        inner = inner.replace("translateY(-20px)", "translateY(-40px)")
                              
        return f"{start_tag}\n            <PreviewWrapper>{inner}</PreviewWrapper>\n          {end_tag}"
        
    new_content = re.sub(card_pattern, replace_card, content, flags=re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(new_content)
        
    print(f"Fixed {file}")

