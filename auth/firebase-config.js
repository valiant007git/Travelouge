/**
 * firebase-config.js
 * Firebase Authentication Configuration for Travelogue
 *
 * ============================================================
 * SETUP INSTRUCTIONS:
 * ============================================================
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (or use an existing one)
 * 3. Go to Project Settings → General → Your Apps → Add Web App
 * 4. Copy the firebaseConfig values and paste them below
 * 5. Go to Authentication → Sign-in method
 *    - Enable "Google" provider
 *    - Enable "Facebook" provider (requires Facebook App ID & Secret)
 * 6. For Facebook Login:
 *    a. Go to https://developers.facebook.com
 *    b. Create an app → Add Facebook Login product
 *    c. Copy App ID & App Secret into Firebase Console
 *    d. Copy the OAuth redirect URI from Firebase into Facebook app settings
 * ============================================================
 */

const firebaseConfig = {
    apiKey: "AIzaSyBnVuybD_59343AKsSKTH55JQlEra2UOyo",
    authDomain: "travelouge-2032a.firebaseapp.com",
    projectId: "travelouge-2032a",
    storageBucket: "travelouge-2032a.firebasestorage.app",
    messagingSenderId: "125133028531",
    appId: "1:125133028531:web:76f935329bd905b49344c6",
    measurementId: "G-8B28JCGHWL"
};

// Initialize Firebase
let firebaseApp = null;
let firebaseAuth = null;
let googleProvider = null;
let facebookProvider = null;

const initFirebase = () => {
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded. Social login will not work.');
        return false;
    }

    // Check if config has been set up
    if (firebaseConfig.apiKey === 'YOUR_FIREBASE_API_KEY') {
        console.warn('Firebase config not set up. Replace placeholder values in auth/firebase-config.js');
        return false;
    }

    try {
        // Initialize only once
        if (!firebaseApp) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
        }
        firebaseAuth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        facebookProvider = new firebase.auth.FacebookAuthProvider();

        // Set persistence to LOCAL (survives browser restart)
        firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
};

const isFirebaseReady = () => {
    return firebaseAuth !== null && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY';
};
