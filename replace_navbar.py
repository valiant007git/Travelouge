import os
import re

HEADER_TEMPLATE = """<header id="header">
    <div class="top-bar" id="top-bar">
        <div class="container top-bar-inner">
            <div class="top-bar-left">
                <span><i class="fa-solid fa-phone"></i> +91-XXXXXXXXXX</span>
                <span><i class="fa-solid fa-envelope"></i> hello@travelogue.com</span>
            </div>
            <div class="top-bar-right">
                <a href="#"><i class="fa-brands fa-whatsapp" style="color:var(--success);"></i> Chat with us</a>
                <span class="divider">|</span>
                <div id="auth-links-top" style="display:inline-flex; gap:15px;">
                    <!-- Injected by utils.js -->
                </div>
            </div>
        </div>
    </div>
    
    <div class="main-navbar">
        <div class="container nav-container">
            <a href="{base}index.html" class="logo"><i class="fa-solid fa-compass"></i> Travelogue</a>
            <nav class="desktop-nav">
                <ul class="nav-links">
                    <li><a href="{base}index.html">Home</a></li>
                    <li><a href="{base}pages/destinations.html">Destinations</a></li>
                    <li><a href="{base}pages/packages.html">Packages</a></li>
                    <li><a href="{base}pages/about.html">About</a></li>
                    <li><a href="{base}pages/blog.html">Blog</a></li>
                    <li><a href="{base}pages/gallery.html">Gallery</a></li>
                    <li><a href="{base}pages/faq.html">FAQ</a></li>
                    <li><a href="{base}pages/contact.html">Contact</a></li>
                </ul>
            </nav>
            <div class="nav-actions">
                <a href="{base}client/inquiry.html" class="btn plan-trip-btn" id="plan-trip-desktop">Plan Trip</a>
                <div class="hamburger" id="hamburger"><i class="fa-solid fa-bars"></i></div>
            </div>
        </div>
    </div>
    
    <!-- Mobile Overlay Menu -->
    <div class="mobile-menu-overlay" id="mobile-menu">
        <button class="close-menu" id="close-menu"><i class="fa-solid fa-times"></i></button>
        <ul class="mobile-nav-links">
            <li><a href="{base}index.html">Home</a></li>
            <li><a href="{base}pages/destinations.html">Destinations</a></li>
            <li><a href="{base}pages/packages.html">Packages</a></li>
            <li><a href="{base}pages/about.html">About</a></li>
            <li><a href="{base}pages/blog.html">Blog</a></li>
            <li><a href="{base}pages/gallery.html">Gallery</a></li>
            <li><a href="{base}pages/faq.html">FAQ</a></li>
            <li><a href="{base}pages/contact.html">Contact</a></li>
        </ul>
        <div class="mobile-auth-actions" id="mobile-auth-actions">
            <!-- Injected by utils.js -->
        </div>
    </div>
</header>"""

def get_base_prefix(file_path):
    parts = file_path.strip('./').split('/')
    depth = len(parts) - 1
    return '../' * depth

def update_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if '<header id="header">' not in content:
        return False

    # Prevent TypeError by adding safe checks
    content = content.replace("authActions.innerHTML =", "if(authActions) authActions.innerHTML =")

    # Replace the header block
    header_pattern = re.compile(r'<header id="header">.*?</header>', re.DOTALL)
    base_prefix = get_base_prefix(file_path)
    new_header = HEADER_TEMPLATE.format(base=base_prefix)
    
    new_content = header_pattern.sub(new_header, content)

    # Highlight active nav link dynamically in the python script by inserting class="active" or style="color:var(--gold);"
    filename = os.path.basename(file_path)
    if filename != 'index.html':
        # e.g., pages/destinations.html or destinations/sikkim.html -> 'destinations.html' is the active link
        # Actually, let's just let CSS handle hover for now, but user said "Active page link should be highlighted in gold".
        # We can do this in utils.js! Let's do it in python for the specific file name if it matches.
        nav_name = filename.replace('.html', '').capitalize()
        # Edge cases
        if 'sikkim' in filename or 'darjeeling' in filename or 'dooars' in filename or 'sittong' in filename:
            nav_name = 'Destinations'
        if 'blog-single' in filename:
            nav_name = 'Blog'
        
        # Add class="active" to the matching link
        pattern = f'(>{nav_name}</a>)'
        new_content = re.sub(pattern, r' class="active"\1', new_content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Updated: {file_path}")
    return True

target_dir = '/Users/devadibiswas/Downloads/travelouge website'
count = 0
for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            # Skip admin and client dashboard which don't have the main header
            if 'admin.html' in filepath or 'client-dashboard.html' in filepath or 'booking.html' in filepath or 'invoice.html' in filepath:
                continue
            if update_file(filepath):
                count += 1

print(f"Total files updated: {count}")
