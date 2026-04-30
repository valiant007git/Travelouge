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
                if(sec.id === target) sec.classList.add('active');
            });
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        if(typeof logoutUser === 'function') logoutUser();
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
        if(i) {
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
        if(idx !== -1) {
            inqs[idx].status = stat;
            saveData('travelogue_inquiries', inqs);
            showToast('Inquiry status updated');
            closeModals();
            renderInquiries();
            renderOverview();
        }
    });

    window.deleteInquiry = (id) => {
        if(confirm('Delete inquiry?')) {
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
        if(inqs.length === 0) return alert('No data to export');
        
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
        if(r) {
            r.status = r.status === 'published' ? 'hidden' : 'published';
            saveData('travelogue_reviews', revs);
            showToast(`Review ${r.status}`);
            renderReviews();
            renderOverview();
        }
    };

    // ==========================================
    // INITIALIZATION
    // ==========================================
    const initAll = () => {
        renderOverview();
        renderInquiries();
        renderClients();
        renderReviews();
    };

    initAll();
});
