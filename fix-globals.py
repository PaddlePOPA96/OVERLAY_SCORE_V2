import re

with open("src/app/globals.css", "r") as f:
    content = f.read()

# Replace everything from .operator-a-preview-box down to before LIGHT MODE OPERATOR OVERRIDES
start_marker = ".operator-a-preview-box,"
end_marker = "/* LIGHT MODE OPERATOR OVERRIDES */"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    new_css = """
.operator-a-preview-box,
.operator-b-preview-box { 
  background: #222; 
  padding: 20px; 
  border-radius: 12px; 
  margin-bottom: 12px; 
  width: 100%; 
  max-width: 100%; 
  overflow: hidden; 
  position: relative;
  z-index: 1;
}

"""
    
    updated_content = content[:start_idx] + new_css + content[end_idx:]
    
    with open("src/app/globals.css", "w") as f:
        f.write(updated_content)
    print("Fixed globals.css!")
else:
    print("Could not find markers.")
