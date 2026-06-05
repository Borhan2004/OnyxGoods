with open('public/styles.css', 'r') as f:
    content = f.read()

content = content.replace('.mobile-bottom-#navbar', '.mobile-bottom-nav')

with open('public/styles.css', 'w') as f:
    f.write(content)
