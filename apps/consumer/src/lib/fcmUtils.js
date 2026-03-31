import { getToken } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { messaging, db } from "../firebaseConfig";

export const requestForToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
      if (currentToken) {
        // Save the token to Firestore for this user
        console.log('FCM Token generated successfully.');
        const tokenRef = doc(db, 'fcmTokens', userId);
        await setDoc(tokenRef, { token: currentToken, lastUpdated: new Date() }, { merge: true });
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    } else {
      console.warn('Notification permission denied by user.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving or saving token.', err);
  }
};
