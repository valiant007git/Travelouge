/**
 * assets/js/utils.js
 * Shared utility functions for Travelogue
 */

// Storage helpers
const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || null;
const removeFromStorage = (key) => localStorage.removeItem(key);

// UI helpers
const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-info-circle';
    if(type === 'success') iconClass = 'fa-check-circle';
    if(type === 'error') iconClass = 'fa-exclamation-circle';
    if(type === 'warning') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('active');
};

const closeModal = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
};

const showLoader = () => {
    let loader = document.getElementById('global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'global-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
};

const hideLoader = () => {
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';
};

// Format helpers
const formatCurrency = (amount) => {
    return '₹' + Number(amount).toLocaleString('en-IN');
};

const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
};

const generateID = (prefix) => {
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
};

const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Validation helpers
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(String(phone));
};

const validatePassword = (password) => {
    // min 8 chars, 1 uppercase, 1 number, 1 special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
};

const isEmptyString = (str) => {
    return !str || str.trim().length === 0;
};

// Navigation helpers
const redirectTo = (url) => {
    window.location.href = url;
};

const goBack = () => {
    window.history.back();
};

const getCurrentPage = () => {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
};

// Attach global event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Setup modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Back to top button logic
    const backToTop = document.createElement('button');
    backToTop.id = 'back-to-top';
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', () => {
        if(window.scrollY > 300) backToTop.classList.add('show');
        else backToTop.classList.remove('show');
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // WhatsApp floating button
    const waBtn = document.createElement('a');
    waBtn.href = 'https://wa.me/919876543210';
    waBtn.target = '_blank';
    waBtn.className = 'whatsapp-float';
    waBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i>';
    document.body.appendChild(waBtn);

    // Navbar scroll logic
    const header = document.getElementById('header');
    const topBar = document.getElementById('top-bar');
    const mainNavbar = document.querySelector('.main-navbar');
    
    if (header && mainNavbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                if (topBar) topBar.classList.add('hide');
                mainNavbar.classList.add('scrolled');
            } else {
                if (topBar) topBar.classList.remove('hide');
                mainNavbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu logic
    const hamburger = document.getElementById('hamburger');
    const closeMenu = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && closeMenu && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Automated Auth Logic for Navbar
    if (typeof isLoggedIn === 'function') {
        const base = (() => {
            const scripts = document.getElementsByTagName('script');
            for (let s of scripts) {
                if (s.getAttribute('src') && s.getAttribute('src').includes('utils.js')) {
                    return s.getAttribute('src').replace('assets/js/utils.js', '');
                }
            }
            return '';
        })();

        const topAuth = document.getElementById('auth-links-top');
        const mobileAuth = document.getElementById('mobile-auth-actions');

        if (isLoggedIn()) {
            const dashLink = (typeof isAdmin === 'function' && isAdmin()) ? `${base}admin/admin.html` : `${base}client/client-dashboard.html`;
            const dashText = (typeof isAdmin === 'function' && isAdmin()) ? 'Admin Panel' : 'Dashboard';

            if (topAuth) {
                topAuth.innerHTML = `<a href="${dashLink}">${dashText}</a>`;
            }
            if (mobileAuth) {
                mobileAuth.innerHTML = `
                    <a href="${dashLink}">${dashText}</a>
                    <a href="${base}client/inquiry.html" class="btn plan-trip-btn">Plan Trip</a>
                `;
            }
        } else {
            if (topAuth) {
                topAuth.innerHTML = `
                    <a href="${base}auth/login.html">Login</a>
                    <a href="${base}auth/signup.html">Sign Up</a>
                `;
            }
            if (mobileAuth) {
                mobileAuth.innerHTML = `
                    <a href="${base}auth/login.html">Login</a>
                    <a href="${base}auth/signup.html">Sign Up</a>
                    <a href="${base}client/inquiry.html" class="btn plan-trip-btn">Plan Trip</a>
                `;
            }
        }
    }
});
