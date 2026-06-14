import glob
import re

files = glob.glob('src/features/match-simulation/components/operator/Operator*.js')
files = [f for f in files if f not in ('src/features/match-simulation/components/operator/OperatorRoot.js', 'src/features/match-simulation/components/operator/OperatorRootOld.js')]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already patched
    if 'ThirdTitleOverlay' in content:
        continue

    # Add import
    import_statement = "import ThirdTitleOverlay from '@/app/(dashboard)/dashboard/operator/overlay/_components/ThirdTitleOverlay'\n"
    # Find last import
    last_import_idx = content.rfind("import ")
    if last_import_idx != -1:
        end_of_line = content.find("\n", last_import_idx)
        content = content[:end_of_line+1] + import_statement + content[end_of_line+1:]

    # Replace Card
    # Look for: <Card className='operator-x-preview-box'>
    # <LayoutX ... />
    # </Card>
    
    pattern = re.compile(r"(<Card className='operator-[a-z]+-preview-box'>\s*)(<Layout[a-zA-Z]+\s+data=\{\{ \.\.\.data, showOverlay: true, isPreview: true \}\}\s+displayTime=\{displayTime\}\s+formatTime=\{formatTime\}\s+/>)(\s*</Card>)")
    
    replacement = r"""\1<div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{
              width: '100%', height: '100%',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
              transform: data?.thirdTitle?.isShowing ? 'translateY(-20px)' : 'translateY(0)',
              opacity: data?.thirdTitle?.isShowing ? 0 : 1,
            }}>
              \2
            </div>
            <ThirdTitleOverlay data={data} />
          </div>\3"""
          
    new_content = pattern.sub(replacement, content)
    
    # Also add position:relative to Card if it doesn't have it, actually we wrapped it in a relative div inside the card.
    
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Patched", filepath)
