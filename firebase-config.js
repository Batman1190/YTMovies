// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC4e7yS7tHZMD-em10ZLV-dDOKhrs92wE4",
    authDomain: "ramdor-7c0d5.firebaseapp.com",
    projectId: "ramdor-7c0d5",
    storageBucket: "ramdor-7c0d5.firebasestorage.app",
    messagingSenderId: "397343842087",
    appId: "1:397343842087:web:6d07ef1764740676445302",
    measurementId: "G-7X6VDGRGFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Auth for localhost
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
        console.log('Connected to Auth emulator');
    } catch (error) {
        console.error('Failed to connect to Auth emulator:', error);
    }
    auth.useDeviceLanguage();
}

// Configure Google Auth Provider
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
provider.setCustomParameters({
    prompt: 'select_account'
});

// Export the configurations and initialized services
export {
    firebaseConfig,
    app,
    auth,
    provider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
};
