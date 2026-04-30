import re

with open('index.html', 'r') as f:
    content = f.read()

cards_html = """                <!-- Card 1 -->
                <div class="dest-card fade-in">
                    <div class="dest-img">
                        <img src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Darjeeling, India">
                        <div class="dest-overlay">
                            <a href="#" class="btn btn-outline" style="background-color: rgba(255,255,255,0.86); border-color: rgba(22, 50, 79, 0.16); color: var(--navy);">Explore</a>
                        </div>
                    </div>
                    <div class="dest-info">
                        <div class="dest-header">
                            <div class="dest-title">
                                <h3>Darjeeling</h3>
                                <p><i class="fa-solid fa-location-dot"></i> West Bengal, India</p>
                            </div>
                            <div class="dest-rating">
                                <i class="fa-solid fa-star"></i> 4.9
                            </div>
                        </div>
                        <div class="dest-price">
                            <div><span>From </span>₹8,500</div>
                        </div>
                    </div>
                </div>

                <!-- Card 2 -->
                <div class="dest-card fade-in">
                    <div class="dest-img">
                        <img src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Sikkim, India">
                        <div class="dest-overlay">
                            <a href="#" class="btn btn-outline" style="background-color: rgba(255,255,255,0.86); border-color: rgba(22, 50, 79, 0.16); color: var(--navy);">Explore</a>
                        </div>
                    </div>
                    <div class="dest-info">
                        <div class="dest-header">
                            <div class="dest-title">
                                <h3>Sikkim</h3>
                                <p><i class="fa-solid fa-location-dot"></i> Northeast India</p>
                            </div>
                            <div class="dest-rating">
                                <i class="fa-solid fa-star"></i> 4.8
                            </div>
                        </div>
                        <div class="dest-price">
                            <div><span>From </span>₹10,200</div>
                        </div>
                    </div>
                </div>

                <!-- Card 3 -->
                <div class="dest-card fade-in">
                    <div class="dest-img">
                        <img src="https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Sitong, India">
                        <div class="dest-overlay">
                            <a href="#" class="btn btn-outline" style="background-color: rgba(255,255,255,0.86); border-color: rgba(22, 50, 79, 0.16); color: var(--navy);">Explore</a>
                        </div>
                    </div>
                    <div class="dest-info">
                        <div class="dest-header">
                            <div class="dest-title">
                                <h3>Sitong</h3>
                                <p><i class="fa-solid fa-location-dot"></i> Kurseong Hills, India</p>
                            </div>
                            <div class="dest-rating">
                                <i class="fa-solid fa-star"></i> 4.7
                            </div>
                        </div>
                        <div class="dest-price">
                            <div><span>From </span>₹7,800</div>
                        </div>
                    </div>
                </div>

                <!-- Card 4 -->
                <div class="dest-card fade-in">
                    <div class="dest-img">
                        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Mandarmani, India">
                        <div class="dest-overlay">
                            <a href="#" class="btn btn-outline" style="background-color: rgba(255,255,255,0.86); border-color: rgba(22, 50, 79, 0.16); color: var(--navy);">Explore</a>
                        </div>
                    </div>
                    <div class="dest-info">
                        <div class="dest-header">
                            <div class="dest-title">
                                <h3>Mandarmani</h3>
                                <p><i class="fa-solid fa-location-dot"></i> West Bengal, India</p>
                            </div>
                            <div class="dest-rating">
                                <i class="fa-solid fa-star"></i> 4.5
                            </div>
                        </div>
                        <div class="dest-price">
                            <div><span>From </span>₹5,500</div>
                        </div>
                    </div>
                </div>

                <!-- Card 5 -->
                <div class="dest-card fade-in">
                    <div class="dest-img">
                        <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Dooars, India">
                        <div class="dest-overlay">
                            <a href="#" class="btn btn-outline" style="background-color: rgba(255,255,255,0.86); border-color: rgba(22, 50, 79, 0.16); color: var(--navy);">Explore</a>
                        </div>
                    </div>
                    <div class="dest-info">
                        <div class="dest-header">
                            <div class="dest-title">
                                <h3>Dooars</h3>
                                <p><i class="fa-solid fa-location-dot"></i> West Bengal, India</p>
                            </div>
                            <div class="dest-rating">
                                <i class="fa-solid fa-star"></i> 4.8
                            </div>
                        </div>
                        <div class="dest-price">
                            <div><span>From </span>₹6,900</div>
                        </div>
                    </div>
                </div>"""

# Replace the 6 cards with 5 cards
content = re.sub(r'<!-- Card 1 -->.*<!-- Card 6 -->.*?\n                </div>\n', cards_html + '\n', content, flags=re.DOTALL)

# Replace package prices
content = content.replace('<div class="pkg-price">$599<span>/person</span></div>', '<div class="pkg-price">₹12,999<span>/person</span></div>')
content = content.replace('<div class="pkg-price">$1,299<span>/person</span></div>', '<div class="pkg-price">₹24,999<span>/person</span></div>')
content = content.replace('<div class="pkg-price">$2,499<span>/person</span></div>', '<div class="pkg-price">₹49,999<span>/person</span></div>')

# Update footer links
old_footer_links = """                        <li><a href="#">Paris, France</a></li>
                        <li><a href="#">Bali, Indonesia</a></li>
                        <li><a href="#">Dooars</a></li>
                        <li><a href="#">Santorini, Greece</a></li>
                        <li><a href="#">Sitong</a></li>"""

new_footer_links = """                        <li><a href="#">Darjeeling</a></li>
                        <li><a href="#">Sikkim</a></li>
                        <li><a href="#">Sitong</a></li>
                        <li><a href="#">Mandarmani</a></li>
                        <li><a href="#">Dooars</a></li>"""

content = content.replace(old_footer_links, new_footer_links)

# Update contact info
old_contact_info = """                        <li>
                            <i class="fa-solid fa-location-dot"></i>
                            <span>123 Adventure Way,<br>Suite 400, New York, NY 10001</span>
                        </li>
                        <li>
                            <i class="fa-solid fa-phone"></i>
                            <span>+1 (800) 123-4567</span>
                        </li>
                        <li>
                            <i class="fa-solid fa-envelope"></i>
                            <span>hello@travelogue.com</span>
                        </li>"""

new_contact_info = """                        <li>
                            <i class="fa-solid fa-location-dot"></i>
                            <span>12 Park Street,<br>Kolkata, West Bengal 700016</span>
                        </li>
                        <li>
                            <i class="fa-solid fa-phone"></i>
                            <span>+91 98300 12345</span>
                        </li>
                        <li>
                            <i class="fa-solid fa-envelope"></i>
                            <span>hello@travelogue.in</span>
                        </li>"""

content = content.replace(old_contact_info, new_contact_info)

with open('index.html', 'w') as f:
    f.write(content)

