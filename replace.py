import os

replacements = {
    "borhankustia@gmail.com": "onyxsupport36@gmail.com",
    "SHIKOR": "OnyxGoods",
    "shikor_": "onyx_goods_",
    "shikor.com": "onyxgoods.com",
    "logo.png": "logo.jpg"
}

for root, dirs, files in os.walk('public'):
    for file in files:
        if file.endswith('.html') or file.endswith('.js') or file.endswith('.css'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for k, v in replacements.items():
                new_content = new_content.replace(k, v)
                
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")

with open('README.md', 'r', encoding='utf-8') as f:
    content = f.read()
new_content = content
for k, v in replacements.items():
    new_content = new_content.replace(k, v)
with open('README.md', 'w', encoding='utf-8') as f:
    f.write(new_content)

