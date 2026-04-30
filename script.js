document.addEventListener('DOMContentLoaded', () => {

function applyCustomisation() {
    const theme = JSON.parse(localStorage.getItem('travelogue_theme') || '{}');
    if (theme.primaryColor) document.documentElement.style.setProperty('--navy', theme.primaryColor);
    if (theme.accentColor) document.documentElement.style.setProperty('--gold', theme.accentColor);
    if (theme.bgColor) document.documentElement.style.setProperty('--bg-primary', theme.bgColor);
    if (theme.textColor) document.documentElement.style.setProperty('--text-primary', theme.textColor);
    if (theme.cardBg) document.documentElement.style.setProperty('--bg-card', theme.cardBg);
    if (theme.borderColor) document.documentElement.style.setProperty('--border-light', theme.borderColor);

    const general = JSON.parse(localStorage.getItem('travelogue_general') || '{}');
    if (general.whatsappNumber) {
        const waBtn = document.querySelector('.whatsapp-btn');
        if (waBtn) waBtn.href = 'https://wa.me/' + general.whatsappNumber.replace(/\D/g,'');
    }
    if (general.maintenanceMode) {
        const banner = document.createElement('div');
        banner.style.cssText = 'background:#c0392b;color:#fff;text-align:center;padding:10px;font-weight:600;position:fixed;top:0;width:100%;z-index:99999;';
        banner.textContent = 'This website is currently under maintenance. We will be back shortly.';
        document.body.prepend(banner);
    }

    const navbar = JSON.parse(localStorage.getItem('travelogue_navbar') || '{}');
    if (navbar.ctaText) document.querySelectorAll('.desktop-cta, .mobile-cta').forEach(el => el.textContent = navbar.ctaText);
    if (navbar.showTopBar === false) {
        const topBar = document.querySelector('.top-bar');
        if (topBar) topBar.style.display = 'none';
    }

    const hero = JSON.parse(localStorage.getItem('travelogue_hero') || '{}');
    if (hero.headline) { const h1 = document.querySelector('.hero h1'); if (h1) h1.textContent = hero.headline; }
    if (hero.subheading) { const p = document.querySelector('.hero p'); if (p) p.textContent = hero.subheading; }
    if (hero.bgImage) { const heroEl = document.querySelector('.hero'); if (heroEl) heroEl.style.backgroundImage = "url('" + hero.bgImage + "')"; }
    if (hero.showSearchBar === false) { const sb = document.querySelector('.search-bar'); if (sb) sb.style.display = 'none'; }

    const destinations = JSON.parse(localStorage.getItem('travelogue_destinations') || '[]');
    if (destinations.length > 0) {
        const grid = document.querySelector('.dest-grid');
        if (grid) {
            grid.innerHTML = destinations.filter(d => d.show !== false).map(d => `<div class="dest-card fade-in"><div class="dest-img"><img src="${d.image}" alt="${d.name}"><div class="dest-overlay"><a href="${d.link || '#'}" class="btn">Explore</a></div>${d.badge ? '<span class="dest-badge">' + d.badge + '</span>' : ''}</div><div class="dest-info"><div class="dest-header"><div class="dest-title"><h3>${d.name}</h3><p><i class="fa-solid fa-location-dot"></i> ${d.region}</p></div><div class="dest-rating"><i class="fa-solid fa-star"></i> ${d.rating}</div></div><div class="dest-price"><span>From </span>${d.price}</div></div></div>`).join('');
        }
    }

    const packages = JSON.parse(localStorage.getItem('travelogue_packages') || '[]');
    if (packages.length > 0) {
        const grid = document.querySelector('.pricing-grid');
        if (grid) {
            grid.innerHTML = packages.filter(p => p.show !== false).map(p => `<div class="pricing-card ${p.popular ? 'popular' : ''} fade-in">${p.popular ? '<div class="popular-badge">Most Popular</div>' : ''}<h3 class="pkg-name">${p.name}</h3><div class="pkg-price">${p.price}<span>${p.per || '/person'}</span></div><span class="pkg-duration">${p.duration}</span><ul class="pkg-features">${(p.features || []).map(f => '<li><i class="fa-solid fa-check"></i> ' + f + '</li>').join('')}</ul><a href="${p.link || '#'}" class="btn ${p.popular ? '' : 'btn-outline'}">${p.buttonText || 'Book Now'}</a></div>`).join('');
        }
    }

    const reviews = JSON.parse(localStorage.getItem('travelogue_reviews') || '[]');
    const published = reviews.filter(r => r.status === 'published');
    if (published.length > 0) {
        // The user provided '.testi-track' in the prompt but script.js uses '.testimonial-slider'
        const track = document.querySelector('.testi-track') || document.querySelector('.testimonial-slider');
        if (track) {
            track.innerHTML = published.map(r => `<div class="testimonial-slide"><div class="testimonial-card"><img src="${r.avatar}" alt="${r.name}" class="testi-avatar"><div class="testi-rating">${'★'.repeat(r.rating || 5)}</div><p class="testi-text">"${r.text}"</p><h4 class="testi-name">${r.name}</h4><span class="testi-location">${r.location}</span></div></div>`).join('');
        }
    }

    const footer = JSON.parse(localStorage.getItem('travelogue_footer') || '{}');
    if (footer.phone) document.querySelectorAll('.footer-phone').forEach(el => el.textContent = footer.phone);
    if (footer.email) document.querySelectorAll('.footer-email').forEach(el => el.textContent = footer.email);
    if (footer.address) document.querySelectorAll('.footer-address').forEach(el => el.textContent = footer.address);
    if (footer.copyright) { const copy = document.querySelector('.footer-bottom p'); if (copy) copy.textContent = footer.copyright; }

    const seo = JSON.parse(localStorage.getItem('travelogue_seo') || '{}');
    if (seo.title) document.title = seo.title;
    if (seo.description) { let meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = seo.description; }
}
applyCustomisation();

    // 1. Sticky Navbar & Background Change on Scroll
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
    const hasOverlayMenu = Boolean(document.getElementById('mobile-menu'));
    
    if(hamburger && navLinks && !hasOverlayMenu) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when a link is clicked
        const mobileLinks = navLinks.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if(icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 3. Shimmer on logo text
    const logoLink = document.querySelector('.logo');
    if (logoLink) {
        // Wrap 'Travelogue' in a span to apply shimmer text safely
        logoLink.innerHTML = '<i class="fa-solid fa-compass"></i> <span class="shimmer-text">Travelogue</span>';
    }

    // 4. Inject Bouncing Scroll Arrow into Hero
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const arrow = document.createElement('div');
        arrow.className = 'scroll-arrow';
        arrow.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        // Smooth scroll to next section
        arrow.addEventListener('click', () => {
            const nextSection = document.getElementById('destinations');
            if(nextSection) nextSection.scrollIntoView({behavior: 'smooth'});
        });
        heroSection.appendChild(arrow);
    }

    // 4.5 Inject Packages from LocalStorage
    const pricingGrid = document.querySelector('.pricing-grid');
    if (pricingGrid) {
        const localPackagesRaw = localStorage.getItem('travelogue_packages');
        if (localPackagesRaw) {
            const localPackages = JSON.parse(localPackagesRaw);
            if (localPackages.length > 0) {
                pricingGrid.innerHTML = '';
                localPackages.forEach((p) => {
                    const featuresHTML = p.features.split(',').map(f => `<li><i class="fa-solid fa-check"></i> ${f.trim()}</li>`).join('');
                    const isPopular = p.popular ? ' popular' : '';
                    const badgeHTML = p.popular ? '<div class="popular-badge">Most Popular</div>' : '';
                    const btnClass = p.popular ? 'btn' : 'btn btn-outline';
                    
                    pricingGrid.innerHTML += `
                        <div class="pricing-card${isPopular} fade-in">
                            ${badgeHTML}
                            <h3 class="pkg-name">${p.name}</h3>
                            <div class="pkg-price">${p.price.replace('<span>/person</span>', '')}<span>/person</span></div>
                            <span class="pkg-duration">${p.duration}</span>
                            <ul class="pkg-features">${featuresHTML}</ul>
                            <a href="client/inquiry.html" class="${btnClass}">Plan Trip</a>
                        </div>
                    `;
                });
            }
        }
    }

    // 5. Scroll-triggered fade-in animations with staggered delay
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    // Create an intersection observer that tracks elements entering the viewport
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        // Group entries that are intersecting
        let delayIndex = 0;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply staggered delay
                entry.target.style.transitionDelay = (delayIndex * 0.1) + 's';
                // Small timeout to allow transition delay to apply before adding class
                setTimeout(() => {
                    entry.target.classList.add('appear');
                }, 50);
                observer.unobserve(entry.target);
                delayIndex++;
            }
        });
    }, appearOptions);
    
    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // 6. Testimonials Carousel Refactor (JS Driven)
    const testimonialContainer = document.querySelector('.testimonial-container');
    const testimonialSlider = document.querySelector('.testimonial-slider');
    
    if (testimonialContainer && testimonialSlider) {
        // --- INJECT REVIEWS FROM LOCALSTORAGE ---
        const localReviewsRaw = localStorage.getItem('travelogue_reviews');
        if (localReviewsRaw) {
            const localReviews = JSON.parse(localReviewsRaw).filter(r => r.status === 'published');
            if (localReviews.length > 0) {
                testimonialSlider.innerHTML = ''; // clear hardcoded
                localReviews.forEach(r => {
                    const starsHTML = Array(5).fill(0).map((_, i) => 
                        `<i class="fa-solid fa-star${i < r.rating ? '' : ' fa-regular'}"></i>`
                    ).join('');
                    
                    const slideHTML = `
                        <div class="testimonial-slide">
                            <div class="testimonial-card">
                                <img src="${r.avatar}" alt="${r.name}" class="testi-avatar">
                                <div class="testi-rating">${starsHTML}</div>
                                <p class="testi-text">"${r.text}"</p>
                                <h4 class="testi-name">${r.name}</h4>
                                <span class="testi-location">${r.location}</span>
                            </div>
                        </div>
                    `;
                    testimonialSlider.insertAdjacentHTML('beforeend', slideHTML);
                });
            }
        }
        
        const testimonialSlides = document.querySelectorAll('.testimonial-slide');
        if (testimonialSlides.length === 0) return;

        // Disable pure CSS animation and setup initial state
        testimonialSlider.style.animation = 'none';
        testimonialSlider.style.width = `${testimonialSlides.length * 100}%`;
        
        // Ensure slides have correct width percentages based on total slides
        testimonialSlides.forEach(slide => {
            slide.style.width = `${100 / testimonialSlides.length}%`;
            slide.style.flex = `0 0 ${100 / testimonialSlides.length}%`;
        });

        // Inject Controls (Arrows and Dots)
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'testi-controls';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'testi-arrow prev';
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'testi-arrow next';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'testi-dots';
        
        testimonialSlides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `testi-dot ${idx === 0 ? 'active' : ''}`;
            dot.dataset.index = idx;
            dotsContainer.appendChild(dot);
        });

        controlsDiv.appendChild(prevBtn);
        controlsDiv.appendChild(dotsContainer);
        controlsDiv.appendChild(nextBtn);
        testimonialContainer.appendChild(controlsDiv);

        // Logic variables
        let currentSlide = 0;
        const totalSlides = testimonialSlides.length;
        let slideInterval;
        
        // Determine items per view based on window width
        const getItemsPerView = () => {
            if(window.innerWidth >= 1024) return 3;
            if(window.innerWidth >= 768) return 2;
            return 1;
        };

        const updateSlider = () => {
            const itemsPerView = getItemsPerView();
            const maxIndex = totalSlides - itemsPerView;
            if (currentSlide > maxIndex) currentSlide = 0;
            if (currentSlide < 0) currentSlide = maxIndex;

            // Calculate percentage to translate
            const translateX = -(currentSlide * (100 / totalSlides));
            testimonialSlider.style.transform = `translateX(${translateX}%)`;
            
            // Update dots
            const dots = dotsContainer.querySelectorAll('.testi-dot');
            dots.forEach(dot => dot.classList.remove('active'));
            // Since we might have multiple visible, highlight the primary one
            if(dots[currentSlide]) dots[currentSlide].classList.add('active');
        };

        const nextSlide = () => {
            currentSlide++;
            const maxIndex = totalSlides - getItemsPerView();
            if (currentSlide > maxIndex) currentSlide = 0;
            updateSlider();
        };

        const prevSlide = () => {
            currentSlide--;
            if (currentSlide < 0) currentSlide = totalSlides - getItemsPerView();
            updateSlider();
        };

        const startAutoSlide = () => {
            slideInterval = setInterval(nextSlide, 4000);
        };

        const stopAutoSlide = () => {
            clearInterval(slideInterval);
        };

        // Event Listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        dotsContainer.addEventListener('click', (e) => {
            if(e.target.classList.contains('testi-dot')) {
                currentSlide = parseInt(e.target.dataset.index);
                updateSlider();
            }
        });

        testimonialContainer.addEventListener('mouseenter', stopAutoSlide);
        testimonialContainer.addEventListener('mouseleave', startAutoSlide);
        
        // Handle window resize to recalculate slider limits
        window.addEventListener('resize', () => {
            const maxIndex = totalSlides - getItemsPerView();
            if(currentSlide > maxIndex) currentSlide = maxIndex;
            updateSlider();
        });

        // Init
        updateSlider();
        startAutoSlide();
    }

    // 7. Inject Stats Counter Section after Features section
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        const statsSection = document.createElement('section');
        statsSection.className = 'stats';
        statsSection.id = 'stats';
        statsSection.innerHTML = `
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-item fade-in">
                        <h3 class="counter" data-target="5000">0</h3>
                        <p>Happy Travelers</p>
                    </div>
                    <div class="stat-item fade-in">
                        <h3 class="counter" data-target="150">0</h3>
                        <p>Destinations</p>
                    </div>
                    <div class="stat-item fade-in">
                        <h3 class="counter" data-target="24">0</h3>
                        <p>Travel Guides</p>
                    </div>
                    <div class="stat-item fade-in">
                        <h3 class="counter" data-target="10">0</h3>
                        <p>Years Experience</p>
                    </div>
                </div>
            </div>
        `;
        // Insert right after features section
        featuresSection.parentNode.insertBefore(statsSection, featuresSection.nextSibling);

        // Observe elements to trigger count animation
        const counters = document.querySelectorAll('.counter');
        const counterOptions = { threshold: 0.5 };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // ms
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current) + (target > 1000 ? '+' : '');
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target + (target > 1000 ? '+' : '');
                        }
                    };
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, counterOptions);

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
        
        // Ensure new fade-in elements inside stats are observed
        const newFaders = statsSection.querySelectorAll('.fade-in');
        newFaders.forEach(fader => {
            appearOnScroll.observe(fader);
        });
    }

    // 8. Newsletter Subscribe Success Message
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        // Remove existing onsubmit attribute to prevent alert
        newsletterForm.removeAttribute('onsubmit');
        
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Create success message element
            const successDiv = document.createElement('div');
            successDiv.className = 'newsletter-success';
            successDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you for subscribing! Check your inbox for your first dose of travel inspiration.';
            
            // Replace form with success message
            const parent = newsletterForm.parentNode;
            parent.replaceChild(successDiv, newsletterForm);
        });
    }

    // 9. Search Button Toast Notification
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if toast already exists
            let toast = document.querySelector('.toast-notification');
            if (!toast) {
                toast = document.createElement('div');
                toast.className = 'toast-notification';
                toast.innerHTML = '<i class="fa-solid fa-plane-departure" style="color: var(--gold); margin-right: 10px;"></i> Searching for your perfect trip...';
                document.body.appendChild(toast);
            }
            
            // Show toast
            setTimeout(() => toast.classList.add('show'), 10);
            
            // Hide after 3 seconds
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        });
    }

    // 10. Smooth Scrolling & Active Nav Link Highlight
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    // Smooth scroll is handled natively via CSS (html { scroll-behavior: smooth; })
    // If not supported, we could add JS smooth scrolling, but CSS covers most modern browsers.
    
    // Intersection Observer for active nav links
    const navObserverOptions = {
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: "-10% 0px -50% 0px"
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                // Remove active class from all
                navItems.forEach(link => {
                    link.classList.remove('active');
                    // Add active class if href matches section id
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        if(section.getAttribute('id')) {
            navObserver.observe(section);
        }
    });

});
