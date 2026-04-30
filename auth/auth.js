/**
 * auth.js
 * Centralized authentication logic for Travelogue
 */

// Initialize default users if not present
const initAuth = () => {
    if (!localStorage.getItem('travelogue_users')) {
        const defaultUsers = [
            { id: 1, email: 'admin@travelogue.com', password: 'Admin@123', role: 'admin', firstName: 'System', lastName: 'Admin' },
            { id: 2, email: 'client@travelogue.com', password: 'Client@123', role: 'client', firstName: 'Sample', lastName: 'Client', phone: '+1234567890', country: 'US' }
        ];
        localStorage.setItem('travelogue_users', JSON.stringify(defaultUsers));
    }
};

const getUsers = () => JSON.parse(localStorage.getItem('travelogue_users')) || [];
const setUsers = (users) => localStorage.setItem('travelogue_users', JSON.stringify(users));

const getSession = () => JSON.parse(localStorage.getItem('travelogue_session'));
const setSession = (user) => {
    const sessionData = { ...user, lastActive: Date.now() };
    localStorage.setItem('travelogue_session', JSON.stringify(sessionData));
};

const loginClient = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.role === 'client');
    if (user) {
        setSession(user);
        return { success: true };
    }
    return { success: false, message: 'Invalid client credentials' };
};

const loginAdmin = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.role === 'admin');
    if (user) {
        setSession(user);
        return { success: true };
    }
    return { success: false, message: 'Invalid admin credentials' };
};

const signupClient = (formData) => {
    const users = getUsers();
    if (users.find(u => u.email === formData.email)) {
        return { success: false, message: 'Email is already registered.' };
    }
    
    const newUser = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        role: 'client',
        ...formData
    };
    
    users.push(newUser);
    setUsers(users);
    setSession(newUser);
    return { success: true };
};

const getBaseUrl = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    const lastDir = parts[parts.length - 2];
    if (['auth', 'client', 'admin', 'pages', 'destinations'].includes(lastDir)) return '../';
    return './';
};

const logoutUser = () => {
    localStorage.removeItem('travelogue_session');
    window.location.href = getBaseUrl() + 'index.html';
};

const isLoggedIn = () => {
    const session = getSession();
    if (!session) return false;
    
    const now = Date.now();
    if (now - session.lastActive > 1800000) {
        localStorage.removeItem('travelogue_session');
        return false;
    }
    return true;
};

const isAdmin = () => isLoggedIn() && getSession().role === 'admin';
const isClient = () => isLoggedIn() && getSession().role === 'client';
const getCurrentUser = () => isLoggedIn() ? getSession() : null;

const updateActivity = () => {
    const session = getSession();
    if (session) {
        session.lastActive = Date.now();
        localStorage.setItem('travelogue_session', JSON.stringify(session));
    }
};

const protectPage = (requiredRole) => {
    const base = getBaseUrl();
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    
    if (requiredRole === 'guest') {
        if (isLoggedIn()) {
            const redirect = new URLSearchParams(window.location.search).get('redirect');
            if(redirect) {
                window.location.href = decodeURIComponent(redirect);
            } else {
                window.location.href = isAdmin() ? base + 'admin/admin.html' : base + 'client/client-dashboard.html';
            }
        }
        return;
    }
    
    if (!isLoggedIn()) {
        window.location.href = base + 'auth/login.html?redirect=' + currentPath;
        return;
    }
    
    if (requiredRole === 'admin' && !isAdmin()) {
        window.location.href = base + 'client/client-dashboard.html';
        return;
    }
    
    if (requiredRole === 'client' && !isClient()) {
        window.location.href = base + 'admin/admin.html';
        return;
    }
};

// Listeners to update activity
document.addEventListener('click', updateActivity);
document.addEventListener('keypress', updateActivity);
document.addEventListener('mousemove', updateActivity); // Sometimes helpful, but can be heavy. Let's keep click/keypress

// Initialize auth
initAuth();
