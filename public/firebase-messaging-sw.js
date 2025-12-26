importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyA5DFVjl5Xd7k_TZIEsNf5ZqXlrqAzANuk",
    authDomain: "proneomanager.firebaseapp.com",
    projectId: "proneomanager",
    storageBucket: "proneomanager.firebasestorage.app",
    messagingSenderId: "1039439049102",
    appId: "1:1039439049102:web:e6b90687fb03cd6aab34df"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-icon.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
