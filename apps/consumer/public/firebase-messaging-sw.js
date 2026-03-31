importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAh07w_6mnUho-FI_KxF6EdZYk_jBuvbKY",
  authDomain: "urbanghar-8dfb3.firebaseapp.com",
  projectId: "urbanghar-8dfb3",
  storageBucket: "urbanghar-8dfb3.firebasestorage.app",
  messagingSenderId: "123060483664",
  appId: "1:123060483664:web:80ddca983ad51ef3ee8355",
  measurementId: "G-SH5PY3DWLL"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('fetch', function(event) {
  // Pass-through to fulfill PWA installable requirements
});
