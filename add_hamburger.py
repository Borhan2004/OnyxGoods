import os
import glob

html_files = glob.glob('public/*.html')
for file in html_files:
    if 'admin.html' in file:
        continue
    with open(file, 'r') as f:
        content = f.read()
    
    if 'id="mobile-menu-btn"' not in content:
        # Insert hamburger button inside nav-actions
        content = content.replace(
            '<div class="nav-actions">',
            '<div class="nav-actions">\n      <button id="mobile-menu-btn" class="mobile-menu-btn" style="display:none; background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--dark-brown);">☰</button>'
        )
        with open(file, 'w') as f:
            f.write(content)
