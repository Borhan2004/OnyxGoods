import re

with open('public/styles.css', 'r') as f:
    content = f.read()

content = re.sub(r'\bnav\s*\{', '#navbar {', content)
content = re.sub(r'\bnav\.scrolled\s*\{', '#navbar.scrolled {', content)

with open('public/styles.css', 'w') as f:
    f.write(content)
