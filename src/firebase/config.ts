import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

const firebaseConfig = {
    apiKey: "AIzaSyA5DFVjl5Xd7k_TZIEsNf5ZqXlrqAzANuk",
    authDomain: "proneomanager.firebaseapp.com",
    projectId: "proneomanager",
    storageBucket: "proneomanager.firebasestorage.app",
    messagingSenderId: "1039439049102",
    appId: "1:1039439049102:web:e6b90687fb03cd6aab34df",
    measurementId: "G-NYMNXF6GL3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Firebase Pro Services
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const remoteConfig = typeof window !== 'undefined' ? getRemoteConfig(app) : null;

if (remoteConfig) {
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hora
    remoteConfig.defaultConfig = {
        "theme_color": "#74b72e",
        "app_title": "PRONEO MOBILE",
        "maintenance_mode": false,
        "campaign_banner_show": false,
        "campaign_banner_text": "¡Feliz Navidad! 🎄 Descubre las nuevas oportunidades.",
        "campaign_banner_color": "#e11d48", // Rojo navidad por defecto
        "campaign_theme": "default"
    };
    fetchAndActivate(remoteConfig).catch(err => console.error("Remote Config Error:", err));
}

export { logEvent, getValue };

// Habilitar persistencia offline
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Persistencia falló: múltiples pestañas abiertas');
        } else if (err.code === 'unimplemented') {
            console.warn('Persistencia no soportada por el navegador');
        }
    });
}

export default app;
