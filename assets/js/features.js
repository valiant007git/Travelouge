/* ============================================================
   features.js — Travelogue Shared Feature Library
   All features are self-contained and use CSS variables from
   global.css. Call init functions at the end of each page.
   ============================================================ */

/* ─── 1. SCROLL-TO-TOP BUTTON ─────────────────────────────── */
(function initScrollToTop() {
  const btn = document.createElement('button');
  btn.id = 'scroll-top-btn';
  btn.setAttribute('aria-label', 'Scroll to top');
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
  const style = document.createElement('style');
  style.textContent = `
    #scroll-top-btn {
      position: fixed; bottom: 30px; right: 30px; z-index: 9999;
      width: 48px; height: 48px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, var(--gold, #C9A227), rgba(201,162,39,0.84));
      color: var(--navy, #16324F);
      box-shadow: 0 8px 24px rgba(201,162,39,0.35);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    #scroll-top-btn.visible { opacity: 1; pointer-events: auto; }
    #scroll-top-btn:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(201,162,39,0.5); }
  `;
  document.head.appendChild(style);
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ─── 2. BREADCRUMB NAV ───────────────────────────────────── */
window.initBreadcrumbs = function(insertBeforeSelector) {
  const parts = location.pathname.split('/').filter(Boolean);
  if (parts.length === 0) return;
  const crumbs = [{ label: 'Home', href: '/' }];
  let cumulativePath = '';
  parts.forEach((part, i) => {
    cumulativePath += '/' + part;
    const label = part.replace(/[-_]/g, ' ').replace(/\.html$/, '')
      .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    crumbs.push({ label, href: i < parts.length - 1 ? cumulativePath : null });
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'breadcrumb');
  nav.style.cssText = 'padding: 12px 20px; background: rgba(245,239,230,0.6); border-bottom: 1px solid rgba(22,50,79,0.08); font-size: 0.85rem;';
  const ol = document.createElement('ol');
  ol.style.cssText = 'list-style:none; display:flex; flex-wrap:wrap; gap:6px; max-width:1200px; margin:0 auto;';

  const schemaItems = crumbs.map((c, i) => ({
    '@type': 'ListItem', position: i + 1,
    name: c.label,
    item: c.href ? location.origin + c.href : location.href
  }));

  crumbs.forEach((c, i) => {
    const li = document.createElement('li');
    li.style.cssText = 'display:flex; align-items:center; gap:6px; color:var(--text-light,#888);';
    if (i > 0) {
      const sep = document.createElement('span');
      sep.textContent = '›'; sep.setAttribute('aria-hidden', 'true');
      li.appendChild(sep);
    }
    if (c.href && i < crumbs.length - 1) {
      const a = document.createElement('a');
      a.href = c.href; a.textContent = c.label;
      a.style.cssText = 'color:var(--navy,#16324F); text-decoration:none; transition:color 0.2s;';
      a.addEventListener('mouseover', () => a.style.color = 'var(--gold,#C9A227)');
      a.addEventListener('mouseout', () => a.style.color = 'var(--navy,#16324F)');
      li.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.textContent = c.label; span.style.color = 'var(--navy,#16324F)'; span.style.fontWeight = '600';
      span.setAttribute('aria-current', 'page');
      li.appendChild(span);
    }
    ol.appendChild(li);
  });

  nav.appendChild(ol);
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: schemaItems });
  document.head.appendChild(script);

  const target = insertBeforeSelector ? document.querySelector(insertBeforeSelector) : null;
  if (target) target.before(nav); else document.body.insertBefore(nav, document.body.firstChild);
};


/* ─── 3. REVIEWS RENDERER ────────────────────────────────── */
window.renderReviews = function(reviewsArray, containerId) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;
  if (!reviewsArray || reviewsArray.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--gold,#C9A227)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px; opacity:0.6;">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <h4 style="color:var(--navy,#16324F); margin-bottom:8px; font-family:'Playfair Display',serif;">Be the first to review!</h4>
        <p style="color:var(--text-light,#888); font-size:0.9rem; margin-bottom:20px;">Share your experience and help other travelers discover this destination.</p>
      </div>`;
    return;
  }
  container.innerHTML = reviewsArray.map(r => {
    const stars = Array(5).fill(0).map((_, i) =>
      `<i class="fa-${i < r.rating ? 'solid' : 'regular'} fa-star" style="color:var(--gold,#C9A227);"></i>`
    ).join('');
    return `
      <div class="review-card" style="background:var(--white,#fff); padding:20px; border-radius:12px; box-shadow:0 4px 16px rgba(22,50,79,0.06); margin-bottom:15px; border:1px solid rgba(22,50,79,0.08); transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--navy,#16324F),var(--gold,#C9A227));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.85rem;flex-shrink:0;">
              ${(r.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong style="color:var(--navy,#16324F); display:block;">${r.name || 'Anonymous'}</strong>
              <small style="color:var(--text-light,#888);">${r.location || ''}</small>
            </div>
          </div>
          <div>${stars}</div>
        </div>
        <p style="color:var(--text-light,#555); font-size:0.9rem; line-height:1.7; font-style:italic;">"${r.text}"</p>
      </div>`;
  }).join('');
};


/* ─── 4. WISHLIST ────────────────────────────────────────── */
(function initWishlist() {
  const STORE_KEY = 'travelogue_wishlist';
  const getWishlist = () => JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  const saveWishlist = (arr) => localStorage.setItem(STORE_KEY, JSON.stringify(arr));

  // Badge in nav
  let badge;
  function updateBadge() {
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'wishlist-badge';
      badge.style.cssText = 'display:none; position:fixed; top:80px; right:30px; z-index:900; background:var(--gold,#C9A227); color:var(--navy,#16324F); border-radius:50%; width:26px; height:26px; font-size:0.75rem; font-weight:700; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(201,162,39,0.4);';
      badge.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span id="wl-count"></span>`;
      document.body.appendChild(badge);
      badge.addEventListener('click', openDrawer);
    }
    const count = getWishlist().length;
    badge.style.display = count > 0 ? 'flex' : 'none';
    const countEl = badge.querySelector('#wl-count');
    if (countEl) countEl.textContent = count > 0 ? count : '';
  }

  // Sidebar Drawer
  const drawerStyle = document.createElement('style');
  drawerStyle.textContent = `
    #wl-drawer { position:fixed; top:0; right:-380px; width:360px; max-width:95vw; height:100vh; background:var(--white,#fff); z-index:9998; box-shadow:-8px 0 40px rgba(22,50,79,0.16); transition:right 0.35s cubic-bezier(.4,0,.2,1); overflow-y:auto; }
    #wl-drawer.open { right:0; }
    #wl-backdrop { position:fixed; inset:0; background:rgba(22,50,79,0.4); z-index:9997; display:none; }
    #wl-backdrop.open { display:block; }
    .wl-item { display:flex; align-items:center; gap:12px; padding:14px 20px; border-bottom:1px solid rgba(22,50,79,0.08); }
    .wl-item img { width:60px; height:60px; object-fit:cover; border-radius:8px; }
    .wl-item-info { flex:1; }
    .wl-item-info strong { display:block; color:var(--navy,#16324F); font-size:0.9rem; }
    .wl-item-info small { color:var(--text-light,#888); font-size:0.8rem; }
    .wl-remove { background:none; border:none; cursor:pointer; color:var(--text-light,#888); padding:4px; border-radius:4px; transition:color 0.2s; }
    .wl-remove:hover { color:red; }
    .wl-heart { background:none; border:none; cursor:pointer; font-size:1.4rem; line-height:1; padding:0; transition:transform 0.2s; }
    .wl-heart:hover { transform:scale(1.2); }
  `;
  document.head.appendChild(drawerStyle);

  const drawer = document.createElement('div');
  drawer.id = 'wl-drawer';
  drawer.innerHTML = `
    <div style="padding:20px 20px 15px; border-bottom:1px solid rgba(22,50,79,0.1); display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; background:var(--white,#fff); z-index:1;">
      <h3 style="color:var(--navy,#16324F); font-family:'Playfair Display',serif; font-size:1.3rem;">❤ My Wishlist</h3>
      <button id="wl-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--navy,#16324F);">×</button>
    </div>
    <div id="wl-list"></div>`;
  const backdrop = document.createElement('div');
  backdrop.id = 'wl-backdrop';
  document.body.appendChild(drawer);
  document.body.appendChild(backdrop);

  function openDrawer() { drawer.classList.add('open'); backdrop.classList.add('open'); renderDrawer(); }
  function closeDrawer() { drawer.classList.remove('open'); backdrop.classList.remove('open'); }
  drawer.querySelector('#wl-close').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  function renderDrawer() {
    const list = getWishlist();
    const el = document.getElementById('wl-list');
    if (list.length === 0) {
      el.innerHTML = `<div style="text-align:center; padding:50px 20px;"><p style="color:var(--text-light,#888);">Your wishlist is empty.<br>Tap ♡ on any card to save it.</p></div>`;
      return;
    }
    el.innerHTML = list.map(item => `
      <div class="wl-item">
        <img src="${item.img || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=120'}" alt="${item.name}">
        <div class="wl-item-info"><strong>${item.name}</strong><small>${item.type || 'Destination'}</small></div>
        <button class="wl-remove" data-id="${item.id}" title="Remove from wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>`).join('');
    el.querySelectorAll('.wl-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const updated = getWishlist().filter(i => i.id !== id);
        saveWishlist(updated);
        renderDrawer(); updateBadge();
        syncHeartButtons();
      });
    });
  }

  function syncHeartButtons() {
    const list = getWishlist();
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const saved = list.some(i => i.id === btn.dataset.wishlistId);
      btn.innerHTML = saved
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="var(--gold,#C9A227)" stroke="var(--gold,#C9A227)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    });
  }

  // Public API to add heart buttons
  window.addWishlistButton = function(container, item) {
    // item = { id, name, img, type }
    const btn = document.createElement('button');
    btn.className = 'wl-heart';
    btn.dataset.wishlistId = item.id;
    btn.title = 'Save to Wishlist';
    btn.style.cssText = 'position:absolute; top:12px; left:12px; z-index:10; width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.85); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px);';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let list = getWishlist();
      const idx = list.findIndex(i => i.id === item.id);
      if (idx === -1) list.push(item); else list.splice(idx, 1);
      saveWishlist(list); updateBadge(); syncHeartButtons();
    });
    if (container) container.appendChild(btn);
    syncHeartButtons();
    return btn;
  };

  updateBadge();
})();


