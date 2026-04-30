/* admin/admin.js */

document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    if (typeof protectPage === 'function') protectPage('admin');

    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : { firstName: 'Admin' };
    document.getElementById('top-admin-name').innerText = `${user.firstName} ${user.lastName || ''}`.trim();

    // Data Loaders
    const loadData = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    // Nav Logic
    const navLinks = document.querySelectorAll('.nav-link[data-target]');
    const pageSections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const target = link.getAttribute('data-target');
            pageSections.forEach(sec => {
                sec.classList.remove('active');
                if (sec.id === target) sec.classList.add('active');
            });
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        if (typeof logoutUser === 'function') logoutUser();
    });

    // Toasts
    window.showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-exclamation-circle"></i>';
        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Modals
    window.closeModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', closeModals));

    // ==========================================
    // OVERVIEW
    // ==========================================
    const renderOverview = () => {
        const users = loadData('travelogue_users').filter(u => u.role === 'client');
        const inquiries = loadData('travelogue_inquiries');
        const reviews = loadData('travelogue_reviews');

        document.getElementById('stat-clients').innerText = users.length;
        document.getElementById('stat-inq').innerText = inquiries.length;
        document.getElementById('stat-inq-pend').innerText = inquiries.filter(i => i.status === 'Pending').length;
        document.getElementById('stat-rev-pend').innerText = reviews.filter(r => r.status === 'hidden').length;

        // Render Recent Inq
        const tbody = document.getElementById('overview-inq-tbody');
        tbody.innerHTML = '';
        inquiries.slice(-5).reverse().forEach(i => {
            const sClass = i.status.replace(' ', '');
            tbody.innerHTML += `<tr><td>${i.refNo}</td><td>${i.clientName}</td><td>${i.destination}</td><td><span class="status-badge status-${sClass}">${i.status}</span></td></tr>`;
        });
    };

    // ==========================================
    // INQUIRIES
    // ==========================================
    let inqPage = 1;
    const inqPerPage = 10;

    const renderInquiries = () => {
        let inquiries = loadData('travelogue_inquiries').reverse();

        // Filters
        const search = document.getElementById('inq-search').value.toLowerCase();
        const statFilter = document.getElementById('inq-filter-status').value;

        if (search) inquiries = inquiries.filter(i => i.refNo.toLowerCase().includes(search) || i.clientName.toLowerCase().includes(search));
        if (statFilter) inquiries = inquiries.filter(i => i.status === statFilter);

        const tbody = document.getElementById('inquiries-tbody');
        tbody.innerHTML = '';

        const start = (inqPage - 1) * inqPerPage;
        const end = start + inqPerPage;
        const paged = inquiries.slice(start, end);

        paged.forEach(i => {
            const sClass = i.status.replace(' ', '');
            tbody.innerHTML += `
                <tr>
                    <td>${i.refNo}</td>
                    <td>${i.clientName}</td>
                    <td>${i.destination}</td>
                    <td>${i.dateFrom}</td>
                    <td>₹${Number(i.budget).toLocaleString()}</td>
                    <td><span class="status-badge status-${sClass}">${i.status}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn view-btn" onclick="viewInquiry(${i.id})"><i class="fa-solid fa-eye"></i></button>
                            <button class="action-btn edit-btn" onclick="editInqStatus(${i.id})"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn delete-btn" onclick="deleteInquiry(${i.id})"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    };

    document.getElementById('inq-search').addEventListener('input', () => { inqPage = 1; renderInquiries(); });
    document.getElementById('inq-filter-status').addEventListener('change', () => { inqPage = 1; renderInquiries(); });

    window.editInqStatus = (id) => {
        const inqs = loadData('travelogue_inquiries');
        const i = inqs.find(x => x.id === id);
        if (i) {
            document.getElementById('edit-inq-id').value = id;
            document.getElementById('edit-inq-status').value = i.status;
            document.getElementById('inq-modal').classList.add('active');
        }
    };

    document.getElementById('inq-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-inq-id').value);
        const stat = document.getElementById('edit-inq-status').value;
        const inqs = loadData('travelogue_inquiries');
        const idx = inqs.findIndex(x => x.id === id);
        if (idx !== -1) {
            inqs[idx].status = stat;
            saveData('travelogue_inquiries', inqs);
            showToast('Inquiry status updated');
            closeModals();
            renderInquiries();
            renderOverview();
        }
    });

    window.deleteInquiry = (id) => {
        if (confirm('Delete inquiry?')) {
            let inqs = loadData('travelogue_inquiries');
            inqs = inqs.filter(i => i.id !== id);
            saveData('travelogue_inquiries', inqs);
            showToast('Inquiry deleted', 'error');
            renderInquiries();
            renderOverview();
        }
    };

    document.getElementById('export-csv').addEventListener('click', () => {
        const inqs = loadData('travelogue_inquiries');
        if (inqs.length === 0) return alert('No data to export');

        const headers = ['RefNo', 'Client', 'Email', 'Destination', 'Type', 'Budget', 'Status', 'Submitted'];
        const rows = inqs.map(i => [i.refNo, i.clientName, i.email, i.destination, i.type, i.budget, i.status, i.submittedOn]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "travelogue_inquiries.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // ==========================================
    // CLIENTS
    // ==========================================
    const renderClients = () => {
        const users = loadData('travelogue_users').filter(u => u.role === 'client');
        const tbody = document.getElementById('clients-tbody');
        tbody.innerHTML = '';
        users.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.firstName} ${u.lastName || ''}</td>
                    <td>${u.email}</td>
                    <td>${u.phone || '-'}</td>
                    <td>${u.country || '-'}</td>
                    <td><span class="status-badge status-Confirmed">Active</span></td>
                    <td><button class="btn-outline btn-sm" onclick="alert('View profile feature coming soon')">View</button></td>
                </tr>
            `;
        });
    };

    // ==========================================
    // REVIEWS
    // ==========================================
    const renderReviews = () => {
        const reviews = loadData('travelogue_reviews');
        const tbody = document.getElementById('reviews-tbody');
        tbody.innerHTML = '';
        reviews.forEach(r => {
            const sClass = r.status === 'published' ? 'published' : 'hidden';
            tbody.innerHTML += `
                <tr>
                    <td>${r.name}</td>
                    <td>${r.rating} / 5</td>
                    <td><div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.text}</div></td>
                    <td><span class="status-badge status-${sClass}">${r.status}</span></td>
                    <td>
                        <button class="btn-outline btn-sm" onclick="toggleReview(${r.id})">${r.status === 'published' ? 'Hide' : 'Approve'}</button>
                    </td>
                </tr>
            `;
        });
    };

    window.toggleReview = (id) => {
        const revs = loadData('travelogue_reviews');
        const r = revs.find(x => x.id === id);
        if (r) {
            r.status = r.status === 'published' ? 'hidden' : 'published';
            saveData('travelogue_reviews', revs);
            showToast(`Review ${r.status}`);
            renderReviews();
            renderOverview();
        }
    };

    // ==========================================
    // WEBSITE CUSTOMISATION & LIVE PREVIEW
    // ==========================================

    // Tab Switching
    const customTabs = document.querySelectorAll('.customisation-tabs .tab-btn');
    const customPanes = document.querySelectorAll('.customisation-content .tab-pane');
    customTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            customTabs.forEach(b => b.classList.remove('active'));
            customPanes.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // Theme Preview Updates
    window.updateThemePreview = () => {
        const form = document.getElementById('form-theme');
        const fd = new FormData(form);
        const preview = document.getElementById('theme-live-preview');
        const heading = preview.querySelector('.preview-heading');
        const text = preview.querySelector('.preview-text');
        const btn = preview.querySelector('.preview-btn');

        preview.style.backgroundColor = fd.get('bgColor');
        heading.style.color = fd.get('primaryColor');
        heading.style.fontFamily = fd.get('headingFont').replace(/['"]/g, '');
        text.style.color = fd.get('textSecondaryColor');
        text.style.fontFamily = fd.get('bodyFont').replace(/['"]/g, '');

        btn.style.backgroundColor = fd.get('accentColor');
        btn.style.color = '#fff';
        btn.style.fontFamily = fd.get('bodyFont').replace(/['"]/g, '');

        let br = fd.get('buttonBorderRadius') + 'px';
        if (fd.get('buttonStyle') === 'Square') br = '0px';
        if (fd.get('buttonStyle') === 'Pill') br = '50px';
        btn.style.borderRadius = br;

        let shadow = 'none';
        if (fd.get('shadowIntensity') === 'Light') shadow = '0 4px 10px rgba(0,0,0,0.1)';
        if (fd.get('shadowIntensity') === 'Medium') shadow = '0 10px 20px rgba(0,0,0,0.15)';
        if (fd.get('shadowIntensity') === 'Strong') shadow = '0 15px 30px rgba(0,0,0,0.3)';
        btn.style.boxShadow = shadow;
        preview.style.boxShadow = shadow;
        preview.style.borderRadius = fd.get('cardBorderRadius') + 'px';
    };

    const updatePreviewIframe = () => {
        const iframe = document.getElementById('preview-iframe');
        if (iframe) iframe.contentWindow.location.reload();
    };

    // Generic Form Load & Save
    const loadForm = (key, formId) => {
        const data = loadData(key);
        if (!data || Object.keys(data).length === 0) return;
        const form = document.getElementById(formId);
        if (!form) return;

        Object.keys(data).forEach(k => {
            const el = form.elements[k];
            if (el) {
                if (el.type === 'checkbox') el.checked = data[k];
                else el.value = data[k];

                // Trigger input for counters/sliders
                if (el.oninput) el.oninput();
            }
        });

        if (formId === 'form-theme') updateThemePreview();
        if (data.bgImage && document.getElementById('hero-bg-preview')) {
            document.getElementById('hero-bg-preview').src = data.bgImage;
            document.getElementById('hero-bg-preview').style.display = 'block';
        }
        if (data.ogImage && document.getElementById('seo-og-preview')) {
            document.getElementById('seo-og-preview').src = data.ogImage;
            document.getElementById('seo-og-preview').style.display = 'block';
        }
    };

    const saveForm = (key, formId) => {
        const form = document.getElementById(formId);
        if (!form) return;
        const fd = new FormData(form);
        const data = {};
        for (let [k, v] of fd.entries()) {
            data[k] = v;
        }
        // Handle checkboxes (unchecked checkboxes are not in FormData)
        Array.from(form.elements).forEach(el => {
            if (el.type === 'checkbox') {
                data[el.name] = el.checked;
            }
        });
        saveData(key, data);
        showToast('Changes saved and applied to website');
        updatePreviewIframe();
    };

    // Setup basic forms
    const basicForms = [
        { id: 'form-general', key: 'travelogue_general' },
        { id: 'form-hero', key: 'travelogue_hero' },
        { id: 'form-seo', key: 'travelogue_seo' },
        { id: 'form-theme', key: 'travelogue_theme' }
    ];

    basicForms.forEach(f => {
        const form = document.getElementById(f.id);
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                saveForm(f.key, f.id);
            });
            // Auto preview inputs
            form.addEventListener('input', () => {
                if (f.id === 'form-theme') updateThemePreview();
            });
        }
    });

    document.getElementById('hero-bg-input')?.addEventListener('input', (e) => {
        const img = document.getElementById('hero-bg-preview');
        if (e.target.value) { img.src = e.target.value; img.style.display = 'block'; }
        else img.style.display = 'none';
    });

    document.getElementById('seo-og-input')?.addEventListener('input', (e) => {
        const img = document.getElementById('seo-og-preview');
        if (e.target.value) { img.src = e.target.value; img.style.display = 'block'; }
        else img.style.display = 'none';
    });

    window.resetForm = (tab) => {
        if (confirm('Are you sure you want to reset this tab to defaults?')) {
            const keyMap = {
                'general': 'travelogue_general', 'navbar': 'travelogue_navbar', 'hero': 'travelogue_hero',
                'destinations': 'travelogue_destinations', 'packages': 'travelogue_packages',
                'reviews': 'travelogue_reviews', 'footer': 'travelogue_footer',
                'seo': 'travelogue_seo', 'theme': 'travelogue_theme'
            };
            localStorage.removeItem(keyMap[tab]);
            const form = document.getElementById('form-' + tab);
            if (form) form.reset();
            showToast('Reset to defaults');
            updatePreviewIframe();
            initCustomisation(); // reload structures
        }
    };

    // Complex Forms (Arrays)
    // Destinations
    const renderDestinationsForm = () => {
        let dests = loadData('travelogue_destinations');
        if (!Array.isArray(dests) || dests.length === 0) {
            // Default 4
            dests = [
                { id: Date.now(), show: true, name: 'Sikkim', region: 'India', image: '', rating: 5, price: '₹12,999', badge: 'Most Popular', link: '#' },
                { id: Date.now() + 1, show: true, name: 'Darjeeling', region: 'India', image: '', rating: 4.5, price: '₹8,999', badge: '', link: '#' },
                { id: Date.now() + 2, show: true, name: 'Sittong', region: 'India', image: '', rating: 4.8, price: '₹5,999', badge: '', link: '#' },
                { id: Date.now() + 3, show: true, name: 'Dooars', region: 'India', image: '', rating: 4.7, price: '₹9,999', badge: '', link: '#' }
            ];
        }
        const container = document.getElementById('destinations-container');
        if (!container) return;
        container.innerHTML = '';
        dests.forEach((d, index) => {
            container.innerHTML += `
                <div class="item-form-box dest-item" data-id="${d.id}">
                    <button type="button" class="remove-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
                    <div class="form-group toggle-group" style="margin-bottom:15px;">
                        <label>Show Card</label>
                        <label class="switch"><input type="checkbox" class="d-show" ${d.show ? 'checked' : ''}><span class="slider round"></span></label>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Destination Name</label><input type="text" class="d-name" value="${d.name || ''}"></div>
                        <div class="form-group"><label>Region</label><input type="text" class="d-region" value="${d.region || ''}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Image URL</label><input type="text" class="d-image" value="${d.image || ''}"></div>
                        <div class="form-group"><label>Star Rating</label><input type="number" step="0.1" min="0" max="5" class="d-rating" value="${d.rating || 5}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Starting Price</label><input type="text" class="d-price" value="${d.price || ''}"></div>
                        <div class="form-group"><label>Badge Text</label><input type="text" class="d-badge" value="${d.badge || ''}"></div>
                    </div>
                    <div class="form-group"><label>Link URL</label><input type="text" class="d-link" value="${d.link || ''}"></div>
                </div>
            `;
        });
    };

    document.getElementById('add-destination-btn')?.addEventListener('click', () => {
        document.getElementById('destinations-container').insertAdjacentHTML('beforeend', `
            <div class="item-form-box dest-item" data-id="${Date.now()}">
                <button type="button" class="remove-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
                <div class="form-group toggle-group" style="margin-bottom:15px;">
                    <label>Show Card</label>
                    <label class="switch"><input type="checkbox" class="d-show" checked><span class="slider round"></span></label>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Destination Name</label><input type="text" class="d-name"></div>
                    <div class="form-group"><label>Region</label><input type="text" class="d-region"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Image URL</label><input type="text" class="d-image"></div>
                    <div class="form-group"><label>Star Rating</label><input type="number" step="0.1" min="0" max="5" class="d-rating" value="5"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Starting Price</label><input type="text" class="d-price"></div>
                    <div class="form-group"><label>Badge Text</label><input type="text" class="d-badge"></div>
                </div>
                <div class="form-group"><label>Link URL</label><input type="text" class="d-link"></div>
            </div>
        `);
    });

    document.getElementById('form-destinations')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const dests = [];
        document.querySelectorAll('.dest-item').forEach(el => {
            dests.push({
                id: el.getAttribute('data-id'),
                show: el.querySelector('.d-show').checked,
                name: el.querySelector('.d-name').value,
                region: el.querySelector('.d-region').value,
                image: el.querySelector('.d-image').value,
                rating: el.querySelector('.d-rating').value,
                price: el.querySelector('.d-price').value,
                badge: el.querySelector('.d-badge').value,
                link: el.querySelector('.d-link').value
            });
        });
        saveData('travelogue_destinations', dests);
        showToast('Destinations saved');
        updatePreviewIframe();
    });

    // Packages
    const renderPackagesForm = () => {
        let pkgs = loadData('travelogue_packages');
        if (!Array.isArray(pkgs) || pkgs.length === 0) {
            pkgs = [
                { id: Date.now(), show: true, name: 'Explorer', price: '₹8,999', per: '/person', duration: '3 Days / 2 Nights', popular: false, buttonText: 'Book Now', link: '#', features: ['Hotel', 'Breakfast'] }
            ];
        }
        const container = document.getElementById('packages-container');
        if (!container) return;
        container.innerHTML = '';
        pkgs.forEach(p => {
            const fHtml = (p.features || []).map(f => `
                <div style="display:flex; gap:10px; margin-bottom:5px;" class="feature-row">
                    <input type="text" value="${f}" style="flex:1;">
                    <button type="button" class="btn btn-outline" style="padding:5px 10px;" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
                </div>
            `).join('');

            container.innerHTML += `
                <div class="item-form-box pkg-item" data-id="${p.id}">
                    <button type="button" class="remove-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
                    <div class="form-group toggle-group" style="margin-bottom:15px;">
                        <label>Show Card</label>
                        <label class="switch"><input type="checkbox" class="p-show" ${p.show ? 'checked' : ''}><span class="slider round"></span></label>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Package Name</label><input type="text" class="p-name" value="${p.name || ''}"></div>
                        <div class="form-group"><label>Duration</label><input type="text" class="p-duration" value="${p.duration || ''}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Price</label><input type="text" class="p-price" value="${p.price || ''}"></div>
                        <div class="form-group"><label>Price Per</label><input type="text" class="p-per" value="${p.per || ''}"></div>
                    </div>
                    <div class="form-group toggle-group" style="margin-bottom:15px; background:rgba(201,151,42,0.1);">
                        <label>Most Popular Badge</label>
                        <label class="switch"><input type="checkbox" class="p-popular" ${p.popular ? 'checked' : ''}><span class="slider round"></span></label>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Button Text</label><input type="text" class="p-btnText" value="${p.buttonText || 'Book Now'}"></div>
                        <div class="form-group"><label>Button Link</label><input type="text" class="p-link" value="${p.link || ''}"></div>
                    </div>
                    <div class="form-group">
                        <label>Features List</label>
                        <div class="features-list">${fHtml}</div>
                        <button type="button" class="btn btn-outline btn-sm add-feature-btn" style="margin-top:10px;"><i class="fa-solid fa-plus"></i> Add Feature</button>
                    </div>
                </div>
            `;
        });
    };

    document.getElementById('packages-container')?.addEventListener('click', (e) => {
        if (e.target.closest('.add-feature-btn')) {
            const list = e.target.closest('.pkg-item').querySelector('.features-list');
            list.insertAdjacentHTML('beforeend', `
                <div style="display:flex; gap:10px; margin-bottom:5px;" class="feature-row">
                    <input type="text" placeholder="New feature" style="flex:1;">
                    <button type="button" class="btn btn-outline" style="padding:5px 10px;" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
                </div>
            `);
        }
    });

    document.getElementById('add-package-btn')?.addEventListener('click', () => {
        // Quick add empty package
        const pkgs = loadData('travelogue_packages');
        if (!Array.isArray(pkgs)) pkgs = [];
        pkgs.push({ id: Date.now(), show: true, name: 'New Package', price: '', per: '/person', duration: '', popular: false, buttonText: 'Book Now', link: '#', features: [] });
        saveData('travelogue_packages', pkgs);
        renderPackagesForm();
    });

    document.getElementById('form-packages')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const pkgs = [];
        document.querySelectorAll('.pkg-item').forEach(el => {
            const features = Array.from(el.querySelectorAll('.feature-row input')).map(inp => inp.value).filter(v => v.trim() !== '');
            pkgs.push({
                id: el.getAttribute('data-id'),
                show: el.querySelector('.p-show').checked,
                name: el.querySelector('.p-name').value,
                duration: el.querySelector('.p-duration').value,
                price: el.querySelector('.p-price').value,
                per: el.querySelector('.p-per').value,
                popular: el.querySelector('.p-popular').checked,
                buttonText: el.querySelector('.p-btnText').value,
                link: el.querySelector('.p-link').value,
                features: features
            });
        });
        saveData('travelogue_packages', pkgs);
        showToast('Packages saved');
        updatePreviewIframe();
    });

    // Custom Reviews (Tab 6)
    const renderCustomReviewsForm = () => {
        let revs = loadData('travelogue_reviews');
        const container = document.getElementById('custom-reviews-container');
        if (!container) return;
        container.innerHTML = '';
        revs.forEach(r => {
            container.innerHTML += `
                <div class="item-form-box rev-item" data-id="${r.id}">
                    <button type="button" class="remove-btn" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
                    <div class="form-row">
                        <div class="form-group"><label>Customer Name</label><input type="text" class="r-name" value="${r.name || ''}"></div>
                        <div class="form-group"><label>Location</label><input type="text" class="r-location" value="${r.location || ''}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Avatar URL</label><input type="text" class="r-avatar" value="${r.avatar || ''}"></div>
                        <div class="form-group">
                            <label>Status</label>
                            <select class="r-status">
                                <option value="published" ${r.status === 'published' ? 'selected' : ''}>Published</option>
                                <option value="hidden" ${r.status !== 'published' ? 'selected' : ''}>Hidden</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" class="r-rating" value="${r.rating || 5}"></div>
                    <div class="form-group"><label>Review Text</label><textarea class="r-text" rows="3">${r.text || ''}</textarea></div>
                </div>
            `;
        });
    };

    document.getElementById('add-review-btn')?.addEventListener('click', () => {
        const revs = loadData('travelogue_reviews');
        revs.push({ id: Date.now(), name: 'New User', location: '', avatar: '', rating: 5, text: '', status: 'published' });
        saveData('travelogue_reviews', revs);
        renderCustomReviewsForm();
    });

    document.getElementById('form-reviews')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = document.getElementById('form-reviews');
        const fd = new FormData(form);
        const secSettings = { showSection: form.elements['showSection'].checked, sectionTitle: fd.get('sectionTitle'), sectionSubtitle: fd.get('sectionSubtitle'), autoSlideSpeed: fd.get('autoSlideSpeed') };
        saveData('travelogue_reviews_settings', secSettings);

        const revs = [];
        document.querySelectorAll('.rev-item').forEach(el => {
            revs.push({
                id: el.getAttribute('data-id'),
                name: el.querySelector('.r-name').value,
                location: el.querySelector('.r-location').value,
                avatar: el.querySelector('.r-avatar').value,
                rating: parseInt(el.querySelector('.r-rating').value) || 5,
                text: el.querySelector('.r-text').value,
                status: el.querySelector('.r-status').value
            });
        });
        saveData('travelogue_reviews', revs);
        showToast('Reviews saved');
        updatePreviewIframe();
        renderReviews(); // update the other reviews tab
    });

    // Nav Links (Tab 2)
    const renderNavLinksForm = () => {
        let nav = loadData('travelogue_navbar');
        let links = nav.links || [
            { show: true, label: 'Home', url: 'index.html' },
            { show: true, label: 'Destinations', url: 'pages/destinations.html' },
            { show: true, label: 'Packages', url: 'pages/packages.html' },
            { show: true, label: 'About', url: 'pages/about.html' },
            { show: true, label: 'Blog', url: 'pages/blog.html' },
            { show: true, label: 'Gallery', url: 'pages/gallery.html' },
            { show: true, label: 'FAQ', url: 'pages/faq.html' },
            { show: true, label: 'Contact', url: 'pages/contact.html' }
        ];
        const container = document.getElementById('nav-links-container');
        if (!container) return;
        container.innerHTML = '';
        links.forEach((l, i) => {
            container.innerHTML += `
                <div class="form-row nav-link-item" style="margin-bottom:10px; align-items:flex-end;">
                    <div class="form-group toggle-group" style="padding:8px; width:60px;">
                        <label class="switch"><input type="checkbox" class="n-show" ${l.show ? 'checked' : ''}><span class="slider round"></span></label>
                    </div>
                    <div class="form-group" style="flex:1;"><label>Label</label><input type="text" class="n-label" value="${l.label}"></div>
                    <div class="form-group" style="flex:2;"><label>URL</label><input type="text" class="n-url" value="${l.url}"></div>
                </div>
            `;
        });
    };

    document.getElementById('form-navbar')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveForm('travelogue_navbar', 'form-navbar');
        const links = [];
        document.querySelectorAll('.nav-link-item').forEach(el => {
            links.push({
                show: el.querySelector('.n-show').checked,
                label: el.querySelector('.n-label').value,
                url: el.querySelector('.n-url').value
            });
        });
        const nav = loadData('travelogue_navbar') || {};
        nav.links = links;
        saveData('travelogue_navbar', nav);
    });

    // Footer Links (Tab 7)
    const renderFooterLinksForm = () => {
        let f = loadData('travelogue_footer');
        let ql = f.quickLinks || [
            { show: true, label: 'Home', url: 'index.html' },
            { show: true, label: 'About', url: 'pages/about.html' },
            { show: true, label: 'Packages', url: 'pages/packages.html' },
            { show: true, label: 'Blog', url: 'pages/blog.html' },
            { show: true, label: 'Terms', url: '#' },
            { show: true, label: 'Privacy', url: '#' }
        ];
        let dl = f.destLinks || [
            { show: true, label: 'Sikkim', url: '#' },
            { show: true, label: 'Darjeeling', url: '#' },
            { show: true, label: 'Sittong', url: '#' },
            { show: true, label: 'Dooars', url: '#' }
        ];

        const qlCont = document.getElementById('footer-quick-links-container');
        if (qlCont) {
            qlCont.innerHTML = ql.map((l, i) => `
                <div class="form-row fql-item" style="margin-bottom:10px; align-items:flex-end;">
                    <div class="form-group toggle-group" style="padding:8px; width:60px;">
                        <label class="switch"><input type="checkbox" class="f-show" ${l.show ? 'checked' : ''}><span class="slider round"></span></label>
                    </div>
                    <div class="form-group" style="flex:1;"><label>Label</label><input type="text" class="f-label" value="${l.label}"></div>
                    <div class="form-group" style="flex:2;"><label>URL</label><input type="text" class="f-url" value="${l.url}"></div>
                </div>
            `).join('');
        }

        const dlCont = document.getElementById('footer-dest-links-container');
        if (dlCont) {
            dlCont.innerHTML = dl.map((l, i) => `
                <div class="form-row fdl-item" style="margin-bottom:10px; align-items:flex-end;">
                    <div class="form-group toggle-group" style="padding:8px; width:60px;">
                        <label class="switch"><input type="checkbox" class="f-show" ${l.show ? 'checked' : ''}><span class="slider round"></span></label>
                    </div>
                    <div class="form-group" style="flex:1;"><label>Label</label><input type="text" class="f-label" value="${l.label}"></div>
                    <div class="form-group" style="flex:2;"><label>URL</label><input type="text" class="f-url" value="${l.url}"></div>
                </div>
            `).join('');
        }
    };

    document.getElementById('form-footer')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveForm('travelogue_footer', 'form-footer');
        const ql = [], dl = [];
        document.querySelectorAll('.fql-item').forEach(el => {
            ql.push({ show: el.querySelector('.f-show').checked, label: el.querySelector('.f-label').value, url: el.querySelector('.f-url').value });
        });
        document.querySelectorAll('.fdl-item').forEach(el => {
            dl.push({ show: el.querySelector('.f-show').checked, label: el.querySelector('.f-label').value, url: el.querySelector('.f-url').value });
        });
        const f = loadData('travelogue_footer') || {};
        f.quickLinks = ql;
        f.destLinks = dl;
        saveData('travelogue_footer', f);
    });

    const initCustomisation = () => {
        basicForms.forEach(f => loadForm(f.key, f.id));
        renderDestinationsForm();
        renderPackagesForm();
        renderCustomReviewsForm();
        renderNavLinksForm();
        renderFooterLinksForm();

        // Load reviews settings specifically
        const revSet = loadData('travelogue_reviews_settings');
        if (revSet && document.getElementById('form-reviews')) {
            const form = document.getElementById('form-reviews');
            if (form.elements['showSection']) form.elements['showSection'].checked = revSet.showSection !== false;
            if (form.elements['sectionTitle']) form.elements['sectionTitle'].value = revSet.sectionTitle || '';
            if (form.elements['sectionSubtitle']) form.elements['sectionSubtitle'].value = revSet.sectionSubtitle || '';
            if (form.elements['autoSlideSpeed']) form.elements['autoSlideSpeed'].value = revSet.autoSlideSpeed || '3s';
        }
    };

    // Live Preview Logic
    const iframe = document.getElementById('preview-iframe');
    const iframeWrapper = document.getElementById('preview-wrapper');
    const pageSelect = document.getElementById('preview-page-select');

    pageSelect?.addEventListener('change', (e) => {
        if (iframe) iframe.src = e.target.value;
    });

    document.querySelectorAll('.device-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const device = btn.getAttribute('data-device');
            iframeWrapper.className = `iframe-wrapper ${device}`;
        });
    });

    document.getElementById('refresh-preview-btn')?.addEventListener('click', updatePreviewIframe);
    document.getElementById('open-new-tab-btn')?.addEventListener('click', () => {
        window.open(new URL(iframe.src, location.origin), '_blank');
    });

    // Export & Import Settings
    const customKeys = [
        'travelogue_general', 'travelogue_navbar', 'travelogue_hero',
        'travelogue_destinations', 'travelogue_packages', 'travelogue_reviews',
        'travelogue_reviews_settings', 'travelogue_footer', 'travelogue_seo', 'travelogue_theme'
    ];

    document.getElementById('export-settings-btn')?.addEventListener('click', () => {
        const allSettings = {};
        customKeys.forEach(k => { allSettings[k] = loadData(k); });

        const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `travelogue_settings_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    document.getElementById('import-settings-btn')?.addEventListener('click', () => {
        document.getElementById('import-settings-file').click();
    });

    document.getElementById('import-settings-file')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const settings = JSON.parse(ev.target.result);
                customKeys.forEach(k => {
                    if (settings[k] !== undefined) saveData(k, settings[k]);
                });
                showToast('Settings imported successfully!');
                initCustomisation();
                updatePreviewIframe();
            } catch (err) {
                showToast('Error importing settings', 'error');
            }
        };
        reader.readAsText(file);
    });

    // ==========================================
    // INITIALIZATION
    // ==========================================
    const initAll = () => {
        renderOverview();
        renderInquiries();
        renderClients();
        renderReviews();
        initCustomisation();
    };

    initAll();
});
