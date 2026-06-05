import os
import re

svg_pattern = re.compile(r'<svg[^>]*?viewBox="0 0 100 100"[^>]*?>\s*<circle cx="50" cy="50".*?</svg>', re.DOTALL)
replacement = '<img src="logo.jpg" class="nav-logo-img" alt="Logo" style="height: 38px; width: 38px; vertical-align: middle; margin-right: 8px; border-radius: 50%; object-fit: cover;">'

for root, dirs, files in os.walk('public'):
    for file in files:
        if file.endswith('.html'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, count = svg_pattern.subn(replacement, content)
            
            if count > 0:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path} ({count} replacements)")