/* ─── 5. BOOKING STATUS TRACKER ─────────────────────────── */
window.initBookingTracker = function(containerId, currentStage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const stages = [
    { label: 'Inquiry Received', desc: 'Your inquiry has been submitted and is in our system.', icon: '📋' },
    { label: 'Expert Review', desc: 'Our travel expert is reviewing your requirements.', icon: '🔍' },
    { label: 'Itinerary Sent', desc: 'A custom itinerary has been crafted and sent to you.', icon: '📨' },
    { label: 'Payment Confirmed', desc: 'Payment received. Your booking is locked in!', icon: '✅' },
    { label: 'Trip Completed', desc: 'We hope you had an amazing journey!', icon: '🌟' },
  ];
  const style = document.createElement('style');
  style.textContent = `
    .trk-wrap { display:flex; align-items:flex-start; justify-content:space-between; gap:0; position:relative; padding:20px 0; }
    .trk-wrap::before { content:''; position:absolute; top:28px; left:calc(10% + 14px); right:calc(10% + 14px); height:2px; background:var(--border,rgba(22,50,79,0.12)); z-index:0; }
    .trk-step { display:flex; flex-direction:column; align-items:center; flex:1; position:relative; z-index:1; text-align:center; }
    .trk-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.9rem; border:2px solid var(--border,#ddd); background:var(--white,#fff); transition:all 0.3s; }
    .trk-dot.done { background:var(--gold,#C9A227); border-color:var(--gold,#C9A227); color:var(--navy,#16324F); }
    .trk-dot.current { border-color:var(--gold,#C9A227); position:relative; }
    .trk-dot.current::after { content:''; position:absolute; inset:-5px; border-radius:50%; border:2px solid var(--gold,#C9A227); animation:trk-pulse 1.4s ease-in-out infinite; }
    @keyframes trk-pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.3; transform:scale(1.4); } }
    .trk-label { margin-top:10px; font-size:0.78rem; font-weight:600; color:var(--navy,#16324F); max-width:80px; }
    .trk-label.muted { color:var(--text-light,#888); }
    .trk-desc { font-size:0.72rem; color:var(--text-light,#888); max-width:90px; margin-top:4px; display:none; }
    @media (max-width:600px) {
      .trk-wrap { flex-direction:column; gap:16px; padding:0; }
      .trk-wrap::before { top:calc(10% + 14px); bottom:calc(10% + 14px); left:14px; right:auto; width:2px; height:auto; }
      .trk-step { flex-direction:row; align-items:flex-start; gap:16px; text-align:left; }
      .trk-label, .trk-desc { max-width:none; }
      .trk-desc { display:block; }
    }
  `;
  document.head.appendChild(style);
  container.innerHTML = `<div class="trk-wrap">${stages.map((s, i) => {
    const cls = i < currentStage ? 'done' : i === currentStage ? 'current' : '';
    const lblCls = i > currentStage ? 'muted' : '';
    return `<div class="trk-step">
      <div class="trk-dot ${cls}">${i < currentStage ? '✓' : s.icon}</div>
      <div class="trk-label ${lblCls}">${s.label}</div>
      <div class="trk-desc">${s.desc}</div>
    </div>`;
  }).join('')}</div>`;
};


/* ─── 6. REFERENCE NUMBER GENERATOR ─────────────────────── */
window.generateRefNo = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'TRV-';
  for (let i = 0; i < 6; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
  return ref;
};


/* ─── 7. INITIALS SVG AVATAR ─────────────────────────────── */
window.generateInitialsAvatar = function(name, size = 40) {
  const parts = (name || 'User').trim().split(' ');
  const initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  const colors = ['#16324F','#1A4A6E','#2C5F8A','#8B5E3C','#6B3D14'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${bg}"/><text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Inter,sans-serif" font-size="${size*0.4}" font-weight="700">${initials}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};
