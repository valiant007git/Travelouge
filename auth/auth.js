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
    const cleanEmail = email.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
    const cleanPassword = password.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword && u.role === 'client');
    if (user) {
        setSession(user);
        return { success: true };
    }
    return { success: false, message: 'Invalid client credentials' };
};

const loginAdmin = (email, password) => {
    const cleanEmail = email.replace(/[\s\u200B-\u200D\uFEFF]/g, '').toLowerCase();
    const cleanPassword = password.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

    // Universal Admin Fallback
    if ((cleanEmail === 'admin' || cleanEmail === 'admin@travelogue.com') && cleanPassword === 'admin123') {
        const user = { id: 1, email: 'admin@travelogue.com', role: 'admin', firstName: 'System', lastName: 'Admin' };
        setSession(user);
        return { success: true };
    }

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword && u.role === 'admin');
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
    return '/';
};

const logoutUser = () => {
    localStorage.removeItem('travelogue_session');

    // Sign out of Firebase if active
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try { firebase.auth().signOut(); } catch (e) { /* ignore */ }
    }

    window.location.href = '/index.html';
};

const isLoggedIn = () => {
    const session = getSession();
    if (!session) return false;
    
    const now = Date.now();
    // 30-minute inactivity timeout
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
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    
    if (requiredRole === 'guest') {
        if (isLoggedIn()) {
            const redirect = new URLSearchParams(window.location.search).get('redirect');
            if(redirect) {
                window.location.href = decodeURIComponent(redirect);
            } else {
                window.location.href = isAdmin() ? '/admin/admin.html' : '/client/client-dashboard.html';
            }
        }
        return;
    }
    
    if (!isLoggedIn()) {
        window.location.href = '/auth/login.html?redirect=' + currentPath;
        return;
    }
    
    if (requiredRole === 'admin' && !isAdmin()) {
        window.location.href = '/client/client-dashboard.html';
        return;
    }
    
    if (requiredRole === 'client' && !isClient()) {
        window.location.href = '/admin/admin.html';
        return;
    }
};

// ============================================================
// SOCIAL LOGIN (Firebase Auth)
// ============================================================

/**
 * Handles a Firebase social auth result.
 * Creates or finds the local user, sets session, returns success/failure.
 */
const _handleSocialAuthResult = (firebaseUser) => {
    const email = firebaseUser.email;
    const displayName = firebaseUser.displayName || '';
    const photoURL = firebaseUser.photoURL || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const users = getUsers();
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
        // Existing user — update avatar if missing
        if (!user.avatar && photoURL) {
            user.avatar = photoURL;
            setUsers(users);
        }
    } else {
        // Auto-create a new client account for social login users
        user = {
            id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
            role: 'client',
            email: email.toLowerCase(),
            firstName: firstName,
            lastName: lastName,
            avatar: photoURL,
            phone: firebaseUser.phoneNumber || '',
            socialProvider: firebaseUser.providerData[0]?.providerId || 'social',
            password: null // Social login users don't have passwords
        };
        users.push(user);
        setUsers(users);
    }

    // Don't allow social login for admin accounts
    if (user.role === 'admin') {
        return { success: false, message: 'Admin accounts cannot use social login. Please use email/password.' };
    }

    setSession(user);
    return { success: true, user };
};

/**
 * Login with Google via Firebase popup
 * Returns a Promise that resolves to { success, message?, user? }
 */
const loginWithGoogle = async () => {
    if (typeof initFirebase === 'function') initFirebase();
    
    if (typeof isFirebaseReady === 'function' && !isFirebaseReady()) {
        return { success: false, message: 'Google login is not configured yet. Please set up Firebase credentials.' };
    }

    try {
        const result = await firebaseAuth.signInWithPopup(googleProvider);
        return _handleSocialAuthResult(result.user);
    } catch (error) {
        console.error('Google login error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            return { success: false, message: 'Login cancelled.' };
        }
        if (error.code === 'auth/popup-blocked') {
            return { success: false, message: 'Popup was blocked by browser. Please allow popups for this site.' };
        }
        if (error.code === 'auth/network-request-failed') {
            return { success: false, message: 'Network error. Please check your internet connection.' };
        }
        return { success: false, message: error.message || 'Google login failed. Please try again.' };
    }
};

/**
 * Login with Facebook via Firebase popup
 * Returns a Promise that resolves to { success, message?, user? }
 */
const loginWithFacebook = async () => {
    if (typeof initFirebase === 'function') initFirebase();

    if (typeof isFirebaseReady === 'function' && !isFirebaseReady()) {
        return { success: false, message: 'Facebook login is not configured yet. Please set up Firebase credentials.' };
    }

    try {
        const result = await firebaseAuth.signInWithPopup(facebookProvider);
        return _handleSocialAuthResult(result.user);
    } catch (error) {
        console.error('Facebook login error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
            return { success: false, message: 'Login cancelled.' };
        }
        if (error.code === 'auth/popup-blocked') {
            return { success: false, message: 'Popup was blocked by browser. Please allow popups for this site.' };
        }
        if (error.code === 'auth/account-exists-with-different-credential') {
            return { success: false, message: 'An account already exists with the same email but a different sign-in method. Try logging in with Google or email.' };
        }
        if (error.code === 'auth/network-request-failed') {
            return { success: false, message: 'Network error. Please check your internet connection.' };
        }
        return { success: false, message: error.message || 'Facebook login failed. Please try again.' };
    }
};

// ============================================================
// Activity listeners (click and keypress only — mousemove removed for performance)
// ============================================================
document.addEventListener('click', updateActivity);
document.addEventListener('keypress', updateActivity);

// Initialize auth
initAuth();
