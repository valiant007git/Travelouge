import os
import re

def update_fonts(directory):
    count = 0
    font_pattern = re.compile(r'<link[^>]*href=["\']https://fonts\.googleapis\.com/css2\?family=[^"\']*["\'][^>]*>')
    
    new_font_link = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">'
    
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = font_pattern.sub(new_font_link, content)
                
                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
                    print(f"Updated fonts in {filepath}")
                    
    print(f"Total HTML files updated: {count}")

update_fonts('/Users/devadibiswas/Downloads/travelouge website')
